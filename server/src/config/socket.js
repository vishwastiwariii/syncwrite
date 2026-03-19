import { Server } from "socket.io"
import app from "../app.js"
import { createServer } from "http"
import { socketAuthMiddleware } from "../sockets/auth.socket.js"

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.use(socketAuthMiddleware)

const getIo = () => {
    if(!io) throw new Error("Socket not initialized")
    return io
}

export { server, io, getIo }