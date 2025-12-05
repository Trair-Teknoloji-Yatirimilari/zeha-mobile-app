import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../lib/api/client';
import { dashboardApi } from '../lib/api/dashboard';

type AgeGroup = '4-6' | '7-9' | '10-12' | '13-15';

export default function AddKidScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
  const [loading, setLoading] = useState(false);

  const ageGroups: { value: AgeGroup; label: string; color: string }[] = [
    { value: '4-6', label: '4-6 yaş', color: '#3b82f6' },
    { value: '7-9', label: '7-9 yaş', color: '#10b981' },
    { value: '10-12', label: '10-12 yaş', color: '#f59e0b' },
    { value: '13-15', label: '13-15 yaş', color: '#8b5cf6' },
  ];

  const confirmKidCreation = async (targetEmail: string) => {
    try {
      const dashboard = await dashboardApi.getDashboard();
      return dashboard.kids.some(
        (kid) => kid.email?.toLowerCase() === targetEmail.trim().toLowerCase()
      );
    } catch (error) {
      console.warn('Kid creation verification failed', error);
      return false;
    }
  };

  const handleAddKid = async () => {
    if (!name || !email || !password || !age) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 15) {
      Alert.alert('Hata', 'Yaş 4-15 arasında olmalıdır');
      return;
    }

    setLoading(true);
    try {
      // Create kid account via parent
      await apiClient.post('/parent/kids/create', {
        name,
        email,
        password,
        age: ageNum,
        role: 'kids',
      });

      Alert.alert(
        'Başarılı! 🎉',
        `${name} için hesap oluşturuldu. Artık çocuğunuz kendi email ve şifresiyle giriş yapabilir.`,
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Add kid failed:', error);

      const isTimeout =
        axios.isAxiosError(error) &&
        (error.response?.status === 524 || error.code === 'ECONNABORTED');

      if (isTimeout) {
        const kidExists = await confirmKidCreation(email);
        if (kidExists) {
          Alert.alert(
            'Başarılı! 🎉',
            `${name} için hesap oluşturuldu ancak sunucu geç yanıt verdi. Çocuk listesinde görebilirsiniz.`,
            [
              {
                text: 'Tamam',
                onPress: () => router.back(),
              },
            ]
          );
          return;
        }
      }

      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Çocuk hesabı oluşturulamadı'
      );
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroupFromAge = (ageValue: string): AgeGroup | null => {
    const ageNum = parseInt(ageValue);
    if (isNaN(ageNum)) return null;
    
    if (ageNum >= 4 && ageNum <= 6) return '4-6';
    if (ageNum >= 7 && ageNum <= 9) return '7-9';
    if (ageNum >= 10 && ageNum <= 12) return '10-12';
    if (ageNum >= 13 && ageNum <= 15) return '13-15';
    return null;
  };

  const handleAgeChange = (value: string) => {
    setAge(value);
    setSelectedAgeGroup(getAgeGroupFromAge(value));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Çocuk Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              Çocuğunuz için güvenli bir hesap oluşturun. Çocuğunuz kendi email
              ve şifresiyle giriş yapabilecek.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Ad Soyad</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="cocuk@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Güvenli bir şifre"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Yaş</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="4-15 arası"
                placeholderTextColor="#64748b"
                value={age}
                onChangeText={handleAgeChange}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            {/* Age Group Display */}
            {selectedAgeGroup && (
              <View style={styles.ageGroupContainer}>
                <Text style={styles.ageGroupLabel}>Yaş Grubu:</Text>
                <View
                  style={[
                    styles.ageGroupBadge,
                    {
                      backgroundColor:
                        ageGroups.find((g) => g.value === selectedAgeGroup)?.color ||
                        '#6366f1',
                    },
                  ]}
                >
                  <Text style={styles.ageGroupText}>
                    {ageGroups.find((g) => g.value === selectedAgeGroup)?.label}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Age Groups Info */}
          <View style={styles.ageGroupsInfo}>
            <Text style={styles.sectionTitle}>Yaş Grupları</Text>
            {ageGroups.map((group) => (
              <View key={group.value} style={styles.ageGroupCard}>
                <View
                  style={[styles.ageGroupDot, { backgroundColor: group.color }]}
                />
                <Text style={styles.ageGroupCardText}>{group.label}</Text>
              </View>
            ))}
          </View>

          {/* COPPA Notice */}
          <View style={styles.coppaNotice}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.coppaText}>
              Bu uygulama COPPA uyumludur. Ebeveyn onayı ile çocuk hesabı
              oluşturulur.
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddKid}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Çocuk Hesabı Oluştur</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Maksimum 2 çocuk hesabı ekleyebilirsiniz
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
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
    paddingTop: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#f8fafc',
    marginLeft: 12,
  },
  ageGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  ageGroupLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  ageGroupBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageGroupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  ageGroupsInfo: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  ageGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  ageGroupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ageGroupCardText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  coppaNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  coppaText: {
    flex: 1,
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helperText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 32,
  },
});
