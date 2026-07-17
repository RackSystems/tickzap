import { openai } from "@ai-sdk/openai";
import { ToolLoopAgent } from "ai";
import type { GenerateSuggestionInput } from "./suggestion.schema";

const model = openai("gpt-5-mini");

export async function generateSuggestion({
  instructions,
  prompt,
}: GenerateSuggestionInput): Promise<string> {
  const agent = new ToolLoopAgent({ model, instructions });
  const result = await agent.generate({ prompt });

  return result.text;
}
