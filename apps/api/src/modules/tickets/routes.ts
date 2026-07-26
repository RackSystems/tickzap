import { Hono } from "hono";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import {ticketQuerySchema, ticketSchema} from "@/modules/tickets/ticket.schema";
import * as TicketService from "@/modules/tickets/ticket.service";
import {AuthEnv} from "@/modules/auth/middleware";

const router = new Hono<AuthEnv>();

// router.use()

router.get("/",  zValidator("query", ticketQuerySchema), async (c) => {
  return c.json(await TicketService.list(c.req.valid("query")));
});

router.post("/", zValidator("json", ticketSchema), async (c) => {
  const ticket = c.req.valid("json");
  return c.json(await TicketService.create(ticket), 201);
});

export default router;