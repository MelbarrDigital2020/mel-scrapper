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
