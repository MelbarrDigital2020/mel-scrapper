import React, { useState } from "react";
import { FiShield } from "react-icons/fi";
import SegmentedTabs from "./components/SegmentedTabs";
import SingleDebouncePanel from "./components/SingleDebouncePanel";
import BulkDebouncePanel from "./components/BulkDebouncePanel";

export default function EmailDebouncePage() {
  const [tab, setTab] = useState<"single" | "bulk">("single");

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              <FiShield />
              Email Quality • Debounce
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              Email Debounce
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Validate emails instantly or in bulk. Keep deliverability high and
              bounce rates low.
            </p>
          </div>

          <SegmentedTabs value={tab} onChange={setTab} />
        </div>

        {/* Panels */}
        <div className="mt-6">
          {tab === "single" ? <SingleDebouncePanel /> : <BulkDebouncePanel />}
        </div>
      </div>
    </div>
  );
}
