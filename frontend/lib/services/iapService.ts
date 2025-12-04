import { Platform, Alert } from 'react-native';
import { subscriptionApi } from '../api/subscription';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { SUBSCRIPTION_PRODUCTS, SubscriptionPlatform } from '../../types/subscription';

// Conditional import for IAP (only works in native builds, not Expo Go)
let InAppPurchases: any = null;
try {
  InAppPurchases = require('expo-in-app-purchases');
} catch (e) {
  console.warn('IAP module not available - running in development mode');
}

class IAPService {
  private isInitialized = false;
  private isAvailable = false;

  constructor() {
    this.isAvailable = InAppPurchases !== null;
  }

  async initialize() {
    if (!this.isAvailable) {
      console.warn('IAP not available - development mode');
      return;
    }

    if (this.isInitialized) return;

    try {
      await InAppPurchases.connectAsync();
      this.isInitialized = true;
      console.log('✅ IAP Service initialized');
    } catch (error) {
      console.error('❌ IAP initialization failed:', error);
      throw error;
    }
  }

  async getProducts() {
    if (!this.isAvailable) {
      console.warn('IAP not available');
      return [];
    }

    try {
      const { results } = await InAppPurchases.getProductsAsync([
        SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
      ]);
      return results;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  async purchaseProSubscription() {
    if (!this.isAvailable) {
      Alert.alert(
        'Geliştirme Modu',
        'IAP sadece native build\'de çalışır. Production\'da Apple/Google IAP aktif olacak.\n\nŞimdilik demo amaçlı subscription state değiştirilecek.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Demo PRO Aktif Et',
            onPress: () => {
              // Demo mode: Set PRO status
              useSubscriptionStore.getState().setSubscription({
                status: 'pro',
                productId: SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
                platform: Platform.OS === 'ios' ? 'ios' : 'android',
                purchaseDate: new Date().toISOString(),
              });
              Alert.alert('✅ Demo', 'PRO demo modu aktif edildi!');
            },
          },
        ]
      );
      return;
    }

    try {
      await this.initialize();

      // Start purchase
      await InAppPurchases.purchaseItemAsync(SUBSCRIPTION_PRODUCTS.PRO_MONTHLY);

      // Listen for purchase updates
      InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results || []) {
            if (purchase.acknowledged === false) {
              // Verify with backend
              try {
                const platform: SubscriptionPlatform =
                  Platform.OS === 'ios' ? 'ios' : 'android';

                const verifyResponse = await subscriptionApi.verifyPurchase({
                  transactionId: purchase.orderId || '',
                  productId: purchase.productId,
                  platform,
                  receipt: JSON.stringify(purchase),
                });

                if (verifyResponse.success) {
                  // Update store
                  useSubscriptionStore.getState().setSubscription(verifyResponse.subscription);

                  // Finish transaction
                  await InAppPurchases.finishTransactionAsync(purchase, false);

                  Alert.alert(
                    '🎉 Tebrikler!',
                    'PRO üyeliğiniz başarıyla aktif edildi!'
                  );
                } else {
                  throw new Error(verifyResponse.message || 'Verification failed');
                }
              } catch (error) {
                console.error('Purchase verification failed:', error);
                Alert.alert(
                  'Hata',
                  'Satın alma doğrulanamadı. Lütfen destek ekibiyle iletişime geçin.'
                );
              }
            }
          }
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          console.log('Purchase cancelled by user');
        } else {
          Alert.alert('Hata', 'Satın alma başarısız oldu.');
        }
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Hata', 'Satın alma başlatılamadı.');
    }
  }

  async restorePurchases() {
    if (!this.isAvailable) {
      Alert.alert('Geliştirme Modu', 'IAP restore sadece native build\'de çalışır.');
      return;
    }

    try {
      await this.initialize();

      const { results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (results && results.length > 0) {
        // Find active subscription
        const activeSubscription = results.find(
          (purchase) => purchase.productId === SUBSCRIPTION_PRODUCTS.PRO_MONTHLY
        );

        if (activeSubscription) {
          // Restore with backend
          const response = await subscriptionApi.restorePurchases();
          
          if (response.success) {
            useSubscriptionStore.getState().setSubscription(response.subscription);
            Alert.alert('Başarılı', 'Satın alımlarınız geri yüklendi!');
          }
        } else {
          Alert.alert('Bilgi', 'Geri yüklenecek satın alım bulunamadı.');
        }
      } else {
        Alert.alert('Bilgi', 'Geri yüklenecek satın alım bulunamadı.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Hata', 'Satın alımlar geri yüklenemedi.');
    }
  }

  async disconnect() {
    if (this.isAvailable && this.isInitialized) {
      await InAppPurchases.disconnectAsync();
      this.isInitialized = false;
    }
  }
  
  // Check if IAP is available
  isIAPAvailable(): boolean {
    return this.isAvailable;
  }
}

export const iapService = new IAPService();
