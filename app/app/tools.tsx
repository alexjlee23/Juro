import { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import { useConfig } from '../lib/useConfig';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n).toLocaleString('ko-KR');
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

// ── Wage Calculator ───────────────────────────────────────────────────────────

function WageCalc({ lang, minWageHourly }: { lang: 'ko' | 'en'; minWageHourly: number }) {
  const [hourly, setHourly] = useState('');
  const [dailyH, setDailyH] = useState('8');
  const [weeklyD, setWeeklyD] = useState('5');
  const [extraH, setExtraH] = useState('0');
  const [nightH, setNightH] = useState('0');
  const [holidayH, setHolidayH] = useState('0');
  const [fiveUnder, setFiveUnder] = useState(false);

  const rate = parseNum(hourly) || minWageHourly;
  const dH = parseNum(dailyH);
  const wD = parseNum(weeklyD);
  const wH = dH * wD;
  const monthlyH = (wH / 7) * 365 / 12; // avg monthly hours

  // 주휴수당 (weekly holiday pay) — applies when weekly hours ≥ 15
  const weeklyHolidayPay = wH >= 15 ? (wH / wD) * rate : 0;

  const regularPay = monthlyH * rate;
  const extraPay = fiveUnder ? 0 : parseNum(extraH) * rate * 0.5;
  const nightPay = fiveUnder ? 0 : parseNum(nightH) * rate * 0.5;
  const holidayPay = fiveUnder ? 0 : parseNum(holidayH) * rate * 0.5;
  const premiums = extraPay + nightPay + holidayPay;
  const monthlyHolidayPay = (weeklyHolidayPay * 52) / 12;
  const total = regularPay + premiums + monthlyHolidayPay;

  const belowMin = rate < minWageHourly;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{lang === 'ko' ? '💰 임금·수당 계산기' : '💰 Wage & overtime calculator'}</Text>

      {belowMin && hourly !== '' && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            {lang === 'ko'
              ? `⚠️ 입력한 시급(₩${fmt(rate)})이 2026년 최저임금(₩${fmt(minWageHourly)})보다 낮습니다.`
              : `⚠️ Entered rate (₩${fmt(rate)}) is below the 2026 minimum wage (₩${fmt(minWageHourly)}).`}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '시급 (₩)' : 'Hourly rate (₩)'}</Text>
          <TextInput
            style={styles.input}
            value={hourly}
            onChangeText={setHourly}
            keyboardType="numeric"
            placeholder={String(minWageHourly)}
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '시급' : 'Hourly rate'}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '하루 근무(시간)' : 'Hours/day'}</Text>
          <TextInput style={styles.input} value={dailyH} onChangeText={setDailyH} keyboardType="numeric" accessibilityLabel={lang === 'ko' ? '하루 근무 시간' : 'Daily hours'} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '주 근무(일)' : 'Days/week'}</Text>
          <TextInput style={styles.input} value={weeklyD} onChangeText={setWeeklyD} keyboardType="numeric" accessibilityLabel={lang === 'ko' ? '주 근무 일수' : 'Days per week'} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setFiveUnder(!fiveUnder)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: fiveUnder }}
      >
        <View style={[styles.checkbox, fiveUnder && styles.checkboxOn]} />
        <Text style={styles.toggleLabel}>
          {lang === 'ko' ? '5인 미만 사업장 (연장·야간·휴일 수당 미적용)' : '<5-person workplace (premium pay not required)'}
        </Text>
      </TouchableOpacity>

      {!fiveUnder && (
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.inputLabel}>{lang === 'ko' ? '이번 달 연장 근무(시간)' : 'Overtime hours (this month)'}</Text>
            <TextInput style={styles.input} value={extraH} onChangeText={setExtraH} keyboardType="numeric" accessibilityLabel={lang === 'ko' ? '연장 근무 시간' : 'Overtime hours'} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>{lang === 'ko' ? '야간 근무 (22:00–06:00)' : 'Night hours (22:00–06:00)'}</Text>
            <TextInput style={styles.input} value={nightH} onChangeText={setNightH} keyboardType="numeric" accessibilityLabel={lang === 'ko' ? '야간 근무 시간' : 'Night hours'} />
          </View>
        </View>
      )}

      {!fiveUnder && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '휴일 근무(시간)' : 'Holiday work hours'}</Text>
          <TextInput style={styles.input} value={holidayH} onChangeText={setHolidayH} keyboardType="numeric" accessibilityLabel={lang === 'ko' ? '휴일 근무 시간' : 'Holiday hours'} />
          <Text style={styles.inputHint}>
            {lang === 'ko' ? '기본급 포함 계산 → +50% 가산분만 표시됩니다' : 'Base pay included above — shows the +50% premium only'}
          </Text>
        </View>
      )}

      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>{lang === 'ko' ? '예상 월 급여' : 'Estimated monthly pay'}</Text>
        <ResultRow label={lang === 'ko' ? '기본급 (월 평균시간 기준)' : 'Base pay (avg monthly hours)'} value={regularPay} />
        {monthlyHolidayPay > 0 && (
          <ResultRow label={lang === 'ko' ? '주휴수당 (월 환산)' : 'Weekly holiday pay (monthly)'} value={monthlyHolidayPay} />
        )}
        {premiums > 0 && <ResultRow label={lang === 'ko' ? '연장·야간·휴일 가산' : 'Overtime/night/holiday premiums'} value={premiums} />}
        <View style={styles.divider} />
        <ResultRow label={lang === 'ko' ? '합계 (세전)' : 'Total (before tax)'} value={total} bold />
      </View>

      <Text style={styles.note}>
        {lang === 'ko'
          ? `📜 근로기준법 제56조 · 최저임금법 · 2026년 최저임금 ₩${fmt(minWageHourly)}/시간`
          : `📜 Labor Standards Act §56 · Minimum Wage Act · 2026 minimum wage ₩${fmt(minWageHourly)}/hr`}
      </Text>
    </View>
  );
}

function ResultRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, bold && styles.resultLabelBold]}>{label}</Text>
      <Text style={[styles.resultValue, bold && styles.resultValueBold]}>₩{fmt(value)}</Text>
    </View>
  );
}

// ── Severance Calculator ──────────────────────────────────────────────────────

function SeveranceCalc({ lang }: { lang: 'ko' | 'en' }) {
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [avgMonthly, setAvgMonthly] = useState('');

  const totalMonths = parseNum(years) * 12 + parseNum(months);
  const totalYears = totalMonths / 12;
  const avgM = parseNum(avgMonthly);
  const avgDaily = avgM * 12 / 365;
  const severance = totalYears >= 1 ? avgDaily * 30 * totalYears : 0;
  const eligible = totalMonths >= 12;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{lang === 'ko' ? '💼 퇴직금 계산기' : '💼 Severance calculator'}</Text>

      {!eligible && totalMonths > 0 && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            {lang === 'ko'
              ? '⚠️ 퇴직금은 1년 이상 근무해야 받을 수 있습니다 (퇴직급여법 제8조).'
              : '⚠️ Severance requires at least 1 year of employment (퇴직급여법 §8).'}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '근속 기간 — 연' : 'Employment — years'}</Text>
          <TextInput style={styles.input} value={years} onChangeText={setYears} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textCaption} accessibilityLabel={lang === 'ko' ? '근속 연수' : 'Years worked'} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '월' : 'months'}</Text>
          <TextInput style={styles.input} value={months} onChangeText={setMonths} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textCaption} accessibilityLabel={lang === 'ko' ? '근속 개월 수' : 'Additional months'} />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{lang === 'ko' ? '직전 3개월 평균 월급 (₩)' : 'Avg monthly pay, last 3 months (₩)'}</Text>
        <TextInput
          style={styles.input}
          value={avgMonthly}
          onChangeText={setAvgMonthly}
          keyboardType="numeric"
          placeholder="2,000,000"
          placeholderTextColor={colors.textCaption}
          accessibilityLabel={lang === 'ko' ? '평균 월급' : 'Average monthly pay'}
        />
      </View>

      {eligible && avgM > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '예상 퇴직금' : 'Estimated severance'}</Text>
          <ResultRow
            label={lang === 'ko' ? `근속 ${totalMonths}개월 × 평균임금 30일` : `${totalMonths} months × 30 days avg wage`}
            value={severance}
            bold
          />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '퇴직일로부터 14일 이내 지급 (퇴직급여법 제9조)'
              : 'Must be paid within 14 days of leaving (퇴직급여법 §9)'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>
        {lang === 'ko'
          ? '📜 근로자퇴직급여보장법 제8·9·10조 · 3년 이내 청구 가능'
          : '📜 퇴직급여법 §8·9·10 · Claim within 3 years of leaving'}
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ToolsScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { minWageHourly } = useConfig();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
            <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{lang === 'ko' ? '계산기' : 'Calculators'}</Text>
          <Text style={styles.subtitle}>
            {lang === 'ko' ? '내가 받아야 할 금액을 직접 확인하세요.' : 'Calculate what you should be paid.'}
          </Text>

          <WageCalc lang={lang} minWageHourly={minWageHourly} />
          <SeveranceCalc lang={lang} />

          <Banner />
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  cardTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.base },

  warnBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warnText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  row: { flexDirection: 'row', marginBottom: spacing.sm },
  inputGroup: { marginBottom: spacing.sm },
  inputLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  inputHint: { fontSize: 11, color: colors.textCaption, marginTop: 3, lineHeight: 15 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyM,
    color: colors.text,
    backgroundColor: colors.background,
  },

  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  checkbox: {
    width: 20, height: 20,
    borderWidth: 2, borderColor: colors.border, borderRadius: 4,
  },
  checkboxOn: { backgroundColor: colors.action, borderColor: colors.action },
  toggleLabel: { ...typography.bodyS, color: colors.textSecondary, flex: 1, lineHeight: 18 },

  resultBox: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultTitle: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '700' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  resultLabel: { ...typography.bodyS, color: colors.textSecondary, flex: 1 },
  resultLabelBold: { color: colors.text, fontWeight: '700' },
  resultValue: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '600' },
  resultValueBold: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  resultNote: { ...typography.caption, color: colors.textCaption, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  note: { fontSize: 11, color: colors.textCaption, lineHeight: 16, marginTop: spacing.xs },
});
