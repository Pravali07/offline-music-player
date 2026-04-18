import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { SongOptionsModal } from '@/components/SongOptionsModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLibraryStore, usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';
import { Radius, Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

const ARTWORK_SIZE = 280;

export default function NowPlayingScreen() {
  const [showOptions, setShowOptions] = useState(false);
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
    shuffleEnabled,
    toggleShuffle,
    playNext,
    addToQueue,
  } = usePlayerStore();
  const { isLiked, toggleLike } = useLibraryStore();

  const liked = currentSong ? isLiked(currentSong.id) : false;

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

  const repeatLabel =
    repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One';

  const repeatIcon = repeatMode === 'one' ? 'repeat.1' : 'repeat';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" dismissTo>
          <IconSymbol name="chevron.down" size={28} color={Colors.text} />
        </Link>
        {currentSong ? (
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowOptions(true)}>
            <IconSymbol name="ellipsis" size={28} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
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

        <View style={styles.info}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {currentSong?.title || 'Not Playing'}
          </ThemedText>
          <ThemedText style={styles.artist} numberOfLines={1}>
            {currentSong?.artist || 'Unknown Artist'}
          </ThemedText>
          {currentSong && (
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => toggleLike(currentSong.id)}>
              <IconSymbol
                name={liked ? 'heart.fill' : 'heart'}
                size={24}
                color={liked ? Colors.primary : Colors.textSecondary}
              />
              <ThemedText style={styles.likeLabel}>
                {liked ? 'Liked' : 'Like'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
              ]}
            />
          </View>
          <View style={styles.timeLabels}>
            <ThemedText style={styles.time}>{formatDuration(position)}</ThemedText>
            <ThemedText style={styles.time}>{formatDuration(duration)}</ThemedText>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={styles.sliderTouch}
            onPress={() => handleSeek(Math.max(0, position - 10000))}>
            <View style={styles.sliderZone} />
          </TouchableOpacity>
          <View style={styles.currentPosition}>
            <View
              style={[
                styles.positionIndicator,
                { left: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.sliderTouch}
            onPress={() => handleSeek(Math.min(duration, position + 10000))}>
            <View style={styles.sliderZone} />
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity style={styles.modeButton} onPress={toggleShuffle}>
            <IconSymbol
              name="shuffle"
              size={22}
              color={shuffleEnabled ? Colors.primary : Colors.textSecondary}
            />
            <ThemedText style={styles.modeButtonText}>
              Shuffle {shuffleEnabled ? 'On' : 'Off'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeButton} onPress={toggleRepeat}>
            <IconSymbol
              name={repeatIcon}
              size={22}
              color={repeatMode === 'off' ? Colors.textSecondary : Colors.primary}
            />
            <ThemedText style={styles.modeButtonText}>Repeat {repeatLabel}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={previous}>
            <IconSymbol name="backward.fill" size={32} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <IconSymbol
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={48}
              color={Colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={next}>
            <IconSymbol name="forward.fill" size={32} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <SongOptionsModal
        visible={showOptions}
        song={currentSong}
        onClose={() => setShowOptions(false)}
        onPlayNow={() => currentSong && play()}
        onPlayNext={(song) => playNext(song.id)}
        onAddToQueue={(song) => addToQueue(song.id)}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  info: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
  },
  likeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  time: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    marginBottom: Spacing.lg,
  },
  sliderTouch: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  sliderZone: {
    height: 40,
  },
  currentPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: -1,
  },
  positionIndicator: {
    position: 'absolute',
    top: -18,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginLeft: -6,
  },
  modeRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
  },
  modeButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
