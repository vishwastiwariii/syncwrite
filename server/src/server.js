import connectDB from "./config/db.js";
import { config } from "./config/env.js";
import { io, server } from "./config/socket.js";
import { registerSocketHandlers } from "./sockets/index.js";

const PORT = config.port || 5000

async function startServer(){
    try{
        await connectDB()

        server.listen(PORT, ()=> {
            console.log(`The Server is running on port ${PORT}`)
        })

        registerSocketHandlers(io)

    } catch (err) {
        console.error("DB Connection Error", err)
        process.exit(1)
    }
}


startServer()