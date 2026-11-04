import {db} from '@/db/drizzle';
import {tenant} from "@/db/schema";
import type {CreateTenant, TenantQuery} from './tenant.schema'
import type {TenantScope} from './tenant-scope'
import {and, eq} from "drizzle-orm";
import {revokeTenantSessions} from "@/modules/auth/auth.service";

// A tabela `tenants` não tem `tenant_id`: o próprio `id` é a chave do escopo.
export async function getById(scope: TenantScope, id: string) {
  const [found] = await db
    .select()
    .from(tenant)
    .where(and(eq(tenant.id, scope.tenantId), eq(tenant.id, id)))
    .limit(1);
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

export async function list(scope: TenantScope, query: TenantQuery) {
  return db
    .select()
    .from(tenant)
    .where(
      and(
        eq(tenant.id, scope.tenantId),
        query.name ? eq(tenant.name, query.name) : undefined,
        query.documentNumber ? eq(tenant.documentNumber, query.documentNumber) : undefined,
        query.documentType ? eq(tenant.documentType, query.documentType) : undefined,
      )
    );
}
