import pool from "../../config/db";

type SortBy = "name" | "company" | "revenue" | "employees" | "created_at";
type SortOrder = "asc" | "desc";

type ListQuery = Record<string, any>;

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function toSortOrder(v: any): SortOrder {
  return String(v).toLowerCase() === "desc" ? "desc" : "asc";
}

function toSortBy(v: any): SortBy {
  const allowed: SortBy[] = ["name", "company", "revenue", "employees", "created_at"];
  return allowed.includes(v) ? v : "created_at";
}

// Supports query like: jobTitles=a&jobTitles=b OR jobTitles[]=a&jobTitles[]=b
function toArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return [String(v)].filter(Boolean);
}

export class ContactsService {
  static async list(query: ListQuery) {
    const page = toInt(query.page, 1);
    const limit = Math.min(toInt(query.limit, 10), 200); // cap for safety
    const offset = (page - 1) * limit;

    const search = (query.search ?? "").toString().trim();
    const sortBy = toSortBy(query.sortBy);
    const sortOrder = toSortOrder(query.sortOrder);

    // Filters from UI
    const jobTitles = toArray(query.jobTitles ?? query["jobTitles[]"]);
    const jobLevel = toArray(query.jobLevel ?? query["jobLevel[]"]);
    const location = toArray(query.location ?? query["location[]"]); // countries
    const company = toArray(query.company ?? query["company[]"]); // company UUIDs
    const employees = toArray(query.employees ?? query["employees[]"]); // ranges
    const industry = toArray(query.industry ?? query["industry[]"]);
    const emailStatus = toArray(query.emailStatus ?? query["emailStatus[]"]);
    const intent = toArray(query.intent ?? query["intent[]"]); // optional

    // WHERE builder (parameterized)
    const where: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Search: name/email
    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      where.push(`(
        LOWER(COALESCE(ct.first_name,'') || ' ' || COALESCE(ct.last_name,'')) LIKE $${i}
        OR LOWER(COALESCE(ct.email,'')) LIKE $${i}
      )`);
      i++;
    }

    if (jobTitles.length) {
      values.push(jobTitles);
      where.push(`ct.job_title = ANY($${i}::text[])`);
      i++;
    }

    if (jobLevel.length) {
      values.push(jobLevel);
      where.push(`ct.job_level = ANY($${i}::text[])`);
      i++;
    }

    if (location.length) {
      values.push(location);
      // Using country since your UI is country/region list
      where.push(`ct.country = ANY($${i}::text[])`);
      i++;
    }

    if (company.length) {
      values.push(company);
      where.push(`ct.company_id = ANY($${i}::uuid[])`);
      i++;
    }

    if (employees.length) {
      values.push(employees);
      where.push(`cp.employee_range = ANY($${i}::text[])`);
      i++;
    }

    if (industry.length) {
      values.push(industry);
      // match either industry or raw_industry
      where.push(`(cp.industry = ANY($${i}::text[]) OR cp.raw_industry = ANY($${i}::text[]))`);
      i++;
    }

    if (emailStatus.length) {
      values.push(emailStatus);
      where.push(`ct.email_status = ANY($${i}::text[])`);
      i++;
    }

    // intent is not a real DB field in your schema — mapping idea:
    // - use ct.keyword OR ct.lead_stage OR ct.job_function etc.
    if (intent.length) {
      values.push(intent);
      where.push(`ct.keyword = ANY($${i}::text[])`);
      i++;
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Sorting mapping (safe, no direct user SQL injection)
    const sortMap: Record<SortBy, string> = {
      name: `LOWER(COALESCE(ct.first_name,'') || ' ' || COALESCE(ct.last_name,''))`,
      company: `LOWER(COALESCE(cp.name,''))`,
      employees: `LOWER(COALESCE(cp.employee_range,''))`,
      revenue: `LOWER(COALESCE(cp.revenue_range,''))`,
      created_at: `ct.created_at`,
    };
    const orderSQL = `ORDER BY ${sortMap[sortBy]} ${sortOrder}`;

    // Count query (for pagination totals)
    const countSQL = `
      SELECT COUNT(*)::int AS total
      FROM contacts ct
      LEFT JOIN companies cp ON cp.id = ct.company_id
      ${whereSQL}
    `;

    // Data query
    const dataSQL = `
      SELECT
        ct.id,
        ct.company_id,
        ct.email,
        ct.email_domain,
        ct.email_status,
        ct.first_name,
        ct.last_name,
        ct.job_title,
        ct.job_level,
        ct.linkedin_url,
        ct.address_line1,
        ct.full_address,
        ct.city,
        ct.state,
        ct.province,
        ct.postal_code,
        ct.country,
        ct.connections_count,
        ct.lead_temp,
        ct.lead_stage,
        ct.lead_score,
        ct.created_at,
        ct.updated_at,
        ct.keyword,
        ct.job_area,
        ct.job_function,

        cp.name AS company_name,
        cp.domain AS company_domain,
        cp.website AS company_website,
        cp.industry AS company_industry,
        cp.raw_industry AS company_raw_industry,
        cp.employee_range AS company_employee_range,
        cp.revenue_range AS company_revenue_range,
        cp.company_phone AS company_phone,
        cp.linkedin_url AS company_linkedin_url
      FROM contacts ct
      LEFT JOIN companies cp ON cp.id = ct.company_id
      ${whereSQL}
      ${orderSQL}
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const dataValues = [...values, limit, offset];

    const [countRes, dataRes] = await Promise.all([
      pool.query(countSQL, values),
      pool.query(dataSQL, dataValues),
    ]);

    const total = countRes.rows?.[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Shape for frontend (match your table fields)
    const rows = dataRes.rows.map((r: any) => ({
      id: r.id,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "Unknown",
      jobTitle: r.job_title,
      email: r.email,
      domain: r.email_domain,
      emailStatus: r.email_status,
      phone: r.company_phone ?? null, // your UI shows Phone column
      linkedin: r.linkedin_url ?? null,

      location: r.country ?? null,
      industry: r.company_industry ?? r.company_raw_industry ?? null,
      employees: r.company_employee_range ?? null,
      revenue: r.company_revenue_range ?? null,

      company: r.company_name ?? null,
      companyDomain: r.company_domain ?? null,
      companyId: r.company_id ?? null,
    }));

    return {
      rows,
      pagination: { page, limit, total, totalPages },
    };
  }
}
