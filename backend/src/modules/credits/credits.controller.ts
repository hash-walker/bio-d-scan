import type { Request, Response, NextFunction } from "express";
import { creditsService } from "./credits.service";
import { RedeemSchema, ReleaseSchema } from "./credits.schema";

export const creditsController = {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await creditsService.getBalance(req.params.farmerId);
      res.json({ balance });
    } catch (err) {
      next(err);
    }
  },

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const txns = await creditsService.getTransactions(req.params.farmerId);
      res.json(txns);
    } catch (err) {
      next(err);
    }
  },

  async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const input = RedeemSchema.parse(req.body);
      const result = await creditsService.redeem(req.params.farmerId, input);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async release(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ReleaseSchema.parse(req.body);
      const result = await creditsService.release(input);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getMarketplace(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await creditsService.getMarketplaceItems();
      res.json(items);
    } catch (err) {
      next(err);
    }
  },
};
