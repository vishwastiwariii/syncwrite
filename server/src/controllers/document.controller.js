import { createDocumentSchema, shareDocumentSchema, updateDocumentSchema } from "../validators/document.validator.js"
import { createDocument as createDocumentService, deleteDocument as deleteDocumentService, getDocumentsById as getDocumentsByIdService, getUserDocuments as getUserDocumentsService, shareDocument as shareDocumentService, updateDocument as updateDocumentService } from "../services/document.service.js"


export const createDocument = async (req, res) => {
    try {
        const userId = req.userId

        const isValid = createDocumentSchema.safeParse(req.body)
        if (!isValid.success) {
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { title, content } = isValid.data

        const document = await createDocumentService({ userId, title, content })

        return res.status(201).json({
            success: true,
            message: "Document created successfully",
            data: document
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const updateDocument = async (req, res) => {
    try {
        const userId = req.userId
        const documentId = req.params.id

        const isValid = updateDocumentSchema.safeParse(req.body)
        if (!isValid.success) {
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { title, content } = isValid.data

        const document = await updateDocumentService({ documentId, title, content, userId })

        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: document
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const deleteDocument = async (req, res) => {
    try {
        const userId = req.userId
        const documentId = req.params.id

        const document = await deleteDocumentService({ documentId, userId })

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
            data: document
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getUserDocuments = async (req, res) => {
    try {
        const userId = req.userId

        const documents = await getUserDocumentsService({ userId })

        return res.status(200).json({
            success: true,
            message: "Documents fetched successfully",
            data: documents
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const getDocumentsById = async (req, res) => {
    try {
        const userId = req.userId
        const documentId = req.params.id

        const document = await getDocumentsByIdService({ documentId, userId })

        return res.status(200).json({
            success: true,
            message: "Document fetched successfully",
            data: document
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export const shareDocument = async (req, res) => {
    try {
        const userId = req.userId
        const documentId = req.params.id

        const isValid = shareDocumentSchema.safeParse(req.body)
        if (!isValid.success) {
            return res.status(400).json({
                success: false,
                message: isValid.error.message
            })
        }

        const { email, role } = isValid.data

        const document = await shareDocumentService({ documentId, userId, email, role })

        return res.status(200).json({
            success: true,
            message: "Document shared successfully",
            data: document
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}