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

function ResultRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, bold && styles.resultLabelBold]}>{label}</Text>
      <Text style={[styles.resultValue, bold && styles.resultValueBold]}>₩{fmt(value)}</Text>
    </View>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={colors.textCaption}
        accessibilityLabel={label}
      />
    </View>
  );
}

// ── 1. Wage & overtime ────────────────────────────────────────────────────────

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
      {belowMin && hourly !== '' && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            {lang === 'ko'
              ? `⚠️ 입력한 시급(₩${fmt(rate)})이 2026년 최저임금(₩${fmt(minWageHourly)})보다 낮습니다.`
              : `⚠️ Entered rate (₩${fmt(rate)}) is below the 2026 minimum wage (₩${fmt(minWageHourly)}).`}
          </Text>
        </View>
      )}

      <Field label={lang === 'ko' ? '시급 (₩)' : 'Hourly rate (₩)'} value={hourly} onChange={setHourly} placeholder={String(minWageHourly)} />

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '하루 근무(시간)' : 'Hours/day'}</Text>
          <TextInput style={styles.input} value={dailyH} onChangeText={setDailyH} keyboardType="numeric" />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '주 근무(일)' : 'Days/week'}</Text>
          <TextInput style={styles.input} value={weeklyD} onChangeText={setWeeklyD} keyboardType="numeric" />
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
            <TextInput style={styles.input} value={extraH} onChangeText={setExtraH} keyboardType="numeric" />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>{lang === 'ko' ? '야간 근무 (22:00–06:00)' : 'Night hours (22:00–06:00)'}</Text>
            <TextInput style={styles.input} value={nightH} onChangeText={setNightH} keyboardType="numeric" />
          </View>
        </View>
      )}

      {!fiveUnder && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '휴일 근무(시간)' : 'Holiday work hours'}</Text>
          <TextInput style={styles.input} value={holidayH} onChangeText={setHolidayH} keyboardType="numeric" />
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

// ── 2. Severance ─────────────────────────────────────────────────────────────

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
          <TextInput style={styles.input} value={years} onChangeText={setYears} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textCaption} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '월' : 'months'}</Text>
          <TextInput style={styles.input} value={months} onChangeText={setMonths} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textCaption} />
        </View>
      </View>

      <Field
        label={lang === 'ko' ? '직전 3개월 평균 월급 (₩)' : 'Avg monthly pay, last 3 months (₩)'}
        value={avgMonthly} onChange={setAvgMonthly} placeholder="2,000,000"
      />

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

// ── 3. Weekly holiday pay (주휴수당) ─────────────────────────────────────────

function JuhyuCalc({ lang, minWageHourly }: { lang: 'ko' | 'en'; minWageHourly: number }) {
  const [hourly, setHourly] = useState('');
  const [weeklyH, setWeeklyH] = useState('');

  const rate = parseNum(hourly) || minWageHourly;
  const wH = parseNum(weeklyH);
  const eligible = wH >= 15;
  // Proportional: (weekly hours / 40) × 8h × hourly rate, capped at 8h
  const weekly = eligible ? Math.min(wH, 40) / 40 * 8 * rate : 0;
  const monthly = (weekly * 52) / 12;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '시급 (₩)' : 'Hourly rate (₩)'} value={hourly} onChange={setHourly} placeholder={String(minWageHourly)} />
      <Field label={lang === 'ko' ? '1주 소정근로시간' : 'Contracted hours per week'} value={weeklyH} onChange={setWeeklyH} placeholder="40" />

      {wH > 0 && !eligible && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            {lang === 'ko'
              ? '⚠️ 주 15시간 미만은 주휴수당 대상이 아닙니다.'
              : '⚠️ Under 15 hours/week does not qualify for weekly holiday pay.'}
          </Text>
        </View>
      )}

      {eligible && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '주휴수당' : 'Weekly holiday pay'}</Text>
          <ResultRow label={lang === 'ko' ? '1주당' : 'Per week'} value={weekly} bold />
          <ResultRow label={lang === 'ko' ? '월 환산 (52주÷12)' : 'Monthly equivalent'} value={monthly} />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '소정 근로일을 개근한 주에 발생합니다.'
              : 'Accrues in weeks with full attendance on scheduled days.'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '근로기준법 제55조' : 'Labor Standards Act §55'}</Text>
    </View>
  );
}

// ── 4. Annual leave days (연차 개수) ─────────────────────────────────────────

