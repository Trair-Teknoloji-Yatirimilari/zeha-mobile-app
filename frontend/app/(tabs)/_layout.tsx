import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useSubscriptionStore } from '../../lib/store/subscriptionStore';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isPro } = useSubscriptionStore();
  const isKid = user?.role === 'kids';
  const isAdult = user?.role === 'adult';
  
  // Handle locked tab press
  const handleLockedTabPress = () => {
    Alert.alert(
      '🔒 PRO Özelliği',
      'Parent Dashboard sadece PRO üyeler için kullanılabilir. PRO\'ya geçerek çocuklarınızı takip edebilirsiniz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'PRO\'ya Geç',
          onPress: () => router.push('/subscription' as any)
        }
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      {isKid && (
        <>
          <Tabs.Screen
            name="chat"
            options={{
              title: 'Sohbet',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {isParent && (
        <>
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Kontrol Paneli',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="kids"
            options={{
              title: 'Çocuklar',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Ayarlar',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {!isKid && !isParent && (
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Sohbet',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Hide other tabs if not used */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: isParent ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="kids"
        options={{
          href: isParent ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: isParent ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: isKid ? undefined : null,
        }}
      />
    </Tabs>
  );
}
