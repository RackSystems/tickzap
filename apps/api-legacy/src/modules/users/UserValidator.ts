import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.email(),
    password: z.string().min(6).max(32),
    passwordConfirmation: z.string().min(6).max(32),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "As senhas não conferem",
  });

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.email().optional(),
});

export const changeStatusSchema = z.object({
  status: z
    .string()
    .min(1)
    .transform((value) => value.toLowerCase()),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
