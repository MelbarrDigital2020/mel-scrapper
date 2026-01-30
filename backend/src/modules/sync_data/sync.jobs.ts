import { randomUUID } from "crypto";
import type { SyncJob, SyncOptions, SyncTask } from "./sync.types";
import { runSyncTask } from "./sync.service";
import {
  insertJob,
  insertTasks,
  setJobRunning,
  updateJobProgress,
  updateTask,
  completeJob,
  failJob,
  getJobWithTasks,
} from "./sync.repo";

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

function startWorkerLoop() {
  if (isWorkerBusy) return;
  isWorkerBusy = true;

  const loop = async () => {
    const jobId = queue.shift();
    if (!jobId) {
      isWorkerBusy = false;
      return;
    }

    try {
      await setJobRunning(jobId);

      await runSyncTask(
        // options are read from DB to avoid mismatch
        (await getJobWithTasks(jobId))!.options,
        {
          onOverallProgress: async (p) => {
            await updateJobProgress(jobId, p);
          },

          onTaskStart: async (key) => {
            await updateTask(jobId, key, {
              status: "running",
              progress: 1,
              startedAt: new Date().toISOString(),
            });
          },

          onTaskProgress: async (key, p) => {
            await updateTask(jobId, key, { progress: p });
          },

          onTaskDone: async (key, taskResult) => {
            await updateTask(jobId, key, {
              status: "completed",
              progress: 100,
              finishedAt: new Date().toISOString(),
              result: taskResult,
            });
          },
        }
      ).then(async (result) => {
        await completeJob(jobId, result);
      });
    } catch (err: any) {
      const msg = err?.message || "Unknown error";

      // mark running task failed (best effort)
      const job = await getJobWithTasks(jobId);
      const runningTask = job?.tasks?.find((t) => t.status === "running");
      if (runningTask) {
        await updateTask(jobId, runningTask.key, {
          status: "failed",
          error: msg,
          finishedAt: new Date().toISOString(),
        });
      }

      await failJob(jobId, msg);
    }

    loop();
  };

  loop();
}

export async function createSyncJob(userId: string, options: SyncOptions): Promise<SyncJob> {
  const id = randomUUID();
  const tasks = makeTasks(options);

  await insertJob(userId, id, options);
  await insertTasks(id, tasks);

  queue.push(id);
  setImmediate(() => startWorkerLoop());

  // return full job from DB
  const job = await getJobWithTasks(id);
  if (!job) throw new Error("Failed to create job");
  return job;
}

export async function getSyncJob(id: string): Promise<SyncJob | null> {
  return await getJobWithTasks(id);
}
