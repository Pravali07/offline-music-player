import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { MiniPlayer } from '@/components/MiniPlayer';
import { Colors } from '@/utils/colors';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    primary: Colors.primary,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={customDarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: 'Now Playing',
              headerStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.text,
            }}
          />
        </Stack>
        <MiniPlayer />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
