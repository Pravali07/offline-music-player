export const Colors = {
  background: '#0D0D0F',
  surface: '#1A1A1F',
  surfaceMuted: '#23232B',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  primary: '#6366F1',
  border: '#2D2D35',
  error: '#EF4444',
  overlay: 'rgba(0, 0, 0, 0.7)',
  success: '#22C55E',
} as const;

export type ColorKeys = keyof typeof Colors;
