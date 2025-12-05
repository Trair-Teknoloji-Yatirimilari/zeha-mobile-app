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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/store/authStore';
import { UserRole } from '../../types';

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole>('kids');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!acceptedPrivacy || !acceptedTerms) {
      Alert.alert('Hata', 'Lütfen Gizlilik Politikası ve Kullanım Koşullarını kabul edin');
      return;
    }

    if (role === 'kids' && !age) {
      Alert.alert('Hata', 'Lütfen yaşınızı girin');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        email,
        password,
        name,
        role,
        age: age ? parseInt(age) : undefined,
      });
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert(
        'Kayıt Başarısız',
        error.response?.data?.message || 'Bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.title}>Kayıt Ol</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleTitle}>Zeha'ya Hoş Geldiniz!</Text>
          <Text style={styles.roleSubtitle}>
            Global yapay zeka asistanınız ile tanışın
          </Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('adult')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#6366f1' }]}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Yetişkin</Text>
              <Text style={styles.roleDesc}>18+ yaş kullanıcılar için</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Kids Mode: </Text>
              Çocuk hesapları sadece ebeveyn tarafından oluşturulabilir. 
              Kayıt olduktan sonra Dashboard'dan çocuk ekleyebilirsiniz.
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.guestCard}
            onPress={() => {
              Alert.alert(
                'Misafir Girişi',
                'Misafir modu yakında aktif olacak',
                [{ text: 'Tamam' }]
              );
            }}
          >
            <Ionicons name="eye-outline" size={24} color="#94a3b8" />
            <Text style={styles.guestText}>Misafir Olarak Devam Et</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('role')}
          >
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.title}>Kayıt Ol</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>

          {role === 'kids' && (
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Yaşınız (4-15)"
                placeholderTextColor="#64748b"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
          )}

          {/* Privacy Policy Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
              {acceptedPrivacy && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              <Text 
                style={styles.checkboxLink} 
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL('https://zeha.trairx.com/privacy-policy');
                }}
              >
                Gizlilik Politikasını
              </Text>
              {' '}okudum ve kabul ediyorum.
            </Text>
          </TouchableOpacity>

          {/* Terms of Service Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              <Text 
                style={styles.checkboxLink}
                onPress={(e) => {
                  e.stopPropagation();
                  Linking.openURL('https://zeha.trairx.com/terms-of-service');
                }}
              >
                Kullanım Koşullarını
              </Text>
              {' '}okudum ve kabul ediyorum.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginLinkText}>
              Zaten hesabınız var mı?{' '}
              <Text style={styles.loginLinkTextBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  roleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 14,
    color: '#94a3b8',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  checkboxLink: {
    color: '#6366f1',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  loginLinkTextBold: {
    color: '#6366f1',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  infoBold: {
    fontWeight: '600',
    color: '#f8fafc',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748b',
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  guestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
