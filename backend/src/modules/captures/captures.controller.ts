import type { Request, Response, NextFunction } from "express";
import { capturesService } from "./captures.service";
import { MqttCaptureSchema } from "./captures.schema";
import { createError } from "../../middleware/error-handler";
import { captureBackupsController } from "./capture-backups.controller";

export const capturesController = {
  getBackupCaptures: captureBackupsController.listCaptures,
  getBackupRuns: captureBackupsController.listRuns,
  getBackupRunCaptures: captureBackupsController.getRunCaptures,

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { farmerId, kind, limit } = req.query as Record<string, string>;
      const captures = await capturesService.getAll({
        farmerId,
        kind,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      res.json(captures);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const capture = await capturesService.getById(req.params.id);
      if (!capture) throw createError("Capture not found", 404);
      res.json(capture);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await capturesService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  /** HTTP POST endpoint — alternative to MQTT for the AI model to push captures. */
  async ingest(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = MqttCaptureSchema.parse(req.body);
      const capture = await capturesService.ingest(parsed);
      res.status(201).json(capture);
    } catch (err) {
      next(err);
    }
  },
};
