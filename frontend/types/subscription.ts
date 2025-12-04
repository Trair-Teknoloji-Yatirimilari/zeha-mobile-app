// Subscription Types
export type SubscriptionStatus = 'free' | 'pro' | 'expired';

export type SubscriptionPlatform = 'ios' | 'android';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  productId: string;
  platform: SubscriptionPlatform;
  expiresAt?: string;
  purchaseDate?: string;
  transactionId?: string;
}

export interface PurchaseVerification {
  transactionId: string;
  productId: string;
  platform: SubscriptionPlatform;
  receipt: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: SubscriptionInfo;
  message?: string;
}

// Product IDs
export const SUBSCRIPTION_PRODUCTS = {
  PRO_MONTHLY: 'zeha_pro_monthly',
} as const;

// PRO Features
export const PRO_FEATURES = [
  {
    icon: 'flash',
    title: 'Sınırsız Mesaj',
    description: 'Günlük mesaj limiti yok',
  },
  {
    icon: 'star',
    title: 'Öncelikli Yanıt',
    description: 'Daha hızlı AI yanıtları',
  },
  {
    icon: 'image',
    title: 'Gelişmiş Resim Analizi',
    description: 'Detaylı görsel analiz',
  },
  {
    icon: 'mic',
    title: 'Sesli Mesaj PRO',
    description: 'Daha uzun sesli mesajlar',
  },
  {
    icon: 'analytics',
    title: 'Detaylı Analiz',
    description: 'Gelişmiş raporlama',
  },
  {
    icon: 'shield-checkmark',
    title: 'Premium Destek',
    description: '7/24 öncelikli destek',
  },
] as const;
