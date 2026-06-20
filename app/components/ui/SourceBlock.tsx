import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Props {
  name: string;
  url?: string;
  updatedDate?: string;
}

export default function SourceBlock({ name, url, updatedDate }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('rights.sourceLabel')}</Text>
      {url ? (
        <TouchableOpacity onPress={() => url && Linking.openURL(url)} accessibilityRole="link">
          <Text style={styles.link}>{name}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.name}>{name}</Text>
      )}
      {updatedDate && (
        <Text style={styles.date}>{t('common.updatedDate', { date: updatedDate })}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.base,
  },
  label: { ...typography.caption, color: colors.textCaption, marginBottom: 2 },
  link: { ...typography.bodyS, color: colors.action, textDecorationLine: 'underline' },
  name: { ...typography.bodyS, color: colors.text },
  date: { ...typography.caption, color: colors.textCaption, marginTop: 4 },
});
