import React from 'react';
import { create } from 'zustand';
import { SubscriptionInfo, SubscriptionStatus } from '../../types/subscription';

interface SubscriptionState {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  setSubscription: (subscription: SubscriptionInfo | null) => void;
  setLoading: (loading: boolean) => void;
  isPro: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ isLoading: loading }),
  isPro: () => {
    const { subscription } = get();
    return subscription?.status === 'pro';
  },
}));
