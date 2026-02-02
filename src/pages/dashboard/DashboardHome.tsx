import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis as ScatterXAxis,
  YAxis as ScatterYAxis,
} from "recharts";
import {
  FiUsers,
  FiBriefcase,
  FiPhoneCall,
  FiTarget,
  FiDownload,
  FiMail,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";

import Chart from "./components/Chart";
import StatCard from "./components/StatCard";
import { useDashboard } from "./hooks/useDashboard";

/* ---------------- Helpers ---------------- */
type LatLng = { lat: number; lng: number };

const COUNTRY_LATLNG: Record<string, LatLng> = {
  "United States": { lat: 39.8, lng: -98.6 },
  Canada: { lat: 56.1, lng: -106.3 },
  "United Kingdom": { lat: 55.3, lng: -3.4 },
  Germany: { lat: 51.2, lng: 10.4 },
  France: { lat: 46.2, lng: 2.2 },
  India: { lat: 22.9, lng: 78.9 },
  Australia: { lat: -25.3, lng: 133.8 },
  Singapore: { lat: 1.35, lng: 103.8 },
  "United Arab Emirates": { lat: 24.3, lng: 54.4 },
  Netherlands: { lat: 52.1, lng: 5.3 },
  Spain: { lat: 40.4, lng: -3.7 },
  Italy: { lat: 41.9, lng: 12.6 },
  Brazil: { lat: -14.2, lng: -51.9 },
  Mexico: { lat: 23.6, lng: -102.5 },
  Japan: { lat: 36.2, lng: 138.2 },
  "South Africa": { lat: -30.6, lng: 22.9 },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function projectToCanvas({ lat, lng }: LatLng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x: clamp(x, 2, 98), y: clamp(y, 2, 98) };
}

function fmt(n: number) {
  return n.toLocaleString();
}

function badgeForStatus(status: string) {
  if (status === "completed")
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";
  if (status === "processing")
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
  if (status === "failed")
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
  return "bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border-black/10 dark:border-white/10";
}

/** Detects tailwind dark mode: <html class="dark"> */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const el = document.documentElement;

    const update = () => setIsDark(el.classList.contains("dark"));
    update();

    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });

    return () => obs.disconnect();
  }, []);

  return isDark;
}

