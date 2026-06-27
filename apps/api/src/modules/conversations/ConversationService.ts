import { and, eq, type SQL } from "drizzle-orm";
import db from "../../config/drizzle";
import { conversation } from "../../config/schema";
import HttpException from "../../app/exceptions/HttpException";

type Conversation = typeof conversation.$inferSelect;
type NewConversation = typeof conversation.$inferInsert;

type ConversationQuery = {
  contactId?: string;
  channelId?: string;
  status?: string;
  userId?: string;
  page?: string;
  pageSize?: string;
};

type ConversationFilter = {
  id?: string;
  contactId?: string;
  channelId?: string;
};

export default {
  async store(data: NewConversation): Promise<Conversation> {
    const [created] = await db
      .insert(conversation)
      .values({ ...data, status: data.status ?? "PENDING" })
      .returning();
    return created;
  },

  async destroy(id: string): Promise<Conversation> {
    const [deleted] = await db.delete(conversation).where(eq(conversation.id, id)).returning();
    return deleted;
  },

  //todo fix tipagem
  async index(query: ConversationQuery): Promise<any[]> {
    const conditions: SQL[] = [];

    if (query.contactId) conditions.push(eq(conversation.contactId, query.contactId));
    if (query.channelId) conditions.push(eq(conversation.channelId, query.channelId));
    if (query.status) conditions.push(eq(conversation.status, query.status));
    if (query.userId) conditions.push(eq(conversation.userId, query.userId));

    const conversations = await db.query.conversation.findMany({
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

    return conversations.map(({ messages, ...rest }) => ({ ...rest, lastMessage: messages[0] ?? null }));
  },

  async show(filter: ConversationFilter): Promise<Conversation | null> {
    const conditions: SQL[] = [];

    if (filter.id) conditions.push(eq(conversation.id, filter.id));
    if (filter.contactId) conditions.push(eq(conversation.contactId, filter.contactId));
    if (filter.channelId) conditions.push(eq(conversation.channelId, filter.channelId));

    if (!conditions.length) {
      return null;
    }

    const found = await db.query.conversation.findFirst({
      where: and(...conditions),
      with: {
        contact: true,
        channel: true,
        user: true,
      },
    });

    return found ?? null;
  },

  async update(id: string, data: Partial<NewConversation>): Promise<Conversation | null> {
    await db.update(conversation).set(data).where(eq(conversation.id, id));
    return this.show({ id });
  },

  async toggleAI(id: string): Promise<Conversation> {
    const found = await this.show({ id });
    if (!found) {
      throw new HttpException("Atendimento não encontrado", 404);
    }

    const [updated] = await db
      .update(conversation)
      .set({ useAi: !found.useAi })
      .where(eq(conversation.id, id))
      .returning();
    return updated;
  },
};
