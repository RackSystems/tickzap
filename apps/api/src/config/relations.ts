import { relations } from "drizzle-orm";
import { channel, contact, ticket, message, user } from "./schema";

export const channelRelations = relations(channel, ({ many }) => ({
  contacts: many(contact),
  tickets: many(ticket),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  channel: one(channel, {
    fields: [contact.channelId],
    references: [channel.id],
  }),
  messages: many(message),
  tickets: many(ticket),
}));

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
  tickets: many(ticket),
}));

export const ticketRelations = relations(ticket, ({ one, many }) => ({
  contact: one(contact, {
    fields: [ticket.contactId],
    references: [contact.id],
  }),
  channel: one(channel, {
    fields: [ticket.channelId],
    references: [channel.id],
  }),
  user: one(user, {
    fields: [ticket.userId],
    references: [user.id],
  }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  ticket: one(ticket, {
    fields: [message.ticketId],
    references: [ticket.id],
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
