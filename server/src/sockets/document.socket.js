import Document from "../models/Document.js"
import { canViewDocument, canEditDocument } from "../services/permission.service.js"
import handleCursorMove from "./cursor.manager.js"
import { addUsers, getUsers, removeUserFromAllDocuments } from "./presence.manager.js"
import logger from "../config/logger.js"

export async function registerDocumentHandler(io, socket) {
    
    socket.on("JOIN_DOCUMENT", async ({documentId}) => {
        try {
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
            const affectedDocs = removeUserFromAllDocuments(socket.id)
            
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



    socket.on("DOCUMENT_UPDATE", async ({ documentId, content }) => {

        try {
            const document = await Document.findById(documentId)

            if(!document){
                return socket.emit("ERROR", { message: "Invalid Document Id" })
            }

            await canEditDocument(socket.user.id, document)

            document.content = content
            document.version += 1

            await document.save()
            
            socket.broadcast.to(documentId).emit("DOCUMENT_UPDATED", 
                {
                    content: document.content, 
                    version: document.version
                }
            )

            socket.emit("VERSION_ACK", { version: document.version })
        } catch(err){
            return socket.emit("ERROR", { message: err.message })
        }

    })


    socket.on("CURSOR_MOVE", (data) => {
        handleCursorMove(data, io, socket)
    })


    socket.on("disconnect", async () => {
        const affectedDocs = removeUserFromAllDocuments(socket.id)

        for (const documentId of affectedDocs) {
            io.to(documentId).emit("PRESENCE_UPDATE", { 
                users: await getUsers(documentId) 
            })
        }

        logger.info(`Socket disconnected: ${socket.id}`)
    })
}
