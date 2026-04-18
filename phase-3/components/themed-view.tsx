import { View, type ViewProps } from 'react-native';

import { Colors } from '@/utils/colors';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  return <View style={[{ backgroundColor: Colors.background }, style]} {...otherProps} />;
}