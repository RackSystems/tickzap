import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function authMiddleware(c: Context, next: Next) {
  const userId = getCookie(c, "userId") ?? null;

  if (!userId) {
    return c.json(
      { message: "Oops! Você precisa estar autenticado para acessar este recurso." },
      401
    );
  }

  // Define the user ID in the context variables
  c.set("userId", userId);

  await next();
}
