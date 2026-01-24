import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import * as userService from "./user.service";

export const toggleTwoFA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const updated = await userService.toggleTwoFA(userId);

    return res.json({
      success: true,
      message: `2FA ${updated.two_fa_enabled ? "enabled" : "disabled"}`,
      user: updated, // includes two_fa_enabled
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to update 2FA",
    });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { current_password, new_password, confirm_password } = req.body || {};

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "current_password, new_password, and confirm_password are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Optional: basic rule
    if (String(new_password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    await userService.changePassword(userId, current_password, new_password);

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    // If service throws a known error, send 400
    const msg = err?.message || "Failed to change password";
    const isBadRequest =
      msg === "User not found" ||
      msg === "Current password is incorrect" ||
      msg === "New password must be different from current password";

    return res.status(isBadRequest ? 400 : 500).json({
      success: false,
      message: msg,
    });
  }
};

