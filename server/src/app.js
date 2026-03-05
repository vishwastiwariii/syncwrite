import express from "express";
import authRoutes from "./routes/auth.routes.js";
import helmet from "helmet";

const app = express()

app.use(express.json({limit: "1mb"}))
app.use(helmet())

app.use('/auth', authRoutes)

export default app