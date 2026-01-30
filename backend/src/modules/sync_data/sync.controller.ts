import { Request, Response } from "express";
import { createSyncJob, getSyncJob } from "./sync.jobs";
import type { SyncOptions } from "./sync.types";
import { listJobsByUser } from "./sync.repo";

export const startSync = async (req: any, res: Response) => {
  try {
    const options = (req.body || {}) as SyncOptions;

    const hasAny = Boolean(options.companies) || Boolean(options.contacts);
    if (!hasAny) {
      return res.status(400).json({
        success: false,
        message: "No sync option selected. Example: { companies: true, contacts: true }",
      });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const job = await createSyncJob(userId, options);

    return res.json({
      success: true,
      message: "Sync started",
      jobId: job.id,
      job,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to start sync",
    });
  }
};

export const getSyncStatus = async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = await getSyncJob(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  return res.json({ success: true, job });
};

// ✅ NEW: history endpoint
export const getSyncHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await listJobsByUser(userId, page, limit);

    return res.json({
      success: true,
      page,
      limit,
      total: data.total,
      jobs: data.rows,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load history",
    });
  }
};
