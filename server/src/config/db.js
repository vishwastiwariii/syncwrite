import mongoose from "mongoose"
import { config } from "../config/env.js"


async function connectDB(){

    if(mongoose.connection.readyState>=1){
        return mongoose.connection;
    }

    await mongoose.connect(config.db)
    console.log("Database connected")
    return mongoose.connection
}


export default connectDB; 