import Document from "../models/Document.js";
import User from "../models/User.js";

export async function createDocument({ userId, title, content }) {

    const document = await Document.create({
        title, 
        content, 
        createdBy: userId, 
        version: 1
    })

    return {
        document: {
            id: document._id,
            title: document.title, 
            content: document.content,
        }
    }

}


export async function updateDocument({ documentId, title, content, userId }){
    const document = await Document.findById(documentId); 

    if(!document){
        throw new Error("Document does not exist")
    }

    const isOwner = document.createdBy.toString() === userId.toString()

    const collaborator = document.collaborators.find(
        (c) => c.user.toString() == userId.toString()
    )

    const canEdit = collaborator && collaborator.role == "EDITOR"

    if(!isOwner && !canEdit){
        throw new Error("You don't have editor access")
    }

    document.title = title; 
    document.content = content; 

    document.version += 1; 

    await document.save(); 

    return document; 
}


export async function shareDocument({ documentId, userId, email, role }){
    const document = await Document.findById(documentId)

    if(!document){
        throw new Error("Document does not exist")
    }

    if(document.createdBy.toString() !== userId.toString()){
        throw new Error("Only Owners can share document")
    }

    const user = await User.findOne({ email })

    if(!user){
        throw new Error("User not found")
    }

    const alreadyCollaborator = document.collaborators.some(
        (c) => c.userId.toString() === user._id.toString()
    )

    if(alreadyCollaborator){
        throw new Error("Already a collaborator of this document")
    }

    document.collaborators.push({
        userId: user._id,
        role
    })

    await document.save()

    return document
}


export async function getUserDocuments({ userId }){

    const documents = await Document.find({
        $or: [
            { createdBy: userId },
            { "collaborators.userId": userId }
        ]
    }).sort({ updatedAt: -1 })

    return documents
}


export async function getDocumentsById({ documentId, userId }){
    const document = await Document.findById(documentId); 

    if(!document){
        throw new Error("Invalid Document Id")
    }

    const isOwner = document.createdBy.toString() === userId.toString()

    const collaborators = document.collaborators.some(
        (collab) => collab.userId.toString() === userId.toString()
    )

    if(!isOwner && !collaborators){
        throw new Error("Invalid Access")
    }

    return document
}


export async function deleteDocument({ documentId , userId}){

    const document = await Document.findById(documentId)

    if(!document){
        throw new Error("Invalid Document Id")
    }

    const isOwner = document.createdBy.toString() === userId.toString()

    if(!isOwner){
        throw new Error("Only Owner can delete this document")
    }

    await document.deleteOne()

    return {
        message: "Document deleted successfully"
    }
}