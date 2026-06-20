import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadow } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    ...shadow.card,
  },
});
