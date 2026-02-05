import { useEffect, useMemo, useState } from "react";
import { FiInfo, FiMail, FiSearch, FiTrash2 } from "react-icons/fi";

import type { DebounceStatus, SingleResult } from "./debounce.types";
import { cn, statusMeta } from "./debounce.utils";
import { DonutCard, Pager } from "./debounce.ui";

import {
  fetchSingleDebounceHistory,
  verifySingleEmail,
  type SingleHistoryItem,
} from "../api/usebouncer";

export default function SingleDebouncePanel() {
  const [singleEmail, setSingleEmail] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);

  // ✅ API history state
  const [items, setItems] = useState<SingleHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5; // ✅ single source of truth
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function loadHistory() {
    try {
      setLoading(true);
      const data = await fetchSingleDebounceHistory({
        page,
        pageSize,
        search,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }

  const singleCounts = useMemo(() => {
    if (!singleResult) return { deliverable: 0, risky: 0, undeliverable: 0 };
    return {
      deliverable: singleResult.status === "deliverable" ? 1 : 0,
      risky: singleResult.status === "risky" ? 1 : 0,
      undeliverable: singleResult.status === "undeliverable" ? 1 : 0,
    };
  }, [singleResult]);

  const runSingleDebounce = async () => {
    const email = singleEmail.trim();
    if (!email) return;

    setSingleLoading(true);
    try {
      const resp = await verifySingleEmail({ email, timeout: 10 });

      const checkedAt = resp?.result?.checkedAt || new Date().toISOString();

      const result: SingleResult = {
        email: resp.result.email || email,
        status: resp.result.status as DebounceStatus,
        reason: resp.result.reason || "",
        checkedAt,
      };

      setSingleResult(result);

      // ✅ refresh history from backend and jump to first page
      setPage(1);
      await loadHistory();
    } finally {
      setSingleLoading(false);
    }
  };

  // ✅ Optional: UI-only remove (does NOT delete backend record)
  const removeHistoryRowUIOnly = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left */}
      <div className="lg:col-span-7 space-y-6">
        {/* Single debounce card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Single Lead Debounce</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter one email to validate deliverability with a crisp,
                actionable result.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:text-gray-200 dark:ring-gray-800">
              <FiMail /> Real-time check
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-950 dark:focus-within:ring-white/10">
                <FiMail className="text-gray-500" />
                <input
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50"
                />
                <button
                  onClick={() => setSingleEmail("")}
                  className="rounded-xl px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                  type="button"
                >
                  Clear
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tip: Use a real inbox or a list export sample for best signals.
              </p>
            </div>

            <div className="sm:col-span-1">
              <button
                onClick={runSingleDebounce}
                disabled={!singleEmail.trim() || singleLoading}
                className={cn(
                  "mt-2 w-full rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                  "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-gray-900",
                  (!singleEmail.trim() || singleLoading) &&
                    "opacity-50 cursor-not-allowed",
                )}
                type="button"
              >
                {singleLoading ? "Checking..." : "Debounce Email"}
              </button>

              <button
                onClick={() => setSingleResult(null)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                type="button"
              >
                Reset Result
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="mt-5">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <FiInfo />
              Result
            </div>

            {singleResult ? (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {singleResult.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {singleResult.reason}
                    </p>
                  </div>

                  {(() => {
                    const meta = statusMeta(singleResult.status);
                    const Icon = meta.icon;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1",
                          meta.chip,
                        )}
                      >
                        <Icon />
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Risk guidance
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {singleResult.status === "deliverable"
                        ? "Safe to send"
                        : singleResult.status === "risky"
                          ? "Warm up / verify further"
                          : "Do not send"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recommended action
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {singleResult.status === "deliverable"
                        ? "Add to campaign"
                        : singleResult.status === "risky"
                          ? "Segment & test"
                          : "Remove / re-enrich"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Checked
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {new Date(singleResult.checkedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                Enter an email above and run debounce to see the result here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right donut */}
      <div className="lg:col-span-5">
        <DonutCard
          title="Single Result Breakdown"
          subtitle="This donut reflects the latest single email validation."
          deliverable={singleCounts.deliverable}
          risky={singleCounts.risky}
          undeliverable={singleCounts.undeliverable}
        />
      </div>

      {/* History */}
      <div className="lg:col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Single Debounce History</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Previously validated email addresses.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <FiSearch className="text-gray-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search email / status / reason..."
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50 sm:w-80"
              />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Checked At</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : items.length ? (
                    items.map((h) => {
                      const meta = statusMeta(h.status);
                      const Icon = meta.icon;

                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-gray-50/70 dark:hover:bg-gray-950/30"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                            {h.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1",
                                meta.chip,
                              )}
                            >
                              <Icon />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                            {new Date(h.checkedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeHistoryRowUIOnly(h.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                              type="button"
                              title="Remove (UI only)"
                            >
                              <FiTrash2 /> Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        No history found for “{search.trim() || "all"}”.
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
                total={total}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
