import { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import ValidationException from "@/app/exceptions/ValidationException";

// Validação na borda (≈ Form Request do Laravel): parseia o body com um schema zod,
// substitui req.body pelo dado já validado/coerced, ou lança ValidationException
// (renderizada pelo ErrorHandler como 422 com os erros por campo).
export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_";
        (errors[key] ??= []).push(issue.message);
      }
      next(new ValidationException(errors));
      return;
    }

    req.body = result.data;
    next();
  };
