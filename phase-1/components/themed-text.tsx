import { Text, type TextProps } from 'react-native';

import { Colors } from '@/utils/colors';

export function ThemedText(props: TextProps) {
  return <Text {...props} style={[{ color: Colors.text }, props.style]} />;
}
