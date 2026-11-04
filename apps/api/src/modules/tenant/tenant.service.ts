import {db} from '@/db/drizzle';
import {tenant} from "@/db/schema";
import type {CreateTenant, TenantQuery, UpdateTenant, TenantIdParam} from './tenant.schema'
import {and, eq} from "drizzle-orm";
import {revokeTenantSessions} from "@/modules/auth/auth.service";

export async function getById(id: string) {
  const [found] = await db
    .select()
    .from(tenant)
    .where(eq(tenant.id, id));
  return found;
}

export async function create(data: CreateTenant) {
  const [created] = await db
    .insert(tenant)
    .values({
      name: data.name,
      documentNumber: data.documentNumber,
      documentType: data.documentType,
    })
    .returning();
  return created;
}

// Desativar um tenant derruba as sessões de todos os usuários dele na mesma
// transação. Reativar não restaura sessões: os usuários precisam logar de novo.
export async function setActive(id: string, isActive: boolean) {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tenant)
      .set({ isActive })
      .where(eq(tenant.id, id))
      .returning();

    if (updated && !isActive) {
      await revokeTenantSessions(id, tx);
    }

    return updated;
  });
}

export async function list(query: TenantQuery) {
  return db
    .select()
    .from(tenant)
    .where(
      and(
        query.name ? eq(tenant.name, query.name) : undefined,
        query.documentNumber ? eq(tenant.documentNumber, query.documentNumber) : undefined,
        query.documentType ? eq(tenant.documentType, query.documentType) : undefined,
      )
    )
}