function YeonchaDaysCalc({ lang }: { lang: 'ko' | 'en' }) {
  const [y, setY] = useState('');
  const [m, setM] = useState('');
  const [d, setD] = useState('');

  const hire = new Date(parseNum(y), parseNum(m) - 1, parseNum(d) || 1);
  const now = new Date();
  const valid = parseNum(y) > 1970 && parseNum(m) >= 1 && parseNum(m) <= 12 && hire < now;

  let days = 0;
  let label = '';
  if (valid) {
    const ms = now.getTime() - hire.getTime();
    const totalMonths = Math.floor(ms / (30.44 * 86400000));
    const years = Math.floor(totalMonths / 12);
    if (years < 1) {
      days = Math.min(totalMonths, 11);
      label = lang === 'ko' ? `근속 ${totalMonths}개월 (1년 미만: 개근 월 1일)` : `${totalMonths} months (under 1yr: 1 day per full month)`;
    } else {
      days = Math.min(15 + Math.floor((years - 1) / 2), 25);
      label = lang === 'ko' ? `근속 ${years}년 (15일 + 2년마다 1일, 최대 25일)` : `${years} years (15 days +1 per 2 years, max 25)`;
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.inputLabel}>{lang === 'ko' ? '입사일' : 'Hire date'}</Text>
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <TextInput style={styles.input} value={y} onChangeText={setY} keyboardType="numeric" placeholder={lang === 'ko' ? '연도 (2023)' : 'Year'} placeholderTextColor={colors.textCaption} />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <TextInput style={styles.input} value={m} onChangeText={setM} keyboardType="numeric" placeholder={lang === 'ko' ? '월' : 'Month'} placeholderTextColor={colors.textCaption} />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <TextInput style={styles.input} value={d} onChangeText={setD} keyboardType="numeric" placeholder={lang === 'ko' ? '일' : 'Day'} placeholderTextColor={colors.textCaption} />
        </View>
      </View>

      {valid && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '올해 발생 연차' : 'Annual leave accrued'}</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{label}</Text>
            <Text style={styles.resultValueBold}>{days}{lang === 'ko' ? '일' : ' days'}</Text>
          </View>
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '출근율 80% 이상 가정 · 입사일 기준 방식 (회계연도 방식 회사는 다를 수 있음) · 5인 이상 사업장'
              : 'Assumes 80%+ attendance · hire-date method (fiscal-year companies differ) · 5+ workplaces'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '근로기준법 제60조' : 'Labor Standards Act §60'}</Text>
    </View>
  );
}

// ── 5. Unused leave pay (연차수당) ───────────────────────────────────────────

function YeonchaPayCalc({ lang }: { lang: 'ko' | 'en' }) {
  const [monthly, setMonthly] = useState('');
  const [unused, setUnused] = useState('');

  const m = parseNum(monthly);
  const days = parseNum(unused);
  const dailyOrdinary = (m / 209) * 8;
  const total = dailyOrdinary * days;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '월 통상임금 (기본급+고정수당, ₩)' : 'Monthly ordinary wage (base + fixed allowances, ₩)'} value={monthly} onChange={setMonthly} placeholder="2,156,880" />
      <Field label={lang === 'ko' ? '미사용 연차 일수' : 'Unused leave days'} value={unused} onChange={setUnused} placeholder="5" />

      {m > 0 && days > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '연차수당' : 'Unused leave pay'}</Text>
          <ResultRow label={lang === 'ko' ? '1일 통상임금 (월÷209×8)' : 'Daily ordinary wage (monthly÷209×8)'} value={dailyOrdinary} />
          <View style={styles.divider} />
          <ResultRow label={lang === 'ko' ? `미사용 ${days}일` : `${days} unused days`} value={total} bold />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '퇴직 시 남은 연차는 전부 수당으로 정산됩니다. 적법한 사용촉진 절차를 거친 연차는 제외될 수 있습니다.'
              : 'All remaining days must be paid out on leaving. Days lapsed under a valid leave-promotion procedure may be excluded.'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '근로기준법 제60·61조' : 'Labor Standards Act §60–61'}</Text>
    </View>
  );
}

// ── 6. Dismissal notice pay (해고예고수당) ───────────────────────────────────

