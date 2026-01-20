import { Router } from "express";
import { registerStart, registerVerifyOtp, registerComplete, login, loginVerifyOtp, loginResendOtp} from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { registerResendOtp } from "./auth.controller";

const router = Router();


router.post("/register/start", registerStart);
router.post("/register/verify-otp", registerVerifyOtp);
router.post("/register/complete", registerComplete);
router.post("/register/resend-otp", registerResendOtp);
router.post("/login", login);
router.post("/login/verify-otp", loginVerifyOtp);
router.post("/login/resend-otp", loginResendOtp);

// Logout Api
router.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: (req as any).user
  });
});


export default router;
