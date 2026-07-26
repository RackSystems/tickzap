import {db} from "@/db/drizzle";
import {requester, ticket} from "@/db/schema";
import {and, eq, ilike} from "drizzle-orm";
import {CreateRequester, RequesterQuery} from "@/modules/requesters/requester.schema";

export async function create(data: CreateRequester) {
  const [created] = await db
    .insert(requester)
    .values({
      name: data.name,
      contactValue: data.contactValue,
      contactType: data.contactType,
      companyName: data.companyName,
      identifierValue: data.identifierValue,
      identifierType: data.identifierType,
      observations: data.observations
    })
    .returning();
  return created;
}

export async function list(query: RequesterQuery) {
  return db
    .select()
    .from(requester)
    .where(
      and(undefined,
        query.name ? ilike(requester.name, `%${query.name}%`) : undefined,
        query.contactValue ? ilike(requester.contactValue, `%${query.contactValue}%`) : undefined,
        query.companyName ? ilike(requester.companyName, `%${query.companyName}%`) : undefined,
        query.identifierValue ? ilike(requester.identifierValue, `%${query.identifierValue}%`) : undefined,
      ),
    );
}