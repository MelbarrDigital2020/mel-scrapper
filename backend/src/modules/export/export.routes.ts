import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { exportController } from "./export.controller";

const router = Router();

router.post("/", authMiddleware, exportController.exportEntity);
router.get("/jobs", authMiddleware, exportController.listJobs);
router.get("/jobs/:id", authMiddleware, exportController.getJob);

export default router;
