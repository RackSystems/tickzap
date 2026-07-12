import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { session, user } from "@/db/schema";
import {
  InvalidCredentialsError,
  TooManySignInAttemptsError,
} from "./auth.errors";
import type { SignIn } from "./auth.schema";

const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;
const SESSION_UPDATE_AGE = 24 * 60 * 60 * 1000;
const SIGN_IN_ATTEMPT_WINDOW = 15 * 60 * 1000;
const SIGN_IN_ATTEMPT_LIMIT = 5;

type StoredSession = typeof session.$inferSelect;

export type Session = Pick<
  StoredSession,
  "id" | "userId" | "expiresAt" | "createdAt" | "updatedAt"
>;
export type SessionUser = Omit<typeof user.$inferSelect, "password">;

export interface SignInMeta {
  ipAddress?: string;
  userAgent?: string;
}

const sessionUserColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

const sessionColumns = {
  id: session.id,
  userId: session.userId,
  expiresAt: session.expiresAt,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
};

const signInAttempts = new Map<
  string,
  { count: number; windowStartedAt: number }
>();

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("hex");
}

function hashToken(token: string): string {
  return new Bun.CryptoHasher("sha256").update(token).digest("hex");
}

function attemptKey(data: SignIn, meta: SignInMeta): string {
  return `${meta.ipAddress ?? "unknown"}:${data.email}`;
}

export function assertCanAttemptSignIn(data: SignIn, meta: SignInMeta): void {
  const key = attemptKey(data, meta);
  const attempts = signInAttempts.get(key);

  if (!attempts) {
    return;
  }

  const windowExpired =
    Date.now() - attempts.windowStartedAt > SIGN_IN_ATTEMPT_WINDOW;

  if (windowExpired) {
    signInAttempts.delete(key);
    return;
  }

  if (attempts.count >= SIGN_IN_ATTEMPT_LIMIT) {
    throw new TooManySignInAttemptsError();
  }
}

export function recordFailedSignIn(data: SignIn, meta: SignInMeta): void {
  const key = attemptKey(data, meta);
  const now = Date.now();
  const attempts = signInAttempts.get(key);

  if (!attempts || now - attempts.windowStartedAt > SIGN_IN_ATTEMPT_WINDOW) {
    signInAttempts.set(key, { count: 1, windowStartedAt: now });
    return;
  }

  attempts.count += 1;
}

export function clearSignInAttempts(data: SignIn, meta: SignInMeta): void {
  signInAttempts.delete(attemptKey(data, meta));
}

export async function signIn(
  data: SignIn,
  meta: SignInMeta,
): Promise<{ token: string; session: Session; user: SessionUser }> {
  const [found] = await db
    .select({ user: sessionUserColumns, password: user.password })
    .from(user)
    .where(eq(user.email, data.email))
    .limit(1);

  if (!found) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await Bun.password.verify(
    data.password,
    found.password,
  );

  if (!isPasswordValid || !found.user.isActive) {
    throw new InvalidCredentialsError();
  }

  const token = generateToken();

  const [created] = await db
    .insert(session)
    .values({
      token: hashToken(token),
      userId: found.user.id,
      expiresAt: new Date(Date.now() + SESSION_EXPIRES_IN),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })
    .returning(sessionColumns);

  return { token, session: created, user: found.user };
}

export async function getSession(
  token: string,
): Promise<{ session: Session; user: SessionUser } | null> {
  const now = new Date();

  const [found] = await db
    .select({ session: sessionColumns, user: sessionUserColumns })
    .from(session)
    .innerJoin(user, eq(session.userId, user.id))
    .where(
      and(
        eq(session.token, hashToken(token)),
        gt(session.expiresAt, now),
        eq(user.isActive, true),
      ),
    )
    .limit(1);

  if (!found) {
    return null;
  }

  if (now.getTime() - found.session.updatedAt.getTime() > SESSION_UPDATE_AGE) {
    const [renewed] = await db
      .update(session)
      .set({ expiresAt: new Date(now.getTime() + SESSION_EXPIRES_IN) })
      .where(eq(session.id, found.session.id))
      .returning(sessionColumns);

    return { session: renewed, user: found.user };
  }

  return found;
}

export async function signOut(token: string): Promise<void> {
  await db.delete(session).where(eq(session.token, hashToken(token)));
}
