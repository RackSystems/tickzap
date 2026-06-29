import { and, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import {
  CannotDeleteActiveUserError,
  EmailAlreadyInUseError,
  UserNotFoundError,
} from "./user.errors";
import type { CreateUser, UpdateUser, UserQuery } from "./user.schema";

type User = typeof user.$inferSelect;

async function existsByEmail(email: string): Promise<boolean> {
  const [found] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return found !== undefined;
}

export async function getById(id: string): Promise<User> {
  const [found] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (!found) {
    throw new UserNotFoundError();
  }

  return found;
}

export async function list(query: UserQuery): Promise<User[]> {
  const conditions: SQL[] = [];

  if (query.name) {
    conditions.push(ilike(user.name, `%${query.name}%`));
  }
  if (query.email) {
    conditions.push(ilike(user.email, `%${query.email}%`));
  }
  if (query.isActive !== undefined) {
    conditions.push(eq(user.isActive, query.isActive));
  }

  return db
    .select()
    .from(user)
    .where(conditions.length ? and(...conditions) : undefined);
}

export async function create(data: CreateUser): Promise<User> {
  if (await existsByEmail(data.email)) {
    throw new EmailAlreadyInUseError();
  }

  const password = await Bun.password.hash(data.password, {
    algorithm: "bcrypt",
    cost: 12,
  });

  const [created] = await db
    .insert(user)
    .values({ name: data.name, email: data.email, password })
    .returning();
  return created;
}

export async function update(id: string, data: UpdateUser): Promise<User> {
  const found = await getById(id);

  if (
    data.email &&
    data.email !== found.email &&
    (await existsByEmail(data.email))
  ) {
    throw new EmailAlreadyInUseError();
  }

  const [updated] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();
  return updated;
}

export async function remove(id: string): Promise<User> {
  const found = await getById(id);

  if (found.isActive) {
    throw new CannotDeleteActiveUserError();
  }

  const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
  return deleted;
}

export async function toggleActive(id: string): Promise<User> {
  const found = await getById(id);

  const [updated] = await db
    .update(user)
    .set({ isActive: !found.isActive })
    .where(eq(user.id, id))
    .returning();
  return updated;
}
