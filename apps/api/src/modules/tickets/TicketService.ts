import { and, eq, type SQL } from "drizzle-orm";
import db from "../../config/drizzle";
import { ticket, type TicketStatus } from "../../config/schema";
import HttpException from "../../app/exceptions/HttpException";

type Ticket = typeof ticket.$inferSelect;
type NewTicket = typeof ticket.$inferInsert;

type TicketQuery = {
  contactId?: string;
  channelId?: string;
  status?: string;
  UserId?: string;
  page?: string;
  pageSize?: string;
};

type TicketFilter = {
  id?: string;
  contactId?: string;
  channelId?: string;
};

export default {
  async store(data: NewTicket): Promise<Ticket> {
    const [created] = await db
      .insert(ticket)
      .values({ ...data, status: data.status ?? "PENDING" })
      .returning();
    return created;
  },

  async destroy(id: string): Promise<Ticket> {
    const [deleted] = await db.delete(ticket).where(eq(ticket.id, id)).returning();
    return deleted;
  },

  //todo fix tipagem
  async index(query: TicketQuery): Promise<any[]> {
    const conditions: SQL[] = [];

    if (query.contactId) conditions.push(eq(ticket.contactId, query.contactId));
    if (query.channelId) conditions.push(eq(ticket.channelId, query.channelId));
    if (query.status) conditions.push(eq(ticket.status, query.status as TicketStatus));
    if (query.UserId) conditions.push(eq(ticket.userId, query.UserId));

    const tickets = await db.query.ticket.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: {
        contact: true,
        channel: true,
        user: true,
        messages: {
          orderBy: (messages, { desc }) => desc(messages.createdAt),
          limit: 1,
          columns: { content: true, createdAt: true, mediaType: true },
        },
      },
    });

    return tickets.map(({ messages, ...rest }) => ({ ...rest, lastMessage: messages[0] ?? null }));
  },

  async show(filter: TicketFilter): Promise<Ticket | null> {
    const conditions: SQL[] = [];

    if (filter.id) conditions.push(eq(ticket.id, filter.id));
    if (filter.contactId) conditions.push(eq(ticket.contactId, filter.contactId));
    if (filter.channelId) conditions.push(eq(ticket.channelId, filter.channelId));

    if (!conditions.length) {
      return null;
    }

    const found = await db.query.ticket.findFirst({
      where: and(...conditions),
      with: {
        contact: true,
        channel: true,
        user: true,
      },
    });

    return found ?? null;
  },

  async update(id: string, data: Partial<NewTicket>): Promise<Ticket | null> {
    await db.update(ticket).set(data).where(eq(ticket.id, id));
    return this.show({ id });
  },

  async toggleAI(id: string): Promise<Ticket> {
    const found = await this.show({ id });
    if (!found) {
      throw new HttpException("Ticket não encontrado", 404);
    }

    const [updated] = await db
      .update(ticket)
      .set({ useAi: !found.useAi })
      .where(eq(ticket.id, id))
      .returning();
    return updated;
  },
};
