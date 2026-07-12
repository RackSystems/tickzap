import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "tickzap.session_token";

export function getSessionCookie(c: Context): string | undefined {
  return getCookie(c, COOKIE_NAME);
}

export function setSessionCookie(
  c: Context,
  token: string,
  expiresAt: Date,
): void {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}
