import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayerStore } from '@/stores';
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

function RootLayoutContent() {
  const pathname = usePathname();
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const queueLength = usePlayerStore((state) => state.queue.length);

  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  const showMiniPlayer = currentSong !== null && queueLength > 0 && pathname !== '/modal';

  return (
    <>
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
      {showMiniPlayer && <MiniPlayer />}
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={customDarkTheme}>
        <RootLayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
