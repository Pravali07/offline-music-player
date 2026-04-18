import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/utils/colors';
import { Spacing } from '@/utils/spacing';

interface PlaybackControlsProps {
  isPlaying: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleRepeat: () => void;
}

export function PlaybackControls({
  isPlaying,
  repeatMode,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleRepeat,
}: PlaybackControlsProps) {
  const repeatIcon = repeatMode === 'one' ? 'repeat.1' : 'repeat';

  return (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.secondaryButton} onPress={onToggleRepeat}>
        <IconSymbol
          name={repeatIcon}
          size={28}
          color={repeatMode === 'off' ? Colors.textSecondary : Colors.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
        <IconSymbol name="backward.fill" size={32} color={Colors.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
        <IconSymbol
          name={isPlaying ? 'pause.fill' : 'play.fill'}
          size={48}
          color={Colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onNext}>
        <IconSymbol name="forward.fill" size={32} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.secondaryButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
