import { createClient } from "redis";
import { config } from "./env.js";
import logger from "./logger.js";


const pubClient = createClient({
    url: config.redisurl
})

pubClient.on('error', (err) => logger.error('Redis Pub Client Error', { error: err.message }));

const subClient = pubClient.duplicate()

subClient.on('error', (err) => logger.error('Redis Sub Client Error', { error: err.message }));

async function connectRedis(){
    try {
        await pubClient.connect()
        await subClient.connect()
        logger.info("Redis connected")
    } catch(err){
        logger.error("Redis connection failed", { error: err.message })
        throw err
    }
}

export {
    pubClient,
    subClient,
    connectRedis
}