import { asc, eq } from "drizzle-orm";
import message from "../../app/integrations/evolution/Message";
import db from "../../config/drizzle";
import { message as messageTable, ticket, type MediaType } from "../../config/schema";
import StorageService from "../../modules/storage/StorageService";
import HttpException from "../../app/exceptions/HttpException";
import ContactService from "../../modules/contacts/ContactService";
import TicketService from "../../modules/tickets/TicketService";
import ChannelService from "../../modules/channels/ChannelService";
import { messageQueue } from "./messageQueue";
import { broadcastToChannel, broadcastToWatchingTicket } from "../../websocket";
import { truncateWithoutCuttingWord } from "../../modules/tickets/TicketHelper";

type Message = typeof messageTable.$inferSelect;
type NewMessage = typeof messageTable.$inferInsert;

type MediaMessage = {
  mediaType: MediaType;
  mediaUrl: string;
};

/**
 * ao receber a mensagem (vem pelo webhook e ele cria o ticket) tem o ticketId, vai salvar no banco,
 * ao enviar a mensagem, vamos criar o ticket aqui e salvar no banco,
 *
 **/
export default {
  async store({ channelId, ...data }: NewMessage & { channelId?: string }): Promise<Message> {
    if (data.ticketId && !data.status) {
      data.status = "RECEIVED";
    }

    if (!data.ticketId) {
      if (!channelId) {
        throw new HttpException("channelId é obrigatório para criar um ticket", 400);
      }

      const [createdTicket] = await db
        .insert(ticket)
        .values({
          contactId: data.contactId,
          channelId,
          status: "PENDING",
          userId: data.userId,
        })
        .returning();

      data.ticketId = createdTicket.id;
      data.status = "SEND";
    }

    if (data.mediaType && data.mediaUrl) {
      //save path - object key on mediaUrl
      const mediaMessage = this.processMidea(data.mediaType, data.mediaUrl);
      data = { ...data, ...mediaMessage };
    }

    const [created] = await db.insert(messageTable).values(data).returning();
    return created;
  },

  async index(ticketId: string): Promise<Message[]> {
    const messages = await db
      .select()
      .from(messageTable)
      .where(eq(messageTable.ticketId, ticketId))
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
        mediaMessage = {
          mediaType: "IMAGE",
          mediaUrl: mediaUrl,
        };
        break;
      case "AUDIO":
        mediaMessage = {
          mediaType: "AUDIO",
          mediaUrl: mediaUrl,
        };
        break;

      case "VIDEO":
        mediaMessage = {
          mediaType: "VIDEO",
          mediaUrl: mediaUrl,
        };
        break;

      case "DOCUMENT":
        mediaMessage = {
          mediaType: "DOCUMENT",
          mediaUrl: mediaUrl,
        };
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

    //criar ticket ao enviar a primeira mensagem - iniciar conversa
    let ticketRecord;
    if (!data.ticketId) {
      const [createdTicket] = await db
        .insert(ticket)
        .values({
          contactId: data.contactId,
          channelId: channel.id,
          status: "PENDING",
          userId: data.userId,
        })
        .returning();
      ticketRecord = createdTicket;
    } else {
      ticketRecord = await TicketService.show({ id: data.ticketId });
    }

    if (!ticketRecord) {
      throw new HttpException("Esse ticket não foi encontrado", 404);
    }

    if (ticketRecord.status === "CLOSED") {
      throw new HttpException("Ticket fechado", 400);
    }

    try {
      const messageToStore: NewMessage = {
        id: "",
        ticketId: ticketRecord.id,
        contactId: contact.id,
        content: data.content,
        type: "USER",
        status: "SEND",
        sentAt: new Date(), // pegar do response
      };

      let response;
      // todo media message
      if (data.mediaType) {
        response = await message.sendMedia(channel.name, {
          media: data.mediaUrl,
          type: data.mediaType,
          mediaType: data.mediaType,
          number: contact.phone,
        });

        messageToStore.mediaUrl = data.mediaUrl;
        messageToStore.mediaType = data.mediaType;
      }

      // text message
      else if (data.content) {
        response = await message.sendText(channel.name, {
          text: data.content,
          number: contact.phone,
        });
      }

      // audio message
      // front end grava o audio, envia para o minio, e o minio retorna o url do audio
      else {
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

      //notify frontend for new user answer
      await broadcastToWatchingTicket(ticketRecord.id, {
        type: "newMessage",
        message: storedMessage,
        from: "user",
      });

      await broadcastToChannel(channel.id, {
        type: "ticketUpdated",
        ticketId: ticketRecord.id,
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
