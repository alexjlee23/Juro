import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import { useConfig } from '../lib/useConfig';

// Required items per 근로기준법 제17조
const REQUIRED_ITEMS = [
  {
    id: 'wage',
    ko: '임금 (금액, 구성 항목, 지급 방법·날짜)',
    en: 'Wages (amount, components, payment method & date)',
    risk: 'high',
    noteKo: '임금은 매월 1회 이상 정해진 날짜에 전액 직접 지급해야 합니다 (근로기준법 제43조).',
    noteEn: 'Wages must be paid in full, directly, at least once a month on a set date (LSA §43).',
  },
  {
    id: 'hours',
    ko: '소정 근로시간 (시작·종료 시간, 휴게 시간)',
    en: 'Scheduled working hours (start, end, break times)',
    risk: 'high',
    noteKo: '법정 근로시간은 주 40시간·일 8시간. 초과 시 연장수당 필요 (5인 이상).',
    noteEn: 'Legal limit is 40h/week, 8h/day. Overtime premium required for additional hours (5+ person workplaces).',
  },
  {
    id: 'restday',
    ko: '주휴일 (유급 휴일)',
    en: 'Weekly rest day (paid holiday)',
    risk: 'medium',
    noteKo: '주 15시간 이상 근무 시 1일 유급 주휴일 부여 의무.',
    noteEn: 'Workers with 15+ hours/week must receive at least 1 paid weekly rest day.',
  },
  {
    id: 'leave',
    ko: '연차 유급 휴가 (일수)',
    en: 'Annual leave (number of days)',
    risk: 'medium',
    noteKo: '1년 이상·출근율 80% → 15일. 1년 미만 → 매월 1일 (근로기준법 제60조).',
    noteEn: '1+ year & 80%+ attendance → 15 days. Under 1 year → 1 day/month (LSA §60).',
  },
  {
    id: 'workplace',
    ko: '취업 장소',
    en: 'Place of work',
    risk: 'low',
    noteKo: '근무지가 계약과 다르면 변경에 근로자 동의가 필요합니다.',
    noteEn: 'Changing your workplace location requires your consent.',
  },
  {
    id: 'duties',
    ko: '업무 내용',
    en: 'Job duties / description',
    risk: 'low',
    noteKo: '계약과 다른 업무를 강제할 수 없습니다.',
    noteEn: 'You cannot be forced to do work different from what was agreed.',
  },
];

// Red flags to watch for
const RED_FLAGS = [
  {
    id: 'fine',
    ko: '지각·무단결근 시 임금 공제·벌금 조항',
    en: 'Wage deductions or fines for lateness or absence',
    defKo: '법으로 허용되지 않은 임금 공제는 자동 무효입니다 (근로기준법 제15조).',
    defEn: 'Wage deductions not permitted by law are automatically void (LSA §15).',
  },
  {
    id: 'resignation',
    ko: '무조건 손해배상 또는 위약금 조항 (퇴사 시)',
    en: 'Unconditional penalties for resigning',
    defKo: '퇴사를 이유로 과도한 손해배상을 요구하는 조항은 원칙적으로 무효입니다.',
    defEn: 'Clauses demanding excessive damages for resignation are generally unenforceable.',
  },
  {
    id: 'belowmin',
    ko: '최저임금 이하 급여 조항',
    en: 'Wages below the minimum wage',
    defKo: '최저임금 미만 조항은 자동 무효 → 최저임금이 적용됩니다 (최저임금법 제6조).',
    defEn: 'Any term paying below minimum wage is automatically void — minimum wage applies instead (최저임금법 §6).',
  },
  {
    id: 'document',
    ko: '사인 후 계약서를 돌려주지 않음',
    en: 'Contract not returned after signing',
    defKo: '사용자는 계약서 사본을 반드시 교부해야 합니다. 미교부 시 과태료 500만원 이하.',
    defEn: 'Employer must give you a copy. Failure to do so: fine up to ₩5M.',
  },
];

const RISK_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
};

