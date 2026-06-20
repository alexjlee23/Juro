import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface Props {
  name: string;
  number: string;
  available?: string;
  languages?: string[];
}

export default function HotlineCard({ name, number, available, languages }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.number}>{number}</Text>
        {available && <Text style={styles.meta}>{available}</Text>}
        {languages && languages.length > 1 && (
          <Text style={styles.meta}>🌐 {languages.slice(0, 5).join(' · ')}{languages.length > 5 ? ` +${languages.length - 5}` : ''}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => Linking.openURL(`tel:${number.replace(/-/g, '')}`)}
        accessibilityRole="button"
        accessibilityLabel={`${t('common.callNow')} ${name}`}
      >
        <Text style={styles.callLabel}>📞 {t('common.callNow')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  info: { flex: 1, marginRight: spacing.sm },
  name: { ...typography.bodyS, color: colors.text, fontWeight: '600' },
  number: { ...typography.bodyM, color: colors.action, fontWeight: '700', marginTop: 2 },
  meta: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  callBtn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  callLabel: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
});
