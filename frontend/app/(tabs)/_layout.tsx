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
      {/* Kids user tabs */}
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

      {/* Adult user tabs */}
      {isAdult && (
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
          
          {/* Parent Dashboard - PRO Feature */}
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Parent',
              tabBarIcon: ({ color, size }) => (
                <>
                  <Ionicons name="grid" size={size} color={color} />
                  {!isPro() && (
                    <Ionicons 
                      name="lock-closed" 
                      size={12} 
                      color="#f59e0b" 
                      style={{ position: 'absolute', top: -4, right: -4 }}
                    />
                  )}
                </>
              ),
              tabBarBadge: !isPro() ? '🔒' : undefined,
            }}
            listeners={{
              tabPress: (e) => {
                if (!isPro()) {
                  e.preventDefault();
                  handleLockedTabPress();
                }
              },
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

      {/* Hide unused tabs */}
      <Tabs.Screen
        name="kids"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
