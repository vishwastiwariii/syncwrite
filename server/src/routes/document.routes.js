import express from "express"
import { createDocument, deleteDocument, getDocumentsById, getUserDocuments, shareDocument, updateDocument } from "../controllers/document.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, createDocument)
router.patch('/:id', authMiddleware, updateDocument)
router.delete('/:id', authMiddleware, deleteDocument)
router.get('/:id', authMiddleware, getDocumentsById)
router.get('/', authMiddleware, getUserDocuments)
router.post('/:id/share', authMiddleware, shareDocument)

export default router