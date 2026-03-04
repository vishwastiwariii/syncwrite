import User from "../models/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { config } from "../config/env";



export default async function registerUser({name, email, password}){
    const existingUser = await User.findOne({ email }); 
    if(existingUser){
        throw new Error("Email already registered")
    }

    const hashedPassword = bcrypt.hash(password, 10)

    const user = await User.create({
        name, 
        email, 
        passwordHash: hashedPassword
    })

    return {
        user: {
            id: user._id, 
            name: user.name, 
            email: user.email, 
        }
    }
}



export default async function loginUser({ email, password }){
    const user = await User.findOne({ email })

    if(!user){
        throw new Error("Invalid Credentials")
    }

    const isMatch = bcrypt.compare(password, user.passwordHash)
    if(!isMatch){
        throw new Error("Invalid Credentials")
    }

    const token = jwt.sign({ id: user._id }, config.jwtsecret)

    return {
        user: {
            id: user._id, 
            name: user.name, 
            email: user.email
        }, 
        token
    }
}