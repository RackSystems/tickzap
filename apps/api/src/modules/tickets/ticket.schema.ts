import * as z from "zod";

const ticketSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(["open", "closed"]),
  tags: z.array(z.string()),
});