import { useMemo, useState } from "react";
import { FiInfo, FiMail, FiSearch, FiTrash2, FiTarget } from "react-icons/fi";
import api from "../../../services/api";

import type {
  IntentLevel,
  SingleIntentResult,
  SingleIntentHistoryRow,
} from "./intentbase.types";

import { cn, intentMeta } from "./intentbase.utils";
import { DonutCard, Pager } from "./intentbase.ui";


async function fetchIntentByEmail(email: string): Promise<SingleIntentResult> {
  const res = await api.get("/intent-base/single", {
    params: { email },
  });

  // backend returns { success: true, data: SingleIntentResult }
  return res.data.data;
}

export default function SingleIntentPanel() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SingleIntentResult | null>(null);

  // History like debounce
  const [history, setHistory] = useState<SingleIntentHistoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const donutCounts = useMemo(() => {
    if (!result) return { high: 0, medium: 0, low: 0, unknown: 0 };
    const lvl = result.intentLevel ?? "unknown";
    return {
      high: lvl === "high" ? 1 : 0,
      medium: lvl === "medium" ? 1 : 0,
      low: lvl === "low" ? 1 : 0,
      unknown: lvl === "unknown" ? 1 : 0,
    };
  }, [result]);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;

    return history.filter((h) => {
      const blob = [
        h.email,
        h.companyName ?? "",
        h.companyDomain ?? "",
        h.intentSignal ?? "",
        h.intentLevel ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [history, search]);

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page]);

  const runSingle = async () => {
    const e = email.trim();
    if (!e) return;

    setLoading(true);
    const res = await fetchIntentByEmail(e);
    setResult(res);

    const row: SingleIntentHistoryRow = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      email: res.email,
      found: res.found,
      companyName: res.companyName,
      companyDomain: res.companyDomain,
      intentSignal: res.intentSignal ?? null, // ✅
      intentLevel: res.intentLevel,
      intentScore: res.intentScore,
      checkedAt: res.checkedAt,
    };

    setHistory((prev) => [row, ...prev]);
    setPage(1);
    setLoading(false);
  };

  const removeHistoryRow = (id: string) =>
    setHistory((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Intent Single</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter one email to fetch company context + intent signals from
                your database.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:text-gray-200 dark:ring-gray-800">
              <FiTarget /> Real-time lookup
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50"
                />
                <button
                  onClick={() => setEmail("")}
                  className="rounded-xl px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                  type="button"
                >
                  Clear
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Tip: Use emails from your contacts export for best matches.
              </p>
            </div>

            <div className="sm:col-span-1">
              <button
                onClick={runSingle}
                disabled={!email.trim() || loading}
                className={cn(
                  "mt-2 w-full rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition",
                  "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-gray-900",
                  (!email.trim() || loading) &&
                    "opacity-50 cursor-not-allowed",
                )}
                type="button"
              >
                {loading ? "Checking..." : "Intent Single"}
              </button>

              <button
                onClick={() => setResult(null)}
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

            {result ? (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {result.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {result.found
                        ? result.reason
                        : "This email was not found in your database. Try another email from your saved leads or run an import/sync."}
                    </p>
                  </div>

                  {(() => {
                    const meta = intentMeta(result.intentLevel ?? "unknown");
                    const Icon = meta.icon;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1",
                          meta.chip,
                        )}
                      >
                        <Icon className={cn(loading && "animate-spin")} />
                        {meta.label}{" "}
                        {typeof result.intentScore === "number"
                          ? `• ${result.intentScore}/100`
                          : ""}
                      </span>
                    );
                  })()}
                </div>

                {/* ✅ THESE 3 BOXES ARE YOUR REQUIRED REPLACEMENTS */}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Risk guidance -> Company Name + Domain */}
                  <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Company
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {result.found ? result.companyName : "Not available"}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {result.found ? result.companyDomain : "—"}
                    </p>
                  </div>

                 {/* Intent Signal -> intent_signal */}
                <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Intent Signal</p>

                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {result.found ? (result.intentSignal?.trim() || "Not available") : "Not available"}
                  </p>

                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    {result.found ? "Use this for segmentation" : "—"}
                  </p>
                </div>


                  {/* Checked -> Intent single date-time */}
                  <div className="rounded-xl bg-white p-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Intent single date-time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {new Date(result.checkedAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      Latest lookup timestamp
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                Enter an email above and run <b>Intent Single</b> to see the
                result here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right donut */}
      <div className="lg:col-span-5">
        <DonutCard
          title="Single Intent Breakdown"
          subtitle="This donut reflects the latest intent lookup."
          high={donutCounts.high}
          medium={donutCounts.medium}
          low={donutCounts.low}
          unknown={donutCounts.unknown}
        />
      </div>

      {/* History */}
      <div className="lg:col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Intent Single History</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Previously checked emails with company context + intent level.
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
                placeholder="Search email, company, domain, industry..."
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-50 sm:w-96"
              />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Intent Signal</th>
                    <th className="px-4 py-3">Intent</th>
                    <th className="px-4 py-3">Intent single date-time</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {pagedHistory.map((h) => {
                    const meta = intentMeta(h.intentLevel ?? "unknown");
                    const Icon = meta.icon;

                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-950/30"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                          {h.email}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {h.found ? h.companyName : "Not found"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {h.found ? h.companyDomain : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                          {h.found ? (h.intentSignal?.trim() || "—") : "—"}
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
                            {typeof h.intentScore === "number"
                              ? ` • ${h.intentScore}/100`
                              : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                          {new Date(h.checkedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeHistoryRow(h.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                            type="button"
                            title="Remove"
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!pagedHistory.length && (
                    <tr>
                      <td
                        colSpan={7}
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
                total={filteredHistory.length}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
