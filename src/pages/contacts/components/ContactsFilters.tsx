import { useState, useRef, useEffect, type ReactNode } from "react";
import { useConfirmDialog } from "../../shared/hooks/useConfirmDialog";
import { useSaveFilterDialog } from "../../shared/hooks/useSaveFilterDialog";
import { useToast } from "../../shared/toast/ToastContext";

import {
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiLock,
  FiSave,  FiBriefcase,
  FiUser,
  FiUsers,
  FiLayers,
  FiGrid,
  FiMapPin,
  FiTarget, 
} from "react-icons/fi";

/* ---------------- Region Data ---------------- */
const regionCountries: Record<string, string[]> = {
  "APAC (Asia-Pacific)": ["Afghanistan", "American Samoa", "Armenia", "Australia", "Azerbaijan", "Bangladesh", "Bhutan", "British Indian Ocean Territory", "Brunei", "Cambodia", "China", "Christmas Island", "Cocos (Keeling) Islands", "Cook Islands", "East Timor", "Fiji Islands", "French Polynesia", "Gambia The", "Guam", "Hong Kong", "India", "Indonesia", "Japan", "Kazakhstan", "Kiribati", "Kyrgyzstan", "Laos", "Macau", "Malaysia", "Maldives", "Man (Isle of)", "Marshall Islands", "Mongolia", "Myanmar", "Nauru", "Nepal", "New Caledonia", "New Zealand", "Niue", "Norfolk Island", "North Korea", "Northern Mariana Islands", "Pakistan", "Palau", "Papua new Guinea", "Philippines", "Russia", "Samoa", "Singapore", "Solomon Islands", "South Korea", "Sri Lanka", "Taiwan", "Tajikistan", "Thailand", "Tokelau", "Tonga", "Turkmenistan", "Tuvalu", "Uzbekistan", "Vanuatu", "Vietnam", "Wallis And Futuna Islands"],
  "EMEA(Europe, Middle East & Africa)": ["Aland Islands", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Austria", "Bahrain", "Belarus", "Belgium", "Benin", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Bulgaria", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "Congo The Democratic Republic Of The", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Faroe Islands", "Finland", "France", "Gabon", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Guernsey and Alderney", "Guinea", "Guinea-Bissau", "Hungary", "Iceland", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jersey", "Jordan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Mali", "Malta", "Mauritania", "Mauritius", "Mayotte", "Moldova", "Monaco", "Montenegro", "Morocco", "Mozambique", "Namibia", "Netherlands", "Niger", "Nigeria", "Norway", "Oman", "Palestinian Territory Occupied", "Poland", "Portugal", "Qatar", "Reunion", "Romania", "Rwanda", "Saint Helena", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Georgia", "South Sudan", "Spain", "Sudan", "Svalbard And Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syria", "Tanzania", "Togo", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Vatican City State (Holy See)", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"],
  "LATAM (Latin America)": ["Anguilla", "Antigua And Barbuda", "Argentina", "Aruba", "Bahamas The", "Barbados", "Belize", "Bolivia", "Brazil", "Cayman Islands", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Falkland Islands", "French Guiana", "Grenada", "Guadeloupe", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Martinique", "Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru", "Pitcairn Island", "Puerto Rico", "Saint Kitts And Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent And The Grenadines", "Saint-Barthelemy", "Saint-Martin (French part)", "Suriname", "Trinidad And Tobago", "Turks And Caicos Islands", "Uruguay", "Venezuela", "Virgin Islands (British)"],
  "North America": ["Bermuda", "Canada", "United States", "United States Minor Outlying Islands", "Virgin Islands (US)"],
  "Not Specified": ["unknown"],
};

/* ---------------- Types ---------------- */
type SectionKey =
  | "jobTitles"
  | "jobLevel"
  | "location"
  | "company"
  | "employees"
  | "industry"
  | "emailStatus"
  | "intent";

type FiltersState = Record<SectionKey, string[]>;

type SavedFilter = {
  id: string;
  name: string;
  filters: FiltersState;
};

