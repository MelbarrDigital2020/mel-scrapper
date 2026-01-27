export type CompaniesFilters = {
  company?: string[];   // companies.id (UUID)
  employees?: string[]; // companies.employee_range
  revenue?: string[];   // companies.revenue_range
  industry?: string[];  // companies.industry
  location?: string[];  // companies.country
  intent?: string[];    // (not in DB yet - ignore for now)
};

export type CompaniesSearchBody = {
  search?: string; // name/domain search
  filters?: CompaniesFilters;

  page?: number;   // default 1
  limit?: number;  // default 10

  sortBy?: "name" | "industry" | "employee_range" | "revenue_range";
  sortOrder?: "asc" | "desc";
};

export type CompanyRow = {
  id: string;
  name: string;
  domain: string | null;
  website: string | null;

  industry: string | null;
  employee_range: string | null;
  revenue_range: string | null;

  country: string | null;
  company_phone: string | null;
  linkedin_url: string | null;
};

export type CompaniesSearchResponse = {
  success: true;
  data: CompanyRow[];
  page: number;
  limit: number;
  total: number;
};
