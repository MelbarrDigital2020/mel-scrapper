import crypto from "crypto";
import pool from "../../config/db";

type EntityFilter = "all" | "contacts" | "companies";

type ListJobsInput = {
  userId: string;
  entity: string;
  search: string;
  sortKey: string;
  sortDir: string;
  page: number;
  pageSize: number;
  baseUrl: string;
};

function safeEntity(entity: string): EntityFilter {
  if (entity === "contacts" || entity === "companies") return entity;
  return "all";
}

function safeSortDir(dir: string): "asc" | "desc" {
  return dir === "asc" ? "asc" : "desc";
}

function mapSortKey(key: string): { sql: string; needsStatusOrder?: boolean } {
  // Match your frontend keys
  switch (key) {
    case "listName":
      return { sql: "list_name" };
    case "entity":
      return { sql: "entity" };
    case "format":
      return { sql: "format" };
    case "leads":
      return { sql: "row_count" };
    case "status":
      // Custom order: completed -> processing -> failed (like your UI)
      return { sql: "status", needsStatusOrder: true };
    case "createdAt":
    default:
      return { sql: "created_at" };
  }
}

function buildCreatedAtLabel(dt: Date): string {
  // Example: "Jan 30, 2026 • 10:24 AM"
  // Using en-IN style but readable
  const d = dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const t = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${d} • ${t}`;
}

export async function listJobs(input: ListJobsInput) {
  const entity = safeEntity(input.entity);
  const sortDir = safeSortDir(input.sortDir);
  const sort = mapSortKey(input.sortKey);

  const offset = (input.page - 1) * input.pageSize;

  const where: string[] = ["user_id = $1"];
  const params: any[] = [input.userId];
  let p = 2;

  if (entity !== "all") {
    where.push(`entity = $${p++}`);
    params.push(entity);
  }

  if (input.search.trim()) {
    where.push(`LOWER(list_name) LIKE $${p++}`);
    params.push(`%${input.search.trim().toLowerCase()}%`);
  }

  // ORDER BY
  let orderBy = `${sort.sql} ${sortDir}`;
  if (sort.needsStatusOrder) {
    // completed(1) processing(2) failed(3)
    orderBy = `
      CASE status
        WHEN 'completed' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'failed' THEN 3
        ELSE 9
      END ${sortDir}
    `;
  }

  // Total count
  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM export_jobs
    WHERE ${where.join(" AND ")}
  `;
  const countRes = await pool.query(countSql, params);
  const total = countRes.rows?.[0]?.total ?? 0;

  // Rows
  const rowsSql = `
    SELECT
      id,
      entity,
      format,
      status,
      row_count,
      list_name,
      file_name,
      file_path,
      file_size_bytes,
      error_message,
      created_at,
      download_token,
      download_token_expires_at
    FROM export_jobs
    WHERE ${where.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT $${p++} OFFSET $${p++}
  `;
  const rowsRes = await pool.query(rowsSql, [...params, input.pageSize, offset]);

  const rows = rowsRes.rows.map((r: any) => {
    const createdAt = new Date(r.created_at);
    const createdAtTs = createdAt.getTime();

    // Only show downloadUrl if completed AND file_path exists
    const canDownload = r.status === "completed" && !!r.file_path;

    // If token exists and not expired, use it. Otherwise UI can call /:id/download-link on click.
    let downloadUrl: string | undefined = undefined;
    const token = r.download_token;
    const exp = r.download_token_expires_at ? new Date(r.download_token_expires_at).getTime() : 0;
    const notExpired = token && exp && exp > Date.now();

    if (canDownload && notExpired) {
      downloadUrl = `${input.baseUrl}/export-history/download/${token}`;
    }

    return {
      id: r.id,
      listName: r.list_name || "Untitled export",
      entity: r.entity, // contacts | companies
      format: (String(r.format || "").toLowerCase() === "xlsx" ? "xlsx" : String(r.format || "").toLowerCase()),
      leads: Number(r.row_count || 0),
      status: r.status,
      createdAtLabel: buildCreatedAtLabel(createdAt),
      createdAtTs,
      downloadUrl,
      fileName: r.file_name || null,
      fileSizeBytes: r.file_size_bytes || null,
      errorMessage: r.error_message || null,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));

  return {
    rows,
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages,
    },
  };
}

export async function createOrRefreshDownloadToken(opts: {
  userId: string;
  jobId: string;
  baseUrl: string;
}) {
  // Load job + ownership
  const jobRes = await pool.query(
    `
    SELECT id, user_id, status, file_path, download_token, download_token_expires_at, file_name, format
    FROM export_jobs
    WHERE id = $1
    LIMIT 1
  `,
    [opts.jobId]
  );

  if (!jobRes.rowCount) throw new Error("NOT_FOUND");

  const job = jobRes.rows[0];
  if (job.user_id !== opts.userId) throw new Error("FORBIDDEN");
  if (job.status !== "completed" || !job.file_path) throw new Error("NOT_READY");

  const now = Date.now();
  const existingToken = job.download_token as string | null;
  const existingExp = job.download_token_expires_at
    ? new Date(job.download_token_expires_at).getTime()
    : 0;

  // If still valid, reuse
  if (existingToken && existingExp > now) {
    return `${opts.baseUrl}/export-history/download/${existingToken}`;
  }

  // Create new token (random, url-safe-ish)
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24); // 24 hours

  await pool.query(
    `
    UPDATE export_jobs
    SET download_token = $1,
        download_token_expires_at = $2
    WHERE id = $3
  `,
    [token, expiresAt.toISOString(), opts.jobId]
  );

  return `${opts.baseUrl}/export-history/download/${token}`;
}

export async function getJobByValidToken(token: string): Promise<null | {
  id: string;
  file_path: string;
  file_name: string;
  format: string;
}> {
  const res = await pool.query(
    `
    SELECT id, file_path, file_name, format, download_token_expires_at
    FROM export_jobs
    WHERE download_token = $1
      AND download_token_expires_at IS NOT NULL
      AND download_token_expires_at > NOW()
      AND status = 'completed'
    LIMIT 1
  `,
    [token]
  );

  if (!res.rowCount) return null;

  return {
    id: res.rows[0].id,
    file_path: res.rows[0].file_path,
    file_name: res.rows[0].file_name || "export",
    format: res.rows[0].format || "csv",
  };
}
