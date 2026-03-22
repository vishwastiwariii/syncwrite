import express from "express";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js"
import helmet from "helmet";
import cors from "cors";

const app = express()

app.use(cors({
  origin: "http://localhost:5173", // Vite default port
  credentials: true
}))

app.use(express.json({limit: "1mb"}))
app.use(helmet({
  crossOriginEmbedderPolicy: false // Better for local development with different ports
}))

app.use('/auth', authRoutes)
app.use('/documents', documentRoutes)

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

export default app