/* ---------------- Labels ---------------- */
const FILTER_LABELS: Record<SectionKey, string> = {
  jobTitles: "Job Titles",
  jobLevel: "Job Level",
  location: "Location",
  company: "Company",
  employees: "Employees",
  industry: "Industry",
  emailStatus: "Email Status",
  intent: "Intent-Based",
};

/* ---------------- Filter Icons ---------------- */
const FILTER_ICONS: Record<SectionKey, React.ReactNode> = {
  jobTitles: <FiBriefcase size={14} />,
  jobLevel: <FiUser size={14} />,
  company: <FiGrid size={14} />,
  employees: <FiUsers size={14} />,
  industry: <FiLayers size={14} />,
  location: <FiMapPin size={14} />,
  emailStatus: <FiUser size={14} />,
  intent: <FiTarget size={14} />,

};

/* ---------------- Filter Config (Backend Friendly) ---------------- */
const FILTER_CONFIG: {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
  options: string[];
}[] = [
  {
    key: "jobTitles",
    label: "Job Titles",
    icon: FILTER_ICONS.jobTitles,
    options: ["Manager", "Director", "VP", "Founder", "CEO"],
  },
  {
    key: "jobLevel",
    label: "Job Level",
    icon: FILTER_ICONS.jobLevel,
    options: ["C-Level", "VP", "Director", "Manager", "IC"],
  },
  {
    key: "company",
    label: "Company",
    icon: FILTER_ICONS.company,
    options: ["Google", "Microsoft", "PwC", "Deloitte", "Amazon"],
  },
  {
    key: "employees",
    label: "Employees",
    icon: FILTER_ICONS.employees,
    options: ["1 - 10", "11 - 50", "51 - 200", "201 - 500", "501 - 1000", "1001 - 5000", "5001 - 10,000", "10,000+", "Unknown"],
  },
  {
    key: "industry",
    label: "Industry & Keywords",
    icon: FILTER_ICONS.industry,
    options: ["SaaS", "Fintech", "Healthcare", "E-commerce"],
  },
  
];

const INTENT_FILTER = {
  key: "intent",
  label: "Intent-Based",
  icon: FILTER_ICONS.intent,
  options: [
    "Hiring",
    "Fundraising",
    "Scaling Team",
    "Buying Software",
    "Expansion Plans",
  ],
};



/* ---------------- Main ---------------- */
export default function ContactsFilter() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("jobTitles");
  const confirm = useConfirmDialog();
  const saveFilterDialog = useSaveFilterDialog();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<FiltersState>({
    jobTitles: [],
    jobLevel: [],
    location: [],
    company: [],
    employees: [],
    industry: [],
    emailStatus: [],
    intent: [],

  });

const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
const [showSaved, setShowSaved] = useState(false);
const savedDropdownRef = useRef<HTMLDivElement | null>(null);

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
      intent: [],
    });
  };

const saveCurrentFilter = async () => {
  const ok = await confirm({
    title: "Are you absolutely sure?",
    description:
      "This will save the current filter configuration. You can reuse it later from saved filters.",
    confirmText: "Continue",
    cancelText: "Cancel",
  });

  if (!ok) return;

  const name = await saveFilterDialog();
  if (!name) return;

  const exists = savedFilters.some(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      showToast({
        type: "error",
        title: "Duplicate filter",
        message: "A filter with this name already exists.",
      });
      return;
    }


  setSavedFilters((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      name,
      filters,
    },
  ]);

  // ✅ SUCCESS TOAST
  showToast({
    type: "success",
    title: "Filter saved",
    message: `"${name}" has been added to your saved filters.`,
  });
};

