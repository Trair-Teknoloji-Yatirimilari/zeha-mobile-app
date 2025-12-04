import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store/authStore';
import { dashboardApi } from '../../lib/api/dashboard';
import { settingsApi } from '../../lib/api/settings';
import { User, TimeSettings } from '../../types';

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const [kids, setKids] = useState<User[]>([]);
  const [selectedKid, setSelectedKid] = useState<User | null>(null);
  const [settings, setSettings] = useState<TimeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKids();
  }, []);

  useEffect(() => {
    if (selectedKid) {
      loadSettings(selectedKid.id);
    }
  }, [selectedKid]);

  const loadKids = async () => {
    try {
      const dashboardData = await dashboardApi.getDashboard();
      setKids(dashboardData.kids);
      if (dashboardData.kids.length > 0) {
        setSelectedKid(dashboardData.kids[0]);
      }
    } catch (error) {
      console.error('Failed to load kids:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (kidId: string) => {
    try {
      const kidSettings = await settingsApi.getTimeSettings(kidId);
      setSettings(kidSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedKid || !settings) return;

    setSaving(true);
    try {
      await settingsApi.updateTimeSettings({
        kidId: selectedKid.id,
        dailyMessageLimit: settings.dailyMessageLimit,
        sleepTimeStart: settings.sleepTimeStart,
        sleepTimeEnd: settings.sleepTimeEnd,
        schoolTimeEnabled: settings.schoolTimeEnabled,
        schoolTimeStart: settings.schoolTimeStart,
        schoolTimeEnd: settings.schoolTimeEnd,
      });
      Alert.alert('Başarılı', 'Ayarlar kaydedildi');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof TimeSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
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

  if (kids.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="settings-outline" size={64} color="#64748b" />
          <Text style={styles.emptyStateText}>
            Ayar yapabilmek için önce çocuk eklemelisiniz
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kid Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çocuk Seçin</Text>
          <View style={styles.kidSelector}>
            {kids.map((kid) => (
              <TouchableOpacity
                key={kid.id}
                style={[
                  styles.kidOption,
                  selectedKid?.id === kid.id && styles.kidOptionActive,
                ]}
                onPress={() => setSelectedKid(kid)}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={selectedKid?.id === kid.id ? '#6366f1' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.kidOptionText,
                    selectedKid?.id === kid.id && styles.kidOptionTextActive,
                  ]}
                >
                  {kid.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {settings && (
          <>
            {/* Daily Message Limit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Günlük Mesaj Limiti</Text>
              <View style={styles.settingCard}>
                <View style={styles.limitDisplay}>
                  <Text style={styles.limitValue}>{settings.dailyMessageLimit}</Text>
                  <Text style={styles.limitLabel}>mesaj/gün</Text>
                </View>
                <View style={styles.limitControls}>
                  <TouchableOpacity
                    style={styles.limitButton}
                    onPress={() =>
                      updateSetting(
                        'dailyMessageLimit',
                        Math.max(20, settings.dailyMessageLimit - 10)
                      )
                    }
                  >
                    <Ionicons name="remove" size={24} color="#f8fafc" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.limitButton}
                    onPress={() =>
                      updateSetting(
                        'dailyMessageLimit',
                        Math.min(200, settings.dailyMessageLimit + 10)
                      )
                    }
                  >
                    <Ionicons name="add" size={24} color="#f8fafc" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.limitHint}>
                  Yaş grubuna göre önerilen: 20-200 arası
                </Text>
              </View>
            </View>

            {/* Sleep Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uyku Saati Kısıtlaması</Text>
              <View style={styles.settingCard}>
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Ionicons name="moon" size={20} color="#94a3b8" />
                    <TextInput
                      style={styles.timeInputField}
                      value={settings.sleepTimeStart}
                      onChangeText={(text) => updateSetting('sleepTimeStart', text)}
                      placeholder="21:00"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                  <Text style={styles.timeSeparator}>-</Text>
                  <View style={styles.timeInput}>
                    <Ionicons name="sunny" size={20} color="#94a3b8" />
                    <TextInput
                      style={styles.timeInputField}
                      value={settings.sleepTimeEnd}
                      onChangeText={(text) => updateSetting('sleepTimeEnd', text)}
                      placeholder="07:00"
                      placeholderTextColor="#64748b"
                    />
                  </View>
                </View>
                <Text style={styles.settingHint}>
                  Bu saatler arasında uygulama kullanılamaz
                </Text>
              </View>
            </View>

            {/* School Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Okul Saati Kısıtlaması</Text>
                <Switch
                  value={settings.schoolTimeEnabled}
                  onValueChange={(value) => updateSetting('schoolTimeEnabled', value)}
                  trackColor={{ false: '#334155', true: '#6366f1' }}
                  thumbColor="#f8fafc"
                />
              </View>
              {settings.schoolTimeEnabled && (
                <View style={styles.settingCard}>
                  <View style={styles.timeRow}>
                    <View style={styles.timeInput}>
                      <Ionicons name="school" size={20} color="#94a3b8" />
                      <TextInput
                        style={styles.timeInputField}
                        value={settings.schoolTimeStart || ''}
                        onChangeText={(text) => updateSetting('schoolTimeStart', text)}
                        placeholder="08:00"
                        placeholderTextColor="#64748b"
                      />
                    </View>
                    <Text style={styles.timeSeparator}>-</Text>
                    <View style={styles.timeInput}>
                      <Ionicons name="home" size={20} color="#94a3b8" />
                      <TextInput
                        style={styles.timeInputField}
                        value={settings.schoolTimeEnd || ''}
                        onChangeText={(text) => updateSetting('schoolTimeEnd', text)}
                        placeholder="15:00"
                        placeholderTextColor="#64748b"
                      />
                    </View>
                  </View>
                  <Text style={styles.settingHint}>
                    Okul saatlerinde uygulama kullanılamaz
                  </Text>
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
  },
  kidSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  kidOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  kidOptionActive: {
    borderColor: '#6366f1',
    backgroundColor: '#312e81',
  },
  kidOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  kidOptionTextActive: {
    color: '#f8fafc',
  },
  settingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  limitDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  limitValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  limitLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  limitControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  limitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  timeInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  settingHint: {
    fontSize: 12,
    color: '#64748b',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
