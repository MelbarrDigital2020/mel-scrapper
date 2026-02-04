import pool from "../../config/db";

const BASE_URL =
  process.env.BOUNCER_BASE_URL || "https://api.usebouncer.com/v1.1";
const API_KEY = process.env.BOUNCER_API_KEY;

if (!API_KEY) {
  throw new Error("BOUNCER_API_KEY is missing in env");
}

// ============================= Verify Single Email Start =============================
type VerifySingleInput = {
  userId: string;
  email: string;
  timeout: number; // 10 default, per Bouncer docs
  ip?: string;
};

type BouncerVerifyResponse = {
  email: string;
  status: "deliverable" | "risky" | "undeliverable" | "unknown";
  reason:
    | "accepted_email"
    | "low_deliverability"
    | "low_quality"
    | "invalid_email"
    | "invalid_domain"
    | "rejected_email"
    | "dns_error"
    | "unavailable_smtp"
    | "unsupported"
    | "timeout"
    | "unknown";
  domain?: { name?: string; acceptAll?: string; disposable?: string; free?: string };
  account?: { role?: string; disabled?: string; fullMailbox?: string };
  dns?: { type?: string; record?: string };
  provider?: string;
  score?: number;
  toxic?: string;
  toxicity?: number;
  retryAfter?: string;
};

export async function fetchCredits(userId: string) {
  const resp = await fetch(`${BASE_URL}/credits`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw Object.assign(new Error(`Bouncer error ${resp.status}: ${text}`), {
      status: resp.status,
    });
  }

  const data = (await resp.json()) as { credits: number };

  // job_id can be NULL (you already fixed schema)
  await pool.query(
    `
    INSERT INTO email_verification_events (job_id, event_type, http_status, payload)
    VALUES (NULL, 'credits_checked', $1, $2)
    `,
    [resp.status, data],
  );

  return data;
}

/**
 * ✅ OPTIONAL: your internal credit balance check
 * This checks your OWN system credits (credit_ledger).
 * If you haven't implemented topups yet, you can skip this block.
 */
async function getUserInternalCreditBalance(userId: string) {
  const r = await pool.query<{ balance: string }>(
    `SELECT COALESCE(SUM(amount), 0)::text AS balance
     FROM credit_ledger
     WHERE user_id = $1`,
    [userId],
  );
  return Number(r.rows[0]?.balance || 0);
}

