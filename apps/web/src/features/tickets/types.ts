export interface User {
  id: string;
  username: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  "birthDate": string | null;
  "document": string | null;
  "status": boolean;
  "remoteJid": string;
  "channelId": string;
  "createdAt": string;
  "updatedAt": string;
}

export interface LastMessage {
  content: string | null;
  createdAt: string | null;
  mediaType: string | null;
}

export interface Ticket {
  id: string;
  contactId: string;
  channelId: string;
  status: string;
  userId: string;
  useAI: boolean;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  lastMessage: LastMessage | null;
}

export interface Message {
  id: string;
  ticketId: string;
  userId: string | null;
  contactId: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  type: 'CLIENT' | 'USER';
  status: 'SENT' | 'RECEIVED' | 'READ';
  sentAt: string;
  receivedAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface SendMessagePayload {
  content: string;
}