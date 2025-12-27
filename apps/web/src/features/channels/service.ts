import apiClient from '@/api/apiClient';
import type { Channel, CreateChannelPayload } from '@/features/channels/types';

export const channelService = {
  async list(): Promise<Channel[]> {
    const response = await apiClient.get('/channels');
    return response.data;
  },

  async create(payload: CreateChannelPayload): Promise<Channel> {
    const response = await apiClient.post('/channels', payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/channels/${id}`);
  },

  async connect(id: string): Promise<any> {
    const response = await apiClient.get(`/channels/${id}/connect`);
    return response.data;
  },
};