function looksLikeEmail(email: string) {
  // simple safe check (don’t overcomplicate)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function verifySingleEmail(input: VerifySingleInput) {
  const email = input.email.trim().toLowerCase();
  const timeout = input.timeout ?? 10;

  if (!looksLikeEmail(email)) {
    throw Object.assign(new Error("Invalid email format"), { status: 400 });
  }

  // ✅ (optional) enforce your internal balance
  // If you don't want this yet, comment these lines.
  const balance = await getUserInternalCreditBalance(input.userId);
  if (balance <= 0) {
    throw Object.assign(new Error("Insufficient credits in your account"), {
      status: 402,
    });
  }

  // -------------------------------
  // S1) Create job (queued)
  // -------------------------------
  const jobInsert = await pool.query<{ id: string }>(
    `
    INSERT INTO email_verification_jobs
      (user_id, provider, job_type, status, quantity_submitted, requested_at, input_source, request_payload)
    VALUES
      ($1, 'bouncer', 'single', 'queued', 1, now(), 'ui-single', $2)
    RETURNING id
    `,
    [
      input.userId,
      {
        email,
        timeout,
        ip: input.ip || null,
      },
    ],
  );

  const jobId = jobInsert.rows[0].id;

  // Event: job created
  await pool.query(
    `
    INSERT INTO email_verification_events (job_id, event_type, payload)
    VALUES ($1, 'job_created', $2)
    `,
    [jobId, { email, timeout }],
  );

  // -------------------------------
  // S2) Call Bouncer real-time verify
  // -------------------------------
  const url = new URL(`${BASE_URL}/email/verify`);
  url.searchParams.set("email", email);
  url.searchParams.set("timeout", String(timeout));

  await pool.query(
    `
    INSERT INTO email_verification_events (job_id, event_type, payload)
    VALUES ($1, 'provider_request', $2)
    `,
    [jobId, { url: url.toString(), provider: "bouncer" }],
  );

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });

  const rawText = await resp.text().catch(() => "");
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = { rawText };
  }

  await pool.query(
    `
    INSERT INTO email_verification_events (job_id, event_type, http_status, payload)
    VALUES ($1, 'provider_response', $2, $3)
    `,
    [jobId, resp.status, json],
  );

  if (!resp.ok) {
    // Update job failed
    await pool.query(
      `
      UPDATE email_verification_jobs
      SET status='failed',
          failed_at=now(),
          error_code=$2,
          error_message=$3,
          response_payload=$4
      WHERE id=$1
      `,
      [jobId, String(resp.status), "Bouncer verify failed", json],
    );

    // Important: do NOT consume internal credits on failure
    throw Object.assign(
      new Error(
        typeof json === "object" && json?.message
          ? json.message
          : `Bouncer verify failed (${resp.status})`,
      ),
      { status: resp.status },
    );
  }

  const data = json as BouncerVerifyResponse;

  // -------------------------------
  // S3) Save result + complete job + consume credit (atomic)
  // -------------------------------
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert result row (Table B)
    await client.query(
      `
      INSERT INTO email_verification_results (
        job_id, email, status, reason, score, provider_name, retry_after,
        domain_name, domain_accept_all, domain_disposable, domain_free,
        account_role, account_disabled, account_full,
        dns_type, dns_record,
        toxic, toxicity,
        checked_at, raw_result
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,
        $12,$13,$14,
        $15,$16,
        $17,$18,
        now(), $19
      )
      `,
      [
        jobId,
        data.email || email,
        data.status,
        data.reason || null,
        data.score ?? null,
        data.provider ?? null,
        data.retryAfter ?? null,

        data.domain?.name ?? null,
        data.domain?.acceptAll ?? null,
        data.domain?.disposable ?? null,
        data.domain?.free ?? null,

        data.account?.role ?? null,
        data.account?.disabled ?? null,
        data.account?.fullMailbox ?? null,

        data.dns?.type ?? null,
        data.dns?.record ?? null,

        data.toxic ?? null,
        data.toxicity ?? null,

        data, // raw_result
      ],
    );

    // Update job completed (Table A)
    const stats = {
      deliverable: data.status === "deliverable" ? 1 : 0,
      risky: data.status === "risky" ? 1 : 0,
      undeliverable: data.status === "undeliverable" ? 1 : 0,
      unknown: data.status === "unknown" ? 1 : 0,
    };

    await client.query(
      `
      UPDATE email_verification_jobs
      SET status='completed',
          processed=1,
          completed_at=now(),
          credits_consumed=1,
          stats_deliverable=$2,
          stats_risky=$3,
          stats_undeliverable=$4,
          stats_unknown=$5,
          response_payload=$6
      WHERE id=$1
      `,
      [jobId, stats.deliverable, stats.risky, stats.undeliverable, stats.unknown, data],
    );

    // Consume internal credit (Table C)
    await client.query(
      `
      INSERT INTO credit_ledger (user_id, job_id, provider, event_type, amount, note, provider_ref, meta)
      VALUES ($1, $2, 'bouncer', 'consume', -1, 'single verify', NULL, $3)
      `,
      [input.userId, jobId, { email, providerStatus: data.status }],
    );

    // Event: completed
    await client.query(
      `
      INSERT INTO email_verification_events (job_id, event_type, payload)
      VALUES ($1, 'job_completed', $2)
      `,
      [jobId, { status: data.status }],
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");

    // mark job failed if DB save failed (provider succeeded but we couldn't persist)
    await pool.query(
      `
      UPDATE email_verification_jobs
      SET status='failed',
          failed_at=now(),
          error_code='db_error',
          error_message=$2,
          response_payload=$3
      WHERE id=$1
      `,
      [jobId, (e as any)?.message || "DB error", data],
    );

    throw Object.assign(new Error("DB save failed after provider success"), {
      status: 500,
    });
  } finally {
    client.release();
  }

  return {
    jobId,
    result: data,
  };
}

// ============================= Verify Single Email End =============================

// ============================= Verify Bulk Emails start =============================
type CreateBatchInput = {
  userId: string;
  emails: string[];
  callback?: string;
  fileName?: string;
  ip?: string;
};

type BouncerBatchCreateResponse = {
  batchId: string;
  created: string;
  status: "queued" | "processing" | "completed";
  quantity: number;
  duplicates: number;
};

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

