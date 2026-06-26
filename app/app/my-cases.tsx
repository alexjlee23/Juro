import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

const CASE_STATUSES = [
  {
    emoji: '📝',
    titleKo: '진정 접수',
    titleEn: 'Complaint filed',
    descKo: '고용노동부에 진정이 접수됐습니다. 근로감독관이 연락할 예정입니다.',
    descEn: 'Your complaint has been filed with the Ministry of Employment and Labor. A labor inspector will be in contact.',
    timelineKo: '다음 단계: 근로감독관 배정 → 양측 연락 → 시정 명령',
    timelineEn: 'Next: Inspector assigned → Both parties contacted → Correction order',
    deadlineKo: '임금 청구 소멸시효: 3년',
    deadlineEn: 'Wage claim limit: 3 years',
    color: '#3B82F6',
  },
  {
    emoji: '⚖️',
    titleKo: '부당해고 구제신청',
    titleEn: 'Unfair dismissal filing',
    descKo: '노동위원회에 부당해고 구제신청을 할 수 있습니다.',
    descEn: 'You can file an unfair dismissal claim with the Labor Relations Commission.',
    timelineKo: '다음 단계: 신청서 제출 → 조사 → 판정',
    timelineEn: 'Next: Submit application → Investigation → Decision',
    deadlineKo: '⚠️ 해고일로부터 3개월 이내',
    deadlineEn: '⚠️ Within 3 months of dismissal',
    color: '#F59E0B',
  },
  {
    emoji: '🏥',
    titleKo: '산재 신청',
    titleEn: 'Industrial accident claim',
    descKo: '근로복지공단(COMWEL)에 산재 보상을 신청할 수 있습니다.',
    descEn: 'You can apply for industrial accident compensation through COMWEL.',
    timelineKo: '다음 단계: 서류 제출 → 조사 → 승인·보상',
    timelineEn: 'Next: Submit documents → Investigation → Approval & compensation',
    deadlineKo: 'COMWEL ☎ 1588-0075',
    deadlineEn: 'COMWEL ☎ 1588-0075',
    color: '#10B981',
  },
];

export default function MyCasesScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('내 정보', 'My')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('내 케이스', 'My Cases')}</Text>
        <Text style={styles.subtitle}>
          {t('진행 중인 노동 문제를 추적하고 다음 단계를 확인하세요.', 'Track your labour issues and see your next steps.')}
        </Text>

        {/* Empty state */}
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📂</Text>
          <Text style={styles.emptyTitle}>{t('진행 중인 케이스가 없습니다', 'No active cases')}</Text>
          <Text style={styles.emptyBody}>
            {t(
              '상황별 도움 받기를 통해 케이스를 시작하면 여기서 진행 상황을 추적할 수 있습니다.',
              'Start a case through Guided Help and you can track your progress here.'
            )}
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/guided-help' as any)}>
            <Text style={styles.startBtnText}>{t('상황별 도움 받기 →', 'Get guided help →')}</Text>
          </TouchableOpacity>
        </View>

        {/* Case type reference */}
        <Text style={styles.sectionLabel}>{t('케이스 유형 안내', 'Case type guide')}</Text>
        {CASE_STATUSES.map((c, i) => (
          <View key={i} style={[styles.caseCard, { borderLeftColor: c.color }]}>
            <Text style={styles.caseEmoji}>{c.emoji}</Text>
            <View style={styles.caseBody}>
              <Text style={styles.caseTitle}>{t(c.titleKo, c.titleEn)}</Text>
              <Text style={styles.caseDesc}>{t(c.descKo, c.descEn)}</Text>
              <Text style={styles.caseTimeline}>{t(c.timelineKo, c.timelineEn)}</Text>
              <View style={styles.deadlinePill}>
                <Text style={styles.deadlineText}>{t(c.deadlineKo, c.deadlineEn)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Hotline reminder */}
        <View style={styles.hotlineBox}>
          <Text style={styles.hotlineTitle}>{t('전문가 도움이 필요하신가요?', 'Need expert help?')}</Text>
          <Text style={styles.hotlineItem}>📞 {t('고용노동부 상담', 'Labor Ministry')} — ☎ 1350</Text>
          <Text style={styles.hotlineItem}>🌏 {t('외국인 노동자', 'Migrant workers')} — ☎ 1644-0644</Text>
          <Text style={styles.hotlineItem}>🏥 {t('산재 문의', 'Industrial accident')} — ☎ 1588-0075</Text>
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
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 24 },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  emptyBody: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  startBtn: { backgroundColor: colors.action, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  startBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  sectionLabel: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  caseCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    borderLeftWidth: 4,
    ...shadow.card,
  },
  caseEmoji: { fontSize: 28, marginRight: spacing.md, marginTop: 2 },
  caseBody: { flex: 1 },
  caseTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  caseDesc: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xs },
  caseTimeline: { ...typography.caption, color: colors.textCaption, lineHeight: 18, marginBottom: spacing.xs },
  deadlinePill: { backgroundColor: colors.selectedBg, borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, alignSelf: 'flex-start' },
  deadlineText: { ...typography.caption, color: colors.action, fontWeight: '600' },
  hotlineBox: { backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.base, marginTop: spacing.sm, marginBottom: spacing.base },
  hotlineTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  hotlineItem: { ...typography.bodyS, color: colors.text, lineHeight: 24 },
});
