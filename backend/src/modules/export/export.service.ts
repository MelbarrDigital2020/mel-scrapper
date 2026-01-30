import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import pool from "../../config/db";
import { exportToCSVBuffer, exportToExcelBuffer } from "./export.utils";
import { sendEmail } from "../../email/email.service"; // ✅ adjust path to your email module

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

  // ✅ NEW: list name from UI, used for download filename
  listName?: string;
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

function toSafeFileBase(input: string) {
  // safe for windows/mac/linux
  const cleaned =
    input
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "")
      .slice(0, 80) || "export";

  // avoid only underscores / dashes
  return cleaned.replace(/^[_-]+|[_-]+$/g, "") || "export";
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
  listName?: string;
}) {
  const { userId, entity, mode, format, headers, ids, query, listName } = input;

  const result = await pool.query(
    `
    INSERT INTO public.export_jobs
      (user_id, entity, mode, format, status, headers, ids, query, list_name)
    VALUES
      ($1, $2, $3, $4, 'queued', $5::jsonb, $6::jsonb, $7::jsonb, $8)
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
      listName?.trim() || null,
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

async function markJobCompleted(
  jobId: string,
  meta: {
    rowCount: number;
    fileName: string;
    filePath: string;
    fileSizeBytes: number;
  }
) {
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

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function setJobDownloadToken(jobId: string, ttlHours: number) {
  const token = makeToken();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await pool.query(
    `UPDATE public.export_jobs
     SET download_token=$2, download_token_expires_at=$3
     WHERE id=$1`,
    [jobId, token, expiresAt]
  );

  return { token, expiresAt };
}

async function markJobEmailSent(jobId: string) {
  await pool.query(
    `UPDATE public.export_jobs
     SET email_sent_at=now()
     WHERE id=$1`,
    [jobId]
  );
}

// ✅ IMPORTANT: adjust table/columns if your users table is different
async function getUserEmail(userId: string): Promise<string | null> {
  const r = await pool.query(
    `SELECT email FROM public.users WHERE id=$1 LIMIT 1`,
    [userId]
  );
  return r.rows?.[0]?.email || null;
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
      addArrayFilter(where, values, "c.job_title", (filters as any).jobTitles, "text");
      addArrayFilter(where, values, "c.job_level", (filters as any).jobLevel, "text");
      addArrayFilter(where, values, "c.email_status", (filters as any).emailStatus, "text");
      addArrayFilter(where, values, "c.country", (filters as any).location, "text");
      addArrayFilter(where, values, "c.company_id", (filters as any).company, "uuid");
      addArrayFilter(where, values, "co.industry", (filters as any).industry, "text");
      addArrayFilter(where, values, "co.employee_range", (filters as any).employees, "text");
    } else {
      addArrayFilter(where, values, "co.country", (filters as any).location, "text");
      addArrayFilter(where, values, "co.industry", (filters as any).industry, "text");
      addArrayFilter(where, values, "co.employee_range", (filters as any).employees, "text");
      addArrayFilter(where, values, "co.revenue_range", (filters as any).revenue, "text");
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
  const r = await pool.query(`SELECT * FROM public.export_jobs WHERE id=$1`, [
    jobId,
  ]);
  const job = r.rows[0];
  if (!job) throw new Error("Job not found");

  await ensureExportDir();
  await markJobProcessing(jobId);

  try {
    const entity = job.entity as ExportEntity;
    const mode = job.mode as ExportMode;
    const format = job.format as ExportFormat;

    const headers: string[] = Array.isArray(job.headers)
      ? job.headers
      : JSON.parse(job.headers);

    const ids: string[] | undefined = job.ids
      ? Array.isArray(job.ids)
        ? job.ids
        : JSON.parse(job.ids)
      : undefined;

    const query: ExportQuery | undefined = job.query
      ? typeof job.query === "object"
        ? job.query
        : JSON.parse(job.query)
      : undefined;

    const rows = await buildExportRows({ entity, mode, headers, ids, query });

    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const listBase =
      typeof job.list_name === "string" && job.list_name.trim()
        ? toSafeFileBase(job.list_name)
        : null;

    // ✅ file name uses list name if provided
    const filenameBase = listBase
      ? `${listBase}_${entity}_${dateStr}`
      : `${entity}_export_${dateStr}`;

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

    // keep filePath stable by jobId
    const filePath = path.join(EXPORT_DIR, `${jobId}.${ext}`);
    await fs.writeFile(filePath, buffer);

    await markJobCompleted(jobId, {
      rowCount: rows.length,
      fileName: filename,
      filePath,
      fileSizeBytes: buffer.length,
    });

    // ✅ NEW: create token + email user
    try {
      const userEmail = await getUserEmail(job.user_id);
      if (userEmail) {
        const { token, expiresAt } = await setJobDownloadToken(jobId, 48); // 48h expiry

        const API_BASE_URL = process.env.API_BASE_URL; // e.g. https://api.yourdomain.com
        const APP_URL = process.env.APP_URL; // e.g. https://app.yourdomain.com

        if (!API_BASE_URL || !APP_URL) {
          console.warn("Missing API_BASE_URL or APP_URL. Email links may be wrong.");
        }

        const downloadUrl = `${API_BASE_URL || ""}/api/export/jobs/${jobId}/download-public?token=${token}`;
        const portalUrl = `${APP_URL || ""}/settings/export-history`; // adjust route to your UI

        const listNameSafe =
          typeof job.list_name === "string" && job.list_name.trim()
            ? job.list_name.trim()
            : filenameBase;

        await sendEmail({
          to: userEmail,
          template: "EXPORT_READY",
          data: {
            listName: listNameSafe,
            entity,
            format: format === "excel" ? "Excel (.xlsx)" : "CSV (.csv)",
            rowCount: rows.length,
            downloadUrl,
            portalUrl,
            expiresAt: new Date(expiresAt).toLocaleString(),
          },
        });

        await markJobEmailSent(jobId);
      } else {
        console.warn("User email not found for export job:", jobId);
      }
    } catch (mailErr) {
      console.error("Export completed but failed to send email:", mailErr);
      // don't fail job if email fails
    }

    return { jobId };
  } catch (e: any) {
    await markJobFailed(jobId, e?.message || "Export failed");
    throw e;
  }
}

export const exportService = {
  // ✅ API: create job and queue it
  createJob: async (req: ExportRequest) => {
    const { userId, entity, mode, format, headers, ids, query, listName } = req;

    if (!userId) throw new Error("Missing userId");
    if (!ENTITY_CONFIG[entity]) throw new Error("Invalid entity");
    if (!headers?.length) throw new Error("No headers selected");

    // ✅ enforce listName if your UI requires it
    if (!listName || !listName.trim()) throw new Error("Missing listName");

    const jobId = await createExportJob({
      userId,
      entity,
      mode,
      format,
      headers,
      ids,
      query,
      listName,
    });

    // ✅ quick background (later replace with BullMQ worker)
    setImmediate(() => {
      processExportJob(jobId).catch((err) =>
        console.error("Export job failed:", err)
      );
    });

    return { jobId };
  },

  // ✅ list jobs for user
  listJobs: async (userId: string) => {
    const r = await pool.query(
      `SELECT id, entity, mode, format, status, row_count, file_name, list_name, created_at, started_at, finished_at, delivered_at, error_message
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
      `SELECT id, entity, mode, format, status, row_count, file_name, list_name, file_path, file_size_bytes,
              created_at, started_at, finished_at, delivered_at, error_message
       FROM public.export_jobs
       WHERE id=$1 AND user_id=$2`,
      [jobId, userId]
    );
    return r.rows[0] || null;
  },

  getJobByPublicToken: async (jobId: string, token: string) => {
    if (!token) return null;

    const r = await pool.query(
      `SELECT id, status, file_path, file_name, download_token_expires_at
      FROM public.export_jobs
      WHERE id=$1 AND download_token=$2
      LIMIT 1`,
      [jobId, token]
    );

    const job = r.rows[0];
    if (!job) return null;

    const exp = job.download_token_expires_at
      ? new Date(job.download_token_expires_at).getTime()
      : 0;

    if (!exp || exp < Date.now()) return null;

    return job;
  },
};
