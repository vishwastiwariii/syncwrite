import Document from "../models/Document.js";
import User from "../models/User.js";
import { canEditDocument, canShareDocument } from "./permission.service.js";

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


export async function updateDocument({ documentId, title, content, baseVersion, userId }) {
    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error("Document does not exist")
    }

    await canEditDocument(userId, document)

    // Title-only updates are metadata and don't participate in version guarding,
    // so they must NOT bump the content version (that would desync the socket
    // editing path and cause spurious conflicts).
    if (content === undefined) {
        if (title !== undefined) document.title = title;
        await document.save();
        return document;
    }

    // Content update: guard against a stale base version.
    if (baseVersion === undefined) {
        const err = new Error("baseVersion is required to update content")
        err.statusCode = 400;
        throw err;
    }

    const set = { content };
    if (title !== undefined) set.title = title;

    // Atomic guarded write: only lands if the document is still at baseVersion.
    const updated = await Document.findOneAndUpdate(
        { _id: documentId, version: baseVersion },
        { $set: set, $inc: { version: 1 } },
        { new: true }
    );

    if (!updated) {
        // Document exists (checked above) but the version moved — conflict.
        // Attach the server's current state so the caller can merge or refetch.
        const current = await Document.findById(documentId);
        const err = new Error("Version conflict: document was updated by someone else")
        err.statusCode = 409;
        err.conflict = {
            currentVersion: current?.version,
            content: current?.content
        };
        throw err;
    }

    return updated;
}


export async function shareDocument({ documentId, userId, email, role }) {
    const document = await Document.findById(documentId)

    if (!document) {
        throw new Error("Document does not exist")
    }

    await canShareDocument(userId, document)

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("User not found")
    }

    const alreadyCollaborator = document.collaborators.some(
        (c) => c.userId.toString() === user._id.toString()
    )

    if (alreadyCollaborator) {
        throw new Error("Already a collaborator of this document")
    }

    document.collaborators.push({
        userId: user._id,
        role
    })

    await document.save()

    return document
}


export async function getUserDocuments({ userId }) {

    const documents = await Document.find({
        $or: [
            { createdBy: userId },
            { "collaborators.userId": userId }
        ]
    }).sort({ updatedAt: -1 })

    return documents
}


export async function getDocumentsById({ documentId, userId }) {
    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error("Invalid Document Id")
    }

    const isOwner = document.createdBy.toString() === userId.toString()

    const collaborators = document.collaborators.some(
        (collab) => collab.userId.toString() === userId.toString()
    )

    if (!isOwner && !collaborators) {
        throw new Error("Invalid Access")
    }

    return document
}


export async function deleteDocument({ documentId, userId }) {

    const document = await Document.findById(documentId)

    if (!document) {
        throw new Error("Invalid Document Id")
    }

    const isOwner = document.createdBy.toString() === userId.toString()

    if (!isOwner) {
        throw new Error("Only Owner can delete this document")
    }

    await document.deleteOne()

    return {
        message: "Document deleted successfully"
    }
}