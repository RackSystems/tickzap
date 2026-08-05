import {db} from '@/db/drizzle';
import {tenant} from "@/db/schema";
import type {CreateTenant, TenantQuery, UpdateTenant, TenantIdParam} from './tenant.schema'
import {and, eq} from "drizzle-orm";

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