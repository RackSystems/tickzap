import { db } from "@/db/drizzle";
import { ticket } from "@/db/schema";
import type {CreateTicket, UpdateTicket, ticketIdParamSchema, ticketQuerySchema, TicketQuery} from "./ticket.schema";
import {and, eq, ilike} from "drizzle-orm";

export async function getByID(id: string) {
  const [found] = await db
    .select()
    .from(ticket)
    .where(eq(ticket.id, id));
  return found;
}

export async function create(data: CreateTicket) {
  const [created] = await db
    .insert(ticket)
    .values({
      title: data.title,
      description: data.description,
      status: data.status,
      tags: data.tags,
      requesterId: data.requesterId
    })
    .returning();
  return created;
}

export async function list(query: TicketQuery) {
  return db
    .select()
    .from(ticket)
    .where(
      and(
        query.requesterId ? eq(ticket.requesterId, query.requesterId) : undefined,
        query.title ? ilike(ticket.title, `%${query.title}%`) : undefined,
        query.status ? ilike(ticket.status, `%${query.status}%`) : undefined,
        query.tags ? ilike(ticket.tags, `%${query.tags}%`) : undefined,
        query.description ? ilike(ticket.description, `%${query.description}%`) : undefined,
      ),
    );
}
