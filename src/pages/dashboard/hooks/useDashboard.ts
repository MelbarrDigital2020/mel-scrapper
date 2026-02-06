import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";


function getDownloadUrl(jobId: string) {
  const base = (api.defaults.baseURL || "http://localhost:4010/api").replace(
    /\/+$/,
    ""
  );
  return `${base}/export/jobs/${jobId}/download`;
}


async function fetchRecentExports(limit = 4) {
  const res = await api.get("/export-history", {
    params: {
      page: 1,
      pageSize: limit,
      sortKey: "createdAt",
      sortDir: "desc",
      entity: "all",
      search: "",
    },
  });

  const rows = res?.data?.rows || res?.data?.data?.rows || [];
  return rows.map((r: any) => {
  const entity = r.entity === "companies" ? "companies" : "contacts";

  const format =
    String(r.format || "").toLowerCase() === "xlsx" ? "xlsx" : "csv";

  return {
    id: String(r.id),
    name: r.listName || "Untitled export",
    entity,
    format,
    status: r.status,
    createdAt: r.createdAtLabel || "",
    downloadUrl: getDownloadUrl(String(r.id)),
  };
}) as RecentExport[];
}

async function fetchRecentDebounceJobs(limit = 4) {
  const res = await api.get("/usebouncer/jobs/recent", {
    params: { limit },
  });

  const items = res?.data?.items || [];

  return items.map((j: any) => ({
    id: String(j.id),
    type: j.type === "bulk" ? "bulk" : "single",
    input: String(j.input || ""),
    status: j.status, // queued | processing | completed | failed
    createdAt: String(j.createdAt || ""),
  })) as RecentDebounceJob[];
}

function fetchExportDownloadLink(jobId: string) {
  return getDownloadUrl(jobId);
}


export type DashboardKpis = {
  companies: number;
  contacts: number;
  directDials: number;
  intentSignals: number;

  exportsTotal: number;
  exportsThisWeek: number;

  debounceDeliverable: number;
  debounceRisky: number;
  debounceUndeliverable: number;
};

export type RegionRow = { region: string; companies: number; contacts: number };
export type CountryRow = { country: string; companies: number; contacts: number };
export type TrendPoint = { date: string; exports: number; debounced: number };

export type RecentExport = {
  id: string;
  name: string; // listName
  entity: "contacts" | "companies";
  format: "csv" | "xlsx";
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: string; // createdAtLabel
  downloadUrl?: string; // optional (backend may include it)
};

export type RecentDebounceJob = {
  id: string;
  type: "single" | "bulk";
  input: string; // email or filename
  status: "queued" | "processing" | "completed" | "failed";
  createdAt: string;
};

type DashboardResponse = {
  kpis: DashboardKpis;
  regions: RegionRow[];
  countries: CountryRow[];
  trend: TrendPoint[];
  recentExports: RecentExport[];
  recentDebounceJobs: RecentDebounceJob[];
};

