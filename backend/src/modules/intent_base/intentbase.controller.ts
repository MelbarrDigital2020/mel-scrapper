// src/modules/intent_base/intentbase.controller.ts
import { Request, Response } from "express";
import { IntentBaseService } from "./intentbase.service";

export class IntentBaseController {
  static async single(req: Request, res: Response) {
    try {
      const email = String(req.query.email || "");
      const data = await IntentBaseService.singleByEmail(email);

      return res.json({ success: true, data });
    } catch (err) {
      console.error("IntentBaseController.single error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to lookup intent by email",
      });
    }
  }
}
