export type IntentLevel = "high" | "medium" | "low" | "unknown";
export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type SingleIntentResult = {
  email: string;
  found: boolean;

  companyName?: string;
  companyDomain?: string;
  industry?: string;

  intentLevel?: IntentLevel;
  intentScore?: number; // 0-100 optional
  reason?: string;

  checkedAt: string;
};

export type SingleIntentHistoryRow = {
  id: string;
  email: string;
  found: boolean;

  companyName?: string;
  companyDomain?: string;
  industry?: string;

  intentLevel?: IntentLevel;
  intentScore?: number;
  checkedAt: string;
};

export type BulkIntentJob = {
  id: string;
  fileName: string;
  uploadedAt: string;

  total: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;

  status: JobStatus;
};
