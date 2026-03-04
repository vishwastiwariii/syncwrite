import registerUser from "../services/auth.service.js";
import loginUser from ""


async function register(req, res){
    try{ 
        const result = await registerUser(req.body)

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


async function login(req, res){ 
    try{
        const result = await loginUser(req.body)
    }
}