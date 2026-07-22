import * as Y from "yjs"
import { Awareness, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness"
import Document from "../models/Document.js"
import logger from "../config/logger.js"
import { invalidateDocument } from "../services/documentCache.js"

/**
 * The name of the Y.Text shared type holding the document body.
 *
 * This is a system-wide contract: the backfill script, this manager, and the
 * browser must all call getText() with this exact name, or they operate on
 * different shared types that never converge.
 */
export const CONTENT_TEXT_NAME = "content"

/**
 * Origin tag for updates that arrived from a client. Lets the persistence
 * layer (and any future doc.on("update") subscriber) tell client-driven
 * changes from server-driven ones, and prevents relay loops.
 */
export const REMOTE_ORIGIN = "remote"

/**
 * documentId -> {
 *   doc: Y.Doc|null,          the replica, null until hydration resolves
 *   awareness: Awareness|null, presence/cursor state for the room
 *   ready: Promise<entry>,     in-flight (or settled) hydration
 *   refCount: number,          how many sockets currently hold this room
 *   dirty: boolean             has unpersisted state (consumed by the flusher)
 * }
 */
const rooms = new Map()

/**
 * Normalize a Mongo Buffer or a browser-relayed ArrayBuffer into a standalone
 * Uint8Array. Buffers from the driver can be slices of a shared pool carrying
 * a non-zero byteOffset; constructing a fresh view copies the bytes and
 * respects the offset, so Yjs never reads neighbouring memory.
 *
 * @param {Uint8Array|Buffer|ArrayBuffer} bytes
 * @returns {Uint8Array}
 */
export function toUint8Array(bytes) {
    if (bytes instanceof Uint8Array) {
        return new Uint8Array(bytes)
    }

    // Mongoose `.lean()` skips casting, so a Buffer field comes back as a raw
    // BSON Binary (the driver leaves subtype-0 binary un-promoted) rather than a
    // Node Buffer. Its `length` is a method, so the Buffer.from() fallback below
    // would silently yield an empty array and Yjs would fail to decode. Read the
    // bytes off its backing Buffer, bounded by the Binary's real length.
    if (bytes && bytes._bsontype === "Binary") {
        const buf = bytes.buffer
        return new Uint8Array(buf.buffer, buf.byteOffset, bytes.length())
    }

    return new Uint8Array(Buffer.from(bytes))
}

/**
 * Build the replica for a document from its persisted Yjs state.
 *
 * A document with no `state` yields an empty Y.Doc rather than throwing:
 * documents created after the backfill have not been encoded yet, and an
 * empty replica converges with whatever the first client sends. Document
 * existence and access are the caller's concern, not this module's.
 *
 * @param {string} documentId
 * @returns {Promise<Y.Doc>}
 */
async function hydrate(documentId) {
    const doc = new Y.Doc()

    const record = await Document.findById(documentId).select({ state: 1 }).lean()

    if (record?.state) {
        Y.applyUpdate(doc, toUint8Array(record.state))
    } else {
        logger.info("Y.Doc hydrated with empty state", { documentId })
    }

    return doc
}

/**
 * Get (loading if needed) the room entry for a document, without touching the
 * reference count.
 *
 * The in-flight hydration promise is stored in the Map before it resolves so
 * that two sockets joining a cold room in the same tick await the same load
 * instead of racing and producing two divergent replicas.
 *
 * @param {string} documentId
 * @returns {Object} room entry
 */
function getOrCreateEntry(documentId) {
    const existing = rooms.get(documentId)

    if (existing) {
        return existing
    }

    const entry = {
        doc: null,
        awareness: null,
        ready: null,
        refCount: 0,
        dirty: false
    }

    entry.ready = hydrate(documentId)
        .then((doc) => {
            entry.doc = doc
            entry.awareness = new Awareness(doc)
            // The server is a relay, not a participant: it must not publish an
            // awareness state of its own.
            entry.awareness.setLocalState(null)
            return entry
        })
        .catch((error) => {
            // Drop the failed entry so a later join retries instead of
            // permanently caching a rejected promise.
            rooms.delete(documentId)
            logger.error("Y.Doc hydration failed", { documentId, error: error.message })
            throw error
        })

    rooms.set(documentId, entry)

    return entry
}

/**
 * Acquire the shared room for a document, hydrating it on first use.
 *
 * Every acquire must be paired with a releaseRoom() call (on leave and on
 * disconnect) or the room will never be evicted.
 *
 * @param {string} documentId
 * @returns {Promise<{doc: Y.Doc, awareness: Awareness}>}
 */
export async function acquireRoom(documentId) {
    const entry = getOrCreateEntry(String(documentId))

    // Increment before awaiting: another socket releasing during our load must
    // not evict the room out from under us.
    entry.refCount += 1

    return entry.ready
}

/**
 * Release one reference to a document's room, flushing and evicting it when
 * the last socket leaves.
 *
 * @param {string} documentId
 * @returns {Promise<void>}
 */
export async function releaseRoom(documentId) {
    const key = String(documentId)
    const entry = rooms.get(key)

    if (!entry) {
        return
    }

    entry.refCount -= 1

    if (entry.refCount > 0) {
        return
    }

    // Last one out persists the final state before the replica is discarded.
    // The room is authoritative while loaded, so skipping this loses edits.
    if (entry.dirty) {
        await flushRoom(key).catch((error) => {
            logger.error("Flush on room eviction failed", { documentId: key, error: error.message })
        })
    }

    entry.awareness?.destroy()
    entry.doc?.destroy()
    rooms.delete(key)
}

/**
 * Apply a client update to a document's replica and mark it dirty.
 *
 * Awaits hydration so an update racing ahead of its room's load is merged
 * rather than dropped. Yjs updates are commutative, so the interleaving that
 * awaiting introduces is harmless.
 *
 * @param {string} documentId
 * @param {Uint8Array|Buffer|ArrayBuffer} update
 * @returns {Promise<boolean>} false if the room is not loaded
 */
export async function applyUpdate(documentId, update) {
    const key = String(documentId)
    const entry = rooms.get(key)

    if (!entry) {
        return false
    }

    await entry.ready

    Y.applyUpdate(entry.doc, toUint8Array(update), REMOTE_ORIGIN)
    entry.dirty = true

    return true
}

/**
 * Encode the state a peer is missing, given its state vector.
 *
 * With no state vector this returns the whole document. A full-state encoding
 * and an incremental delta are the same kind of value — both are applied with
 * Y.applyUpdate — so the client needs no special case for the initial sync.
 *
 * @param {string} documentId
 * @param {Uint8Array|Buffer|ArrayBuffer} [peerStateVector]
 * @returns {Promise<Uint8Array|null>} null if the room is not loaded
 */
export async function encodeState(documentId, peerStateVector) {
    const key = String(documentId)
    const entry = rooms.get(key)

    if (!entry) {
        return null
    }

    await entry.ready

    const sv = peerStateVector ? toUint8Array(peerStateVector) : undefined
    return Y.encodeStateAsUpdate(entry.doc, sv)
}

/**
 * The server's state vector for a document — a compact description of "what I
 * already have", sent to a joining client so it can reply with only the parts
 * the server is missing.
 *
 * @param {string} documentId
 * @returns {Promise<Uint8Array|null>}
 */
export async function encodeStateVector(documentId) {
    const key = String(documentId)
    const entry = rooms.get(key)

    if (!entry) {
        return null
    }

    await entry.ready

    return Y.encodeStateVector(entry.doc)
}

/**
 * The room's Awareness instance, or null if not loaded. Callers must have
 * acquired the room first.
 *
 * @param {string} documentId
 * @returns {Awareness|null}
 */
export function getAwareness(documentId) {
    return rooms.get(String(documentId))?.awareness ?? null
}

/**
 * Encode the full current awareness state of a room, for syncing a newcomer.
 *
 * @param {string} documentId
 * @returns {Uint8Array|null} null if the room is not loaded or empty
 */
export function encodeAwareness(documentId) {
    const awareness = getAwareness(documentId)

    if (!awareness) {
        return null
    }

    const clients = Array.from(awareness.getStates().keys())

    if (clients.length === 0) {
        return null
    }

    return encodeAwarenessUpdate(awareness, clients)
}

/**
 * Drop the awareness states a disconnecting socket controlled, so its cursor
 * and avatar don't linger. Returns an encoded removal update to broadcast, or
 * null if there was nothing to remove.
 *
 * @param {string} documentId
 * @param {number[]} clientIds  awareness client ids owned by the socket
 * @returns {Uint8Array|null}
 */
export function removeAwareness(documentId, clientIds) {
    const awareness = getAwareness(documentId)

    if (!awareness || clientIds.length === 0) {
        return null
    }

    removeAwarenessStates(awareness, clientIds, "disconnect")
    return encodeAwarenessUpdate(awareness, clientIds)
}

/**
 * Persist a single room's current state to Mongo: the encoded Yjs state (the
 * source of truth) plus a derived plaintext projection so the dashboard,
 * search, and any non-Yjs reader keep working. Clears the dirty flag on
 * success.
 *
 * @param {string} documentId
 * @returns {Promise<boolean>} true if a write happened
 */
export async function flushRoom(documentId) {
    const key = String(documentId)
    const entry = rooms.get(key)

    if (!entry || !entry.doc || !entry.dirty) {
        return false
    }

    const state = Buffer.from(Y.encodeStateAsUpdate(entry.doc))
    const content = entry.doc.getText(CONTENT_TEXT_NAME).toString()

    // Clear dirty *before* the await using a marker, so edits that land during
    // the write aren't lost: if the doc changes mid-flush it becomes dirty
    // again and the next tick re-flushes.
    entry.dirty = false

    try {
        await Document.updateOne({ _id: key }, { $set: { state, content } })
        // Drop the read cache so GET /documents/:id (dashboard preview) reflects
        // the freshly persisted body rather than a stale snapshot.
        await invalidateDocument(key)
        return true
    } catch (error) {
        // Re-mark dirty so the failed write is retried next tick.
        entry.dirty = true
        throw error
    }
}

/**
 * Flush every dirty room. Called on an interval by the background persister.
 *
 * @returns {Promise<number>} number of rooms written
 */
export async function flushAllDirty() {
    let written = 0

    for (const [documentId, entry] of rooms) {
        if (!entry.dirty) {
            continue
        }

        try {
            if (await flushRoom(documentId)) {
                written += 1
            }
        } catch (error) {
            logger.error("Periodic flush failed", { documentId, error: error.message })
        }
    }

    return written
}

/**
 * Number of currently loaded rooms. Diagnostics and tests only.
 *
 * @returns {number}
 */
export function getRoomCount() {
    return rooms.size
}
