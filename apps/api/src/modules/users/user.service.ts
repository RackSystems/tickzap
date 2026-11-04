import { eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { revokeUserSessions } from "@/modules/auth/auth.service";
import type { TenantScope } from "@/modules/tenant/tenant-scope";
import {
  CannotDeleteActiveUserError,
  EmailAlreadyInUseError,
  UserNotFoundError,
} from "./user.errors";
import type { CreateUser, UpdateUser, UserQuery } from "./user.schema";

type User = Omit<typeof user.$inferSelect, "password">;

const userColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isActive: user.isActive,
  tenantId: user.tenantId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

// O e-mail é único globalmente (entre tenants), então esta checagem
// intencionalmente não usa o scope.
async function existsByEmail(email: string): Promise<boolean> {
  const [found] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return found !== undefined;
}

export async function getById(scope: TenantScope, id: string): Promise<User> {
  const [found] = await db
    .select(userColumns)
    .from(user)
    .where(scope.where(user, eq(user.id, id)))
    .limit(1);

  if (!found) {
    throw new UserNotFoundError();
  }

  return found;
}

export async function list(
  scope: TenantScope,
  query: UserQuery,
): Promise<User[]> {
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
    .select(userColumns)
    .from(user)
    .where(scope.where(user, ...conditions));
}

export async function create(
  scope: TenantScope,
  data: CreateUser,
): Promise<User> {
  if (await existsByEmail(data.email)) {
    throw new EmailAlreadyInUseError();
  }

  const password = await Bun.password.hash(data.password, {
    algorithm: "bcrypt",
    cost: 12,
  });

  const [created] = await db
    .insert(user)
    .values(
      scope.values({
        name: data.name,
        email: data.email,
        password,
      }),
    )
    .returning(userColumns);
  return created;
}

export async function update(
  scope: TenantScope,
  id: string,
  data: UpdateUser,
): Promise<User> {
  const found = await getById(scope, id);

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
    .where(scope.where(user, eq(user.id, id)))
    .returning(userColumns);
  return updated;
}

export async function remove(scope: TenantScope, id: string): Promise<User> {
  const found = await getById(scope, id);

  if (found.isActive) {
    throw new CannotDeleteActiveUserError();
  }

  const [deleted] = await db
    .delete(user)
    .where(scope.where(user, eq(user.id, id)))
    .returning(userColumns);
  return deleted;
}

export async function toggleActive(
  scope: TenantScope,
  id: string,
): Promise<User> {
  const found = await getById(scope, id);
  const isActive = !found.isActive;

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(user)
      .set({ isActive })
      .where(scope.where(user, eq(user.id, id)))
      .returning(userColumns);

    if (!isActive) {
      await revokeUserSessions(id, tx);
    }

    return updated;
  });
}
