import { db } from "@/db/drizzle";
import { requester } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import type {
  CreateRequester,
  RequesterQuery,
} from "@/modules/requesters/requester.schema";
import type { TenantScope } from "@/modules/tenant/tenant-scope";

export async function getById(scope: TenantScope, id: string) {
  const [found] = await db
    .select()
    .from(requester)
    .where(scope.where(requester, eq(requester.id, id)))
    .limit(1);
  return found;
}

export async function create(scope: TenantScope, data: CreateRequester) {
  const [created] = await db
    .insert(requester)
    .values(
      scope.values({
        name: data.name,
        contactValue: data.contactValue,
        contactType: data.contactType,
        companyName: data.companyName,
        identifierValue: data.identifierValue,
        identifierType: data.identifierType,
        observations: data.observations,
      }),
    )
    .returning();
  return created;
}

export async function list(scope: TenantScope, query: RequesterQuery) {
  return db
    .select()
    .from(requester)
    .where(
      scope.where(
        requester,
        query.name ? ilike(requester.name, `%${query.name}%`) : undefined,
        query.contactValue
          ? ilike(requester.contactValue, `%${query.contactValue}%`)
          : undefined,
        query.companyName
          ? ilike(requester.companyName, `%${query.companyName}%`)
          : undefined,
        query.identifierValue
          ? ilike(requester.identifierValue, `%${query.identifierValue}%`)
          : undefined,
      ),
    );
}
