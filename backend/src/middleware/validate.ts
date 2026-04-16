import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/** Validates req.body against a Zod schema. Attaches parsed data to req.body. */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Validation error", details: result.error.errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
