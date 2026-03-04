import connectDB from "./config/db.js";
import { config } from "./config/env.js";


const PORT = config.port || 5000

async function startServer(){
    try{
        await connectDB()

        app.listen(PORT, ()=> {
            console.log(`The Server is running on port ${PORT}`)
        })
    } catch (err) {
        console.error("DB Connection Error", err)
        process.exit(1)
    }
}


startServer()