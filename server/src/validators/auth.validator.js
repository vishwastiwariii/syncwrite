import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().trim().min(3), 
    email: z.email().trim().toLowerCase(), 
    password: z.string().min(6)
})


export const loginSchema = z.object({
    email: z.email().trim().toLowerCase(), 
    password: z.string()
})