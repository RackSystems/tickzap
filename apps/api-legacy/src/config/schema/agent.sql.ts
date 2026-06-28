import { uuid, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";

export const agent = pgTable("agents", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  communicationStyle: text("communication_style").notNull(),
  behavior: text(),
  purpose: text(),
  companySupport: text("company_support"),
  companyDescription: text("company_description"),
  aiProvider: text("ai_provider"),
  aiModel: text("ai_model"),
  ...timestamps,
});
