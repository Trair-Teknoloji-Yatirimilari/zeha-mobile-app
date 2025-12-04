import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ProBadge } from './ProBadge';

interface ProFeatureCardProps {
  title: string;
  description?: string;
  onPress?: () => void;
}

export function ProFeatureCard({ title, description, onPress }: ProFeatureCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/subscription' as any);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={20} color="#f59e0b" />
        <ProBadge size="small" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.upgradeButton}>
        <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
        <Text style={styles.upgradeText}>PRO'ya Geç</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
});
