import { apiClient } from './client';
import {
  SubscriptionInfo,
  PurchaseVerification,
  SubscriptionResponse,
} from '../../types/subscription';

export const subscriptionApi = {
  // Verify purchase with backend
  verifyPurchase: async (
    userId: string,
    data: PurchaseVerification
  ): Promise<SubscriptionResponse> => {
    try {
      const response = await apiClient.post<SubscriptionResponse>(
        '/subscription/verify',
        {
          user_id: userId,
          transaction_id: data.transactionId,
          product_id: data.productId,
          platform: data.platform,
          receipt: data.receipt,
        }
      );
      return response.data;
    } catch (error) {
      console.warn('Backend subscription/verify not available, using mock');
      // Mock response for development
      return {
        success: true,
        subscription: {
          status: 'pro',
          productId: data.productId,
          platform: data.platform,
          transactionId: data.transactionId,
          purchaseDate: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      };
    }
  },

  // Get current subscription status
  getSubscription: async (): Promise<SubscriptionInfo> => {
    try {
      const response = await apiClient.get<SubscriptionInfo>('/subscription/status');
      return response.data;
    } catch (error) {
      console.warn('Backend subscription/status not available, using mock');
      // Mock response - Free user by default
      return {
        status: 'free',
        productId: '',
        platform: 'ios',
      };
    }
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post('/subscription/cancel');
      return response.data;
    } catch (error) {
      console.warn('Backend subscription/cancel not available');
      return { success: false };
    }
  },

  // Restore purchases
  restorePurchases: async (): Promise<SubscriptionResponse> => {
    try {
      const response = await apiClient.post<SubscriptionResponse>('/subscription/restore');
      return response.data;
    } catch (error) {
      console.warn('Backend subscription/restore not available');
      return {
        success: false,
        subscription: {
          status: 'free',
          productId: '',
          platform: 'ios',
        },
      };
    }
  },
};
