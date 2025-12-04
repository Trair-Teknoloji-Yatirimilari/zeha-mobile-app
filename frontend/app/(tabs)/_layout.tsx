import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store/authStore';

export default function TabLayout() {
  const { user } = useAuthStore();
  const isParent = user?.role === 'parent';
  const isKid = user?.role === 'kids';

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
