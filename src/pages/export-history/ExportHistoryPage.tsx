import { useMemo, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiFileText,
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsUp,
  FiChevronsDown,
} from "react-icons/fi";

/* ---------------- Types ---------------- */
type ExportEntity = "all" | "contacts" | "companies";
type ExportFormat = "csv" | "xlsx";
type ExportStatus = "completed" | "processing" | "failed";

type ExportRow = {
  id: string;
  listName: string;
  entity: "contacts" | "companies";
  format: ExportFormat;
  leads: number;
  status: ExportStatus;

  createdAtLabel: string; // display
  createdAtTs: number; // sorting

  downloadUrl?: string;
};

type SortKey =
  | "createdAt"
  | "listName"
  | "entity"
  | "format"
  | "leads"
  | "status";
type SortDir = "asc" | "desc";

/* ---------------- Dummy Data (replace with API later) ---------------- */
const DUMMY_EXPORTS: ExportRow[] = [
  {
    id: "1",
    listName: "APAC SaaS Founders",
    entity: "contacts",
    format: "csv",
    leads: 532,
    status: "completed",
    createdAtLabel: "Jan 30, 2026 • 10:24 AM",
    createdAtTs: new Date("2026-01-30T10:24:00+05:30").getTime(),
    downloadUrl: "/downloads/apac-saas-founders.csv",
  },
  {
    id: "2",
    listName: "US Fintech Companies",
    entity: "companies",
    format: "xlsx",
    leads: 210,
    status: "completed",
    createdAtLabel: "Jan 29, 2026 • 6:12 PM",
    createdAtTs: new Date("2026-01-29T18:12:00+05:30").getTime(),
    downloadUrl: "/downloads/us-fintech-companies.xlsx",
  },
  {
    id: "3",
    listName: "Healthcare Leads - West",
    entity: "contacts",
    format: "xlsx",
    leads: 1200,
    status: "processing",
    createdAtLabel: "Jan 29, 2026 • 1:03 PM",
    createdAtTs: new Date("2026-01-29T13:03:00+05:30").getTime(),
  },
  {
    id: "4",
    listName: "EU Agencies",
    entity: "companies",
    format: "csv",
    leads: 88,
    status: "failed",
    createdAtLabel: "Jan 28, 2026 • 9:47 AM",
    createdAtTs: new Date("2026-01-28T09:47:00+05:30").getTime(),
  },
];

