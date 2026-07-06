import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../constants/theme';

/** Fixed brand bar shown at the top of every tab: logo + wordmark + language toggle. */
export default function BrandHeader() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          accessibilityLabel="Jurio logo"
        />
        <Text style={styles.appName}>{lang === 'ko' ? '주리오' : 'Jurio'}</Text>
      </View>
      <TouchableOpacity
        onPress={() => i18n.changeLanguage(lang === 'ko' ? 'en' : 'ko')}
        style={styles.langToggle}
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text style={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 30, height: 30 },
  appName: { ...typography.headingM, color: colors.brand, fontWeight: '700' },
  langToggle: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  langText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
