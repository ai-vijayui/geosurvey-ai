import type { Response } from "express";
import type { ApiResponse } from "@geosurvey-ai/shared";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data } satisfies ApiResponse<T>);
}

export function okPaginated<T>(
  res: Response,
  data: T,
  pagination: { page: number; limit: number; total: number },
  status = 200
) {
  return res.status(status).json({ success: true, data, pagination } satisfies ApiResponse<T>);
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}
