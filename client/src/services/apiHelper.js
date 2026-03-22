import api from "./api";


export const getRequest = async (url, params = {}) => {
    try {
        const response = await api.get(url, { params });
        return response.data;
    } catch (err){
        throw err; 
    }
}

export const postRequest = async (url, params = {}) => {
    try {
        const response = await api.post(url, params);
        return response.data    
    } catch (err){
        throw err; 
    }
}

export const patchRequest = async (url, params = {}) => {
    try {
        const response = await api.patch(url, params);
        return response.data    
    } catch (err){
        throw err; 
    }
}

export const deleteRequest = async (url, params = {}) => {
    try {
        const response = await api.delete(url, { params });
        return response.data    
    } catch (err){
        throw err; 
    }
}