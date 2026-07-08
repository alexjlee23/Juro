import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, Linking, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import BrandHeader from '../../components/ui/BrandHeader';
import { useConfig } from '../../lib/useConfig';
import directoryData from '../../content/directory.json';
import { detectNearbyRegion } from '../../lib/locationRegion';

const SPECIALIZATIONS = [
  { id: 'unpaid_wages', ko: '임금체불', en: 'Unpaid Wages' },
  { id: 'unfair_dismissal', ko: '부당해고', en: 'Unfair Dismissal' },
  { id: 'harassment', ko: '괴롭힘', en: 'Harassment' },
  { id: 'industrial_accident', ko: '산업재해', en: 'Industrial Accident' },
  { id: 'hr_labor', ko: '인사노무', en: 'HR & Labor' },
  { id: 'safety', ko: '산업안전', en: 'Safety' },
];

const SITUATIONS = [
  { id: 'unpaid-wages', emoji: '💰', ko: '임금 못 받음', en: "Wasn't paid" },
  { id: 'injury', emoji: '🤕', ko: '일하다 다쳤어요', en: 'Injured at work' },
  { id: 'dismissal', emoji: '🚫', ko: '해고됐어요', en: 'I was fired' },
  { id: 'dangerous', emoji: '⚠️', ko: '위험한 일', en: 'Dangerous work' },
  { id: 'contract', emoji: '📄', ko: '계약이 이상해요', en: 'Contract issue' },
  { id: 'visa-threat', emoji: '🛂', ko: '비자 협박', en: 'Visa threat' },
];

const QUICK_HOTLINES = [
  { number: '1350', dialNumber: '1350', ko: '고용노동부', en: 'Labor Ministry' },
  { number: '1345', dialNumber: '1345', ko: '외국인 종합', en: 'Immigration 24h' },
  { number: '1644-0644', dialNumber: '16440644', ko: '외국인력', en: 'Foreign worker' },
  { number: '1588-0075', dialNumber: '15880075', ko: 'COMWEL', en: 'COMWEL' },
];

