import express from "express";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js"
import helmet from "helmet";
import cors from "cors";
import { config } from "./config/env.js";
import logger from "./config/logger.js";

const app = express()

app.use(cors({
  origin: config.clientUrl,
  credentials: true
}))

app.use(express.json({limit: "1mb"}))
app.use(helmet())

app.use('/auth', authRoutes)
app.use('/documents', documentRoutes)

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

export default app