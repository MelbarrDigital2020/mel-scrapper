import ContactsFilter from "./components/ContactsFilters";
import ContactsTable from "./components/ContactsTable";
import ContactsModal from "./components/ContactsModal";

export default function ContactsPage() {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Find people</h1>

        <div className="flex items-center gap-2">
          <input
            placeholder="Search people"
            className="h-9 w-64 px-3 rounded-lg bg-background-card border border-border-light text-sm outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Filters */}
        <div className="w-72 shrink-0">
          <ContactsFilter />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <ContactsTable />
        </div>
      </div>

      <ContactsModal />
    </div>
  );
}