function NoticePayCalc({ lang }: { lang: 'ko' | 'en' }) {
  const [monthly, setMonthly] = useState('');
  const m = parseNum(monthly);
  const daily = (m / 209) * 8;
  const total = daily * 30;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '월 통상임금 (기본급+고정수당, ₩)' : 'Monthly ordinary wage (₩)'} value={monthly} onChange={setMonthly} placeholder="2,156,880" />

      {m > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '해고예고수당 (30일분)' : 'Notice pay (30 days)'}</Text>
          <ResultRow label={lang === 'ko' ? '1일 통상임금 × 30' : 'Daily ordinary wage × 30'} value={total} bold />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '30일 전 예고 없이 해고되면 받을 수 있습니다. 3개월 미만 근속 등 예외 있음.'
              : 'Due if dismissed without 30 days\' notice. Exceptions: under 3 months\' service, etc.'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '근로기준법 제26조' : 'Labor Standards Act §26'}</Text>
    </View>
  );
}

// ── 7. Unemployment benefits (실업급여) ──────────────────────────────────────

const BENEFIT_DAYS: { maxYears: number; under50: number; over50: number }[] = [
  { maxYears: 1, under50: 120, over50: 120 },
  { maxYears: 3, under50: 150, over50: 180 },
  { maxYears: 5, under50: 180, over50: 210 },
  { maxYears: 10, under50: 210, over50: 240 },
  { maxYears: Infinity, under50: 240, over50: 270 },
];
const DAILY_CAP = 66000; // 이직일 2019.1. 이후 상한액 — 변동 시 업데이트 필요

function UnemploymentCalc({ lang, minWageHourly }: { lang: 'ko' | 'en'; minWageHourly: number }) {
  const [monthly, setMonthly] = useState('');
  const [years, setYears] = useState('');
  const [over50, setOver50] = useState(false);

  const m = parseNum(monthly);
  const insuredYears = parseNum(years);
  const dailyFloor = minWageHourly * 8 * 0.8;
  const rawDaily = (m * 12 / 365) * 0.6;
  const daily = m > 0 ? Math.min(DAILY_CAP, Math.max(Math.min(dailyFloor, DAILY_CAP), rawDaily)) : 0;

  const bracket = BENEFIT_DAYS.find(b => insuredYears < b.maxYears) ?? BENEFIT_DAYS[BENEFIT_DAYS.length - 1];
  const days = insuredYears > 0 ? (over50 ? bracket.over50 : bracket.under50) : 0;
  const total = daily * days;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '이직 전 3개월 평균 월급 (₩)' : 'Avg monthly pay, last 3 months (₩)'} value={monthly} onChange={setMonthly} placeholder="2,500,000" />
      <Field label={lang === 'ko' ? '고용보험 가입 기간 (년)' : 'Years insured (employment insurance)'} value={years} onChange={setYears} placeholder="3" />

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setOver50(!over50)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: over50 }}
      >
        <View style={[styles.checkbox, over50 && styles.checkboxOn]} />
        <Text style={styles.toggleLabel}>
          {lang === 'ko' ? '이직일 기준 만 50세 이상 (또는 장애인)' : '50 or older at separation (or disabled)'}
        </Text>
      </TouchableOpacity>

      {m > 0 && days > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '예상 구직급여' : 'Estimated benefits'}</Text>
          <ResultRow label={lang === 'ko' ? '1일 지급액 (평균임금 60%, 상·하한 적용)' : 'Daily amount (60% of avg wage, capped)'} value={daily} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{lang === 'ko' ? '소정급여일수' : 'Benefit days'}</Text>
            <Text style={styles.resultValue}>{days}{lang === 'ko' ? '일' : ' days'}</Text>
          </View>
          <View style={styles.divider} />
          <ResultRow label={lang === 'ko' ? '총 예상 수급액' : 'Total estimate'} value={total} bold />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '수급 요건: 18개월 중 180일 이상 가입 + 비자발적 이직. 상한 66,000원/일 기준 (변동 가능). 정확한 금액은 고용24에서 확인하세요.'
              : 'Requires 180+ insured days in 18 months + involuntary separation. Cap ₩66,000/day (subject to change). Confirm at gojyong24.'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '고용보험법 제40·45·46·50조 · work24.go.kr' : 'Employment Insurance Act §40·45·46·50 · work24.go.kr'}</Text>
    </View>
  );
}

// ── 8. Social insurance deductions (4대보험) ─────────────────────────────────

// 근로자 부담 요율 (2026년 기준 — 변동 시 업데이트)
const RATE_PENSION = 0.045;      // 국민연금
const RATE_HEALTH = 0.03545;     // 건강보험
const RATE_LTC = 0.1295;         // 장기요양 (건강보험료의 %)
const RATE_EMPLOYMENT = 0.009;   // 고용보험

