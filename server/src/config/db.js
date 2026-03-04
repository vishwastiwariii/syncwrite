import mongoose, { mongo } from "mongoose"
import { config } from "./env"


async function connectDB(){

    if(mongoose.connection.readyState>=1){
        return mongoose.connection;
    }

    await mongoose.connect(config.db)
    console.log("Database connected")
    return mongoose.connection
}


export default connectDB; 