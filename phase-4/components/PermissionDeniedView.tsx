import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing } from '@/utils/spacing';

interface PermissionDeniedViewProps {
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  isBlocked: boolean;
  isExpoGo?: boolean;
}

export function PermissionDeniedView({
  onRequestPermission,
  onOpenSettings,
  isBlocked,
  isExpoGo,
}: PermissionDeniedViewProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <IconSymbol name="music.note" size={80} color={Colors.textSecondary} />
        <ThemedText style={styles.title}>
          {isExpoGo ? 'Development Build Required' : 'Music Access Required'}
        </ThemedText>
        <ThemedText style={styles.description}>
          {isExpoGo
            ? 'This app uses expo-media-library which requires a development build on Android. Expo Go does not support media library access.'
            : 'This app needs access to your music library to show and play your songs.'}
        </ThemedText>
        <View style={styles.buttonContainer}>
          {isExpoGo ? (
            <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
              <ThemedText style={styles.buttonText}>Open Settings</ThemedText>
            </TouchableOpacity>
          ) : isBlocked ? (
            <>
              <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
                <ThemedText style={styles.buttonText}>Open Settings</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onRequestPermission}>
                <ThemedText style={styles.secondaryButtonText}>Grant Access</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
                <ThemedText style={styles.buttonText}>Grant Access</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onOpenSettings}>
                <ThemedText style={styles.secondaryButtonText}>Open Settings</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
});
