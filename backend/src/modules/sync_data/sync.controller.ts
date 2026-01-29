import { Request, Response } from "express";
import { createSyncJob, getSyncJob } from "./sync.jobs";
import type { SyncOptions } from "./sync.types";

export const startSync = async (req: Request, res: Response) => {
  try {
    const options = (req.body || {}) as SyncOptions;

    // ✅ validate: at least one selected
    const hasAny =
      Boolean(options.companies) || Boolean(options.contacts);

    if (!hasAny) {
      return res.status(400).json({
        success: false,
        message:
          "No sync option selected. Example: { companies: true, contacts: true }",
      });
    }

    const job = createSyncJob(options);

    return res.json({
      success: true,
      message: "Sync started",
      jobId: job.id,
      status: job.status,
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

  const job = getSyncJob(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  return res.json({
    success: true,
    job,
  });
};
