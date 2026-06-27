import { relations } from "drizzle-orm";
import { channel, contact, conversation, message, user } from "./schema";

export const channelRelations = relations(channel, ({ many }) => ({
  contacts: many(contact),
  conversations: many(conversation),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  channel: one(channel, {
    fields: [contact.channelId],
    references: [channel.id],
  }),
  messages: many(message),
  conversations: many(conversation),
}));

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
  conversations: many(conversation),
}));

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  contact: one(contact, {
    fields: [conversation.contactId],
    references: [contact.id],
  }),
  channel: one(channel, {
    fields: [conversation.channelId],
    references: [channel.id],
  }),
  user: one(user, {
    fields: [conversation.userId],
    references: [user.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [message.userId],
    references: [user.id],
  }),
  contact: one(contact, {
    fields: [message.contactId],
    references: [contact.id],
  }),
}));
