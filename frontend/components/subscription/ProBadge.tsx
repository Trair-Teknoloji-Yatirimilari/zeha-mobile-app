import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

export function ProBadge({ size = 'small' }: ProBadgeProps) {
  const sizeStyles = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4 },
    large: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 6 },
  };

  return (
    <View style={[styles.container, sizeStyles[size]]}>
      <Ionicons name="star" size={sizeStyles[size].fontSize} color="#ffffff" />
      <Text style={[styles.text, { fontSize: sizeStyles[size].fontSize }]}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    gap: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