function uniqueEmails(emails: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of emails) {
    const n = normalizeEmail(e);
    if (!n) continue;
    if (!looksLikeEmail(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export async function createBatchJob(input: CreateBatchInput) {
  // 1) Validate + normalize + dedupe
  const cleaned = uniqueEmails(input.emails);
  if (cleaned.length === 0) {
    throw Object.assign(new Error("No valid emails found"), { status: 400 });
  }

  // ✅ optional: enforce internal balance
  const balance = await getUserInternalCreditBalance(input.userId);
  if (balance < cleaned.length) {
    throw Object.assign(
      new Error(`Insufficient credits. Need ${cleaned.length}, you have ${balance}.`),
      { status: 402 },
    );
  }

  // -------------------------------
  // B1) Create job (queued)
  // -------------------------------
  const jobInsert = await pool.query<{ id: string }>(
    `
    INSERT INTO email_verification_jobs
      (user_id, provider, job_type, status, quantity_submitted, duplicates,
       requested_at, input_source, file_name, request_payload)
    VALUES
      ($1, 'bouncer', 'batch_async', 'queued', $2, $3,
       now(), 'ui-bulk', $4, $5)
    RETURNING id
    `,
    [
      input.userId,
      cleaned.length,
      Math.max(0, input.emails.length - cleaned.length), // local dedupe count
      input.fileName || null,
      {
        emailCount: cleaned.length,
        callback: input.callback || null,
        ip: input.ip || null,
      },
    ],
  );

  const jobId = jobInsert.rows[0].id;

  // job_created event
  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, payload)
     VALUES ($1, 'job_created', $2)`,
    [jobId, { jobType: "batch_async", quantity: cleaned.length }],
  );

  // -------------------------------
  // B2) Reserve internal credits (recommended)
  // -------------------------------
  // Reserve now, finalize on completion or refund on failure
  await pool.query(
    `
    INSERT INTO credit_ledger (user_id, job_id, provider, event_type, amount, note, provider_ref, meta)
    VALUES ($1, $2, 'bouncer', 'reserve', $3, 'reserve for batch', NULL, $4)
    `,
    [input.userId, jobId, -cleaned.length, { quantity: cleaned.length }],
  );

  // -------------------------------
  // B3) Call Bouncer batch create
  // -------------------------------
  const url = new URL(`${BASE_URL}/email/verify/batch`);
  if (input.callback) url.searchParams.set("callback", input.callback);

  // event provider_request
  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, payload)
     VALUES ($1, 'provider_request', $2)`,
    [jobId, { url: url.toString(), provider: "bouncer", type: "batch_create" }],
  );

  const body = cleaned.map((email) => ({ email }));

  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawText = await resp.text().catch(() => "");
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = { rawText };
  }

  // provider_response event
  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, http_status, payload)
     VALUES ($1, 'provider_response', $2, $3)`,
    [jobId, resp.status, json],
  );

  if (!resp.ok) {
    // mark failed
    await pool.query(
      `
      UPDATE email_verification_jobs
      SET status='failed',
          failed_at=now(),
          error_code=$2,
          error_message=$3,
          response_payload=$4
      WHERE id=$1
      `,
      [jobId, String(resp.status), "Bouncer batch create failed", json],
    );

    // refund reservation since provider create failed
    await pool.query(
      `
      INSERT INTO credit_ledger (user_id, job_id, provider, event_type, amount, note, provider_ref, meta)
      VALUES ($1, $2, 'bouncer', 'refund', $3, 'refund reserve: batch create failed', NULL, $4)
      `,
      [input.userId, jobId, cleaned.length, { reason: "provider_create_failed" }],
    );

    throw Object.assign(
      new Error(
        typeof json === "object" && json?.message
          ? json.message
          : `Bouncer batch create failed (${resp.status})`,
      ),
      { status: resp.status },
    );
  }

  const data = json as BouncerBatchCreateResponse;

  // -------------------------------
  // B4) Update job with provider batchId
  // -------------------------------
  await pool.query(
    `
    UPDATE email_verification_jobs
    SET provider_batch_id=$2,
        provider_created_at=$3,
        status=$4,
        response_payload=$5
    WHERE id=$1
    `,
    [
      jobId,
      data.batchId,
      data.created ? new Date(data.created).toISOString() : null,
      data.status === "processing" ? "processing" : "queued",
      data,
    ],
  );

  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, payload)
     VALUES ($1, 'batch_created', $2)`,
    [jobId, { batchId: data.batchId, quantity: data.quantity }],
  );

  return {
    jobId,
    batchId: data.batchId,
    status: data.status,
    quantity: data.quantity,
    duplicates: data.duplicates,
    created: data.created,
  };
}

