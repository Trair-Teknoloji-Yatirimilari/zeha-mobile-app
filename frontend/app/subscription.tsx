import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { iapService } from '../lib/services/iapService';
import { useSubscriptionStore } from '../lib/store/subscriptionStore';
import { useAuthStore } from '../lib/store/authStore';
import { PRO_FEATURES } from '../types/subscription';
import { ProBadge } from '../components/subscription/ProBadge';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isPro, subscription } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isIAPAvailable, setIsIAPAvailable] = useState(false);

  // Check if Kids account
  const isKids = user?.role === 'kids';

  useEffect(() => {
    setIsIAPAvailable(iapService.isIAPAvailable());
  }, []);

  const handleSubscribe = async () => {
    if (isKids) {
      alert('👶 Çocuk hesapları için satın alma yapmanız gerekiyor. Lütfen ebeveyn hesabından satın alın.');
      return;
    }

    setLoading(true);
    try {
      await iapService.purchaseProSubscription();
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await iapService.restorePurchases();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setRestoring(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://zeha.ai/privacy');
  };

  const openTerms = () => {
    Linking.openURL('https://zeha.ai/terms');
  };

  if (isPro()) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PRO Üyeliğim</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.proActiveCard}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.proActiveTitle}>PRO Üyeliğiniz Aktif!</Text>
            <Text style={styles.proActiveSubtitle}>
              Tüm premium özelliklere erişiminiz var
            </Text>
            <ProBadge size="large" />
            {subscription?.expiresAt && (
              <Text style={styles.expiryText}>
                Yenileme tarihi: {new Date(subscription.expiresAt).toLocaleDateString('tr-TR')}
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>PRO Özellikler</Text>
          {PRO_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name={feature.icon as any} size={24} color="#ffffff" />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRO'ya Geç</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="star" size={48} color="#f59e0b" />
          </View>
          <Text style={styles.heroTitle}>Zeha PRO</Text>
          <Text style={styles.heroSubtitle}>Tüm özelliklerin kilidini aç</Text>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceAmount}>$9.90</Text>
            <Text style={styles.pricePeriod}>/ay</Text>
          </View>
          <Text style={styles.priceDescription}>
            İstediğiniz zaman iptal edebilirsiniz
          </Text>
        </View>

        {/* Development Mode Banner */}
        {!isIAPAvailable && (
          <View style={styles.devModeBox}>
            <Ionicons name="construct" size={20} color="#3b82f6" />
            <Text style={styles.devModeText}>
              <Text style={{ fontWeight: 'bold' }}>Geliştirme Modu:</Text> IAP sadece native build'de çalışır. 
              Test için "Demo PRO Aktif Et" kullanabilirsiniz.
            </Text>
          </View>
        )}

        {/* Kids Account Warning */}
        {isKids && (
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              Çocuk hesapları için ebeveyn onayı gereklidir. Lütfen ebeveyn hesabından satın alın.
            </Text>
          </View>
        )}

        {/* Features */}
        <Text style={styles.sectionTitle}>PRO Özellikler</Text>
        {PRO_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name={feature.icon as any} size={24} color="#ffffff" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="star" size={20} color="#ffffff" />
              <Text style={styles.subscribeButtonText}>PRO'ya Geç - $9.90/ay</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator color="#6366f1" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>Satın Alımları Geri Yükle</Text>
          )}
        </TouchableOpacity>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={styles.legalLink}>Gizlilik Politikası</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.legalLink}>Kullanım Şartları</Text>
          </TouchableOpacity>
        </View>

        {/* COPPA Notice */}
        <View style={styles.coppaNotice}>
          <Text style={styles.coppaText}>
            Bu uygulama COPPA uyumludur. 13 yaş altı kullanıcılar için ebeveyn onayı gereklidir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  priceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  pricePeriod: {
    fontSize: 24,
    color: '#94a3b8',
    marginLeft: 4,
  },
  priceDescription: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#451a03',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#fef3c7',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
    marginTop: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  legalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#64748b',
  },
  coppaNotice: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  coppaText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  proActiveCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginVertical: 24,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  proActiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 8,
  },
  proActiveSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 12,
  },
});
