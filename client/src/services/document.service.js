import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiHelper";

export const documentService = {
    async getDocuments() {
        return await getRequest("/documents");
    },

    async createDocument(title, content = "") {
        return await postRequest("/documents", { title, content });
    },

    async updateDocument(id, data) {
        return await patchRequest(`/documents/${id}`, data);
    },

    async getDocumentById(id) {
        return await getRequest(`/documents/${id}`);
    },

    async deleteDocument(id) {
        return await deleteRequest(`/documents/${id}`);
    },

    async shareDocument(id, email, role) {
        return await postRequest(`/documents/${id}/share`, { email, role });
    },
};