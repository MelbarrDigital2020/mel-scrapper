import { useState } from "react";
import CompaniesFilter from "./components/CompaniesFilters";
import CompaniesTable from "./components/CompaniesTable";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Find companies</h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name or domain"
          className="h-9 w-64 px-3 rounded-lg bg-background-card border border-border-light text-sm outline-none"
        />
      </div>

      {/* Content */}
      <div className="flex gap-4 h-[calc(100vh-160px)]">
        {/* Filters */}
        <div className="w-72 shrink-0">
          <CompaniesFilter />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <CompaniesTable search={search} />
        </div>
      </div>
    </div>
  );
}
