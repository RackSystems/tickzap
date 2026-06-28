import { pgTable, text, boolean, foreignKey, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { ticketStatuses } from "./enums";
import { channel } from "./channel.sql";
import { contact } from "./contact.sql";
import { user } from "./user.sql";

export const ticket = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    contactId: uuid("contact_id").notNull(),
    channelId: uuid("channel_id").notNull(),
    status: text({ enum: ticketStatuses }).notNull(),
    userId: uuid("user_id"),
    useAi: boolean("use_ai").default(true),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.contactId],
      foreignColumns: [contact.id],
      name: "tickets_contact_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.channelId],
      foreignColumns: [channel.id],
      name: "tickets_channel_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "tickets_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);
