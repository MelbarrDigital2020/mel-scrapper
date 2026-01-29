import fs from "fs/promises";
import path from "path";
import pool from "../../config/db";
import { exportToCSVBuffer, exportToExcelBuffer } from "./export.utils";

type ExportEntity = "contacts" | "companies";
type ExportMode = "selected" | "filtered";
type ExportFormat = "csv" | "excel";
type FiltersDict = Record<string, string[]>;

export type ExportQuery = {
  search?: string;
  filters?: FiltersDict;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ExportRequest = {
  entity: ExportEntity;
  mode: ExportMode;
  format: ExportFormat;
  headers: string[];
  ids?: string[];
  query?: ExportQuery;
  userId: string;
};

type EntityConfig = {
  table: string;
  alias: string;
  join?: string;
  columns: Record<string, string>;
};

const ENTITY_CONFIG: Record<ExportEntity, EntityConfig> = {
  contacts: {
    table: "public.contacts",
    alias: "c",
    join: `LEFT JOIN public.companies co ON co.id = c.company_id`,
    columns: {
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

      // company fields
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

const EXPORT_DIR = path.join(process.cwd(), "storage", "exports");

async function ensureExportDir() {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
}

function safeOrder(order?: "asc" | "desc") {
  return order === "desc" ? "DESC" : "ASC";
}

function buildSearchWhere(entity: ExportEntity, searchParamIndex: number) {
  if (entity === "contacts") {
    return ` AND (
      LOWER(COALESCE(c.first_name,'')) LIKE $${searchParamIndex}
      OR LOWER(COALESCE(c.last_name,'')) LIKE $${searchParamIndex}
      OR LOWER(COALESCE(c.email,'')) LIKE $${searchParamIndex}
      OR LOWER(TRIM(CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')))) LIKE $${searchParamIndex}
    )`;
  }

  return ` AND (
    LOWER(COALESCE(co.name,'')) LIKE $${searchParamIndex}
    OR LOWER(COALESCE(co.domain,'')) LIKE $${searchParamIndex}
  )`;
}

function addArrayFilter(
  where: { sql: string },
  values: unknown[],
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
  entity: ExportEntity;
  mode: ExportMode;
  format: ExportFormat;
  headers: string[];
  ids?: string[];
  query?: ExportQuery;
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
    `UPDATE public.export_jobs
     SET status='processing', started_at=now(), error_message=NULL
     WHERE id=$1`,
    [jobId]
  );
}

async function markJobCompleted(jobId: string, meta: {
  rowCount: number;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
}) {
  await pool.query(
    `UPDATE public.export_jobs
     SET status='completed',
         finished_at=now(),
         row_count=$2,
         file_name=$3,
         file_path=$4,
         file_size_bytes=$5
     WHERE id=$1`,
    [jobId, meta.rowCount, meta.fileName, meta.filePath, meta.fileSizeBytes]
  );
}

async function markJobFailed(jobId: string, message: string) {
  await pool.query(
    `UPDATE public.export_jobs
     SET status='failed', finished_at=now(), error_message=$2
     WHERE id=$1`,
    [jobId, message]
  );
}

export async function markJobDelivered(jobId: string) {
  await pool.query(
    `UPDATE public.export_jobs
     SET delivered_at=now()
     WHERE id=$1 AND delivered_at IS NULL`,
    [jobId]
  );
}

// ✅ build rows (reusable by worker)
async function buildExportRows(input: {
  entity: ExportEntity;
  mode: ExportMode;
  headers: string[];
  ids?: string[];
  query?: ExportQuery;
}) {
  const { entity, mode, headers, ids, query } = input;

  const cfg = ENTITY_CONFIG[entity];
  const selectCols = headers.map((h) => {
    const expr = cfg.columns[h];
    if (!expr) throw new Error(`Invalid header key: ${h}`);
    return `${expr} AS "${h}"`;
  });

  const values: unknown[] = [];
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
  return result.rows;
}

// ✅ async processing: generate + write to disk
export async function processExportJob(jobId: string) {
  const r = await pool.query(
    `SELECT * FROM public.export_jobs WHERE id=$1`,
    [jobId]
  );
  const job = r.rows[0];
  if (!job) throw new Error("Job not found");

  await ensureExportDir();
  await markJobProcessing(jobId);

  try {
    const entity = job.entity as ExportEntity;
    const mode = job.mode as ExportMode;
    const format = job.format as ExportFormat;
    const headers: string[] = Array.isArray(job.headers) ? job.headers : JSON.parse(job.headers);
    const ids: string[] | undefined = job.ids ? (Array.isArray(job.ids) ? job.ids : JSON.parse(job.ids)) : undefined;
    const query: ExportQuery | undefined = job.query ? (typeof job.query === "object" ? job.query : JSON.parse(job.query)) : undefined;

    const rows = await buildExportRows({ entity, mode, headers, ids, query });

    const filenameBase = `${entity}_export_${new Date().toISOString().slice(0, 10)}`;

    let buffer: Buffer;
    let filename: string;
    let ext: string;

    if (format === "csv") {
      buffer = exportToCSVBuffer(rows, headers);
      filename = `${filenameBase}.csv`;
      ext = "csv";
    } else {
      buffer = await exportToExcelBuffer(rows, headers);
      filename = `${filenameBase}.xlsx`;
      ext = "xlsx";
    }

    const filePath = path.join(EXPORT_DIR, `${jobId}.${ext}`);
    await fs.writeFile(filePath, buffer);

    await markJobCompleted(jobId, {
      rowCount: rows.length,
      fileName: filename,
      filePath,
      fileSizeBytes: buffer.length,
    });

    return { jobId };
  } catch (e: any) {
    await markJobFailed(jobId, e?.message || "Export failed");
    throw e;
  }
}

export const exportService = {
  // ✅ API: create job and queue it
  createJob: async (req: ExportRequest) => {
    const { userId, entity, mode, format, headers, ids, query } = req;

    if (!userId) throw new Error("Missing userId");
    if (!ENTITY_CONFIG[entity]) throw new Error("Invalid entity");
    if (!headers?.length) throw new Error("No headers selected");

    const jobId = await createExportJob({
      userId,
      entity,
      mode,
      format,
      headers,
      ids,
      query,
    });

    // ✅ quick background (later replace with BullMQ worker)
    setImmediate(() => {
      processExportJob(jobId).catch((err) => console.error("Export job failed:", err));
    });

    return { jobId };
  },

  // ✅ list jobs for user
  listJobs: async (userId: string) => {
    const r = await pool.query(
      `SELECT id, entity, mode, format, status, row_count, file_name, created_at, started_at, finished_at, delivered_at, error_message
       FROM public.export_jobs
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return r.rows;
  },

  // ✅ get single job
  getJob: async (userId: string, jobId: string) => {
    const r = await pool.query(
      `SELECT id, entity, mode, format, status, row_count, file_name, file_path, file_size_bytes,
              created_at, started_at, finished_at, delivered_at, error_message
       FROM public.export_jobs
       WHERE id=$1 AND user_id=$2`,
      [jobId, userId]
    );
    return r.rows[0] || null;
  },
};
