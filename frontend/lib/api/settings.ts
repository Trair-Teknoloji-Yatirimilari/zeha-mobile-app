import axios from 'axios';
import { apiClient } from './client';
import { TimeSettings, TimeSettingsUpdate } from '../../types';
import { secureStorage } from '../utils/storage';

const STORAGE_KEY_PREFIX = 'time-settings:';

const createStorageKey = (kidId: string) => `${STORAGE_KEY_PREFIX}${kidId}`;

const buildDefaultSettings = (kidId: string): TimeSettings => ({
  id: kidId,
  kidId,
  dailyMessageLimit: 50,
  sleepTimeStart: '21:00',
  sleepTimeEnd: '07:00',
  schoolTimeEnabled: false,
});

const saveFallbackSettings = async (settings: TimeSettings) => {
  try {
    await secureStorage.setItem(createStorageKey(settings.kidId), JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to persist fallback time settings', err);
  }
};

const loadFallbackSettings = async (kidId: string): Promise<TimeSettings> => {
  try {
    const raw = await secureStorage.getItem(createStorageKey(kidId));
    if (raw) {
      return JSON.parse(raw) as TimeSettings;
    }
  } catch (err) {
    console.warn('Failed to read fallback time settings', err);
  }
  const defaults = buildDefaultSettings(kidId);
  await saveFallbackSettings(defaults);
  return defaults;
};

export const settingsApi = {
  getTimeSettings: async (kidId: string): Promise<TimeSettings> => {
    try {
      const response = await apiClient.get<TimeSettings>(`/settings/time/${kidId}`);
      await saveFallbackSettings(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn(
          `Remote time settings unavailable (kidId=${kidId}, status=${error.response?.status ?? 'unknown'})`
        );
      } else {
        console.warn('Remote time settings unavailable', error);
      }
      return loadFallbackSettings(kidId);
    }
  },

  updateTimeSettings: async (data: TimeSettingsUpdate): Promise<TimeSettings> => {
    try {
      const response = await apiClient.post<TimeSettings>('/settings/time', data);
      await saveFallbackSettings(response.data);
      return response.data;
    } catch (error) {
      const fallback = await loadFallbackSettings(data.kidId);
      const merged: TimeSettings = {
        ...fallback,
        ...data,
        id: fallback.id,
        kidId: fallback.kidId,
      };
      await saveFallbackSettings(merged);
      if (axios.isAxiosError(error)) {
        console.warn(
          `Remote time settings update failed (kidId=${data.kidId}, status=${error.response?.status ?? 'unknown'}). Falling back to local cache.`
        );
      } else {
        console.warn('Remote time settings update failed. Falling back to local cache.', error);
      }
      return merged;
    }
  },
};
