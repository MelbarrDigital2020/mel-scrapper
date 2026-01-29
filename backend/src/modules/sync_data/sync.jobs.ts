import { randomUUID } from "crypto";
import type { SyncJob, SyncOptions, SyncTask } from "./sync.types";
import { runSyncTask } from "./sync.service";

const jobs = new Map<string, SyncJob>();

let isWorkerBusy = false;
const queue: string[] = [];

function makeTasks(options: SyncOptions): SyncTask[] {
  const tasks: SyncTask[] = [];

  if (options.companies) {
    tasks.push({
      key: "companies",
      label: "Companies",
      status: "queued",
      progress: 0,
    });
  }

  if (options.contacts) {
    tasks.push({
      key: "contacts",
      label: "Job Titles",
      status: "queued",
      progress: 0,
    });
  }

  return tasks;
}

function updateTask(job: SyncJob, key: "companies" | "contacts", patch: Partial<SyncTask>) {
  const idx = job.tasks.findIndex((t) => t.key === key);
  if (idx === -1) return;
  job.tasks[idx] = { ...job.tasks[idx], ...patch };
}

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
    job.progress = 1;

    try {
      const result = await runSyncTask(job.options, {
        onOverallProgress: (p) => {
          const j = jobs.get(jobId);
          if (j) j.progress = Math.max(0, Math.min(100, p));
        },

        onTaskStart: (key) => {
          const j = jobs.get(jobId);
          if (!j) return;
          updateTask(j, key, {
            status: "running",
            progress: 1,
            startedAt: new Date().toISOString(),
          });
        },

        onTaskProgress: (key, p) => {
          const j = jobs.get(jobId);
          if (!j) return;
          updateTask(j, key, {
            progress: Math.max(0, Math.min(100, p)),
          });
        },

        onTaskDone: (key, taskResult) => {
          const j = jobs.get(jobId);
          if (!j) return;
          updateTask(j, key, {
            status: "completed",
            progress: 100,
            finishedAt: new Date().toISOString(),
            result: taskResult,
          });
        },
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
        const msg = err?.message || "Unknown error";

        // ✅ mark currently running task as failed
        const runningTask = j.tasks.find((t) => t.status === "running");
        if (runningTask) {
          updateTask(j, runningTask.key as any, {
            status: "failed",
            error: msg,
            finishedAt: new Date().toISOString(),
          });
        }

        j.status = "failed";
        j.finishedAt = new Date().toISOString();
        j.error = msg;
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
    startedAt: undefined,
    finishedAt: undefined,
    error: undefined,
    options,
    tasks: makeTasks(options), // ✅ NEW
  };

  jobs.set(id, job);
  queue.push(id);

  setImmediate(() => startWorkerLoop());
  return job;
}

export function getSyncJob(id: string): SyncJob | null {
  return jobs.get(id) || null;
}
