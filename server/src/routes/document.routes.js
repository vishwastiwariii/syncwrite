import express from "express"
import { createDocument, deleteDocument, getDocumentsById, getUserDocuments, shareDocument, updateDocument } from "../services/document.service.js";


const router = express.Router(); 

router.post('/create', createDocument)
router.patch('/update', updateDocument)
router.delete('/delete', deleteDocument)
router.get('/:id', getDocumentsById)
router.get('/', getUserDocuments)
router.post('/:id/share', shareDocument)

export default router