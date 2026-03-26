import Document from "../models/Document.js"
import { canViewDocument, canEditDocument } from "../services/permission.service.js"
import handleCursorMove from "./cursor.manager.js"
import { addUsers, getUsers, removeUserFromAllDocuments } from "./presence.manager.js"

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

            console.log(`Socket ${socket.id} joined document ${documentId}`)
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })


    socket.on("LEAVE_DOCUMENT", async ({documentId}) => {
        try {
            await socket.leave(documentId)
            const affectedDocs = removeUserFromAllDocuments(socket.id)
            
            // If the user was in this doc, update others
            if (affectedDocs.includes(documentId)) {
                io.to(documentId).emit("PRESENCE_UPDATE", { 
                    users: await getUsers(documentId) 
                })
            }
            
            console.log(`Socket ${socket.id} left document ${documentId}`)
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
            
            // Broadcast to OTHER clients only — sender already has the content
            socket.broadcast.to(documentId).emit("DOCUMENT_UPDATED", 
                {
                    content: document.content, 
                    version: document.version
                }
            )

            // Ack the sender with the new version so it stays in sync
            socket.emit("VERSION_ACK", { version: document.version })
        } catch(err){
            return socket.emit("ERROR", { message: err.message })
        }

    })


    socket.on("CURSOR_MOVE", (data) => {
        handleCursorMove(data, io, socket)
    })


    socket.on("disconnect", async () => {
        // remove user from all documents
        const affectedDocs = removeUserFromAllDocuments(socket.id)

        for (const documentId of affectedDocs) {
            io.to(documentId).emit("PRESENCE_UPDATE", { 
                users: await getUsers(documentId) 
            })
        }

        console.log(`Disconnected: ${socket.id}`)
    })
}

