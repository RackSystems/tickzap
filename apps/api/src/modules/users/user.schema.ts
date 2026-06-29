import * as z from "zod";

const userBaseSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
});

export const createUserSchema = userBaseSchema
  .extend({
    password: z.string().min(6).max(32),
    passwordConfirmation: z.string().min(6).max(32),
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
  });

export const updateUserSchema = userBaseSchema.partial().strict();

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export const userQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  isActive: z.stringbool().optional(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
