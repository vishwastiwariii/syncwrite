import { useEffect } from "react";
import { useState } from "react"
import { createContext } from "react"
import { postRequest } from "../services/apiHelper";
import { useContext } from "react";


const AuthContext = createContext()

export const AuthProvider = ( { children }) => {
    const [token, setToken] = useState(null); 
    const [loading, setLoading] = useState(true)

    // check for session 
    useEffect(()=>{
        const storedToken = localStorage.getItem("token")
        if(storedToken){
            setToken(storedToken)
        }
        setLoading(false)
    },[])


    const login = async (email, password) => {
        try { 
            const res = await postRequest('auth/login', {email, password})
            
            if (!res.success) {
                return {
                    success: false,
                    message: res.message || "Login Failed"
                }
            }

            const token = res.data.token
            
            localStorage.setItem("token", token); 
            setToken(token)

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
    }

    return (
        <AuthContext.Provider
        value={
        {
            token, 
            isAuthenticated: !!token, 
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

export const useAuth = () => {
    return useContext(AuthContext)
}