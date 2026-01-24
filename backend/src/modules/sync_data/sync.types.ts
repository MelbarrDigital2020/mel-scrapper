export type SyncOptions = {
  companies?: boolean;
  // later you can add:
  // contacts?: boolean;
};

export type SyncJobStatus = "queued" | "running" | "completed" | "failed";

export type SyncJob = {
  id: string;
  status: SyncJobStatus;
  progress: number; // 0 - 100
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  result?: {
    companiesWritten?: number;
    outputFile?: string;
  };
  options: SyncOptions;
};
