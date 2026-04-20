import type { NextFunction, Request, Response } from "express";
export declare const captureBackupsController: {
    listCaptures(req: Request, res: Response, next: NextFunction): Promise<void>;
    listRuns(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRunCaptures(req: Request, res: Response, next: NextFunction): Promise<void>;
};