useEffect(() => {
  const handleOutside = (e: MouseEvent) => {
    const target = e.target as Node;

    if (
      showSaved &&
      savedDropdownRef.current &&
      !savedDropdownRef.current.contains(target)
    ) {
      setShowSaved(false);
    }
  };

  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, [showSaved]);

  const applySavedFilter = (saved: SavedFilter) => {
    setFilters(saved.filters);
    setShowSaved(false);
  };
/* ---------------- Delete Saved Filter ---------------- */
 const deleteSavedFilter = async (filter: SavedFilter) => {
  const ok = await confirm({
    title: "Delete saved filter?",
    description:
      "This action cannot be undone. The saved filter will be permanently removed.",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "danger",
  });

  if (!ok) return;

  setSavedFilters((prev) =>
    prev.filter((f) => f.id !== filter.id)
  );

  showToast({
    type: "error",
    title: "Filter deleted",
    message: `"${filter.name}" has been permanently removed.`,
  });
};
 
  const hasAnyFilters = Object.values(filters).some((v) => v.length > 0);

/* ---------------- Active Filter Summary (NEW) ---------------- */
const activeFilterSummary = Object.entries(filters).filter(
  ([_, values]) => values.length > 0
);

  return (
    <div className="h-full bg-background-card border border-border-light rounded-xl flex flex-col">

      {/* Header */}
      <div className="px-4 py-3 border-b border-border-light space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>

          <div ref={savedDropdownRef} className="relative">
            <button
              onClick={() => setShowSaved((v) => !v)}
              className="flex items-center gap-1 text-xs text-primary"
            >
              Saved filters <FiChevronDown size={12} />
            </button>

            {showSaved && (
              <div className="absolute right-0 z-50 mt-1 w-56 bg-background-card border border-border-light rounded-lg shadow-lg overflow-hidden">
                {savedFilters.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-text-secondary">
                    No saved filters
                  </div>
                ) : (
                  savedFilters.map((sf) => (
                    <div
                      key={sf.id}
                      className="group flex items-center justify-between px-3 py-2 text-xs hover:bg-background"
                    >
                      {/* Apply filter */}
                      <button
                        onClick={() => applySavedFilter(sf)}
                        className="flex-1 text-left truncate"
                      >
                        {sf.name}
                      </button>

                      {/* Delete icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedFilter(sf);
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition"
                        title="Delete filter"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Filter Names + Count (PASTE HERE) */}
        {activeFilterSummary.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-xs text-primary">
              {activeFilterSummary.map(([key, values]) => (
                <span
                  key={key}
                  className="px-2 py-0.5 rounded-md bg-primary/10"
                >
                  {FILTER_LABELS[key as SectionKey]} ({values.length})
                </span>
              ))}
            </div>

            <button
              onClick={clearAll}
              className="text-xs text-text-secondary underline whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {/* Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">

        {/* ---------------- STANDARD FILTERS ---------------- */}
        {FILTER_CONFIG.map(({ key, label, icon, options }) => (
          <FilterAccordion
            key={key}
            title={
              <span className="flex items-center gap-2">
                {icon}
                {label}
              </span>
            }
            count={filters[key].length}
            isOpen={openSection === key}
            onClick={() => toggle(key)}
            onClear={() => clearFilter(key)}
          >
            <MultiSelectDropdown
              placeholder={`Search ${label.toLowerCase()}`}
              options={options}
              value={filters[key]}
              onChange={(v) => updateFilter(key, v)}
            />
          </FilterAccordion>
        ))}
         {/* // ---------------- Location Filter (SPECIAL) ---------------- */}
        <FilterAccordion
          title={
            <span className="flex items-center gap-2">
              {FILTER_ICONS.location}
              Location
            </span>
          }

          count={filters.location.length}
          isOpen={openSection === "location"}
          onClick={() => toggle("location")}
          onClear={() => clearFilter("location")}
        >
          <LocationRegionDropdown
            value={filters.location}
            onChange={(v) => updateFilter("location", v)}
          />
        </FilterAccordion>
        {/* ---------------- INTENT FILTER (SPECIAL) ---------------- */}
        {/* ---------------- Intent-Based Filter ---------------- */}
      <FilterAccordion
        title={
          <span className="flex items-center gap-2">
            {INTENT_FILTER.icon}
            {INTENT_FILTER.label}
          </span>
        }
        count={filters.intent.length}
        isOpen={openSection === "intent"}
        onClick={() => toggle("intent")}
        onClear={() => clearFilter("intent")}
      >
        <MultiSelectDropdown
          placeholder="Search intent signals"
          options={INTENT_FILTER.options}
          value={filters.intent}
          onChange={(v) => updateFilter("intent", v)}
        />
      </FilterAccordion>
        {/* ---------------- LOCKED FILTER (SPECIAL) ---------------- */}
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

      {/* Footer */}
      <div className="border-t border-border-light p-3 bg-background-card">
        <button
          onClick={saveCurrentFilter}
          className="flex items-center justify-center gap-1 h-9 px-3 rounded-lg border border-border-light text-sm hover:bg-background"
        >
          <FiSave size={14} />
          Save Filter
        </button>
      </div>
      {confirm.Dialog}
      {saveFilterDialog.Dialog}
    </div>
  );
}

/* ---------------- Location Region Dropdown ---------------- */
function LocationRegionDropdown({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const MAX_VISIBLE = 5;
  const visibleItems = value.slice(0, MAX_VISIBLE);
  const hiddenCount = value.length - visibleItems.length;

  const toggleCountry = (country: string) => {
    onChange(
      value.includes(country)
        ? value.filter((v) => v !== country)
        : [...value, country]
    );
  };

  const toggleRegion = (countries: string[]) => {
    const allSelected = countries.every((c) => value.includes(c));
    onChange(
      allSelected
        ? value.filter((v) => !countries.includes(v))
        : [...new Set([...value, ...countries])]
    );
  };

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[36px] w-full flex flex-wrap gap-1 items-center px-2 py-1 rounded-lg bg-background border border-border-light cursor-pointer"
      >
        {value.length === 0 && (
          <span className="text-xs text-text-secondary">
            Search countries or regions
          </span>
        )}

        {visibleItems.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs"
          >
            {item}
            <FiX
              size={12}
              onClick={(e) => {
                e.stopPropagation();
                toggleCountry(item);
              }}
            />
          </span>
        ))}

        {hiddenCount > 0 && (
          <span className="px-2 py-0.5 text-xs text-text-secondary">
            +{hiddenCount} more
          </span>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-background-card border border-border-light rounded-lg shadow-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or region..."
            className="w-full h-8 px-3 text-xs bg-background border-b border-border-light outline-none"
          />

          <div className="max-h-60 overflow-y-auto p-2 space-y-3">
            {Object.entries(regionCountries).map(([region, countries]) => {
              const filtered = countries.filter((c) =>
                c.toLowerCase().includes(search.toLowerCase())
              );
              if (filtered.length === 0) return null;

              const allSelected = countries.every((c) => value.includes(c));
              const someSelected =
                !allSelected && countries.some((c) => value.includes(c));

              return (
                <div key={region}>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={() => toggleRegion(countries)}
                    />
                    {region}
                  </label>

                  <div className="ml-5 mt-1 space-y-1">
                    {filtered.map((country) => (
                      <label
                        key={country}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={value.includes(country)}
                          onChange={() => toggleCountry(country)}
                        />
                        {country}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const MAX_VISIBLE = 5;
  const visibleItems = value.slice(0, MAX_VISIBLE);
  const hiddenCount = value.length - visibleItems.length;

  useEffect(() => {
  const handleOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (open && dropdownRef.current && !dropdownRef.current.contains(target)) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutside);
  return () => document.removeEventListener("mousedown", handleOutside);
}, [open]);


  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (open && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const toggleValue = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[36px] w-full flex flex-wrap gap-1 items-center px-2 py-1 rounded-lg bg-background border border-border-light cursor-pointer"
      >
        {value.length === 0 && (
          <span className="text-xs text-text-secondary">{placeholder}</span>
        )}

        {visibleItems.map((item) => (
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

        {hiddenCount > 0 && (
          <span className="px-2 py-0.5 text-xs text-text-secondary">
            +{hiddenCount} more
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-background-card border border-border-light rounded-lg shadow-xl overflow-hidden">
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

