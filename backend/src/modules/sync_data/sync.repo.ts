import { randomUUID } from "crypto";
import pool from "../../config/db";
import type { SyncJob, SyncJobStatus, SyncOptions, SyncTask, SyncTaskKey, SyncTaskStatus } from "./sync.types";

function rowToJob(row: any): SyncJob {
  return {
    id: row.id,
    status: row.status,
    progress: row.progress,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    startedAt: row.started_at ? (row.started_at.toISOString?.() ?? row.started_at) : undefined,
    finishedAt: row.finished_at ? (row.finished_at.toISOString?.() ?? row.finished_at) : undefined,
    error: row.error ?? undefined,
    options: row.options ?? {},
    tasks: [],
    result: row.result ?? undefined,
  };
}

function rowToTask(row: any): SyncTask {
  return {
    key: row.key,
    label: row.label,
    status: row.status,
    progress: row.progress,
    startedAt: row.started_at ? (row.started_at.toISOString?.() ?? row.started_at) : undefined,
    finishedAt: row.finished_at ? (row.finished_at.toISOString?.() ?? row.finished_at) : undefined,
    error: row.error ?? undefined,
    result: row.result ?? undefined,
  };
}

export async function insertJob(userId: string, id: string, options: SyncOptions): Promise<void> {
  await pool.query(
    `
    INSERT INTO sync_jobs (id, user_id, status, progress, options)
    VALUES ($1, $2, 'queued', 0, $3::jsonb)
    `,
    [id, userId, JSON.stringify(options)]
  );
}

export async function insertTasks(jobId: string, tasks: SyncTask[]): Promise<void> {
  for (const t of tasks) {
    await pool.query(
      `
      INSERT INTO sync_tasks (id, job_id, key, label, status, progress)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (job_id, key) DO NOTHING
      `,
      [randomUUID(), jobId, t.key, t.label, t.status, t.progress]
    );
  }
}

export async function setJobRunning(jobId: string): Promise<void> {
  await pool.query(
    `
    UPDATE sync_jobs
    SET status='running', started_at=NOW(), progress=GREATEST(progress, 1)
    WHERE id=$1
    `,
    [jobId]
  );
}

export async function updateJobProgress(jobId: string, progress: number): Promise<void> {
  await pool.query(
    `UPDATE sync_jobs SET progress=$2 WHERE id=$1`,
    [jobId, Math.max(0, Math.min(100, progress))]
  );
}

export async function completeJob(jobId: string, result: any): Promise<void> {
  await pool.query(
    `
    UPDATE sync_jobs
    SET status='completed', progress=100, finished_at=NOW(), result=$2::jsonb
    WHERE id=$1
    `,
    [jobId, JSON.stringify(result)]
  );
}

export async function failJob(jobId: string, error: string): Promise<void> {
  await pool.query(
    `
    UPDATE sync_jobs
    SET status='failed', progress=100, finished_at=NOW(), error=$2
    WHERE id=$1
    `,
    [jobId, error]
  );
}

export async function updateTask(
  jobId: string,
  key: SyncTaskKey,
  patch: Partial<{
    status: SyncTaskStatus;
    progress: number;
    startedAt: string;
    finishedAt: string;
    error: string;
    result: any;
  }>
): Promise<void> {
  const sets: string[] = [];
  const vals: any[] = [jobId, key];
  let i = 3;

  if (patch.status) {
    sets.push(`status=$${i++}`);
    vals.push(patch.status);
  }
  if (patch.progress !== undefined) {
    sets.push(`progress=$${i++}`);
    vals.push(Math.max(0, Math.min(100, patch.progress)));
  }
  if (patch.startedAt) {
    sets.push(`started_at=$${i++}::timestamptz`);
    vals.push(patch.startedAt);
  }
  if (patch.finishedAt) {
    sets.push(`finished_at=$${i++}::timestamptz`);
    vals.push(patch.finishedAt);
  }
  if (patch.error) {
    sets.push(`error=$${i++}`);
    vals.push(patch.error);
  }
  if (patch.result !== undefined) {
    sets.push(`result=$${i++}::jsonb`);
    vals.push(JSON.stringify(patch.result));
  }

  if (!sets.length) return;

  await pool.query(
    `
    UPDATE sync_tasks
    SET ${sets.join(", ")}
    WHERE job_id=$1 AND key=$2
    `,
    vals
  );
}

export async function getJobWithTasks(jobId: string): Promise<SyncJob | null> {
  const j = await pool.query(`SELECT * FROM sync_jobs WHERE id=$1`, [jobId]);
  if (!j.rows[0]) return null;

  const t = await pool.query(
    `SELECT * FROM sync_tasks WHERE job_id=$1 ORDER BY created_at ASC`,
    [jobId]
  );

  const job = rowToJob(j.rows[0]);
  job.tasks = t.rows.map(rowToTask);
  return job;
}

export async function listJobsByUser(
  userId: string,
  page: number,
  limit: number
): Promise<{ rows: SyncJob[]; total: number }> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM sync_jobs WHERE user_id=$1`,
    [userId]
  );
  const total = totalRes.rows[0]?.total ?? 0;

  const jobsRes = await pool.query(
    `
    SELECT * FROM sync_jobs
    WHERE user_id=$1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, safeLimit, offset]
  );

  // include tasks for each job (simple approach; fine for small history pages)
  const jobs: SyncJob[] = [];
  for (const row of jobsRes.rows) {
    const job = rowToJob(row);
    const tasksRes = await pool.query(
      `SELECT * FROM sync_tasks WHERE job_id=$1 ORDER BY created_at ASC`,
      [job.id]
    );
    job.tasks = tasksRes.rows.map(rowToTask);
    jobs.push(job);
  }

  return { rows: jobs, total };
}
