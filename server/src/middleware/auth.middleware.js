import jwt from "jsonwebtoken"
import { config } from "../config/env.js"
import { COOKIE_NAME } from "../config/cookie.js"


export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies[COOKIE_NAME]
        if(!token){
            return res.status(401).json({
                status: "error", 
                message: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, config.jwtsecret) 

        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(401).json({
            status: "error", 
            message: "Unauthorized"
        })
    }
}