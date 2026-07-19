import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,   // send the httpOnly auth cookie on every request
})

export default api
