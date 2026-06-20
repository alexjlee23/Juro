import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function Banner() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚖️ {t('common.disclaimer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.infoBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
