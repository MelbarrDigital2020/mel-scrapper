import { useState, useMemo } from "react";
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

const TOTAL_ROWS = 40;

export default function ContactsTable() {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isListOpen, setIsListOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const rows = useMemo(
    () => Array.from({ length: TOTAL_ROWS }, (_, i) => i),
    []
  );

  const visibleRows = rows.slice(0, rowsPerPage);

  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((i) => selectedRows.has(i));

  /* ---------- Handlers ---------- */

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleRows.forEach((i) => next.delete(i));
      } else {
        visibleRows.forEach((i) => next.add(i));
      }
      return next;
    });
  };

  /* ---------- Export Handlers ---------- */

  const exportSelected = () => {
    console.log("Export selected rows:", Array.from(selectedRows));
    setIsExportOpen(false);
  };

  const exportAllFiltered = () => {
    console.log("Export filtered rows:", visibleRows);
    setIsExportOpen(false);
  };

  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col overflow-hidden shadow-sm">

      {/* 🔝 Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light text-sm bg-background-card">
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          {/* List Dropdown */}
          <div className="relative">
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
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-background transition">
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
          {/* 🔽 Export Dropdown */}
          <div className="relative">
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
                  onClick={exportSelected}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition"
                >
                  <FiFileText size={14} />
                  Export Selected
                </button>

                <button
                  onClick={exportAllFiltered}
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
            {visibleRows.map((i) => (
              <tr key={i} className="border-b border-border-light hover:bg-background/70 transition">
                <td className="sticky left-0 z-10 bg-background-card p-3 w-12 border-r border-border-light">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(i)}
                    onChange={() => toggleRow(i)}
                  />
                </td>

                <td className="sticky left-12 z-10 bg-background-card p-3 w-[220px] font-medium border-r border-border-light">
                  John Doe
                </td>

                <td className="p-3">Head of Sales</td>
                <td className="p-3">Mel-Screpper</td>
                <td className="p-3 text-primary cursor-pointer">Access</td>
                <td className="p-3">melscrepper.com</td>
                <td className="p-3 text-primary cursor-pointer">Access</td>
                <td className="p-3 text-primary cursor-pointer">View</td>
                <td className="p-3">India</td>
                <td className="p-3">SaaS</td>
                <td className="p-3">51–200</td>
                <td className="p-3">$5–10M</td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      title="Add to List"
                      className="h-5 w-5 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition"
                    >
                      <FiPlus size={16} />
                    </button>
                    <button
                      title="View Contact"
                      className="h-5 w-5 rounded-lg flex items-center justify-center hover:bg-background hover:shadow-sm transition"
                    >
                      <FiEye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
