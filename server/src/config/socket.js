import { Server } from "socket.io"
import app from "../app.js"
import { createServer } from "http"
import { socketAuthMiddleware } from "../sockets/auth.socket.js"
import { pubClient, subClient } from "./redis.js"
import { createAdapter } from "@socket.io/redis-adapter"
import { config } from "./env.js"

const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: config.clientUrl,
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.adapter(createAdapter(pubClient, subClient))

io.use(socketAuthMiddleware)

const getIo = () => {
    if(!io) throw new Error("Socket not initialized")
    return io
}

export { server, io, getIo }