import { useEffect, useRef, useState } from "react";
import ContactsModal from "./ContactsModal";
import api from "../../../services/api"; // ✅ adjust path if needed
import { FiCopy, FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { Section, Info, Divider } from "../../shared/components/DrawerSections";
import { useToast } from "../../shared/toast/ToastContext";

import {
  FiEye,
  FiPlus,
  FiDownload,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
} from "react-icons/fi";

// Frontend header keys (ContactsModal) -> Backend export header keys (export.service.ts)
const CONTACT_EXPORT_HEADER_MAP: Record<string, string> = {
  name: "name",
  jobTitle: "job_title",

  // These are company fields (from JOIN in export service)
  company: "company_name",
  companyDomain: "company_domain",

  // Your table shows domain separately; in DB it’s email_domain. Use email_domain as "domain"
  domain: "email_domain",

  location: "country",
  industry: "company_industry",
  employees: "company_employee_range",
  revenue: "company_revenue_range",

  // credit fields
  email: "email",
  phone: "company_phone", // ⚠️ contacts table doesn't have phone column. Company phone exists.
  linkedin: "linkedin_url",
};

/* ---------- Company Logo Helper ---------- */
const getCompanyLogo = (domain: string) =>
  `https://logos-api.apistemic.com/domain:${domain}`;

/* ---------- Types ---------- */
type Contact = {
  id: string; // backend returns uuid/string
  name: string;
  jobTitle: string | null;
  company: string | null;
  companyDomain: string | null;
  email: string | null;
  domain: string | null;
  phone: string | null;
  linkedin: string | null;
  location: string | null;
  industry: string | null;
  employees: string | null;
  revenue: string | null;
  intentSignal: string | null;
};

type FiltersState = {
  jobTitles: string[];
  jobLevel: string[];
  location: string[];
  company: string[];
  employees: string[];
  industry: string[];
  emailStatus: string[];
  intent: string[];
};

type ApiResponse = {
  success: boolean;
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
// ✅ Convert /api/export -> jobId -> poll -> download
async function waitForExportJob(
  jobId: string,
  opts?: { intervalMs?: number; timeoutMs?: number },
) {
  const intervalMs = opts?.intervalMs ?? 1500;
  const timeoutMs = opts?.timeoutMs ?? 2 * 60 * 1000; // 2 minutes

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

export default function ContactsTable({
  search,
  filters,
}: {
  search: string;
  filters: FiltersState;
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ pagination state
  const [page, setPage] = useState(1);

  // ✅ backend data
  const [rows, setRows] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // selection uses string ids now
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [isListOpen, setIsListOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isContactDrawerLoading, setIsContactDrawerLoading] = useState(false);

  /* ---------- Dropdown Refs ---------- */
  const listDropdownRef = useRef<HTMLDivElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------- View Contact Drawer ---------- */
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [copied, setCopied] = useState<"email" | "linkedin" | null>(null);

  /* ---------- SORT STATE ---------- */
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "name" | "company" | "revenue" | "employees" | ""
  >("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [exportMode, setExportMode] = useState<"selected" | "filtered">(
    "selected",
  );

  // Exporting Button COde
  const [exporting, setExporting] = useState(false);

  const [readyDownload, setReadyDownload] = useState<{
    jobId: string;
    fileName?: string;
  } | null>(null);

  const { showToast } = useToast();
  const normalizedSearch = search.trim();

  // ✅ reset page + selection when search/filters change
  useEffect(() => {
    setPage(1);
    setSelectedRows(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, JSON.stringify(filters)]);

  // ✅ fetch contacts from backend
  useEffect(() => {
    let mounted = true;

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse>("/contacts", {
          params: {
            search: normalizedSearch || undefined,
            page,
            limit: rowsPerPage,
            sortBy: sortBy || undefined,
            sortOrder,
            ...filters, // ✅ arrays will be sent as query params
          },
          paramsSerializer: {
            // ✅ ensures arrays become: jobTitles[]=a&jobTitles[]=b
            indexes: null,
          } as any,
        });

        if (!mounted) return;

        const payload = res.data;
        setRows(payload.data || []);
        setTotal(payload.pagination?.total ?? 0);
        setTotalPages(payload.pagination?.totalPages ?? 1);
      } catch (err) {
        console.error("Fetch contacts failed:", err);
        if (!mounted) return;
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchContacts();

    return () => {
      mounted = false;
    };
  }, [normalizedSearch, filters, page, rowsPerPage, sortBy, sortOrder]);

  const allVisibleSelected =
    rows.length > 0 && rows.every((row) => selectedRows.has(row.id));

  // ---------- Copy to Clipboard Handler ----------
  const copyToClipboard = async (text: string, type: "email" | "linkedin") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  /* ---------- Handlers ---------- */
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        rows.forEach((row) => next.delete(row.id));
      } else {
        rows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  /* ---------- Close dropdowns on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ pagination display (1–10 of total)
  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, total);

  function getDownloadUrl(jobId: string) {
    const base = (api.defaults.baseURL || "http://localhost:4010/api").replace(
      /\/+$/,
      "",
    );
    return `${base}/export/jobs/${jobId}/download`;
  }

  function showExportReadyToast(fileName?: string) {
    showToast({
      type: "success",
      title: "Export ready",
      message: `${fileName || "Your file"} is ready. Click Download below.`,
    });
  }

  // Handle Export Code
  const handleExport = async (
    format: "csv" | "excel",
    headerKeys: string[],
    listName: string,
  ) => {
    // ✅ modal keys already match backend keys, so use directly
    const headers = headerKeys;

    if (!listName?.trim()) return;
    if (headers.length === 0) return;

    if (exportMode === "selected" && selectedRows.size === 0) return;

    const payload =
      exportMode === "selected"
        ? {
            entity: "contacts",
            mode: "selected",
            format,
            headers, // ✅ direct
            ids: Array.from(selectedRows),
            listName: listName.trim(),
          }
        : {
            entity: "contacts",
            mode: "filtered",
            format,
            headers, // ✅ direct
            listName: listName.trim(),
            query: {
              search: normalizedSearch || undefined,
              filters,
              sortBy: sortBy || undefined,
              sortOrder,
            },
          };

    try {
      setReadyDownload(null);
      setExporting(true);

      const createRes = await api.post("/export", payload);
      const jobId = createRes.data?.jobId;
      if (!jobId) throw new Error("JobId missing from export response");

      const job = await waitForExportJob(jobId);
      showExportReadyToast(job?.file_name);
      setReadyDownload({ jobId, fileName: job?.file_name });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Export failed. Please try again.";

      showToast({ type: "error", title: "Export failed", message: msg });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col overflow-hidden shadow-sm">
      {/* 🔝 Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light text-sm bg-background-card">
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          {/* List Dropdown */}
          <div ref={listDropdownRef} className="relative">
            <button
              disabled={selectedRows.size === 0}
              onClick={() => {
                setIsListOpen((v) => !v);
                setIsExportOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition-all
                ${
                  selectedRows.size === 0
                    ? "opacity-40 cursor-not-allowed border-border-light"
                    : "border-border-light hover:bg-background hover:shadow-sm"
                }`}
            >
              <FiPlus size={14} />
              List
              <FiChevronDown size={14} />
            </button>

            {isListOpen && selectedRows.size > 0 && (
              <div className="absolute left-0 mt-2 w-44 bg-background-card border border-border-light rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsContactsModalOpen(true);
                    setIsListOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-background transition"
                >
                  ➕ Add to List
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition">
                  📁 New List
                </button>
              </div>
            )}
          </div>

          {/* Save */}
          <button
            disabled={selectedRows.size === 0}
            className={`h-9 px-4 rounded-lg font-medium transition-all
              ${
                selectedRows.size === 0
                  ? "opacity-40 cursor-not-allowed bg-primary/30"
                  : "bg-primary text-white hover:brightness-110 shadow-sm"
              }`}
          >
            Save
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* 🔽 Sort Dropdown */}
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => {
                setIsSortOpen((v) => !v);
                setIsExportOpen(false);
                setIsListOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-border-light hover:bg-background transition"
            >
              ↑↓ Sort
              <FiChevronDown size={14} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-card border border-border-light rounded-xl shadow-xl z-50 p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-border-light text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="name">Name</option>
                    <option value="company">Company</option>
                    <option value="revenue">Revenue</option>
                    <option value="employees">Employees</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="w-full h-8 px-2 rounded-lg bg-background border border-border-light text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

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

          {/* 🔽 Export Dropdown */}
          <div ref={exportDropdownRef} className="relative">
            <button
              disabled={exporting || total === 0}
              onClick={() => {
                setIsExportOpen((v) => !v);
                setIsListOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition
              ${exporting || total === 0 ? "opacity-40 cursor-not-allowed" : "border-border-light hover:bg-background"}`}
            >
              <FiDownload size={14} />
              Export
              <FiChevronDown size={14} />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-card border border-border-light rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  disabled={exporting || selectedRows.size === 0}
                  onClick={() => {
                    setExportMode("selected");
                    setIsExportModalOpen(true);
                    setIsExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition"
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition"
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
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
              setSelectedRows(new Set());
              setIsListOpen(false);
              setIsExportOpen(false);
            }}
            className="h-9 px-3 rounded-lg bg-background border border-border-light focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>

          {selectedRows.size > 0 && (
            <span className="text-primary font-semibold">
              Selected: {selectedRows.size}
            </span>
          )}
        </div>
      </div>

      {readyDownload && (
        <div className="fixed bottom-6 right-6 z-[500]">
          <div className="bg-background-card border border-border-light shadow-xl rounded-2xl p-4 w-[340px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Export ready</div>
                <div className="text-xs text-text-secondary mt-1">
                  {readyDownload.fileName || "Your file is ready to download"}
                </div>
              </div>

              <button
                onClick={() => setReadyDownload(null)}
                className="h-8 w-8 rounded-lg border border-border-light hover:bg-background flex items-center justify-center"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  window.open(getDownloadUrl(readyDownload.jobId), "_blank");
                  setReadyDownload(null);
                }}
                className="flex-1 h-9 rounded-lg bg-primary text-white hover:brightness-110 transition"
              >
                Download
              </button>

              <button
                onClick={() => setReadyDownload(null)}
                className="h-9 px-3 rounded-lg border border-border-light hover:bg-background transition text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-[1800px] w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-background-card border-b border-border-light">
            <tr className="text-left text-text-secondary">
              <th className="sticky left-0 z-30 bg-background-card p-3 w-12 border-r border-border-light">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                />
              </th>
              <th className="sticky left-12 z-30 bg-background-card p-3 w-[220px] border-r border-border-light">
                Name
              </th>
              <th className="p-3">Job Title</th>
              <th className="p-3">Company</th>
              <th className="p-3">Email</th>
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
            {loading ? (
              <tr>
                <td
                  colSpan={14}
                  className="p-6 text-center text-text-secondary"
                >
                  Loading contacts...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  className="p-6 text-center text-text-secondary"
                >
                  No matching contacts found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="group border-b border-border-light hover:bg-background hover:-translate-y-[1px] hover:shadow-sm transition-all duration-150 cursor-pointer"
                >
                  <td className="sticky left-0 z-10 bg-background-card p-3 w-12 border-r border-border-light">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>

                  <td className="sticky left-12 z-10 bg-background-card p-3 w-[220px] font-medium border-r border-border-light group-hover:bg-background transition">
                    <HighlightText
                      text={row.name || "Unknown"}
                      query={normalizedSearch.toLowerCase()}
                    />
                  </td>

                  <td className="p-3">{row.jobTitle ?? "-"}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCompanyLogo(row.companyDomain || "")}
                        alt={`${row.company || "Company"} logo`}
                        className="h-6 w-6 rounded-md border border-border-light bg-white object-contain"
                      />
                      <span className="font-medium">{row.company ?? "-"}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <HighlightText
                      text={row.email ?? "-"}
                      query={normalizedSearch.toLowerCase()}
                    />
                  </td>

                  <td className="p-3">{row.domain ?? "-"}</td>
                  <td className="p-3">{row.phone ?? "-"}</td>
                  <td className="p-3">{row.linkedin ?? "-"}</td>
                  <td className="p-3">{row.location ?? "-"}</td>
                  <td className="p-3">{row.industry ?? "-"}</td>
                  <td className="p-3">
                    {row.intentSignal ? (
                      <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                        {row.intentSignal}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{row.employees ?? "-"}</td>
                  <td className="p-3">{row.revenue ?? "-"}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setIsContactsModalOpen(true)}
                        title="Add to List"
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition"
                      >
                        <FiPlus size={16} />
                      </button>

                      <button
                        title="View Contact"
                        onClick={() => {
                          setIsContactDrawerLoading(true);
                          setViewContact(row);
                          setTimeout(
                            () => setIsContactDrawerLoading(false),
                            500,
                          );
                        }}
                        className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-background hover:shadow-sm transition"
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔽 Pagination */}
      <div className="shrink-0 border-t border-border-light px-4 py-2 flex items-center justify-between bg-background-card text-sm">
        <span className="text-text-secondary">
          {from}–{to} of {total.toLocaleString()}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`h-9 w-9 rounded-lg border border-border-light transition
              ${page <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-background"}`}
          >
            <FiChevronLeft />
          </button>

          <span className="text-xs text-text-secondary">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`h-9 w-9 rounded-lg border border-border-light transition
              ${page >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-background"}`}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* ================= LIST MODAL ================= */}
      {isContactsModalOpen && (
        <ContactsModal
          mode="list"
          onClose={() => setIsContactsModalOpen(false)}
        />
      )}

      {/* ================= EXPORT MODAL ================= */}
      {isExportModalOpen && (
        <ContactsModal
          mode="export"
          selectedCount={exportMode === "selected" ? selectedRows.size : total}
          onClose={() => setIsExportModalOpen(false)}
          onExport={(format, headerKeys, exportListName) =>
            handleExport(format, headerKeys, exportListName)
          }
        />
      )}

      {/* ================= VIEW CONTACT DRAWER ================= */}
      {viewContact && (
        <div className="fixed inset-0 z-[200] flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setViewContact(null)}
          />

          <div className="w-[440px] bg-background-card border-l border-border-light shadow-xl overflow-y-auto">
            <div className="p-5 border-b border-border-light flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold leading-tight">
                  {viewContact.name}
                </h2>
                <p className="text-sm text-text-secondary">
                  {viewContact.jobTitle ?? "-"}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={
                      viewContact.email ? `mailto:${viewContact.email}` : "#"
                    }
                    className="px-3 h-8 rounded-lg text-xs bg-primary/10 text-primary hover:bg-primary/20 transition flex items-center gap-1"
                  >
                    <FiMail size={14} />
                    Email
                  </a>

                  <a
                    href={viewContact.linkedin ? viewContact.linkedin : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 h-8 rounded-lg text-xs bg-background border border-border-light hover:bg-background/80 transition flex items-center gap-1"
                  >
                    <FaLinkedin size={14} />
                    LinkedIn
                  </a>
                </div>
              </div>

              <button
                onClick={() => setViewContact(null)}
                className="h-8 w-8 rounded-lg hover:bg-background flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 border-b border-border-light">
              <div className="flex items-center gap-3">
                <img
                  src={getCompanyLogo(viewContact.companyDomain || "")}
                  className="h-10 w-10 rounded-md border border-border-light bg-white"
                />
                <div>
                  <p className="font-medium">{viewContact.company ?? "-"}</p>
                  <p className="text-xs text-text-secondary">
                    {viewContact.domain ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            {isContactDrawerLoading ? (
              <ContactDrawerSkeleton />
            ) : (
              <div className="p-5 space-y-4">
                <Section title="Contact Information">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-text-secondary text-sm">Email</p>
                      <p className="font-medium">{viewContact.email ?? "-"}</p>
                    </div>

                    <button
                      onClick={() =>
                        copyToClipboard(viewContact.email ?? "", "email")
                      }
                      className="h-8 w-8 rounded-lg border border-border-light hover:bg-background flex items-center justify-center transition"
                      title="Copy email"
                      disabled={!viewContact.email}
                    >
                      {copied === "email" ? "✓" : <FiCopy size={14} />}
                    </button>
                  </div>

                  <Info label="Phone" value={viewContact.phone ?? "-"} />

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-text-secondary text-sm">LinkedIn</p>
                      <a
                        href={viewContact.linkedin ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {viewContact.linkedin ?? "-"}
                      </a>
                    </div>

                    <button
                      onClick={() =>
                        copyToClipboard(viewContact.linkedin ?? "", "linkedin")
                      }
                      className="h-8 w-8 rounded-lg border border-border-light hover:bg-background flex items-center justify-center transition"
                      title="Copy LinkedIn URL"
                      disabled={!viewContact.linkedin}
                    >
                      {copied === "linkedin" ? "✓" : <FiCopy size={14} />}
                    </button>
                  </div>

                  <Info label="Location" value={viewContact.location ?? "-"} />
                </Section>

                <Divider />

                <Section title="Business Information">
                  <Info label="Industry" value={viewContact.industry ?? "-"} />
                  <Info
                    label="Employees"
                    value={viewContact.employees ?? "-"}
                  />
                  <Info label="Revenue" value={viewContact.revenue ?? "-"} />
                </Section>
              </div>
            )}

            <div className="p-5 border-t border-border-light flex gap-2">
              <button
                onClick={() => {
                  setIsContactsModalOpen(true);
                  setViewContact(null);
                }}
                disabled={isContactDrawerLoading}
                className={`flex-1 h-9 rounded-lg border border-border-light
                  ${isContactDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-background"}`}
              >
                Add to List
              </button>

              <button
                disabled={isContactDrawerLoading}
                className={`flex-1 h-9 rounded-lg border border-border-light bg-primary text-white
                  ${isContactDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"}`}
              >
                Export Prospect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Highlight Helper ---------- */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "ig");
  const parts = String(text).split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200/60 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ContactDrawerSkeleton() {
  return (
    <div className="p-5 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-border-light rounded" />
        <div className="h-3 w-1/3 bg-border-light rounded" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-border-light" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/2 bg-border-light rounded" />
          <div className="h-3 w-1/3 bg-border-light rounded" />
        </div>
      </div>

      <Divider />

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-1/3 bg-border-light rounded" />
          <div className="h-3 w-1/4 bg-border-light rounded" />
        </div>
      ))}

      <Divider />

      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-1/3 bg-border-light rounded" />
          <div className="h-3 w-1/4 bg-border-light rounded" />
        </div>
      ))}
    </div>
  );
}
