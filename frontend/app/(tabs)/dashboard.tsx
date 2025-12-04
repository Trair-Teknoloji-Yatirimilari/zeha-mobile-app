import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store/authStore';
import { useSubscriptionStore } from '../../lib/store/subscriptionStore';
import { dashboardApi } from '../../lib/api/dashboard';
import { DashboardData, RiskAlert } from '../../types';
import { ProBadge } from '../../components/subscription/ProBadge';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isPro } = useSubscriptionStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to subscription if not PRO
  useEffect(() => {
    if (!isPro()) {
      Alert.alert(
        '🔒 PRO Özelliği',
        'Parent Dashboard sadece PRO üyeler için kullanılabilir.',
        [
          {
            text: 'PRO\'ya Geç',
            onPress: () => router.replace('/subscription' as any)
          }
        ],
        { cancelable: false }
      );
    }
  }, [isPro]);

  useEffect(() => {
    if (isPro()) {
      loadDashboard();
    }
  }, [isPro]);

  const loadDashboard = async () => {
    try {
      const dashboardData = await dashboardApi.getDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const getRiskColor = (level: RiskAlert['level']) => {
    switch (level) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  const getRiskIcon = (level: RiskAlert['level']) => {
    switch (level) {
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'warning';
      case 'medium':
        return 'information-circle';
      case 'low':
        return 'checkmark-circle';
      default:
        return 'alert';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kontrol Paneli</Text>
          <Text style={styles.headerSubtitle}>Hoş geldiniz, {user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="#f8fafc" />
          {data && data.alerts.length > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
            <Ionicons name="people" size={32} color="#ffffff" />
            <Text style={styles.statValue}>{data?.kids.length || 0}</Text>
            <Text style={styles.statLabel}>Çocuk</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
            <Ionicons name="alert-circle" size={32} color="#ffffff" />
            <Text style={styles.statValue}>
              {data?.alerts.filter(a => a.level === 'critical' || a.level === 'high').length || 0}
            </Text>
            <Text style={styles.statLabel}>Uyarı</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
            <Text style={styles.statValue}>
              {data?.analysis.filter(a => a.mood === 'positive').length || 0}
            </Text>
            <Text style={styles.statLabel}>Olumlu</Text>
          </View>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Risk Uyarıları</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {data && data.alerts.length > 0 ? (
            data.alerts.slice(0, 5).map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View
                  style={[
                    styles.alertIcon,
                    { backgroundColor: getRiskColor(alert.level) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getRiskIcon(alert.level) as any}
                    size={24}
                    color={getRiskColor(alert.level)}
                  />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertKid}>{alert.kidName}</Text>
                    <View
                      style={[
                        styles.alertBadge,
                        { backgroundColor: getRiskColor(alert.level) },
                      ]}
                    >
                      <Text style={styles.alertBadgeText}>{alert.level}</Text>
                    </View>
                  </View>
                  <Text style={styles.alertCategory}>{alert.category}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {alert.message}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              <Text style={styles.emptyStateText}>Hiç uyarı yok!</Text>
            </View>
          )}
        </View>

        {/* Psychological Analysis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Psikolojik Analiz</Text>
          </View>

          {data && data.analysis.length > 0 ? (
            data.analysis.map((analysis) => (
              <View key={analysis.kidId} style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisKid}>{analysis.kidName}</Text>
                  <View
                    style={[
                      styles.moodBadge,
                      {
                        backgroundColor:
                          analysis.mood === 'positive'
                            ? '#10b981'
                            : analysis.mood === 'neutral'
                            ? '#f59e0b'
                            : '#ef4444',
                      },
                    ]}
                  >
                    <Text style={styles.moodBadgeText}>{analysis.mood}</Text>
                  </View>
                </View>
                {analysis.concerns.length > 0 && (
                  <View style={styles.concernsContainer}>
                    <Text style={styles.concernsTitle}>Endişeler:</Text>
                    {analysis.concerns.map((concern, index) => (
                      <Text key={index} style={styles.concernText}>
                        • {concern}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="stats-chart" size={48} color="#6366f1" />
              <Text style={styles.emptyStateText}>Analiz verisi bekleniyor</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  sectionLink: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertKid: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  alertCategory: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  analysisCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analysisKid: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  concernsContainer: {
    marginTop: 8,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  concernText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
});
