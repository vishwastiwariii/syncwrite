import { config } from "./env.js"

const isProd = config.nodeEnv === "production"

// One place that decides how the auth cookie behaves.
// In production the client and API live on different domains,
// so the cookie must be SameSite=None and Secure (HTTPS only).
export const cookieOptions = {
    httpOnly: true,               // JavaScript can never read this cookie
    secure: isProd,               // only sent over HTTPS in production
    sameSite: isProd ? "none" : "lax",
    path: "/"
}

export const COOKIE_NAME = "token"

export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days, matches the JWT
