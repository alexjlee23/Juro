import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import { useConfig } from '../lib/useConfig';

// lawDateKey maps each topic to the app_config key for its amendment date
const RIGHTS_TOPICS = [
  {
    id: 'unpaid-wages',
    emoji: '💰',
    ko: '임금 미지급',
    en: 'Unpaid wages',
    summaryKo: '사용자는 매월 정해진 날에 전액을 직접 지급해야 합니다. 미지급 시 3년 이하 징역 또는 3,000만원 이하 벌금. 퇴직 후에도 3년 이내 청구 가능.',
    summaryEn: 'Employer must pay in full on the agreed date. Penalty up to 3 years prison or ₩30M fine. Claims valid for 3 years after leaving.',
    statute: '근로기준법 43·36·49조',
    url: 'https://www.law.go.kr/법령/근로기준법/제43조',
    lawDateKey: '근로기준법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'minimum-wage',
    emoji: '💵',
    ko: '최저임금',
    en: 'Minimum wage',
    summaryKo: '', // filled dynamically from useConfig
    summaryEn: '',
    statute: '최저임금법',
    url: 'https://www.minimumwage.go.kr',
    lawDateKey: '최저임금법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'contract',
    emoji: '📋',
    ko: '근로계약서',
    en: 'Employment contract',
    summaryKo: '서면으로 작성하고 반드시 근로자에게 교부해야 합니다. 미교부 시 500만원 이하 과태료. 임금·근무시간·휴일·연차 반드시 명시.',
    summaryEn: 'Must be written and given to the worker. Penalty up to ₩5M for not providing. Must state wages, hours, rest days, and annual leave.',
    statute: '근로기준법 17조',
    url: 'https://www.law.go.kr/법령/근로기준법/제17조',
    lawDateKey: '근로기준법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'overtime',
    emoji: '⏰',
    ko: '연장·야간·휴일 수당',
    en: 'Overtime & premium pay',
    summaryKo: '연장·야간(22~06시)·휴일 근로는 통상임금의 +50%. 8시간 초과 휴일 근로는 +100%. 5인 미만 사업장은 가산임금 미적용.',
    summaryEn: 'Overtime, night (22:00–06:00), and holiday each earn +50%. Holiday >8h = +100%. Premiums do NOT apply at <5-person workplaces.',
    statute: '근로기준법 56조',
    url: 'https://www.law.go.kr/법령/근로기준법/제56조',
    lawDateKey: '근로기준법',
    flag5: false,
    migrant: false,
  },
  {
    id: 'weekly-holiday',
    emoji: '📅',
    ko: '주휴수당',
    en: 'Weekly holiday pay',
    summaryKo: '주 15시간 이상 근무하고 소정 근로일을 모두 채우면 1일분 유급 휴일 지급. 아르바이트·단기 근로자도 포함. 미지급 시 청구 가능.',
    summaryEn: 'Work 15+ hours/week and meet scheduled days → 1 paid rest day. Applies to part-time and short-term workers too.',
    statute: '근로기준법 55조',
    url: 'https://www.law.go.kr/법령/근로기준법/제55조',
    lawDateKey: '근로기준법',
    flag5: true,
    migrant: false,
  },
  {
    id: 'annual-leave',
    emoji: '🌴',
    ko: '연차휴가',
    en: 'Annual leave',
    summaryKo: '1년 이상 근무(출근율 80% 이상) → 15일. 1년 미만 → 매월 1일 (최대 11일). 상한 25일. 미사용 연차는 수당으로 지급.',
    summaryEn: '1+ year (80%+ attendance) → 15 days. Under 1 year → 1 day/month (max 11). Cap: 25 days. Unused leave must be paid out.',
    statute: '근로기준법 60조',
    url: 'https://www.law.go.kr/법령/근로기준법/제60조',
    lawDateKey: '근로기준법',
    flag5: false,
    migrant: false,
  },
  {
    id: 'severance',
    emoji: '💼',
    ko: '퇴직금',
    en: 'Severance pay',
    summaryKo: '1년 이상 근무 시 평균임금 30일분 이상. 퇴직일로부터 14일 내 지급 의무. 3년 이내 청구 가능. 5인 미만 사업장도 적용.',
    summaryEn: '1+ year → 30+ days avg wage. Must be paid within 14 days of leaving. Claim within 3 years. Applies at <5-person workplaces.',
    statute: '퇴직급여법 8·9·10조',
    url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법/제8조',
    lawDateKey: '근로자퇴직급여보장법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'dismissal-notice',
    emoji: '📣',
    ko: '해고 예고',
    en: 'Dismissal notice',
    summaryKo: '30일 이전에 예고하거나, 30일분 이상의 통상임금을 지급해야 합니다. 구두 해고는 무효. 서면 통보 필수.',
    summaryEn: 'Must give 30 days notice or pay 30 days ordinary wage. Verbal dismissal is void. Written notice is required.',
    statute: '근로기준법 26조',
    url: 'https://www.law.go.kr/법령/근로기준법/제26조',
    lawDateKey: '근로기준법',
    flag5: true,
    migrant: false,
  },
  {
    id: 'unfair-dismissal',
    emoji: '🏛️',
    ko: '부당해고 구제',
    en: 'Unfair dismissal',
    summaryKo: '해고일로부터 3개월 내 노동위원회에 구제 신청 가능. 서면 통보 없는 해고는 무효. 5인 이상 사업장에 적용.',
    summaryEn: 'Apply to the Labor Relations Commission within 3 months of dismissal. Verbal dismissal is void. Applies at 5+ person workplaces.',
    statute: '근로기준법 23·27·28조',
    url: 'https://www.law.go.kr/법령/근로기준법/제28조',
    lawDateKey: '근로기준법',
    flag5: false,
    migrant: false,
  },
  {
    id: 'harassment',
    emoji: '🛑',
    ko: '직장 내 괴롭힘',
    en: 'Workplace harassment',
    summaryKo: '사용자는 신고 시 즉시 조사하고 피해자를 보호해야 합니다. 보복 금지. 사용자가 행위자인 경우 최대 1,000만원 과태료.',
    summaryEn: 'Employer must investigate immediately and protect the victim. Retaliation is prohibited. Penalty up to ₩10M if employer is the harasser.',
    statute: '근로기준법 76조의2·3',
    url: 'https://www.law.go.kr/법령/근로기준법/제76조의2',
    lawDateKey: '근로기준법',
    flag5: false,
    migrant: true,
  },
  {
    id: 'industrial-accident',
    emoji: '🏥',
    ko: '산업재해 (산재)',
    en: 'Industrial accident',
    summaryKo: '업무상 부상·질병은 근로복지공단(COMWEL)에 산재보험 급여를 신청하세요. 국적·비자 무관 적용. 의료비·휴업급여 지원.',
    summaryEn: 'File with COMWEL (☎1588-0075) for work injuries or illness. Applies regardless of nationality or visa. Covers medical and lost wages.',
    statute: '산업재해보상보험법 37조',
    url: 'https://www.law.go.kr/법령/산업재해보상보험법/제37조',
    lawDateKey: '산업재해보상보험법',
    flag5: true,
    migrant: true,
  },
  {
    id: 'safety',
    emoji: '⛑️',
    ko: '작업중지권 · 안전',
    en: 'Right to refuse danger',
    summaryKo: '급박한 위험 시 작업 중지·대피할 권리가 있습니다(제52조). 작업 중지를 이유로 불이익 금지. 안전 신고는 ☎1350.',
    summaryEn: 'Right to stop work and evacuate in imminent danger (§52). No retaliation for using this right. Report hazards to ☎1350.',
    statute: '산업안전보건법 52조',
    url: 'https://www.law.go.kr/법령/산업안전보건법/제52조',
    lawDateKey: '산업안전보건법',
    flag5: true,
    migrant: true,
  },
];

