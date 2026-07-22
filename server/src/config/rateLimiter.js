import { RateLimiterRedis } from "rate-limiter-flexible"
import { pubClient } from "./redis.js"
import logger from "./logger.js"

// Reuse the already-connected node-redis (redis v4) client. `useRedisPackage`
// tells rate-limiter-flexible to talk to node-redis rather than ioredis.
// Each limiter gets a distinct keyPrefix so their counters never collide.

// JOIN_DOCUMENT / Y_JOIN hits Mongo + permission checks. Limit room-join churn.
export const joinDocumentLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_join_doc",
    points: 20,      // 20 joins
    duration: 10     // per 10 seconds, per user
})

// Y_UPDATE carries a tiny binary CRDT delta and no DB write on the hot path, so
// it's far cheaper than the old DOCUMENT_UPDATE. Allow a high burst (fast typing
// emits one update per keystroke) but still cap it so a runaway client can't
// flood the room.
export const ydocUpdateLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_ydoc_update",
    points: 300,     // 300 updates
    duration: 10     // per 10 seconds, per user
})

// Y_AWARENESS carries cursor/selection changes — high frequency, no persistence.
export const ydocAwarenessLimiter = new RateLimiterRedis({
    storeClient: pubClient,
    useRedisPackage: true,
    keyPrefix: "rl_ydoc_awareness",
    points: 200,     // 200 awareness updates
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

