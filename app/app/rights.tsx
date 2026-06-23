import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

const RIGHTS_TOPICS = [
  {
    id: 'unpaid-wages',
    emoji: '💰',
    ko: '임금을 못 받았어요',
    en: 'Unpaid wages',
    factKo: '사용자는 매월 정해진 날에 전액을 직접 지급해야 합니다. 3년 이내 청구 가능.',
    factEn: 'Employer must pay in full on the agreed date. You have 3 years to claim.',
    statute: '근로기준법 제43·36·49조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: false,
    migrant: true,
  },
  {
    id: 'minimum-wage',
    emoji: '💵',
    ko: '최저임금',
    en: 'Minimum wage',
    factKo: '2026년: 시간당 ₩10,320 (월 ₩2,156,880 기준). 외국인 포함 모든 근로자에게 적용.',
    factEn: '2026: ₩10,320/hr (≈₩2,156,880/month). Applies to all workers including foreign nationals.',
    statute: '최저임금법',
    url: 'https://www.minimumwage.go.kr',
    flag5: true,
    migrant: true,
  },
  {
    id: 'contract',
    emoji: '📋',
    ko: '근로계약서',
    en: 'Employment contract',
    factKo: '서면으로 작성·교부해야 합니다. 미교부 시 500만원 이하 과태료 (제114조).',
    factEn: 'Must be written and given to the worker. Penalty up to ₩5M for non-compliance.',
    statute: '근로기준법 제17조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'overtime',
    emoji: '⏰',
    ko: '연장·야간·휴일 수당',
    en: 'Overtime & premium pay',
    factKo: '연장·야간(22:00~06:00)·휴일 근로는 통상임금의 +50% 가산. 8시간 초과 휴일 근로는 +100%.',
    factEn: 'Overtime, night (22:00–06:00), and holiday work each earn +50%. Holiday >8h = +100%.',
    statute: '근로기준법 제56조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: false,
    migrant: false,
  },
  {
    id: 'weekly-holiday',
    emoji: '📅',
    ko: '주휴수당',
    en: 'Weekly holiday pay',
    factKo: '주 15시간 이상 근무하고 소정 근로일을 모두 채운 경우, 1일분 유급 휴일 지급.',
    factEn: 'Working 15+ hours/week and meeting your scheduled days earns 1 paid rest day.',
    statute: '근로기준법 제55조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: true,
    migrant: false,
  },
  {
    id: 'annual-leave',
    emoji: '🌴',
    ko: '연차휴가',
    en: 'Annual leave',
    factKo: '1년 이상 근무(출근율 80% 이상)→15일. 1년 미만→매월 1일 (최대 11일). 상한 25일.',
    factEn: '1+ year (80%+ attendance) → 15 days. Under 1 year → 1 day/month (max 11). Cap: 25 days.',
    statute: '근로기준법 제60조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: false,
    migrant: false,
  },
  {
    id: 'severance',
    emoji: '💼',
    ko: '퇴직금',
    en: 'Severance pay',
    factKo: '1년 이상 근무 시 평균임금 30일분 이상. 퇴직일로부터 14일 내 지급, 3년 청구 기한.',
    factEn: '1+ year → 30+ days avg wage. Must be paid within 14 days of leaving. 3-year claim limit.',
    statute: '근로자퇴직급여보장법 제8·9·10조',
    url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'dismissal-notice',
    emoji: '📣',
    ko: '해고 예고',
    en: 'Dismissal notice',
    factKo: '30일 이전에 예고하거나, 30일분 이상의 통상임금을 지급해야 합니다.',
    factEn: 'Employer must give 30 days notice or pay 30 days ordinary wage.',
    statute: '근로기준법 제26조',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: true,
    migrant: false,
  },
  {
    id: 'unfair-dismissal',
    emoji: '🏛️',
    ko: '부당해고 구제',
    en: 'Unfair dismissal remedy',
    factKo: '해고일로부터 3개월 내 노동위원회에 구제 신청 가능. 서면 통보 없는 해고는 무효.',
    factEn: 'Apply to the Labor Relations Commission within 3 months of dismissal. Verbal dismissal is void.',
    statute: '근로기준법 제23·27·28조',
    url: 'https://www.nlrc.go.kr',
    flag5: false,
    migrant: false,
  },
  {
    id: 'harassment',
    emoji: '🛑',
    ko: '직장 내 괴롭힘',
    en: 'Workplace harassment',
    factKo: '사용자는 신고를 받으면 즉시 조사하고 피해자를 보호해야 합니다. 보복 금지.',
    factEn: 'Employer must investigate immediately and protect the victim. Retaliation is prohibited.',
    statute: '근로기준법 제76조의2·3',
    url: 'https://www.law.go.kr/법령/근로기준법',
    flag5: false,
    migrant: true,
  },
  {
    id: 'industrial-accident',
    emoji: '🏥',
    ko: '산업재해 (산재)',
    en: 'Industrial accident',
    factKo: '업무상 부상·질병은 근로복지공단(COMWEL)에 산재 보험 급여를 신청하세요. 국적 무관 적용.',
    factEn: 'File for workers compensation with COMWEL for work-related injuries. Applies regardless of nationality.',
    statute: '산업재해보상보험법',
    url: 'https://www.comwel.or.kr',
    flag5: true,
    migrant: true,
  },
  {
    id: 'safety',
    emoji: '⛑️',
    ko: '작업중지권 · 산업안전',
    en: 'Right to refuse dangerous work',
    factKo: '급박한 위험이 있을 때 작업을 중지하고 대피할 권리가 있습니다 (산안법 제52조).',
    factEn: 'Workers have the right to stop work and evacuate in imminent danger (IOSHA §52).',
    statute: '산업안전보건법 제52조',
    url: 'https://www.law.go.kr/법령/산업안전보건법',
    flag5: true,
    migrant: true,
  },
];