// ============================= Verify Bulk Emails End =============================

// ============================= Status Bulk Emails Start =============================
type GetBatchStatusInput = {
  userId: string;
  jobId: string;
};

type BouncerBatchStatusResponse = {
  batchId: string;
  created: string;
  started?: string;
  completed?: string;
  status: "queued" | "processing" | "completed";
  quantity: number;
  duplicates: number;
  credits?: number;
  processed?: number;
  stats?: {
    deliverable: number;
    risky: number;
    undeliverable: number;
    unknown: number;
  };
};

export async function getBatchStatus(input: GetBatchStatusInput) {
  // 1) Load job and validate ownership
  const jobRes = await pool.query<{
    id: string;
    user_id: string;
    provider_batch_id: string | null;
    status: string;
  }>(
    `
    SELECT id, user_id, provider_batch_id, status
    FROM email_verification_jobs
    WHERE id = $1
    `,
    [input.jobId],
  );

  const job = jobRes.rows[0];
  if (!job) {
    throw Object.assign(new Error("Job not found"), { status: 404 });
  }
  if (job.user_id !== input.userId) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  if (!job.provider_batch_id) {
    throw Object.assign(new Error("provider_batch_id missing for this job"), { status: 400 });
  }

  const batchId = job.provider_batch_id;

  // 2) Call Bouncer batch status
  const url = new URL(`${BASE_URL}/email/verify/batch/${batchId}`);
  url.searchParams.set("with-stats", "true");

  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, payload)
     VALUES ($1, 'provider_request', $2)`,
    [job.id, { url: url.toString(), provider: "bouncer", type: "batch_status" }],
  );

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });

  const rawText = await resp.text().catch(() => "");
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = { rawText };
  }

  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, http_status, payload)
     VALUES ($1, 'provider_response', $2, $3)`,
    [job.id, resp.status, json],
  );

  if (!resp.ok) {
    throw Object.assign(
      new Error(
        typeof json === "object" && json?.message
          ? json.message
          : `Bouncer batch status failed (${resp.status})`,
      ),
      { status: resp.status },
    );
  }

  const data = json as BouncerBatchStatusResponse;

  // 3) Update our job table with latest status + stats (no results yet)
  const processed = typeof data.processed === "number" ? data.processed : null;
  const credits = typeof data.credits === "number" ? data.credits : null;

  const stats = data.stats || null;

  const mappedStatus =
    data.status === "completed"
      ? "completed"
      : data.status === "processing"
        ? "processing"
        : "queued";

  const isCompleted = mappedStatus === "completed";

  await pool.query(
    `
    UPDATE email_verification_jobs
    SET status = $2,
        started_at = COALESCE(started_at, $3),
        completed_at = CASE WHEN $12 THEN COALESCE(completed_at, $4) ELSE completed_at END,
        processed = COALESCE($5, processed),
        credits_consumed = COALESCE($6, credits_consumed),
        stats_deliverable = COALESCE($7, stats_deliverable),
        stats_risky = COALESCE($8, stats_risky),
        stats_undeliverable = COALESCE($9, stats_undeliverable),
        stats_unknown = COALESCE($10, stats_unknown),
        response_payload = $11
    WHERE id = $1
    `,
    [
      job.id,                      // $1
      mappedStatus,                // $2
      data.started ? new Date(data.started).toISOString() : null,   // $3
      data.completed ? new Date(data.completed).toISOString() : null, // $4
      processed,                   // $5
      credits,                     // $6
      stats ? stats.deliverable : null, // $7
      stats ? stats.risky : null,       // $8
      stats ? stats.undeliverable : null,// $9
      stats ? stats.unknown : null,      // $10
      data,                        // $11
      isCompleted,                 // $12 ✅ boolean
    ],
  );


  return {
    jobId: job.id,
    batchId: data.batchId,
    status: data.status,
    quantity: data.quantity,
    duplicates: data.duplicates,
    processed: data.processed ?? null,
    credits: data.credits ?? null,
    stats: data.stats ?? null,
    created: data.created,
    started: data.started ?? null,
    completed: data.completed ?? null,
  };
}
// ============================= Status Bulk Emails End =============================

// ============================= Download Bulk Emails Start =============================
type DownloadFilter = "all" | "deliverable" | "risky" | "undeliverable" | "unknown";

