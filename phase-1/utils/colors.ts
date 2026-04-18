export const Colors = {
  background: '#0D0D0F',
  surface: '#1A1A1F',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  primary: '#6366F1',
  border: '#2D2D35',
  error: '#EF4444',
} as const;

export type ColorKeys = keyof typeof Colors;
