import Document from "../models/Document.js"
import { canViewDocument, canEditDocument } from "../services/permission.service.js"
import handleCursorMove from "./cursor.manager.js"
import { addUsers, getUsers, refreshPresence, removeUserFromAllDocuments } from "./presence.manager.js"
import logger from "../config/logger.js"
import {
    docUpdateLimiter,
    cursorMoveLimiter,
    joinDocumentLimiter,
    checkSocketLimit
} from "../config/rateLimiter.js"

export async function registerDocumentHandler(io, socket) {
    
    socket.on("JOIN_DOCUMENT", async ({documentId}) => {
        try {
            if (!await checkSocketLimit(joinDocumentLimiter, socket, "JOIN_DOCUMENT")) return

            const document = await Document.findById(documentId)

            if (!document) {
                return socket.emit("ERROR", { message: "Invalid Document Id" })
            }

            await canViewDocument(socket.user.id, document)
            await socket.join(documentId)
            await addUsers(documentId, socket)

            io.to(documentId).emit("PRESENCE_UPDATE", { users: await getUsers(documentId) })

            logger.info(`Socket ${socket.id} joined document ${documentId}`)
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })


    socket.on("LEAVE_DOCUMENT", async ({documentId}) => {
        try {
            await socket.leave(documentId)
            const affectedDocs = await removeUserFromAllDocuments(socket.id)
            
            if (affectedDocs.includes(documentId)) {
                io.to(documentId).emit("PRESENCE_UPDATE", { 
                    users: await getUsers(documentId) 
                })
            }
            
            logger.info(`Socket ${socket.id} left document ${documentId}`)
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })



    // TODO: Migrate to a CRDT model (Yjs) for conflict-free real-time merging.
    // The optimistic version guard below prevents silent data loss, but because
    // `content` is a whole-document overwrite, any concurrent edit becomes a
    // conflict the client must resolve. Yjs would let edits merge automatically.
    socket.on("DOCUMENT_UPDATE", async ({ documentId, content, baseVersion }) => {

        try {
            if (!await checkSocketLimit(docUpdateLimiter, socket, "DOCUMENT_UPDATE")) return

            const document = await Document.findById(documentId)

            if(!document){
                return socket.emit("ERROR", { message: "Invalid Document Id" })
            }

            await canEditDocument(socket.user.id, document)

            // Atomic guarded write: the update only lands if the document is still
            // at the version the client edited on top of. Matching the version and
            // incrementing it is a single operation, so two updates on the same
            // base version cannot both succeed.
            const updated = await Document.findOneAndUpdate(
                { _id: documentId, version: baseVersion },
                { content, $inc: { version: 1 } },
                { new: true }
            )

            if (!updated) {
                // The guarded write didn't match. We already confirmed the document
                // exists above, so this is a version conflict — someone else wrote
                // first. Send the server's current state so the client can merge or
                // refetch, then resend with the new baseVersion.
                return socket.emit("VERSION_CONFLICT", {
                    currentVersion: document.version,
                    content: document.content
                })
            }

            socket.broadcast.to(documentId).emit("DOCUMENT_UPDATED",
                {
                    content: updated.content,
                    version: updated.version
                }
            )

            socket.emit("VERSION_ACK", { version: updated.version })

            // Keep this editor's presence alive while they're actively editing.
            await refreshPresence(documentId)
        } catch(err){
            return socket.emit("ERROR", { message: err.message })
        }

    })


    socket.on("CURSOR_MOVE", async (data) => {
        if (!await checkSocketLimit(cursorMoveLimiter, socket, "CURSOR_MOVE")) return
        handleCursorMove(data, io, socket)

        // Cursor activity is the most reliable "still here" signal — refresh TTL.
        await refreshPresence(data.documentId)
    })


    socket.on("disconnect", async () => {
        const affectedDocs = await removeUserFromAllDocuments(socket.id)

        for (const documentId of affectedDocs) {
            io.to(documentId).emit("PRESENCE_UPDATE", { 
                users: await getUsers(documentId) 
            })
        }

        logger.info(`Socket disconnected: ${socket.id}`)
    })
}
