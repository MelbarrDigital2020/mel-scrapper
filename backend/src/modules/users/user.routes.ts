import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { toggleTwoFA } from "./user.controller";

const router = Router();


router.patch("/me/2fa", authMiddleware, toggleTwoFA);

export default router;
