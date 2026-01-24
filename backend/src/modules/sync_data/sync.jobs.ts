import { randomUUID } from "crypto";
import type { SyncJob, SyncOptions } from "./sync.types";
import { runSyncTask } from "./sync.service";

const jobs = new Map<string, SyncJob>();

// If you want: limit concurrency to 1 (safe for file writes)
let isWorkerBusy = false;
const queue: string[] = [];

function startWorkerLoop() {
  if (isWorkerBusy) return;
  isWorkerBusy = true;

  const loop = async () => {
    const jobId = queue.shift();
    if (!jobId) {
      isWorkerBusy = false;
      return;
    }

    const job = jobs.get(jobId);
    if (!job) return loop();

    job.status = "running";
    job.startedAt = new Date().toISOString();
    job.progress = 5;

    try {
      const result = await runSyncTask(job.options, (p) => {
        const j = jobs.get(jobId);
        if (j) j.progress = Math.max(0, Math.min(100, p));
      });

      const j = jobs.get(jobId);
      if (j) {
        j.status = "completed";
        j.progress = 100;
        j.finishedAt = new Date().toISOString();
        j.result = result;
      }
    } catch (err: any) {
      const j = jobs.get(jobId);
      if (j) {
        j.status = "failed";
        j.finishedAt = new Date().toISOString();
        j.error = err?.message || "Unknown error";
        j.progress = 100;
      }
    }

    loop();
  };

  loop();
}

export function createSyncJob(options: SyncOptions): SyncJob {
  const id = randomUUID();

  const job: SyncJob = {
    id,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
    options,
  };

  jobs.set(id, job);
  queue.push(id);

  // Run async in background
  setImmediate(() => startWorkerLoop());

  return job;
}

export function getSyncJob(id: string): SyncJob | null {
  return jobs.get(id) || null;
}
