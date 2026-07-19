import { RateLimiterRedis } from "rate-limiter-flexible"
import { pubClient } from "./redis.js"
import logger from "./logger.js"

// Reuse the already-connected node-redis (redis v4) client. `useRedisPackage`
// tells rate-limiter-flexible to talk to node-redis rather than ioredis.
// Each limiter gets a distinct keyPrefix so their counters never collide.

// DOCUMENT_UPDATE is the most expensive event: two Mongo round-trips per call.
// Keep it tight.
export const docUpdateLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_doc_update",
    points: 30,      // 30 updates
    duration: 10     // per 10 seconds, per user
})

// CURSOR_MOVE is the highest-frequency event. Allow a generous burst but still
// cap it so one client can't flood every peer in the room.
export const cursorMoveLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_cursor_move",
    points: 100,     // 100 moves
    duration: 10     // per 10 seconds, per user
})

// JOIN_DOCUMENT hits Mongo + permission checks. Limit room-join churn.
export const joinDocumentLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_join_doc",
    points: 20,      // 20 joins
    duration: 10     // per 10 seconds, per user
})

/**
 * Consume one point for a socket event.
 * Returns true if the event is allowed to proceed, false if it was rate-limited
 * (in which case a RATE_LIMITED event is emitted to the caller).
 *
 * Fails open: if Redis is unreachable the limiter rejects with an Error rather
 * than a rate-limit result — we log and allow the event so an outage doesn't
 * take down live editing.
 */
export async function checkSocketLimit(limiter, socket, event) {
    try {
        await limiter.consume(socket.user.id)
        return true
    } catch (rejRes) {
        if (rejRes instanceof Error) {
            logger.error("Rate limiter store error", { event, error: rejRes.message })
            return true // fail open
        }
        socket.emit("RATE_LIMITED", {
            event,
            retryAfterMs: rejRes.msBeforeNext
        })
        return false
    }
}

