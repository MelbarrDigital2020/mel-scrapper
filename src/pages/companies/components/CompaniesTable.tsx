import { useState, useMemo, useRef, useEffect } from "react";
import CompaniesModal from "./CompaniesModal";
import { Section, Info, Divider } from "../../shared/components/DrawerSections";
import api from "../../../services/api";
import {
  FiPlus,
  FiEye,
  FiDownload,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
  FiLinkedin,
} from "react-icons/fi";

/* ---------- Company Logo Helper ---------- */
const getCompanyLogo = (domain: string) =>
  `https://logos-api.apistemic.com/domain:${domain}`;

/* ---------- Types ---------- */
type Company = {
  id: string;
  companyName: string;
  domain: string;
  description?: string;
  // ✅ single value (table + sorting)
  industry: string;
  industries?: string[];
  phone: string;
  linkedin: string;
  website?: string;
  twitter?: string;
  location: string;
  headquarters?: string;
  employees: string;
  revenue: string;
  foundedYear?: string;
};

// Frontend header keys (CompaniesModal) -> Backend export header keys (export.service.ts)
const COMPANY_EXPORT_HEADER_MAP: Record<string, string> = {
  companyName: "name",
  domain: "domain",
  phone: "company_phone",
  linkedin: "linkedin_url",
  location: "country",
  industry: "industry",
  employees: "employee_range",
  revenue: "revenue_range",

  // credit-based (only if you want to allow later)
  website: "website",
  twitter: "twitter", // only if exists in DB; otherwise remove
  headquarters: "full_address", // or address_line1
  foundedYear: "founded_year", // only if exists; otherwise remove
  description: "description", // only if exists; otherwise remove
};

function downloadExportJob(jobId: string) {
  const base = api.defaults.baseURL || "http://localhost:5000/api";
  window.open(`${base}/export/jobs/${jobId}/download`, "_blank");
}

