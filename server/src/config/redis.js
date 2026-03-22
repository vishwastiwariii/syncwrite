import { createClient } from "redis";
import { config } from "./env.js";


const pubClient = createClient({
    url: config.redisurl
})

pubClient.on('error', (err) => console.log('Redis Pub Client Error', err));

const subClient = pubClient.duplicate()

subClient.on('error', (err) => console.log('Redis Sub Client Error', err));

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