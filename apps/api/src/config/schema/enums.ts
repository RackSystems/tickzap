export const mediaTypes = ["IMAGE", "AUDIO", "VIDEO", "DOCUMENT"] as const;
export const messageStatuses = ["SEND", "RECEIVED", "READ", "FAILED"] as const;
export const messageTypes = ["USER", "CLIENT", "BOT"] as const;
export const conversationStatuses = ["PENDING", "OPEN", "CLOSED"] as const;

export type MediaType = (typeof mediaTypes)[number];
export type MessageStatus = (typeof messageStatuses)[number];
export type MessageType = (typeof messageTypes)[number];
export type ConversationStatus = (typeof conversationStatuses)[number];