function NomusaCard({ d, lang }: { d: any; lang: 'ko' | 'en' }) {
  return (
    <View style={styles.nomusaCard}>
      <View style={styles.nomusaCardInfo}>
        <Text style={styles.nomusaName}>{d.name[lang === 'ko' ? 'ko' : 'en']}</Text>
        <Text style={styles.nomusaAffil}>{d.affiliation[lang === 'ko' ? 'ko' : 'en']}</Text>
        <Text style={styles.nomusaRegion}>📍 {d.region[lang === 'ko' ? 'ko' : 'en']}</Text>
      </View>
      {d.kcplaaUrl && (
        <TouchableOpacity
          style={styles.nomusaLinkBtn}
          onPress={() => Linking.openURL(d.kcplaaUrl)}
          accessibilityRole="link"
          accessibilityLabel={lang === 'ko' ? `${d.name.ko} 프로필 보기` : `View ${d.name.en}'s profile`}
        >
          <Text style={styles.nomusaLinkIcon}>🔗</Text>
          <Text style={styles.nomusaLinkLabel}>{lang === 'ko' ? '정보' : 'Info'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.nomusaCallBtn}
        onPress={() => Linking.openURL(`tel:${d.phone.replace(/-/g, '')}`)}
        accessibilityRole="button"
        accessibilityLabel={lang === 'ko' ? `${d.name.ko}에게 전화` : `Call ${d.name.en}`}
      >
        <Text style={styles.nomusaCallIcon}>📞</Text>
        <Text style={styles.nomusaCallLabel}>{lang === 'ko' ? '전화' : 'Call'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const [nomusaQuery, setNomusaQuery] = useState('');
  const [nomusaRegion, setNomusaRegion] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { minWageYear, minWageHourly, minWageMonthly } = useConfig();
  const nomusaCount = (directoryData as any[]).length;

  async function handleLocate() {
    setLocating(true);
    try {
      const region = await detectNearbyRegion();
      if (region) {
        setNomusaRegion(region);
        setNomusaQuery('');
      }
    } finally {
      setLocating(false);
    }
  }

  // 노무사 results for the home widget (always-visible inline search)
  const nomusaWidgetResults = useMemo(() => {
    const q = nomusaQuery.trim().toLowerCase();
    let list = directoryData as any[];
    if (nomusaRegion) list = list.filter(d => d.region.ko === nomusaRegion);
    if (!q) return list.slice(0, 4);
    return list.filter(d =>
      d.name.ko.includes(q) ||
      d.name.en.toLowerCase().includes(q) ||
      d.affiliation.ko.includes(q) ||
      d.region.ko.includes(q) ||
      d.specializations.some((s: string) => {
        const spec = SPECIALIZATIONS.find(x => x.id === s);
        return spec && (spec.ko.includes(q) || spec.en.toLowerCase().includes(q));
      })
    );
  }, [nomusaQuery, nomusaRegion]);

  return (
    <SafeAreaView style={styles.safe}>
      <BrandHeader />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{lang === 'ko' ? '무슨 일이 있나요?' : "What's happening?"}</Text>
          <Text style={styles.greetingSubtitle}>
            {lang === 'ko'
              ? '아래에서 공인노무사를 찾거나, 상황을 골라 단계별 안내를 받으세요.'
              : 'Find a certified labor attorney below, or pick your situation for step-by-step guidance.'}
          </Text>
        </View>

        {/* Trust promise */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustText}>
            🔒 {lang === 'ko'
              ? '신고하지 않습니다 · 신분증·비자번호 묻지 않습니다'
              : 'We never report you · Never ask for your ID or visa'}
          </Text>
        </View>

        {/* Emergency call strip */}
        <TouchableOpacity
          style={styles.emergencyStrip}
          onPress={() => Linking.openURL('tel:1350')}
          accessibilityRole="button"
        >
          <View style={styles.emergencyLeft}>
            <Text style={styles.emergencyBadge}>{lang === 'ko' ? '지금 전화' : 'Call now'}</Text>
            <Text style={styles.emergencyNumber}>📞 1350</Text>
          </View>
          <Text style={styles.emergencyDesc}>
            {lang === 'ko' ? '고용노동부 · 모든 노동 상담\n무료 · 탭하면 바로 연결' : 'Labor Ministry · All work issues\nFree · Tap to call directly'}
          </Text>
        </TouchableOpacity>

        {/* Today's info — current minimum wage */}
        <TouchableOpacity
          style={styles.minWageCard}
          onPress={() => router.push('/rights')}
          activeOpacity={0.75}
          accessibilityRole="button"
        >
          <View style={styles.minWageLeft}>
            <Text style={styles.minWageLabel}>
              {lang === 'ko' ? `${minWageYear}년 최저임금` : `${minWageYear} minimum wage`}
            </Text>
            <Text style={styles.minWageValue}>₩{minWageHourly.toLocaleString()}<Text style={styles.minWageUnit}>{lang === 'ko' ? ' /시간' : ' /hour'}</Text></Text>
          </View>
          <View style={styles.minWageRight}>
            <Text style={styles.minWageMonthly}>
              {lang === 'ko'
                ? `월 ₩${minWageMonthly.toLocaleString()} (209시간 기준)`
                : `≈ ₩${minWageMonthly.toLocaleString()} /month (209h)`}
            </Text>
            <Text style={styles.minWageLink}>{lang === 'ko' ? '권리 가이드 보기 →' : 'See rights guide →'}</Text>
          </View>
        </TouchableOpacity>

        {/* 노무사 inline search widget */}
        <View style={styles.nomusaWidget}>
          <View style={styles.nomusaWidgetHeader}>
            <Text style={styles.nomusaWidgetTitle} numberOfLines={1}>🧑‍⚖️ {lang === 'ko' ? '공인노무사 찾기' : 'Find a Labor Attorney'}</Text>
            <TouchableOpacity onPress={() => router.push('/directory')}>
              <Text style={styles.nomusaSeeAll}>{lang === 'ko' ? `전체 ${nomusaCount}명 →` : `All ${nomusaCount} →`}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nomusaWidgetSearch}>
            <Text style={styles.nomusaWidgetSearchIcon}>🔍</Text>
            <TextInput
              style={styles.nomusaWidgetInput}
              placeholder={lang === 'ko' ? '이름, 지역, 전문분야...' : 'Name, region, specialty...'}
              placeholderTextColor={colors.textCaption}
              value={nomusaQuery}
              onChangeText={setNomusaQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {nomusaQuery.length > 0 && (
              <TouchableOpacity onPress={() => setNomusaQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.nomusaWidgetClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Location filter row */}
          <View style={styles.nomusaLocRow}>
            {nomusaRegion ? (
              <TouchableOpacity style={styles.nomusaLocChip} onPress={() => setNomusaRegion(null)}>
                <Text style={styles.nomusaLocChipText}>📍 {nomusaRegion}</Text>
                <Text style={styles.nomusaLocChipX}>  ✕</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nomusaLocBtn} onPress={handleLocate} disabled={locating}>
                {locating
                  ? <ActivityIndicator size="small" color={colors.action} />
                  : <Text style={styles.nomusaLocBtnText}>📍 {lang === 'ko' ? '내 주변' : 'Near me'}</Text>
                }
              </TouchableOpacity>
            )}
          </View>

          {nomusaWidgetResults.map((d: any) => <NomusaCard key={d.id} d={d} lang={lang} />)}
          {nomusaWidgetResults.length === 0 && (
            <Text style={styles.nomusaEmpty}>{lang === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}</Text>
          )}
        </View>

        {/* Quick links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/rights')} accessibilityRole="button">
            <Text style={styles.quickLinkEmoji}>📖</Text>
            <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '권리 가이드' : 'Rights guide'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/tools' as any)} accessibilityRole="button">
            <Text style={styles.quickLinkEmoji}>🧮</Text>
            <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '계산기 모음' : 'Calculators'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/glossary' as any)} accessibilityRole="button">
            <Text style={styles.quickLinkEmoji}>📚</Text>
            <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '용어사전' : 'Glossary'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/migrant-hub' as any)} accessibilityRole="button">
            <Text style={styles.quickLinkEmoji}>🌏</Text>
            <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '외국인 노동자' : 'Migrant workers'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/map')} accessibilityRole="button">
            <Text style={styles.quickLinkEmoji}>📞</Text>
            <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '상담 전화' : 'Hotlines'}</Text>
          </TouchableOpacity>
        </View>

        {/* Situation tiles */}
        <Text style={styles.sectionTitle}>{lang === 'ko' ? '어떤 상황인가요?' : "What's your situation?"}</Text>

        <View style={styles.tilesGrid}>
          {SITUATIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.tile}
              onPress={() => router.push(`/guided-help/${s.id}` as any)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={lang === 'ko' ? s.ko : s.en}
            >
              <Text style={styles.tileEmoji}>{s.emoji}</Text>
              <Text style={styles.tileLabel} numberOfLines={2}>{lang === 'ko' ? s.ko : s.en}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tappable hotlines */}
        <Text style={styles.hotlineTitle}>{lang === 'ko' ? '주요 상담 전화 · 탭하면 바로 전화' : 'Tap to call'}</Text>
        <View style={styles.hotlineGrid}>
          {QUICK_HOTLINES.map((h) => (
            <TouchableOpacity
              key={h.number}
              style={styles.hotlineCard}
              onPress={() => Linking.openURL(`tel:${h.dialNumber}`)}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <Text style={styles.hotlineNumber}>{h.number}</Text>
              <Text style={styles.hotlineDesc}>{lang === 'ko' ? h.ko : h.en}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  // Home content
  homeContent: { paddingHorizontal: spacing.base },
  greeting: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  greetingTitle: { ...typography.headingXL, color: colors.text, fontWeight: '700' },
  greetingSubtitle: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 22 },

  emergencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  emergencyLeft: { alignItems: 'flex-start' },
  emergencyBadge: { ...typography.caption, color: colors.warningFill, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  emergencyNumber: { ...typography.headingM, color: colors.white, fontWeight: '700' },
  emergencyDesc: { ...typography.bodyS, color: '#94A3B8', flex: 1, lineHeight: 20 },

  trustBanner: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  trustText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },

  // 노무사 inline search widget on home page
  nomusaWidget: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.brand,
    ...shadow.card,
  },
  nomusaWidgetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.sm },
  nomusaWidgetTitle: { ...typography.bodyM, color: colors.brand, fontWeight: '700', flex: 1 },
  nomusaSeeAll: { ...typography.bodyS, color: colors.action, fontWeight: '600', flexShrink: 0 },
  nomusaWidgetSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 40,
  },
  nomusaWidgetSearchIcon: { fontSize: 14, marginRight: spacing.xs },
  nomusaWidgetInput: { flex: 1, ...typography.bodyS, lineHeight: undefined, color: colors.text },
  nomusaWidgetClear: { ...typography.bodyS, color: colors.textCaption, paddingLeft: spacing.xs },
  nomusaEmpty: { ...typography.bodyS, color: colors.textCaption, textAlign: 'center', paddingVertical: spacing.sm },
  nomusaLocRow: { flexDirection: 'row', marginBottom: spacing.xs },
  nomusaLocBtn: { backgroundColor: colors.selectedBg, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.brand, minWidth: 90, alignItems: 'center' },
  nomusaLocBtnText: { ...typography.caption, color: colors.action, fontWeight: '700' },
  nomusaLocChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  nomusaLocChipText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  nomusaLocChipX: { ...typography.caption, color: 'rgba(255,255,255,0.75)' },

  // 노무사 card in the home widget
  nomusaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nomusaCardInfo: { flex: 1 },
  nomusaName: { ...typography.bodyS, color: colors.text, fontWeight: '700' },
  nomusaAffil: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  nomusaRegion: { ...typography.caption, color: colors.textCaption, marginTop: 1 },
  nomusaLinkBtn: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 52,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nomusaLinkIcon: { fontSize: 14 },
  nomusaLinkLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginTop: 1 },
  nomusaCallBtn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 52,
  },
  nomusaCallIcon: { fontSize: 14 },
  nomusaCallLabel: { ...typography.caption, color: colors.white, fontWeight: '700', marginTop: 1 },

  sectionTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'flex-start',
    ...shadow.card,
    minHeight: 88,
  },
  tileEmoji: { fontSize: 28, marginBottom: spacing.xs },
  tileLabel: { ...typography.bodyS, color: colors.text, fontWeight: '600', lineHeight: 20 },

  minWageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    ...shadow.card,
  },
  minWageLeft: {},
  minWageLabel: { ...typography.caption, color: colors.textCaption, fontWeight: '700', marginBottom: 2 },
  minWageValue: { ...typography.headingM, color: colors.text, fontWeight: '700' },
  minWageUnit: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '400' },
  minWageRight: { alignItems: 'flex-end', flexShrink: 1 },
  minWageMonthly: { ...typography.caption, color: colors.textSecondary, marginBottom: 2, textAlign: 'right' },
  minWageLink: { ...typography.caption, color: colors.action, fontWeight: '700' },

  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  quickLink: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
    minHeight: 64,
    justifyContent: 'center',
  },
  quickLinkEmoji: { fontSize: 22, marginBottom: 4 },
  quickLinkLabel: { ...typography.caption, color: colors.text, fontWeight: '600', textAlign: 'center' },

  hotlineTitle: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', marginBottom: spacing.sm },
  hotlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  hotlineCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  hotlineNumber: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  hotlineDesc: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
});
