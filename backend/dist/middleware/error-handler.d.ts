import type { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
}
export declare function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void;
export declare function notFound(_req: Request, res: Response): void;
export declare function createError(message: string, statusCode: number): AppError;
