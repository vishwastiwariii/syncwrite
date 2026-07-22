import connectDB from "./config/db.js";
import { connectRedis, pubClient, subClient } from "./config/redis.js";
import { config } from "./config/env.js";
import logger from "./config/logger.js";
import { io, server } from "./config/socket.js";
import { registerSocketHandlers, flushOnShutdown } from "./sockets/index.js";
import { createAdapter } from "@socket.io/redis-adapter";

const PORT = config.port || 5000

async function startServer(){
    try{

        await connectDB()
        await connectRedis()

        io.adapter(createAdapter(pubClient, subClient))
        await registerSocketHandlers(io)

        server.listen(PORT, ()=> {
            logger.info(`Server running on port ${PORT}`)
        })


    } catch (err) {
        logger.error("Server startup failed", { error: err.message })
        process.exit(1)
    }
}

// Persist active Yjs rooms before exiting so a deploy/restart doesn't drop the
// last few seconds of edits that live only in memory between flushes.
let shuttingDown = false
async function shutdown(signal) {
    if (shuttingDown) return
    shuttingDown = true
    logger.info(`Received ${signal}, flushing Yjs rooms and shutting down`)

    try {
        const written = await flushOnShutdown()
        logger.info(`Flushed ${written} room(s) on shutdown`)
    } catch (err) {
        logger.error("Shutdown flush failed", { error: err.message })
    }

    server.close(() => process.exit(0))
    // Safety net if connections don't drain in time.
    setTimeout(() => process.exit(0), 10000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

startServer()