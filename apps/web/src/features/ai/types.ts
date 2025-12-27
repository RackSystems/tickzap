export interface AIAgent {
  id: string;
  name: string;
  model: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAIAgentPayload {
  name: string;
  model: string;
  welcomeMessage?: string;
  instructions?: string;
  temperature?: number;
  maxTokens?: number;
}
