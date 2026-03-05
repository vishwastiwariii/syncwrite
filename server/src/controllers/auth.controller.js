import { registerUser, loginUser } from "../services/auth.service.js";

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

        return res.status(201).json({
            success: true, 
            message: "Login Completed", 
            data: result
        })
    } catch(error){
        return res.status(400).json({
        success: false,
        message: error.message
      });
    }
}