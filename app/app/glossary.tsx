import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import { useConfig } from '../lib/useConfig';

const TERMS = [
  {
    id: 'tongsung',
    ko: '통상임금',
    en: 'Ordinary wage (통상임금)',
    defKo: '정기적·일률적으로 지급하는 기본임금. 연장·야간·휴일 수당 가산율(+50%, +100%)의 기준이 됩니다.',
    defEn: 'The regular, fixed base wage paid on a consistent schedule. This is the baseline used to calculate overtime, night, and holiday premium rates (+50%, +100%).',
    statute: '근로기준법 제6조 통상임금',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'pyeogyun',
    ko: '평균임금',
    en: 'Average wage (평균임금)',
    defKo: '퇴직 전 3개월 동안 지급된 임금 총액을 그 기간의 총일수로 나눈 금액. 퇴직금·휴업급여 계산에 사용됩니다.',
    defEn: 'Total wages paid in the 3 months before leaving, divided by total calendar days. Used to calculate severance pay and wage-replacement benefits.',
    statute: '근로기준법 제2조 제6호',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'imgeumchebol',
    ko: '임금체불',
    en: 'Wage arrears (임금체불)',
    defKo: '사용자가 근로자에게 임금을 제때, 전액 지급하지 않는 것. 3년 이하 징역 또는 3,000만원 이하 벌금.',
    defEn: 'When an employer fails to pay wages in full or on time. Criminal penalty: up to 3 years prison or ₩30M fine.',
    statute: '근로기준법 제43조·109조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'budanghago',
    ko: '부당해고',
    en: 'Unfair dismissal (부당해고)',
    defKo: '정당한 이유 없는 해고, 또는 서면으로 사유와 날짜를 통보하지 않은 해고. 5인 이상 사업장에서 해고일로부터 3개월 내 노동위원회에 구제신청 가능.',
    defEn: 'Dismissal without justifiable reason, or without written notice stating the reason and date. At 5+ person workplaces, apply to the Labor Relations Commission within 3 months.',
    statute: '근로기준법 제23조·27조·28조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'jinjong',
    ko: '진정',
    en: 'Labor complaint (진정)',
    defKo: '고용노동부에 사용자의 법 위반 사실을 신고하는 것. labor.moel.go.kr 또는 지방노동관서에서 접수. 비용 무료.',
    defEn: 'A formal complaint filed with the Ministry of Employment and Labor about an employer\'s violation. Free to file at labor.moel.go.kr or your local labor office.',
    statute: '근로기준법 제104조',
    url: 'https://labor.moel.go.kr',
  },
  {
    id: 'sanjae',
    ko: '산재',
    en: 'Industrial accident (산재)',
    defKo: '업무상 원인으로 발생한 부상·질병·사망. 근로복지공단(COMWEL)에 신청하면 치료비·휴업급여·장해급여 등을 받을 수 있습니다.',
    defEn: 'A work-related injury, illness, or death. File with COMWEL (☎1588-0075) to receive medical costs, wage replacement, and disability benefits.',
    statute: '산업재해보상보험법 제37조',
    url: 'https://www.law.go.kr/법령/산업재해보상보험법',
  },
  {
    id: 'juhyu',
    ko: '주휴수당',
    en: 'Weekly holiday pay (주휴수당)',
    defKo: '1주일에 15시간 이상 일하고 소정 근로일을 모두 출근한 근로자에게 지급하는 유급 휴일 하루 치 임금.',
    defEn: 'One day of paid rest that must be given to workers who work 15+ hours/week and meet their scheduled days. Applies to part-time workers too.',
    statute: '근로기준법 제55조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'toejikgeum',
    ko: '퇴직금',
    en: 'Severance pay (퇴직금)',
    defKo: '1년 이상 근무한 근로자에게 퇴직 시 지급하는 금액. 평균임금 30일분 × 근속연수. 퇴직일로부터 14일 이내 지급.',
    defEn: 'Payment to workers who worked 1+ year when they leave. Amount: 30 days\' average wage × years of service. Must be paid within 14 days of leaving.',
    statute: '근로자퇴직급여보장법 제8조',
    url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법',
  },
  {
    id: 'gyeyakseo',
    ko: '근로계약서',
    en: 'Employment contract (근로계약서)',
    defKo: '사용자가 반드시 서면으로 작성하고 근로자에게 교부해야 하는 문서. 임금·근무시간·휴일·연차 등 필수 항목 기재 의무.',
    defEn: 'Written document that the employer must prepare and give to the worker. Must state wages, working hours, rest days, and annual leave.',
    statute: '근로기준법 제17조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'sahbo',
    ko: '4대보험',
    en: 'Four social insurances (4대보험)',
    defKo: '국민연금·건강보험·고용보험·산재보험. 대부분의 근로자에게 의무 가입. 산재보험은 외국인 포함 전 근로자 적용.',
    defEn: 'National Pension · Health Insurance · Employment Insurance · Industrial Accident Insurance. Most workers must be enrolled. Industrial accident insurance covers all workers including foreign nationals.',
    statute: '각 보험법',
    url: 'https://www.law.go.kr',
  },
  {
    id: 'choejeoim',
    ko: '최저임금',
    en: 'Minimum wage (최저임금)',
    defKo: '2026년: 시간당 ₩10,320 (월 209시간 기준 ₩2,156,880). 외국인 포함 모든 근로자에게 적용. 최저임금 미달 지급은 형사 처벌 대상.',
    defEn: '2026: ₩10,320/hr (≈₩2,156,880/month at 209h). Applies to ALL workers including foreign nationals. Paying below minimum wage is a criminal offense.',
    statute: '최저임금법 제6조',
    url: 'https://www.minimumwage.go.kr',
  },
  {
    id: 'yeonja',
    ko: '연차',
    en: 'Annual leave (연차)',
    defKo: '1년 이상 근무(출근율 80% 이상) → 15일. 1년 미만 → 매월 1일 발생 (최대 11일). 미사용 연차는 연차수당으로 지급.',
    defEn: '1+ year employment (80%+ attendance) → 15 days. Under 1 year → 1 day/month (max 11). Unused leave must be paid out.',
    statute: '근로기준법 제60조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'haegoyego',
    ko: '해고예고',
    en: 'Dismissal notice (해고예고)',
    defKo: '사용자는 해고 30일 전에 예고하거나, 예고 없이 해고 시 30일분 이상의 통상임금(해고예고수당)을 지급해야 합니다.',
    defEn: 'Employer must give 30 days\' advance notice before dismissal, or pay 30 days\' ordinary wage (notice pay) if no advance warning is given.',
    statute: '근로기준법 제26조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'nodonwi',
    ko: '노동위원회',
    en: 'Labor Relations Commission (노동위원회)',
    defKo: '부당해고·부당노동행위 구제신청을 처리하는 준사법기관. 해고일로부터 3개월 내 신청. 5인 이상 사업장에 적용.',
    defEn: 'Quasi-judicial body that handles unfair dismissal and unfair labor practice cases. Apply within 3 months of dismissal. Applies at 5+ person workplaces.',
    statute: '근로기준법 제28조',
    url: 'https://www.nlrc.go.kr',
  },
  {
    id: 'nomusa',
    ko: '노무사',
    en: 'Certified labor attorney (노무사/공인노무사)',
    defKo: '노동법 전문 국가 자격증 보유자. 임금체불, 부당해고, 산재 등 노동 분쟁에서 근로자를 대리하거나 상담합니다. 국선노무사는 무료.',
    defEn: 'State-licensed specialist in labor law. Can represent or advise workers in wage, dismissal, and accident cases. Public labor attorney (국선노무사) is free for qualifying cases.',
    statute: '공인노무사법',
    url: 'https://www.kcplaa.or.kr',
  },
];

