import { Request, Response } from "express";
import { exportService, markJobDelivered } from "./export.service";

export const exportController = {
  // POST /api/export  -> returns jobId (202)
  exportEntity: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId as string;
      const { entity, mode, format, headers, ids, query } = req.body;

      const out = await exportService.createJob({
        entity,
        mode,
        format,
        headers,
        ids,
        query,
        userId,
      });

      return res.status(202).json({ success: true, jobId: out.jobId });
    } catch (err: any) {
      console.error("EXPORT CREATE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err?.message || "Export failed",
      });
    }
  },

  // GET /api/export/jobs
  listJobs: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId as string;
      const jobs = await exportService.listJobs(userId);
      return res.json({ success: true, jobs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || "Failed" });
    }
  },

  // GET /api/export/jobs/:id
  getJob: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId as string;
      const jobId = req.params.id;

      const job = await exportService.getJob(userId, jobId);
      if (!job) return res.status(404).json({ success: false, message: "Not found" });

      return res.json({ success: true, job });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || "Failed" });
    }
  },

  // GET /api/export/jobs/:id/download
  downloadJob: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId as string;
      const jobId = req.params.id;

      const job = await exportService.getJob(userId, jobId);
      if (!job) return res.status(404).json({ success: false, message: "Not found" });

      if (job.status !== "completed" || !job.file_path) {
        return res.status(409).json({ success: false, message: "File not ready" });
      }

      await markJobDelivered(jobId);

      return res.download(job.file_path, job.file_name || `export_${jobId}`);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || "Download failed" });
    }
  },
};
