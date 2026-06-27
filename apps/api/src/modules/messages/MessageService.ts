import { asc, eq } from "drizzle-orm";
import message from "../../app/integrations/evolution/Message";
import db from "../../config/drizzle";
import { message as messageTable, conversation, type MediaType } from "../../config/schema";
import StorageService from "../../modules/storage/StorageService";
import HttpException from "../../app/exceptions/HttpException";
import ContactService from "../../modules/contacts/ContactService";
import ConversationService from "../../modules/conversations/ConversationService";
import ChannelService from "../../modules/channels/ChannelService";
import { messageQueue } from "./messageQueue";
import { broadcastToChannel, broadcastToWatchingConversation } from "../../websocket";
import { truncateWithoutCuttingWord } from "../../modules/conversations/ConversationHelper";

type Message = typeof messageTable.$inferSelect;
type NewMessage = typeof messageTable.$inferInsert;

type MediaMessage = {
  mediaType: MediaType;
  mediaUrl: string;
};

export default {
  async store({ channelId, ...data }: NewMessage & { channelId?: string }): Promise<Message> {
    if (data.conversationId && !data.status) {
      data.status = "RECEIVED";
    }

    if (!data.conversationId) {
      if (!channelId) {
        throw new HttpException("channelId é obrigatório para criar uma conversa", 400);
      }

      const [createdConversation] = await db
        .insert(conversation)
        .values({
          contactId: data.contactId,
          channelId,
          status: "PENDING",
          userId: data.userId,
        })
        .returning();

      data.conversationId = createdConversation.id;
      data.status = "SEND";
    }

    if (data.mediaType && data.mediaUrl) {
      const mediaMessage = this.processMidea(data.mediaType, data.mediaUrl);
      data = { ...data, ...mediaMessage };
    }

    const [created] = await db.insert(messageTable).values(data).returning();
    return created;
  },

  async index(conversationId: string): Promise<Message[]> {
    const messages = await db
      .select()
      .from(messageTable)
      .where(eq(messageTable.conversationId, conversationId))
      .orderBy(asc(messageTable.createdAt));

    return Promise.all(
      messages.map(async (message) => {
        if (message.mediaUrl) {
          try {
            message.mediaUrl = await StorageService.getSignedUrl(message.mediaUrl);
          } catch (error) {
            console.error(`Failed to get signed URL for ${message.mediaUrl}:`, error);
          }
        }
        return message;
      }),
    );
  },

  async show(filter: { id: string }): Promise<Message | null> {
    const [found] = await db.select().from(messageTable).where(eq(messageTable.id, filter.id)).limit(1);
    return found ?? null;
  },

  processMidea: function (mediaType: string, mediaUrl: string): MediaMessage {
    let mediaMessage: MediaMessage;
    switch (mediaType) {
      case "IMAGE":
        mediaMessage = { mediaType: "IMAGE", mediaUrl };
        break;
      case "AUDIO":
        mediaMessage = { mediaType: "AUDIO", mediaUrl };
        break;
      case "VIDEO":
        mediaMessage = { mediaType: "VIDEO", mediaUrl };
        break;
      case "DOCUMENT":
        mediaMessage = { mediaType: "DOCUMENT", mediaUrl };
        break;
      default:
        throw new HttpException(`Tipo de mídia não suportado: ${mediaType}`, 415);
    }
    return mediaMessage;
  },

  //todo tipagem
  async sendMessage(data: any): Promise<any> {
    const contact = await ContactService.show({ id: data.contactId });

    if (!contact || !contact?.channelId || !contact?.phone) {
      throw new HttpException("Algo não foi encontrado", 404);
    }

    const channel = await ChannelService.show({ id: contact.channelId });

    if (!channel) {
      throw new HttpException("Canal não foi encontrado", 404);
    }

    let conversationRecord;
    if (!data.conversationId) {
      const [createdConversation] = await db
        .insert(conversation)
        .values({
          contactId: data.contactId,
          channelId: channel.id,
          status: "PENDING",
          userId: data.userId,
        })
        .returning();
      conversationRecord = createdConversation;
    } else {
      conversationRecord = await ConversationService.show({ id: data.conversationId });
    }

    if (!conversationRecord) {
      throw new HttpException("Conversa não encontrada", 404);
    }

    if (conversationRecord.status === "CLOSED") {
      throw new HttpException("Conversa fechada", 400);
    }

    try {
      const messageToStore: NewMessage = {
        id: "",
        conversationId: conversationRecord.id,
        contactId: contact.id,
        content: data.content,
        type: "USER",
        status: "SEND",
        sentAt: new Date(),
      };

      let response;
      if (data.mediaType) {
        response = await message.sendMedia(channel.name, {
          media: data.mediaUrl,
          type: data.mediaType,
          mediaType: data.mediaType,
          number: contact.phone,
        });

        messageToStore.mediaUrl = data.mediaUrl;
        messageToStore.mediaType = data.mediaType;
      } else if (data.content) {
        response = await message.sendText(channel.name, {
          text: data.content,
          number: contact.phone,
        });
      } else {
        response = await message.sendAudio(channel.name, {
          audio: data.mediaUrl,
          number: contact.phone,
        });

        messageToStore.mediaUrl = data.mediaUrl;
        messageToStore.mediaType = "AUDIO";
      }

      if (!response?.key?.id) {
        throw new HttpException("Resposta inesperada da API Evolution", 500);
      }

      messageToStore.id = response.key.id;

      const storedMessage = await this.store(messageToStore);

      await broadcastToWatchingConversation(conversationRecord.id, {
        type: "newMessage",
        message: storedMessage,
        from: "user",
      });

      await broadcastToChannel(channel.id, {
        type: "conversationUpdated",
        conversationId: conversationRecord.id,
        lastMessage: truncateWithoutCuttingWord(storedMessage.content),
        updatedAt: new Date().toISOString(),
        hasNewMessage: false,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException("Falha ao enviar mensagem", 500);
    }
  },

  async addMessageToQueue(agentId: string, payload: any) {
    try {
      if (!agentId || !payload) {
        console.error("Missing agentId or payload");
        new HttpException("Missing agentId or payload", 404);
      }

      await messageQueue.add(
        "process-message",
        { agentId, payload },
        {
          backoff: 5000,
          removeOnComplete: true,
        },
      );
      console.log(`📩 Mensagem enfileirada para agent ${agentId}`);
    } catch (error) {
      console.error("❌ Erro ao adicionar job:", error);
      new HttpException(`Erro ao adicionar job: ${error}`, 500);
    }
  },
};
