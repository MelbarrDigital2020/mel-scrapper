import { useMemo, useState } from "react";
import {
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiLock,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { useToast } from "../../shared/toast/ToastContext";

type ExportFormat = "csv" | "excel";

type ExportHeader = {
  key: string;
  label: string;
  credit?: boolean; // ✅ credit based/locked
};

type Props = {
  onClose: () => void;
  mode: "list" | "export";
  selectedCount?: number;

  // ✅ export callback MUST include listName (required)
  onExport?: (
    format: ExportFormat,
    selectedHeaderKeys: string[],
    exportListName: string
  ) => void;

  // ✅ allow/disallow credit headers
  canUseCredits?: boolean;
};

// ✅ IMPORTANT: Keep ONLY headers that exist in backend ENTITY_CONFIG.companies.columns
const EXPORT_HEADERS: ExportHeader[] = [
  // ✅ Free headers
  { key: "companyName", label: "Company Name" },
  { key: "domain", label: "Domain" },
  { key: "phone", label: "Phone" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "location", label: "Location" },
  { key: "industry", label: "Industry" },
  { key: "employees", label: "Employees Range" },
  { key: "revenue", label: "Revenue Range" },

  // 🔒 Credit-based headers (SAFE ones only)
  { key: "website", label: "Website", credit: true },
  { key: "headquarters", label: "Headquarters", credit: true }, // maps to full_address
];

export default function CompaniesModal({
  onClose,
  mode,
  onExport,
  selectedCount = 0,
  canUseCredits = false,
}: Props) {
  const { showToast } = useToast();

  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const [open, setOpen] = useState<"create" | "own" | "shared" | null>(
    mode === "list" ? "create" : null
  );

  // ✅ Export List Name (Required in export mode)
  const [exportListName, setExportListName] = useState("");
  const [exportListNameTouched, setExportListNameTouched] = useState(false);

  const exportListNameInvalid =
    mode === "export" && exportListNameTouched && !exportListName.trim();

  const toggle = (key: "create" | "own" | "shared") => {
    setOpen((prev) => (prev === key ? null : key));
  };

  const freeHeaders = useMemo(() => EXPORT_HEADERS.filter((h) => !h.credit), []);
  const creditHeaders = useMemo(() => EXPORT_HEADERS.filter((h) => h.credit), []);

  // ✅ Default selected only FREE headers
  const defaultSelected = useMemo(
    () => freeHeaders.map((h) => h.key),
    [freeHeaders]
  );

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

  const exportDisabled = selectedHeaders.length === 0 || !exportListName.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background-card rounded-xl shadow-xl border border-border-light">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <h3 className="font-semibold text-sm">
            {mode === "export" ? "Export Companies" : "Add Companies to List"}
          </h3>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-background flex items-center justify-center"
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
                <p className="font-semibold">
                  {selectedCount} selected compan{selectedCount === 1 ? "y" : "ies"}
                </p>
              </div>

              {/* List Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">
                  List name <span className="text-red-500">*</span>
                </label>
                <input
                  value={exportListName}
                  required
                  onChange={(e) => setExportListName(e.target.value)}
                  onBlur={() => setExportListNameTouched(true)}
                  placeholder="Please enter list name"
                  className={`w-full h-9 px-3 rounded-lg bg-background border ${
                    exportListNameInvalid ? "border-red-500" : "border-border-light"
                  }`}
                />
                {exportListNameInvalid && (
                  <p className="text-xs text-red-500">Please enter list name</p>
                )}
              </div>

              {/* Format */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={exportFormat === "csv"}
                    onChange={() => setExportFormat("csv")}
                  />
                  CSV
                </label>

                <label className="flex items-center gap-2">
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
                    <p className="text-xs text-text-secondary">
                      Selected: {selectedHeaders.length}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={selectAllFree}
                      className="h-8 px-3 rounded-lg border border-border-light hover:bg-background-card transition text-xs"
                      type="button"
                    >
                      Select free
                    </button>
                    <button
                      onClick={clearAll}
                      className="h-8 px-3 rounded-lg border border-border-light hover:bg-background-card transition text-xs"
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-auto p-2 space-y-2">
                  {/* Free */}
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-text-secondary">
                      Free fields
                    </p>
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
                        const selected = isSelected(h.key);

                        return (
                          <button
                            key={h.key}
                            type="button"
                            onClick={() => toggleHeader(h)}
                            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition ${
                              locked ? "opacity-60 cursor-not-allowed" : "hover:bg-background"
                            }`}
                            title={locked ? "Credits required" : "Select this field"}
                          >
                            <div className="flex items-center gap-2">
                              {selected ? <FiCheckSquare /> : <FiSquare />}
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
                <p className="text-xs text-red-500">
                  Please select at least 1 header to export.
                </p>
              )}
            </>
          )}

          {mode === "list" && (
            <>
              <Accordion
                title="Create Company List"
                isOpen={open === "create"}
                onClick={() => toggle("create")}
              >
                <input
                  placeholder="New company list name"
                  className="w-full h-9 px-3 rounded-lg bg-background border border-border-light"
                />
              </Accordion>

              <Accordion
                title="Own Lists"
                isOpen={open === "own"}
                onClick={() => toggle("own")}
              >
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>My Accounts</option>
                </select>
              </Accordion>

              <Accordion
                title="Shared Lists"
                isOpen={open === "shared"}
                onClick={() => toggle("shared")}
              >
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>Sales Team</option>
                </select>
              </Accordion>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border-light flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border-light"
          >
            Cancel
          </button>

          {mode === "export" ? (
            <button
              disabled={exportDisabled}
              onClick={() => {
                if (!exportListName.trim()) {
                  setExportListNameTouched(true);
                  showToast({
                    type: "error",
                    title: "List name required",
                    message: "Please enter list name",
                  });
                  return;
                }

                showToast({
                  type: "success",
                  title: "Export started",
                  message: "Companies export in progress",
                });

                onExport?.(exportFormat, selectedHeaders, exportListName.trim());
                onClose();
              }}
              className={`h-9 px-4 rounded-lg text-white transition ${
                exportDisabled
                  ? "bg-primary/40 cursor-not-allowed"
                  : "bg-primary hover:brightness-110"
              }`}
            >
              Export
            </button>
          ) : (
            <button
              onClick={() => {
                showToast({
                  type: "success",
                  title: "Company added",
                  message: "Company added to list",
                });
                onClose();
              }}
              className="h-9 px-4 rounded-lg bg-primary text-white"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Accordion reused */
function Accordion({ title, isOpen, onClick, children }: any) {
  return (
    <div className="border border-border-light rounded-lg">
      <button
        onClick={onClick}
        className="w-full flex justify-between px-3 py-2 font-medium"
      >
        {title}
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
}
