import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { ContactsController } from "./contacts.controller";

const router = Router();

router.get("/", authMiddleware, ContactsController.list);

export default router;
