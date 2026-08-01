import * as z from 'zod';

export const tenantSchema = z
  .object({
  name: z.string().min(1).max(255),
  documentType: z.enum(['CPF', 'CNPJ']),
  documentNumber: z.string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(z.string().min(11).max(14)),
})
  .strict();