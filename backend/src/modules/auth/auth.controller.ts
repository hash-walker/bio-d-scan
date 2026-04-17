import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export const authController = {
  async registerFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerFarmer(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async registerGovernment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerGovernment(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.auth!.userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
