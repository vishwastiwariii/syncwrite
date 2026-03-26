import { useState } from "react"
import { postRequest } from "../services/apiHelper";
import { AuthContext } from "./authContext";


/* ── JWT decode helper (no library needed) ── */
function parseJwtPayload(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

/* ── Hydrate from localStorage (sync, before first render) ── */
function getInitialToken() {
    return localStorage.getItem("token") || null;
}

function getInitialUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = parseJwtPayload(token);
    return payload?.userId || null;
}

export const AuthProvider = ( { children }) => {
    const [token, setToken] = useState(getInitialToken);
    const [userId, setUserId] = useState(getInitialUserId);


    const login = async (email, password) => {
        try { 
            const res = await postRequest('auth/login', {email, password})
            
            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Login Failed"
                }
            }

            const newToken = res.data.token
            
            localStorage.setItem("token", newToken); 
            setToken(newToken)
            const payload = parseJwtPayload(newToken);
            if (payload?.userId) setUserId(payload.userId);

            return {
                success: true
            }
        } catch(error){
            return {
                success: false, 
                message: error?.response?.data?.message || error?.message || "Login Failed"
            }
        }
    }


    const register = async (name, email, password) => {
        try{
            const res = await postRequest('auth/register', { name, email , password})
            
            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Signup Failed"
                }
            }

            return await login(email, password)
        } catch(error){
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || "Signup Failed"
            }
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUserId(null)
    }

    return (
        <AuthContext.Provider
        value={
        {
            token, 
            userId,
            isAuthenticated: !!token, 
            loading: false, 
            login, 
            register, 
            logout
        }
        }>
            {children}
        </AuthContext.Provider>
    )
}