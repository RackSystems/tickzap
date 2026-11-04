import { Hono } from "hono";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import {ticketQuerySchema, ticketSchema} from "@/modules/tickets/ticket.schema";
import * as TicketService from "@/modules/tickets/ticket.service";
import {requireAuth} from "@/modules/auth/middleware";
import {requireTenant, type TenantEnv} from "@/modules/tenant/middleware";

const router = new Hono<TenantEnv>();

router.use("*", requireAuth, requireTenant);

router.get("/",  zValidator("query", ticketQuerySchema), async (c) => {
  return c.json(await TicketService.list(c.var.scope, c.req.valid("query")));
});

router.post("/", zValidator("json", ticketSchema), async (c) => {
  const ticket = c.req.valid("json");
  return c.json(await TicketService.create(c.var.scope, ticket), 201);
});

export default router;