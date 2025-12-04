import { apiClient } from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../types';
import { secureStorage } from '../utils/storage';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.data.access_token) {
      await secureStorage.setItem('authToken', response.data.access_token);
      await secureStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token) {
      await secureStorage.setItem('authToken', response.data.access_token);
      await secureStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await secureStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
