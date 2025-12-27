export enum ChannelType {
  WHATSAPP_BAILEYS = 'WHATSAPP-BAILEYS',
}

export const ChannelTypeLabels: Record<ChannelType, string> = {
  [ChannelType.WHATSAPP_BAILEYS]: 'Baileys',
};

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  status: string;
  isAuthenticated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChannelPayload {
  name: string;
  type: string;
  identifier: string;
}
