// src/modules/intent_base/intentbase.types.ts

export type IntentLevel = "high" | "medium" | "low" | "unknown";

export type SingleIntentResult = {
  email: string;
  found: boolean;

  companyName?: string;
  companyDomain?: string;
  industry?: string;

  intentSignal?: string | null; // raw intent_signal from DB (string)
  intentLevel?: IntentLevel;
  intentScore?: number; // 0-100 (derived)
  reason?: string;

  checkedAt: string; // ISO
};
