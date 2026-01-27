import fs from "fs/promises";
import path from "path";
import type { SyncOptions } from "./sync.types";

// ✅ CHANGE THIS import to your actual DB connection
// Example: import { pool } from "../../db/pool";
import pool from "../../config/db";

function normalizeDomain(input: string | null | undefined): string {
  if (!input) return "";
  let d = input.trim().toLowerCase();

  // remove protocol
  d = d.replace(/^https?:\/\//, "");
  // remove www
  d = d.replace(/^www\./, "");
  // remove trailing slash and path
  d = d.split("/")[0].trim();

  return d;
}

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

const map = new Map<
  string,
  { id: string; name: string; domain: string }
>();

  for (const r of rows) {
    const name = (r.name || "").trim();
    const domain = normalizeDomain(r.domain);

    if (!name) continue;

    const key = `n:${name.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        id: r.id,
        name,
        domain,
      });
    }
  }

  const uniqueCompanies = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  onProgress(55);

  const payload = {
    companies: uniqueCompanies.map((c) => ({
      uuid: c.id,          // ✅ DB ID
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

export async function runSyncTask(
  options: SyncOptions,
  onProgress: (p: number) => void
) {
  const result: { companiesWritten?: number; outputFile?: string } = {};

  // You can sync multiple things later
  if (options.companies) {
    const r = await syncCompanies(onProgress);
    result.companiesWritten = r.companiesWritten;
    result.outputFile = r.outputFile;
  }

  onProgress(100);
  return result;
}
