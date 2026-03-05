import jwt from "jsonwebtoken"
import { config } from "../config/env.js"


export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
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