/* ---------------- Helpers ---------------- */
function FormatBadge({ format }: { format: ExportFormat }) {
  const isCsv = format === "csv";
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="
          inline-flex items-center justify-center
          h-8 w-8 rounded-lg border
          bg-background-section border-border-light
        "
        title={isCsv ? "CSV" : "Excel"}
      >
        <FiFileText className="text-text-secondary" />
      </span>
      <span className="text-sm font-medium text-text-primary">
        {isCsv ? "CSV" : "Excel"}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: ExportStatus }) {
  const ui = {
    completed: {
      icon: <FiCheckCircle className="shrink-0" />,
      text: "Completed",
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    processing: {
      icon: <FiClock className="shrink-0" />,
      text: "Processing",
      cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    failed: {
      icon: <FiAlertTriangle className="shrink-0" />,
      text: "Failed",
      cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  }[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full text-xs font-semibold
        ${ui.cls}
      `}
    >
      {ui.icon}
      {ui.text}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return (
      <span className="opacity-40">
        <FiChevronsUp />
      </span>
    );
  return dir === "asc" ? <FiChevronsUp /> : <FiChevronsDown />;
}

function compareStatus(a: ExportStatus, b: ExportStatus) {
  // You can change order easily here:
  const order: Record<ExportStatus, number> = {
    completed: 1,
    processing: 2,
    failed: 3,
  };
  return order[a] - order[b];
}

export default function ExportHistoryPage() {
  const [entity, setEntity] = useState<ExportEntity>("all");
  const [search, setSearch] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return DUMMY_EXPORTS.filter((row) => {
      const entityOk = entity === "all" ? true : row.entity === entity;
      const searchOk = s ? row.listName.toLowerCase().includes(s) : true;
      return entityOk && searchOk;
    });
  }, [entity, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];

    arr.sort((a, b) => {
      let res = 0;

      switch (sortKey) {
        case "createdAt":
          res = a.createdAtTs - b.createdAtTs;
          break;
        case "listName":
          res = a.listName.localeCompare(b.listName);
          break;
        case "entity":
          res = a.entity.localeCompare(b.entity);
          break;
        case "format":
          res = a.format.localeCompare(b.format);
          break;
        case "leads":
          res = a.leads - b.leads;
          break;
        case "status":
          res = compareStatus(a.status, b.status);
          break;
        default:
          res = 0;
      }

      return sortDir === "asc" ? res : -res;
    });

    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset to page 1 when filters/sort/pageSize change
  useMemo(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, search, sortKey, sortDir, pageSize]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const rangeFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeTo = Math.min(safePage * pageSize, total);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "createdAt" ? "desc" : "asc");
  }

  function Th({
    label,
    k,
    alignRight,
  }: {
    label: string;
    k: SortKey;
    alignRight?: boolean;
  }) {
    const active = sortKey === k;

    return (
      <th className={`px-5 py-3 ${alignRight ? "text-right" : ""}`}>
        <button
          onClick={() => toggleSort(k)}
          className={`
            inline-flex items-center gap-2
            text-xs font-semibold
            ${active ? "text-text-primary" : "text-text-secondary"}
            hover:text-text-primary transition
            select-none
          `}
          title="Sort"
        >
          {label}
          <span className={`text-sm ${active ? "opacity-100" : "opacity-60"}`}>
            <SortIcon active={active} dir={sortDir} />
          </span>
        </button>
      </th>
    );
  }

  // For nicer pagination page buttons
  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    const pages: number[] = [];

    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Export History
          </h1>
          <p className="text-sm text-text-secondary">
            Track and download your exported contact and company lists.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded border border-border-light bg-background px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-text-secondary">
            {total} export{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filters + Table wrapper */}
      <div className="rounded-2xl border border-border-light bg-background shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        {/* Filters */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Entity dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-secondary">
              Entity
            </label>
            <div className="relative">
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value as ExportEntity)}
                className="
                  h-8 rounded border border-border-light bg-background
                  px-3 pr-10 text-sm cursor-pointer text-text-primary
                  outline-none focus:ring-2 focus:ring-primary/30
                  transition
                "
              >
                <option value="all">All</option>
                <option value="contacts">Contacts</option>
                <option value="companies">Companies</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="w-full sm:w-[420px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by list name..."
                className="
                  w-full h-8 pl-10 pr-10 rounded
                  border border-border-light bg-background
                  text-sm text-text-primary placeholder:text-text-secondary
                  outline-none focus:ring-2 focus:ring-primary/30
                  transition
                "
              />
              {search.trim().length > 0 && (
                <button
                  onClick={() => setSearch("")}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    h-8 w-8 inline-flex items-center justify-center
                    rounded-lg text-text-secondary
                    hover:bg-background-section hover:text-text-primary
                    transition
                  "
                  title="Clear"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border-t border-border-light overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr className="text-left bg-background-section">
                <Th label="List Name" k="listName" />
                <Th label="Entity" k="entity" />
                <Th label="Format" k="format" />
                <Th label="Leads" k="leads" />
                <Th label="Status" k="status" />
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-text-secondary"
                  >
                    No exports found. Try changing filters or search.
                  </td>
                </tr>
              ) : (
                paged.map((row) => {
                  const canDownload =
                    row.status === "completed" && row.downloadUrl;

                  return (
                    <tr
                      key={row.id}
                      className="border-t border-border-light hover:bg-background-section/60 transition"
                    >
                      {/* List */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-primary">
                            {row.listName}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {row.createdAtLabel}
                          </span>
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {row.entity === "contacts" ? "Contacts" : "Companies"}
                        </span>
                      </td>

                      {/* Format */}
                      <td className="px-5 py-4">
                        <FormatBadge format={row.format} />
                      </td>

                      {/* Leads */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-text-primary">
                          {row.leads.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusPill status={row.status} />
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        {canDownload ? (
                          <a
                            href={row.downloadUrl}
                            className="
                              inline-flex items-center gap-2
                              h-8 px-4 rounded
                              bg-primary text-white text-sm font-semibold
                              hover:opacity-95 active:opacity-90
                              transition
                              shadow-[0_10px_20px_rgba(0,0,0,0.08)]
                            "
                          >
                            <FiDownload />
                            Download
                          </a>
                        ) : (
                          <button
                            disabled
                            className="
                              inline-flex items-center gap-2
                              h-8 px-4 rounded
                              bg-background-section text-text-secondary
                              border border-border-light
                              text-sm font-semibold
                              cursor-not-allowed
                            "
                            title={
                              row.status === "processing"
                                ? "Export is still processing"
                                : "Export failed"
                            }
                          >
                            <FiDownload />
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-border-light px-4 sm:px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: showing */}
          <div className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text-primary">{rangeFrom}</span>
            –<span className="font-semibold text-text-primary">{rangeTo}</span>{" "}
            of <span className="font-semibold text-text-primary">{total}</span>
          </div>

          {/* Right: page size + buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Page size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Rows</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="
                  h-9 rounded border border-border-light bg-background
                  px-3 text-sm text-text-primary
                  outline-none focus:ring-2 focus:ring-primary/30 transition
                "
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="
                  h-9 w-9 inline-flex items-center justify-center rounded
                  border border-border-light bg-background
                  text-text-primary
                  hover:bg-background-section transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="Previous"
              >
                <FiChevronLeft />
              </button>

              {pageButtons.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`
                    h-9 min-w-[36px] px-3 inline-flex items-center justify-center rounded
                    border border-border-light
                    text-sm font-semibold
                    transition
                    ${
                      p === safePage
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-text-primary hover:bg-background-section"
                    }
                  `}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="
                  h-9 w-9 inline-flex items-center justify-center rounded
                  border border-border-light bg-background
                  text-text-primary
                  hover:bg-background-section transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="Next"
              >
                <FiChevronRight />
              </button>
            </div>

            {/* Page count */}
            <div className="text-sm text-text-secondary">
              Page{" "}
              <span className="font-semibold text-text-primary">
                {safePage}
              </span>{" "}
              /{" "}
              <span className="font-semibold text-text-primary">
                {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
