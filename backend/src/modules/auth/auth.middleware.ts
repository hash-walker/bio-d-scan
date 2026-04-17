import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { createError } from "../../middleware/error-handler";

export interface JwtPayload {
  userId: string;
  role: "farmer" | "government";
  farmerId: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(createError("Unauthorized", 401));
  }
  const token = header.slice(7);
  try {
    req.auth = jwt.verify(token, config.jwtSecret) as JwtPayload;
    next();
  } catch {
    next(createError("Token invalid or expired", 401));
  }
}

export function requireRole(role: "farmer" | "government") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || req.auth.role !== role) {
      return next(createError("Forbidden", 403));
    }
    next();
  };
}
