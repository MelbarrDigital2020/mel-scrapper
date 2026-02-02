import React from "react";
import { motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  children: React.ReactNode;
};

export default function Chart({
  title,
  subtitle,
  right,
  onRefresh,
  loading,
  children,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        bg-background-card border border-border-light rounded-2xl
        p-4 sm:p-5
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-text-secondary mt-1 truncate">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {right}
          {onRefresh ? (
            <button
              onClick={onRefresh}
              className="
                inline-flex items-center gap-2
                text-xs px-2.5 py-1.5 rounded-xl
                bg-white/5 border border-white/10
                hover:bg-white/8 hover:border-white/15
                active:scale-[0.98]
                transition
              "
              title="Refresh"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 w-1/3 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
