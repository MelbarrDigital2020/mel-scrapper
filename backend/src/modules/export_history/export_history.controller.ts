import type { Request, Response } from "express";
import {
  listJobs,
  createOrRefreshDownloadToken,
  getJobByValidToken,
} from "./export_history.service";

function getUserId(req: Request): string | null {
  const anyReq = req as any;

  // ✅ matches YOUR authMiddleware: req.user = { userId, email }
  const id =
    anyReq.user?.userId ||
    anyReq.userId ||
    anyReq.user?.id ||
    anyReq.user?.user_id ||
    null;

  return id ? String(id) : null;
}

export async function listExportHistory(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });

    const entity = String(req.query.entity || "all");
    const search = String(req.query.search || "");
    const sortKey = String(req.query.sortKey || "createdAt");
    const sortDir = String(req.query.sortDir || "desc");
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 10)));

    const result = await listJobs({
      userId,
      entity,
      search,
      sortKey,
      sortDir,
      page,
      pageSize,
      baseUrl: `${req.protocol}://${req.get("host")}`,
    });

    return res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("listExportHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getDownloadLink(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });

    const id = req.params.id;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const link = await createOrRefreshDownloadToken({
      userId,
      jobId: id,
      baseUrl,
    });

    return res.json({ success: true, downloadUrl: link });
  } catch (err: any) {
    const msg = err?.message || "Server error";
    const code =
      msg === "NOT_FOUND" ? 404 :
      msg === "FORBIDDEN" ? 403 :
      msg === "NOT_READY" ? 409 :
      500;

    if (code === 500) console.error("getDownloadLink error:", err);
    return res.status(code).json({ success: false, message: msg });
  }
}

export async function downloadByToken(req: Request, res: Response) {
  try {
    const token = req.params.token;

    const job = await getJobByValidToken(token);
    if (!job) return res.status(404).send("Invalid or expired download link.");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${job.file_name || "export"}"`
    );

    const isCsv = (job.format || "").toLowerCase() === "csv";
    res.setHeader(
      "Content-Type",
      isCsv
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const fs = await import("fs");
    const stream = fs.createReadStream(job.file_path);
    stream.on("error", () => res.status(404).send("File not found on server."));
    stream.pipe(res);
  } catch (err: any) {
    console.error("downloadByToken error:", err);
    return res.status(500).send("Server error");
  }
}
