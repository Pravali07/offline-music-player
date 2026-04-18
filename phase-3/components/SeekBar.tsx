import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';
import { Spacing, Radius } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

export function SeekBar({ position, duration, onSeek }: SeekBarProps) {
  const progress = (duration > 0 ? `${(position / duration) * 100}%` : '0%') as DimensionValue;

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: progress }]} />
      </View>
      <View style={styles.timeLabels}>
        <ThemedText style={styles.time}>{formatDuration(position)}</ThemedText>
        <ThemedText style={styles.time}>{formatDuration(duration)}</ThemedText>
      </View>

      <View style={styles.sliderContainer}>
        <TouchableOpacity
          style={styles.sliderTouch}
          onPress={() => onSeek(Math.max(0, position - 10000))}>
          <View style={styles.sliderZone} />
        </TouchableOpacity>
        <View style={styles.currentPosition}>
          <View style={[styles.positionIndicator, { left: progress }]} />
        </View>
        <TouchableOpacity
          style={styles.sliderTouch}
          onPress={() => onSeek(Math.min(duration, position + 10000))}>
          <View style={styles.sliderZone} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
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
});
