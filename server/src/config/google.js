import { OAuth2Client } from "google-auth-library"
import { config } from "./env.js"

// A single verifier client, used only to validate the ID tokens the browser
// sends to POST /auth/google. It never calls Google APIs on the user's behalf.
// Null when GOOGLE_CLIENT_ID isn't configured, so the auth service can respond
// with a clean "not configured" error instead of crashing at boot.
export const googleClient = config.googleClientId
    ? new OAuth2Client(config.googleClientId)
    : null
