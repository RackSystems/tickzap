import { createMiddleware } from "hono/factory";
import * as AuthService from "./auth.service";
import type { Session, SessionUser } from "./auth.service";
import { UnauthenticatedError, UntrustedOriginError } from "./auth.errors";
import { getSessionCookie, setSessionCookie } from "./session-cookie";

export type AuthEnv = {
  Variables: {
    user: SessionUser;
    session: Session;
  };
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function getTrustedOrigins(): string[] {
  return (
    process.env.TRUSTED_ORIGINS ??
    process.env.CORS_ORIGIN ??
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const requireTrustedOrigin = createMiddleware(async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) {
    await next();
    return;
  }

  const origin = c.req.header("origin");

  if (origin && !getTrustedOrigins().includes(origin)) {
    throw new UntrustedOriginError();
  }

  await next();
});

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const token = getSessionCookie(c);

  if (!token) {
    throw new UnauthenticatedError();
  }

  const data = await AuthService.getSession(token);

  if (!data) {
    throw new UnauthenticatedError();
  }

  c.set("user", data.user);
  c.set("session", data.session);
  setSessionCookie(c, token, data.session.expiresAt);

  await next();
});
