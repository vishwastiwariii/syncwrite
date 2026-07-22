import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/env.js";
import { googleClient } from "../config/google.js";


// The public user shape returned to the client — never leak passwordHash/googleId.
function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl
    }
}

// The one place the SyncWrite session JWT is minted, so every login path
// (password + Google) issues an identical token.
function signToken(user) {
    const payload = { userId: user._id, name: user.name }
    return jwt.sign(payload, config.jwtsecret, { expiresIn: '7d' })
}


export async function registerUser({name, email, password}){
    const existingUser = await User.findOne({ email });
    if(existingUser){
        throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        passwordHash: hashedPassword
    })

    return {
        user: publicUser(user)
    }
}



export async function loginUser({ email, password }){
    const user = await User.findOne({ email })

    // No user, or a Google-only account with no local password: same generic
    // response either way, so we never reveal which accounts exist or how they
    // were created.
    if(!user || !user.passwordHash){
        throw new Error("Invalid Credentials")
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if(!isMatch){
        throw new Error("Invalid Credentials")
    }

    return {
        user: publicUser(user),
        token: signToken(user)
    }
}



// Verifies a Google Identity Services ID token and issues the same app session
// as password login. Sign-in only: it creates an account on first use, links to
// an existing account by verified email, or logs an existing Google user in.
export async function googleAuth({ credential }){
    if(!googleClient){
        const error = new Error("Google sign-in is not configured")
        error.statusCode = 503
        throw error
    }

    let payload
    try {
        // verifyIdToken checks the signature, expiry, issuer, and that the
        // token's audience matches our client id — all in one call.
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config.googleClientId
        })
        payload = ticket.getPayload()
    } catch {
        const error = new Error("Invalid Google credential")
        error.statusCode = 401
        throw error
    }

    // Only trust a verified email — it's what we auto-link accounts on.
    if(!payload?.email || !payload.email_verified){
        const error = new Error("Google account email is not verified")
        error.statusCode = 401
        throw error
    }

    const googleId = payload.sub
    const email = payload.email.toLowerCase()
    const name = payload.name || email.split("@")[0]
    const picture = payload.picture || ""

    // 1) Returning Google user.
    let user = await User.findOne({ googleId })

    // 2) Existing (e.g. password) account with the same verified email — link it.
    //    Fill only missing local profile fields; never overwrite what the user set.
    if(!user){
        user = await User.findOne({ email })
        if(user){
            user.googleId = googleId
            if(!user.imageUrl) user.imageUrl = picture
            if(!user.name) user.name = name
            await user.save()
        }
    }

    // 3) Brand-new user — no password hash.
    if(!user){
        user = await User.create({ name, email, googleId, imageUrl: picture })
    }

    return {
        user: publicUser(user),
        token: signToken(user)
    }
}



export async function getUserById(userId){
    const user = await User.findById(userId)
    if(!user){
        return null
    }

    return publicUser(user)
}
