import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { config } from "./config/env.js";
import { io, server } from "./config/socket.js";
import { registerSocketHandlers } from "./sockets/index.js";

const PORT = config.port || 5000

async function startServer(){
    try{
        
        await connectDB()
        await connectRedis()

        registerSocketHandlers(io)

        server.listen(PORT, ()=> {
            console.log(`The Server is running on port ${PORT}`)
        })


    } catch (err) {
        console.error("DB Connection Error", err)
        process.exit(1)
    }
}


startServer()