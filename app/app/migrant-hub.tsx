import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

// ── Data ──────────────────────────────────────────────────────────────────────

const HOTLINES = [
  { emoji: '📞', ko: '외국인 종합안내 ☎1345', en: 'Immigration Info ☎1345', detail: { ko: '24시간 · 약 20개 언어 · 신분 확인 없음', en: '24h · ~20 languages · No status check' }, number: '1345' },
  { emoji: '📞', ko: '외국인력 상담 ☎1644-0644', en: 'Foreign Worker Hotline ☎1644-0644', detail: { ko: '18개 언어 · 고용허가제(E-9) 전문', en: '18 languages · EPS / E-9 specialist' }, number: '16440644' },
  { emoji: '📞', ko: '다누리 ☎1577-1366', en: 'Danuri ☎1577-1366', detail: { ko: '24시간 · 13개 언어 · 다문화 가정 지원', en: '24h · 13 languages · Multicultural family support' }, number: '15771366' },
  { emoji: '📞', ko: 'BBB 통역 ☎1588-5644', en: 'BBB Interpretation ☎1588-5644', detail: { ko: '24시간 · 무료 전화 통역 (즉시 연결)', en: '24h · Free phone interpretation (immediate)' }, number: '15885644' },
  { emoji: '📞', ko: '고용노동부 ☎1350', en: 'Labor Ministry ☎1350', detail: { ko: '월~금 09:00–18:00 · 한국어/일부 언어', en: 'Mon–Fri 09:00–18:00 · Korean / some languages' }, number: '1350' },
];

