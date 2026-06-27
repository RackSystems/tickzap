import { pgTable, text, boolean, foreignKey, uuid, json } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { contact } from "./contact.sql";
import { user } from "./user.sql";

export const ticket = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    requester: json("requester").notNull(),
    userId: uuid("user_id"),
    description: text("description"),
    subject: text("subject"),
    status: text("status"),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "tickets_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);
