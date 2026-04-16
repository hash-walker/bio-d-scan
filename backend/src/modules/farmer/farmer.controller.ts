import type { Request, Response, NextFunction } from "express";
import { farmerService } from "./farmer.service";

export const farmerController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const farmer = await farmerService.create(req.body);
      res.status(201).json(farmer);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const farmers = await farmerService.getAll();
      res.json(farmers);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const farmer = await farmerService.getById(req.params.id);
      res.json(farmer);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const farmer = await farmerService.update(req.params.id, req.body);
      res.json(farmer);
    } catch (err) {
      next(err);
    }
  },
};