function InsuranceCalc({ lang }: { lang: 'ko' | 'en' }) {
  const [monthly, setMonthly] = useState('');
  const m = parseNum(monthly);

  const pension = m * RATE_PENSION;
  const health = m * RATE_HEALTH;
  const ltc = health * RATE_LTC;
  const employment = m * RATE_EMPLOYMENT;
  const total = pension + health + ltc + employment;
  const net = m - total;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '월 급여 (세전, ₩)' : 'Monthly pay (gross, ₩)'} value={monthly} onChange={setMonthly} placeholder="2,500,000" />

      {m > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '근로자 부담 보험료' : 'Employee-side premiums'}</Text>
          <ResultRow label={lang === 'ko' ? '국민연금 (4.5%)' : 'National Pension (4.5%)'} value={pension} />
          <ResultRow label={lang === 'ko' ? '건강보험 (3.545%)' : 'Health Insurance (3.545%)'} value={health} />
          <ResultRow label={lang === 'ko' ? '장기요양 (건보료의 12.95%)' : 'Long-term care (12.95% of health)'} value={ltc} />
          <ResultRow label={lang === 'ko' ? '고용보험 (0.9%)' : 'Employment Insurance (0.9%)'} value={employment} />
          <View style={styles.divider} />
          <ResultRow label={lang === 'ko' ? '공제 합계' : 'Total deducted'} value={total} bold />
          <ResultRow label={lang === 'ko' ? '보험료 공제 후 (소득세 별도)' : 'After premiums (income tax separate)'} value={net} />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '산재보험은 전액 사업주 부담입니다. 국민연금 기준소득월액 상·하한 등으로 실제와 차이가 날 수 있습니다.'
              : 'Industrial-accident insurance is fully employer-paid. Pension income caps may cause small differences.'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '2026년 요율 기준 · 4대사회보험 정보연계센터 (4insure.or.kr)' : '2026 rates · 4insure.or.kr'}</Text>
    </View>
  );
}

// ── 9. Ordinary hourly wage (통상시급 환산) ──────────────────────────────────

function OrdinaryWageCalc({ lang, minWageHourly }: { lang: 'ko' | 'en'; minWageHourly: number }) {
  const [monthly, setMonthly] = useState('');
  const m = parseNum(monthly);
  const hourly = m / 209;
  const overtime = hourly * 1.5;
  const belowMin = m > 0 && hourly < minWageHourly;

  return (
    <View style={styles.card}>
      <Field label={lang === 'ko' ? '월 통상임금 (기본급+고정수당, ₩)' : 'Monthly ordinary wage (base + fixed allowances, ₩)'} value={monthly} onChange={setMonthly} placeholder="2,156,880" />

      {belowMin && (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>
            {lang === 'ko'
              ? `⚠️ 환산 시급이 2026년 최저임금(₩${fmt(minWageHourly)})보다 낮습니다.`
              : `⚠️ Converted rate is below the 2026 minimum wage (₩${fmt(minWageHourly)}).`}
          </Text>
        </View>
      )}

      {m > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>{lang === 'ko' ? '통상시급 (주 40시간 기준)' : 'Ordinary hourly wage (40h week)'}</Text>
          <ResultRow label={lang === 'ko' ? '통상시급 (월÷209)' : 'Hourly (monthly÷209)'} value={hourly} bold />
          <ResultRow label={lang === 'ko' ? '연장·야간 1시간당 (×1.5)' : 'Per overtime/night hour (×1.5)'} value={overtime} />
          <Text style={styles.resultNote}>
            {lang === 'ko'
              ? '209시간 = (주40시간 + 주휴8시간) × 365÷7÷12. 정기 상여금도 통상임금에 포함될 수 있습니다(2024.12. 대법원).'
              : '209h = (40h + 8h weekly holiday) × 365÷7÷12. Regular bonuses may count toward ordinary wage (Supreme Court, Dec 2024).'}
          </Text>
        </View>
      )}

      <Text style={styles.note}>📜 {lang === 'ko' ? '근로기준법 시행령 제6조' : 'LSA Enforcement Decree §6'}</Text>
    </View>
  );
}

// ── Hub ───────────────────────────────────────────────────────────────────────

