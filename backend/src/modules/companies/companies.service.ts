import pool from "../../config/db";
import type { CompaniesSearchBody } from "./companies.types";

const SORT_MAP: Record<string, string> = {
  name: "c.name",
  industry: "c.industry",
  employee_range: "c.employee_range",
  revenue_range: "c.revenue_range",
};

export async function searchCompanies(body: CompaniesSearchBody) {
  const page = Math.max(1, Number(body.page ?? 1));
  const limit = Math.min(200, Math.max(1, Number(body.limit ?? 10)));
  const offset = (page - 1) * limit;

  const search = (body.search ?? "").trim();
  const filters = body.filters ?? {};

  const where: string[] = [];
  const values: any[] = [];
  let i = 1;

  // ✅ DEBUG: incoming payload
  console.log("✅ companies.search payload:", JSON.stringify(body, null, 2));

  // search by name/domain
  if (search) {
    where.push(`(c.name ILIKE $${i} OR c.domain ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }

  // company filter (IDs)
  if (filters.company?.length) {
    where.push(`c.id = ANY($${i}::uuid[])`);
    values.push(filters.company);
    i++;
  }

  // employees (employee_range)
  if (filters.employees?.length) {
    where.push(`c.employee_range = ANY($${i}::text[])`);
    values.push(filters.employees);
    i++;
  }

  // revenue (revenue_range)
  if (filters.revenue?.length) {
    where.push(`c.revenue_range = ANY($${i}::text[])`);
    values.push(filters.revenue);
    i++;
  }

  // industry
  if (filters.industry?.length) {
    where.push(`c.industry = ANY($${i}::text[])`);
    values.push(filters.industry);
    i++;
  }

  // location = country
  if (filters.location?.length) {
    where.push(`c.country = ANY($${i}::text[])`);
    values.push(filters.location);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sortBy = body.sortBy ?? "name";
  const sortOrder = body.sortOrder === "desc" ? "DESC" : "ASC";
  const sortColumn = SORT_MAP[sortBy] ?? "c.name";

  // ✅ DEBUG: where + params (before queries)
  console.log("✅ companies.search WHERE:", whereSql || "(none)");
  console.log("✅ companies.search VALUES:", values);

  // total count
  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM companies c
    ${whereSql}
  `;

  // ✅ DEBUG: count query
  console.log("✅ companies.search COUNT SQL:", countSql);
  console.log("✅ companies.search COUNT values:", values);

  const countRes = await pool.query(countSql, values);
  const total = countRes.rows[0]?.total ?? 0;

  // data query
  const dataSql = `
    SELECT
      c.id,
      c.name,
      c.domain,
      c.website,
      c.industry,
      c.employee_range,
      c.revenue_range,
      c.country,
      c.company_phone,
      c.linkedin_url
    FROM companies c
    ${whereSql}
    ORDER BY ${sortColumn} ${sortOrder}, c.created_at DESC
    LIMIT $${i} OFFSET $${i + 1}
  `;
  
  const dataValues = [...values, limit, offset];

  // ✅ DEBUG: data query
  console.log("✅ companies.search DATA SQL:", dataSql);
  console.log("✅ companies.search DATA values:", dataValues);

  const dataRes = await pool.query(dataSql, dataValues);

  // ✅ DEBUG: results summary
  console.log("✅ companies.search RESULT:", {
    page,
    limit,
    total,
    returned: dataRes.rowCount ?? dataRes.rows.length,
  });

  return {
    page,
    limit,
    total,
    rows: dataRes.rows,
  };
}
