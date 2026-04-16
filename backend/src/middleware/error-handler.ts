import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { createLogger } from "../lib/logger";

const log = createLogger("error");

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation error", details: err.errors });
    return;
  }

  const status = err.statusCode ?? 500;
  const message = err.message || "Internal server error";

  if (status >= 500) log.error(message, err);

  res.status(status).json({ error: message });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

export function createError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}
