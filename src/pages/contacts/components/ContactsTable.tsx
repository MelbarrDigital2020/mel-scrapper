import { useState, useMemo, useRef, useEffect } from "react";
import ContactsModal from "./ContactsModal";
import { FiCopy, FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import { Section, Info, Divider } from "../../shared/components/DrawerSections";

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

/* ---------- Company Logo Helper ---------- */
const getCompanyLogo = (domain: string) =>
  `https://logos-api.apistemic.com/domain:${domain}`;

// 
/* ---------- Dummy Contacts (Backend Friendly) ---------- */
type Contact = {
  id: number;
  name: string;
  jobTitle: string;
  company: string;
  companyDomain: string;
  email: string;
  domain: string;
  phone: string;
  linkedin: string;
  location: string;
  industry: string;
  employees: string;
  revenue: string;
};

const CONTACTS: Contact[] = [
  {
    id: 1,
    name: "John Doe",
    jobTitle: "Head of Sales",
    company: "Google",
    companyDomain: "google.com",
    email: "john@google.com",
    domain: "google.com",
    phone: "Access",
    linkedin: "View",
    location: "India",
    industry: "SaaS",
    employees: "51–200",
    revenue: "$5–10M",
  },
  {
    id: 2,
    name: "Sarah Lee",
    jobTitle: "Marketing Manager",
    company: "Stripe",
    companyDomain: "stripe.com",
    email: "sarah@stripe.com",
    domain: "stripe.com",
    phone: "Access",
    linkedin: "View",
    location: "USA",
    industry: "FinTech",
    employees: "201–500",
    revenue: "$10–50M",
  },
  {
  id: 3,
  name: "John Miller",
  jobTitle: "Head of Sales",
  company: "HubSpot",
  companyDomain: "hubspot.com",
  email: "john@hubspot.com",
  domain: "hubspot.com",
  phone: "Access",
  linkedin: "View",
  location: "USA",
  industry: "SaaS",
  employees: "501–1000",
  revenue: "$50–100M",
},
{
  id: 4,
  name: "Emily Watson",
  jobTitle: "Product Manager",
  company: "Atlassian",
  companyDomain: "atlassian.com",
  email: "emily@atlassian.com",
  domain: "atlassian.com",
  phone: "Access",
  linkedin: "View",
  location: "Australia",
  industry: "Software",
  employees: "1001–5000",
  revenue: "$500M–$1B",
},
{
  id: 5,
  name: "Michael Brown",
  jobTitle: "CTO",
  company: "Shopify",
  companyDomain: "shopify.com",
  email: "michael@shopify.com",
  domain: "shopify.com",
  phone: "Access",
  linkedin: "View",
  location: "Canada",
  industry: "E-commerce",
  employees: "5001–10000",
  revenue: "$1B+",
},
{
  id: 6,
  name: "Priya Sharma",
  jobTitle: "Business Development Manager",
  company: "Zoho",
  companyDomain: "zoho.com",
  email: "priya@zoho.com",
  domain: "zoho.com",
  phone: "Access",
  linkedin: "View",
  location: "India",
  industry: "IT Services",
  employees: "10001+",
  revenue: "$1B+",
},
{
  id: 7,
  name: "Daniel Weber",
  jobTitle: "Operations Director",
  company: "SAP",
  companyDomain: "sap.com",
  email: "daniel@sap.com",
  domain: "sap.com",
  phone: "Access",
  linkedin: "View",
  location: "Germany",
  industry: "Enterprise Software",
  employees: "10001+",
  revenue: "$10B+",
},
{
  id: 8,
  name: "Emily Watson",
  jobTitle: "Product Manager",
  company: "Atlassian",
  companyDomain: "atlassian.com",
  email: "emily@atlassian.com",
  domain: "atlassian.com",
  phone: "Access",
  linkedin: "View",
  location: "Australia",
  industry: "Software",
  employees: "1001–5000",
  revenue: "$500M–$1B",
},
{
  id: 9,
  name: "Michael Brown",
  jobTitle: "CTO",
  company: "Shopify",
  companyDomain: "shopify.com",
  email: "michael@shopify.com",
  domain: "shopify.com",
  phone: "Access",
  linkedin: "View",
  location: "Canada",
  industry: "E-commerce",
  employees: "5001–10000",
  revenue: "$1B+",
},

];

export default function ContactsTable({
  search,
}
: {
  search: string;
}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isListOpen, setIsListOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isContactDrawerLoading, setIsContactDrawerLoading] = useState(false);

  /* ---------- Dropdown Refs ---------- */
  const listDropdownRef = useRef<HTMLDivElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);
  /* ---------- Sort Dropdown Ref ---------- */
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------- SEARCH LOGIC ---------- */
  const normalizedSearch = search.trim().toLowerCase();
  /* ---------- View Contact Drawer ---------- */
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [copied, setCopied] = useState<"email" | "linkedin" | null>(null);
  /* ---------- SORT STATE ---------- */
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortBy, setSortBy] = useState<
      "name" | "company" | "revenue" | "employees" | ""
    >("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return CONTACTS;

    return CONTACTS.filter(
      (row) =>
        row.name.toLowerCase().includes(normalizedSearch) ||
        row.email.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const sortedRows = useMemo(() => {
  const rows = [...filteredRows];

  if (!sortBy) return rows;

  rows.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  return rows;
}, [filteredRows, sortBy, sortOrder]);

const visibleRows = useMemo(
  () => sortedRows.slice(0, rowsPerPage),
  [sortedRows, rowsPerPage]
);


  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedRows.has(row.id));

// ---------- Copy to Clipboard Handler ----------
  const copyToClipboard = async (
  text: string,
  type: "email" | "linkedin"
) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(type);

    setTimeout(() => setCopied(null), 1500);
  } catch (err) {
    console.error("Copy failed", err);
  }
};
  

  /* ---------- Reset selection on search ---------- */
  useEffect(() => {
    setSelectedRows(new Set());
  }, [search]);


  /* ---------- Handlers ---------- */
  const toggleRow = (id: number) => {
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
        visibleRows.forEach((row) => next.delete(row.id));
      } else {
        visibleRows.forEach((row) => next.add(row.id));
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

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col overflow-hidden shadow-sm">

      {/* 🔝 Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light text-sm bg-background-card">
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          {/* List Dropdown */}
          <div ref={listDropdownRef}  className="relative">
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
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg border
                        border-border-light hover:bg-background transition"
            >
              ↑↓ Sort
              <FiChevronDown size={14} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background-card
                              border border-border-light rounded-xl shadow-xl
                              z-50 p-3 space-y-3">

                {/* Sort By */}
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as any)
                    }
                    className="w-full h-8 px-2 rounded-lg bg-background
                              border border-border-light text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="name">Name</option>
                    <option value="company">Company</option>
                    <option value="revenue">Revenue</option>
                    <option value="employees">Employees</option>
                  </select>
                </div>

                {/* Order */}
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">
                    Order
                  </label>
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
                <button
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
                </button>
              </div>
            )}
          </div>

          {/* 🔽 Export Dropdown */}
          <div ref={exportDropdownRef} className="relative">
            <button
              disabled={selectedRows.size === 0}
              onClick={() => {
                setIsExportOpen((v) => !v);
                setIsListOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-lg border transition
                ${
                  selectedRows.size === 0
                    ? "opacity-40 cursor-not-allowed border-border-light"
                    : "border-border-light hover:bg-background"
                }`}
            >
              <FiDownload size={14} />
              Export
              <FiChevronDown size={14} />
            </button>

            {isExportOpen && selectedRows.size > 0 && (
              <div className="absolute right-0 mt-2 w-56 bg-background-card border border-border-light rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                onClick={() => {
                  setIsExportModalOpen(true);
                  setIsExportOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition"
              >
                <FiFileText size={14} />
                Export Selected
              </button>

              <button
                onClick={() => {
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
            {visibleRows.map((row) => (
              <tr key={row.id} className="group border-b border-border-light
             hover:bg-background
             hover:-translate-y-[1px]
             hover:shadow-sm
             transition-all duration-150 cursor-pointer">
                <td className="sticky left-0 z-10 bg-background-card p-3 w-12 border-r border-border-light">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>

                <td className="sticky left-12 z-10 bg-background-card p-3 w-[220px]
               font-medium border-r border-border-light
               group-hover:bg-background transition">
                  <HighlightText
                    text={row.name}
                    query={normalizedSearch}
                  />
                </td>

                <td className="p-3">{row.jobTitle}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCompanyLogo(row.companyDomain)}
                      alt={`${row.company} logo`}
                      className="h-6 w-6 rounded-md border border-border-light bg-white object-contain"
                    />
                    <span className="font-medium">{row.company}</span>
                  </div>
                </td>
                <td className="p-3"><HighlightText
                    text={row.email}
                    query={normalizedSearch}
                  /></td>
                <td className="p-3">{row.domain}</td>
                <td className="p-3">{row.phone}</td>
                <td className="p-3">{row.linkedin}</td>
                <td className="p-3">{row.location}</td>
                <td className="p-3">{row.industry}</td>
                <td className="p-3">{row.employees}</td>
                <td className="p-3">{row.revenue}</td>

                <td className="p-3">
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                    <button
                    onClick={() => {
                        setIsContactsModalOpen(true);

                      }}
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

                      // simulate API delay
                      setTimeout(() => {
                        setIsContactDrawerLoading(false);
                      }, 900);
                    }}
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
            No matching contacts found
          </div>
        )}
      </div>

      

      {/* 🔽 Pagination */}
      <div className="shrink-0 border-t border-border-light px-4 py-2 flex items-center justify-between bg-background-card text-sm">
        <span className="text-text-secondary">
          1–{rowsPerPage} of 33.6M
        </span>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-lg border border-border-light hover:bg-background transition">
            <FiChevronLeft />
          </button>
          <button className="h-9 w-9 rounded-lg border border-border-light hover:bg-background transition">
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
          selectedCount={selectedRows.size}
          canUseCredits={false} // ✅ later connect with plan/credits
          onClose={() => setIsExportModalOpen(false)}
          onExport={(format, headerKeys) => {
            console.log("EXPORT CONTACTS:", {
              format,
              headerKeys,
              selectedIds: Array.from(selectedRows),
            });

            // TODO: call backend export endpoint or generate client-side file
            // api.post("/contacts/export", { format, headerKeys, ids: Array.from(selectedRows) })
          }}
        />
      )}
    {/* ================= VIEW CONTACT DRAWER ================= */}
      {viewContact && (
        <div className="fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30"
            onClick={() => setViewContact(null)}
          />

          {/* Drawer */}
          <div className="w-[440px] bg-background-card border-l border-border-light shadow-xl overflow-y-auto">
            {/* Header */}
              <div className="p-5 border-b border-border-light flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold leading-tight">
                    {viewContact.name}
                  </h2>

                  <p className="text-sm text-text-secondary">
                    {viewContact.jobTitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`mailto:${viewContact.email}`}
                      className="px-3 h-8 rounded-lg text-xs
                                bg-primary/10 text-primary
                                hover:bg-primary/20 transition
                                flex items-center gap-1"
                    >
                      <FiMail size={14} />
                      Email
                    </a>

                    <a
                      href={viewContact.linkedin !== "View" ? viewContact.linkedin : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 h-8 rounded-lg text-xs
                                bg-background border border-border-light
                                hover:bg-background/80 transition
                                flex items-center gap-1"
                    >
                      <FaLinkedin size={14} />
                      LinkedIn
                    </a>
                  </div>
                </div>

                {/* ✅ Close button */}
                <button
                  onClick={() => setViewContact(null)}
                  className="h-8 w-8 rounded-lg hover:bg-background flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

            {/* Company Card */}
            <div className="p-5 border-b border-border-light">
              <div className="flex items-center gap-3">
                <img
                  src={getCompanyLogo(viewContact.companyDomain)}
                  className="h-10 w-10 rounded-md border border-border-light bg-white"
                />
                <div>
                  <p className="font-medium">{viewContact.company}</p>
                  <p className="text-xs text-text-secondary">
                    {viewContact.domain}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
          {isContactDrawerLoading ? (
            <ContactDrawerSkeleton />
          ) : (
            <div className="p-5 space-y-4">
              <Section title="Contact Information">
                {/* Email */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-text-secondary text-sm">Email</p>
                    <p className="font-medium">{viewContact.email}</p>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(viewContact.email, "email")
                    }
                    className="h-8 w-8 rounded-lg border border-border-light
                              hover:bg-background flex items-center justify-center transition"
                    title="Copy email"
                  >
                    {copied === "email" ? "✓" : <FiCopy size={14} />}
                  </button>
                </div>

                {/* Phone */}
                <Info label="Phone" value={viewContact.phone} />

                {/* LinkedIn */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-text-secondary text-sm">LinkedIn</p>
                    <a
                      href={viewContact.linkedin !== "View" ? viewContact.linkedin : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {viewContact.linkedin}
                    </a>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(viewContact.linkedin, "linkedin")
                    }
                    className="h-8 w-8 rounded-lg border border-border-light
                              hover:bg-background flex items-center justify-center transition"
                    title="Copy LinkedIn URL"
                  >
                    {copied === "linkedin" ? "✓" : <FiCopy size={14} />}
                  </button>
                </div>

                <Info label="Location" value={viewContact.location} />
              </Section>

              <Divider />

              <Section title="Business Information">
                <Info label="Industry" value={viewContact.industry} />
                <Info label="Employees" value={viewContact.employees} />
                <Info label="Revenue" value={viewContact.revenue} />
              </Section>
            </div>
          )}
            {/* Footer Actions */}
            <div className="p-5 border-t border-border-light flex gap-2">
              <button
                onClick={() => {
                  setIsContactsModalOpen(true);

                  // optional: close drawer when modal opens
                  setViewContact(null);
                }} disabled={isContactDrawerLoading}
                className={`flex-1 h-9 rounded-lg border border-border-light
    ${isContactDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-background"}`}
              >
                Add to List
              </button>

              <button
                disabled={isContactDrawerLoading}
                className={`flex-1 h-9 rounded-lg border border-border-light bg-primary text-white
    ${isContactDrawerLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-background"}`}
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
function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query) return <>{text}</>;

  const regex = new RegExp(`(${query})`, "ig");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200/60 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function ContactDrawerSkeleton() {
  return (
    <div className="p-5 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-border-light rounded" />
        <div className="h-3 w-1/3 bg-border-light rounded" />
      </div>

      {/* Company */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-border-light" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/2 bg-border-light rounded" />
          <div className="h-3 w-1/3 bg-border-light rounded" />
        </div>
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

      {/* Business info */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-1/3 bg-border-light rounded" />
          <div className="h-3 w-1/4 bg-border-light rounded" />
        </div>
      ))}
    </div>
  );
}

