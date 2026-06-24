import { Request, Response } from "express";
import HttpException from "../exceptions/HttpException";

// Postgres SQLSTATE → HTTP status
const PG_TO_HTTP: Record<string, number> = {
  "23505": 409, // unique_violation
  "23503": 409, // foreign_key_violation
  "23502": 400, // not_null_violation
};

const ErrorHandler = (err: Error, _req: Request, res: Response): void => {
  if (err instanceof HttpException) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const code = (err as { code?: string }).code;
  if (code && PG_TO_HTTP[code]) {
    res.status(PG_TO_HTTP[code]).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Erro interno do servidor." });
};

export default ErrorHandler;