const CALCULATORS = [
  { id: 'wage', emoji: '💰', ko: '임금·수당', en: 'Wage & overtime', descKo: '월급·주휴·가산수당', descEn: 'Monthly pay & premiums' },
  { id: 'severance', emoji: '💼', ko: '퇴직금', en: 'Severance', descKo: '평균임금 30일분×근속', descEn: '30 days × years served' },
  { id: 'juhyu', emoji: '📅', ko: '주휴수당', en: 'Weekly holiday pay', descKo: '주 15시간 이상', descEn: '15+ hours/week' },
  { id: 'yeoncha-days', emoji: '🌴', ko: '연차 개수', en: 'Annual leave days', descKo: '입사일로 계산', descEn: 'From your hire date' },
  { id: 'yeoncha-pay', emoji: '💵', ko: '연차수당', en: 'Unused leave pay', descKo: '미사용 연차 정산', descEn: 'Pay for unused days' },
  { id: 'notice-pay', emoji: '📣', ko: '해고예고수당', en: 'Notice pay', descKo: '통상임금 30일분', descEn: '30 days ordinary wage' },
  { id: 'unemployment', emoji: '🧭', ko: '실업급여', en: 'Unemployment', descKo: '1일 지급액·수급일수', descEn: 'Daily amount & duration' },
  { id: 'insurance', emoji: '🛡️', ko: '4대보험 공제', en: 'Insurance deductions', descKo: '월급에서 얼마 빠지나', descEn: 'What comes off your pay' },
  { id: 'ordinary', emoji: '⚖️', ko: '통상시급 환산', en: 'Ordinary hourly wage', descKo: '월급 → 시급·연장단가', descEn: 'Monthly → hourly rate' },
] as const;

type CalcId = (typeof CALCULATORS)[number]['id'];

export default function ToolsScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { minWageHourly } = useConfig();
  const [selected, setSelected] = useState<CalcId | null>(null);

  const current = CALCULATORS.find(c => c.id === selected);

  function renderCalc(id: CalcId) {
    switch (id) {
      case 'wage': return <WageCalc lang={lang} minWageHourly={minWageHourly} />;
      case 'severance': return <SeveranceCalc lang={lang} />;
      case 'juhyu': return <JuhyuCalc lang={lang} minWageHourly={minWageHourly} />;
      case 'yeoncha-days': return <YeonchaDaysCalc lang={lang} />;
      case 'yeoncha-pay': return <YeonchaPayCalc lang={lang} />;
      case 'notice-pay': return <NoticePayCalc lang={lang} />;
      case 'unemployment': return <UnemploymentCalc lang={lang} minWageHourly={minWageHourly} />;
      case 'insurance': return <InsuranceCalc lang={lang} />;
      case 'ordinary': return <OrdinaryWageCalc lang={lang} minWageHourly={minWageHourly} />;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => selected ? setSelected(null) : router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
          >
            <Text style={styles.backText}>
              ← {selected ? (lang === 'ko' ? '계산기 목록' : 'All calculators') : (lang === 'ko' ? '뒤로' : 'Back')}
            </Text>
          </TouchableOpacity>

          {selected && current ? (
            <>
              <Text style={styles.title}>{current.emoji} {lang === 'ko' ? current.ko : current.en}</Text>
              <Text style={styles.subtitle}>{lang === 'ko' ? current.descKo : current.descEn}</Text>
              {renderCalc(selected)}
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  {lang === 'ko'
                    ? '계산 결과는 참고용 추정치입니다. 정확한 금액은 노무사나 관계 기관에서 확인하세요.'
                    : 'Results are estimates for reference. Confirm exact amounts with a labor attorney or the relevant agency.'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{lang === 'ko' ? '계산기 모음' : 'Calculators'}</Text>
              <Text style={styles.subtitle}>
                {lang === 'ko' ? '내가 받아야 할 금액을 직접 확인하세요.' : 'Work out what you should be paid.'}
              </Text>

              <View style={styles.hubGrid}>
                {CALCULATORS.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.hubCard}
                    onPress={() => setSelected(c.id)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={lang === 'ko' ? c.ko : c.en}
                  >
                    <Text style={styles.hubEmoji}>{c.emoji}</Text>
                    <Text style={styles.hubName}>{lang === 'ko' ? c.ko : c.en}</Text>
                    <Text style={styles.hubDesc} numberOfLines={2}>{lang === 'ko' ? c.descKo : c.descEn}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

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

  // Hub grid
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  hubCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    ...shadow.card,
    minHeight: 104,
  },
  hubEmoji: { fontSize: 26, marginBottom: spacing.xs },
  hubName: { ...typography.bodyS, color: colors.text, fontWeight: '700', marginBottom: 2 },
  hubDesc: { fontSize: 11, color: colors.textCaption, lineHeight: 15 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },

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
    // lineHeight inside TextInput clips character bottoms on iOS
    lineHeight: undefined,
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
  resultNote: { ...typography.caption, color: colors.textCaption, marginTop: spacing.xs, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  note: { fontSize: 11, color: colors.textCaption, lineHeight: 16, marginTop: spacing.xs },

  disclaimer: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  disclaimerText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
