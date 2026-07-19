import { registerUser, loginUser, getUserById } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { cookieOptions, COOKIE_NAME, COOKIE_MAX_AGE } from "../config/cookie.js";

export const register = async(req, res) =>{
    try{ 

        const isValid = registerSchema.safeParse(req.body)
        if(!isValid.success){
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const result = await registerUser(isValid.data)

        return res.status(201).json({
            success: true, 
            message: "User registered successfully", 
            data: result
        })
    } catch(error){
        return res.status(400).json({
        success: false,
        message: error.message
      });
    }
}


export const login = async(req, res) => { 
    try{

        const isValid = loginSchema.safeParse(req.body)
        if(!isValid.success){
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }
        const result = await loginUser(isValid.data)

        // Put the JWT in an httpOnly cookie instead of the response body.
        // The browser stores and sends it automatically; JavaScript can't touch it.
        res.cookie(COOKIE_NAME, result.token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE })

        return res.status(200).json({
            success: true,
            message: "Login Completed",
            data: { user: result.user }
        })
    } catch(error){
        return res.status(400).json({
        success: false,
        message: error.message
      });
    }
}


// Clears the cookie. Must use the same options it was set with, or the browser won't remove it.
export const logout = async(req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions)
    return res.status(200).json({
        success: true,
        message: "Logged out"
    })
}


// Tells the client who is logged in. Runs behind authMiddleware, so req.userId is trusted.
// Replaces the old "decode the JWT in the browser" trick, which no longer works.
export const me = async(req, res) => {
    try{
        const user = await getUserById(req.userId)
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, data: { user } })
    } catch(error){
        return res.status(400).json({ success: false, message: error.message })
    }
}