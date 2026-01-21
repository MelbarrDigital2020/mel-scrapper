import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true,               // 🔥 REQUIRED
  })
);

app.use(cookieParser()); // 🔥 REQUIRED
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
