import { z } from "zod"

export const createDocumentSchema = z.object({
    title: z.string().trim().min(3), 
    content: z.string().optional()
})

// Body content is no longer written over REST — it is a Yjs shared type synced
// over the socket. The REST update path handles document metadata only.
export const updateDocumentSchema = z.object({
    title: z.string().trim().min(1)
})

export const shareDocumentSchema = z.object({
    email: z.email().trim().toLowerCase(), 
    role: z.string().trim()
})