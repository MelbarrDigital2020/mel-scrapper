import { cn } from "./debounce.utils";

export default function SegmentedTabs({
  value,
  onChange,
}: {
  value: "single" | "bulk";
  onChange: (v: "single" | "bulk") => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => onChange("single")}
        className={cn(
          "rounded-xl px-4 py-2 text-sm font-medium transition",
          value === "single"
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800",
        )}
        type="button"
      >
        Single Lead Debounce
      </button>
      <button
        onClick={() => onChange("bulk")}
        className={cn(
          "rounded-xl px-4 py-2 text-sm font-medium transition",
          value === "bulk"
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800",
        )}
        type="button"
      >
        Bulk Email Debounce
      </button>
    </div>
  );
}
