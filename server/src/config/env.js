import dotenv from "dotenv";
dotenv.config()

const required = ['MONGO_URL', 'PORT', 'JWT_SECRET']


for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env variable: ${key}`)
    }
}


export const config = {
    db: process.env.MONGO_URL,
    port: process.env.PORT,
    jwtsecret: process.env.JWT_SECRET
}