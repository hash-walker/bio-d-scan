import type { Request, Response, NextFunction } from "express";
export declare const capturesController: {
    getBackupCaptures: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBackupRuns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBackupRunCaptures: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    /** HTTP POST endpoint — alternative to MQTT for the AI model to push captures. */
    ingest(req: Request, res: Response, next: NextFunction): Promise<void>;
};