export default function GlossaryScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { minWageHourly, minWageMonthly, minWageYear } = useConfig();

  const terms = useMemo(() => TERMS.map(t =>
    t.id === 'choejeoim'
      ? {
          ...t,
          defKo: `${minWageYear}년: 시간당 ₩${minWageHourly.toLocaleString()} (월 209시간 기준 ₩${minWageMonthly.toLocaleString()}). 외국인 포함 모든 근로자에게 적용. 최저임금 미달 지급은 형사 처벌 대상.`,
          defEn: `${minWageYear}: ₩${minWageHourly.toLocaleString()}/hr (≈₩${minWageMonthly.toLocaleString()}/month at 209h). Applies to ALL workers including foreign nationals. Paying below minimum wage is a criminal offense.`,
        }
      : t
  ), [minWageHourly, minWageMonthly, minWageYear]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.ko.includes(q) ||
        t.en.toLowerCase().includes(q) ||
        t.defKo.includes(q) ||
        t.defEn.toLowerCase().includes(q),
    );
  }, [query, terms]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{lang === 'ko' ? '용어사전' : 'Glossary'}</Text>
        <Text style={styles.subtitle}>
          {lang === 'ko' ? '노동법 핵심 용어 KR↔EN' : 'Key labor law terms KR↔EN'}
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={lang === 'ko' ? '용어 검색...' : 'Search terms...'}
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '용어 검색' : 'Search terms'}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityRole="button">
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Terms */}
        {filtered.map((term) => {
          const isOpen = expanded === term.id;
          return (
            <TouchableOpacity
              key={term.id}
              style={[styles.termCard, isOpen && styles.termCardOpen]}
              onPress={() => setExpanded(isOpen ? null : term.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
            >
              <View style={styles.termHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.termKo}>{term.ko}</Text>
                  <Text style={styles.termEn}>{term.en}</Text>
                </View>
                <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
              </View>

              {isOpen && (
                <View style={styles.termBody}>
                  <Text style={styles.defText}>{lang === 'ko' ? term.defKo : term.defEn}</Text>
                  <TouchableOpacity
                    style={styles.sourceRow}
                    onPress={() => Linking.openURL(term.url)}
                    accessibilityRole="link"
                  >
                    <Text style={styles.sourceText}>📜 {term.statute}</Text>
                    <Text style={styles.sourceLink}>{lang === 'ko' ? '원문 →' : 'Source →'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{lang === 'ko' ? '검색 결과 없음' : 'No results'}</Text>
          </View>
        )}

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

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.base,
    height: 44,
    ...shadow.card,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.bodyM, color: colors.text },
  clearBtn: { fontSize: 14, color: colors.textCaption, paddingLeft: spacing.sm },

  termCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  termCardOpen: { borderLeftWidth: 3, borderLeftColor: colors.brand },
  termHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  termKo: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  termEn: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  chevron: { ...typography.caption, color: colors.textCaption, marginTop: 4, marginLeft: spacing.sm },

  termBody: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  defText: { ...typography.bodyM, color: colors.text, lineHeight: 26, marginBottom: spacing.md },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sourceText: { ...typography.caption, color: colors.textCaption, flex: 1 },
  sourceLink: { ...typography.caption, color: colors.action, fontWeight: '700' },

  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.bodyM, color: colors.textSecondary },
});
