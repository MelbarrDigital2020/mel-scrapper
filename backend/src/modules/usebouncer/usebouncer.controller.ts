import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import * as UseBouncerService from "./usebouncer.service";

export async function getCredits(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const data = await UseBouncerService.fetchCredits(userId);
    return res.json({ success: true, credits: data.credits });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Failed to fetch credits",
    });
  }
}

// 
export async function verifySingle(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { email, timeout } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "email is required" });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || (req as any).ip;

    const data = await UseBouncerService.verifySingleEmail({
      userId,
      email,
      timeout: typeof timeout === "number" ? timeout : 10,
      ip,
    });

    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Single verify failed",
    });
  }
}

// 
export async function createBatch(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    /**
     * You have 2 input modes:
     * 1) JSON array: { emails: ["a@a.com", "b@b.com"], callback?: string }
     * 2) Raw CSV upload (later with multer). For now do JSON first (Postman-friendly).
     */
    const { emails, callback, fileName } = req.body || {};

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "emails array is required",
      });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || (req as any).ip;

    const data = await UseBouncerService.createBatchJob({
      userId,
      emails,
      callback: typeof callback === "string" ? callback : undefined,
      fileName: typeof fileName === "string" ? fileName : undefined,
      ip,
    });

    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Batch create failed",
    });
  }
}

export async function getBatchStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });

    const data = await UseBouncerService.getBatchStatus({
      userId,
      jobId,
    });

    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Batch status failed",
    });
  }
}

export async function downloadBatchResults(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { jobId } = req.params;
    const download = typeof req.query.download === "string" ? req.query.download : "all";

    const allowed = new Set(["all", "deliverable", "risky", "undeliverable", "unknown"]);
    if (!allowed.has(download)) {
      return res.status(400).json({
        success: false,
        message: "download must be one of: all, deliverable, risky, undeliverable, unknown",
      });
    }

    const data = await UseBouncerService.downloadBatchResults({
      userId,
      jobId,
      download: download as any,
    });

    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Batch download failed",
    });
  }
}

export async function getSingleHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 5);
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const data = await EmailVerificationService.getSingleHistory({
      userId,
      page,
      pageSize,
      search,
    });

    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(err?.status || 500).json({
      success: false,
      message: err?.message || "Single history failed",
    });
  }
}
