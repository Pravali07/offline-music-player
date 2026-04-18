import { Platform } from 'react-native';

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fonts: Platform.select({
    ios: {
      sans: 'System',
    },
    android: {
      sans: 'Roboto',
    },
    default: {
      sans: 'System',
    },
  }),
};

export type TypographySizes = keyof typeof Typography.sizes;
export type TypographyWeights = keyof typeof Typography.weights;
