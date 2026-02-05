import { useMemo, useState } from "react";
import {
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { useToast } from "../../shared/toast/ToastContext";

type ExportFormat = "csv" | "excel";

type ExportHeader = {
  key: string; // ✅ backend key
  label: string;
};

type Props = {
  onClose: () => void;
  mode: "list" | "export";
  selectedCount?: number;
  onExport?: (
    format: ExportFormat,
    selectedHeaderKeys: string[],
    exportListName: string,
  ) => void;
};

// ✅ ONLY backend keys that exist in ENTITY_CONFIG.companies.columns
const EXPORT_HEADERS: ExportHeader[] = [
  { key: "name", label: "Company Name" },
  { key: "domain", label: "Domain" },
  { key: "company_phone", label: "Phone" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "website", label: "Website" },
  { key: "country", label: "Location" },
  { key: "industry", label: "Industry" },
  { key: "employee_range", label: "Employees Range" },
  { key: "revenue_range", label: "Revenue Range" },
  { key: "full_address", label: "Headquarters" },
];

export default function CompaniesModal({
  onClose,
  mode,
  onExport,
  selectedCount = 0,
}: Props) {
  const { showToast } = useToast();

  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");

  const [open, setOpen] = useState<"create" | "own" | "shared" | null>(
    mode === "list" ? "create" : null,
  );

  const [exportListName, setExportListName] = useState("");
  const [exportListNameTouched, setExportListNameTouched] = useState(false);

  const exportListNameInvalid =
    mode === "export" && exportListNameTouched && !exportListName.trim();

  const toggle = (key: "create" | "own" | "shared") => {
    setOpen((prev) => (prev === key ? null : key));
  };

  const headers = useMemo(() => EXPORT_HEADERS, []);

  // ✅ default selected = all headers (everything free)
  const defaultSelected = useMemo(() => headers.map((h) => h.key), [headers]);
  const [selectedHeaders, setSelectedHeaders] =
    useState<string[]>(defaultSelected);

  const isSelected = (key: string) => selectedHeaders.includes(key);

  const toggleHeader = (h: ExportHeader) => {
    setSelectedHeaders((prev) => {
      if (prev.includes(h.key)) return prev.filter((k) => k !== h.key);
      return [...prev, h.key];
    });
  };

  const selectAll = () => setSelectedHeaders(headers.map((h) => h.key));
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
            type="button"
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
                  {selectedCount} selected compan
                  {selectedCount === 1 ? "y" : "ies"}
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
                    exportListNameInvalid
                      ? "border-red-500"
                      : "border-border-light"
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
                      onClick={selectAll}
                      className="h-8 px-3 rounded-lg border border-border-light hover:bg-background-card transition text-xs"
                      type="button"
                    >
                      Select all
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

                <div className="max-h-64 overflow-auto p-2 space-y-1">
                  {headers.map((h) => (
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
            type="button"
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

                onExport?.(
                  exportFormat,
                  selectedHeaders,
                  exportListName.trim(),
                );
                onClose();
              }}
              className={`h-9 px-4 rounded-lg text-white transition ${
                exportDisabled
                  ? "bg-primary/40 cursor-not-allowed"
                  : "bg-primary hover:brightness-110"
              }`}
              type="button"
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
              type="button"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
        className="w-full flex justify-between px-3 py-2 font-medium"
        type="button"
      >
        {title}
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
}