const MOCK: DashboardResponse = {
  kpis: {
    // ✅ Big realistic dataset numbers (show as 200.8M / 73.4M etc.)
    companies: 73_420_000,
    contacts: 200_650_000,

    // ✅ realistic coverage ratios
    // direct dials ~29% of contacts (common for B2B enrichment datasets)
    directDials: 58_310_000,

    // ✅ intent signals usually smaller subset (6–10% depending on source)
    intentSignals: 14_870_000,

    // ✅ exports volume (jobs/files), not rows
    exportsTotal: 12_840,
    exportsThisWeek: 740,

    // ✅ debounce checks are typically much smaller than total DB size (recent usage)
    debounceDeliverable: 936_000,
    debounceRisky: 132_000,
    debounceUndeliverable: 57_000,
  },

  // ✅ 4 regions only, totals roughly align with overall (not required to be perfect)
  regions: [
    { region: "APAC", companies: 27_600_000, contacts: 78_500_000 },
    { region: "North America", companies: 24_820_000, contacts: 71_200_000 },
    { region: "EMEA", companies: 16_200_000, contacts: 44_100_000 },
    { region: "LATAM", companies: 4_800_000, contacts: 6_850_000 },
  ],

  // ✅ Top countries with realistic “India-friendly” and major markets high
  countries: [
    { country: "United States", companies: 18_200_000, contacts: 52_400_000 },
    { country: "India", companies: 10_600_000, contacts: 31_800_000 },
    { country: "United Kingdom", companies: 5_200_000, contacts: 14_900_000 },
    { country: "Canada", companies: 3_400_000, contacts: 9_300_000 },
    { country: "Australia", companies: 2_900_000, contacts: 8_100_000 },
   
  ],

  // ✅ weekly activity: exports are “jobs”, debounced is “rows verified”
  trend: [
    { date: "Mon", exports: 120, debounced: 145_000 },
    { date: "Tue", exports: 98, debounced: 178_000 },
    { date: "Wed", exports: 142, debounced: 190_000 },
    { date: "Thu", exports: 110, debounced: 160_000 },
    { date: "Fri", exports: 165, debounced: 210_000 },
    { date: "Sat", exports: 75, debounced: 120_000 },
    { date: "Sun", exports: 130, debounced: 155_000 },
  ],

  // ✅ recent jobs should look believable, not “tiny”
  recentExports: [
    {
      id: "ex_1",
      name: "US SaaS Decision Makers",
      entity: "contacts",
      format: "csv",
      status: "completed",
      createdAt: "38m ago",
    },
    {
      id: "ex_2",
      name: "India IT Services Accounts",
      entity: "companies",
      format: "xlsx",
      status: "processing",
      createdAt: "2h ago",
    },
    {
      id: "ex_3",
      name: "UK Fintech Leads (VP+)",
      entity: "contacts",
      format: "csv",
      status: "completed",
      createdAt: "6h ago",
    },
    {
      id: "ex_4",
      name: "APAC RevOps Companies",
      entity: "companies",
      format: "xlsx",
      status: "failed",
      createdAt: "1d ago",
    },
  ],

  recentDebounceJobs: [
    {
      id: "db_1",
      type: "bulk",
      input: "feb_outreach_list.csv",
      status: "completed",
      createdAt: "1h ago",
    },
    {
      id: "db_2",
      type: "single",
      input: "founder@startup.com",
      status: "completed",
      createdAt: "4h ago",
    },
    {
      id: "db_3",
      type: "bulk",
      input: "event_leads_apac.csv",
      status: "processing",
      createdAt: "21h ago",
    },
  ],
};

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse>(MOCK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

async function fetchDashboard() {
  setLoading(true);
  setError("");

  try {
    const [overviewRes, recentExports, recentDebounceJobs] = await Promise.all([
    api.get("/dashboard/overview"),
    fetchRecentExports(4),
    fetchRecentDebounceJobs(4),
  ]);

    // keep your existing overview parsing
    if (overviewRes?.data?.success && overviewRes.data.data) {
      setData({
        ...(overviewRes.data.data as DashboardResponse),
        recentExports,
        recentDebounceJobs,
      });
    } else if (overviewRes?.data?.data) {
        setData({
        ...(overviewRes.data.data as DashboardResponse),
        recentExports,
        recentDebounceJobs,
      });
    } else {
      setData({ ...MOCK, recentExports, recentDebounceJobs });
    }
  } catch (e: any) {
    setError(e?.message || "Failed to load dashboard");
    // still try to show exports if possible (optional)
    try {
      const recentExports = await fetchRecentExports(4);
      setData({ ...MOCK, recentExports });
    } catch {
      setData(MOCK);
    }
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    fetchDashboard();
     
  }, []);

  const debounceTotal = useMemo(() => {
    const k = data.kpis;
    return k.debounceDeliverable + k.debounceRisky + k.debounceUndeliverable;
  }, [data.kpis]);

  return {
    data,
    loading,
    error,
    debounceTotal,
    refresh: fetchDashboard,
    getExportDownloadLink: fetchExportDownloadLink, // ✅ new

  };
}