type Topic = (typeof RIGHTS_TOPICS)[0] & { summaryKo: string; summaryEn: string };

function GridCard({
  topic,
  lang,
  updatedLabel,
}: {
  topic: Topic;
  lang: 'ko' | 'en';
  updatedLabel?: string;
}) {
  return (
    <View style={styles.gridCard}>
      <View style={styles.gridCardTop}>
        <Text style={styles.gridEmoji}>{topic.emoji}</Text>
        <View style={styles.badgeCol}>
          {topic.flag5 && <Text style={styles.badge5}>5인↓</Text>}
          {topic.migrant && <Text style={styles.badgeMigrant}>외국인</Text>}
        </View>
      </View>
      <Text style={styles.gridTitle}>{lang === 'ko' ? topic.ko : topic.en}</Text>
      <Text style={styles.gridSummary}>{lang === 'ko' ? topic.summaryKo : topic.summaryEn}</Text>
      <TouchableOpacity
        style={styles.gridSourceRow}
        onPress={() => Linking.openURL(topic.url)}
        accessibilityRole="link"
      >
        <Text style={styles.gridStatute} numberOfLines={1}>📜 {topic.statute}</Text>
        <Text style={styles.gridSourceLink}>{lang === 'ko' ? '원문 →' : 'Source →'}</Text>
      </TouchableOpacity>
      {updatedLabel ? (
        <Text style={styles.updatedLabel}>
          {lang === 'ko' ? `시행 ${updatedLabel}` : `In effect ${updatedLabel}`}
        </Text>
      ) : null}
    </View>
  );
}

