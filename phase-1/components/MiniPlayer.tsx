import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

export function MiniPlayer() {
  const { currentSong, isPlaying } = usePlayerStore();

  if (!currentSong) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Link href="/modal" style={styles.link}>
        <View style={styles.content}>
          <MaterialIcons name="music-note" size={24} color={Colors.primary} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </ThemedText>
          </View>
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={28}
            color={Colors.text}
          />
        </View>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  link: {
    textDecorationLine: 'none',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  artist: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
});
