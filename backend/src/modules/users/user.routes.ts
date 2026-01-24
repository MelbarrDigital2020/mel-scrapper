import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { toggleTwoFA, changePassword  } from "./user.controller";

const router = Router();


router.patch("/me/2fa", authMiddleware, toggleTwoFA);
router.patch("/me/password", authMiddleware, changePassword);

export default router;
