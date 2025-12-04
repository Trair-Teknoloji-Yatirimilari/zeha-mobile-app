import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../types';
import * as SecureStore from 'expo-secure-store';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.access_token) {
      await SecureStore.setItemAsync('authToken', response.data.access_token);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token) {
      await SecureStore.setItemAsync('authToken', response.data.access_token);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
