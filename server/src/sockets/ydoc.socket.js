import { applyAwarenessUpdate } from "y-protocols/awareness"
import Document from "../models/Document.js"
import logger from "../config/logger.js"
import {
    joinDocumentLimiter,
    ydocUpdateLimiter,
    ydocAwarenessLimiter,
    checkSocketLimit
} from "../config/rateLimiter.js"
import { resolveRole } from "./permission.cache.js"
import {
    acquireRoom,
    releaseRoom,
    applyUpdate,
    encodeState,
    encodeStateVector,
    getAwareness,
    encodeAwareness,
    removeAwareness,
    toUint8Array
} from "./ydoc.manager.js"

/**
 * Real-time collaboration over Yjs.
 *
 * The server is a relay + persistence tier, not an editor. It never parses
 * document text: it merges opaque binary CRDT updates into a per-room replica
 * (for late joiners and periodic snapshots) and fans them out to the room.
 *
 * Sync protocol (a minimal two-way handshake over the standard Yjs primitives):
 *   1. Client sends Y_JOIN with its state vector ("what I already have").
 *   2. Server replies Y_SYNC with the delta the client is missing, plus the
 *      server's own state vector.
 *   3. Client applies the delta, then sends Y_UPDATE with anything the server
 *      is missing (its offline edits, if any).
 * Thereafter every local edit is a Y_UPDATE in both directions. Yjs updates are
 * commutative and idempotent, so ordering and duplicates are harmless.
 */
export function registerYDocHandler(io, socket) {
    // Awareness client-ids this socket controls, per document. Needed so a
    // disconnect can remove exactly this socket's cursor/avatar and nobody
    // else's. Mirrors y-websocket's per-connection controlled-ids set.
    socket.data.awarenessClients = new Map()
    // The awareness "update" listeners we attached, so we can detach on leave.
    socket.data.awarenessListeners = new Map()

    socket.on("Y_JOIN", async ({ documentId, stateVector }) => {
        try {
            if (!await checkSocketLimit(joinDocumentLimiter, socket, "Y_JOIN")) return

            if (!documentId) {
                return socket.emit("ERROR", { message: "documentId is required" })
            }

            // View access is required to join. resolveRole reads the DB once and
            // caches the role on the socket; edit checks on Y_UPDATE are then free.
            const role = await resolveRole(socket, documentId)

            if (!role) {
                return socket.emit("ERROR", { message: "You don't have access to this document" })
            }

            // Acquire the room exactly once per socket+document. A socket can
            // legitimately re-emit Y_JOIN (StrictMode remount, or a Y_RESYNC
            // after an eviction) — re-acquiring would leak the refcount, since
            // disconnect only releases once per document. Re-joins fall through
            // to just re-send the sync state below.
            if (!socket.data.awarenessClients.has(documentId)) {
                const { awareness } = await acquireRoom(documentId)
                await socket.join(documentId)

                // Track which awareness ids this socket owns for this room.
                const controlled = new Set()
                socket.data.awarenessClients.set(documentId, controlled)

                const onAwarenessChange = ({ added, updated, removed }, origin) => {
                    if (origin !== socket) return
                    added.concat(updated).forEach((id) => controlled.add(id))
                    removed.forEach((id) => controlled.delete(id))
                }
                awareness.on("update", onAwarenessChange)
                socket.data.awarenessListeners.set(documentId, onAwarenessChange)
            }

            // Step 2 of the handshake: send the client only the state it lacks,
            // plus our state vector so it can reply with what we lack.
            const update = await encodeState(documentId, stateVector)
            const serverStateVector = await encodeStateVector(documentId)
            socket.emit("Y_SYNC", { documentId, update, stateVector: serverStateVector })

            // Seed the newcomer with everyone's current cursor/presence.
            const awarenessState = encodeAwareness(documentId)
            if (awarenessState) {
                socket.emit("Y_AWARENESS", { documentId, update: awarenessState })
            }

            logger.info(`Socket ${socket.id} Y_JOINed document ${documentId} as ${role}`)
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })

    socket.on("Y_UPDATE", async ({ documentId, update }) => {
        try {
            if (!await checkSocketLimit(ydocUpdateLimiter, socket, "Y_UPDATE")) return

            if (!documentId || !update) return

            // Edit access, off the cached role — no DB read on the hot path.
            const role = await resolveRole(socket, documentId)
            if (!role || role === "VIEWER") {
                return socket.emit("ERROR", { message: "You don't have editor access" })
            }

            // Merge into the server replica (for persistence + late joiners)…
            const applied = await applyUpdate(documentId, update)
            if (!applied) {
                // Not joined / room evicted. Ask the client to re-sync.
                return socket.emit("Y_RESYNC", { documentId })
            }

            // …and relay the raw delta to everyone else in the room.
            socket.broadcast.to(documentId).emit("Y_UPDATE", { documentId, update })
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })

    socket.on("Y_AWARENESS", async ({ documentId, update }) => {
        try {
            if (!await checkSocketLimit(ydocAwarenessLimiter, socket, "Y_AWARENESS")) return

            if (!documentId || !update) return

            // Awareness is presence, so viewers may broadcast their cursor too —
            // any role that can join can be seen. Just require membership.
            const role = await resolveRole(socket, documentId)
            if (!role) return

            const awareness = getAwareness(documentId)
            if (!awareness) return

            // Apply with this socket as origin so our per-socket listener records
            // the client-ids it controls, then relay verbatim.
            applyAwarenessUpdate(awareness, toUint8Array(update), socket)
            socket.broadcast.to(documentId).emit("Y_AWARENESS", { documentId, update })
        } catch (err) {
            socket.emit("ERROR", { message: err.message })
        }
    })

    socket.on("Y_LEAVE", async ({ documentId }) => {
        await leaveRoom(socket, documentId)
    })

    socket.on("disconnect", async () => {
        // Leave every room this socket was in.
        const documentIds = Array.from(socket.data.awarenessClients.keys())
        await Promise.all(documentIds.map((documentId) => leaveRoom(socket, documentId)))
    })
}

/**
 * Tear down one socket's membership of a room: drop its awareness state (so its
 * cursor/avatar disappears for everyone), detach the listener, and release the
 * room so it can be flushed and evicted when empty.
 */
async function leaveRoom(socket, documentId) {
    try {
        const controlled = socket.data.awarenessClients.get(documentId)
        if (!controlled) return

        const removal = removeAwareness(documentId, Array.from(controlled))
        if (removal) {
            socket.to(documentId).emit("Y_AWARENESS", { documentId, update: removal })
        }

        const awareness = getAwareness(documentId)
        const listener = socket.data.awarenessListeners.get(documentId)
        if (awareness && listener) awareness.off("update", listener)

        socket.data.awarenessClients.delete(documentId)
        socket.data.awarenessListeners.delete(documentId)

        await socket.leave(documentId)
        await releaseRoom(documentId)
    } catch (err) {
        logger.error("Y_LEAVE cleanup failed", { documentId, error: err.message })
    }
}
