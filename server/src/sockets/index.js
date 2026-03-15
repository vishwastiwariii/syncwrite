import { registerDocumentHandler } from "./document.socket.js"

export async function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
    console.log("User connected", socket.id)

    registerDocumentHandler(io, socket), 

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id)
    })
})
}