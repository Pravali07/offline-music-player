import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing } from '@/utils/spacing';

export function MiniPlayer() {
  const router = useRouter();
  const { currentSong, isPlaying, play, pause } = usePlayerStore();

  if (!currentSong) {
    return null;
  }

  const handlePress = () => {
    router.push('/modal');
  };

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.info}>
          <IconSymbol name="music.note" size={Spacing.lg} color={Colors.primary} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={Spacing.lg}
            color={Colors.text}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
