import pool from "../../config/db";
import { exportToCSVBuffer, exportToExcelBuffer } from "./export.utils";

type ExportEntity = "contacts" | "companies";
type ExportMode = "selected" | "filtered";
type ExportFormat = "csv" | "excel";
type FiltersDict = Record<string, string[]>;
type ExportQuery = {
  search?: string;
  filters?: FiltersDict;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// generic JSON-safe type
type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

type PgParam = string | number | boolean | null | string[] | JsonValue;

type ExportRequest = {
  entity: ExportEntity;
  mode: ExportMode;
  format: ExportFormat;
  headers: string[];
  ids?: string[];
  query?: ExportQuery;
  userId?: string;
};


type EntityConfig = {
  table: string;
  alias: string;
  join?: string; // optional join SQL
  columns: Record<string, string>; // headerKey -> SQL expression
};

const ENTITY_CONFIG: Record<ExportEntity, EntityConfig> = {
  contacts: {
    table: "public.contacts",
    alias: "c",
    // ✅ join to companies so we can export company fields too
    join: `LEFT JOIN public.companies co ON co.id = c.company_id`,
    columns: {
      // contact fields
      id: "c.id",
      company_id: "c.company_id",
      first_name: "c.first_name",
      last_name: "c.last_name",
      name: `TRIM(CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')))`,
      email: "c.email",
      email_domain: "c.email_domain",
      email_status: "c.email_status",
      job_title: "c.job_title",
      job_level: "c.job_level",
      linkedin_url: "c.linkedin_url",
      address_line1: "c.address_line1",
      full_address: "c.full_address",
      city: "c.city",
      state: "c.state",
      province: "c.province",
      postal_code: "c.postal_code",
      country: "c.country",
      connections_count: "c.connections_count",
      lead_temp: "c.lead_temp",
      lead_stage: "c.lead_stage",
      lead_score: "c.lead_score",
      keyword: "c.keyword",
      job_area: "c.job_area",
      job_function: "c.job_function",
      created_at: "c.created_at",
      updated_at: "c.updated_at",

      // company fields (from join)
      company_name: "co.name",
      company_domain: "co.domain",
      company_website: "co.website",
      company_industry: "co.industry",
      company_raw_industry: "co.raw_industry",
      company_employee_range: "co.employee_range",
      company_revenue_range: "co.revenue_range",
      company_phone: "co.company_phone",
      company_linkedin_url: "co.linkedin_url",
      company_country: "co.country",
    },
  },

  companies: {
    table: "public.companies",
    alias: "co",
    columns: {
      id: "co.id",
      name: "co.name",
      domain: "co.domain",
      website: "co.website",
      industry: "co.industry",
      raw_industry: "co.raw_industry",
      raw_employee: "co.raw_employee",
      employee_range: "co.employee_range",
      raw_revenue: "co.raw_revenue",
      revenue_range: "co.revenue_range",
      address_line1: "co.address_line1",
      full_address: "co.full_address",
      city: "co.city",
      state: "co.state",
      province: "co.province",
      postal_code: "co.postal_code",
      country: "co.country",
      company_phone: "co.company_phone",
      linkedin_url: "co.linkedin_url",
      source: "co.source",
      created_at: "co.created_at",
      updated_at: "co.updated_at",
    },
  },
};

/* ---------------- Helpers ---------------- */

function safeOrder(order?: "asc" | "desc") {
  return order === "desc" ? "DESC" : "ASC";
}

function buildSearchWhere(entity: ExportEntity, searchParamIndex: number) {
  // searchParamIndex is the $N index for the `%search%` value
  if (entity === "contacts") {
    // ✅ contacts has no "name" column -> use first/last/email + computed full name
    return ` AND (
      LOWER(COALESCE(c.first_name,'')) LIKE $${searchParamIndex}
      OR LOWER(COALESCE(c.last_name,'')) LIKE $${searchParamIndex}
      OR LOWER(COALESCE(c.email,'')) LIKE $${searchParamIndex}
      OR LOWER(TRIM(CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')))) LIKE $${searchParamIndex}
    )`;
  }

  // companies
  return ` AND (
    LOWER(COALESCE(co.name,'')) LIKE $${searchParamIndex}
    OR LOWER(COALESCE(co.domain,'')) LIKE $${searchParamIndex}
  )`;
}

function addArrayFilter(
  where: { sql: string },
  values: any[],
  columnSql: string,
  items: string[] | undefined,
  pgType: "text" | "uuid"
) {
  if (!items || items.length === 0) return;

  values.push(items);
  where.sql += ` AND ${columnSql} = ANY($${values.length}::${pgType}[])`;
}

async function createExportJob(input: {
  userId: string;
  entity: string;
  mode: string;
  format: string;
  headers: string[];
  ids?: string[];
  query?: any;
}) {
  const { userId, entity, mode, format, headers, ids, query } = input;

  const result = await pool.query(
    `
    INSERT INTO public.export_jobs
      (user_id, entity, mode, format, status, headers, ids, query)
    VALUES
      ($1, $2, $3, $4, 'queued', $5::jsonb, $6::jsonb, $7::jsonb)
    RETURNING id
    `,
    [
      userId,
      entity,
      mode,
      format,
      JSON.stringify(headers),
      ids ? JSON.stringify(ids) : null,
      query ? JSON.stringify(query) : null,
    ]
  );

  return result.rows[0].id as string;
}

async function markJobProcessing(jobId: string) {
  await pool.query(
    `
    UPDATE public.export_jobs
    SET status = 'processing', started_at = now(), error_message = NULL
    WHERE id = $1
    `,
    [jobId]
  );
}

async function markJobCompleted(jobId: string, meta: {
  rowCount: number;
  fileName: string;
  fileSizeBytes: number;
}) {
  await pool.query(
    `
    UPDATE public.export_jobs
    SET status = 'completed',
        finished_at = now(),
        row_count = $2,
        file_name = $3,
        file_size_bytes = $4
    WHERE id = $1
    `,
    [jobId, meta.rowCount, meta.fileName, meta.fileSizeBytes]
  );
}

async function markJobFailed(jobId: string, message: string) {
  await pool.query(
    `
    UPDATE public.export_jobs
    SET status = 'failed', finished_at = now(), error_message = $2
    WHERE id = $1
    `,
    [jobId, message]
  );
}

async function markJobDelivered(jobId: string) {
  await pool.query(
    `
    UPDATE public.export_jobs
    SET delivered_at = now()
    WHERE id = $1 AND delivered_at IS NULL
    `,
    [jobId]
  );
}

/* ---------------- Main Service ---------------- */

export const exportService = {
  exportEntity: async (req: ExportRequest) => {
    const { entity, mode, format, headers, ids, query, userId } = req;

    if (!userId) throw new Error("Missing userId");
    const cfg = ENTITY_CONFIG[entity];
    if (!cfg) throw new Error("Invalid entity");
    if (!headers?.length) throw new Error("No headers selected");

    // ✅ 1) Create export job row
    const jobId = await createExportJob({
      userId,
      entity,
      mode,
      format,
      headers,
      ids,
      query,
    });

    try {
      // ✅ 2) Mark processing
      await markJobProcessing(jobId);

      // --- existing logic below (your current export code) ---
      const selectCols = headers.map((h) => {
        const expr = cfg.columns[h];
        if (!expr) throw new Error(`Invalid header key: ${h}`);
        return `${expr} AS "${h}"`;
      });

      const values: any[] = [];
      const where = { sql: "1=1" };

      if (mode === "selected") {
        if (!ids?.length) throw new Error("No ids provided for selected export");
        values.push(ids);
        where.sql += ` AND ${cfg.alias}.id = ANY($${values.length}::uuid[])`;
      }

      if (mode === "filtered") {
        const search = query?.search?.trim();
        if (search) {
          values.push(`%${search.toLowerCase()}%`);
          where.sql += buildSearchWhere(entity, values.length);
        }

        const filters = query?.filters || {};

        if (entity === "contacts") {
          addArrayFilter(where, values, "c.job_title", filters.jobTitles, "text");
          addArrayFilter(where, values, "c.job_level", filters.jobLevel, "text");
          addArrayFilter(where, values, "c.email_status", filters.emailStatus, "text");
          addArrayFilter(where, values, "c.country", filters.location, "text");
          addArrayFilter(where, values, "c.company_id", filters.company, "uuid");
          addArrayFilter(where, values, "co.industry", filters.industry, "text");
          addArrayFilter(where, values, "co.employee_range", filters.employees, "text");
        } else {
          addArrayFilter(where, values, "co.country", filters.location, "text");
          addArrayFilter(where, values, "co.industry", filters.industry, "text");
          addArrayFilter(where, values, "co.employee_range", filters.employees, "text");
          addArrayFilter(where, values, "co.revenue_range", filters.revenue, "text");
        }
      }

      let orderBy = "";
      const sortBy = query?.sortBy;
      if (sortBy && cfg.columns[sortBy]) {
        orderBy = ` ORDER BY ${cfg.columns[sortBy]} ${safeOrder(query?.sortOrder)}`;
      }

      const sql = `
        SELECT ${selectCols.join(", ")}
        FROM ${cfg.table} ${cfg.alias}
        ${cfg.join ? cfg.join : ""}
        WHERE ${where.sql}
        ${orderBy}
      `;

      const result = await pool.query(sql, values);
      const rows = result.rows;

      const filenameBase = `${entity}_export_${new Date().toISOString().slice(0, 10)}`;

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      if (format === "csv") {
        buffer = exportToCSVBuffer(rows, headers);
        filename = `${filenameBase}.csv`;
        contentType = "text/csv";
      } else {
        buffer = await exportToExcelBuffer(rows, headers);
        filename = `${filenameBase}.xlsx`;
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      // ✅ 3) Mark completed
      await markJobCompleted(jobId, {
        rowCount: rows.length,
        fileName: filename,
        fileSizeBytes: buffer.length,
      });

      // return file + jobId so controller can set header
      return {
        jobId,
        buffer,
        filename,
        contentType,
        count: rows.length,
        markDelivered: async () => markJobDelivered(jobId),
      };
    } catch (e: any) {
      await markJobFailed(jobId, e?.message || "Export failed");
      throw e;
    }
  },
};

