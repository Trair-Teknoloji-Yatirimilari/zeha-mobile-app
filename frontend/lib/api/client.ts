import axios from 'axios';
import { secureStorage } from '../utils/storage';

// Backend API base URL - use environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api' || 'https://zeha.trairx.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      await secureStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
