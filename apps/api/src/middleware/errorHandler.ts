import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err);
  const message = err instanceof Error ? err.message : "Unexpected error";
  const status = message === "Unauthenticated" ? 401 : 500;
  res.status(status).json({ success: false, data: null, error: message });
}
