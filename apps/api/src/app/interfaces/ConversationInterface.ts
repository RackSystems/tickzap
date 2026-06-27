import type { ConversationStatus } from '../../config/schema';

export interface Conversation {
  id: string;
  contactId: string;
  channelId: string;
  status: ConversationStatus;
  userId?: string;
  useAI: boolean;
  createdAt: Date;
  updatedAt: Date;
}