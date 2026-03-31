import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { config } from "./config/env.js";
import logger from "./config/logger.js";
import { io, server } from "./config/socket.js";
import { registerSocketHandlers } from "./sockets/index.js";

const PORT = config.port || 5000

async function startServer(){
    try{
        
        await connectDB()
        await connectRedis()

        registerSocketHandlers(io)

        server.listen(PORT, ()=> {
            logger.info(`Server running on port ${PORT}`)
        })


    } catch (err) {
        logger.error("Server startup failed", { error: err.message })
        process.exit(1)
    }
}


startServer()