export default function RightsScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{lang === 'ko' ? '권리 가이드' : 'Rights Guide'}</Text>
        <Text style={styles.subtitle}>
          {lang === 'ko'
            ? '한국 노동법 핵심 정보 · 출처: law.go.kr'
            : 'Key Korean labor law · Source: law.go.kr'}
        </Text>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendBadge}>5인 미만</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '5인 미만 사업장도 적용' : 'Applies at <5-person workplaces'}</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendBadgeMigrant}>외국인</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '외국인 노동자 주요 항목' : 'Key for migrant workers'}</Text>
          </View>
        </View>

        {RIGHTS_TOPICS.map((topic) => (
          <View key={topic.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{topic.emoji}</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{lang === 'ko' ? topic.ko : topic.en}</Text>
                <View style={styles.badges}>
                  {topic.flag5 && <Text style={styles.badge5}>5인 미만 ✓</Text>}
                  {topic.migrant && <Text style={styles.badgeMigrant}>외국인 ✓</Text>}
                </View>
              </View>
            </View>

            <Text style={styles.fact}>{lang === 'ko' ? topic.factKo : topic.factEn}</Text>

            <TouchableOpacity
              style={styles.sourceRow}
              onPress={() => Linking.openURL(topic.url)}
              accessibilityRole="link"
            >
              <Text style={styles.sourceText}>📜 {topic.statute}</Text>
              <Text style={styles.sourceLinkText}>{lang === 'ko' ? '원문 보기 →' : 'View source →'}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.callToAction}>
          <Text style={styles.ctaTitle}>{lang === 'ko' ? '내 상황에 맞는 도움 받기' : 'Get help for your specific situation'}</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/guided-help' as any)} accessibilityRole="button">
            <Text style={styles.ctaBtnText}>{lang === 'ko' ? '상황별 안내 시작하기 →' : 'Start guided help →'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaBtnSecondary} onPress={() => router.push('/directory')} accessibilityRole="button">
            <Text style={styles.ctaBtnSecondaryText}>{lang === 'ko' ? '노무사 찾기 →' : 'Find a 노무사 →'}</Text>
          </TouchableOpacity>
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.base },
  legend: { flexDirection: 'row', gap: spacing.base, marginBottom: spacing.lg, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendBadge: { ...typography.caption, color: colors.warning, backgroundColor: '#FEF3C7', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendBadgeMigrant: { ...typography.caption, color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendText: { ...typography.caption, color: colors.textCaption },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.sm, ...shadow.card },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardEmoji: { fontSize: 24, marginRight: spacing.md, marginTop: 2 },
  cardHeaderText: { flex: 1 },
  cardTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  badge5: { ...typography.caption, color: colors.warning, backgroundColor: '#FEF3C7', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 1, fontWeight: '600' },
  badgeMigrant: { ...typography.caption, color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 1, fontWeight: '600' },
  fact: { ...typography.bodyS, color: colors.text, lineHeight: 22, marginBottom: spacing.sm },
  sourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border },
  sourceText: { ...typography.caption, color: colors.textCaption, flex: 1 },
  sourceLinkText: { ...typography.caption, color: colors.action, fontWeight: '600' },
  callToAction: { backgroundColor: colors.selectedBg, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base },
  ctaTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  ctaBtn: { backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  ctaBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  ctaBtnSecondary: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.action },
  ctaBtnSecondaryText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
});
