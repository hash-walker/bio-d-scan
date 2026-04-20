import type { Request, Response, NextFunction } from "express";
export declare const authController: {
    registerFarmer(req: Request, res: Response, next: NextFunction): Promise<void>;
    registerGovernment(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    me(req: Request, res: Response, next: NextFunction): Promise<void>;
};
