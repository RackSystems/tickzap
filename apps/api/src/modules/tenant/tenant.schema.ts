import * as z from 'zod';
import {toUpperCase} from "zod";

export const tenantSchema = z
  .object({
  name: z.string().min(1).max(255),
  documentType: z.string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(['CPF', 'CNPJ'])),
  documentNumber: z.string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(z.string().min(11).max(14)),
})
  .strict();

export const updateTenantSchema = tenantSchema.partial().strict();

export const tenantIdParamSchema = z.object({
  id: z.uuid(),
});

export const tenantQuerySchema = z.object({
  name: z.string().optional(),
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
  documentNumber: z.string().optional(),
});

export type CreateTenant = z.infer<typeof tenantSchema>;
export type UpdateTenant = z.infer<typeof updateTenantSchema>;
export type TenantQuery = z.infer<typeof tenantQuerySchema>;
export type TenantIdParam = z.infer<typeof tenantIdParamSchema>;