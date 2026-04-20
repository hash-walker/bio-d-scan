import type { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    role: "farmer" | "government";
    farmerId: string | null;
}
declare global {
    namespace Express {
        interface Request {
            auth?: JwtPayload;
        }
    }
}
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): void;
export declare function requireRole(role: "farmer" | "government"): (req: Request, _res: Response, next: NextFunction) => void;