export default function ContractCheckerScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { minWageHourly, minWageYear } = useConfig();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleFlag = (id: string) => setFlagged((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = REQUIRED_ITEMS.filter((i) => checked[i.id]).length;
  const flagCount = RED_FLAGS.filter((f) => flagged[f.id]).length;
  const allClear = checkedCount === REQUIRED_ITEMS.length && flagCount === 0;
  const hasProblem = flagCount > 0;
  const missing = REQUIRED_ITEMS.filter((i) => !checked[i.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{lang === 'ko' ? '📋 근로계약서 점검' : '📋 Contract checker'}</Text>
        <Text style={styles.subtitle}>
          {lang === 'ko'
            ? '계약서에 아래 항목이 있는지 확인하세요 (근로기준법 제17조 필수 기재 사항).'
            : 'Check whether your contract includes the items below (required by LSA §17).'}
        </Text>

        <View style={styles.minWageNote}>
          <Text style={styles.minWageText}>
            {lang === 'ko'
              ? `💡 ${minWageYear}년 최저임금: ₩${minWageHourly.toLocaleString()}/시간. 계약서 임금이 이보다 낮으면 그 조항은 자동 무효입니다.`
              : `💡 ${minWageYear} minimum wage: ₩${minWageHourly.toLocaleString()}/hr. Any contract term below this is automatically void.`}
          </Text>
        </View>

        {/* Required items */}
        <Text style={styles.sectionTitle}>
          {lang === 'ko' ? `① 필수 기재 항목 (${checkedCount}/${REQUIRED_ITEMS.length})` : `① Required items (${checkedCount}/${REQUIRED_ITEMS.length})`}
        </Text>
        <Text style={styles.sectionHint}>
          {lang === 'ko' ? '계약서에 있으면 ✓ 체크하세요.' : 'Check each item if it appears in your contract.'}
        </Text>

        {REQUIRED_ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.checkRow, isChecked && styles.checkRowDone]}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxOn]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemLabel, isChecked && styles.itemLabelDone]}>
                    {lang === 'ko' ? item.ko : item.en}
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: RISK_COLORS[item.risk] + '22' }]}>
                    <Text style={[styles.riskText, { color: RISK_COLORS[item.risk] }]}>
                      {item.risk === 'high' ? (lang === 'ko' ? '필수' : 'Must') : item.risk === 'medium' ? (lang === 'ko' ? '중요' : 'Key') : (lang === 'ko' ? '권장' : 'Good')}
                    </Text>
                  </View>
                </View>
                {!isChecked && (
                  <Text style={styles.itemNote}>{lang === 'ko' ? item.noteKo : item.noteEn}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Red flags */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
          {lang === 'ko' ? `② 주의 조항 점검` : `② Red flags to watch for`}
        </Text>
        <Text style={styles.sectionHint}>
          {lang === 'ko' ? '계약서에 이런 조항이 있으면 체크하세요.' : 'Check if any of these appear in your contract.'}
        </Text>

        {RED_FLAGS.map((flag) => {
          const isFlagged = !!flagged[flag.id];
          return (
            <TouchableOpacity
              key={flag.id}
              style={[styles.flagRow, isFlagged && styles.flagRowOn]}
              onPress={() => toggleFlag(flag.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isFlagged }}
            >
              <View style={[styles.flagBox, isFlagged && styles.flagBoxOn]}>
                {isFlagged && <Text style={styles.flagMark}>⚠️</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.flagLabel, isFlagged && styles.flagLabelOn]}>
                  {lang === 'ko' ? flag.ko : flag.en}
                </Text>
                {isFlagged && (
                  <Text style={styles.flagNote}>{lang === 'ko' ? flag.defKo : flag.defEn}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Result summary */}
        {(checkedCount > 0 || flagCount > 0) && (
          <View style={[styles.result, hasProblem ? styles.resultWarn : allClear ? styles.resultOk : styles.resultNeutral]}>
            {allClear && (
              <>
                <Text style={styles.resultTitle}>✅ {lang === 'ko' ? '이상 없음' : 'Looks good'}</Text>
                <Text style={styles.resultBody}>
                  {lang === 'ko'
                    ? '모든 필수 항목이 있고 주의 조항도 없습니다. 불분명한 부분은 노무사에게 확인하세요.'
                    : 'All required items are present and no red flags. For anything unclear, consult a 노무사.'}
                </Text>
              </>
            )}
            {!allClear && missing.length > 0 && (
              <>
                <Text style={styles.resultTitle}>⚠️ {lang === 'ko' ? `누락 항목 ${missing.length}개` : `${missing.length} item(s) missing`}</Text>
                {missing.map((m) => (
                  <Text key={m.id} style={styles.resultItem}>• {lang === 'ko' ? m.ko : m.en}</Text>
                ))}
              </>
            )}
            {hasProblem && (
              <>
                <Text style={[styles.resultTitle, { marginTop: spacing.sm }]}>🚨 {lang === 'ko' ? `주의 조항 ${flagCount}개 발견` : `${flagCount} red flag(s) found`}</Text>
                <Text style={styles.resultBody}>
                  {lang === 'ko'
                    ? '표시된 조항은 법적으로 무효일 수 있습니다. 서명 전 반드시 노무사와 상담하세요.'
                    : 'Flagged clauses may be legally void. Consult a 노무사 before signing.'}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.resultCta}
              onPress={() => router.push('/guided-help/contract' as any)}
              accessibilityRole="button"
            >
              <Text style={styles.resultCtaText}>
                {lang === 'ko' ? '계약 관련 안내 받기 →' : 'Get contract guidance →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>{lang === 'ko' ? '무료 도움 받기' : 'Free help'}</Text>
          <TouchableOpacity style={styles.helpRow} onPress={() => Linking.openURL('tel:1350')} accessibilityRole="button">
            <Text style={styles.helpText}>📞 {lang === 'ko' ? '고용노동부 1350 (계약서 검토)' : 'Labor Ministry 1350 (contract review)'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpRow} onPress={() => router.push('/directory')} accessibilityRole="button">
            <Text style={styles.helpText}>🧑‍⚖️ {lang === 'ko' ? '노무사 찾기 (422명)' : 'Find a 노무사 (422 attorneys)'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sourceRow}
          onPress={() => Linking.openURL('https://www.law.go.kr/법령/근로기준법')}
          accessibilityRole="link"
        >
          <Text style={styles.sourceText}>📜 근로기준법 제17조 (근로조건의 명시) · law.go.kr</Text>
        </TouchableOpacity>

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
  subtitle: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.base },

  minWageNote: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  minWageText: { ...typography.bodyS, color: colors.action, lineHeight: 22 },

  sectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  sectionHint: { ...typography.caption, color: colors.textCaption, marginBottom: spacing.sm },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
    ...shadow.card,
  },
  checkRowDone: { opacity: 0.7 },
  checkbox: {
    width: 24, height: 24,
    borderWidth: 2, borderColor: colors.border, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.successText, borderColor: colors.successText },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  itemLabel: { ...typography.bodyS, color: colors.text, fontWeight: '600', flex: 1, lineHeight: 20 },
  itemLabelDone: { textDecorationLine: 'line-through', color: colors.textCaption },
  riskBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  riskText: { fontSize: 10, fontWeight: '700' },
  itemNote: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },

  flagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
    ...shadow.card,
  },
  flagRowOn: { backgroundColor: '#FEF2F2', borderLeftWidth: 3, borderLeftColor: colors.error },
  flagBox: {
    width: 24, height: 24,
    borderWidth: 2, borderColor: colors.border, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  flagBoxOn: { borderColor: colors.error },
  flagMark: { fontSize: 12 },
  flagLabel: { ...typography.bodyS, color: colors.text, fontWeight: '600', lineHeight: 20 },
  flagLabelOn: { color: colors.error },
  flagNote: { ...typography.caption, color: '#991B1B', lineHeight: 18, marginTop: 4 },

  result: {
    borderRadius: radius.md,
    padding: spacing.base,
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  resultOk: { backgroundColor: '#F0FDF4' },
  resultWarn: { backgroundColor: '#FEF2F2' },
  resultNeutral: { backgroundColor: colors.infoBg },
  resultTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  resultBody: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 22, marginTop: spacing.xs },
  resultItem: { ...typography.bodyS, color: colors.error, marginBottom: 2 },
  resultCta: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.action,
    borderRadius: radius.sm,
  },
  resultCtaText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },

  helpSection: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  helpTitle: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.sm },
  helpRow: { paddingVertical: spacing.xs },
  helpText: { ...typography.bodyM, color: colors.action, fontWeight: '600' },

  sourceRow: { marginBottom: spacing.base },
  sourceText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
