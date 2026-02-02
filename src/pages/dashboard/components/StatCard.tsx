import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

function formatCompact(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function useCountUp(value: number, durationMs = 900) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = v;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (to - from) * eased);
      setV(next);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return v;
}

type Props = {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
  delta?: number; // optional +/-
  tone?: "default" | "success" | "warning" | "danger";
  mini?: number[]; // tiny spark line values
};

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  delta,
  tone = "default",
  mini,
}: Props) {
  const counted = useCountUp(value);
  const spark = useMemo(() => {
    const arr = mini?.length ? mini : [3, 4, 2, 5, 4, 6, 5];
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const norm = arr.map((x) => {
      const d = max - min || 1;
      return (x - min) / d;
    });

    // 7 points across 100 width
    return norm
      .map((n, i) => {
        const x = (i / (norm.length - 1)) * 100;
        const y = 30 - n * 22;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [mini]);

  const toneRing =
    tone === "success"
      ? "ring-emerald-500/15"
      : tone === "warning"
      ? "ring-amber-500/15"
      : tone === "danger"
      ? "ring-rose-500/15"
      : "ring-white/10";

  const deltaBadge =
    typeof delta === "number" ? (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border
          ${
            delta >= 0
              ? "border-emerald-500/25 text-emerald-400 bg-emerald-500/10"
              : "border-rose-500/25 text-rose-400 bg-rose-500/10"
          }`}
      >
        {delta >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
        {Math.abs(delta)}%
      </span>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`
        group relative overflow-hidden
        bg-background-card border border-border-light rounded-2xl
        p-4 sm:p-5
        shadow-sm
        ring-1 ${toneRing}
        hover:shadow-md hover:-translate-y-[1px]
        transition
      `}
    >
      {/* glow */}
      <div
        className="
          pointer-events-none absolute -top-20 -right-24 h-44 w-44 rounded-full
          bg-white/5 blur-2xl
          opacity-0 group-hover:opacity-100 transition
        "
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs text-text-secondary">{title}</p>
            {deltaBadge}
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {formatCompact(counted)}
            </p>
            {subtitle ? (
              <p className="text-xs text-text-secondary truncate">{subtitle}</p>
            ) : null}
          </div>

          {/* tiny sparkline */}
          <div className="mt-3">
            <svg viewBox="0 0 100 32" className="h-8 w-32 opacity-80">
              <polyline
                points={spark}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                className="
                  text-white/25
                  group-hover:text-white/40
                  transition
                "
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div
          className="
            h-10 w-10 rounded-2xl
            flex items-center justify-center
            bg-white/5 border border-white/10
            group-hover:bg-white/8 group-hover:border-white/15
            transition
          "
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
