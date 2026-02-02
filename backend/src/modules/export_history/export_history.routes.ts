import { Router } from "express";
import {
  listExportHistory,
  getDownloadLink,
  downloadByToken,
} from "./export_history.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// ✅ History list (protected)
router.get("/", authMiddleware, listExportHistory);

// ✅ Refresh token for a job id (protected)
router.get("/:id/download-link", authMiddleware, getDownloadLink);

// ✅ Download file by token (token itself is auth, so no middleware)
router.get("/download/:token", downloadByToken);

export default router;
