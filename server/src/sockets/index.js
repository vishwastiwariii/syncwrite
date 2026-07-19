import { registerDocumentHandler } from "./document.socket.js"
import logger from "../config/logger.js"
import { io } from "../config/socket.js"
import { registerPermissionInvalidation } from "./permission.cache.js"

export async function registerSocketHandlers(io) {
    // Cross-instance role-cache invalidation. Registered once, not per socket.
    registerPermissionInvalidation(io)

    io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`)

    registerDocumentHandler(io, socket)

    socket.on("disconnect", () => {
        logger.info(`User disconnected: ${socket.id}`)
    })
})
}