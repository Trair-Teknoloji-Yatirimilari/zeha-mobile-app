import { apiClient } from './client';
import {
  SubscriptionInfo,
  PurchaseVerification,
  SubscriptionResponse,
} from '../../types/subscription';

export const subscriptionApi = {
  // Verify purchase with backend
  verifyPurchase: async (data: PurchaseVerification): Promise<SubscriptionResponse> => {
    const response = await apiClient.post<SubscriptionResponse>(
      '/subscription/verify',
      data
    );
    return response.data;
  },

  // Get current subscription status
  getSubscription: async (): Promise<SubscriptionInfo> => {
    const response = await apiClient.get<SubscriptionInfo>('/subscription/status');
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/subscription/cancel');
    return response.data;
  },

  // Restore purchases
  restorePurchases: async (): Promise<SubscriptionResponse> => {
    const response = await apiClient.post<SubscriptionResponse>('/subscription/restore');
    return response.data;
  },
};