async function waitForExportJob(
  jobId: string,
  opts?: { intervalMs?: number; timeoutMs?: number },
) {
  const intervalMs = opts?.intervalMs ?? 1500;
  const timeoutMs = opts?.timeoutMs ?? 2 * 60 * 1000;

  const started = Date.now();

  while (true) {
    const res = await api.get(`/export/jobs/${jobId}`);
    const job = res.data?.job;

    if (!job) throw new Error("Export job not found");

    if (job.status === "completed") return job;
    if (job.status === "failed") {
      throw new Error(job.error_message || "Export failed");
    }

    if (Date.now() - started > timeoutMs) {
      throw new Error("Export timed out. Please try again.");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export default function CompaniesTable({
  search,
  filters,
  onLoadingChange,
}: {
  search: string;
  filters: {
    company: string[];
    employees: string[];
    revenue: string[];
    industry: string[];
    location: string[];
    intent: string[];
  };
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [isListOpen, setIsListOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  const listDropdownRef = useRef<HTMLDivElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Sort Dropdown Ref ---------- */
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  /* ---------- SORT STATE ---------- */
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [sortBy, setSortBy] = useState<
    "companyName" | "industry" | "employees" | "revenue" | ""
  >("");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [rows, setRows] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [exportMode, setExportMode] = useState<"selected" | "filtered">(
    "selected",
  );
  // Exporting State
  const [exporting, setExporting] = useState(false);

  const isValidLink = (url?: string) =>
    !!url && /^https?:\/\//i.test(url.trim());

  /* ---------- Search ---------- */

  const visibleRows = useMemo(() => rows, [rows]);

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedRows.has(row.id));

  /* ---------- Selection ---------- */
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const toggleSelectAllVisible = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleRows.forEach((row) => next.delete(row.id));
      } else {
        visibleRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  /* ---------- Close dropdowns ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        listDropdownRef.current &&
        !listDropdownRef.current.contains(target)
      ) {
        setIsListOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(target)
      ) {
        setIsExportOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filters, rowsPerPage]);

  useEffect(() => {
    const fetchCompanies = async () => {
      console.log("✅ Companies search payload:", {
        search,
        filters,
        page,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      });
      try {
        setLoading(true);

        const res = await api.post("/companies/search", {
          search,
          filters,
          page,
          limit: rowsPerPage,
          sortBy:
            sortBy === "companyName"
              ? "name"
              : sortBy === "employees"
                ? "employee_range"
                : sortBy === "revenue"
                  ? "revenue_range"
                  : sortBy === "industry"
                    ? "industry"
                    : "name",
          sortOrder,
        });

        const data = res.data?.data ?? [];
        const mapped: Company[] = data.map((c: any) => ({
          id: c.id,
          companyName: c.name ?? "",
          domain: c.domain ?? "",
          phone: c.company_phone ?? "",
          linkedin: c.linkedin_url ?? "",
          website: c.website ?? undefined,
          location: c.country ?? "",
          industry: c.industry ?? "",
          employees: c.employee_range ?? "",
          revenue: c.revenue_range ?? "",
        }));

        setRows(mapped);
        setSelectedRows(new Set());
        setTotal(res.data?.total ?? 0);
      } catch (e) {
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search, filters, page, rowsPerPage, sortBy, sortOrder]);

  // Export Code
  const handleExport = async (
    format: "csv" | "excel",
    headerKeys: string[],
  ) => {
    const mappedHeaders = headerKeys
      .map((k) => COMPANY_EXPORT_HEADER_MAP[k])
      .filter(Boolean);

    const payload =
      exportMode === "selected"
        ? {
            entity: "companies",
            mode: "selected",
            format,
            headers: mappedHeaders,
            ids: Array.from(selectedRows),
          }
        : {
            entity: "companies",
            mode: "filtered",
            format,
            headers: mappedHeaders,
            query: {
              search: search?.trim() || undefined,
              filters,
              sortBy:
                sortBy === "companyName"
                  ? "name"
                  : sortBy === "employees"
                    ? "employee_range"
                    : sortBy === "revenue"
                      ? "revenue_range"
                      : sortBy === "industry"
                        ? "industry"
                        : undefined,
              sortOrder,
            },
          };

    try {
      setExporting(true);

      const createRes = await api.post("/export", payload);
      const jobId = createRes.data?.jobId;

      if (!jobId) throw new Error("JobId missing from export response");

      await waitForExportJob(jobId);

      downloadExportJob(jobId);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col overflow-hidden shadow-sm">
      {/* 🔝 TOP BAR — SAME AS CONTACTS */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light text-sm bg-background-card">
        <div className="flex items-center gap-3">
          <div ref={listDropdownRef} className="relative">
            <button
              disabled={selectedRows.size === 0}
              onClick={() => {
                setIsListOpen((v) => !v);
                setIsExportOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition
                ${
                  selectedRows.size === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "border-border-light hover:bg-background"
                }`}
            >
              <FiPlus size={14} />
              List
              <FiChevronDown size={14} />
            </button>

            {isListOpen && selectedRows.size > 0 && (
              <div className="absolute mt-2 w-44 bg-background-card border border-border-light rounded-xl shadow-xl z-50">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsListOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-background"
                >
                  ➕ Add to List
                </button>
              </div>
            )}
          </div>

          <button
            disabled={selectedRows.size === 0}
            className={`h-9 px-4 rounded-lg font-medium transition
              ${
                selectedRows.size === 0
                  ? "opacity-40 cursor-not-allowed bg-primary/30"
                  : "bg-primary text-white hover:brightness-110"
              }`}
          >
            Save
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔽 Sort Dropdown */}
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => {
                setIsSortOpen((v) => !v);
                setIsExportOpen(false);
                setIsListOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border
                        border-border-light hover:bg-background transition"
            >
              ↑↓ Sort
              <FiChevronDown size={14} />
            </button>

            {isSortOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-background-card
                          border border-border-light rounded-xl shadow-xl
                          z-50 p-3 space-y-3"
              >
                {/* Sort By */}
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg bg-background
                              border border-border-light text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="companyName">Company</option>
                    <option value="industry">Industry</option>
                    <option value="employees">Employees</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>

                {/* Order */}
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="w-full h-8 px-2 rounded-lg bg-background
                              border border-border-light text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                {/* Apply */}
                {/* <button
                  onClick={() => setIsSortOpen(false)}
                  disabled={!sortBy}
                  className={`w-full h-9 rounded-lg text-sm transition
                    ${
                      sortBy
                        ? "bg-primary text-white hover:brightness-110"
                        : "bg-primary/30 cursor-not-allowed"
                    }`}
                >
                  Apply
                </button> */}
              </div>
            )}
          </div>

          {/* Export Dropdown */}

          <div ref={exportDropdownRef} className="relative">
            <button
              disabled={exporting || total === 0}
              onClick={() => {
                setIsExportOpen((v) => !v);
                setIsListOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border
                ${
                  exporting || total === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "border-border-light hover:bg-background"
                }`}
            >
              <FiDownload size={14} />
              Export
              <FiChevronDown size={14} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-card border border-border-light rounded-xl shadow-xl z-50">
                <button
                  disabled={exporting || selectedRows.size === 0}
                  onClick={() => {
                    setExportMode("selected");
                    setIsExportModalOpen(true);
                    setIsExportOpen(false);
                  }}
                  className="w-full px-4 py-2 flex gap-2 hover:bg-background"
                >
                  <FiFileText size={14} />
                  Export Selected
                </button>

                <button
                  disabled={exporting}
                  onClick={() => {
                    setExportMode("filtered");
                    setIsExportModalOpen(true);
                    setIsExportOpen(false);
                  }}
                  className="w-full px-4 py-2 flex gap-2 hover:bg-background"
                >
                  <FiGrid size={14} />
                  Export All Filtered
                </button>
              </div>
            )}
          </div>

          <span className="text-text-secondary">Rows</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="h-9 px-3 rounded-lg bg-background border border-border-light"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          {selectedRows.size > 0 && (
            <span className="text-primary font-semibold">
              Selected: {selectedRows.size}
            </span>
          )}
        </div>
      </div>

      {/* 📊 TABLE — SAME INTERACTIONS */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-[1600px] w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-background-card border-b border-border-light">
            <tr className="text-text-secondary text-left">
              <th className="sticky left-0 z-30 bg-background-card p-3 w-12 border-r border-border-light">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                />
              </th>
              <th className="sticky left-12 z-30 bg-background-card p-3 w-[260px] border-r border-border-light">
                Company
              </th>
              <th className="p-3">Domain</th>
              <th className="p-3">Phone</th>
              <th className="p-3">LinkedIn</th>
              <th className="p-3">Location</th>
              <th className="p-3">Industry</th>
              <th className="p-3">Employees</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="group border-b border-border-light
                hover:bg-background hover:-translate-y-[1px]
                hover:shadow-sm transition-all duration-150"
              >
                <td className="sticky left-0 z-10 bg-background-card p-3 w-12 border-r border-border-light">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>

                <td className="sticky left-12 z-10 bg-background-card p-3 w-[260px] font-medium border-r border-border-light group-hover:bg-background transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCompanyLogo(row.domain)}
                      className="h-6 w-6 rounded-md border border-border-light bg-white"
                    />
                    {row.companyName}
                  </div>
                </td>

                <td className="p-3">{row.domain}</td>
                <td className="p-3">{row.phone}</td>
                <td className="p-3">
                  {isValidLink(row.linkedin) ? (
                    <a
                      href={row.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open LinkedIn"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg
                 text-blue-600 hover:bg-blue-600/10 hover:text-blue-700 transition"
                      onClick={(e) => e.stopPropagation()} // ✅ prevents row click side-effects
                    >
                      <FiLinkedin size={18} />
                    </a>
                  ) : (
                    <span
                      title="LinkedIn not available"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg
                 text-gray-400 cursor-not-allowed opacity-70"
                    >
                      <FiLinkedin size={18} />
                    </span>
                  )}
                </td>

                <td className="p-3">{row.location}</td>
                <td className="p-3">{row.industry}</td>
                <td className="p-3">{row.employees}</td>
                <td className="p-3">{row.revenue}</td>

                <td className="p-3">
                  <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition">
                    <button
                      title="Add to List"
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center
                                hover:bg-primary/10 hover:text-primary transition"
                    >
                      <FiPlus size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawerLoading(true);
                        setViewCompany(row);

                        // simulate API delay
                        setTimeout(() => {
                          setIsDrawerLoading(false);
                        }, 900);
                      }}
                      title="View Company"
                      className="h-7 w-7 rounded-lg flex items-center justify-center
                                hover:bg-background hover:shadow-sm transition"
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleRows.length === 0 && (
          <div className="p-6 text-center text-text-secondary">
            No matching companies found
          </div>
        )}
      </div>

      {/* 🔽 FOOTER — SAME */}
      <div className="border-t border-border-light px-4 py-2 flex justify-between bg-background-card text-sm">
        <span className="text-text-secondary">
          {total === 0
            ? "0 results"
            : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, total)} of ${total}`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 w-9 rounded-lg border border-border-light hover:bg-background disabled:opacity-40"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() =>
              setPage((p) => (p * rowsPerPage < total ? p + 1 : p))
            }
            disabled={page * rowsPerPage >= total}
            className="h-9 w-9 rounded-lg border border-border-light hover:bg-background disabled:opacity-40"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {isExportModalOpen && (
        <CompaniesModal
          mode="export"
          selectedCount={exportMode === "selected" ? selectedRows.size : total}
          canUseCredits={false}
          onClose={() => setIsExportModalOpen(false)}
          onExport={(format, headerKeys) => handleExport(format, headerKeys)}
        />
      )}

      {/* ================= VIEW COMPANY DRAWER ================= */}
      {viewCompany && (
        <div className="fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30"
            onClick={() => setViewCompany(null)}
          />

          {/* Drawer */}
          <div
            className="w-[440px] bg-background-card border-l border-border-light
                          shadow-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="p-5 border-b border-border-light flex justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getCompanyLogo(viewCompany.domain)}
                  className="h-10 w-10 rounded-md border border-border-light bg-white"
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {viewCompany.companyName}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {viewCompany.domain}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewCompany(null)}
                className="h-8 w-8 rounded-lg hover:bg-background
                          flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            {isDrawerLoading ? (
              <DrawerSkeleton />
            ) : (
              <div className="p-5 space-y-6">
                {/* Company Details */}
                <Section title="Company Details">
                  {viewCompany.description && (
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {viewCompany.description}
                    </p>
                  )}
                </Section>

                {/* Industries */}
                {viewCompany.industries &&
                  viewCompany.industries.length > 0 && (
                    <Section title="Industries">
                      <div className="flex flex-wrap gap-2">
                        {viewCompany.industries.map((ind) => (
                          <span
                            key={ind}
                            className="px-2 py-0.5 rounded-md bg-primary/10
                                  text-primary text-xs"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                <Divider />

                {/* Business Information */}
                <Section title="Business Information">
                  <Info
                    label="Founded"
                    value={viewCompany.foundedYear ?? "—"}
                  />
                  <Info label="Employees" value={viewCompany.employees} />
                  <Info label="Revenue" value={viewCompany.revenue} />
                  <Info
                    label="Headquarters"
                    value={viewCompany.headquarters ?? viewCompany.location}
                  />
                </Section>

                <Divider />

                {/* Contact & Web */}
                <Section title="Contact & Web">
                  <Info label="Phone" value={viewCompany.phone} />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Website</span>
                    {viewCompany.website ? (
                      <a
                        href={viewCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {viewCompany.domain}
                      </a>
                    ) : (
                      <span className="font-medium">—</span>
                    )}
                  </div>
                </Section>

                <Divider />

                {/* Links */}
                <Section title="Links">
                  <div className="flex items-center gap-3">
                    {viewCompany.linkedin &&
                      viewCompany.linkedin.startsWith("http") && (
                        <a
                          href={viewCompany.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 w-9 rounded-lg border border-border-light
                                  hover:bg-background flex items-center justify-center"
                          title="LinkedIn"
                        >
                          in
                        </a>
                      )}

                    {viewCompany.website && (
                      <a
                        href={viewCompany.website}
                        target="_blank"
                        className="h-9 w-9 rounded-lg border border-border-light
                                hover:bg-background flex items-center justify-center"
                        title="Website"
                      >
                        🌐
                      </a>
                    )}

                    {viewCompany.twitter && (
                      <a
                        href={viewCompany.twitter}
                        target="_blank"
                        className="h-9 w-9 rounded-lg border border-border-light
                                hover:bg-background flex items-center justify-center"
                        title="Twitter / X"
                      >
                        𝕏
                      </a>
                    )}
                  </div>
                </Section>
              </div>
            )}
            {/* Footer Actions */}
            <div className="p-5 border-t border-border-light flex gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setViewCompany(null);
                }}
                disabled={isDrawerLoading}
                className={`flex-1 h-9 rounded-lg border border-border-light
                ${isDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-background"}`}
              >
                Add to List
              </button>

              <button
                onClick={() => {
                  setIsExportModalOpen(true);
                  setViewCompany(null); // close drawer
                }}
                disabled={isDrawerLoading}
                className={`flex-1 h-9 rounded-lg bg-primary text-white
                  ${isDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
              >
                Export Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function DrawerSkeleton() {
  return (
    <div className="p-5 space-y-6 animate-pulse">
      {/* Title */}
      <div className="flex gap-3 items-center">
        <div className="h-10 w-10 rounded-md bg-border-light" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/2 bg-border-light rounded" />
          <div className="h-3 w-1/3 bg-border-light rounded" />
        </div>
      </div>

      {/* Paragraph */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-border-light rounded" />
        <div className="h-3 w-5/6 bg-border-light rounded" />
        <div className="h-3 w-4/6 bg-border-light rounded" />
      </div>

      <Divider />

      {/* Info rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-1/3 bg-border-light rounded" />
          <div className="h-3 w-1/4 bg-border-light rounded" />
        </div>
      ))}

      <Divider />

      {/* Pills */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 rounded-md bg-border-light" />
        ))}
      </div>
    </div>
  );
}
