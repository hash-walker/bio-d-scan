import type { Request, Response, NextFunction } from "express";
import { govService } from "./gov.service";

export const govController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await govService.getOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  },

  async getFarmerDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await govService.getFarmerDetails(req.params.farmerId);
      if (!data) {
        res.status(404).json({ error: "Farmer not found" });
        return;
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
