import Document from "../models/Document.js"
import { getRole } from "../services/permission.service.js"

// Cross-instance event used to invalidate cached roles. A permission change can
// happen on any server instance (over HTTP), while the affected user's socket
// may live on a different one — serverSideEmit fans the event out to them all.
const PERMISSION_CHANGED = "permission:changed"

// Per-socket role cache, keyed by documentId and stored on socket.data. A single
// socket can be joined to several documents at once, each with its own role, so
// the role can't live on socket.user as a single value.
function roleStore(socket) {
    if (!socket.data.roles) socket.data.roles = {}
    return socket.data.roles
}

export function cacheRole(socket, documentId, role) {
    roleStore(socket)[documentId] = role
}

export function clearRole(socket, documentId) {
    delete roleStore(socket)[documentId]
}

// Resolve the socket's role for a document. Returns the cached role when present
// with no DB access — this runs on every edit, so keeping it read-free is the
// whole point of the cache. On a miss (never joined, or invalidated) it derives
// the role from the DB once and re-caches it, so an invalidated entry costs at
// most one read rather than one per keystroke.
export async function resolveRole(socket, documentId) {
    const store = roleStore(socket)
    if (store[documentId]) return store[documentId]

    const document = await Document.findById(documentId)
    if (!document) return null

    const role = getRole(socket.user.id, document)
    if (role) store[documentId] = role
    return role
}

// Clear a user's cached role for a document on this instance's local sockets.
function invalidateLocal(io, documentId, userId) {
    for (const socket of io.sockets.sockets.values()) {
        if (socket.user && String(socket.user.id) === String(userId)) {
            clearRole(socket, documentId)
        }
    }
}

// Invalidate a user's cached role for a document across every server instance.
// Call this whenever a document's permissions change (new collaborator, role
// change, revoke). The user's next edit then re-derives the role from the DB.
export function invalidatePermission(io, { documentId, userId }) {
    // serverSideEmit does not loop back to the sender, so this instance is
    // handled directly here and the others via the listener below.
    invalidateLocal(io, documentId, userId)
    io.serverSideEmit(PERMISSION_CHANGED, { documentId, userId })
}

// Wire the cross-instance listener. Call once at startup.
export function registerPermissionInvalidation(io) {
    io.on(PERMISSION_CHANGED, ({ documentId, userId }) => {
        invalidateLocal(io, documentId, userId)
    })
}
