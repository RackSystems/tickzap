import {pgTable, text, uniqueIndex, uuid} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";

export const tenant = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  documentType: text('document_type').notNull(),
  documentNumber: text('document_number').notNull(),
  ...timestamps,
},
  (table) => [
  uniqueIndex('tenant_identifier_key').on(
    table.name,
    table.documentNumber
  )
  ],
);
