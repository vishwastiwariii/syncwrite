import logger from "../config/logger.js"
import { registerPermissionInvalidation } from "./permission.cache.js"
import { registerYDocHandler } from "./ydoc.socket.js"
import { flushAllDirty } from "./ydoc.manager.js"

// How often the background persister writes dirty rooms to Mongo. Edits live in
// the in-memory Y.Doc and in peers' replicas between flushes; this is the
// bounded window of un-persisted work on a hard crash (see the migration report).
const FLUSH_INTERVAL_MS = 5000

let flushTimer = null

export async function registerSocketHandlers(io) {
    // Cross-instance role-cache invalidation. Registered once, not per socket.
    registerPermissionInvalidation(io)

    // Periodic snapshot of active Yjs rooms to Mongo. One timer per instance;
    // each instance only flushes the rooms whose sockets live on it.
    if (!flushTimer) {
        flushTimer = setInterval(() => {
            flushAllDirty().catch((error) => {
                logger.error("Background flush tick failed", { error: error.message })
            })
        }, FLUSH_INTERVAL_MS)
        // Don't let the flush timer keep the process alive on shutdown.
        flushTimer.unref?.()
    }

    io.on("connection", (socket) => {
        logger.info(`User connected: ${socket.id}`)

        registerYDocHandler(io, socket)
    })
}

/**
 * Flush every dirty room immediately. Call from the SIGTERM/SIGINT handler so a
 * deploy doesn't drop the last few seconds of edits.
 *
 * @returns {Promise<number>} rooms written
 */
export async function flushOnShutdown() {
    if (flushTimer) {
        clearInterval(flushTimer)
        flushTimer = null
    }
    return flushAllDirty()
}
