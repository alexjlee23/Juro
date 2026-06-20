import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';

interface Props {
  emoji: string;
  label: string;
  onPress: () => void;
}

export default function IssueTile({ emoji, label, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.tile}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    ...shadow.card,
  },
  emoji: { fontSize: 28, marginBottom: spacing.xs },
  label: { ...typography.bodyS, color: colors.text, fontWeight: '600', textAlign: 'center' },
});
