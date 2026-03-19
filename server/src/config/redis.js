import { createClient } from "redis";
import { config } from "./env.js";


const pubClient = createClient({
    url: config.redisurl
})

const subClient = pubClient.duplicate()

async function connectRedis(){
    try {
        await pubClient.connect()
        await subClient.connect()
        console.log("Redis connected")
    } catch(err){
        console.log(err)
    }
}

export {
    pubClient,
    subClient,
    connectRedis
}