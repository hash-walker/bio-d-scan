import type { Request, Response, NextFunction } from "express";
export declare const govController: {
    getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFarmerDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
};
