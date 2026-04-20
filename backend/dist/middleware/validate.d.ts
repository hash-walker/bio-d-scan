import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
/** Validates req.body against a Zod schema. Attaches parsed data to req.body. */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
