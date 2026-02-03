import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as UseBouncerController from "./usebouncer.controller";

const router = Router();

// Get creditss
router.get("/credits", authMiddleware, UseBouncerController.getCredits);

// single verify
router.post("/verify/single", authMiddleware, UseBouncerController.verifySingle);

// batch create
router.post("/verify/batch/create", authMiddleware, UseBouncerController.createBatch);

// Get Batch Status
router.get("/verify/batch/:jobId/status", authMiddleware, UseBouncerController.getBatchStatus);

// Download Batch Result
router.get("/verify/batch/:jobId/download",authMiddleware,UseBouncerController.downloadBatchResults);

export default router;