import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import IssueTile from '../../components/ui/IssueTile';
import Banner from '../../components/ui/Banner';

const ISSUE_TILES = [
  { emoji: '💰', key: 'unpaidWages', path: '/guided-help/unpaid-wages' },
  { emoji: '🤕', key: 'injury', path: '/guided-help/injury' },
  { emoji: '🚫', key: 'dismissal', path: '/guided-help/dismissal' },
  { emoji: '⚠️', key: 'dangerous', path: '/guided-help/dangerous' },
];

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{lang === 'ko' ? '주리오' : 'Jurio'}</Text>
          <TouchableOpacity
            onPress={() => i18n.changeLanguage(lang === 'ko' ? 'en' : 'ko')}
            style={styles.langToggle}
            accessibilityRole="button"
            accessibilityLabel="Change language"
          >
            <Text style={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{t('home.greeting')}</Text>
          <Text style={styles.greetingSubtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.textCaption}
            returnKeyType="search"
            accessibilityLabel={t('home.searchPlaceholder')}
          />
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/guided-help')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('home.getHelp')}
        >
          <Text style={styles.ctaText}>🙋 {t('home.getHelp')}</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/rights')} accessibilityRole="button">
            <Text style={styles.quickEmoji}>📖</Text>
            <Text style={styles.quickLabel}>{t('home.quickActions.rightsGuide')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/map')} accessibilityRole="button">
            <Text style={styles.quickEmoji}>🗓️</Text>
            <Text style={styles.quickLabel}>{t('home.quickActions.consult')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/map')} accessibilityRole="button">
            <Text style={styles.quickEmoji}>🆘</Text>
            <Text style={styles.quickLabel}>{t('home.quickActions.emergency')}</Text>
          </TouchableOpacity>
        </View>

        {/* Issue Tiles */}
        <Text style={styles.sectionTitle}>{lang === 'ko' ? '어떤 상황인가요?' : 'What\'s your situation?'}</Text>
        <View style={styles.tilesGrid}>
          {ISSUE_TILES.map((tile) => (
            <View key={tile.key} style={styles.tileWrapper}>
              <IssueTile
                emoji={tile.emoji}
                label={t(`home.issues.${tile.key}`)}
                onPress={() => router.push(tile.path as any)}
              />
            </View>
          ))}
        </View>

        {/* Hotlines strip */}
        <View style={styles.hotlineStrip}>
          <Text style={styles.hotlineTitle}>📞 {t('home.hotlines')}</Text>
          <View style={styles.hotlineRow}>
            <View style={styles.hotlineItem}>
              <Text style={styles.hotlineNumber}>1350</Text>
              <Text style={styles.hotlineDesc}>{lang === 'ko' ? '고용노동부' : 'Labor'}</Text>
            </View>
            <View style={styles.hotlineItem}>
              <Text style={styles.hotlineNumber}>1345</Text>
              <Text style={styles.hotlineDesc}>{lang === 'ko' ? '외국인 종합' : 'Migrant'}</Text>
            </View>
            <View style={styles.hotlineItem}>
              <Text style={styles.hotlineNumber}>1644-0644</Text>
              <Text style={styles.hotlineDesc}>{lang === 'ko' ? '외국인력' : 'Foreign worker'}</Text>
            </View>
            <View style={styles.hotlineItem}>
              <Text style={styles.hotlineNumber}>1588-0075</Text>
              <Text style={styles.hotlineDesc}>{lang === 'ko' ? '근로복지공단' : 'COMWEL'}</Text>
            </View>
          </View>
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  appName: { ...typography.headingM, color: colors.brand, fontWeight: '700' },
  langToggle: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  langText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  greeting: { paddingVertical: spacing.lg },
  greetingTitle: { ...typography.headingXL, color: colors.text, fontWeight: '700' },
  greetingSubtitle: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.base,
    minHeight: 48,
  },
  searchLabel: { fontSize: 18, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.bodyM, color: colors.text },
  ctaButton: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginBottom: spacing.base,
    minHeight: 56,
    justifyContent: 'center',
    ...shadow.card,
  },
  ctaText: { ...typography.bodyL, color: colors.white, fontWeight: '700' },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
  },
  quickEmoji: { fontSize: 20, marginBottom: 4 },
  quickLabel: { ...typography.caption, color: colors.text, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tileWrapper: { width: '48%' },
  hotlineStrip: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  hotlineTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  hotlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hotlineItem: { minWidth: '45%' },
  hotlineNumber: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  hotlineDesc: { ...typography.caption, color: colors.textCaption },
});
