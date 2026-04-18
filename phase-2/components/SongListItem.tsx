import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing, Radius } from '@/utils/spacing';
import { formatDuration } from '@/utils/formatters';
import type { Song } from '@/types';

interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
}

const ARTWORK_SIZE = Spacing['2xl'];
const ARTWORK_SIZE_SM = Spacing['3xl'];

export function SongListItem({ song, isPlaying, onPress, onLongPress }: SongListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
      activeOpacity={0.7}>
      <View style={styles.artwork}>
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.artworkImage} />
        ) : (
          <IconSymbol name="music.note" size={Spacing.lg} color={Colors.textSecondary} />
        )}
      </View>
      <View style={styles.info}>
        <ThemedText
          style={[styles.title, isPlaying && styles.playingText]}
          numberOfLines={1}>
          {song.title}
        </ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={1}>
          {song.artist} • {formatDuration(song.duration)}
        </ThemedText>
      </View>
      <IconSymbol
        name={isPlaying ? 'pause.fill' : 'play.fill'}
        size={Spacing.lg}
        color={isPlaying ? Colors.primary : Colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artworkImage: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  playingText: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
