import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCookie } from "hono/cookie";
import authRoutes from "@/modules/auth/routes.hono";
import HttpException from "@/app/exceptions/HttpException";
import ValidationException from "@/app/exceptions/ValidationException";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3001"],
    credentials: true,
  })
);

// Códigos de erro do Postgres -> status HTTP
const PG_TO_HTTP: Record<string, number> = {
  "23505": 409, // unique_violation
  "23503": 409, // foreign_key_violation
  "23502": 400, // not_null_violation
  "23514": 400, // check_violation
};

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

app.onError((err, c) => {
  if (err instanceof ValidationException) {
    return c.json({ error: err.message, errors: err.errors }, err.status as any);
  }

  if (err instanceof HttpException) {
    return c.json({ error: err.message }, err.status as any);
  }

  const pgCode = findPgCode(err);
  if (pgCode) {
    return c.json({ error: "Não foi possível concluir a operação." }, PG_TO_HTTP[pgCode] as any);
  }

  console.error("[unhandled]", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => {
  return c.json({ message: "Rota não encontrada" }, 404);
});

app.route("/auth", authRoutes);

const port = Number(process.env.PORT ?? 3000) + 1; // 3001 for testing

console.log(`🔥 [Hono] Server is running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
