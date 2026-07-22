import * as Y from "yjs";
import Document from "../models/Document.js";
import User from "../models/User.js";
import { cacheDocument, getCachedDocument, invalidateDocument } from "./documentCache.js";
import { canEditDocument, canShareDocument } from "./permission.service.js";
import { getIo } from "../config/socket.js";
import { invalidatePermission } from "../sockets/permission.cache.js";
import { CONTENT_TEXT_NAME } from "../sockets/ydoc.manager.js";

// Encode a plaintext body into the Yjs state a document opens with. Seeding
// `state` at creation means the first editor loads the intended content through
// the sync handshake instead of starting from an empty replica.
function encodeInitialState(content) {
    const doc = new Y.Doc();
    if (content) {
        doc.getText(CONTENT_TEXT_NAME).insert(0, content);
    }
    return Buffer.from(Y.encodeStateAsUpdate(doc));
}

export async function createDocument({ userId, title, content }) {

    const document = await Document.create({
        title,
        content,
        state: encodeInitialState(content),
        createdBy: userId
    })

    return {
        document: {
            id: document._id,
            title: document.title,
            content: document.content,
        }
    }

}


// Metadata-only update. The document body is a Yjs shared type synced over the
// socket and merged server-side — it is never written through this REST path.
export async function updateDocument({ documentId, title, userId }) {
    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error("Document does not exist")
    }

    await canEditDocument(userId, document)

    document.title = title;
    await document.save();
    await invalidateDocument(documentId)

    return document;
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
    await invalidateDocument(documentId)

    // Drop the shared user's cached role (across all instances) so their next
    // edit reflects the access they were just granted or had changed.
    invalidatePermission(getIo(), { documentId, userId: user._id.toString() })

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
    // Try the cache first, fall back to Mongo and populate on miss.
    let document = await getCachedDocument(documentId)

    if (!document) {
        document = await Document.findById(documentId);

        if (!document) {
            throw new Error("Invalid Document Id")
        }

        await cacheDocument(document)
    }

    // Authorization runs on every path — cache hit OR miss. Never return a
    // cached document without checking access, or any authenticated user could
    // read a document another user warmed into the cache. Cached JSON stores
    // ids as strings, so .toString() is a safe no-op on both shapes.
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
    await invalidateDocument(documentId)

    return {
        message: "Document deleted successfully"
    }
}