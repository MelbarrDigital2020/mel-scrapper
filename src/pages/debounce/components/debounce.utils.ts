import type { DebounceStatus, JobStatus } from "./debounce.types";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPercent(part: number, total: number) {
  if (!total) return "0%";
  const v = Math.round((part / total) * 100);
  return `${v}%`;
}

export function statusMeta(status: DebounceStatus) {
  switch (status) {
    case "deliverable":
      return {
        label: "Deliverable",
        icon: FiCheckCircle,
        chip:
          "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50",
      };
    case "undeliverable":
      return {
        label: "Undeliverable",
        icon: FiXCircle,
        chip:
          "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/50",
      };
    case "risky":
      return {
        label: "Risky",
        icon: FiAlertTriangle,
        chip:
          "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/50",
      };
  }
}

export function jobMeta(status: JobStatus) {
  switch (status) {
    case "queued":
      return {
        label: "Queued",
        icon: FiClock,
        chip:
          "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-900/50",
      };
    case "processing":
      return {
        label: "Processing",
        icon: FiRefreshCw,
        chip:
          "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900/50",
      };
    case "completed":
      return {
        label: "Completed",
        icon: FiCheckCircle,
        chip:
          "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900/50",
      };
    case "failed":
      return {
        label: "Failed",
        icon: FiXCircle,
        chip:
          "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900/50",
      };
  }
}