export default function RightsScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { minWageYear, minWageHourly, minWageMonthly, lawDate } = useConfig();

  // Build topics with dynamic minimum wage summary
  const topics: Topic[] = RIGHTS_TOPICS.map((t) => {
    if (t.id === 'minimum-wage') {
      const h = minWageHourly.toLocaleString();
      const m = minWageMonthly.toLocaleString();
      return {
        ...t,
        summaryKo: `${minWageYear}년 시간당 ₩${h} (월 209시간 기준 ₩${m}). 외국인 포함 모든 근로자에게 적용. 주휴수당도 포함됩니다.`,
        summaryEn: `${minWageYear}: ₩${h}/hr (≈₩${m}/month, 209h). Applies to ALL workers including foreign nationals. Includes weekly holiday pay.`,
      };
    }
    return t;
  });

  const rows: Topic[][] = [];
  for (let i = 0; i < topics.length; i += 2) {
    rows.push(topics.slice(i, i + 2));
  }

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
            <Text style={styles.legendBadge}>5인↓</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '5인 미만도 적용' : '<5-person workplaces'}</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendBadgeMigrant}>외국인</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '외국인 근로자 주요 항목' : 'Key for migrant workers'}</Text>
          </View>
        </View>

        {rows.map((pair, i) => (
          <View key={i} style={styles.gridRow}>
            <GridCard
              topic={pair[0]}
              lang={lang}
              updatedLabel={lawDate(pair[0].lawDateKey)}
            />
            {pair[1] ? (
              <GridCard
                topic={pair[1]}
                lang={lang}
                updatedLabel={lawDate(pair[1].lawDateKey)}
              />
            ) : (
              <View style={styles.gridCardPlaceholder} />
            )}
          </View>
        ))}

        <View style={styles.callToAction}>
          <Text style={styles.ctaTitle}>{lang === 'ko' ? '내 상황에 맞는 도움 받기' : 'Get help for your situation'}</Text>
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
  subtitle: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.base },
  legend: { flexDirection: 'row', gap: spacing.base, marginBottom: spacing.base, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendBadge: { ...typography.caption, color: colors.warning, backgroundColor: '#FEF3C7', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendBadgeMigrant: { ...typography.caption, color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendText: { ...typography.caption, color: colors.textCaption },

  gridRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  gridCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  gridCardPlaceholder: { flex: 1 },
  gridCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  gridEmoji: { fontSize: 20 },
  badgeCol: { alignItems: 'flex-end', gap: 2 },
  badge5: { color: colors.warning, backgroundColor: '#FEF3C7', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, fontWeight: '700', fontSize: 9 },
  badgeMigrant: { color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, fontWeight: '700', fontSize: 9 },
  gridTitle: { ...typography.bodyS, color: colors.text, fontWeight: '700', marginBottom: spacing.xs, lineHeight: 18 },
  gridSummary: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: spacing.sm, flexGrow: 1 },
  gridSourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, gap: 4 },
  gridStatute: { fontSize: 9, color: colors.textCaption, flex: 1 },
  gridSourceLink: { fontSize: 9, color: colors.action, fontWeight: '700' },
  updatedLabel: { fontSize: 9, color: colors.textCaption, marginTop: 4 },

  callToAction: { backgroundColor: colors.selectedBg, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, marginTop: spacing.sm },
  ctaTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  ctaBtn: { backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  ctaBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  ctaBtnSecondary: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.action },
  ctaBtnSecondaryText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
});
