import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns.helpers";
import {tenant} from "@/db/schema/tenant.sql";

export const requester = pgTable("requester", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactValue: text("contact_value").notNull(),
  contactType: text("contact_type").notNull(),
  companyName: text("company_name").notNull(),
  identifierValue: text("identifier_value").notNull(),
  identifierType: text("identifier_type").notNull(),
  tenantId: uuid("tenant_id")
    .references(() => tenant.id),
  observations: jsonb(),
  ...timestamps,
});