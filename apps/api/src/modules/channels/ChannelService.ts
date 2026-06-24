import { and, eq, ilike, type SQL } from "drizzle-orm";
import Instance from "../../app/integrations/evolution/Instance";
import db from "../../config/drizzle";
import { channel } from "../../config/schema";

type Channel = typeof channel.$inferSelect;
type NewChannel = typeof channel.$inferInsert;

type IndexQueryParams = {
  type?: string;
  status?: string;
  isAuthenticated?: string;
  page?: string;
  pageSize?: string;
};

export default {
  async store(data: NewChannel): Promise<Channel> {
    const payload = {
      instanceName: data.name,
      integration: "WHATSAPP-BAILEYS",
    };

    /* eslint-disable */
    const response: any = await Instance.create(payload);

    if (!response || !response.instance) {
      throw new Error("Failed to create channel in Evolution");
    }

    await this.setWebhook(response.instance.instanceName);

    const [created] = await db
      .insert(channel)
      .values({
        ...data,
        status: response.instance.status,
        identifier: response.instance.instanceId,
        name: response.instance.instanceName,
      })
      .returning();

    return created;
  },

  async destroy(id: string): Promise<Channel> {
    const found = await this.show({ id });

    if (!found) {
      throw new Error("Channel not found");
    }

    if (found.status === "open") {
      await Instance.logout(found.name);
    }

    await Instance.destroy(found.name);

    const [deleted] = await db.delete(channel).where(eq(channel.id, id)).returning();
    return deleted;
  },

  async index(queryParams: IndexQueryParams): Promise<Channel[]> {
    const conditions: SQL[] = [];

    if (queryParams.type) {
      conditions.push(ilike(channel.name, `%${queryParams.type}%`));
    }

    if (queryParams.status) {
      conditions.push(ilike(channel.status, `%${queryParams.status}%`));
    }

    return db
      .select()
      .from(channel)
      .where(conditions.length ? and(...conditions) : undefined);
  },

  async show(filter: { id?: string; identifier?: string }): Promise<Channel | null> {
    const condition = filter.id
      ? eq(channel.id, filter.id)
      : filter.identifier
        ? eq(channel.identifier, filter.identifier)
        : undefined;
    if (!condition) {
      return null;
    }

    const [found] = await db.select().from(channel).where(condition).limit(1);
    return found ?? null;
  },

  async update(id: string, data: Partial<NewChannel>): Promise<Channel> {
    const [updated] = await db.update(channel).set(data).where(eq(channel.id, id)).returning();
    return updated;
  },

  async connect(instanceId: string): Promise<any> {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.connect(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to retrieve QR code from Evolution");
    }

    return evolutionResponse;
  },

  async getStatus(instanceId: string): Promise<any> {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.getStatus(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to retrieve Status from Evolution");
    }

    return evolutionResponse;
  },

  async setWebhook(instanceName: string): Promise<any> {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error("WEBHOOK_URL environment variable is not configured");
    }

    const data = {
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        base64: true,
        events: [
          "APPLICATION_STARTUP",
          "QRCODE_UPDATED",
          "MESSAGES_SET",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "MESSAGES_DELETE",
          "SEND_MESSAGE",
          "CONTACTS_SET",
          "CONTACTS_UPSERT",
          "CONTACTS_UPDATE",
          "PRESENCE_UPDATE",
          "CHATS_SET",
          "CHATS_UPSERT",
          "CHATS_UPDATE",
          "CHATS_DELETE",
          "GROUPS_UPSERT",
          "GROUP_UPDATE",
          "GROUP_PARTICIPANTS_UPDATE",
          "CONNECTION_UPDATE",
          "LABELS_EDIT",
          "LABELS_ASSOCIATION",
          "CALL",
          "TYPEBOT_START",
          "TYPEBOT_CHANGE_STATUS",
        ],
      },
    };

    return await Instance.setWebhook(instanceName, data);
  },

  async logout(instanceId: string) {
    const channel = await this.show({ id: instanceId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    const evolutionResponse = await Instance.logout(channel.name);

    if (!evolutionResponse) {
      throw new Error("Failed to logout from Evolution");
    }

    return evolutionResponse;
  },
};
