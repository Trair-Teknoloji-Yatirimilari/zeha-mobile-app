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

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
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
          <Text style={styles.title}>Hesap Türü</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleTitle}>Kim olarak kaydoluyorsunuz?</Text>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('kids')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="happy" size={40} color="#ffffff" />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Çocuk</Text>
              <Text style={styles.roleDesc}>4-15 yaş arası kullanıcılar</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('parent')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="people" size={40} color="#ffffff" />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Ebeveyn</Text>
              <Text style={styles.roleDesc}>Çocuklarınızı takip edin</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('adult')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>Yetişkin</Text>
              <Text style={styles.roleDesc}>16+ yaş kullanıcılar</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
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
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 24,
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
  registerButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
});
