import { useState, useEffect } from "react"
import { getRequest, postRequest } from "../services/apiHelper";
import { AuthContext } from "./authContext";


export const AuthProvider = ( { children }) => {
    const [user, setUser] = useState(null)         // { id, name, email }
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)   // true until we've asked the server who we are


    /* ── On load, ask the server if we already have a valid cookie ── */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await getRequest('auth/me')
                if (res.success) {
                    setUser(res.data.user)
                    setUserId(res.data.user.id)
                }
            } catch {
                // No valid cookie -> not logged in. Nothing to do.
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])


    const login = async (email, password) => {
        try {
            const res = await postRequest('auth/login', {email, password})

            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Login Failed"
                }
            }

            // The token now lives in an httpOnly cookie set by the server.
            // We keep the user profile the server sends in the body (id/name/email).
            setUser(res.data.user)
            setUserId(res.data.user.id)

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

    const logout = async () => {
        // The cookie is httpOnly, so JS can't delete it -> ask the server to clear it.
        try {
            await postRequest('auth/logout')
        } catch {
            // Even if the request fails, drop the local state.
        }
        setUser(null)
        setUserId(null)
    }

    return (
        <AuthContext.Provider
        value={
        {
            user,
            userId,
            isAuthenticated: !!userId,
            loading,
            login,
            register,
            logout
        }
        }>
            {children}
        </AuthContext.Provider>
    )
}
