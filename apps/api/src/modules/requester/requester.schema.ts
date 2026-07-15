import * as z from "zod";

export const requester = z.object({
  name: z.string(),
  contactValue: z.string(),
  contactType: z.string(),
  companyName: z.string(),
  identifierValue: z.string(),
  identifierType: z.enum(["CNPJ", "CPF"]),
  observations: z.object({}),
});