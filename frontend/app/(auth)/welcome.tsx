import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Zeha</Text>
          <Text style={styles.subtitle}>
            Global Yapay Zeka Asistanı
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="sparkles" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Akıllı Sohbet</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="globe" size={24} color="#10b981" />
            <Text style={styles.featureText}>Tüm Dillerde Sohbet</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
            <Text style={styles.featureText}>Güvenli (Kids Mode ile)</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
          </TouchableOpacity>

          {/* Disclaimer Text */}
          <Text style={styles.disclaimerText}>
            Devam ederek Gizlilik Politikasını ve Kullanım Koşullarını kabul etmiş olursunuz.
          </Text>

          {/* Copyright Text */}
          <Text style={styles.copyrightText}>
            © 2025 TrairX Technology O.Ü — Tüm Hakları Saklıdır.
          </Text>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => {
              // TODO: Handle guest mode
              console.log('Guest mode');
            }}
          >
            <Text style={styles.guestButtonText}>Misafir Olarak Devam Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logo: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  features: {
    marginVertical: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  buttons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 16,
    marginTop: -8,
  },
  copyrightText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 14,
    marginTop: 8,
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
