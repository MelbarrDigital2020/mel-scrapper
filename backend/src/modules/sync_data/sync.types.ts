export type SyncOptions = {
  companies?: boolean;
  contacts?: boolean;
};

export type SyncJobStatus = "queued" | "running" | "completed" | "failed";

export type SyncTaskKey = keyof SyncOptions;

export type SyncTaskStatus = "queued" | "running" | "completed" | "failed";

export type SyncTask = {
  key: SyncTaskKey;
  label: string;
  status: SyncTaskStatus;
  progress: number; // 0-100 (task-level)
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  result?: any;
};

export type SyncJob = {
  id: string;
  status: SyncJobStatus;

  // overall
  progress: number; // 0-100

  createdAt: string;
  startedAt?: string;
  finishedAt?: string;

  error?: string;

  // ✅ NEW: step-by-step tracking
  tasks: SyncTask[];

  result?: {
    companiesWritten?: number;
    jobTitlesWritten?: number;
    outputFiles?: Record<string, string>;
  };


  options: SyncOptions;
};
