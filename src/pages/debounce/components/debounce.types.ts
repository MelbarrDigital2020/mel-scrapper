export type DebounceStatus = "deliverable" | "undeliverable" | "risky";
export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type SingleResult = {
  email: string;
  status: DebounceStatus;
  reason: string;
  checkedAt: string;
};

export type BulkJob = {
  id: string;
  fileName: string;
  uploadedAt: string;
  total: number;
  deliverable: number;
  risky: number;
  undeliverable: number;
  status: JobStatus;
};

export type SingleDebounceHistory = {
  id: string;
  email: string;
  status: DebounceStatus;
  reason: string;
  checkedAt: string;
};
