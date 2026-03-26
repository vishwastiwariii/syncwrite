import express from "express"
import { createDocument, deleteDocument, getDocumentsById, getUserDocuments, shareDocument, updateDocument } from "../controllers/document.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "express-rate-limit";


const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
})

router.post('/', authMiddleware, limiter, createDocument)
router.patch('/:id', authMiddleware, limiter, updateDocument)
router.delete('/:id', authMiddleware, limiter, deleteDocument)
router.get('/:id', authMiddleware, limiter, getDocumentsById)
router.get('/', authMiddleware, limiter, getUserDocuments)
router.post('/:id/share', authMiddleware, limiter, shareDocument)

export default router