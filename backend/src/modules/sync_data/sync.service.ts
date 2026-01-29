import fs from "fs/promises";
import path from "path";
import type { SyncOptions } from "./sync.types";
import pool from "../../config/db";

function normalizeDomain(input: string | null | undefined): string {
  if (!input) return "";
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.split("/")[0].trim();
  return d;
}

async function syncContacts(onProgress: (p: number) => void) {
  onProgress(10);

  const query = `
    SELECT DISTINCT ON (LOWER(job_title))
      job_title
    FROM contacts
    WHERE job_title IS NOT NULL
      AND TRIM(job_title) <> ''
    ORDER BY LOWER(job_title), job_title
  `;

  const { rows } = await pool.query<{ job_title: string }>(query);

  onProgress(50);

  const set = new Set<string>();
  for (const r of rows) {
    const jt = (r.job_title || "").trim();
    if (!jt) continue;
    set.add(jt);
  }

  const jobTitles = Array.from(set).sort((a, b) => a.localeCompare(b));

  onProgress(70);

  const payload = { jobtitle: jobTitles }; // ✅ your required JSON shape

  const frontendRoot =
    process.env.FRONTEND_ROOT || path.resolve(process.cwd(), "..");

  const outPath = path.join(
    frontendRoot,
    "src",
    "pages",
    "contacts",
    "data",
    "JobTitle.json"
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf-8");

  onProgress(95);

  return { jobTitlesWritten: jobTitles.length, outputFile: outPath };
}


/* -------------------- COMPANIES (your existing) -------------------- */
type CompanyRow = {
  id: string;
  name: string | null;
  domain: string | null;
};

async function syncCompanies(onProgress: (p: number) => void) {
  onProgress(10);

  const query = `
    SELECT DISTINCT ON (LOWER(domain))
      id,
      name,
      domain
    FROM companies
    WHERE name IS NOT NULL
    ORDER BY LOWER(domain), id
  `;

  const { rows } = await pool.query<CompanyRow>(query);

  onProgress(30);

  const map = new Map<string, { id: string; name: string; domain: string }>();

  for (const r of rows) {
    const name = (r.name || "").trim();
    const domain = normalizeDomain(r.domain);
    if (!name) continue;

    const key = `n:${name.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, { id: r.id, name, domain });
    }
  }

  const uniqueCompanies = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  onProgress(55);

  const payload = {
    companies: uniqueCompanies.map((c) => ({
      uuid: c.id,
      name: c.name,
      domain: c.domain,
    })),
  };

  onProgress(70);

  const frontendRoot =
    process.env.FRONTEND_ROOT || path.resolve(process.cwd(), "..");

  const outPath = path.join(
    frontendRoot,
    "src",
    "pages",
    "companies",
    "data",
    "CompanyList.json"
  );

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf-8");

  onProgress(95);

  return { companiesWritten: payload.companies.length, outputFile: outPath };
}

/* -------------------- RUNNER (sequential) -------------------- */

// ✅ NEW: task-level hook so jobs can update step status
export async function runSyncTask(
  options: SyncOptions,
  hooks: {
    onOverallProgress: (p: number) => void;
    onTaskStart: (key: "companies" | "contacts") => void;
    onTaskProgress: (key: "companies" | "contacts", p: number) => void;
    onTaskDone: (key: "companies" | "contacts", result: any) => void;
  }
) {
  const result: {
    companiesWritten?: number;
    jobTitlesWritten?: number;
    outputFiles?: Record<string, string>;
  } = { outputFiles: {} };


  const tasks: Array<"companies" | "contacts"> = [];
  if (options.companies) tasks.push("companies");
  if (options.contacts) tasks.push("contacts");

  const total = tasks.length;
  let idx = 0;

  const runOne = async (key: "companies" | "contacts") => {
    hooks.onTaskStart(key);

    const taskProgressToOverall = (tp: number) => {
      // overall = completed tasks + current task % / total
      const overall = Math.round(((idx + tp / 100) / total) * 100);
      hooks.onOverallProgress(overall);
      hooks.onTaskProgress(key, tp);
    };

    if (key === "companies") {
      const r = await syncCompanies(taskProgressToOverall);
      result.companiesWritten = r.companiesWritten;
      result.outputFiles!["companies"] = r.outputFile;
      hooks.onTaskDone(key, r);
    }

    if (key === "contacts") {
      const r = await syncContacts(taskProgressToOverall);
      result.jobTitlesWritten = r.jobTitlesWritten;
      result.outputFiles!["jobtitle"] = r.outputFile;
      hooks.onTaskDone(key, r);
    }


  };

  hooks.onOverallProgress(0);

  for (idx = 0; idx < tasks.length; idx++) {
    await runOne(tasks[idx]);
  }

  hooks.onOverallProgress(100);
  return result;
}
