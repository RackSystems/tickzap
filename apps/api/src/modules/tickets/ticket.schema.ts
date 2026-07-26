import * as z from "zod";

export const ticketSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(["open", "closed"]),
  tags: z.array(z.string()),
  requesterId: z.uuid(),
});

export const updateTicketSchema = ticketSchema.partial();

export const ticketIdParamSchema = z.object({
  id: z.uuid(),
});

export const ticketQuerySchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  tags: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  requesterId: z.uuid().optional(),
});

export type CreateTicket = z.infer<typeof ticketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type TicketQuery = z.infer<typeof ticketQuerySchema>;
export type TicketIdParam = z.infer<typeof ticketIdParamSchema>;