import React, { useState, useEffect } from 'react';
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
import { settingsApi } from '../../lib/api/settings';
import { User, TimeSettings } from '../../types';

export default function KidsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isPro } = useSubscriptionStore();
  const [kids, setKids] = useState<User[]>([]);
  const [timeSettings, setTimeSettings] = useState<Record<string, TimeSettings>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to subscription if not PRO
  useEffect(() => {
    if (!isPro()) {
      Alert.alert(
        '🔒 PRO Özelliği',
        'Çocuk yönetimi sadece PRO üyeler için kullanılabilir.',
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
      loadKids();
    }
  }, [isPro]);

  const loadKids = async () => {
    try {
      const dashboardData = await dashboardApi.getDashboard();
      setKids(dashboardData.kids);
      
      // Load time settings for each kid
      const settings: Record<string, TimeSettings> = {};
      for (const kid of dashboardData.kids) {
        try {
          const kidSettings = await settingsApi.getTimeSettings(kid.id);
          settings[kid.id] = kidSettings;
        } catch (error) {
          console.error(`Failed to load settings for kid ${kid.id}:`, error);
        }
      }
      setTimeSettings(settings);
    } catch (error) {
      console.error('Failed to load kids:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadKids();
  };

  const getAgeGroupLabel = (age?: number) => {
    if (!age) return '-';
    if (age >= 4 && age <= 6) return '4-6 yaş';
    if (age >= 7 && age <= 9) return '7-9 yaş';
    if (age >= 10 && age <= 12) return '10-12 yaş';
    if (age >= 13 && age <= 15) return '13-15 yaş';
    return `${age} yaş`;
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
        <Text style={styles.headerTitle}>Çocuklar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-kid' as any)}
        >
          <Ionicons name="add" size={24} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {kids.length > 0 ? (
          kids.map((kid) => {
            const settings = timeSettings[kid.id];
            return (
              <TouchableOpacity key={kid.id} style={styles.kidCard}>
                <View style={styles.kidHeader}>
                  <View style={styles.kidAvatar}>
                    <Ionicons name="person" size={32} color="#6366f1" />
                  </View>
                  <View style={styles.kidInfo}>
                    <Text style={styles.kidName}>{kid.name}</Text>
                    <Text style={styles.kidAge}>{getAgeGroupLabel(kid.age)}</Text>
                  </View>
                  <View style={styles.kidStatus}>
                    <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.statusText}>Aktif</Text>
                  </View>
                </View>

                {settings && (
                  <View style={styles.settingsPreview}>
                    <View style={styles.settingItem}>
                      <Ionicons name="chatbubbles" size={16} color="#94a3b8" />
                      <Text style={styles.settingText}>
                        Günlük Limit: {settings.dailyMessageLimit}
                      </Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Ionicons name="moon" size={16} color="#94a3b8" />
                      <Text style={styles.settingText}>
                        Uyku: {settings.sleepTimeStart} - {settings.sleepTimeEnd}
                      </Text>
                    </View>
                    {settings.schoolTimeEnabled && (
                      <View style={styles.settingItem}>
                        <Ionicons name="school" size={16} color="#94a3b8" />
                        <Text style={styles.settingText}>Okul saati aktif</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.kidActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="settings" size={18} color="#6366f1" />
                    <Text style={styles.actionButtonText}>Ayarlar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="stats-chart" size={18} color="#10b981" />
                    <Text style={styles.actionButtonText}>Analiz</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#64748b" />
            <Text style={styles.emptyStateTitle}>Henüz çocuk eklenmemiş</Text>
            <Text style={styles.emptyStateText}>
              Çocuklarınızı ekleyerek onları güvenli bir şekilde takip edebilirsiniz
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/add-kid' as any)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.emptyStateButtonText}>Çocuk Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {kids.length > 0 && kids.length < 2 && (
          <TouchableOpacity
            style={styles.addKidCard}
            onPress={() => router.push('/add-kid' as any)}
          >
            <Ionicons name="add-circle" size={32} color="#6366f1" />
            <Text style={styles.addKidText}>Yeni Çocuk Ekle</Text>
            <Text style={styles.addKidSubtext}>Maksimum 2 çocuk ekleyebilirsiniz</Text>
          </TouchableOpacity>
        )}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  kidCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  kidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  kidAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kidInfo: {
    flex: 1,
    marginLeft: 12,
  },
  kidName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  kidAge: {
    fontSize: 14,
    color: '#94a3b8',
  },
  kidStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  settingsPreview: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  kidActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  addKidCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  addKidText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 12,
  },
  addKidSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