type DownloadBatchInput = {
  userId: string;
  jobId: string;
  download: DownloadFilter;
};

export async function downloadBatchResults(input: DownloadBatchInput) {
  const jobRes = await pool.query<{
    id: string;
    user_id: string;
    provider_batch_id: string | null;
    status: string;
    quantity_submitted: number;
    credits_consumed: number | null;
    processed: number | null;
  }>(
    `
    SELECT id, user_id, provider_batch_id, status, quantity_submitted, credits_consumed, processed
    FROM email_verification_jobs
    WHERE id = $1
    `,
    [input.jobId],
  );

  const job = jobRes.rows[0];
  if (!job) throw Object.assign(new Error("Job not found"), { status: 404 });
  if (job.user_id !== input.userId) throw Object.assign(new Error("Forbidden"), { status: 403 });
  if (!job.provider_batch_id) throw Object.assign(new Error("provider_batch_id missing"), { status: 400 });
  if (job.status !== "completed") throw Object.assign(new Error("Batch is not completed yet"), { status: 409 });

  const batchId = job.provider_batch_id;

  const url = new URL(`${BASE_URL}/email/verify/batch/${batchId}/download`);
  url.searchParams.set("download", input.download);

  // ✅ events.payload is jsonb -> stringify + cast
  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, payload)
     VALUES ($1, 'provider_request', $2::jsonb)`,
    [job.id, JSON.stringify({ url: url.toString(), provider: "bouncer", type: "batch_download" })],
  );

  const resp = await fetch(url.toString(), { method: "GET", headers: { "x-api-key": API_KEY } });

  const rawText = await resp.text().catch(() => "");
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = { rawText };
  }

  await pool.query(
    `INSERT INTO email_verification_events (job_id, event_type, http_status, payload)
     VALUES ($1, 'provider_response', $2, $3::jsonb)`,
    [job.id, resp.status, JSON.stringify(json)],
  );

  if (!resp.ok) {
    throw Object.assign(
      new Error(typeof json === "object" && json?.message ? json.message : `Bouncer batch download failed (${resp.status})`),
      { status: resp.status },
    );
  }

  const results = Array.isArray(json) ? (json as BouncerVerifyResponse[]) : [];
  const rowCount = results.length;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // clear old results
    await client.query(`DELETE FROM email_verification_results WHERE job_id = $1`, [job.id]);

    // ✅ raw_result is jsonb -> stringify + cast
    for (const r of results) {
      await client.query(
        `
        INSERT INTO email_verification_results (
          job_id, email, status, reason, score, provider_name, retry_after,
          domain_name, domain_accept_all, domain_disposable, domain_free,
          account_role, account_disabled, account_full,
          dns_type, dns_record,
          toxic, toxicity,
          checked_at, raw_result
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,
          $8,$9,$10,$11,
          $12,$13,$14,
          $15,$16,
          $17,$18,
          now(), $19::jsonb
        )
        `,
        [
          job.id,
          (r.email || "").toLowerCase(),
          r.status,
          r.reason || null,
          r.score ?? null,
          r.provider ?? null,
          r.retryAfter ?? null,
          r.domain?.name ?? null,
          r.domain?.acceptAll ?? null,
          r.domain?.disposable ?? null,
          r.domain?.free ?? null,
          r.account?.role ?? null,
          r.account?.disabled ?? null,
          r.account?.fullMailbox ?? null,
          r.dns?.type ?? null,
          r.dns?.record ?? null,
          r.toxic ?? null,
          r.toxicity ?? null,
          JSON.stringify(r),
        ],
      );
    }

// -----------------------------------------------------------------------------------------
    // -------------------------------
    // 3B) Finalize credits ONLY ONCE (idempotent)
    // -------------------------------
    const finalizeRes = await client.query<{
      credits_finalized: boolean;
      quantity_submitted: number;
      credits_consumed: number | null;
      processed: number | null;
    }>(
      `
      SELECT credits_finalized, quantity_submitted, credits_consumed, processed
      FROM email_verification_jobs
      WHERE id = $1
      FOR UPDATE
      `,
      [job.id],
    );

    const finalizeRow = finalizeRes.rows[0];
    if (!finalizeRow) throw new Error("Job missing during credits finalize");

    if (!finalizeRow.credits_finalized) {
      const creditsUsed =
        typeof finalizeRow.credits_consumed === "number"
          ? finalizeRow.credits_consumed
          : typeof finalizeRow.processed === "number"
            ? finalizeRow.processed
            : finalizeRow.quantity_submitted;

      const reserved = finalizeRow.quantity_submitted;
      const refund = reserved - creditsUsed;

      // ✅ Consume actual used credits (only once)
      await client.query(
        `
        INSERT INTO credit_ledger (user_id, job_id, provider, event_type, amount, note, provider_ref, meta)
        VALUES ($1, $2, 'bouncer', 'consume', $3, 'batch verify consume', $4::jsonb, $5::jsonb)
        `,
        [
          input.userId,
          job.id,
          -creditsUsed,
          JSON.stringify({ batchId }),
          JSON.stringify({ creditsUsed, download: input.download }),
        ],
      );

      // ✅ Refund leftover credits (if any)
      if (refund > 0) {
        await client.query(
          `
          INSERT INTO credit_ledger (user_id, job_id, provider, event_type, amount, note, provider_ref, meta)
          VALUES ($1, $2, 'bouncer', 'refund', $3, 'batch verify refund', $4::jsonb, $5::jsonb)
          `,
          [
            input.userId,
            job.id,
            refund,
            JSON.stringify({ batchId }),
            JSON.stringify({ reserved, creditsUsed }),
          ],
        );
      }

      // ✅ mark finalized so calling download multiple times won't double-charge
      await client.query(
        `
        UPDATE email_verification_jobs
        SET credits_finalized = true
        WHERE id = $1
        `,
        [job.id],
      );
    }

// -----------------------------------------------------------------------------------------

    // ✅ jobs.response_payload is jsonb
    await client.query(
      `
      UPDATE email_verification_jobs
      SET results_downloaded_at = now(),
          response_payload = $2::jsonb
      WHERE id = $1
      `,
      [job.id, JSON.stringify({ download: input.download, rowCount })],
    );

    await client.query(
      `INSERT INTO email_verification_events (job_id, event_type, payload)
       VALUES ($1, 'results_downloaded', $2::jsonb)`,
      [job.id, JSON.stringify({ rowCount, download: input.download })],
    );

    await client.query("COMMIT");
  } catch (e: any) {
    await client.query("ROLLBACK");
    throw Object.assign(new Error(e?.message || "Download persist failed"), { status: 500 });
  } finally {
    client.release();
  }

  return { jobId: job.id, batchId, download: input.download, rowCount };
}

// ============================= Download Bulk Emails End =============================
type GetSingleHistoryInput = {
  userId: string;
  page: number;
  pageSize: number;
  search?: string;
};

export async function getSingleHistory(input: GetSingleHistoryInput) {
  const page = Math.max(1, input.page || 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize || 5));
  const offset = (page - 1) * pageSize;

  const q = (input.search || "").trim().toLowerCase();

  // ✅ filter by email/status if search exists
  const whereSearch = q
    ? `AND (LOWER(r.email) LIKE $2 OR LOWER(r.status) LIKE $2 OR LOWER(r.reason) LIKE $2)`
    : "";

  const params: any[] = [input.userId];
  if (q) params.push(`%${q}%`);
  params.push(pageSize);
  params.push(offset);

  // total count
  const countRes = await pool.query<{ total: string }>(
    `
    SELECT COUNT(*)::text AS total
    FROM email_verification_jobs j
    JOIN email_verification_results r ON r.job_id = j.id
    WHERE j.user_id = $1
      AND j.job_type = 'single'
    ${whereSearch}
    `,
    q ? [input.userId, `%${q}%`] : [input.userId],
  );

  const total = Number(countRes.rows[0]?.total || 0);

  // paged rows
  const rowsRes = await pool.query<{
    id: string;
    email: string;
    status: string;
    reason: string | null;
    checked_at: string;
  }>(
    `
    SELECT
      j.id,
      r.email,
      r.status,
      r.reason,
      r.checked_at
    FROM email_verification_jobs j
    JOIN email_verification_results r ON r.job_id = j.id
    WHERE j.user_id = $1
      AND j.job_type = 'single'
    ${whereSearch}
    ORDER BY r.checked_at DESC
    LIMIT $${q ? 3 : 2} OFFSET $${q ? 4 : 3}
    `,
    params,
  );

  return {
    page,
    pageSize,
    total,
    items: rowsRes.rows.map((x) => ({
      id: x.id,
      email: x.email,
      status: x.status,
      reason: x.reason || "",
      checkedAt: x.checked_at,
    })),
  };
}
