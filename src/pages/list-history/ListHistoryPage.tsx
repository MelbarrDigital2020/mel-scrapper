// src/pages/list-history/ListHistoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";
import {
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsUp,
  FiChevronsDown,
  FiLayers,
  FiUsers,
  FiBriefcase,
  FiEye,
  FiCopy,
} from "react-icons/fi";



/* ---------------- Types ---------------- */
type ListEntity = "all" | "contacts" | "companies";

type ListRow = {
  id: string;
  name: string; // list_name
  entity: "contacts" | "companies"; // entity
  leads: number; // row_count
  createdAtLabel: string; // formatted (backend preferred)
  createdAtTs: number; // sortable timestamp
  // optional extras if backend sends:
  // description?: string;
  // source?: "contacts" | "companies";
};

type SortKey = "createdAt" | "name" | "entity" | "leads";
type SortDir = "asc" | "desc";

type ApiPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ListHistoryApiResponse = {
  success: boolean;
  rows: ListRow[];
  pagination: ApiPagination;
};
/* ---------------- Dummy Data (for UI development) ---------------- */
const DUMMY_LIST: ListRow = {
  id: "demo-list-001",
  name: "Sample Contacts – SaaS Founders (US)",
  entity: "contacts",
  leads: 128,
  createdAtLabel: "Feb 2, 2026",
  createdAtTs: Date.now() - 1000 * 60 * 60 * 24, // yesterday
};

/* ---------------- Small UI Helpers ---------------- */
function EntityBadge({ entity }: { entity: ListRow["entity"] }) {
  const ui =
    entity === "contacts"
      ? {
          icon: <FiUsers className="shrink-0" />,
          text: "Contacts",
          cls: "bg-primary/10 text-primary",
        }
      : {
          icon: <FiBriefcase className="shrink-0" />,
          text: "Companies",
          cls: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full text-xs font-semibold
        ${ui.cls}
      `}
      title={ui.text}
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

export default function ListHistoryPage() {
  const [entity, setEntity] = useState<ListEntity>("all");
  const [search, setSearch] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Data
const [rows, setRows] = useState<ListRow[]>([DUMMY_LIST]);
const [total, setTotal] = useState<number>(1);
const [totalPages, setTotalPages] = useState<number>(1);
  const safePage = Math.min(page, totalPages);
  const [loading, setLoading] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when controls change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, debouncedSearch, sortKey, sortDir, pageSize]);

  // Fetch list history
  useEffect(() => {
    let cancelled = false;

    async function fetchLists() {
      setLoading(true);
      try {
        // ✅ Suggested backend: GET /list-history
        // params: entity, search, sortKey, sortDir, page, pageSize
        const res = await api.get<ListHistoryApiResponse>("/list-history", {
          params: {
            entity,
            search: debouncedSearch,
            sortKey,
            sortDir,
            page: safePage,
            pageSize,
          },
        });

        if (cancelled) return;

const apiRows = res.data.rows || [];

if (apiRows.length === 0) {
  // ✅ show demo list when no data
  setRows([DUMMY_LIST]);
  setTotal(1);
  setTotalPages(1);
} else {
  setRows(apiRows);
  setTotal(res.data.pagination?.total ?? apiRows.length);
  setTotalPages(res.data.pagination?.totalPages ?? 1);
}

      } catch (err) {
        if (cancelled) return;
        console.error("List history fetch failed:", err);
       
  // ✅ Fallback to dummy list (so UI never empty in dev/demo)
  setRows([DUMMY_LIST]);
  setTotal(1);
  setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLists();
    return () => {
      cancelled = true;
    };
  }, [entity, debouncedSearch, sortKey, sortDir, safePage, pageSize]);

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

  const pageButtons = useMemo(() => {
    const maxButtons = 5;
    const pages: number[] = [];

    let start = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [safePage, totalPages]);

  async function copyListName(name: string) {
    try {
      await navigator.clipboard.writeText(name);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            List History
          </h1>
          <p className="text-sm text-text-secondary">
            View all lists you created from Contacts and Companies.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded border border-border-light bg-background px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-text-secondary">
            {total} list{total === 1 ? "" : "s"}
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
                onChange={(e) => setEntity(e.target.value as ListEntity)}
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
                <Th label="List Name" k="name" />
                <Th label="Entity" k="entity" />
                <Th label="Leads" k="leads" />
                <Th label="Created" k="createdAt" />
                <th className="px-5 py-3 text-xs font-semibold text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-text-secondary"
                  >
                    Loading list history...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-text-secondary"
                  >
                    No lists found. Try changing filters or search.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-border-light hover:bg-background-section/60 transition"
                    >
                      {/* List */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <span
                            className="
                              inline-flex items-center justify-center
                              h-9 w-9 rounded-xl border
                              bg-background-section border-border-light
                            "
                            title="List"
                          >
                            <FiLayers className="text-text-secondary" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary truncate">
                                {row.name}
                              </span>

                              <button
                                onClick={() => copyListName(row.name)}
                                className="
                                  h-8 w-8 inline-flex items-center justify-center
                                  rounded-lg border border-border-light
                                  bg-background text-text-secondary
                                  hover:bg-background-section hover:text-text-primary
                                  transition
                                "
                                title="Copy list name"
                              >
                                <FiCopy />
                              </button>
                            </div>

                            <span className="text-xs text-text-secondary">
                              {row.createdAtLabel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="px-5 py-4">
                        <EntityBadge entity={row.entity} />
                      </td>

                      {/* Leads */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-text-primary">
                          {Number(row.leads || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-text-primary">
                          {row.createdAtLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* ✅ View list (adjust route as per your app) */}
                          <NavLink
                            to={`/lists/${row.id}`}
                            className="
                              inline-flex items-center gap-2
                              h-8 px-3 rounded
                              border border-border-light bg-background
                              text-sm font-semibold text-text-primary
                              hover:bg-background-section transition
                            "
                            title="View list"
                          >
                            <FiEye />
                            View
                          </NavLink>

                          {/* ✅ Quick open in correct module (optional) */}
                          <NavLink
                            to={
                              row.entity === "contacts"
                                ? `/contacts?listId=${row.id}`
                                : `/companies?listId=${row.id}`
                            }
                            className="
                              inline-flex items-center gap-2
                              h-8 px-3 rounded
                              bg-primary text-white text-sm font-semibold
                              hover:opacity-95 active:opacity-90 transition
                              shadow-[0_10px_20px_rgba(0,0,0,0.08)]
                            "
                            title="Open in module"
                          >
                            {row.entity === "contacts" ? <FiUsers /> : <FiBriefcase />}
                            Open
                          </NavLink>
                        </div>
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
            <span className="font-semibold text-text-primary">{rangeFrom}</span>–
            <span className="font-semibold text-text-primary">{rangeTo}</span>{" "}
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
              <span className="font-semibold text-text-primary">{safePage}</span>{" "}
              /{" "}
              <span className="font-semibold text-text-primary">{totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
