import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // 🔥 REQUIRED FOR COOKIES
  })
);

app.use(cookieParser()); // 🔥 REQUIRED
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
