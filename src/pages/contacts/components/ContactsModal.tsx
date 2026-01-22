import { useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/toast/ToastContext.tsx";

/* ===================== PROPS ===================== */
type Props = {
  onClose: () => void;

  // decides which modal UI to show
  mode: "list" | "export";
  // NEW
  selectedCount?: number;

  // called only when mode === "export"
  onExport?: (format: "csv" | "excel") => void;
};

export default function ContactsModal({
  onClose,
  mode,
  onExport,
  selectedCount, 
}: Props) {

  /* ======================================================
   * EXPORT MODAL STATE
   * ====================================================== */
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");

  /* ======================================================
   * LIST MODAL STATE (existing logic)
   * ====================================================== */
  const [open, setOpen] = useState<
    "create" | "own" | "shared" | null
  >(mode === "list" ? "create" : null);

  const { showToast } = useToast();

  const toggle = (key: "create" | "own" | "shared") => {
    setOpen((prev) => (prev === key ? null : key));
  };
  

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* ================= MODAL CONTAINER ================= */}
      <div className="w-full max-w-md bg-background-card rounded-xl shadow-xl border border-border-light">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <h3 className="font-semibold text-sm">
            {mode === "export" ? "Export Data" : "Add Contacts to List"}
          </h3>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-background"
          >
            <FiX />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-4 space-y-4 text-sm">

          {/* ======================================================
              🟢 EXPORT MODAL UI
             ====================================================== */}
          {mode === "export" && (
            <>
              <div className="space-y-1">
                <p className="text-text-secondary">
                  You are about to export
                </p>

                <p className="font-semibold text-sm">
                  {selectedCount ?? 0} selected contact
                  {selectedCount === 1 ? "" : "s"}
                </p>
              </div>

              {/* Output format selection */}
              <div className="space-y-2">
                <label className="font-medium">
                  Select output format
                </label>

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
              </div>
            </>
          )}

          {/* ======================================================
              🔵 LIST MODAL UI (YOUR ORIGINAL CODE)
             ====================================================== */}
          {mode === "list" && (
            <>
              {/* 1️⃣ Create List */}
              <Accordion
                title="Create List"
                isOpen={open === "create"}
                onClick={() => toggle("create")}
              >
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

              {/* 2️⃣ Own Lists */}
              <Accordion
                title="Own Lists"
                isOpen={open === "own"}
                onClick={() => toggle("own")}
              >
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>My Leads</option>
                  <option>Investors</option>
                </select>
              </Accordion>

              {/* 3️⃣ Shared Lists */}
              <Accordion
                title="Shared Lists"
                isOpen={open === "shared"}
                onClick={() => toggle("shared")}
              >
                <select className="w-full h-9 rounded-lg bg-background border border-border-light px-3">
                  <option>Marketing Team</option>
                  <option>BD Team</option>
                </select>
              </Accordion>
            </>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-4 py-3 border-t border-border-light flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border-light hover:bg-background"
          >
            Cancel
          </button>

          {mode === "export" ? (
            <button
              onClick={() => {
                showToast({
                  type: "info",
                  title: "Export started",
                  message: "Preparing your file…",
                });

                try {
                  onExport?.(exportFormat);

                  showToast({
                    type: "success",
                    title: "Export complete",
                    message: "Contacts exported successfully",
                  });

                  onClose();
                } catch (err) {
                  showToast({
                    type: "error",
                    title: "Export failed",
                    message: "Something went wrong while exporting",
                  });
                }
              }}
              className="h-9 px-4 rounded-lg bg-primary text-white hover:brightness-110"
            >
              Export
            </button>
          ) : (
            <button
              onClick={() => {
                showToast({
                  type: "success",
                  title: "Contact added",
                  message: "Contact successfully added to list",
                });

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

/* ================= ACCORDION ================= */
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

      {isOpen && (
        <div className="px-3 py-3 border-t border-border-light">
          {children}
        </div>
      )}
    </div>
  );
}
