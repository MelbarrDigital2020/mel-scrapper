import { useState, type ReactNode } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiLock,
  FiSave,
} from "react-icons/fi";

/* ---------------- Types ---------------- */
type SectionKey =
  | "jobTitles"
  | "jobLevel"
  | "location"
  | "company"
  | "employees"
  | "industry"
  | "emailStatus";

type FiltersState = Record<SectionKey, string[]>;

type SavedFilter = {
  id: string;
  name: string;
  filters: FiltersState;
};

/* ---------------- Main ---------------- */
export default function ContactsFilter() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("jobTitles");

  const [filters, setFilters] = useState<FiltersState>({
    jobTitles: [],
    jobLevel: [],
    location: [],
    company: [],
    employees: [],
    industry: [],
    emailStatus: [],
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  /* ---------- Helpers ---------- */

  const toggle = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const updateFilter = (key: SectionKey, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  };

  const clearFilter = (key: SectionKey) => {
    updateFilter(key, []);
  };

  const clearAll = () => {
    setFilters({
      jobTitles: [],
      jobLevel: [],
      location: [],
      company: [],
      employees: [],
      industry: [],
      emailStatus: [],
    });
  };

  const saveCurrentFilter = () => {
    const name = prompt("Save filter as");
    if (!name) return;

    setSavedFilters((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        filters,
      },
    ]);
  };

  const applySavedFilter = (saved: SavedFilter) => {
    setFilters(saved.filters);
    setShowSaved(false);
  };

  const activeChips = Object.entries(filters).flatMap(([key, values]) =>
    values.map((v) => ({ key: key as SectionKey, value: v }))
  );

  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col">

      {/* 🔝 Header */}
      <div className="px-4 py-3 border-b border-border-light space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>

          {/* Saved Filters */}
          <div className="relative">
            <button
              onClick={() => setShowSaved((v) => !v)}
              className="flex items-center gap-1 text-xs text-primary "
            >
              Saved filters <FiChevronDown size={12} />
            </button>

            {showSaved && savedFilters.length > 0 && (
              <div className="absolute right-0 z-50 mt-1 w-48 bg-background-card border border-border-light rounded-lg shadow-lg">
                {savedFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => applySavedFilter(sf)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-background"
                  >
                    {sf.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map(({ key, value }) => (
              <span
                key={`${key}-${value}`}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                {value}
                <FiX
                  size={12}
                  className="cursor-pointer"
                  onClick={() =>
                    updateFilter(
                      key,
                      filters[key].filter((v) => v !== value)
                    )
                  }
                />
              </span>
            ))}

            <button
              onClick={clearAll}
              className="text-xs text-text-secondary underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
        {(
          [
            ["jobTitles", "Job Titles", ["Manager", "Director", "VP", "Founder", "CEO"]],
            ["jobLevel", "Job Level", ["C-Level", "VP", "Director", "Manager", "IC"]],
            ["location", "Location", ["India", "United States", "UK", "Germany", "Remote"]],
            ["company", "Company", ["Google", "Microsoft", "PwC", "Deloitte", "Amazon"]],
            ["employees", "# Employees", ["1–10", "11–50", "51–200", "201–500", "500+"]],
            ["industry", "Industry & Keywords", ["SaaS", "Fintech", "Healthcare", "E-commerce"]],
          ] as const
        ).map(([key, title, options]) => (
          <FilterAccordion
            key={key}
            title={title}
            count={filters[key].length}
            isOpen={openSection === key}
            onClick={() => toggle(key)}
            onClear={() => clearFilter(key)}
          >
            <MultiSelectDropdown
              placeholder={`Search ${title.toLowerCase()}`}
              options={[...options]}
              value={filters[key]}
              onChange={(v) => updateFilter(key, v)}
            />
          </FilterAccordion>
        ))}

        {/* Locked */}
        <FilterAccordion
          title={
            <span className="flex items-center gap-1 opacity-70">
              Company Lookalikes <FiLock size={12} />
            </span>
          }
          count={0}
          isOpen={false}
          disabled
          onClick={() => {}}
          onClear={() => {}}
        >
          <div className="text-xs text-text-secondary">Upgrade to unlock</div>
        </FilterAccordion>
      </div>

      {/* 🔽 Footer */}
      <div className="border-t border-border-light p-3 flex gap-2 bg-background-card">
        <button
          onClick={saveCurrentFilter}
          className="flex items-center justify-center gap-1 h-9 px-3 rounded-lg border border-border-light text-sm hover:bg-background"
        >
          <FiSave size={14} />
          Save Filter
        </button>
      </div>
    </div>
  );
}

/* ---------------- Accordion ---------------- */
function FilterAccordion({
  title,
  count,
  isOpen,
  onClick,
  children,
  onClear,
  disabled,
}: {
  title: ReactNode;
  count: number;
  isOpen: boolean;
  onClick: () => void;
  onClear: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="border border-border-light rounded-lg">
      <button
        disabled={disabled}
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
          ${isOpen ? "rounded-b-none" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-background"}
        `}
      >
        <span>
          {title}
          {count > 0 && (
            <span className="ml-1 text-xs text-primary">({count})</span>
          )}
        </span>

        {!disabled &&
          (isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />)}
      </button>

      {isOpen && (
        <div className="px-3 py-3 bg-background-card border-t border-border-light rounded-b-lg space-y-2">
          {count > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-text-secondary underline"
            >
              Clear
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------------- Multi Select Dropdown ---------------- */
function MultiSelectDropdown({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleValue = (val: string) => {
    onChange(
      value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val]
    );
  };

  return (
    <div>
      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[36px] w-full flex flex-wrap gap-1 items-center px-2 py-1 rounded-lg bg-background border border-border-light cursor-pointer"
      >
        {value.length === 0 && (
          <span className="text-xs text-text-secondary">{placeholder}</span>
        )}

        {value.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
          >
            {item}
            <FiX
              size={12}
              onClick={(e) => {
                e.stopPropagation();
                toggleValue(item);
              }}
            />
          </span>
        ))}
      </div>

      {open && (
        <div className="mt-2 bg-background-card border border-border-light rounded-lg">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 px-3 text-xs bg-background border-b border-border-light outline-none"
          />

          <div className="max-h-40 overflow-y-auto">
            {options
              .filter((o) => o.toLowerCase().includes(search.toLowerCase()))
              .map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(opt)}
                    onChange={() => toggleValue(opt)}
                  />
                  {opt}
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
