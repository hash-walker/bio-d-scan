import type { Request, Response, NextFunction } from "express";
export declare const creditsController: {
    getBalance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    redeem(req: Request, res: Response, next: NextFunction): Promise<void>;
    release(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMarketplace(req: Request, res: Response, next: NextFunction): Promise<void>;
};
