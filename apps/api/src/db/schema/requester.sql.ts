import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns.helpers";

export const requester = pgTable("requester", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactValue: text("contact_value").notNull(),
  contactType: text("contact_type").notNull(),
  companyName: text("company_name").notNull(),
  identifierValue: text("identifier_value").notNull(),
  identifierType: text("identifier_type").notNull(),
  observations: jsonb(),
  ...timestamps,
});