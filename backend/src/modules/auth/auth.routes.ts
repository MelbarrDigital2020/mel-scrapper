import { Router } from "express";
import { registerStart, registerVerifyOtp, registerComplete, login, loginVerifyOtp, loginResendOtp} from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { registerResendOtp } from "./auth.controller";
import pool from "../../config/db";

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

// Test me
router.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        first_name,
        last_name,
        avatar_url
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid session",
    });
  }
});


export default router;
