import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing } from '@/utils/spacing';

export default function ModalScreen() {
  const { currentSong } = usePlayerStore();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" dismissTo>
          <IconSymbol name="chevron.right" size={28} color={Colors.text} />
        </Link>
      </View>

      <View style={styles.content}>
        {currentSong ? (
          <>
            <View style={styles.artwork}>
              <IconSymbol name="music.note" size={80} color={Colors.primary} />
            </View>
            <ThemedText style={styles.title}>{currentSong.title}</ThemedText>
            <ThemedText style={styles.artist}>{currentSong.artist}</ThemedText>
          </>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="music.note" size={80} color={Colors.textSecondary} />
            <ThemedText style={styles.emptyText}>No song playing</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Select a song from the library to start playing
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: Spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  artwork: {
    width: 280,
    height: 280,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  artist: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