const RIGHTS = [
  {
    emoji: '⚖️',
    ko: '동등 보호',
    en: 'Equal protection',
    bodyKo: '한국 노동법은 국적·비자 상태·등록 여부와 무관하게 모든 근로자를 동등하게 보호합니다. 미등록(불법체류) 근로자도 임금체불·산재 청구가 가능합니다.',
    bodyEn: 'Korean labor law protects ALL workers equally regardless of nationality, visa status, or immigration status. Undocumented workers can still claim unpaid wages and workers\' compensation.',
    statute: '근로기준법 제6조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    emoji: '🔄',
    ko: 'E-9 사업장 변경',
    en: 'E-9 Workplace change',
    bodyKo: '임금체불·폭행·성희롱·부당해고 등의 사유가 있으면 사용자 동의 없이 사업장 변경 신청이 가능합니다 (외국인고용법 제25조). 최초 3년 내 최대 3회 + 재고용 기간 최대 2회. 신청: 한국산업인력공단 ☎1644-0644 또는 eps.hrdkorea.or.kr',
    bodyEn: 'If your employer doesn\'t pay wages, uses violence, sexual harassment, or fires you unfairly, you can apply to change workplaces WITHOUT your employer\'s consent (외국인고용법 §25). Max 3 times in first 3 years + 2 more during extended stay. Apply: HRD Korea ☎1644-0644 or eps.hrdkorea.or.kr',
    statute: '외국인고용법 제25조',
    url: 'https://www.law.go.kr/법령/외국인근로자의고용등에관한법률',
  },
  {
    emoji: '🚫',
    ko: '여권·신분증 압수 금지',
    en: 'Passport / ID confiscation is illegal',
    bodyKo: '고용주가 근로자의 여권이나 신분증을 보관하는 것은 불법입니다 (출입국관리법). 즉시 ☎1345에 신고하세요. 이를 이유로 해고·협박하는 것도 불법입니다.',
    bodyEn: 'It is illegal for an employer to hold your passport or ID documents (출입국관리법). Report immediately to ☎1345. Threatening you for reporting is also illegal.',
    statute: '출입국관리법',
    url: 'https://www.law.go.kr/법령/출입국관리법',
  },
  {
    emoji: '💰',
    ko: '출국만기보험 (퇴직금 대체)',
    en: 'Departure insurance (severance equivalent)',
    bodyKo: 'E-9 근로자는 퇴직금 대신 출국만기보험에 가입됩니다. 출국 전 일시금으로 받을 수 있습니다. 1년 이상 근무 시 해당. 문의: ☎1644-0644',
    bodyEn: 'E-9 workers are enrolled in departure insurance instead of the regular severance system. You receive a lump sum when you leave Korea. Applies after 1+ year. Inquire: ☎1644-0644',
    statute: '외국인고용법 제13조',
    url: 'https://www.law.go.kr/법령/외국인근로자의고용등에관한법률',
  },
  {
    emoji: '🏥',
    ko: '산재보험 — 비자 무관 적용',
    en: 'Workers\' comp — all visas covered',
    bodyKo: '산재보험은 비자 종류·국적·등록 여부와 무관하게 모든 근로자에게 적용됩니다. 사용자가 거부해도 본인이 직접 근로복지공단(COMWEL ☎1588-0075)에 신청할 수 있습니다.',
    bodyEn: 'Workers\' compensation applies to ALL workers regardless of visa type, nationality, or status. Even if your employer refuses, you can file directly with COMWEL (☎1588-0075).',
    statute: '산업재해보상보험법 제6조',
    url: 'https://www.law.go.kr/법령/산업재해보상보험법',
  },
  {
    emoji: '🛡️',
    ko: '신고 보호 (추방 협박 금지)',
    en: 'Anti-retaliation (no deportation threats)',
    bodyKo: '고용주가 노동법 권리 행사를 막기 위해 출입국 신고로 협박하는 것은 불법입니다. 상담 기관은 당신의 체류 상태를 신고하지 않습니다. ☎1345, ☎1644-0644 모두 익명 상담 가능.',
    bodyEn: 'It is illegal for an employer to threaten immigration reports to prevent you from exercising your rights. Support organizations do NOT report your status. ☎1345 and ☎1644-0644 offer confidential anonymous consultation.',
    statute: '근로기준법 제7조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
];

const SITUATIONS = [
  { id: 'unpaid-wages', emoji: '💰', ko: '임금을 못 받았어요', en: "I wasn't paid" },
  { id: 'visa-threat', emoji: '🛂', ko: '비자로 협박해요', en: 'Boss threatening my visa' },
  { id: 'injury', emoji: '🤕', ko: '일하다 다쳤어요', en: 'I was injured at work' },
  { id: 'dangerous', emoji: '⚠️', ko: '위험한 일을 시켜요', en: "Forced to do dangerous work" },
];

// ── Components ────────────────────────────────────────────────────────────────

function HotlineRow({ item, lang }: { item: typeof HOTLINES[0]; lang: 'ko' | 'en' }) {
  return (
    <TouchableOpacity
      style={styles.hotlineRow}
      onPress={() => Linking.openURL(`tel:${item.number}`)}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <Text style={styles.hotlineEmoji}>{item.emoji}</Text>
      <View style={styles.hotlineInfo}>
        <Text style={styles.hotlineName}>{lang === 'ko' ? item.ko : item.en}</Text>
        <Text style={styles.hotlineDetail}>{item.detail[lang]}</Text>
      </View>
      <View style={styles.callChip}>
        <Text style={styles.callChipText}>{lang === 'ko' ? '전화' : 'Call'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RightCard({ item, lang }: { item: typeof RIGHTS[0]; lang: 'ko' | 'en' }) {
  return (
    <View style={styles.rightCard}>
      <View style={styles.rightHeader}>
        <Text style={styles.rightEmoji}>{item.emoji}</Text>
        <Text style={styles.rightTitle}>{lang === 'ko' ? item.ko : item.en}</Text>
      </View>
      <Text style={styles.rightBody}>{lang === 'ko' ? item.bodyKo : item.bodyEn}</Text>
      <TouchableOpacity
        style={styles.rightSource}
        onPress={() => Linking.openURL(item.url)}
        accessibilityRole="link"
      >
        <Text style={styles.rightSourceText}>📜 {item.statute}</Text>
        <Text style={styles.rightSourceLink}>{lang === 'ko' ? '원문 →' : 'Source →'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function MigrantHubScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{lang === 'ko' ? '외국인 노동자 권리' : 'Migrant Worker Rights'}</Text>
        <Text style={styles.subtitle}>
          {lang === 'ko'
            ? '한국 노동법은 비자 상태와 무관하게 모든 근로자를 보호합니다.'
            : 'Korean labor law protects all workers regardless of visa status.'}
        </Text>

        {/* Trust banner */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustText}>
            {lang === 'ko'
              ? '🔒 이 앱은 당신의 체류 상태를 신고하지 않습니다. 신분증을 묻지 않습니다.'
              : '🔒 This app never reports your status. We never ask for your ID or visa number.'}
          </Text>
        </View>

        {/* Quick situations */}
        <Text style={styles.sectionTitle}>{lang === 'ko' ? '내 상황은?' : 'My situation'}</Text>
        <View style={styles.situationGrid}>
          {SITUATIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.situationCard}
              onPress={() => router.push(`/guided-help/${s.id}` as any)}
              accessibilityRole="button"
            >
              <Text style={styles.situationEmoji}>{s.emoji}</Text>
              <Text style={styles.situationKo}>{s.ko}</Text>
              <Text style={styles.situationEn}>{s.en}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rights */}
        <Text style={styles.sectionTitle}>{lang === 'ko' ? '핵심 권리' : 'Key rights'}</Text>
        {RIGHTS.map((r) => <RightCard key={r.statute} item={r} lang={lang} />)}

        {/* Hotlines */}
        <Text style={styles.sectionTitle}>{lang === 'ko' ? '다국어 상담 전화' : 'Multilingual hotlines'}</Text>
        <View style={styles.hotlineGroup}>
          {HOTLINES.map((h, i) => <HotlineRow key={i} item={h} lang={lang} />)}
        </View>

        <View style={styles.offlineNote}>
          <Text style={styles.offlineText}>
            {lang === 'ko'
              ? '📶 오프라인에서도 이용 가능 · 출처: 고용노동부, 외국인고용법, law.go.kr'
              : '📶 Available offline · Source: Ministry of Labor, 외국인고용법, law.go.kr'}
          </Text>
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.base },

  trustBanner: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  trustText: { ...typography.bodyS, color: colors.action, fontWeight: '600', lineHeight: 22 },

  sectionTitle: {
    ...typography.bodyM,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  situationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  situationCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  situationEmoji: { fontSize: 28, marginBottom: spacing.xs },
  situationKo: { ...typography.bodyS, color: colors.text, fontWeight: '700', textAlign: 'center' },
  situationEn: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },

  rightCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  rightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  rightEmoji: { fontSize: 20 },
  rightTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', flex: 1 },
  rightBody: { ...typography.bodyM, color: colors.text, lineHeight: 26, marginBottom: spacing.md },
  rightSource: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rightSourceText: { ...typography.caption, color: colors.textCaption, flex: 1 },
  rightSourceLink: { ...typography.caption, color: colors.action, fontWeight: '700' },

  hotlineGroup: { marginBottom: spacing.base },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  hotlineEmoji: { fontSize: 20, marginRight: spacing.md },
  hotlineInfo: { flex: 1 },
  hotlineName: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  hotlineDetail: { ...typography.caption, color: colors.textCaption, marginTop: 2, lineHeight: 18 },
  callChip: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  callChipText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },

  offlineNote: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  offlineText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
