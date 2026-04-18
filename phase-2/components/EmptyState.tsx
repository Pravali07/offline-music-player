import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing } from '@/utils/spacing';

interface EmptyStateProps {
  icon?: 'music.note';
  title: string;
  description?: string;
}

const ICON_SIZE = Spacing['3xl'];

export function EmptyState({ icon = 'music.note', title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name={icon} size={ICON_SIZE} color={Colors.textSecondary} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.5,
  },
});
