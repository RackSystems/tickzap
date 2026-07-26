import * as z from "zod";

export const requesterSchema = z.object({
  name: z.string(),
  contactValue: z.string(),
  contactType: z.string(),
  companyName: z.string(),
  identifierValue: z.string(),
  identifierType: z.enum(["CNPJ", "CPF"]),
  observations: z.object({}),
});

export const updateRequesterSchema = requesterSchema.partial();

export const requesterParamSchema = z.object({
  id: z.string().uuid(),
});

export const requesterQuerySchema = z.object({
  name: z.string().optional(),
  contactValue: z.string().optional(),
  companyName: z.string().optional(),
  identifierValue: z.string().optional(),
});

export type CreateRequester = z.infer<typeof requesterSchema>;
export type UpdateRequester = z.infer<typeof updateRequesterSchema>;
export type RequesterQuery = z.infer<typeof requesterQuerySchema>;
export type RequesterIdParam = z.infer<typeof requesterParamSchema>;

