import { pgTable, text, timestamp, foreignKey, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { mediaTypes, messageStatuses, messageTypes } from "./enums";
import { ticket } from "./ticket.sql";
import { contact } from "./contact.sql";
import { user } from "./user.sql";

export const message = pgTable(
  "messages",
  {
    id: text().primaryKey().notNull(),
    ticketId: uuid("ticket_id").notNull(),
    userId: uuid("user_id"),
    contactId: uuid("contact_id").notNull(),
    content: text().notNull(),
    mediaUrl: text("media_url"),
    mediaType: text("media_type", { enum: mediaTypes }),
    type: text({ enum: messageTypes }).notNull(),
    status: text({ enum: messageStatuses }).default("SEND").notNull(),
    sentAt: timestamp("sent_at"),
    receivedAt: timestamp("received_at"),
    readAt: timestamp("read_at"),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.ticketId],
      foreignColumns: [ticket.id],
      name: "messages_ticket_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "messages_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "messages_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);
