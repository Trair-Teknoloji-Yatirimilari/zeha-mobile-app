import { apiClient } from './client';
import { DashboardData, RiskAlert } from '../../types';

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/parent/dashboard');
    return response.data;
  },

  getAlerts: async (): Promise<RiskAlert[]> => {
    const response = await apiClient.get<RiskAlert[]>('/parent/alerts');
    return response.data;
  },

  markAlertRead: async (alertId: string): Promise<void> => {
    await apiClient.post(`/parent/alerts/${alertId}/read`);
  },
};
