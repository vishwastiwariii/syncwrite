import Document from "../models/Document"

export async function registerDocumentHandler(io, socket) {
    
    socket.on("JOIN_DOCUMENT", async ({documentId}) => {

        const document = await Document.findById(documentId)

        if(!document) {
            throw new Error("Invalid Document Id")
        }

        const owner = document.collaborators.find(c => c.userId.toString() === socket.userId)

        if(!owner){
            throw new Error("You don't have access to view this document")
        }

        await socket.join(documentId)

        console.log(`Socket ${socket.id} joined document ${documentId}`)
    })



    socket.on("DOCUMENT_UPDATE", async ({ documentId, content, version }) => {

        const document = await Document.findById(documentId)

        if(version != document.version){
            throw new Error("Document has been updated by another user")
        }

        document.content = content
        document.version += 1

        await document.save()
        
        socket.to(documentId).emit("DOCUMENT_UPDATED", 
            { content, version: document.version }
        )
    })
}

