import { and, eq, ilike, type SQL } from "drizzle-orm";
import db from "../../config/drizzle";
import { user } from "../../config/schema";
import { UserStatus } from "./UserStatusEnum";
import { isValidUserStatus } from "./UserHelper";
import HttpException from "../../app/exceptions/HttpException";

type User = typeof user.$inferSelect;
type NewUser = typeof user.$inferInsert;

type UserQuery = {
  name?: string;
  email?: string;
  status?: string;
  isActive?: string;
  page?: string;
  pageSize?: string;
};

async function findById(id: string): Promise<User | undefined> {
  const [found] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return found;
}

export default {
  async index(queryParams: UserQuery): Promise<User[]> {
    const conditions: SQL[] = [];

    if (queryParams.name) {
      conditions.push(ilike(user.name, `%${queryParams.name}%`));
    }
    if (queryParams.email) {
      conditions.push(ilike(user.email, `%${queryParams.email}%`));
    }
    if (queryParams.status) {
      conditions.push(eq(user.status, queryParams.status));
    }
    if (queryParams.isActive !== undefined) {
      conditions.push(eq(user.isActive, queryParams.isActive === "true"));
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return db
      .select()
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  },

  async show(filter: { id?: string; email?: string }): Promise<User | null> {
    const condition = filter.id ? eq(user.id, filter.id) : filter.email ? eq(user.email, filter.email) : undefined;
    if (!condition) {
      return null;
    }

    const [found] = await db.select().from(user).where(condition).limit(1);
    return found ?? null;
  },

  async store(data: NewUser): Promise<User> {
    const password = await Bun.password.hash(data.password, { algorithm: "bcrypt", cost: 12 });
    const [created] = await db
      .insert(user)
      .values({ ...data, password })
      .returning();
    return created;
  },

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [updated] = await db.update(user).set(data).where(eq(user.id, id)).returning();
    return updated;
  },

  async destroy(id: string): Promise<User> {
    const found = await findById(id);
    if (!found) {
      throw new HttpException("Usuário não encontrado", 404);
    }

    if (found.isActive) {
      throw new HttpException("Usuário ativo, desative antes de excluir", 400);
    }

    const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
    return deleted;
  },

  async changeStatus(id: string, status: string): Promise<User | null> {
    const found = await findById(id);
    if (!found) {
      throw new HttpException("Usuário não encontrado", 404);
    }

    const newStatus = isValidUserStatus(status) ? status : UserStatus.OFFLINE;

    const [updated] = await db.update(user).set({ status: newStatus }).where(eq(user.id, id)).returning();
    return updated;
  },

  async enableOrDisable(id: string): Promise<User | null> {
    const found = await findById(id);
    if (!found) {
      throw new HttpException("Usuário não encontrado", 404);
    }

    const newIsActive = !found.isActive;
    const newStatus = newIsActive ? found.status : UserStatus.OFFLINE;

    const [updated] = await db
      .update(user)
      .set({ isActive: newIsActive, status: newStatus })
      .where(eq(user.id, id))
      .returning();
    return updated;
  },
};
