import { Router } from "express";
import { startSync, getSyncStatus, getSyncHistory } from "./sync.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/start", authMiddleware, startSync);
router.get("/status/:jobId", authMiddleware, getSyncStatus);

// ✅ NEW
router.get("/history", authMiddleware, getSyncHistory);

export default router;
