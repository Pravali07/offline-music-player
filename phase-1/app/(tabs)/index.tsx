import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/utils/colors';
import { Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

export default function SongsScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.text}>Songs Tab - Phase 1</ThemedText>
        <ThemedText style={styles.subtext}>
          Songs will be loaded in Phase 2
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  text: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  subtext: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
