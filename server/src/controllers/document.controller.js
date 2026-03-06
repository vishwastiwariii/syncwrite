import { createDocumentSchema, shareDocumentSchema, updateDocumentSchema } from "../validators/document.validator"
import { createDocument, deleteDocument, getDocumentsById, getUserDocuments, shareDocument, updateDocument } from "../services/document.service.js"


export const createDocument = async(req, res) => {
    try{
        const userId = req.userId

        const isValid = createDocumentSchema.safeParse(req.body)
        if(!isValid.success){
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { title, content } = isValid.data

        const document = await createDocument({ userId, title, content })

        return res.status(201).json({
            success: true,
            message: "Document created successfully",
            data: document
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const updateDocument = async(req, res) => {
    try{
        const userId = req.userId
        const documentId = req.params.id

        const isValid = updateDocumentSchema.safeParse(req.body)
            if(!isValid.success){
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { title, content } = isValid.data

        const document = await updateDocument({ documentId, title, content, userId })

        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: document
        })
        
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const deleteDocument = async(req, res) => {
    try{
        const userId = req.userId
        const documentId = req.params.id

        const document = await deleteDocument({ documentId, userId })

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
            data: document
        })
        
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getUserDocuments = async(req, res) => {
    try{
        const userId = req.userId

        const documents = await getUserDocuments({ userId })

        return res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
            data: documents
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getDocumentsById = async(req, res) => {
    try{
        const userId = req.userId
        const documentId = req.params.id

        const document = await getDocumentsById({ documentId, userId })

        return res.status(200).json({
            success: true,
            message: "Document fetched successfully",
            data: document
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const shareDocument = async(req, res) => {
    try{
        const userId = req.userId
        const documentId = req.params.id

        const isValid = shareDocumentSchema.safeParse(req.body)
            if(!isValid.success){
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { email, role } = isValid.data

        const document = await shareDocument({ documentId, userId, email, role })

        return res.status(200).json({
            success: true,
            message: "Document shared successfully",
            data: document
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}