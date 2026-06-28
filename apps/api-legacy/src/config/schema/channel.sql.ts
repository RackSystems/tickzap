import { boolean, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export const channel = pgTable(
  "channels",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    type: text().notNull(),
    identifier: text().notNull(),
    status: text().default("disconnected").notNull(),
    isAuthenticated: boolean("is_authenticated").default(false).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("channels_identifier_key").using("btree", table.identifier.asc().nullsLast().op("text_ops"))],
);
