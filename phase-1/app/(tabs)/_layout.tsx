import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/utils/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="music-note" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-music" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
