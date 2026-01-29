import { Request, Response } from "express";
import pool from "../../config/db";
import { exportService } from "./export.service";

type AuthedReq = Request & { user?: { userId: string; email: string } };

export const exportController = {
  // POST /api/export
  exportEntity: async (req: AuthedReq, res: Response) => {
    try {
      const { entity, mode, format, headers, ids, query } = req.body;

      const file = await exportService.exportEntity({
        entity,
        mode,
        format,
        headers,
        ids,
        query,
        userId: req.user?.userId,
      });

      // ✅ expose job id so frontend can track it
      res.setHeader("X-Export-Job-Id", file.jobId);

      res.setHeader("Content-Type", file.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.filename}"`
      );

      // ✅ mark delivered when response finishes
      res.on("finish", () => {
        file.markDelivered?.().catch(() => {});
      });

      return res.status(200).send(file.buffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      console.error("EXPORT ERROR:", err);
      return res.status(500).json({ success: false, message: msg });
    }
  },

  // GET /api/export/jobs
  listJobs: async (req: AuthedReq, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await pool.query(
        `
        SELECT
          id, entity, mode, format, status,
          row_count, file_name, file_size_bytes,
          error_message,
          created_at, started_at, finished_at, delivered_at
        FROM public.export_jobs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [userId]
      );

      return res.status(200).json({ success: true, jobs: result.rows });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load export jobs";
      console.error("LIST JOBS ERROR:", err);
      return res.status(500).json({ success: false, message: msg });
    }
  },

  // GET /api/export/jobs/:id
  getJob: async (req: AuthedReq, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          id, user_id, entity, mode, format, status,
          headers, ids, query,
          row_count, file_name, file_size_bytes,
          error_message,
          created_at, started_at, finished_at, delivered_at
        FROM public.export_jobs
        WHERE id = $1 AND user_id = $2
        LIMIT 1
        `,
        [id, userId]
      );

      const job = result.rows[0];
      if (!job) return res.status(404).json({ success: false, message: "Job not found" });

      return res.status(200).json({ success: true, job });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load export job";
      console.error("GET JOB ERROR:", err);
      return res.status(500).json({ success: false, message: msg });
    }
  },
};
