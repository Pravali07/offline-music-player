import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/utils/colors';
import { Radius, Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

interface StatusCardProps {
  title: string;
  subtitle: string;
}

export function StatusCard({ title, subtitle }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.title} numberOfLines={1}>
        {title}
      </ThemedText>
      <ThemedText style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
