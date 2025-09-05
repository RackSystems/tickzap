import apiClient from '@/api/apiClient';
import type { Channel } from '@/features/channels/types';
import { handleApiError } from '@/api/handleApiError';

export const channelService = {
  async list(): Promise<Channel[]> {
    try {
      const response = await apiClient.get('/channels');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Oops! Ocorreu um erro ao tentar obter os canais.');
      return [];
    }
  },

  async connect(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/channels/${id}/connect`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Oops! Ocorreu um erro ao tentar conectar o canal.');
    }
  },
};
