import { apiClient } from './client';
import { TimeSettings, TimeSettingsUpdate } from '../../types';

export const settingsApi = {
  getTimeSettings: async (kidId: string): Promise<TimeSettings> => {
    const response = await apiClient.get<TimeSettings>(`/settings/time/${kidId}`);
    return response.data;
  },

  updateTimeSettings: async (data: TimeSettingsUpdate): Promise<TimeSettings> => {
    const response = await apiClient.post<TimeSettings>('/settings/time', data);
    return response.data;
  },
};
