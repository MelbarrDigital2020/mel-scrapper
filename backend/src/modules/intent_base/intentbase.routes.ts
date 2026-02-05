// src/modules/intent_base/intentbase.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { IntentBaseController } from "./intentbase.controller";

const router = Router();

// GET /api/intent-base/single?email=name@domain.com
router.get("/single", authMiddleware, IntentBaseController.single);

export default router;
