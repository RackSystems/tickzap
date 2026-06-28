import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("O e-mail fornecido é inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});
