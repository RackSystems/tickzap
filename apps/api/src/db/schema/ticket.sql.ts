import { pgTable, text, uuid, jsonb } from "drizzle-orm/pg-core";
import {timestamps} from "@/db/columns.helpers";
import { requester } from "./requester.sql";
import {tenant} from "@/db/schema/tenant.sql";

export const ticket = pgTable("ticket", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  tags: jsonb("tags"),
  requesterId: uuid("requester_id").notNull().references(() => requester.id),
  tenantId: uuid("tenant_id")
    .references(() => tenant.id),
  ...timestamps,
});