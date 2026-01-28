import { useMemo, useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiLock, FiCheckSquare, FiSquare, FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/toast/ToastContext.tsx";

type ExportFormat = "csv" | "excel";

type ExportHeader = {
  key: string;
  label: string;
  credit?: boolean;
};

type Props = {
  onClose: () => void;
  mode: "list" | "export";
  selectedCount?: number;

  // ✅ NEW: export includes format + selected headers
  onExport?: (format: ExportFormat, selectedHeaderKeys: string[]) => void;

  // ✅ NEW: lock/unlock credit fields
  canUseCredits?: boolean;
};

const EXPORT_HEADERS: ExportHeader[] = [
  // ✅ Free fields
  { key: "name", label: "Name" },
  { key: "jobTitle", label: "Job Title" },
  { key: "company", label: "Company" },
  { key: "companyDomain", label: "Company Domain" },
  { key: "domain", label: "Domain" },
  { key: "location", label: "Location" },
  { key: "industry", label: "Industry" },
  { key: "employees", label: "Employees Range" },
  { key: "revenue", label: "Revenue Range" },

  // 🔒 Credit fields (examples)
  { key: "email", label: "Email", credit: true },
  { key: "phone", label: "Phone", credit: true },
  { key: "linkedin", label: "LinkedIn", credit: true },
];

export default function ContactsModal({
  onClose,
  mode,
  onExport,
  selectedCount,
  canUseCredits = false,
}: Props) {
  const { showToast } = useToast();

  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const [open, setOpen] = useState<"create" | "own" | "shared" | null>(
    mode === "list" ? "create" : null
  );

  const toggle = (key: "create" | "own" | "shared") => {
    setOpen((prev) => (prev === key ? null : key));
  };

  const freeHeaders = useMemo(() => EXPORT_HEADERS.filter((h) => !h.credit), []);
  const creditHeaders = useMemo(() => EXPORT_HEADERS.filter((h) => h.credit), []);

  // ✅ default selected = free only
  const defaultSelected = useMemo(() => freeHeaders.map((h) => h.key), [freeHeaders]);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(defaultSelected);

  const isSelected = (key: string) => selectedHeaders.includes(key);

  const toggleHeader = (h: ExportHeader) => {
    if (h.credit && !canUseCredits) {
      showToast({
        type: "error",
        title: "Credits required",
        message: `“${h.label}” is a credit-based field.`,
      });
      return;
    }

    setSelectedHeaders((prev) => {
      if (prev.includes(h.key)) return prev.filter((k) => k !== h.key);
      return [...prev, h.key];
    });
  };

  const selectAllFree = () => {
    setSelectedHeaders((prev) => {
      const next = new Set(prev);
      freeHeaders.forEach((h) => next.add(h.key));
      return Array.from(next);
    });
  };

  const clearAll = () => setSelectedHeaders([]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background-card rounded-xl shadow-xl border border-border-light">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <h3 className="font-semibold text-sm">
            {mode === "export" ? "Export Contacts" : "Add Contacts to List"}
          </h3>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-background"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-sm">
          {mode === "export" && (
            <>
              <div className="space-y-1">
                <p className="text-text-secondary">You are about to export</p>
                <p className="font-semibold text-sm">
                  {selectedCount ?? 0} selected contact{selectedCount === 1 ? "" : "s"}
                </p>
              </div>

              {/* Format */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exportFormat === "csv"}
                    onChange={() => setExportFormat("csv")}
                  />
                  CSV
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exportFormat === "excel"}
                    onChange={() => setExportFormat("excel")}
                  />
                  Excel
                </label>
              </div>

              {/* Headers */}
              <div className="border border-border-light rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-border-light flex items-center justify-between bg-background">
                  <div>
                    <p className="font-medium">Select headers</p>
                    <p className="text-xs text-text-secondary">Selected: {selectedHeaders.length}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllFree}
                      className="h-8 px-3 rounded-lg border border-border-light hover:bg-background-card transition text-xs"
                    >
                      Select free
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="h-8 px-3 rounded-lg border border-border-light hover:bg-background-card transition text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-auto p-2 space-y-2">
                  {/* Free */}
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-text-secondary">Free fields</p>
                    <div className="space-y-1">
                      {freeHeaders.map((h) => (
                        <button
                          key={h.key}
                          type="button"
                          onClick={() => toggleHeader(h)}
                          className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-background transition"
                        >
                          <div className="flex items-center gap-2">
                            {isSelected(h.key) ? <FiCheckSquare /> : <FiSquare />}
                            <span>{h.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credit */}
                  <div className="pt-2 border-t border-border-light">
                    <p className="px-2 py-1 text-xs font-semibold text-text-secondary">
                      Credit-based fields
                    </p>
                    <div className="space-y-1">
                      {creditHeaders.map((h) => {
                        const locked = !canUseCredits;
                        return (
                          <button
                            key={h.key}
                            type="button"
                            onClick={() => toggleHeader(h)}
                            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition
                              ${locked ? "opacity-60 cursor-not-allowed" : "hover:bg-background"}`}
                            title={locked ? "Credits required" : "Select this field"}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected(h.key) ? <FiCheckSquare /> : <FiSquare />}
                              <span>{h.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                              <FiLock />
                              <span>Credits</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {selectedHeaders.length === 0 && (
                <p className="text-xs text-red-500">Please select at least 1 header to export.</p>
              )}
            </>
          )}

          {/* LIST modal (your existing UI) */}
          {mode === "list" && (
            <>
              <Accordion title="Create List" isOpen={open === "create"} onClick={() => toggle("create")}>
                <div className="space-y-2">
                  <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                    <option>Select existing list</option>
                    <option>Sales Leads</option>
                    <option>Founders</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      placeholder="New list name"
                      className="flex-1 h-9 px-3 rounded-lg bg-background border border-border-light"
                    />
                    <button className="h-9 px-3 rounded-lg bg-primary text-white hover:brightness-110">
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Own Lists" isOpen={open === "own"} onClick={() => toggle("own")}>
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>My Leads</option>
                  <option>Investors</option>
                </select>
              </Accordion>

              <Accordion title="Shared Lists" isOpen={open === "shared"} onClick={() => toggle("shared")}>
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>Marketing Team</option>
                  <option>BD Team</option>
                </select>
              </Accordion>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border-light flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border-light hover:bg-background"
          >
            Cancel
          </button>

          {mode === "export" ? (
            <button
              disabled={selectedHeaders.length === 0}
              onClick={() => {
                showToast({ type: "info", title: "Export started", message: "Preparing your file…" });
                onExport?.(exportFormat, selectedHeaders);
                onClose();
              }}
              className={`h-9 px-4 rounded-lg text-white transition
                ${selectedHeaders.length === 0 ? "bg-primary/40 cursor-not-allowed" : "bg-primary hover:brightness-110"}`}
            >
              Export
            </button>
          ) : (
            <button
              onClick={() => {
                showToast({ type: "success", title: "Contact added", message: "Contact successfully added to list" });
                onClose();
              }}
              className="h-9 px-4 rounded-lg bg-primary text-white hover:brightness-110"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Accordion */
function Accordion({
  title,
  isOpen,
  onClick,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border-light rounded-lg">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2 font-medium hover:bg-background rounded-lg"
      >
        {title}
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {isOpen && <div className="px-3 py-3 border-t border-border-light">{children}</div>}
    </div>
  );
}
