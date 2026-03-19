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



    socket.on("DOCUMENT_UPDATE", async ({ documentId, content, version }) => {

        try {
            const document = await Document.findById(documentId)

            if(!documentId){
                return socket.emit("ERROR", { message: "Invalid Document Id" })
            }

            await canEditDocument(socket.user.id, document)

            if(version != document.version){
                throw new Error("Document has been updated by another user")
            }

            document.content = content
            document.version += 1

            await document.save()
            
            io.to(documentId).emit("DOCUMENT_UPDATED", 
                {
                    content: document.content, 
                    version: document.version
                }
            )
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

