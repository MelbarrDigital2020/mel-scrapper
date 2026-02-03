import React, { useState } from "react";
import { FiTarget } from "react-icons/fi";
import SegmentedTabs from "./components/SegmentedTabs";
import SingleIntentPanel from "./components/SingleIntentBasePanel";
import BulkIntentPanel from "./components/BulkIntentPanel";

export default function IntentBasePage() {
  const [tab, setTab] = useState<"single" | "bulk">("single");

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              <FiTarget />
              Intent Engine • Signals
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              Intent Base
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Check a single email for intent signals or run an intent scan in
              bulk. Keep targeting sharp and outreach relevant.
            </p>
          </div>

          <SegmentedTabs value={tab} onChange={setTab} />
        </div>

        {/* Panels */}
        <div className="mt-6">
          {tab === "single" ? <SingleIntentPanel /> : <BulkIntentPanel />}
        </div>
      </div>
    </div>
  );
}
