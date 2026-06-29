import { pgTable, text, boolean, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";

export const user = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    password: text().notNull(),
    email: text().notNull(),
    avatar: text(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("user_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
  ],
);
