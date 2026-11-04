import { and, eq, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

type TenantTable = { tenantId: PgColumn };

export function tenantScope(tenantId: string) {
  return {
    tenantId,

    where(table: TenantTable, ...conditions: (SQL | undefined)[]): SQL {
      return and(eq(table.tenantId, tenantId), ...conditions)!;
    },

    // `tenantId` vem depois do spread para que o input nunca o sobrescreva.
    values<T extends object>(data: T): T & { tenantId: string } {
      return { ...data, tenantId };
    },
  };
}

export type TenantScope = ReturnType<typeof tenantScope>;
