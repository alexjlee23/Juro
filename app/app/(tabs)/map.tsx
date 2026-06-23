import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import HotlineCard from '../../components/ui/HotlineCard';
import Banner from '../../components/ui/Banner';
import hotlines from '../../content/hotlines.json';

export default function MapScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('map.title')}</Text>
        <Text style={styles.subtitle}>{t('map.subtitle')}</Text>

        {/* Directory CTA */}
        <TouchableOpacity
          style={styles.directoryCta}
          onPress={() => router.push('/directory')}
          accessibilityRole="button"
        >
          <View style={styles.directoryCtaContent}>
            <Text style={styles.directoryCtaEmoji}>🧑‍⚖️</Text>
            <View style={styles.directoryCtaText}>
              <Text style={styles.directoryCtaTitle}>
                {lang === 'ko' ? '노무사 찾기' : 'Find a 노무사'}
              </Text>
              <Text style={styles.directoryCtaSubtitle}>
                {lang === 'ko' ? '422명 · 지역·전문분야 필터' : '422 attorneys · Filter by region & specialty'}
              </Text>
            </View>
            <Text style={styles.directoryCtaArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapPlaceholderText}>
            {lang === 'ko'
              ? '지도 기능은 곧 추가됩니다.\n아래 전화 상담을 이용하세요.'
              : 'Map feature coming soon.\nUse the hotlines below.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          📞 {t('map.hotlines')} — {t('map.alwaysAvailable')}
        </Text>

        {hotlines.map((h) => (
          <HotlineCard
            key={h.id}
            name={h.name[lang as keyof typeof h.name]}
            number={h.number}
            available={h.available[lang as keyof typeof h.available]}
            languages={h.languages}
          />
        ))}

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },
  mapPlaceholder: {
    backgroundColor: colors.surfaceTint,
    borderRadius: 12,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  mapEmoji: { fontSize: 48, marginBottom: spacing.sm },
  mapPlaceholderText: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  directoryCta: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  directoryCtaContent: { flexDirection: 'row', alignItems: 'center', padding: spacing.base },
  directoryCtaEmoji: { fontSize: 28, marginRight: spacing.md },
  directoryCtaText: { flex: 1 },
  directoryCtaTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  directoryCtaSubtitle: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  directoryCtaArrow: { ...typography.headingM, color: colors.textCaption },
});
