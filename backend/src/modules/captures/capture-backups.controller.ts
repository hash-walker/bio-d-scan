import type { NextFunction, Request, Response } from "express";
import { captureBackupsService } from "./capture-backups.service";
import { createError } from "../../middleware/error-handler";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

export const captureBackupsController = {
  async listCaptures(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parsePositiveInt(req.query.limit as string | undefined, 100), 500);
      const offset = parsePositiveInt(req.query.offset as string | undefined, 0);
      const payload = await captureBackupsService.listCaptures(limit, offset);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },

  async listRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parsePositiveInt(req.query.limit as string | undefined, 5), 20);
      const offset = parsePositiveInt(req.query.offset as string | undefined, 0);
      const payload = await captureBackupsService.listRuns(limit, offset);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },

  async getRunCaptures(req: Request, res: Response, next: NextFunction) {
    try {
      const runId = req.params.runId;
      if (!runId) throw createError("Backup run id is required", 400);

      const limit = Math.min(parsePositiveInt(req.query.limit as string | undefined, 24), 100);
      const offset = parsePositiveInt(req.query.offset as string | undefined, 0);
      const payload = await captureBackupsService.getRunCaptures(runId, limit, offset);
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },
};
