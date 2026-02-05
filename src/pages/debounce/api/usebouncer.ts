import api from "../../../services/api"; 
// ✅ use YOUR existing axios instance (you already use `api` elsewhere)

export type SingleHistoryItem = {
  id: string;
  email: string;
  status: "deliverable" | "risky" | "undeliverable" | "unknown";
  reason: string;
  checkedAt: string;
};

export async function fetchSingleDebounceHistory(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const res = await api.get("/usebouncer/single/history", { params });
  // expected: { success:true, page, pageSize, total, items: [...] }
  return res.data as {
    success: boolean;
    page: number;
    pageSize: number;
    total: number;
    items: SingleHistoryItem[];
  };
}

export async function verifySingleEmail(payload: {
  email: string;
  timeout?: number;
}) {
  const res = await api.post("/usebouncer/verify/single", payload);
  // expected: { success:true, jobId, result:{ email,status,reason,... } }
  return res.data as {
    success: boolean;
    jobId: string;
    result: {
      email: string;
      status: "deliverable" | "risky" | "undeliverable" | "unknown";
      reason: string;
      checkedAt?: string;
    };
  };
}
