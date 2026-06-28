import { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import AuthService from "./AuthService";

export async function authenticate(c: Context) {
  const { email, password } = c.req.valid("json" as any); // Tipado pelo zod-validator

  const userId = await AuthService.authenticate(email, password);

  if (userId === null) {
    return c.json({ message: "Falha ao autenticar: email ou senha inválidos" }, 401);
  }

  setCookie(c, "userId", userId, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600 * 1000 * 1000,
  });

  return c.json({ message: "Login bem-sucedido" }, 200);
}

export async function deauthenticate(c: Context) {
  deleteCookie(c, "userId");
  return c.json({ message: "Logout bem-sucedido" });
}

export async function me(c: Context) {
  // Pega o userId do context, que foi setado pelo authMiddleware
  const userId = c.get("userId");

  const response = await AuthService.me(userId);
  return c.json({ message: "Usuário autenticado", body: response });
}
