import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { user } from "./user.sql";

export const session = pgTable(
  "sessions",
  {
    id: uuid().primaryKey().defaultRandom(),
    token: text().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("session_token_key").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops"),
    ),
  ],
);
