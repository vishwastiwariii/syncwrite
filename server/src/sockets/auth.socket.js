import jwt from 'jsonwebtoken'
import { io } from '../config/socket'
import { config } from '../config/env'


export async function socketAuthMiddleware() {
    io.use((socket, next) => {
    const token = socket.handshake.auth.token 

    if(!token){
        throw new Error("Invalid Token")
    }

    try{
        const decodedToken = jwt.verify(token, config.jwtsecret)
        socket.userId = decodedToken.userId
        next()
    } catch (err) {
        throw new Error("Invalid Token")
    }
})
}