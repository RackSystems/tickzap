import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import ValidationException from "../exceptions/ValidationException";

// Códigos de erro do Postgres → status HTTP.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_TO_HTTP: Record<string, number> = {
  "23505": 409, // unique_violation
  "23503": 409, // foreign_key_violation
  "23502": 400, // not_null_violation
  "23514": 400, // check_violation
};

// O Drizzle embrulha o erro original do driver em `cause`, então o código do
// Postgres pode estar a alguns níveis de profundidade. Percorre a cadeia.
function findPgCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; current && depth < 5; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && code in PG_TO_HTTP) {
      return code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

const ErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ValidationException) {
    res.status(err.status).json({ error: err.message, errors: err.errors });
    return;
  }

  if (err instanceof HttpException) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const pgCode = findPgCode(err);
  if (pgCode) {
    res.status(PG_TO_HTTP[pgCode]).json({ error: "Não foi possível concluir a operação." });
    return;
  }

  // Nunca expõe o erro cru na resposta (vazaria query/params SQL).
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal Server Error" });
};

export default ErrorHandler;
