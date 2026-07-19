import jwt from 'jsonwebtoken'

import { config } from '../config/env.js'
import { COOKIE_NAME } from '../config/cookie.js'


// Pull one cookie value out of the raw "name=value; name2=value2" header string.
function readCookie(cookieHeader, name){
    if(!cookieHeader) return null
    for(const part of cookieHeader.split(";")){
        const [key, ...rest] = part.trim().split("=")
        if(key === name) return rest.join("=")
    }
    return null
}


export function socketAuthMiddleware(socket, next) {
    // The browser sends the httpOnly cookie automatically on the handshake,
    // so we read it from the headers instead of socket.handshake.auth.
    const token = readCookie(socket.handshake.headers.cookie, COOKIE_NAME)

    if(!token){
        return next(new Error("Authentication error: Token missing"))
    }

    try{
        const decodedToken = jwt.verify(token, config.jwtsecret)
        socket.user = {
            id: decodedToken.userId,
            name: decodedToken.name
        }
        next()
    } catch (err) {
        next(new Error("Authentication error: Invalid Token"))
    }
}