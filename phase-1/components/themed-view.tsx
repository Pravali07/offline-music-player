import { View, type ViewProps } from 'react-native';

import { Colors } from '@/utils/colors';

export function ThemedView(props: ViewProps) {
  return <View {...props} style={[{ backgroundColor: Colors.background }, props.style]} />;
}
