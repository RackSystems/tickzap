import { pgTable, text, timestamp, boolean, uniqueIndex, foreignKey, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { channel } from "./channel.sql";

export const contact = pgTable(
  "contacts",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text(),
    phone: text(),
    avatar: text(),
    birthDate: timestamp("birth_date", { mode: "date" }),
    document: text(),
    status: boolean().default(false).notNull(),
    remoteJid: text("remote_jid"),
    channelId: uuid("channel_id"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("contacts_document_key").using("btree", table.document.asc().nullsLast().op("text_ops")),
    uniqueIndex("contacts_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    uniqueIndex("contacts_phone_key").using("btree", table.phone.asc().nullsLast().op("text_ops")),
    uniqueIndex("contacts_remote_jid_key").using("btree", table.remoteJid.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.channelId],
      foreignColumns: [channel.id],
      name: "contacts_channel_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);
