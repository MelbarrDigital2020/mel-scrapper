import React, { useMemo } from "react";
import { FiInfo, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { cn, formatPercent } from "./intentbase.utils";

export function DonutCard({
  title,
  subtitle,
  high,
  medium,
  low,
  unknown,
}: {
  title: string;
  subtitle: string;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}) {
  const data = useMemo(
    () => [
      { name: "High", value: high },
      { name: "Medium", value: medium },
      { name: "Low", value: low },
      { name: "Unknown", value: unknown },
    ],
    [high, medium, low, unknown],
  );

  const total = high + medium + low + unknown;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950/40 dark:text-gray-200 dark:ring-gray-800">
          Total: {total}
        </div>
      </div>

      <div className="mt-4 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
            >
              {data.map((_, idx) => (
                <Cell key={idx} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* legend */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary dark:text-gray-300">High</span>
          <span className="font-medium">
            {high} • {formatPercent(high, total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary dark:text-gray-300">Medium</span>
          <span className="font-medium">
            {medium} • {formatPercent(medium, total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary dark:text-gray-300">Low</span>
          <span className="font-medium">
            {low} • {formatPercent(low, total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary dark:text-gray-300">Unknown</span>
          <span className="font-medium">
            {unknown} • {formatPercent(unknown, total)}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-300">
        <div className="flex items-start gap-2">
          <FiInfo className="mt-0.5 shrink-0" />
          <p>
            Use intent levels to prioritize outreach. High intent = faster
            conversion potential.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Page{" "}
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {totalPages}
        </span>{" "}
        •{" "}
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {total}
        </span>{" "}
        records
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange(page - 1)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition",
            "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800",
            !canPrev && "opacity-50 cursor-not-allowed",
          )}
          type="button"
        >
          <FiChevronLeft /> Prev
        </button>
        <button
          onClick={() => canNext && onPageChange(page + 1)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition",
            "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800",
            !canNext && "opacity-50 cursor-not-allowed",
          )}
          type="button"
        >
          Next <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
