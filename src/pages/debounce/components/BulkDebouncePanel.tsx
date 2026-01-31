import { useMemo, useRef, useState } from "react";
import {
  FiUpload,
  FiRefreshCw,
  FiSearch,
  FiInfo,
  FiMail,
  FiTrash2,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type { BulkJob, JobStatus } from "./debounce.types";
import { cn, jobMeta } from "./debounce.utils";
import { DonutCard, Pager } from "./debounce.ui";

export default function BulkDebouncePanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [jobs, setJobs] = useState<BulkJob[]>(() => {
    const base: BulkJob[] = Array.from({ length: 27 }).map((_, i) => {
      const total = 500 + Math.floor(Math.random() * 2500);
      const deliverable = Math.floor(total * (0.55 + Math.random() * 0.25));
      const risky = Math.floor(total * (0.05 + Math.random() * 0.15));
      const undeliverable = Math.max(0, total - deliverable - risky);
      const status: JobStatus[] = [
        "completed",
        "completed",
        "processing",
        "queued",
        "failed",
      ];
      return {
        id: `JOB-${1000 + i}`,
        fileName: `emails_${i + 1}.csv`,
        uploadedAt: new Date(Date.now() - i * 86400000).toISOString(),
        total,
        deliverable,
        risky,
        undeliverable,
        status: status[Math.floor(Math.random() * status.length)],
      };
    });
    return base;
  });

  const bulkCounts = useMemo(() => {
    const latest = jobs[0];
    if (!latest) return { deliverable: 0, risky: 0, undeliverable: 0 };
    return {
      deliverable: latest.deliverable,
      risky: latest.risky,
      undeliverable: latest.undeliverable,
    };
  }, [jobs]);

  const [historySearch, setHistorySearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const filteredJobs = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.fileName.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q),
    );
  }, [jobs, historySearch]);

  const pagedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page]);

  const trendData = useMemo(() => {
    const slice = jobs.slice(0, 10).slice().reverse();
    return slice.map((j, idx) => ({
      name: `#${idx + 1}`,
      deliverable: j.deliverable,
      risky: j.risky,
      undeliverable: j.undeliverable,
      total: j.total,
    }));
  }, [jobs]);

  const runBulkDebounce = async () => {
    if (!bulkFile) return;
    setBulkLoading(true);

    // 🔁 Replace with real upload + job creation
    await new Promise((r) => setTimeout(r, 800));
    const total = 1000 + Math.floor(Math.random() * 6000);
    const deliverable = Math.floor(total * (0.55 + Math.random() * 0.25));
    const risky = Math.floor(total * (0.05 + Math.random() * 0.15));
    const undeliverable = Math.max(0, total - deliverable - risky);

    const newJob: BulkJob = {
      id: `JOB-${Math.floor(10000 + Math.random() * 89999)}`,
      fileName: bulkFile.name,
      uploadedAt: new Date().toISOString(),
      total,
      deliverable,
      risky,
      undeliverable,
      status: "processing",
    };

    setJobs((prev) => [newJob, ...prev]);
    setBulkFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    await new Promise((r) => setTimeout(r, 900));
    setJobs((prev) =>
      prev.map((j) => (j.id === newJob.id ? { ...j, status: "completed" } : j)),
    );

    setBulkLoading(false);
  };

  const removeJob = (id: string) =>
    setJobs((prev) => prev.filter((j) => j.id !== id));

  const downloadJob = (job: BulkJob) => {
    // 🔁 Replace with a real download link
    alert(`Download result for ${job.fileName} (${job.id})`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Bulk Email Debounce</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload a CSV file, run validation, then download deliverability
                results.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:text-gray-200 dark:ring-gray-800">
              <FiUpload /> CSV workflow
            </div>
          </div>

          {/* Upload */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div
                className={cn(
                  "group rounded-2xl border border-dashed p-5 transition",
                  "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950/30 dark:hover:bg-gray-950/50",
                )}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <FiUpload className="text-gray-800 dark:text-gray-100" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      Upload CSV
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      Drag & drop (optional) or click to select. Make sure an{" "}
                      <b>email</b> column exists.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800">
                      <FiMail /> Accepted: .csv
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {bulkFile && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {bulkFile.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(bulkFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBulkFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                    type="button"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              )}
            </div>

            <div className="sm:col-span-1">
              <button
                onClick={runBulkDebounce}
                disabled={!bulkFile || bulkLoading}
                className={cn(
                  "mt-2 w-full rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                  "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-gray-900",
                  (!bulkFile || bulkLoading) && "opacity-50 cursor-not-allowed",
                )}
                type="button"
              >
                {bulkLoading ? "Uploading..." : "Run Bulk Debounce"}
              </button>

              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <FiInfo className="mt-0.5 shrink-0" />
                  <p>
                    Bulk jobs appear in history with downloadable results once
                    completed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Bulk History Trend
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recent jobs overview (deliverable vs risky vs undeliverable).
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800">
                <FiRefreshCw /> Auto-updates
              </div>
            </div>

            <div className="mt-4 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="deliverable"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="risky"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="undeliverable"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column donut */}
      <div className="lg:col-span-5">
        <DonutCard
          title="Latest Bulk Breakdown"
          subtitle="This donut reflects the most recent bulk job."
          deliverable={bulkCounts.deliverable}
          risky={bulkCounts.risky}
          undeliverable={bulkCounts.undeliverable}
        />
      </div>

      {/* History Table */}
      <div className="lg:col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Bulk Debounce History</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                View completed jobs, download results, and track processing
                runs.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <FiSearch className="text-gray-500" />
                <input
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by job id, filename, status..."
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50 sm:w-80"
                />
              </div>

              <button
                onClick={() => setJobs((prev) => [...prev])}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                type="button"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Uploaded</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Deliverable</th>
                    <th className="px-4 py-3 text-right">Risky</th>
                    <th className="px-4 py-3 text-right">Undeliverable</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {pagedJobs.map((j) => {
                    const meta = jobMeta(j.status);
                    const Icon = meta.icon;

                    return (
                      <tr
                        key={j.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-950/30"
                      >
                        <td className="px-4 py-3">
                          <span className="rounded-xl bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:text-gray-200 dark:ring-gray-800">
                            {j.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="truncate font-medium text-gray-900 dark:text-gray-50">
                            {j.fileName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                          {new Date(j.uploadedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {j.total}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {j.deliverable}
                        </td>
                        <td className="px-4 py-3 text-right">{j.risky}</td>
                        <td className="px-4 py-3 text-right">
                          {j.undeliverable}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1",
                              meta.chip,
                            )}
                          >
                            <Icon
                              className={cn(
                                j.status === "processing" && "animate-spin",
                              )}
                            />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadJob(j)}
                              disabled={j.status !== "completed"}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition",
                                "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900",
                                j.status !== "completed" &&
                                  "opacity-50 cursor-not-allowed",
                              )}
                              type="button"
                              title={
                                j.status === "completed"
                                  ? "Download result"
                                  : "Available when completed"
                              }
                            >
                              <FiDownload /> Download
                            </button>

                            <button
                              onClick={() => removeJob(j.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                              type="button"
                              title="Remove from history"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!pagedJobs.length && (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-300"
                        colSpan={9}
                      >
                        No jobs found for “{historySearch.trim() || "all"}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
              <Pager
                page={page}
                pageSize={pageSize}
                total={filteredJobs.length}
                onPageChange={setPage}
              />
            </div>
          </div>

          {/* Footer tips */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FiCheckCircle /> Deliverable
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Great for sequences and campaigns.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FiAlertTriangle /> Risky
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Segment and test with low volume first.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FiXCircle /> Undeliverable
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Remove or re-enrich to avoid harming sender reputation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
