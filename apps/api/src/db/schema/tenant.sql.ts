import {boolean, index, pgTable, text, uniqueIndex, uuid} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";

export const tenant = pgTable("tenants", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  documentType: text('document_type').notNull(),
  documentNumber: text('document_number').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
},
  (table) => [
  uniqueIndex('tenant_identifier_key').on(
    table.name,
    table.documentNumber
  ),
  index('tenant_document_number_name_idx').on(
    table.documentNumber,
    table.name
  ),
  index('tenant_is_active_idx').on(table.isActive),
  ],
);
