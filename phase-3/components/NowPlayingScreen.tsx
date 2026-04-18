import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PlaybackControls } from '@/components/PlaybackControls';
import { SeekBar } from '@/components/SeekBar';
import { StatusCard } from '@/components/StatusCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Radius, Spacing } from '@/utils/spacing';

const ARTWORK_SIZE = 280;

export function NowPlayingScreen() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    play,
    pause,
    next,
    previous,
    seek,
    repeatMode,
    toggleRepeat,
  } = usePlayerStore();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  const repeatIcon = repeatMode === 'one' ? 'repeat.1' : 'repeat';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" dismissTo>
          <IconSymbol name="chevron.down" size={28} color={Colors.text} />
        </Link>
      </View>

      <View style={styles.content}>
        <View style={styles.artworkContainer}>
          {currentSong?.artwork ? (
            <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <IconSymbol name="music.note" size={80} color={Colors.primary} />
            </View>
          )}
        </View>

        <StatusCard
          title={currentSong?.title || 'Not Playing'}
          subtitle={currentSong?.artist || 'Unknown Artist'}
        />

        <SeekBar position={position} duration={duration} onSeek={handleSeek} />

        <PlaybackControls
          isPlaying={isPlaying}
          repeatMode={repeatMode}
          onPlayPause={handlePlayPause}
          onPrevious={previous}
          onNext={next}
          onToggleRepeat={toggleRepeat}
        />
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
    paddingHorizontal: Spacing.lg,
  },
  artworkContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: Radius.lg,
  },
  artworkPlaceholder: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
