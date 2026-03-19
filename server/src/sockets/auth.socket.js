import jwt from 'jsonwebtoken'

import { config } from '../config/env.js'


export function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token 

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