import { z } from "zod";

export const generateSuggestionInputSchema = z.object({
  instructions: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
});

export type GenerateSuggestionInput = z.infer<
  typeof generateSuggestionInputSchema
>;
