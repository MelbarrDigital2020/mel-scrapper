import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";
 
type SyncKey = "contacts" | "calendar" | "tasks" | "notes" | "files";
 
type SyncHistoryRow = {
  id: string;
  date: string; // display string (ex: "April 24, 2024")
  dataSynced: string;
  status: "success" | "failed";
  details: string;
};
 
export default function SyncSettings() {
  // -------------------- state --------------------
  const [open, setOpen] = useState<{ select: boolean; history: boolean }>({
    select: true,
    history: true,
  });
 
  const [selected, setSelected] = useState<Record<SyncKey, boolean>>({
    contacts: true,
    calendar: true,
    tasks: true,
    notes: true,
    files: true,
  });
 
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(
    new Date(Date.now() - 2 * 60 * 60 * 1000), // example: 2 hours ago
  );
 
  const history: SyncHistoryRow[] = [
    {
      id: "1",
      date: "April 24, 2024",
      dataSynced: "Contacts, Calendar, Tasks, Files",
      status: "success",
      details: "Completed without issues.",
    },
    {
      id: "2",
      date: "April 23, 2024",
      dataSynced: "Notes, Files",
      status: "failed",
      details: "Network error.",
    },
    {
      id: "3",
      date: "April 22, 2024",
      dataSynced: "Contacts, Calendar",
      status: "success",
      details: "Sync completed.",
    },
    {
      id: "4",
      date: "April 21, 2024",
      dataSynced: "Tasks, Notes",
      status: "success",
      details: "Data synced.",
    },
    {
      id: "5",
      date: "April 20, 2024",
      dataSynced: "Files",
      status: "success",
      details: "All files updated.",
    },
    // add more rows if you want
  ];
 
  // -------------------- derived --------------------
  const allChecked = useMemo(
    () => Object.values(selected).every(Boolean),
    [selected],
  );
 
  const someChecked = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected],
  );
 
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected],
  );
 
  const lastSyncText = useMemo(() => {
    if (!lastSyncAt) return "Never";
    const diffMs = Date.now() - lastSyncAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }, [lastSyncAt]);
 
  // -------------------- handlers --------------------
  function GridCheckbox({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) {
    return (
      <label className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-950/40 transition">
        <span className="text-sm font-medium">{label}</span>
        <Checkbox checked={checked} onChange={onChange} />
      </label>
    );
  }
 
  const toggleOne = (key: SyncKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };
 
  const toggleAll = () => {
    const next = !allChecked;
    setSelected({
      contacts: next,
      calendar: next,
      tasks: next,
      notes: next,
      files: next,
    });
  };
 
  const handleSyncNow = async () => {
    if (!someChecked || syncing) return;
 
    setSyncing(true);
    try {
      // ✅ If you later add backend API:
      // await api.post("/sync/run", { selected });
 
      // Fake delay so UI looks real
      await new Promise((r) => setTimeout(r, 900));
      setLastSyncAt(new Date());
 
      // You can also push a new history row here if you want (optional).
    } finally {
      setSyncing(false);
    }
  };
 
  // -------------------- pagination (simple UI) --------------------
  const [page, setPage] = useState(1);
  const pageSize = 5;
 
  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page]);
 
  // -------------------- UI --------------------
  return (
    <div className="max-w-4xl space-y-8 text-gray-900 dark:text-gray-100">
      <div>
        <h2 className="text-xl font-semibold">Sync Data</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose what you want to sync and review past sync activity.
        </p>
      </div>
 
      {/* ================= Accordion: Select Data to Sync ================= */}
      <AccordionCard
        title="Select Data to Sync"
        subtitle="Choose the data you want to sync:"
        open={open.select}
        onToggle={() => setOpen((p) => ({ ...p, select: !p.select }))}
      >
        <div className="space-y-4">
          {/* Select all */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div>
              <p className="text-sm font-medium">Select All</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle all sync options at once.
              </p>
            </div>
 
            <Checkbox
              checked={allChecked}
              indeterminate={!allChecked && someChecked}
              onChange={toggleAll}
            />
          </div>
 
          {/* Options */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <GridCheckbox
                label="Contacts"
                checked={selected.contacts}
                onChange={() => toggleOne("contacts")}
              />
              <GridCheckbox
                label="Calendar Events"
                checked={selected.calendar}
                onChange={() => toggleOne("calendar")}
              />
              <GridCheckbox
                label="Tasks"
                checked={selected.tasks}
                onChange={() => toggleOne("tasks")}
              />
              <GridCheckbox
                label="Notes"
                checked={selected.notes}
                onChange={() => toggleOne("notes")}
              />
              <GridCheckbox
                label="Files"
                checked={selected.files}
                onChange={() => toggleOne("files")}
              />
            </div>
          </div>
 
          {/* Sync button */}
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              onClick={handleSyncNow}
              disabled={!someChecked || syncing}
              className={`
                w-full sm:w-72
                inline-flex items-center justify-center gap-2
                rounded-lg px-6 py-3 font-medium
                shadow-sm transition
                ${
                  !someChecked || syncing
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              <FiRefreshCw className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
 
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiClock />
              <span>Last Sync: {lastSyncText}</span>
              {selectedCount > 0 && (
                <span className="rounded-full border border-gray-200 dark:border-gray-800 px-2 py-0.5">
                  {selectedCount} selected
                </span>
              )}
            </div>
          </div>
        </div>
      </AccordionCard>
 
      {/* ================= Accordion: Sync History ================= */}
      <AccordionCard
        title="Sync History"
        subtitle="See recent sync runs and their statuses."
        open={open.history}
        onToggle={() => setOpen((p) => ({ ...p, history: !p.history }))}
      >
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950/40 text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Data Synced
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Details</th>
                </tr>
              </thead>
 
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {pageRows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3">{row.dataSynced}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950/40 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition
                ${
                  page === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                }`}
            >
              ‹ Previous
            </button>
 
            <span className="text-gray-600 dark:text-gray-400">
              {page} of {totalPages}
            </span>
 
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`inline-flex items-center gap-2 px-2 py-1 rounded-md transition
                ${
                  page === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                }`}
            >
              Next ›
            </button>
          </div>
        </div>
      </AccordionCard>
    </div>
  );
}
 
/* -------------------- Small UI pieces -------------------- */
 
function AccordionCard({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-950/40 transition"
      >
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          ) : null}
        </div>
 
        <span className="mt-1 text-gray-500 dark:text-gray-400">
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </button>
 
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
}
 
function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        h-6 w-6 rounded-md border flex items-center justify-center transition
        ${
          checked || indeterminate
            ? "bg-blue-600 border-blue-600"
            : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
        }
      `}
      aria-pressed={checked}
    >
      {indeterminate ? (
        <span className="h-0.5 w-3 bg-white rounded" />
      ) : checked ? (
        <span className="text-white text-sm">✓</span>
      ) : null}
    </button>
  );
}
 
function StatusPill({ status }: { status: "success" | "failed" }) {
  const success = status === "success";
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium
        ${
          success
            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
        }
      `}
    >
      {success ? <FiCheckCircle /> : <FiXCircle />}
      {success ? "Success" : "Failed"}
    </span>
  );
}
 
 