import { Router } from "express";
import { startSync, getSyncStatus } from "./sync.controller";
import { authMiddleware } from "../../middlewares/auth.middleware"; // adjust path

const router = Router();

// Start sync (background)
router.post("/start", authMiddleware, startSync);

// Check status
router.get("/status/:jobId", authMiddleware, getSyncStatus);

export default router;
