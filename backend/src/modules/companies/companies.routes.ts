import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { searchCompaniesController } from "./companies.controller";

const router = Router();

// POST is better because filters are arrays
router.post("/search", authMiddleware, searchCompaniesController);

export default router;
