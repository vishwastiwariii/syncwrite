import { z } from "zod"

export const createDocumentSchema = z.object({
    title: z.string().trim().min(3), 
    content: z.string().optional()
})

export const updateDocumentSchema = z.object({
    title: z.string().trim().optional(),
    content: z.string().optional()
})

export const shareDocumentSchema = z.object({
    email: z.email().trim().toLowerCase(), 
    role: z.string().trim()
})