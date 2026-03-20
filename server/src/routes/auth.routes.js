import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { rateLimit } from "express-rate-limit";
const router = express.Router()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
})
    
router.post('/register', limiter, register)
router.post('/login', limiter, login)

export default router