/* ---------------- Component ---------------- */
export default function DashboardHome() {
  const { data, loading, error, debounceTotal, refresh } = useDashboard();
  const isDark = useIsDarkMode();

  /** Theme-aware chart styling */
  const chartTheme = useMemo(() => {
    return {
      tick: isDark ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.72)", // slate-900-ish
      axis: isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.14)",
      grid: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)",
      strokeStrong: isDark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.55)",
      strokeSoft: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)",
      tooltipBg: isDark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.96)",
      tooltipBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)",
      tooltipText: isDark ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.9)",
      mapDot: isDark ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.75)",
    };
  }, [isDark]);

  const debouncePie = useMemo(() => {
    const k = data.kpis;
    return [
      { name: "Deliverable", value: k.debounceDeliverable },
      { name: "Risky", value: k.debounceRisky },
      { name: "Undeliverable", value: k.debounceUndeliverable },
    ];
  }, [data.kpis]);

  // Only for donut clarity
  const pieColors = ["#34d399", "#fbbf24", "#fb7185"];

  const topCountries = useMemo(() => {
    return [...data.countries].sort((a, b) => b.contacts - a.contacts).slice(0, 12);
  }, [data.countries]);

  const mapDots = useMemo(() => {
    return topCountries
      .map((c) => {
        const pos = COUNTRY_LATLNG[c.country];
        if (!pos) return null;
        const p = projectToCanvas(pos);
        return {
          country: c.country,
          companies: c.companies,
          contacts: c.contacts,
          x: p.x,
          y: p.y,
          z: c.contacts,
        };
      })
      .filter(Boolean) as any[];
  }, [topCountries]);

  const topRegion = useMemo(() => {
    return data.regions.slice().sort((a, b) => b.contacts - a.contacts)[0]?.region || "-";
  }, [data.regions]);

  const deliverabilityRate = useMemo(() => {
    if (!debounceTotal) return 0;
    return Math.round((data.kpis.debounceDeliverable / debounceTotal) * 100);
  }, [data.kpis.debounceDeliverable, debounceTotal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Snapshot of your Mel-Screpper data health, coverage, and activity.
          </p>
          {error ? (
            <p className="text-xs mt-2 text-rose-600 dark:text-rose-300/90">
              Showing fallback data (API issue): {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/export-history"
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-xl
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              hover:bg-black/8 dark:hover:bg-white/8
              hover:border-black/15 dark:hover:border-white/15
              active:scale-[0.98]
              transition
              text-sm
            "
          >
            <FiDownload />
            Export History
            <FiArrowRight className="opacity-70" />
          </NavLink>

          <NavLink
            to="/debounce"
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-xl
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              hover:bg-black/8 dark:hover:bg-white/8
              hover:border-black/15 dark:hover:border-white/15
              active:scale-[0.98]
              transition
              text-sm
            "
          >
            <FiMail />
            Debounce
            <FiArrowRight className="opacity-70" />
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Unique Companies"
          value={data.kpis.companies}
          subtitle="Cleaned + normalized domains"
          icon={<FiBriefcase className="text-black/70 dark:text-white/85" />}
          delta={6}
          tone="default"
          mini={[3, 4, 5, 4, 6, 7, 8]}
        />
        <StatCard
          title="Contacts"
          value={data.kpis.contacts}
          subtitle="Profiles ready for outreach"
          icon={<FiUsers className="text-black/70 dark:text-white/85" />}
          delta={12}
          tone="success"
          mini={[2, 3, 3, 5, 6, 7, 7]}
        />
        <StatCard
          title="Direct Dials"
          value={data.kpis.directDials}
          subtitle="Phone coverage count"
          icon={<FiPhoneCall className="text-black/70 dark:text-white/85" />}
          delta={-2}
          tone="warning"
          mini={[6, 6, 5, 5, 4, 4, 4]}
        />
        <StatCard
          title="Intent Signals"
          value={data.kpis.intentSignals}
          subtitle="High-intent accounts/leads"
          icon={<FiTarget className="text-black/70 dark:text-white/85" />}
          delta={9}
          tone="success"
          mini={[2, 2, 3, 4, 6, 6, 7]}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Region Coverage - Radar */}
        <div className="xl:col-span-3">
          <Chart
            title="Region Coverage"
            subtitle="Coverage ring view (contacts vs companies)"
            onRefresh={refresh}
            loading={loading}
          >
            <div className="h-80 grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 h-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data.regions}>
                      <defs>
                        {/* theme-aware fills */}
                        <radialGradient id="rgContacts" cx="50%" cy="50%" r="60%">
                          <stop
                            offset="0%"
                            stopColor={isDark ? "rgba(255,255,255,0.26)" : "rgba(15,23,42,0.16)"}
                          />
                          <stop
                            offset="100%"
                            stopColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.03)"}
                          />
                        </radialGradient>

                        <radialGradient id="rgCompanies" cx="50%" cy="50%" r="60%">
                          <stop
                            offset="0%"
                            stopColor={isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.10)"}
                          />
                          <stop
                            offset="100%"
                            stopColor={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.02)"}
                          />
                        </radialGradient>
                      </defs>

                      <PolarGrid stroke={chartTheme.grid} />
                      <PolarAngleAxis
                        dataKey="region"
                        tick={{ fontSize: 12, fill: chartTheme.tick }}
                      />
                      <PolarRadiusAxis tick={false} axisLine={false} />

                      <Radar
                        name="Contacts"
                        dataKey="contacts"
                        stroke={chartTheme.strokeStrong}
                        fill="url(#rgContacts)"
                        fillOpacity={1}
                      />
                      <Radar
                        name="Companies"
                        dataKey="companies"
                        stroke={chartTheme.strokeSoft}
                        fill="url(#rgCompanies)"
                        fillOpacity={1}
                      />

                      <Tooltip
                        contentStyle={{
                          background: chartTheme.tooltipBg,
                          border: `1px solid ${chartTheme.tooltipBorder}`,
                          borderRadius: 12,
                          color: chartTheme.tooltipText,
                        }}
                        labelStyle={{ color: chartTheme.tooltipText }}
                        itemStyle={{ color: chartTheme.tooltipText }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                  <p className="text-xs text-text-secondary">Top Region</p>
                  <p className="mt-1 text-2xl font-semibold">{topRegion}</p>
                </div>
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                  <p className="text-xs text-text-secondary">Total Companies</p>
                  <p className="mt-1 text-2xl font-semibold">{fmt(data.kpis.companies)}</p>
                </div>
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-4">
                  <p className="text-xs text-text-secondary">Total Contacts</p>
                  <p className="mt-1 text-2xl font-semibold">{fmt(data.kpis.contacts)}</p>
                </div>
              </div>
            </div>
          </Chart>
        </div>

        {/* Debounce Donut */}
        <div className="xl:col-span-2">
          <Chart
            title="Email Debounce Health"
            subtitle={`Total checked: ${fmt(debounceTotal)}`}
            onRefresh={refresh}
            loading={loading}
          >
            <div className="h-80 flex items-center gap-4">
              <div className="relative h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debouncePie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      isAnimationActive
                    >
                      {debouncePie.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: chartTheme.tooltipBg,
                        border: `1px solid ${chartTheme.tooltipBorder}`,
                        borderRadius: 12,
                        color: chartTheme.tooltipText,
                      }}
                      labelStyle={{ color: chartTheme.tooltipText }}
                      itemStyle={{ color: chartTheme.tooltipText }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center KPI */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary">Deliverable</p>
                    <p className="text-2xl font-semibold">{deliverabilityRate}%</p>
                    <p className="text-[11px] text-text-secondary">{fmt(debounceTotal)} checked</p>
                  </div>
                </div>
              </div>

              <div className="min-w-[180px] space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Deliverable
                  </span>
                  <span className="font-semibold">{fmt(data.kpis.debounceDeliverable)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-500" /> Risky
                  </span>
                  <span className="font-semibold">{fmt(data.kpis.debounceRisky)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <FiXCircle className="text-rose-500" /> Undeliverable
                  </span>
                  <span className="font-semibold">{fmt(data.kpis.debounceUndeliverable)}</span>
                </div>

                <div className="mt-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3">
                  <p className="text-xs text-text-secondary">Deliverability Rate</p>
                  <p className="mt-1 text-lg font-semibold">{deliverabilityRate}%</p>
                </div>
              </div>
            </div>
          </Chart>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Activity - Glass Gradient Area */}
        <div className="xl:col-span-2">
          <Chart
            title="Weekly Activity"
            subtitle="Exports vs Debounce volume (glass trend)"
            onRefresh={refresh}
            loading={loading}
          >
            <div className="h-72 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gDebounced" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isDark ? "rgba(255,255,255,0.24)" : "rgba(15,23,42,0.14)"}
                      />
                      <stop
                        offset="100%"
                        stopColor={isDark ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)"}
                      />
                    </linearGradient>
                    <linearGradient id="gExports" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isDark ? "rgba(255,255,255,0.16)" : "rgba(15,23,42,0.10)"}
                      />
                      <stop
                        offset="100%"
                        stopColor={isDark ? "rgba(255,255,255,0.01)" : "rgba(15,23,42,0.01)"}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: chartTheme.tick }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: chartTheme.tick }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: 12,
                      color: chartTheme.tooltipText,
                    }}
                    labelStyle={{ color: chartTheme.tooltipText }}
                    itemStyle={{ color: chartTheme.tooltipText }}
                  />

                  <Area
                    type="monotone"
                    dataKey="debounced"
                    stroke={chartTheme.strokeStrong}
                    strokeWidth={2}
                    fill="url(#gDebounced)"
                    isAnimationActive
                  />
                  <Area
                    type="monotone"
                    dataKey="exports"
                    stroke={chartTheme.strokeSoft}
                    strokeWidth={2}
                    fill="url(#gExports)"
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3">
                <p className="text-xs text-text-secondary">Exports Total</p>
                <p className="mt-1 text-lg font-semibold">{fmt(data.kpis.exportsTotal)}</p>
              </div>
              <div className="rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3">
                <p className="text-xs text-text-secondary">Exports This Week</p>
                <p className="mt-1 text-lg font-semibold">{fmt(data.kpis.exportsThisWeek)}</p>
              </div>
            </div>
          </Chart>
        </div>

        {/* Map Chart - Country Coverage */}
        {/* Top Countries */}
      <Chart
        title="Top Countries"
        subtitle="Highest contact coverage"
        onRefresh={refresh}
        loading={loading}
      >
        <div className="space-y-3">
          {topCountries.slice(0, 8).map((c, idx) => {
            const max = topCountries[0]?.contacts || 1;
            const percent = Math.round((c.contacts / max) * 100);

            return (
              <div
                key={c.country}
                className="
                  rounded-xl p-3
                  bg-black/5 dark:bg-white/5
                  border border-black/10 dark:border-white/10
                "
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {idx + 1}. {c.country}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {fmt(c.companies)} companies
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{fmt(c.contacts)}</p>
                    <p className="text-[11px] text-text-secondary">contacts</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}

          <NavLink
            to="/contacts"
            className="
              mt-2 inline-flex items-center justify-center gap-2 w-full
              text-sm px-3 py-2 rounded-xl
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              hover:bg-black/8 dark:hover:bg-white/8
              transition
            "
          >
            Explore Contacts <FiArrowRight className="opacity-70" />
          </NavLink>
        </div>
      </Chart>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Chart title="Recent Exports" subtitle="Latest downloads & jobs" onRefresh={refresh} loading={loading}>
          <div className="space-y-2">
            {data.recentExports.map((ex) => (
              <div
                key={ex.id}
                className="
                  flex items-center justify-between gap-3
                  rounded-xl p-3
                  bg-black/5 dark:bg-white/5
                  border border-black/10 dark:border-white/10
                  hover:bg-black/8 dark:hover:bg-white/8
                  hover:border-black/15 dark:hover:border-white/15
                  transition
                "
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ex.name}</p>
                  <p className="text-xs text-text-secondary">
                    {ex.entity.toUpperCase()} • {ex.format.toUpperCase()} • {ex.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${badgeForStatus(ex.status)}`}
                  >
                    {ex.status}
                  </span>

                  <button
                    className="
                      inline-flex items-center gap-2
                      text-xs px-2.5 py-1.5 rounded-xl
                      bg-black/5 dark:bg-white/5
                      border border-black/10 dark:border-white/10
                      hover:bg-black/8 dark:hover:bg-white/8
                      hover:border-black/15 dark:hover:border-white/15
                      active:scale-[0.98]
                      transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                    disabled={ex.status !== "completed"}
                    title={ex.status === "completed" ? "Download" : "Not ready"}
                    onClick={() => {
                      // TODO: wire to your export download endpoint
                      // api.get(`/exports/${ex.id}/download`, { responseType: "blob" })
                    }}
                  >
                    <FiDownload />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            ))}

            <NavLink
              to="/export-history"
              className="
                mt-2 inline-flex items-center justify-center gap-2 w-full
                text-sm px-3 py-2 rounded-xl
                bg-black/5 dark:bg-white/5
                border border-black/10 dark:border-white/10
                hover:bg-black/8 dark:hover:bg-white/8
                hover:border-black/15 dark:hover:border-white/15
                active:scale-[0.98]
                transition
              "
            >
              View all exports <FiArrowRight className="opacity-70" />
            </NavLink>
          </div>
        </Chart>

        <Chart
          title="Recent Debounce Jobs"
          subtitle="Single & bulk verification activity"
          onRefresh={refresh}
          loading={loading}
        >
          <div className="space-y-2">
            {data.recentDebounceJobs.map((j) => (
              <div
                key={j.id}
                className="
                  flex items-center justify-between gap-3
                  rounded-xl p-3
                  bg-black/5 dark:bg-white/5
                  border border-black/10 dark:border-white/10
                  hover:bg-black/8 dark:hover:bg-white/8
                  hover:border-black/15 dark:hover:border-white/15
                  transition
                "
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="opacity-80">{j.type === "bulk" ? "Bulk" : "Single"} • </span>
                    {j.input}
                  </p>
                  <p className="text-xs text-text-secondary">{j.createdAt}</p>
                </div>

                <span className={`text-[11px] px-2 py-1 rounded-full border ${badgeForStatus(j.status)}`}>
                  {j.status}
                </span>
              </div>
            ))}

            <motion.div
              whileHover={{ y: -1 }}
              className="
                mt-2 rounded-2xl
                border border-black/10 dark:border-white/10
                bg-black/5 dark:bg-white/5
                p-4
              "
            >
              <p className="text-sm font-semibold">Next best action</p>
              <p className="text-xs text-text-secondary mt-1">
                Run a bulk debounce on your latest export list to improve deliverability.
              </p>
              <NavLink
                to="/debounce"
                className="
                  mt-3 inline-flex items-center gap-2
                  text-sm px-3 py-2 rounded-xl
                  bg-black/5 dark:bg-white/5
                  border border-black/10 dark:border-white/10
                  hover:bg-black/8 dark:hover:bg-white/8
                  hover:border-black/15 dark:hover:border-white/15
                  active:scale-[0.98]
                  transition
                "
              >
                Open Debounce <FiArrowRight className="opacity-70" />
              </NavLink>
            </motion.div>
          </div>
        </Chart>
      </div>
    </div>
  );
}
