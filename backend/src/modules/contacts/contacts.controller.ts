import { Request, Response } from "express";
import { ContactsService } from "./contacts.service";

export class ContactsController {
  static async list(req: Request, res: Response) {
    try {
      const result = await ContactsService.list(req.query);

      return res.json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (err: any) {
      console.error("ContactsController.list error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch contacts",
      });
    }
  }
}
