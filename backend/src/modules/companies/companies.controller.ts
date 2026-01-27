import { Request, Response } from "express";
import { searchCompanies } from "./companies.service";
import type { CompaniesSearchBody } from "./companies.types";

export async function searchCompaniesController(req: Request, res: Response) {
  try {
    const body = (req.body ?? {}) as CompaniesSearchBody;

    const result = await searchCompanies(body);

    return res.json({
      success: true,
      data: result.rows,
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to search companies",
      error: err?.message ?? "unknown_error",
    });
  }
}
