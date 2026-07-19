import { pubClient } from "../config/redis.js";
import logger from "../config/logger.js";

const CACHE_PREFIX = "doc:"
const TTL = 300

/**
 * Get a document from Redis cache
 * @param {string} documentId
 * @returns {Object|null}
 */
export async function getCachedDocument(documentId) {
    try {
        const cached = await pubClient.get(`${CACHE_PREFIX}${documentId}`)

        if(!cached){
            return null
        }

        return JSON.parse(cached)
    } catch (error) {
        logger.warn("Document cache read failed", { documentId, error: error.message })
        return null
    }
}

/**
 * Cache a document in Redis
 * @param {Object} document
 */
export async function cacheDocument(document) {
    try {
        await pubClient.set(
            `${CACHE_PREFIX}${document._id}`,
            JSON.stringify(document), 
            {
                EX: TTL
            }
        )

    } catch (error) {
        logger.warn("Document cache write failed", { error: error.message })
    }
}


/**
 * Remove a document from Redis cache
 * @param {string} documentId
 */
export async function invalidateDocument(documentId) {
    try {
        await pubClient.del(
            `${CACHE_PREFIX}${documentId}`
        )
    } catch (error) {
        logger.warn("Document cache invalidation failed", { documentId, error: error.message })
    }
}