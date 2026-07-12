import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getConnInfo } from "hono/bun";
import * as AuthService from "./auth.service";
import { InvalidCredentialsError } from "./auth.errors";
import { signInSchema } from "./auth.schema";
import { requireAuth, type AuthEnv } from "./middleware";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "./session-cookie";

const router = new Hono<AuthEnv>();

router.post("/sign-in", zValidator("json", signInSchema), async (c) => {
  const data = c.req.valid("json");
  const meta = {
    ipAddress: getConnInfo(c).remote.address,
    userAgent: c.req.header("user-agent"),
  };

  AuthService.assertCanAttemptSignIn(data, meta);

  try {
    const { token, session, user } = await AuthService.signIn(data, meta);

    AuthService.clearSignInAttempts(data, meta);
    setSessionCookie(c, token, session.expiresAt);
    return c.json(user);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      AuthService.recordFailedSignIn(data, meta);
    }

    throw error;
  }
});

router.post("/sign-out", async (c) => {
  const token = getSessionCookie(c);

  if (token) {
    await AuthService.signOut(token);
    clearSessionCookie(c);
  }

  return c.body(null, 204);
});

router.get("/get-session", requireAuth, async (c) => {
  return c.json({ session: c.var.session, user: c.var.user });
});

export default router;
