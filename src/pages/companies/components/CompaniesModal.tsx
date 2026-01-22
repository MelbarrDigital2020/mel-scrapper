import { useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/toast/ToastContext";

type Props = {
  onClose: () => void;
  mode: "list" | "export";
  selectedCount?: number;
  onExport?: (format: "csv" | "excel") => void;
};

export default function CompaniesModal({
  onClose,
  mode,
  onExport,
  selectedCount,
}: Props) {
  const [exportFormat, setExportFormat] =
    useState<"csv" | "excel">("csv");

  const [open, setOpen] = useState<
    "create" | "own" | "shared" | null
  >(mode === "list" ? "create" : null);

  const { showToast } = useToast();

  const toggle = (key: "create" | "own" | "shared") => {
    setOpen((prev) => (prev === key ? null : key));
  };

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
              <p className="text-text-secondary">
                You are about to export
              </p>
              <p className="font-semibold">
                {selectedCount ?? 0} selected compan
                {selectedCount === 1 ? "y" : "ies"}
              </p>

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
              onClick={() => {
                showToast({
                  type: "success",
                  title: "Export started",
                  message: "Companies export in progress",
                });
                onExport?.(exportFormat);
                onClose();
              }}
              className="h-9 px-4 rounded-lg bg-primary text-white"
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
