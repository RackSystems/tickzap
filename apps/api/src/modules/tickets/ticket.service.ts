import { db } from "@/db/drizzle";
import { ticket } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import type { CreateTicket, TicketQuery } from "./ticket.schema";
import * as RequesterService from "@/modules/requesters/requester.service";
import { RequesterNotFoundError } from "@/modules/requesters/requester.errors";
import type { TenantScope } from "@/modules/tenant/tenant-scope";

export async function getByID(scope: TenantScope, id: string) {
  const [found] = await db
    .select()
    .from(ticket)
    .where(scope.where(ticket, eq(ticket.id, id)))
    .limit(1);
  return found;
}

export async function create(scope: TenantScope, data: CreateTicket) {
  // O requesterId vem do cliente: precisa pertencer ao mesmo tenant.
  const requester = await RequesterService.getById(scope, data.requesterId);

  if (!requester) {
    throw new RequesterNotFoundError();
  }

  const [created] = await db
    .insert(ticket)
    .values(
      scope.values({
        title: data.title,
        description: data.description,
        status: data.status,
        tags: data.tags,
        requesterId: data.requesterId,
      }),
    )
    .returning();
  return created;
}

export async function list(scope: TenantScope, query: TicketQuery) {
  return db
    .select()
    .from(ticket)
    .where(
      scope.where(
        ticket,
        query.requesterId
          ? eq(ticket.requesterId, query.requesterId)
          : undefined,
        query.title ? ilike(ticket.title, `%${query.title}%`) : undefined,
        query.status ? ilike(ticket.status, `%${query.status}%`) : undefined,
        query.tags ? ilike(ticket.tags, `%${query.tags}%`) : undefined,
        query.description
          ? ilike(ticket.description, `%${query.description}%`)
          : undefined,
      ),
    );
}
