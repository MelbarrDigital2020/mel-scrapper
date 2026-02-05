import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/user.routes";
import syncRoutes from "./modules/sync_data/sync.routes";
import companiesRoutes from "./modules/companies/companies.routes";
import contactsRoutes from "./modules/contacts/contacts.routes";
import exportsRoutes from "./modules/export/export.routes";
import exportHistoryRoutes from "./modules/export_history/export_history.routes";
import useBouncerRoutes from "./modules/usebouncer/usebouncer.routes";
import IntentBaseController from "./modules/intent_base/intentbase.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true,               // 🔥 REQUIRED
  })
);

app.use(cookieParser()); // 🔥 REQUIRED
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/export", exportsRoutes);
app.use("/api/export-history", exportHistoryRoutes);
app.use("/api/usebouncer", useBouncerRoutes);
app.use("/api/intent-base", IntentBaseController);

export default app;