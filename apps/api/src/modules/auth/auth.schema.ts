import * as z from "zod";

export const signInSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  })
  .strict();

export type SignIn = z.infer<typeof signInSchema>;
