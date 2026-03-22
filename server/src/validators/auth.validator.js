import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().trim().min(3), 
    email: z.string().email().trim().toLowerCase(), 
    password: z.string().min(6)
})


export const loginSchema = z.object({
    email: z.string().email().trim().toLowerCase(), 
    password: z.string()
})