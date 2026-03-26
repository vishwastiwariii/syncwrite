import api from "./api";


export const getRequest = async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
}

export const postRequest = async (url, params = {}) => {
    const response = await api.post(url, params);
    return response.data    
}

export const patchRequest = async (url, params = {}) => {
    const response = await api.patch(url, params);
    return response.data    
}

export const deleteRequest = async (url, params = {}) => {
    const response = await api.delete(url, { params });
    return response.data    
}