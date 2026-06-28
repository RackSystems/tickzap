import { and, eq, ilike, type SQL } from "drizzle-orm";
import db from "@/config/drizzle";
import { contact } from "@/config/schema";

type Contact = typeof contact.$inferSelect;
type NewContact = typeof contact.$inferInsert;

type ContactQuery = {
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  page?: string;
  pageSize?: string;
};

type ContactFilter = {
  id?: string;
  phone?: string;
  email?: string;
  remoteJid?: string;
  channelId?: string;
};

export default {
  async store(data: NewContact): Promise<Contact> {
    const [created] = await db
      .insert(contact)
      .values({ ...data, status: true })
      .returning();
    return created;
  },

  async destroy(id: string): Promise<Contact> {
    const [deleted] = await db.delete(contact).where(eq(contact.id, id)).returning();
    return deleted;
  },

  async index(query: ContactQuery): Promise<Contact[]> {
    const conditions: SQL[] = [];

    if (query.name) {
      conditions.push(ilike(contact.name, `%${query.name}%`));
    }
    if (query.phone) {
      conditions.push(ilike(contact.phone, `%${query.phone}%`));
    }
    if (query.email) {
      conditions.push(ilike(contact.email, `%${query.email}%`));
    }
    if (query.status !== undefined) {
      conditions.push(eq(contact.status, query.status === "true"));
    }

    return db
      .select()
      .from(contact)
      .where(conditions.length ? and(...conditions) : undefined);
  },

  async show(filter: ContactFilter): Promise<Contact | null> {
    const conditions: SQL[] = [];

    if (filter.id) conditions.push(eq(contact.id, filter.id));
    if (filter.phone) conditions.push(eq(contact.phone, filter.phone));
    if (filter.email) conditions.push(eq(contact.email, filter.email));
    if (filter.remoteJid) conditions.push(eq(contact.remoteJid, filter.remoteJid));
    if (filter.channelId) conditions.push(eq(contact.channelId, filter.channelId));

    if (!conditions.length) {
      return null;
    }

    const [found] = await db
      .select()
      .from(contact)
      .where(and(...conditions))
      .limit(1);
    return found ?? null;
  },

  async update(id: string, data: Partial<NewContact>): Promise<Contact> {
    const [updated] = await db.update(contact).set(data).where(eq(contact.id, id)).returning();
    return updated;
  },
};
