import { registerDocumentHandler } from "./document.socket.js"
import logger from "../config/logger.js"

export async function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`)

    registerDocumentHandler(io, socket)

    socket.on("disconnect", () => {
        logger.info(`User disconnected: ${socket.id}`)
    })
})
}