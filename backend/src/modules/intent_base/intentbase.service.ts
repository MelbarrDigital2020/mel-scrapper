// src/modules/intent_base/intentbase.service.ts
import pool from "../../config/db";
import type { IntentLevel, SingleIntentResult } from "./intentbase.types";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

/**
 * ✅ Simple mapping:
 * - If intent_signal has a number (0-100) => use it as score
 * - Else if contains high/medium/low keywords => assign score buckets
 * - Else unknown
 */
function deriveIntent(intentSignal: string | null | undefined): {
  intentLevel: IntentLevel;
  intentScore: number;
  reason: string;
} {
  const sig = (intentSignal || "").trim();
  if (!sig) {
    return {
      intentLevel: "unknown",
      intentScore: 0,
      reason: "Not enough intent data available for this email.",
    };
  }

  // numeric in signal => score
  const num = Number(sig);
  if (Number.isFinite(num) && num >= 0 && num <= 100) {
    const level: IntentLevel =
      num >= 75 ? "high" : num >= 40 ? "medium" : num >= 1 ? "low" : "unknown";

    return {
      intentLevel: level,
      intentScore: Math.round(num),
      reason:
        level === "high"
          ? "Strong buying signals detected across recent activity."
          : level === "medium"
            ? "Moderate signals detected — good candidate for segmented outreach."
            : level === "low"
              ? "Weak signals detected — consider nurturing or deprioritizing."
              : "Not enough intent data available for this email.",
    };
  }

  const low = sig.toLowerCase();
  if (low.includes("high")) {
    return {
      intentLevel: "high",
      intentScore: 90,
      reason: "Strong buying signals detected across recent activity.",
    };
  }
  if (low.includes("medium") || low.includes("moderate")) {
    return {
      intentLevel: "medium",
      intentScore: 65,
      reason: "Moderate signals detected — good candidate for segmented outreach.",
    };
  }
  if (low.includes("low") || low.includes("weak")) {
    return {
      intentLevel: "low",
      intentScore: 25,
      reason: "Weak signals detected — consider nurturing or deprioritizing.",
    };
  }

  // fallback: treat as meaningful but unknown strength
  return {
    intentLevel: "unknown",
    intentScore: 0,
    reason: "Intent signal found but strength is unknown.",
  };
}

export class IntentBaseService {
  static async singleByEmail(emailRaw: string): Promise<SingleIntentResult> {
    const email = normalizeEmail(emailRaw);
    if (!email || !email.includes("@")) {
      return {
        email: emailRaw,
        found: false,
        intentLevel: "unknown",
        intentScore: 0,
        reason: "Please enter a valid email address.",
        checkedAt: new Date().toISOString(),
      };
    }

    // ✅ Change table name here if needed
    // Example table: intent_base_leads or leads etc.
    const CONTACTS = "contacts"; // <-- set your real table name

    const result = await pool.query(
      `
      SELECT
        l.email,
        l.email_domain,
        l.intent_signal,
        l.updated_at,
        l.created_at,
        c.name AS company_name,
        c.domain AS company_domain
      FROM ${CONTACTS} l
      LEFT JOIN companies c ON c.id = l.company_id
      WHERE LOWER(l.email) = $1
      LIMIT 1
      `,
      [email],
    );

    const nowIso = new Date().toISOString();

    if (result.rows.length === 0) {
      return {
        email,
        found: false,
        intentLevel: "unknown",
        intentScore: 0,
        reason:
          "This email was not found in your database. Try another email from your saved leads or run an import/sync.",
        checkedAt: nowIso,
      };
    }

    const row = result.rows[0];

    const derived = deriveIntent(row.intent_signal);

    return {
      email: row.email,
      found: true,
      companyName: row.company_name || "Not available",
      companyDomain:
        row.company_domain || row.email_domain || "Not available",
      industry: row.industry || "Not available",
      intentSignal: row.intent_signal ?? null,
      intentLevel: derived.intentLevel,
      intentScore: derived.intentScore,
      reason: derived.reason,
      checkedAt: (row.updated_at || row.created_at || nowIso).toISOString?.()
        ? (row.updated_at || row.created_at).toISOString()
        : new Date(row.updated_at || row.created_at || nowIso).toISOString(),
    };
  }
}
