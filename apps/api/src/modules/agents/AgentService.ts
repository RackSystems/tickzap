import { and, eq, ilike, type SQL } from "drizzle-orm";
import db from "../../config/drizzle";
import { agent } from "../../config/schema";
import HttpException from "../../app/exceptions/HttpException";
import AgnoAgent from "../../app/integrations/agno/Agent";

type Agent = typeof agent.$inferSelect;
type NewAgent = typeof agent.$inferInsert;

type AgentQuery = {
  name?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async index(queryParams: AgentQuery = {}): Promise<Agent[]> {
    const conditions: SQL[] = [];

    if (queryParams.name) {
      conditions.push(ilike(agent.name, `%${queryParams.name}%`));
    }

    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const pageSize = queryParams.pageSize ? parseInt(queryParams.pageSize) : 10;

    return db
      .select()
      .from(agent)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  },

  async show(filter: { id: string }): Promise<Agent> {
    const [found] = await db.select().from(agent).where(eq(agent.id, filter.id)).limit(1);

    if (!found) {
      throw new HttpException("Agent not found", 404);
    }

    return found;
  },

  async store(data: NewAgent): Promise<Agent> {
    const [created] = await db.insert(agent).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<NewAgent>): Promise<Agent> {
    await this.show({ id }); // a checagem de existencia do agente eh feita aqui
    const [updated] = await db.update(agent).set(data).where(eq(agent.id, id)).returning();
    return updated;
  },

  async destroy(id: string): Promise<Agent> {
    await this.show({ id }); // a checagem de existencia do agente eh feita aqui
    const [deleted] = await db.delete(agent).where(eq(agent.id, id)).returning();
    return deleted;
  },

  async use(id: string, payload: { message: string; session_id: string; user_id: string }) {
    await this.show({ id });
    return AgnoAgent.useAgent(id, payload);
  },
};
