import { useState, useEffect } from "react";
import CompaniesFilter from "./components/CompaniesFilters";
import CompaniesTable from "./components/CompaniesTable";
import { useToast } from "../shared/toast/ToastContext"; // adjust path

export type CompaniesFiltersState = {
  company: string[];
  employees: string[];
  revenue: string[];
  industry: string[];
  location: string[];
  intent: string[];
};

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pendingApplyToast, setPendingApplyToast] = useState(false);

  useEffect(() => {
    if (pendingApplyToast && !isTableLoading) {
      showToast({
        type: "success",
        title: "Filters applied",
        message: "Your company filters have been applied.",
      });
      setPendingApplyToast(false);
    }
  }, [pendingApplyToast, isTableLoading, showToast]);


  // ✅ filters state in page
  const [appliedFilters, setAppliedFilters] = useState<CompaniesFiltersState>({
    company: [],
    employees: [],
    revenue: [],
    industry: [],
    location: [],
    intent: [],
  });

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
          <CompaniesFilter
            onApply={(f) => {
              setAppliedFilters(f);
              setPendingApplyToast(true);
            }}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden relative">
          {(isTableLoading || pendingApplyToast) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <div className="px-4 py-2 rounded-lg border border-border-light bg-background-card text-sm text-text-secondary">
                Applying filters...
              </div>
            </div>
          )}

          <CompaniesTable
            search={search}
            filters={appliedFilters}
            onLoadingChange={setIsTableLoading}
          />
        </div>

      </div>
    </div>
  );
}
