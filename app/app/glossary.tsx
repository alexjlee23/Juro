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

const CATEGORIES: Record<string, { ko: string; en: string }> = {
  wage:       { ko: '💰 임금·수당', en: '💰 Wages & allowances' },
  hours:      { ko: '🕐 근로시간·휴가', en: '🕐 Hours & leave' },
  exit:       { ko: '🚪 퇴직·해고', en: '🚪 Leaving & dismissal' },
  insurance:  { ko: '🛡️ 보험·지원금', en: '🛡️ Insurance & benefits' },
  contract:   { ko: '📋 계약·고용형태', en: '📋 Contracts & employment types' },
  safety:     { ko: '⛑️ 안전·존엄', en: '⛑️ Safety & dignity' },
  system:     { ko: '🏛️ 기관·제도', en: '🏛️ Institutions & procedures' },
};

const CATEGORY_ORDER = ['wage', 'hours', 'exit', 'insurance', 'contract', 'safety', 'system'];

const TERMS = [
  // ── 💰 임금·수당 ──────────────────────────────────────────────────────────
  {
    id: 'tongsung', cat: 'wage',
    ko: '통상임금',
    en: 'Ordinary wage (통상임금)',
    defKo: '정기적·일률적으로 지급하기로 정한 임금. 연장·야간·휴일 가산수당(+50%, +100%), 해고예고수당, 연차수당 계산의 기준입니다. 2024년 12월 대법원 판결로 재직 조건이 붙은 정기 상여금도 통상임금에 포함될 수 있게 되어, 기본급만으로 수당을 계산했다면 차액을 청구할 여지가 있습니다.',
    defEn: 'The wage agreed to be paid regularly and uniformly. It is the base for overtime/night/holiday premiums (+50%, +100%), dismissal notice pay, and annual leave pay. A Dec 2024 Supreme Court ruling means regular bonuses (even with attendance conditions) can count as ordinary wage — if your premiums were computed on base salary only, you may be owed the difference.',
    statute: '근로기준법 시행령 제6조',
    url: 'https://www.law.go.kr/법령/근로기준법시행령',
  },
  {
    id: 'pyeogyun', cat: 'wage',
    ko: '평균임금',
    en: 'Average wage (평균임금)',
    defKo: '사유 발생일 이전 3개월간 지급된 임금 총액 ÷ 그 기간의 총 일수. 퇴직금, 산재 휴업급여, 휴업수당 계산에 사용됩니다. 상여금·연차수당도 일정 비율 포함되므로, 회사가 기본급만으로 퇴직금을 계산했다면 다시 확인하세요. 평균임금이 통상임금보다 낮으면 통상임금을 적용합니다.',
    defEn: 'Total wages over the 3 months before the triggering date ÷ total calendar days in that period. Used for severance pay, industrial-accident benefits, and shutdown allowance. Bonuses and leave pay count proportionally — if severance was computed on base salary only, re-check it. If average wage is lower than ordinary wage, ordinary wage applies.',
    statute: '근로기준법 제2조 제1항 제6호',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'choejeoim', cat: 'wage',
    ko: '최저임금',
    en: 'Minimum wage (최저임금)',
    defKo: '', // filled dynamically
    defEn: '',
    statute: '최저임금법 제6조',
    url: 'https://www.minimumwage.go.kr',
  },
  {
    id: 'imgeumchebol', cat: 'wage',
    ko: '임금체불',
    en: 'Wage arrears (임금체불)',
    defKo: '임금을 제때, 전액 지급하지 않는 것. 3년 이하 징역 또는 3,000만원 이하 벌금 대상이며, 재직 중이든 퇴직했든 지급이 늦어진 기간에 대해 연 20%의 지연이자가 붙고(2025.10.부터 재직자에게도 적용), 고의적 체불은 법원이 최대 3배의 배상을 명할 수 있습니다. 노동포털(labor.moel.go.kr)에서 무료로 진정을 접수할 수 있고, 청구 시효는 3년입니다.',
    defEn: 'Failure to pay wages in full and on time. Punishable by up to 3 years in prison or a ₩30M fine. 20%/year interest accrues on late payment (since Oct 2025, for current employees too — not just after leaving), and courts can award up to treble damages for willful non-payment. File a free complaint at labor.moel.go.kr. Claims expire after 3 years.',
    statute: '근로기준법 제43·36·37·109조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'juhyu', cat: 'wage',
    ko: '주휴수당',
    en: 'Weekly holiday pay (주휴수당)',
    defKo: '1주 15시간 이상 일하고 소정 근로일을 개근하면 유급 휴일 하루치 임금을 추가로 받습니다. 주 40시간 근무 시 8시간분, 주 20시간이면 4시간분입니다. 아르바이트·단기 근로자도 대상이며, 시급 알바라면 "시급 × 주휴 포함 여부"를 반드시 확인하세요.',
    defEn: 'Work 15+ hours a week with full attendance on scheduled days → one extra paid rest day. At 40h/week that is 8 hours\' pay; at 20h/week, 4 hours\'. Part-timers qualify too — hourly workers should always check whether their rate includes 주휴수당.',
    statute: '근로기준법 제55조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'gasan', cat: 'wage',
    ko: '가산수당 (연장·야간·휴일)',
    en: 'Premium pay (가산수당)',
    defKo: '연장근로(소정 근로시간 초과) +50%, 야간근로(22시~06시) +50%, 휴일근로 8시간 이내 +50%·초과분 +100%. 중복되면 합산됩니다(예: 휴일 야간 연장). 5인 이상 사업장에만 적용되며, 통상임금이 계산 기준입니다.',
    defEn: 'Overtime (beyond scheduled hours) +50%, night work (22:00–06:00) +50%, holiday work +50% up to 8h and +100% beyond. Rates stack when overlapping (e.g., holiday night overtime). Applies only at 5+ employee workplaces, calculated on ordinary wage.',
    statute: '근로기준법 제56조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'yeonchasudang', cat: 'wage',
    ko: '연차수당',
    en: 'Unused leave pay (연차수당)',
    defKo: '사용하지 못한 연차휴가를 돈으로 받는 것. 미사용 연차 1일당 1일분 통상임금입니다. 퇴직 시 남은 연차는 전부 수당으로 정산해야 하며, 회사가 적법한 "연차사용촉진" 절차를 거치지 않았다면 소멸된 연차도 수당 청구가 가능합니다.',
    defEn: 'Cash payment for unused annual leave — one day\'s ordinary wage per unused day. On leaving, all remaining days must be paid out. If the employer did not follow the formal leave-use promotion procedure, expired days can still be claimed as pay.',
    statute: '근로기준법 제60·61조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'huupsudang', cat: 'wage',
    ko: '휴업수당',
    en: 'Shutdown allowance (휴업수당)',
    defKo: '회사 사정(주문 감소, 자재 부족, 공사 중단 등)으로 일을 쉬게 되면 사용자는 평균임금의 70% 이상을 휴업수당으로 지급해야 합니다. "일이 없으니 무급으로 쉬어라"는 위법입니다. 5인 이상 사업장 적용.',
    defEn: 'If work stops for reasons attributable to the employer (fewer orders, material shortages, site suspension), the employer must pay at least 70% of average wage. "No work, no pay — stay home" is illegal. Applies at 5+ employee workplaces.',
    statute: '근로기준법 제46조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'pogwal', cat: 'wage',
    ko: '포괄임금제',
    en: 'Inclusive wage contract (포괄임금제)',
    defKo: '"연장·야간수당을 월급에 포함해서 준다"는 계약 방식. 그러나 실제 초과근로가 포함된 수당분을 넘으면 그 차액은 별도로 청구할 수 있습니다. 법원은 포괄임금 약정을 엄격하게 해석하므로, 근무시간 기록을 남겨두면 유리합니다.',
    defEn: 'A contract that "includes" overtime/night pay in the monthly salary. But if your actual overtime exceeds what the inclusion covers, you can claim the difference. Courts interpret these clauses strictly — keep records of your actual hours.',
    statute: '근로기준법 제56조 · 대법원 판례',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'myeongsese', cat: 'wage',
    ko: '임금명세서',
    en: 'Pay stub (임금명세서)',
    defKo: '2021년 11월부터 모든 사업장(1인 이상)은 임금 지급 시 항목별 금액과 계산 방법이 적힌 명세서를 서면·전자로 교부해야 합니다. 미교부·허위 기재 시 500만원 이하 과태료. 명세서는 체불 진정 시 핵심 증거가 됩니다.',
    defEn: 'Since Nov 2021, every employer (even with 1 employee) must provide an itemized pay stub (paper or electronic) showing amounts and calculation methods. Penalty up to ₩5M. Pay stubs are key evidence in wage-arrears complaints.',
    statute: '근로기준법 제48조 제2항',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  // ── 🕐 근로시간·휴가 ──────────────────────────────────────────────────────
  {
    id: 'sojeong', cat: 'hours',
    ko: '소정근로시간',
    en: 'Scheduled working hours (소정근로시간)',
    defKo: '법정 한도(1일 8시간, 주 40시간) 안에서 회사와 내가 일하기로 정한 시간. 주휴수당, 통상임금(시급 환산), 연장근로 판단의 기준이 됩니다. 근로계약서에 반드시 명시되어야 합니다.',
    defEn: 'The hours you and your employer agreed you will work, within the legal cap (8h/day, 40h/week). It is the baseline for weekly holiday pay, hourly conversion of ordinary wage, and what counts as overtime. Must be stated in your contract.',
    statute: '근로기준법 제2조·제50조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'ju52', cat: 'hours',
    ko: '주 52시간제',
    en: '52-hour workweek (주 52시간제)',
    defKo: '법정 근로 주 40시간 + 연장근로 최대 12시간 = 주 최대 52시간. 이를 초과하는 근로 지시는 거부할 수 있고 사용자는 처벌 대상입니다. 5인 이상 사업장 적용. 특별연장근로는 고용노동부 인가가 필요한 예외입니다.',
    defEn: 'Statutory 40 hours + max 12 overtime hours = 52 hours/week maximum. You may refuse orders beyond this and the employer faces penalties. Applies at 5+ workplaces; exceptions require Ministry of Labor authorization.',
    statute: '근로기준법 제50·53조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'hyuge', cat: 'hours',
    ko: '휴게시간',
    en: 'Rest breaks (휴게시간)',
    defKo: '근로시간 4시간에 30분, 8시간에 1시간 이상을 근로시간 도중에 줘야 합니다. 휴게시간은 자유롭게 이용할 수 있어야 하며, 전화 대기·손님 응대를 시키면 휴게가 아니라 근로시간(유급)입니다. 사업장 규모와 무관하게 적용.',
    defEn: 'At least 30 minutes per 4 hours of work, 1 hour per 8 hours, given during the workday. Breaks must be genuinely free — if you must answer phones or customers, it is paid working time, not a break. Applies at all workplace sizes.',
    statute: '근로기준법 제54조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'yeonja', cat: 'hours',
    ko: '연차휴가',
    en: 'Annual leave (연차휴가)',
    defKo: '1년간 80% 이상 출근 → 15일(근속 2년마다 1일 가산, 최대 25일). 1년 미만은 한 달 개근마다 1일(최대 11일). 연차는 근로자가 원하는 날 쓰는 것이 원칙이고, 미사용분은 수당으로 받습니다. 5인 이상 사업장 적용.',
    defEn: '80%+ attendance over a year → 15 days (+1 day per 2 years of service, max 25). Under 1 year: 1 day per full month (max 11). You choose when to use leave, and unused days convert to pay. Applies at 5+ workplaces.',
    statute: '근로기준법 제60조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'gonghyu', cat: 'hours',
    ko: '공휴일·대체공휴일',
    en: 'Public holidays (공휴일)',
    defKo: '설날·추석·삼일절 등 관공서 공휴일과 대체공휴일은 5인 이상 사업장에서 유급휴일입니다. 이날 일하면 휴일근로 가산수당(+50%)을 받아야 하고, 2022년부터는 공휴일을 연차로 대체하는 것이 금지되었습니다.',
    defEn: 'Official public holidays (Seollal, Chuseok, etc.) and substitute holidays are paid days off at 5+ workplaces. Working them earns the +50% holiday premium, and since 2022 employers may NOT substitute your annual leave for public holidays.',
    statute: '근로기준법 제55조 제2항',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'chulsan', cat: 'hours',
    ko: '출산전후휴가',
    en: 'Maternity leave (출산전후휴가)',
    defKo: '출산 전후 90일(다태아 120일, 미숙아 출산으로 신생아가 중환자실에 입원하면 100일), 출산 후에 45일 이상이 확보되어야 합니다. 급여는 고용보험과 사업주가 분담 지급하며, 사업장 규모와 무관하게 모든 여성 근로자에게 적용됩니다. 임신 중 근로시간 단축 제도도 있습니다.',
    defEn: '90 days around childbirth (120 for multiples; 100 if a premature newborn is in intensive care), with at least 45 days after birth. Paid via employment insurance and the employer. Applies to all female workers at any workplace size. Reduced hours during pregnancy are also available.',
    statute: '근로기준법 제74조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'yuga', cat: 'hours',
    ko: '육아휴직',
    en: 'Parental leave (육아휴직)',
    defKo: '만 8세 이하(초2 이하) 자녀를 둔 근로자는 최대 1년(요건 충족 시 1년 6개월)의 육아휴직을 쓸 수 있습니다. 급여는 고용보험에서 지급. 사업주가 거부하거나 불이익을 주면 처벌 대상이며, 모든 사업장에 적용됩니다.',
    defEn: 'Workers with a child aged 8 or under can take up to 1 year of parental leave (up to 18 months if conditions are met), paid through employment insurance. Refusal or retaliation by the employer is punishable. Applies at all workplaces.',
    statute: '남녀고용평등법 제19조',
    url: 'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
  },
  // ── 🚪 퇴직·해고 ─────────────────────────────────────────────────────────
  {
    id: 'toejikgeum', cat: 'exit',
    ko: '퇴직금',
    en: 'Severance pay (퇴직금)',
    defKo: '1주 15시간 이상, 1년 이상 계속 근무했다면 사업장 규모와 무관하게 퇴직금을 받습니다. 금액은 평균임금 30일분 × 근속연수, 퇴직 후 14일 이내 지급 의무(지연 시 연 20% 이자). 청구 시효 3년. 일용직·알바도 계속근로가 인정되면 대상입니다.',
    defEn: 'Work 15+ hours/week for 1+ continuous year → severance at any workplace size. Amount: 30 days\' average wage × years of service, due within 14 days of leaving (20%/yr interest if late). 3-year claim window. Daily and part-time workers qualify if service was continuous.',
    statute: '근로자퇴직급여보장법 제8·9조',
    url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법',
  },
  {
    id: 'toejikyeongeum', cat: 'exit',
    ko: '퇴직연금 (DB·DC·IRP)',
    en: 'Retirement pension (퇴직연금)',
    defKo: 'DB형(확정급여)은 퇴직금과 동일하게 평균임금 기준, DC형(확정기여)은 회사가 매년 연간 임금총액의 1/12 이상을 내 계좌에 넣는 방식입니다. DC형 불입이 밀리면 지연이자가 붙고 처벌 대상이니, 가입자라면 적립금 내역을 확인해 보세요. 퇴사 시 IRP 계좌로 이전됩니다.',
    defEn: 'DB (defined benefit) pays like traditional severance on average wage; DC (defined contribution) requires the employer to deposit at least 1/12 of your annual wages into your account each year. Missed DC contributions accrue interest and are punishable — check your balance. On leaving, funds transfer to an IRP account.',
    statute: '근로자퇴직급여보장법 제13~20조',
    url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법',
  },
  {
    id: 'haegoyego', cat: 'exit',
    ko: '해고예고·해고예고수당',
    en: 'Dismissal notice & notice pay (해고예고수당)',
    defKo: '해고하려면 30일 전에 예고하거나, 즉시 해고 시 30일분 이상의 통상임금(해고예고수당)을 지급해야 합니다. 3개월 미만 근속, 천재지변, 근로자의 중대한 귀책 등은 예외. 해고예고를 했더라도 해고 자체가 정당해야 하는 것은 별개 문제입니다.',
    defEn: 'Dismissal requires 30 days\' notice, or immediate dismissal with 30+ days\' ordinary wage (notice pay). Exceptions: under 3 months\' service, disasters, serious worker misconduct. Note: giving notice does not by itself make the dismissal lawful.',
    statute: '근로기준법 제26조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'budanghago', cat: 'exit',
    ko: '부당해고',
    en: 'Unfair dismissal (부당해고)',
    defKo: '정당한 이유 없는 해고, 또는 사유와 시기를 서면으로 통지하지 않은 해고는 무효입니다(구두·문자 해고 포함). 5인 이상 사업장이라면 해고일로부터 3개월 내 노동위원회에 구제신청을 하세요. 인정되면 복직 또는 금전보상과 해고 기간의 임금을 받습니다.',
    defEn: 'Dismissal without just cause, or without written notice of reason and date, is void (verbal or text-message firings included). At 5+ workplaces, apply to the Labor Relations Commission within 3 months. If upheld: reinstatement or monetary compensation plus back pay.',
    statute: '근로기준법 제23·27·28조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'gwongosajik', cat: 'exit',
    ko: '권고사직',
    en: 'Resignation by request (권고사직)',
    defKo: '회사의 권유를 받아들여 스스로 사직서를 내는 것. 해고가 아니므로 구제신청 대상은 아니지만, 회사 사정에 의한 권고사직은 실업급여를 받을 수 있습니다. 사직서에 서명을 강요당했다면 부당해고를 다툴 수 있으니, 강요 정황(녹음·메시지)을 남겨두세요. "자진 퇴사"로 처리하자는 요구는 실업급여를 잃게 하므로 거절하세요.',
    defEn: 'Resigning at the company\'s request. Not technically a dismissal, but company-initiated 권고사직 qualifies for unemployment benefits. If you were pressured to sign, it may count as unfair dismissal — keep evidence (recordings, messages). Refuse requests to record it as "voluntary resignation," which would forfeit your benefits.',
    statute: '고용보험법 시행규칙 별표2',
    url: 'https://www.law.go.kr/법령/고용보험법시행규칙',
  },
  {
    id: 'susup', cat: 'exit',
    ko: '수습기간',
    en: 'Probation (수습기간)',
    defKo: '1년 이상 계약에서 최대 3개월까지 최저임금의 90%를 줄 수 있습니다(단순노무직은 100% 지급). "수습이니까 자유롭게 자를 수 있다"는 틀린 말로, 수습 해고에도 객관적으로 합리적인 이유가 필요하며 서면 통지 의무도 동일하게 적용됩니다.',
    defEn: 'On contracts of 1+ year, up to 90% of minimum wage may be paid for the first 3 months (simple-labor jobs must get 100%). "We can fire freely during probation" is false — probationary dismissal still requires objectively reasonable grounds and written notice.',
    statute: '최저임금법 제5조 · 근로기준법 제23·27조',
    url: 'https://www.law.go.kr/법령/최저임금법',
  },
  {
    id: 'silup', cat: 'exit',
    ko: '실업급여 (구직급여)',
    en: 'Unemployment benefits (실업급여)',
    defKo: '이직 전 18개월 중 고용보험 가입 180일 이상 + 비자발적 이직(해고, 권고사직, 계약만료 등)이면 받을 수 있습니다. 자발적 퇴사도 임금체불·괴롭힘·통근 곤란 등 정당한 사유가 있으면 가능. 이직 후 지체 없이 고용센터(고용24)에서 신청하세요. 상한액은 1일 66,000원대입니다.',
    defEn: 'Requires 180+ insured days in the 18 months before leaving, plus involuntary separation (dismissal, requested resignation, contract expiry). Voluntary quitters can still qualify with just cause — wage arrears, harassment, impossible commutes. Apply promptly at the employment center (gojyong24). Daily cap ≈ ₩66,000.',
    statute: '고용보험법 제40조',
    url: 'https://www.law.go.kr/법령/고용보험법',
  },
  // ── 🛡️ 보험·지원금 ──────────────────────────────────────────────────────
  {
    id: 'sahbo', cat: 'insurance',
    ko: '4대보험',
    en: 'Four social insurances (4대보험)',
    defKo: '국민연금·건강보험·고용보험·산재보험. 주 15시간(월 60시간) 이상 일하면 대부분 의무 가입이며 사업주가 신고·납부 책임을 집니다. 산재보험은 근로시간·국적과 무관하게 모든 근로자에게 적용됩니다. 가입을 안 해줬어도 산재·실업급여를 소급해 받을 길이 있으니 포기하지 마세요.',
    defEn: 'National Pension, Health, Employment, and Industrial Accident insurance. Mandatory for most workers at 15+ hours/week, with the employer responsible for enrollment and payment. Accident insurance covers ALL workers regardless of hours or nationality. Even if never enrolled, benefits can often be claimed retroactively.',
    statute: '각 보험법',
    url: 'https://www.comwel.or.kr',
  },
  {
    id: 'goyongbohum', cat: 'insurance',
    ko: '고용보험',
    en: 'Employment insurance (고용보험)',
    defKo: '실업급여와 육아휴직급여의 재원이 되는 보험. 이직 시 회사가 "이직확인서"를 제출해야 실업급여 절차가 진행되는데, 회사가 미루면 고용센터에 요청해 처리할 수 있습니다. 이직 사유 코드가 실업급여 수급을 좌우하니 확인서 내용을 꼭 확인하세요.',
    defEn: 'Funds unemployment and parental-leave benefits. Your employer must file a separation report (이직확인서) for your claim to proceed — if they stall, the employment center can compel it. The separation-reason code determines eligibility, so verify what they filed.',
    statute: '고용보험법',
    url: 'https://www.law.go.kr/법령/고용보험법',
  },
  {
    id: 'sanjae', cat: 'insurance',
    ko: '산재 (산업재해)',
    en: 'Industrial accident (산재)',
    defKo: '업무상 부상·질병·사망뿐 아니라 출퇴근 중 사고도 산재입니다. 회사 동의 없이 근로복지공단(☎1588-0075)에 직접 신청할 수 있고, 치료비(요양급여)·휴업급여(평균임금 70%)·장해급여를 받습니다. "공상 처리하자"는 제안은 후유증 보상을 막을 수 있으니 신중하세요. 국적·비자와 무관하게 적용됩니다.',
    defEn: 'Covers work injuries, illness, death — and commuting accidents. File directly with COMWEL (☎1588-0075); no employer consent needed. Benefits: medical costs, 70% wage replacement, disability compensation. Beware "private settlement" offers that forfeit future coverage. Applies regardless of nationality or visa.',
    statute: '산업재해보상보험법 제37조',
    url: 'https://www.law.go.kr/법령/산업재해보상보험법',
  },
  {
    id: 'daejigeup', cat: 'insurance',
    ko: '간이대지급금',
    en: 'Substitute payment (간이대지급금)',
    defKo: '회사가 임금·퇴직금을 못 주면 국가가 먼저 지급해 주는 제도. 퇴직자는 최대 1,000만원(임금·퇴직금 각 700만원 한도), 재직자도 일정 요건에서 가능합니다. 노동청 진정으로 "체불 확인서"를 받은 뒤 근로복지공단에 신청하며, 소송 없이도 받을 수 있습니다.',
    defEn: 'The state pays your unpaid wages/severance first when the employer cannot — up to ₩10M for departed workers (₩7M each for wages and severance). Get an arrears confirmation through a labor-office complaint, then apply to COMWEL. No lawsuit required.',
    statute: '임금채권보장법 제7조',
    url: 'https://www.law.go.kr/법령/임금채권보장법',
  },
  // ── 📋 계약·고용형태 ─────────────────────────────────────────────────────
  {
    id: 'gyeyakseo', cat: 'contract',
    ko: '근로계약서',
    en: 'Employment contract (근로계약서)',
    defKo: '임금(구성·계산·지급방법), 소정근로시간, 휴일, 연차를 서면에 명시해 근로자에게 교부해야 합니다. 미교부 시 500만원 이하 벌금(기간제·단시간은 즉시 과태료). 하루짜리 알바여도 의무입니다. 계약서가 없으면 문자·카톡으로 근로조건을 남겨두는 것이 차선책입니다.',
    defEn: 'Must state wages (composition, calculation, payment method), scheduled hours, rest days, and annual leave in writing, with a copy given to you. Violation: up to ₩5M fine (immediate for fixed-term/part-time). Required even for one-day jobs. No contract? Get your terms in writing via text as a fallback.',
    statute: '근로기준법 제17조 · 기간제법 제17조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'chwieopgyuchik', cat: 'contract',
    ko: '취업규칙',
    en: 'Rules of employment (취업규칙)',
    defKo: '상시 10인 이상 사업장은 취업규칙을 만들어 노동청에 신고하고 근로자가 볼 수 있게 해야 합니다. 임금·징계·복무 기준이 담기며, 근로자에게 불리하게 바꾸려면 근로자 과반수(또는 과반수 노조)의 동의가 필요합니다. 동의 없는 불이익 변경은 무효입니다.',
    defEn: 'Workplaces with 10+ employees must file rules of employment with the labor office and make them accessible. They govern pay, discipline, and duties. Changes disadvantageous to workers require majority consent — without it, the change is void.',
    statute: '근로기준법 제93·94조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'gijije', cat: 'contract',
    ko: '기간제 (계약직)',
    en: 'Fixed-term worker (기간제)',
    defKo: '계약 기간이 정해진 근로자. 한 사업장에서 2년을 초과해 계속 사용하면 기간의 정함이 없는(무기계약) 근로자로 간주됩니다. 계약직이라는 이유로 동종 업무 정규직과 차별하는 것은 금지되며, 노동위원회에 차별 시정을 신청할 수 있습니다.',
    defEn: 'A worker on a contract with an end date. Employed continuously beyond 2 years → deemed a permanent (open-ended) employee. Discrimination against fixed-term workers doing the same work as regulars is prohibited and can be challenged at the Labor Relations Commission.',
    statute: '기간제법 제4·8조',
    url: 'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률',
  },
  {
    id: 'ilyongjik', cat: 'contract',
    ko: '일용직',
    en: 'Daily worker (일용직)',
    defKo: '하루 단위로 고용되는 근로자. 그래도 최저임금·주휴수당(주 15시간 이상 계속 시)·산재보험은 똑같이 적용되고, 사실상 계속 고용되어 1년을 넘기면 퇴직금도 발생합니다. 팀장(십장)을 통한 일당 수령은 임금 직접지급 원칙 위반 소지가 있으니 본인 계좌로 받는 것이 안전합니다.',
    defEn: 'Hired by the day — but minimum wage, weekly holiday pay (if effectively 15+ h/week), and accident insurance still apply, and continuous work beyond a year generates severance. Wages paid through a foreman may violate the direct-payment rule; insist on your own account.',
    statute: '근로기준법 제2조·제43조',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'samsam', cat: 'contract',
    ko: '3.3% 계약 (프리랜서 처리)',
    en: '3.3% "freelancer" contract',
    defKo: '급여에서 3.3% 사업소득세만 떼는 것은 회사가 나를 "개인사업자"로 처리한다는 뜻입니다. 하지만 출퇴근 시간이 정해져 있고 업무 지시를 받는다면 실질은 근로자이며, 4대보험·퇴직금·연차·해고 보호를 모두 주장할 수 있습니다. 계약서 명칭이 아니라 일하는 실태가 기준입니다.',
    defEn: 'Withholding only 3.3% business-income tax means the company treats you as self-employed. But if you have set hours and take direction, you are legally an employee — entitled to social insurance, severance, leave, and dismissal protection. What matters is how you actually work, not the contract\'s label.',
    statute: '근로기준법 제2조 · 대법원 근로자성 판례',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'oinmiman', cat: 'contract',
    ko: '5인 미만 사업장',
    en: 'Under-5-employee workplace (5인 미만)',
    defKo: '상시 근로자 5인 미만이면 일부 조항이 적용되지 않습니다 — 연장·야간·휴일 가산수당, 연차휴가, 부당해고 구제신청, 주 52시간, 직장 내 괴롭힘 조항 등. 그러나 최저임금, 주휴수당, 퇴직금, 해고예고수당, 근로계약서, 임금명세서, 휴게시간, 산재, 출산휴가·육아휴직은 모두 그대로 적용됩니다.',
    defEn: 'With fewer than 5 regular employees, some provisions don\'t apply — premium pay, annual leave, unfair-dismissal remedy, the 52-hour cap, harassment provisions. But minimum wage, weekly holiday pay, severance, dismissal notice pay, written contracts, pay stubs, rest breaks, accident insurance, and maternity/parental leave all still apply.',
    statute: '근로기준법 제11조 · 시행령 별표1',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  // ── ⛑️ 안전·존엄 ─────────────────────────────────────────────────────────
  {
    id: 'goerophim', cat: 'safety',
    ko: '직장 내 괴롭힘',
    en: 'Workplace harassment (직장 내 괴롭힘)',
    defKo: '직장에서의 지위·관계 우위를 이용해 업무상 적정 범위를 넘어 신체적·정신적 고통을 주는 행위. 신고를 받으면 사용자는 즉시 조사하고 피해자를 보호해야 하며, 신고자에 대한 불이익 조치는 3년 이하 징역형 대상입니다. 사용자(또는 그 친족)가 가해자면 최대 1,000만원 과태료. 5인 이상 적용.',
    defEn: 'Using superiority of position or relationship to inflict physical or mental suffering beyond the proper scope of work. On report, the employer must investigate immediately and protect the victim; retaliating against a reporter carries up to 3 years\' imprisonment. If the employer (or their family) is the harasser: up to ₩10M fine. Applies at 5+ workplaces.',
    statute: '근로기준법 제76조의2·3',
    url: 'https://www.law.go.kr/법령/근로기준법',
  },
  {
    id: 'seonghuirong', cat: 'safety',
    ko: '직장 내 성희롱',
    en: 'Workplace sexual harassment (성희롱)',
    defKo: '성적 언동으로 굴욕감·혐오감을 주거나, 이를 거부했다는 이유로 고용상 불이익을 주는 것. 괴롭힘과 달리 사업장 규모와 무관하게 모든 사업장에 적용됩니다. 사업주는 조사·피해자 보호 의무가 있고, 피해자에 대한 불리한 처우는 3년 이하 징역 대상입니다.',
    defEn: 'Sexual speech or conduct causing humiliation, or employment disadvantage for refusing it. Unlike the harassment provisions, this applies at ALL workplace sizes. Employers must investigate and protect victims; adverse treatment of a victim carries up to 3 years\' imprisonment.',
    statute: '남녀고용평등법 제12~14조',
    url: 'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
  },
  {
    id: 'jakupjungji', cat: 'safety',
    ko: '작업중지권',
    en: 'Right to stop work (작업중지권)',
    defKo: '산업재해가 발생할 급박한 위험이 있으면 작업을 중지하고 대피할 권리가 있습니다. 합리적인 이유가 있는 작업중지를 이유로 해고 등 불리한 처우를 하면 안 됩니다. 위험 상황은 안전신문고 앱이나 ☎1350으로 신고할 수 있습니다.',
    defEn: 'When there is imminent danger of an industrial accident, you may stop work and evacuate. Dismissal or disadvantage for a reasonable work stoppage is prohibited. Report hazards via the Safety Report app or ☎1350.',
    statute: '산업안전보건법 제52조',
    url: 'https://www.law.go.kr/법령/산업안전보건법',
  },
  {
    id: 'jungdae', cat: 'safety',
    ko: '중대재해처벌법',
    en: 'Serious Accidents Punishment Act (중대재해처벌법)',
    defKo: '사망 등 중대재해가 발생하면 안전보건 확보 의무를 다하지 않은 경영책임자·사업주를 형사 처벌하는 법. 2024년부터 5인 이상 50인 미만 사업장에도 전면 적용됩니다(5인 미만 제외). 하청 노동자 재해도 원청 책임을 물을 수 있습니다.',
    defEn: 'Holds business owners and responsible executives criminally liable for serious accidents (deaths, etc.) when safety duties were neglected. Since 2024 it fully applies to workplaces with 5–49 employees (under-5 exempt). Prime contractors can be liable for subcontractors\' workers.',
    statute: '중대재해처벌법 제4·6조',
    url: 'https://www.law.go.kr/법령/중대재해처벌등에관한법률',
  },
  // ── 🏛️ 기관·제도 ─────────────────────────────────────────────────────────
  {
    id: 'jinjong', cat: 'system',
    ko: '진정 (노동청 신고)',
    en: 'Labor complaint (진정)',
    defKo: '고용노동부에 사용자의 법 위반을 신고하는 절차. 노동포털(labor.moel.go.kr)에서 온라인 접수하거나 사업장 관할 지방노동관서를 방문합니다. 무료이고, 근로감독관이 배정되어 양쪽을 조사한 뒤 시정지시를 내립니다. 처벌을 원하면 진정 대신 "고소"도 가능합니다. 준비물: 근로계약서, 임금명세서, 통장내역, 대화 기록.',
    defEn: 'The procedure for reporting employer violations to the Ministry of Labor — file online at labor.moel.go.kr or at your local labor office. Free; an inspector investigates both sides and orders correction. For criminal punishment you may file a formal accusation (고소) instead. Bring: contract, pay stubs, bank records, message history.',
    statute: '근로기준법 제104조',
    url: 'https://labor.moel.go.kr',
  },
  {
    id: 'gamdokgwan', cat: 'system',
    ko: '근로감독관',
    en: 'Labor inspector (근로감독관)',
    defKo: '노동청 소속 특별사법경찰관으로, 진정·고소 사건을 조사하고 사업장을 감독합니다. 출석 조사 시 증거를 정리해 가면 처리가 빨라집니다. 감독관 처리에 이의가 있으면 담당 부서에 재배정을 요청하거나 국민신문고로 민원을 제기할 수 있습니다.',
    defEn: 'A special judicial police officer at the labor office who investigates complaints and inspects workplaces. Bringing organized evidence to your interview speeds up the case. If unhappy with handling, you can request reassignment or file a civil petition (국민신문고).',
    statute: '근로기준법 제101~106조',
    url: 'https://www.moel.go.kr',
  },
  {
    id: 'nodonwi', cat: 'system',
    ko: '노동위원회',
    en: 'Labor Relations Commission (노동위원회)',
    defKo: '부당해고·차별·부당노동행위 사건을 판정하는 준사법기관. 해고일로부터 3개월 내 지방노동위원회에 신청 → 화해 또는 판정 → 불복 시 중앙노동위원회 재심 → 행정소송 순서로 진행됩니다. 월평균 임금 300만원 미만이면 무료 국선노무사 대리를 받을 수 있습니다.',
    defEn: 'The quasi-judicial body deciding unfair dismissal, discrimination, and unfair labor practice cases. Apply to the regional commission within 3 months of dismissal → settlement or ruling → appeal to the central commission → administrative court. Workers earning under ₩3M/month get a free public labor attorney.',
    statute: '근로기준법 제28조 · 노동위원회법',
    url: 'https://www.nlrc.go.kr',
  },
  {
    id: 'nomusa', cat: 'system',
    ko: '공인노무사',
    en: 'Certified labor attorney (노무사)',
    defKo: '노동법 전문 국가자격사. 임금체불·부당해고·산재 사건에서 상담하고 노동위원회·노동청 절차를 대리합니다. 노동위원회 사건은 월평균 임금 300만원 미만이면 국선노무사가 무료이고, 각 지역 노동권익센터·마을노무사 제도로도 무료 상담을 받을 수 있습니다.',
    defEn: 'A state-licensed labor law specialist who advises on wage, dismissal, and accident cases and represents workers before the labor office and commission. Free representation (국선노무사) is available for commission cases if you earn under ₩3M/month; regional worker-rights centers also offer free consultations.',
    statute: '공인노무사법',
    url: 'https://www.kcplaa.or.kr',
  },
  {
    id: 'nojo', cat: 'system',
    ko: '노동조합',
    en: 'Labor union (노동조합)',
    defKo: '근로자 2인 이상이면 자유롭게 만들 수 있는 단결체. 회사와 단체교섭을 요구할 권리가 있고, 정당한 조합 활동을 이유로 한 해고·불이익(부당노동행위)은 금지됩니다. 사업장에 노조가 없어도 지역·산업별 노조(예: 민주노총 ☎1577-2260)에 개인 가입할 수 있습니다.',
    defEn: 'Two or more workers can freely form a union with the right to demand collective bargaining. Dismissal or disadvantage for legitimate union activity (unfair labor practice) is prohibited. No union at your workplace? You can individually join a regional or industry union (e.g., KCTU ☎1577-2260).',
    statute: '노동조합 및 노동관계조정법',
    url: 'https://www.law.go.kr/법령/노동조합및노동관계조정법',
  },


  // ───────── 📋 계약·고용형태 (contract) ─────────

  {id:'geunroja',cat:'contract',ko:'근로자',en:'Employee / worker (근로자)',
   defKo:'직업 종류와 관계없이 임금을 받으려고 사업장에 일을 제공하는 사람. 계약서 제목이 아니라 실제로 일하는 모습(출퇴근 시간이 정해져 있는지, 업무 지시를 받는지)으로 판단합니다. "프리랜서"·"사장님"으로 불려도 실질이 근로자면 노동법의 보호를 모두 받습니다. 노동조합법상 근로자는 더 넓어서 구직자·해고자도 포함됩니다.',
   defEn:'Anyone who provides work to a business in exchange for wages, regardless of job type. Courts look at how you actually work (set hours, taking direction) — not your contract\'s title. Even if called a "freelancer," you get full labor-law protection if you are in substance an employee. The union-law definition is broader, covering job seekers and dismissed workers.',
   statute:'근로기준법 제2조 제1항 제1호 · 노동조합법 제2조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'노동자 직원 알바 근로자성 프리랜서'},

  {id:'sayongja',cat:'contract',ko:'사용자',en:'Employer (사용자)',
   defKo:'사업주뿐 아니라 경영담당자, 사장을 대신해 근로자를 지휘하는 사람(인사팀장, 현장소장 등)까지 포함하는 개념. 임금 지급, 괴롭힘 조사, 안전 조치 등 노동법상 의무를 지는 쪽입니다. 법인이면 회사 자체와 대표이사가 함께 책임질 수 있습니다.',
   defEn:'Not just the business owner — also managers and anyone directing workers on the owner\'s behalf (HR heads, site managers). The employer side bears labor-law duties: paying wages, investigating harassment, ensuring safety. In a corporation, both the company and its CEO can be liable.',
   statute:'근로기준법 제2조 제1항 제2호',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'사업주 사장 회사 고용주'},

  {id:'dansigan',cat:'contract',ko:'단시간근로자 (파트타임)',en:'Part-time worker (단시간근로자)',
   defKo:'같은 일을 하는 통상 근로자보다 1주 소정근로시간이 짧은 근로자. 근로시간에 비례해 연차·퇴직금 등을 똑같이 받습니다. 다만 4주 평균 주 15시간 미만(초단시간)이면 주휴수당·연차·퇴직금이 적용되지 않는데, 이를 노려 15시간 미만으로 쪼개 계약하는 "쪼개기 계약"이 많으니 실제 일한 시간을 기록해 두세요. 최저임금·산재보험은 시간과 무관하게 적용됩니다.',
   defEn:'A worker with shorter contracted weekly hours than full-timers doing the same work; entitled to leave, severance, etc. in proportion to hours. Below 15 hours/week (4-week average), weekly holiday pay, annual leave and severance don\'t apply — some employers deliberately split contracts under 15 hours, so log your actual hours. Minimum wage and industrial-accident insurance apply regardless.',
   statute:'근로기준법 제2조·제18조 · 기간제법 제8조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'파트타임 알바 아르바이트 초단시간 쪼개기'},

  {id:'pagyeon',cat:'contract',ko:'파견근로자',en:'Dispatched worker (파견근로자)',
   defKo:'파견회사에 고용되어 다른 회사(사용사업주)의 지휘를 받아 일하는 근로자. 법이 정한 32개 업무에서 최대 2년까지만 허용되며, 2년을 넘기면 사용회사가 직접 고용해야 합니다. 사용회사 정규직과 같은 일을 하면 임금 등을 차별받지 않을 권리가 있습니다.',
   defEn:'Employed by a staffing agency but working under another company\'s direction. Allowed only in 32 legally listed job types, for up to 2 years — beyond that, the user company must hire you directly. If you do the same work as its regular staff, pay discrimination is prohibited.',
   statute:'파견법 제5·6조·제6조의2·제21조',url:'https://www.law.go.kr/법령/파견근로자보호등에관한법률',
   keywords:'파견 인력사무소 아웃소싱 사용사업주'},

  {id:'dogeup',cat:'contract',ko:'도급·용역 (하청)',en:'Contracting-out (도급·용역)',
   defKo:'일의 완성을 맡기는 계약. 하청업체 소속으로 일해도 원청은 하청 노동자의 안전에 대해 법적 책임을 지고, 건설업에서는 하청이 임금을 체불하면 바로 위 수급인(원청 등)에게도 연대 책임을 물을 수 있습니다. 임금을 못 받았다면 하청업체만 상대하지 말고 노동청에 원청 연대책임도 함께 진정하세요.',
   defEn:'A contract to complete work. Even as a subcontractor\'s employee, the principal company is legally responsible for your safety, and in construction, if your employer doesn\'t pay wages, the contractor above it can be held jointly liable. When filing a wage complaint, include the principal — not just your direct employer.',
   statute:'근로기준법 제44조·제44조의2 · 산업안전보건법 제63조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'하청 하도급 외주 원청 협력업체 용역업체'},

  {id:'wijang',cat:'contract',ko:'위장도급·불법파견',en:'Disguised contracting (위장도급·불법파견)',
   defKo:'서류상으로는 도급(하청)이지만 실제로는 원청이 직접 업무를 지시하는 경우. 허가 없는 파견이거나 파견이 금지된 업무라면 불법파견이고, 원청에 직접 고용을 요구할 수 있습니다. 원청 직원에게 업무 지시를 받은 기록(메신저·업무일지)이 중요한 증거가 됩니다.',
   defEn:'On paper a subcontract, but in reality the principal company directs your work. If it amounts to unlicensed or prohibited dispatch, it is illegal — and you can demand direct employment by the principal. Records of instructions from the principal\'s staff (messages, work logs) are key evidence.',
   statute:'파견법 제6조의2 · 대법원 판례',url:'https://www.law.go.kr/법령/파견근로자보호등에관한법률',
   keywords:'불법파견 위장도급 사내하청 직접고용'},

  {id:'teukgo',cat:'contract',ko:'특수고용·플랫폼 종사자 (노무제공자)',en:'Gig & platform workers (노무제공자)',
   defKo:'배달라이더, 대리기사, 택배기사, 학습지교사, 보험설계사처럼 개인사업자 형식으로 일하지만 특정 회사·앱에 노무를 제공하는 사람. 법률상 "노무제공자"로서 산재보험이 당연 적용되고 고용보험에도 가입됩니다(보험료는 회사와 분담). 실제로는 출퇴근·업무 지시를 받는다면 아예 근로자로 인정받아 퇴직금·연차까지 주장할 수도 있습니다.',
   defEn:'Delivery riders, designated drivers, couriers, tutors, insurance agents — formally self-employed but providing labor to a specific company or app. As "labor providers" they are automatically covered by industrial-accident insurance and enrolled in employment insurance (premiums shared with the company). If you actually work under direction and set hours, you may qualify as a full employee — with severance and leave.',
   statute:'산재보험법 제91조의15 · 고용보험법 제77조의6',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'특고 플랫폼노동 라이더 배달 대리기사 택배 긱워커'},

  {id:'siyong',cat:'contract',ko:'시용 (본채용 전 시험 고용)',en:'Trial employment (시용)',
   defKo:'정식 채용 전에 일정 기간 근무 적격성을 평가하는 고용. 평가 후 본채용을 거부하는 것도 법적으로는 "해고"라서, 객관적이고 합리적인 이유와 구체적 사유를 적은 서면 통지가 필요합니다. "시용이니까 그냥 내보낼 수 있다"는 오해가 많지만, 막연히 "평가 미달"이라고만 쓴 통지는 부당해고로 다툴 수 있습니다.',
   defEn:'A trial period to assess suitability before formal hiring. Refusing final employment after the trial still counts as a dismissal — it requires objective, reasonable grounds and written notice stating concrete reasons. A vague "failed evaluation" notice can be challenged as unfair dismissal.',
   statute:'근로기준법 제23·27조 · 대법원 판례',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'시용기간 본채용 거부 인턴 수습'},

  {id:'mugi',cat:'contract',ko:'무기계약직',en:'Open-ended contract worker (무기계약직)',
   defKo:'기간제 근로자를 2년 넘게 쓰면 법적으로 기간의 정함이 없는(무기) 근로계약으로 전환된 것으로 봅니다. 계약 만료를 이유로 한 종료는 더 이상 불가능하고, 해고하려면 정당한 이유가 필요합니다. 다만 55세 이상, 일부 전문직, 정부 일자리사업 등은 2년 제한의 예외입니다.',
   defEn:'Using a fixed-term worker beyond 2 years legally converts the contract to open-ended: "contract expiry" is no longer a valid reason to end employment, and dismissal requires just cause. Exceptions to the 2-year cap include workers 55+, certain professionals, and government job programs.',
   statute:'기간제법 제4조',url:'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률',
   keywords:'무기계약 전환 2년 계약직 정규직전환'},

  {id:'seunggye',cat:'contract',ko:'고용승계',en:'Employment succession (고용승계)',
   defKo:'회사가 통째로 다른 회사에 넘어가면(영업양도) 근로관계도 원칙적으로 그대로 승계되어 근속기간·근로조건이 유지됩니다. 청소·경비처럼 용역업체가 바뀌는 경우에도 기존 직원 고용을 이어받는 관행·계약이 있으면 고용승계 기대권이 인정될 수 있습니다. 업체가 바뀐다며 사직서를 요구하면 서명 전에 퇴직금·근속 승계 여부를 반드시 확인하세요.',
   defEn:'When a business is transferred whole, employment relationships carry over — service years and conditions preserved. Even when service contractors change (cleaning, security), courts may recognize an expectation of succession where takeover of staff was customary or agreed. If asked to sign a resignation because "the company is changing," first confirm how severance and tenure will be treated.',
   statute:'대법원 영업양도 판례',url:'https://www.nodong.kr/words',
   keywords:'영업양도 업체변경 용역업체 소속변경 근속인정'},

  // ───────── 💰 임금·수당 (wage) ─────────

  {id:'imgeum',cat:'wage',ko:'임금',en:'Wages (임금)',
   defKo:'월급·일당·수당·상여 등 명칭과 상관없이, 일의 대가로 사용자가 주는 모든 돈. 식대·교통비도 계속·정기적으로 지급되면 임금에 포함될 수 있습니다. 통화로, 본인에게 직접, 전액을, 매월 1회 이상 정해진 날에 줘야 하며, 동의 없이 "손해봤다"며 일방적으로 깎거나 상계할 수 없습니다.',
   defEn:'Every payment from the employer in return for work — salary, daily pay, allowances, bonuses — whatever the name. Even meal or transport money can count if paid regularly. Wages must be paid in currency, directly to you, in full, at least monthly on a fixed day; the employer cannot unilaterally deduct for alleged damages without your consent.',
   statute:'근로기준법 제2조 제1항 제5호·제43조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'월급 급여 봉급 일당 페이 임금정의'},

  {id:'sangyeo',cat:'wage',ko:'상여금 (보너스)',en:'Bonus (상여금)',
   defKo:'월급 외에 정기적(분기·명절 등)으로 지급되는 돈. 취업규칙이나 계약에 지급 근거가 있으면 회사 마음대로 없앨 수 없는 임금입니다. 2024년 12월 대법원 판결로 "지급일에 재직 중일 것" 같은 조건이 붙어도 정기 상여금은 통상임금에 포함되어, 연장수당·퇴직금 계산이 달라질 수 있습니다.',
   defEn:'Money paid regularly on top of salary (quarterly, holidays). If grounded in the rules of employment or your contract, it is wages the company cannot simply cancel. Since the Dec 2024 Supreme Court ruling, regular bonuses count toward ordinary wage even with conditions like "must be employed on payment date" — which can raise your overtime and severance.',
   statute:'근로기준법 제2조 · 대법원 2024.12.19. 전원합의체 판결',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'보너스 명절상여 정기상여 떡값'},

  {id:'seonggwa',cat:'wage',ko:'성과급 (인센티브)',en:'Performance pay (성과급)',
   defKo:'개인이나 회사의 실적에 따라 지급되는 돈. 지급 기준이 미리 정해져 있고 요건을 채웠다면 회사가 "재량"이라며 안 줄 수 없습니다. 개인 실적에 따른 성과급은 임금으로 인정되는 경우가 많아 평균임금(퇴직금 계산)에 들어갈 수 있고, 회사 전체 경영성과급은 사안에 따라 판단이 갈립니다. 지급 기준 문서를 확보해 두세요.',
   defEn:'Pay tied to individual or company performance. If criteria were set in advance and you met them, the company can\'t withhold it as "discretionary." Individual performance pay is often recognized as wages and may enter your average wage (severance base); company-wide profit sharing is judged case by case. Keep documents showing the payment criteria.',
   statute:'근로기준법 제2조 · 판례',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'인센티브 성과금 PS PI 실적급'},

  {id:'jigeupwonchik',cat:'wage',ko:'임금 지급 4원칙',en:'Four rules of wage payment (임금 지급 원칙)',
   defKo:'임금은 ①통화로(물건·상품권 ×) ②본인에게 직접 ③전액을 ④매월 1회 이상 정기적으로 지급해야 합니다. 법령·단체협약 근거 없는 공제(기물 파손비, 유니폼비, "벌금" 등)는 전액불 위반이고, 지각했다고 실제 지각 시간 이상을 깎는 것도 위법입니다. 위반 시 노동청 진정 대상.',
   defEn:'Wages must be paid ① in currency (not goods or vouchers), ② directly to you, ③ in full, ④ at least once a month on a fixed date. Deductions without legal or collective-agreement basis (breakage fees, uniform costs, "fines") violate the full-payment rule, as does docking more than actual late time. Violations can be reported to the labor office.',
   statute:'근로기준법 제43조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'전액불 직접불 통화불 정기불 임금공제 월급깎기'},

  {id:'geumpum',cat:'wage',ko:'금품청산 (퇴직 후 14일)',en:'Final pay settlement (금품청산)',
   defKo:'퇴직·사망 시 임금, 퇴직금, 못 쓴 연차수당 등 모든 금품을 14일 안에 지급해야 합니다. 당사자 합의로만 연장할 수 있고, "다음 정산 때 줄게요"는 합의가 아니면 위법입니다. 14일이 지나면 연 20% 지연이자가 붙고 노동청 진정이 가능합니다. 마지막 월급뿐 아니라 연차수당까지 챙겨 계산하세요.',
   defEn:'On resignation, dismissal, or death, all money owed — wages, severance, unused leave pay — must be paid within 14 days. Extension requires your agreement; "next payroll" is illegal without it. After 14 days, 20% annual interest accrues and you can file with the labor office. Count unused leave pay, not just the last salary.',
   statute:'근로기준법 제36·37조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'퇴직정산 마지막월급 14일 퇴사 밀린돈'},

  // ───────── 🕐 근로시간·휴가 (hours) ─────────

  {id:'beopjeongsigan',cat:'hours',ko:'법정근로시간',en:'Statutory working hours (법정근로시간)',
   defKo:'1일 8시간, 1주 40시간이 법정 한도입니다. 이를 넘는 근로는 당사자 합의가 있어야 하고 주 12시간까지만 가능하며(합쳐서 주 52시간), 50% 가산수당 대상입니다. 18세 미만은 1일 7시간·주 35시간으로 더 짧습니다. 5인 미만 사업장에는 근로시간 상한 규정이 적용되지 않지만, 일한 시간만큼의 임금은 당연히 받아야 합니다.',
   defEn:'The legal limit is 8 hours/day, 40 hours/week. Work beyond it requires your agreement, is capped at 12 extra hours/week (52 total), and earns a 50% premium. Under-18s: 7 hours/day, 35/week. Workplaces with fewer than 5 employees are exempt from the hour caps — but you must still be paid for every hour worked.',
   statute:'근로기준법 제50·53·69조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'근무시간 하루8시간 주40시간 근로시간한도'},

  {id:'tallyeok',cat:'hours',ko:'탄력적 근로시간제',en:'Flexible (averaging) hours (탄력적 근로시간제)',
   defKo:'바쁜 주는 길게, 한가한 주는 짧게 일해서 평균으로 주 40시간을 맞추는 제도. 2주 단위는 취업규칙으로, 3개월·6개월 단위는 근로자대표와의 서면합의가 있어야 유효합니다. 특정 주 48~52시간, 하루 12시간 한도가 있고, 회사가 절차 없이 "이번 달만 더 일해"라고 하는 것은 탄력근로가 아니라 그냥 연장근로(가산수당 대상)입니다.',
   defEn:'Longer busy weeks offset by shorter slow weeks, averaging 40 hours. A 2-week unit needs rules of employment; 3- or 6-month units need a written agreement with the worker representative. Weekly (48–52h) and daily (12h) caps apply. If the company skips these procedures, extra hours are simply overtime — with the 50% premium.',
   statute:'근로기준법 제51조·제51조의2',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'탄력근무 탄력근로 평균근로시간 성수기'},

  {id:'seontaek',cat:'hours',ko:'선택적 근로시간제',en:'Selective (flextime) hours (선택적 근로시간제)',
   defKo:'출퇴근 시각을 근로자가 스스로 정하고, 정산기간(보통 1개월, 연구개발은 3개월) 평균으로 주 40시간을 맞추는 제도. 취업규칙과 근로자대표 서면합의가 필요합니다. 정산기간 평균을 넘긴 시간은 연장근로로 가산수당을 받아야 합니다.',
   defEn:'You choose your own start and end times, averaging 40 hours over a settlement period (usually 1 month; 3 for R&D). Requires rules of employment plus a written worker-representative agreement. Hours beyond the period average are overtime with premium pay.',
   statute:'근로기준법 제52조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'플렉스 자율출퇴근 시차출퇴근 유연근무'},

  {id:'ganjusigan',cat:'hours',ko:'간주근로시간제',en:'Deemed working hours (간주근로시간제)',
   defKo:'외근·출장처럼 사업장 밖에서 일해 실제 근로시간을 재기 어려울 때, 소정근로시간(또는 통상 필요한 시간)을 일한 것으로 "간주"하는 제도. 사무실 밖이라는 이유만으로 적용되는 게 아니라 시간 산정이 정말 어려워야 하며, 앱·GPS 등으로 시간 관리가 되고 있다면 실제 일한 시간대로 임금을 청구할 수 있습니다.',
   defEn:'For off-site work (sales visits, business trips) where actual hours are hard to measure, contracted hours are "deemed" worked. It applies only when hours genuinely can\'t be tracked — if the company monitors you via app or GPS, you can claim pay for actual hours worked.',
   statute:'근로기준법 제58조 제1·2항',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'외근 출장 사업장밖 간주시간'},

  {id:'jaeryang',cat:'hours',ko:'재량근로시간제',en:'Discretionary hours (재량근로시간제)',
   defKo:'연구개발, 기사 취재, 방송 PD, 디자인 등 법령이 정한 업무에서 수행 방법을 근로자 재량에 맡기고, 서면합의로 정한 시간을 일한 것으로 보는 제도. 대상 업무가 아니거나 실제로는 상사가 일일이 지시한다면 재량근로가 성립하지 않아, 실근로시간 기준으로 연장수당을 청구할 수 있습니다.',
   defEn:'For legally listed jobs (R&D, journalism, broadcast producing, design), how you work is left to your discretion, and agreed hours are deemed worked. If your job isn\'t on the list — or a boss actually micromanages your work — the scheme is invalid, and you can claim overtime on real hours.',
   statute:'근로기준법 제58조 제3항 · 시행령 제31조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'재량근무 연구직 크리에이티브 간주'},

  {id:'bosanghyuga',cat:'hours',ko:'보상휴가제',en:'Compensatory leave (보상휴가제)',
   defKo:'연장·야간·휴일근로 수당 대신 유급휴가를 주는 제도. 근로자대표와의 서면합의가 있어야 하고, 가산분을 포함해 1.5배의 시간으로 줘야 합니다(연장 2시간 → 휴가 3시간). 합의 없이 "수당 대신 나중에 쉬어"라고 하거나 1:1로만 계산하는 것은 위법이며, 못 쓴 보상휴가는 수당으로 정산해야 합니다.',
   defEn:'Paid leave granted instead of overtime/night/holiday premiums. Requires a written worker-representative agreement, and must include the premium: 2 overtime hours → 3 hours of leave. "Just take time off later" without agreement, or 1:1 conversion, is illegal — and unused compensatory leave must be paid out.',
   statute:'근로기준법 제57조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'대체휴가 휴가대체 오티 수당대신휴가'},

  {id:'chokjin',cat:'hours',ko:'연차휴가 사용촉진',en:'Leave-use promotion (연차 사용촉진)',
   defKo:'회사가 법이 정한 절차(기한 6개월 전 서면 촉구 → 근로자 미지정 시 회사가 시기 지정)를 모두 지키면, 못 쓴 연차에 대한 수당 지급 의무를 면할 수 있는 제도. 절차가 하나라도 빠졌거나 이메일·구두로만 안내했다면 촉진이 무효라 연차수당을 청구할 수 있습니다. 촉진을 했어도 회사 사정으로 못 쉰 날은 수당 대상입니다.',
   defEn:'If the company follows the exact statutory steps (written notice 6 months before expiry → company designates dates if you don\'t), it can be exempt from paying for unused leave. If any step was skipped or done only verbally/by email, the promotion is invalid — you can still claim leave pay. Days you couldn\'t take for company reasons must be paid regardless.',
   statute:'근로기준법 제61조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'연차촉진 연차수당 소멸 미사용연차'},

  {id:'saengni',cat:'hours',ko:'생리휴가',en:'Menstrual leave (생리휴가)',
   defKo:'여성 근로자가 청구하면 월 1일 쓸 수 있는 무급 휴가(5인 이상 사업장). 사유 증명을 요구하는 것은 부적절하다는 것이 행정해석이며, 청구를 거부한 사용자는 500만원 이하 벌금 대상입니다. 무급이므로 그 달 임금에서 하루치가 빠질 수 있다는 점은 알아두세요.',
   defEn:'One unpaid day per month on request for female workers (5+ workplaces). Officials interpret that demanding proof is improper; refusing the request is punishable by a fine up to ₩5M. Note it is unpaid — one day\'s wage may be deducted for that month.',
   statute:'근로기준법 제73조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'보건휴가 월경 여성휴가'},

  {id:'baeuja',cat:'hours',ko:'배우자 출산휴가',en:'Spousal (paternity) leave (배우자 출산휴가)',
   defKo:'배우자가 출산하면 20일의 유급 휴가를 쓸 수 있습니다(2025.2.23.부터 10일→20일 확대). 출산일부터 120일 이내에 시작해야 하고 3회까지 나눠 쓸 수 있습니다. 중소기업(우선지원대상기업) 근로자는 20일 전부를 고용보험에서 급여 지원받습니다. 회사 규모와 무관하게 모든 남성 근로자에게 적용되고, 거부하면 500만원 이하 과태료 대상입니다.',
   defEn:'20 paid days when your spouse gives birth (expanded from 10 on Feb 23, 2025). Must start within 120 days of birth; can be split into 3 parts. At smaller (priority-support) companies, employment insurance funds all 20 days. Applies at any workplace size; refusal carries a fine up to ₩5M.',
   statute:'남녀고용평등법 제18조의2',url:'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
   keywords:'남편출산휴가 아빠휴가 배출휴 20일'},

  {id:'yugagi',cat:'hours',ko:'육아기 근로시간 단축',en:'Reduced hours for childcare (육아기 근로시간 단축)',
   defKo:'12세 이하(초6 이하) 자녀를 둔 근로자는 주 15~35시간으로 근로시간을 줄일 수 있습니다(2025.2.23.부터 8세→12세 확대). 기본 1년 + 쓰지 않은 육아휴직 기간의 2배를 더해 최대 3년까지 가능. 줄어든 시간 일부는 고용보험에서 급여를 지원합니다. 단축을 이유로 한 해고·불이익은 금지됩니다.',
   defEn:'Parents of children 12 or under (6th grade) can cut hours to 15–35/week (age limit raised from 8 on Feb 23, 2025). Base 1 year, plus twice any unused parental leave — up to 3 years total. Employment insurance partly compensates the reduced hours. Dismissal or disadvantage for using it is prohibited.',
   statute:'남녀고용평등법 제19조의2',url:'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
   keywords:'단축근무 육아단축 시간단축 워킹맘 워킹대디'},

  {id:'gajokdolbom',cat:'hours',ko:'가족돌봄휴가·휴직',en:'Family care leave (가족돌봄휴가·휴직)',
   defKo:'가족(조부모·부모·배우자·배우자의 부모·자녀·손자녀)의 질병·사고·노령 돌봄이 필요할 때, 연 10일의 돌봄휴가(하루 단위)와 연 90일의 돌봄휴직(30일 이상 단위)을 쓸 수 있습니다. 둘 다 무급이지만 회사는 정당한 사유 없이 거부할 수 없고, 사용을 이유로 한 불이익은 금지됩니다.',
   defEn:'To care for a family member (grandparents, parents, spouse, in-laws, children, grandchildren) who is ill, injured, or aged: up to 10 days/year of care leave (by the day) and 90 days/year of care leave-of-absence (30-day blocks). Both unpaid, but the employer can\'t refuse without valid grounds, and disadvantage for using them is banned.',
   statute:'남녀고용평등법 제22조의2',url:'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
   keywords:'돌봄휴가 간병 부모간호 가족간호'},

  {id:'nanim',cat:'hours',ko:'난임치료휴가',en:'Fertility treatment leave (난임치료휴가)',
   defKo:'인공수정·체외수정 등 난임치료를 받을 때 연 6일(그중 2일 유급)의 휴가를 쓸 수 있습니다(2025.2.23.부터 3일→6일 확대). 중소기업 근로자는 유급 2일분 급여를 고용보험이 지원합니다. 회사는 청구를 거부할 수 없고, 근로자가 원하면 사용 사실을 비밀로 해야 합니다.',
   defEn:'Up to 6 days/year (2 paid) for fertility treatment such as IUI/IVF — expanded from 3 days on Feb 23, 2025. At smaller companies, employment insurance funds the 2 paid days. The employer can\'t refuse and must keep your use confidential if you ask.',
   statute:'남녀고용평등법 제18조의3',url:'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
   keywords:'난임 시험관 인공수정 임신준비'},

  {id:'jeogyongjeoe',cat:'hours',ko:'근로시간 적용제외 (경비원 등)',en:'Working-hour exemptions (근로시간 적용제외)',
   defKo:'경비원 같은 감시·단속적 근로자(노동청 승인 필요), 농림·수산업, 임원급 관리감독자는 근로시간·휴게·휴일 규정이 적용되지 않아 연장·휴일 가산수당이 없습니다. 하지만 야간(22~06시) 가산수당, 연차휴가, 최저임금은 그대로 적용됩니다. 노동청 승인 없이 "경비니까 수당 없음"이라고 하면 위법이니 승인 여부를 확인하세요.',
   defEn:'Surveillance/intermittent workers like security guards (labor-office approval required), agriculture/fishery workers, and genuine supervisors are exempt from hour, break, and holiday rules — so no overtime/holiday premiums. But night premiums (10pm–6am), annual leave, and minimum wage still apply. Without official approval, denying premiums to a guard is illegal — check whether approval exists.',
   statute:'근로기준법 제63조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'감시단속적 경비원 아파트경비 격일제 포괄'},

  // ───────── 🚪 퇴직·해고 (exit) ─────────

  {id:'haego',cat:'exit',ko:'해고와 정당한 이유',en:'Dismissal & just cause (해고)',
   defKo:'해고는 "사회통념상 더 이상 고용을 유지할 수 없을 정도"의 정당한 이유가 있어야 합니다(5인 이상 사업장). 실적 부진이나 상사와의 갈등만으로는 대부분 부족합니다. 산재 요양 기간과 그 후 30일, 출산휴가와 그 후 30일, 육아휴직 중에는 원칙적으로 해고 자체가 금지됩니다. "나가라"는 말을 들었다면 그 자리에서 사직서를 쓰지 말고 해고인지 권고사직인지부터 분명히 하세요.',
   defEn:'Dismissal requires cause so serious that employment can no longer reasonably continue (5+ workplaces). Poor performance or friction with a boss is rarely enough. Dismissal is outright banned during industrial-accident leave +30 days, maternity leave +30 days, and parental leave. If told to leave, don\'t sign a resignation on the spot — first pin down whether it\'s a dismissal or a resignation request.',
   statute:'근로기준법 제23조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'잘림 짤림 해고사유 정당한이유 해고금지'},

  {id:'seomyeon',cat:'exit',ko:'해고 서면통지',en:'Written dismissal notice (해고 서면통지)',
   defKo:'해고는 사유와 날짜를 적은 서면으로 통지해야만 효력이 있습니다. 문자·카톡·구두 해고는 절차 위반으로 무효라서, 이유가 정당하더라도 부당해고가 됩니다. "내일부터 나오지 마"라는 통보를 받았다면 그 메시지·녹음을 보관하고, 서면 통지를 요구하세요. 사유는 구체적이어야 하며 나중에 다른 사유를 추가할 수 없습니다.',
   defEn:'A dismissal is valid only if notified in writing with the reason and date. Dismissal by text, KakaoTalk, or word of mouth is procedurally void — unfair even if the underlying reason was valid. If told "don\'t come in tomorrow," keep the message or recording and demand written notice. Reasons must be specific and can\'t be swapped later.',
   statute:'근로기준법 제27조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'구두해고 문자해고 카톡해고 해고통보'},

  {id:'jeongni',cat:'exit',ko:'정리해고 (경영상 해고)',en:'Redundancy dismissal (정리해고)',
   defKo:'경영 악화를 이유로 한 해고는 4가지 요건을 모두 갖춰야 합니다: ①긴박한 경영상 필요 ②해고를 피하려는 노력(희망퇴직·전환배치 등) ③합리적이고 공정한 대상자 선정 ④근로자대표에게 50일 전 통보와 성실한 협의. 하나라도 빠지면 부당해고입니다. 해고 후 3년 안에 같은 업무를 채용할 때는 해고자를 우선 재고용해야 합니다.',
   defEn:'Dismissal for business reasons requires all four: ① urgent managerial necessity, ② efforts to avoid dismissal (voluntary retirement, reassignment), ③ rational and fair selection criteria, ④ notice to the worker representative 50 days ahead with good-faith consultation. Missing any one makes it unfair. If rehiring for the same work within 3 years, dismissed workers get priority.',
   statute:'근로기준법 제24·25조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'구조조정 경영상해고 감원 희망퇴직 권고사직'},

  {id:'jinggye',cat:'exit',ko:'징계 (경고·감봉·정직·해고)',en:'Disciplinary action (징계)',
   defKo:'견책·경고·감봉·정직·강등·해고 순으로 무거워지는 회사의 제재. 취업규칙에 근거와 절차(소명 기회 등)가 있어야 하고, 잘못에 비해 지나치게 무거우면 부당징계입니다. 감봉은 1회에 평균임금 하루치의 절반, 총액으로 한 달 임금의 10%를 넘을 수 없습니다. 부당한 징계도 해고처럼 노동위원회에 구제신청할 수 있습니다(3개월 이내).',
   defEn:'Company sanctions escalating from reprimand to pay cut, suspension, demotion, dismissal. They need grounds and procedure (a chance to respond) in the rules of employment, and must be proportionate. A pay-cut penalty is capped at half a day\'s average wage per instance and 10% of one month\'s pay in total. Unfair discipline — like dismissal — can be challenged at the Labor Relations Commission within 3 months.',
   statute:'근로기준법 제23·95조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'징계위원회 감봉 정직 견책 시말서 경위서'},

  {id:'daegi',cat:'exit',ko:'대기발령·직위해제',en:'Standby order (대기발령·직위해제)',
   defKo:'조사나 인사 조치를 이유로 일시적으로 업무에서 배제하는 처분. 회사의 인사권이지만 정당한 이유가 있어야 하고, 필요 이상 길게 끌거나 임금을 크게 깎으면 부당한 처분으로 다툴 수 있습니다. 대기발령 기간에도 출근 의무가 없다는 이유만으로 임금을 안 주는 것은 위법인 경우가 많습니다(휴업수당 또는 임금 지급 대상). 사직 압박 수단으로 쓰이면 괴롭힘에 해당할 수 있습니다.',
   defEn:'Temporary removal from duties pending investigation or reassignment. It is a management right but needs valid grounds; dragging it out or slashing pay can be challenged. Withholding wages just because you\'re told not to come in is often illegal (shutdown allowance or full wages due). Used as pressure to resign, it may constitute workplace harassment.',
   statute:'근로기준법 제23조 · 판례',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'직위해제 발령대기 업무배제 좌천'},

  {id:'jeonbo',cat:'exit',ko:'전보·전직 (인사이동)',en:'Transfer & reassignment (전보·전직)',
   defKo:'근무지나 직무를 바꾸는 인사명령. 원칙적으로 회사 권한이지만, 업무상 필요성과 근로자가 입는 생활상 불이익을 비교해 지나치면 무효입니다. 계약서에 근무 장소·업무가 특정되어 있으면 본인 동의 없이 바꿀 수 없습니다. 통근이 사실상 불가능한 원거리 발령, 퇴사 유도용 보복성 발령은 노동위원회에 구제신청할 수 있습니다.',
   defEn:'Orders changing your workplace or duties. Generally within management rights, but void if business necessity is outweighed by the disruption to your life. If your contract specifies the location or role, changes need your consent. Impossibly distant postings or retaliatory transfers meant to push you out can be challenged at the Labor Relations Commission.',
   statute:'근로기준법 제23조 · 판례',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'인사이동 발령 전근 직무변경 보복인사'},

  {id:'sajik',cat:'exit',ko:'사직 (의원면직)',en:'Resignation (사직)',
   defKo:'근로자가 스스로 그만두는 것. 회사가 사직서를 수리하지 않아도 통보 후 한 달(또는 다음 임금지급기)이 지나면 효력이 생기므로 "사직서 수리 안 해줌"에 묶일 필요는 없습니다. 반대로 홧김에 낸 사직서는 수리 전이라면 철회를 시도할 수 있습니다. 강요·기망으로 쓴 사직서는 무효를 다툴 수 있으니 강요 정황을 남기세요. 사직하면 실업급여가 원칙적으로 제한되지만 임금체불·괴롭힘 등 정당한 사유가 있으면 받을 수 있습니다.',
   defEn:'Quitting by your own will. Even if the company "refuses to accept" your resignation, it takes effect one month (or one pay period) after notice — you are not trapped. Conversely, a rash resignation can be withdrawn before acceptance. One signed under coercion or deception can be voided — keep evidence. Resigning usually limits unemployment benefits, but just causes like wage arrears or harassment preserve them.',
   statute:'민법 제660조 · 근로기준법 제7조',url:'https://www.law.go.kr/법령/민법',
   keywords:'퇴사 사직서 의원면직 사표 그만두기 사직철회'},

  // ───────── 🛡️ 보험·산재급여 (insurance) ─────────

  {id:'jilbyeong',cat:'insurance',ko:'업무상 질병',en:'Occupational disease (업무상 질병)',
   defKo:'과로로 인한 뇌출혈·심근경색, 반복 작업으로 인한 근골격계 질환, 직업성 암뿐 아니라 직장 내 괴롭힘·성희롱·고객 폭언으로 생긴 우울증·적응장애·PTSD도 산재로 인정됩니다. 사고와 달리 업무와의 인과관계 판단이 필요해 근무기록·진료기록이 중요합니다. 회사 동의 없이 근로복지공단에 직접 신청할 수 있고, 불승인되면 심사청구로 다툴 수 있습니다.',
   defEn:'Not just strokes/heart attacks from overwork, musculoskeletal disorders, or occupational cancer — depression, adjustment disorder, and PTSD caused by workplace harassment, sexual harassment, or abusive customers also qualify as industrial accidents. Causation must be shown, so work and medical records matter. File directly with COMWEL without employer consent; denials can be appealed.',
   statute:'산재보험법 제37조 제1항 · 시행령 별표3',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'과로 직업병 우울증 산재인정 정신질병 뇌심혈관'},

  {id:'yoyang',cat:'insurance',ko:'요양급여 (산재 치료비)',en:'Medical care benefits (요양급여)',
   defKo:'산재로 4일 이상 치료가 필요하면 치료비 전액을 산재보험이 부담합니다(3일 이내 경미한 부상은 회사가 보상). 진찰·수술·입원·약제·재활·이송비까지 포함. 건강보험으로 먼저 치료받았더라도 나중에 산재 승인을 받으면 본인부담금을 돌려받을 수 있습니다. 근로복지공단(☎1588-0075)에 신청하세요.',
   defEn:'If a work injury needs 4+ days of treatment, industrial-accident insurance covers the full cost — exams, surgery, hospitalization, medication, rehab, transport (injuries under 4 days are compensated by the employer). If you first used health insurance, approved claims refund your out-of-pocket costs. Apply via COMWEL (☎1588-0075).',
   statute:'산재보험법 제40조',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'산재치료비 병원비 요양신청 산재보상'},

  {id:'hueopgeup',cat:'insurance',ko:'휴업급여',en:'Temporary disability benefits (휴업급여)',
   defKo:'산재 요양 때문에 일하지 못한 기간에 대해 평균임금의 70%를 산재보험에서 받습니다(하루 단위, 요양급여와 별개). 금액이 최저임금에 못 미치면 최저임금액을 기준으로 지급합니다. "치료비는 회사가 대줄 테니 산재 처리는 하지 말자"는 공상 제안을 받아들이면 휴업급여를 받을 수 없게 되니 신중하세요.',
   defEn:'For days you cannot work during treatment, insurance pays 70% of your average wage (separate from medical benefits). If that falls below minimum wage, the minimum-wage amount applies. Accepting a "we\'ll pay the hospital, skip the insurance claim" deal forfeits this benefit — think carefully.',
   statute:'산재보험법 제52·54조',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'산재월급 휴업 일못함 임금보전 공상처리'},

  {id:'janghae',cat:'insurance',ko:'장해급여',en:'Disability benefits (장해급여)',
   defKo:'치료가 끝난 뒤에도 몸에 장해가 남으면 장해등급(1~14급)에 따라 연금 또는 일시금을 받습니다. 1~3급은 연금만, 4~7급은 선택, 8~14급은 일시금. 등급 판정에 이의가 있으면 심사청구할 수 있습니다. 등급에 따라 금액 차이가 크므로 판정 전에 노무사 상담(공단 무료 지원 제도 있음)을 받아볼 만합니다.',
   defEn:'If impairment remains after treatment ends, you receive a pension or lump sum by disability grade (1–14): grades 1–3 pension only, 4–7 your choice, 8–14 lump sum. Grade decisions can be appealed, and amounts differ greatly by grade — consulting a labor attorney before assessment (free public support exists) is worthwhile.',
   statute:'산재보험법 제57조',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'장해등급 장애 후유증 장해연금 일시금'},

  {id:'yujok',cat:'insurance',ko:'유족급여·장의비',en:'Survivor benefits (유족급여·장의비)',
   defKo:'근로자가 업무상 사고·질병으로 사망하면 유족(배우자·자녀·부모 등 순위)에게 유족연금(또는 일부 일시금)과 장례비가 지급됩니다. 과로사·업무상 자살(정신질병 인정 시)도 대상이 될 수 있습니다. 사업주가 "산재 처리하면 회사가 어려워진다"며 합의를 종용해도, 산재 신청은 유족의 권리이며 회사 동의가 필요 없습니다.',
   defEn:'If a worker dies from a work accident or disease, surviving family (spouse, children, parents in order of priority) receive a survivor pension (or partial lump sum) plus funeral expenses. Death from overwork or work-related suicide (where mental illness is recognized) can qualify. Filing is the family\'s right — no employer consent needed, whatever pressure is applied to settle privately.',
   statute:'산재보험법 제62·71조',url:'https://www.law.go.kr/법령/산업재해보상보험법',
   keywords:'사망 과로사 유족연금 장례비 산재사망'},

  // ───────── ⛑️ 안전·존엄 (safety) ─────────

  {id:'chabyeol',cat:'safety',ko:'고용상 차별 금지',en:'Employment discrimination (고용상 차별)',
   defKo:'모집·채용부터 임금, 승진, 정년, 해고까지 성별·혼인·임신·출산 등을 이유로 한 차별은 금지됩니다. 같은 사업장에서 동일한 가치의 일을 하면 같은 임금을 줘야 합니다(동일가치노동 동일임금). 성차별을 당하면 노동위원회에 시정신청(차별받은 날부터 6개월 이내)을 하거나 국가인권위원회(☎1331)에 진정할 수 있습니다.',
   defEn:'Discrimination based on gender, marriage, pregnancy, or childbirth is banned across hiring, pay, promotion, retirement age, and dismissal. Equal pay for work of equal value at the same workplace is the law. For gender discrimination, apply to the Labor Relations Commission for correction (within 6 months) or petition the National Human Rights Commission (☎1331).',
   statute:'남녀고용평등법 제7~11조·제26조',url:'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률',
   keywords:'성차별 남녀차별 동일임금 임신차별 채용차별'},

  {id:'bjchabyeol',cat:'safety',ko:'비정규직 차별시정',en:'Non-regular worker discrimination (비정규직 차별시정)',
   defKo:'기간제·단시간·파견 근로자라는 이유로 같은 일을 하는 정규직보다 임금, 상여금, 식대, 복지포인트 등에서 불리하게 대우하는 것은 금지됩니다. 차별을 받았다면 노동위원회에 시정신청을 할 수 있고(차별이 있은 날부터 6개월 이내), 고의·반복 차별은 손해액의 3배까지 배상이 명령될 수 있습니다. 신청을 이유로 한 불이익도 금지됩니다.',
   defEn:'Treating fixed-term, part-time, or dispatched workers worse than regular staff doing the same work — in pay, bonuses, meal allowances, welfare points — is prohibited. Apply to the Labor Relations Commission within 6 months of the discriminatory act; willful or repeated discrimination can draw up to treble damages. Retaliation for applying is also banned.',
   statute:'기간제법 제8·9조·제13조 · 파견법 제21조',url:'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률',
   keywords:'계약직차별 정규직차별 복지차별 상여차별 식대'},

  {id:'bulli',cat:'safety',ko:'불리한 처우·보복 금지',en:'Retaliation is illegal (불리한 처우 금지)',
   defKo:'노동청 진정·신고, 괴롭힘·성희롱 신고, 산재 신청 등을 이유로 해고·전보·감봉·따돌림 같은 불이익을 주는 것은 그 자체가 범죄입니다. 괴롭힘 신고자·피해자에 대한 불리한 처우는 3년 이하 징역 또는 3천만원 이하 벌금 대상. 신고 전후의 대우 변화(발령·평가·업무 배제)를 시간순으로 기록해 두면 보복을 입증하기 쉬워집니다.',
   defEn:'Punishing you for filing a labor complaint, reporting harassment, or claiming industrial-accident insurance — dismissal, transfer, pay cuts, ostracism — is itself a crime. Retaliation against harassment reporters/victims: up to 3 years\' prison or ₩30M fine. Keep a timeline of how you were treated before and after reporting (assignments, reviews, exclusion) to prove it.',
   statute:'근로기준법 제76조의3 제6항·제104조 · 남녀고용평등법 제14조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'보복 2차피해 신고불이익 내부고발 공익신고'},

  {id:'anjeongyoyuk',cat:'safety',ko:'안전보건교육',en:'Safety & health training (안전보건교육)',
   defKo:'사업주는 채용 시, 작업 내용 변경 시, 정기적으로, 그리고 위험 작업에는 특별교육까지 안전보건교육을 해야 합니다. 교육은 근로시간으로 인정되고 비용은 회사 부담입니다. 교육 없이 위험 작업에 투입되어 다쳤다면 회사 책임이 더 무거워지므로, 교육을 받았는지 여부는 산재·소송에서 중요한 사실이 됩니다.',
   defEn:'Employers must provide safety training at hiring, on job changes, periodically, and special training for hazardous work. Training time counts as working hours and costs are on the company. Being injured on hazardous work you were never trained for increases employer liability — whether training happened matters in accident claims and lawsuits.',
   statute:'산업안전보건법 제29조',url:'https://www.law.go.kr/법령/산업안전보건법',
   keywords:'안전교육 특별교육 신규교육 산업안전'},

  {id:'wiheomseong',cat:'safety',ko:'위험성평가',en:'Risk assessment (위험성평가)',
   defKo:'사업주가 작업의 위험 요인을 미리 찾아 평가하고 줄이는 절차로, 근로자를 참여시켜야 합니다. 사고가 났을 때 위험성평가를 제대로 했는지가 사업주 처벌(산안법·중대재해처벌법)의 핵심 쟁점이 됩니다. 현장에서 위험을 발견하면 사업주에게 알리고 개선을 요구할 권리가 있으며, 급박한 위험이면 작업을 중지하고 대피할 수 있습니다.',
   defEn:'The employer\'s duty to identify, evaluate, and reduce workplace hazards in advance, with worker participation. After an accident, whether risk assessment was properly done becomes central to employer liability under safety laws. You have the right to report hazards and demand fixes — and to stop work and evacuate in imminent danger.',
   statute:'산업안전보건법 제36조',url:'https://www.law.go.kr/법령/산업안전보건법',
   keywords:'위험요인 안전점검 TBM 아차사고'},

  // ───────── 🏛️ 기관·제도 (system) ─────────

  {id:'moel',cat:'system',ko:'고용노동부·고용노동청',en:'Ministry of Employment & Labor (고용노동부·고용노동청)',
   defKo:'노동법 위반을 감독하는 행정기관. 전국 지방고용노동청·지청에 진정·신고를 접수하면 근로감독관이 조사합니다. 임금체불, 수당 미지급, 해고예고 위반, 괴롭힘 등 대부분의 문제를 무료로 다룰 수 있습니다. 상담은 ☎1350(외국어 지원), 온라인 접수는 노동포털(labor.moel.go.kr). 부당해고 판정은 노동청이 아니라 노동위원회 관할이라는 점만 구별하세요.',
   defEn:'The government agency policing labor-law violations. File a complaint at any regional labor office and a labor inspector investigates — wage arrears, unpaid premiums, notice violations, harassment — all free. Call ☎1350 (foreign-language support) or file online at labor.moel.go.kr. Note: unfair-dismissal rulings belong to the Labor Relations Commission, not the labor office.',
   statute:'근로기준법 제101·104조',url:'https://www.moel.go.kr',
   keywords:'노동부 노동청 고용청 1350 신고 노동포털'},

  {id:'gyoseop',cat:'system',ko:'단체교섭',en:'Collective bargaining (단체교섭)',
   defKo:'노동조합이 임금·근로조건에 대해 회사와 교섭하는 것. 회사는 정당한 이유 없이 교섭을 거부하거나 게을리할 수 없으며, 거부하면 부당노동행위로 처벌될 수 있습니다. 교섭은 노조 대표자가 하고, 타결되면 단체협약으로 서면화합니다.',
   defEn:'A union\'s negotiation with the employer over wages and working conditions. The employer cannot refuse or neglect bargaining without just cause — doing so is an unfair labor practice subject to punishment. The union representative bargains, and agreements are put in writing as a collective agreement.',
   statute:'노동조합법 제29·30조·제81조',url:'https://www.law.go.kr/법령/노동조합및노동관계조정법',
   keywords:'임단협 교섭요구 노사교섭 임금협상'},

  {id:'hyeobyak',cat:'system',ko:'단체협약',en:'Collective agreement (단체협약)',
   defKo:'단체교섭으로 합의한 내용을 서면으로 만든 것(유효기간 최대 3년). 취업규칙이나 개별 근로계약보다 우선하며, 협약 기준에 미달하는 부분은 무효가 되고 협약 기준이 대신 적용됩니다. 조합원이라면 내 근로조건의 최상위 기준이므로 협약 내용을 확인해 두세요.',
   defEn:'The written product of collective bargaining (valid up to 3 years). It overrides rules of employment and individual contracts — any term below the agreement\'s standard is void and replaced by it. If you\'re a union member, it sets the top-line standard for your conditions; know what\'s in it.',
   statute:'노동조합법 제31~33조',url:'https://www.law.go.kr/법령/노동조합및노동관계조정법',
   keywords:'임금협약 협약임금 단협'},

  {id:'jaengui',cat:'system',ko:'쟁의행위 (파업·태업)',en:'Industrial action (쟁의행위)',
   defKo:'교섭이 결렬됐을 때 노조가 주장을 관철하려고 하는 파업·태업 등의 집단행동. 노동위원회 조정 절차와 조합원 직접·비밀·무기명 투표 과반 찬성을 거친 정당한 쟁의행위는 민사·형사 책임이 면제되고, 참가를 이유로 해고·불이익을 줄 수 없습니다. 회사가 파업 대체 인력을 새로 채용하는 것도 원칙적으로 금지됩니다.',
   defEn:'Collective action — strikes, slowdowns — after bargaining fails. Lawful action (after commission mediation and a majority in a direct, secret ballot) is immune from civil and criminal liability, and participants can\'t be dismissed or disadvantaged. Hiring replacements for strikers is banned in principle.',
   statute:'노동조합법 제3·4조·제37~46조',url:'https://www.law.go.kr/법령/노동조합및노동관계조정법',
   keywords:'파업 태업 총파업 쟁의 단체행동'},

  {id:'budangnodong',cat:'system',ko:'부당노동행위',en:'Unfair labor practice (부당노동행위)',
   defKo:'노조 가입·활동을 이유로 한 해고·불이익, 노조 탈퇴를 채용 조건으로 삼는 것, 정당한 이유 없는 교섭 거부, 노조 운영에 대한 지배·개입은 모두 금지됩니다. 당했다면 3개월 이내에 노동위원회에 구제신청을 할 수 있고, 위반 사용자는 2년 이하 징역 또는 2천만원 이하 벌금 대상입니다.',
   defEn:'Dismissal or disadvantage for union membership or activity, making non-membership a hiring condition, refusing to bargain without cause, and dominating or interfering in union affairs are all banned. Apply to the Labor Relations Commission within 3 months; violators face up to 2 years\' prison or a ₩20M fine.',
   statute:'노동조합법 제81·82·90조',url:'https://www.law.go.kr/법령/노동조합및노동관계조정법',
   keywords:'노조탄압 노조불이익 교섭거부 지배개입'},

  {id:'changgu',cat:'system',ko:'복수노조·교섭창구 단일화',en:'Multiple unions & bargaining channel (복수노조·교섭창구 단일화)',
   defKo:'한 사업장에 여러 노조를 자유롭게 만들 수 있습니다. 다만 교섭은 원칙적으로 하나의 창구로 모아야 해서, 과반수 노조 등이 교섭대표노조가 됩니다. 교섭대표노조는 소수 노조와 그 조합원도 합리적 이유 없이 차별하지 않을 공정대표의무를 지며, 위반 시 노동위원회에 시정을 신청할 수 있습니다.',
   defEn:'Multiple unions may freely exist at one workplace, but bargaining is funneled through a single channel — typically the majority union becomes the representative. It owes a duty of fair representation to minority unions and their members; violations can be taken to the Labor Relations Commission.',
   statute:'노동조합법 제29조의2·제29조의4',url:'https://www.law.go.kr/법령/노동조합및노동관계조정법',
   keywords:'교섭대표노조 소수노조 공정대표의무'},

  {id:'nosahyeop',cat:'system',ko:'노사협의회·고충처리',en:'Labor-management council (노사협의회)',
   defKo:'상시 30인 이상 사업장에 의무적으로 두는 노사 협의 기구로, 노동조합과는 별개입니다. 근로자위원은 근로자가 직접 뽑아야 하며, 분기마다 회의를 열어 복지·생산성 등을 협의합니다. 30인 이상이면 고충처리위원도 둬야 해서, 노조가 없어도 직장 내 고충을 공식적으로 제기할 통로가 됩니다.',
   defEn:'A mandatory consultation body at workplaces with 30+ employees, separate from a union. Worker members must be directly elected; the council meets quarterly on welfare and productivity. Workplaces of 30+ must also have grievance officers — a formal channel for raising problems even without a union.',
   statute:'근로자참여 및 협력증진에 관한 법률 제4·26조',url:'https://www.law.go.kr/법령/근로자참여및협력증진에관한법률',
   keywords:'노사협의 고충처리위원 근로자위원'},

  {id:'daepyoja',cat:'system',ko:'근로자대표',en:'Worker representative (근로자대표)',
   defKo:'과반수 노조가 있으면 그 노조, 없으면 근로자 과반수를 대표하는 사람. 탄력·선택근로제, 보상휴가제, 정리해고 협의 등 중요한 제도는 근로자대표와의 서면합의가 있어야 유효합니다. 회사가 지명한 "대표"나 일부만 동의한 합의는 무효가 될 수 있으니, 우리 사업장 근로자대표가 어떻게 뽑혔는지 따져볼 가치가 있습니다.',
   defEn:'The majority union, or where none exists, a person representing a majority of workers. Key schemes — flexible hours, compensatory leave, redundancy consultation — are valid only with a written agreement signed by this representative. A company-appointed "representative" or minority-backed deal can be void; how yours was chosen is worth scrutinizing.',
   statute:'근로기준법 제24·51·52·57조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'서면합의 과반수대표 노사합의'},

  {id:'gujesincheong',cat:'system',ko:'부당해고 구제신청',en:'Unfair dismissal remedy (부당해고 구제신청)',
   defKo:'해고된 날부터 3개월 이내에 지방노동위원회에 신청합니다(5인 이상 사업장). 비용이 들지 않고, 월평균 임금 300만원 미만이면 국선노무사·변호사를 무료로 지원받습니다. 해고가 정당하다는 것은 회사가 입증해야 합니다. 이기면 복직 + 해고 기간 임금을 받거나, 복직을 원치 않으면 금전보상을 선택할 수 있습니다. 판정에 불복하면 중앙노동위원회 재심 → 행정소송 순서로 다툽니다.',
   defEn:'File with the regional Labor Relations Commission within 3 months of dismissal (5+ workplaces). It\'s free, and workers earning under ₩3M/month get a free public labor attorney. The burden of proving the dismissal was justified falls on the employer. Winning means reinstatement plus back pay — or monetary compensation if you\'d rather not return. Appeals go to the central commission, then administrative court.',
   statute:'근로기준법 제28~33조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'노동위원회 구제신청 3개월 원직복직 금전보상 국선노무사'},

  {id:'gosogobal',cat:'system',ko:'진정·고소·고발의 차이',en:'Complaint vs. criminal accusation (진정·고소·고발)',
   defKo:'진정은 "돈을 받게 해달라"는 시정 요구, 고소는 피해자가 "처벌해달라"는 것, 고발은 제3자가 처벌을 요구하는 것입니다. 임금체불은 보통 진정으로 시작해 해결이 안 되면 고소(형사처벌 절차)로 넘어갑니다. 임금체불죄는 근로자가 처벌을 원치 않으면 처벌하지 않는 죄(반의사불벌)라서 "처벌불원서"에 서명하면 사건이 끝나니, 돈을 실제로 받기 전에는 함부로 서명하지 마세요. 상습 체불 사업주에게는 이 규정이 제한됩니다(2025.10. 시행).',
   defEn:'A jinjeong (complaint) demands correction — "make them pay"; a goso is the victim demanding prosecution; a gobal is a third party doing so. Wage cases usually start as complaints and escalate to prosecution if unresolved. Wage theft isn\'t prosecuted if the worker signs away punishment — so never sign a "no-punishment" form before the money actually arrives. For habitual offenders this shield is now restricted (since Oct 2025).',
   statute:'근로기준법 제109조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'처벌불원 반의사불벌 형사처벌 노동청신고'},

  {id:'sihyo',cat:'system',ko:'소멸시효·신청 기한',en:'Deadlines & limitation periods (소멸시효)',
   defKo:'권리마다 기한이 다릅니다: 임금·퇴직금 청구 3년, 부당해고 구제신청은 해고일부터 3개월, 비정규직 차별시정 6개월, 산재 요양·휴업급여 3년(장해·유족급여 5년), 성차별 시정신청 6개월. 기한이 지나면 권리 자체가 사라지거나 신청이 각하되므로, 망설여질 때는 일단 ☎1350이나 노무사에게 기한부터 확인하세요. 직장 내 괴롭힘 신고는 법정 기한이 없습니다.',
   defEn:'Each right has its own clock: wage and severance claims — 3 years; unfair-dismissal applications — 3 months from dismissal; non-regular discrimination — 6 months; industrial-accident medical/temporary benefits — 3 years (disability/survivor — 5); gender-discrimination correction — 6 months. Miss the deadline and the right dies or the case is dismissed — when unsure, check deadlines first via ☎1350 or a labor attorney. Harassment reports have no statutory deadline.',
   statute:'근로기준법 제49조 · 산재보험법 제112조 · 기간제법 제9조',url:'https://www.law.go.kr/법령/근로기준법',
   keywords:'시효 기한 3년 3개월 제척기간 못받은돈'},
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
          defKo: `${minWageYear}년 시간당 ₩${minWageHourly.toLocaleString()} (월 209시간 기준 ₩${minWageMonthly.toLocaleString()}). 업종·지역·국적 구분 없이 모든 근로자에게 적용되며, 미달 지급은 3년 이하 징역 또는 2,000만원 이하 벌금 대상입니다. 수습 기간(1년 이상 계약, 최대 3개월)에는 90%까지 감액할 수 있지만 단순노무직은 감액할 수 없습니다.`,
          defEn: `${minWageYear}: ₩${minWageHourly.toLocaleString()}/hr (≈₩${minWageMonthly.toLocaleString()}/month at 209h). Applies to every worker regardless of industry, region, or nationality; underpayment is punishable by up to 3 years' prison or a ₩20M fine. Probation (max 3 months on 1yr+ contracts) allows 90%, but not for simple-labor jobs.`,
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
        t.defEn.toLowerCase().includes(q) ||
        ((t as any).keywords || '').toLowerCase().includes(q),
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
          {lang === 'ko' ? `노동법 핵심 용어 ${TERMS.length}개 · KR↔EN` : `${TERMS.length} key labor law terms · KR↔EN`}
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

        {/* Terms grouped by category — 2-column grid; tapping opens a full-width detail panel */}
        {CATEGORY_ORDER.map((cat) => {
          const list = filtered.filter(t => t.cat === cat);
          if (!list.length) return null;
          const rows: (typeof list)[] = [];
          for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
          return (
            <View key={cat}>
              <Text style={styles.categoryHeader}>{CATEGORIES[cat][lang]}</Text>
              {rows.map((pair, ri) => {
                const openTerm = pair.find(t => t.id === expanded);
                return (
                  <View key={`${cat}-${ri}`}>
                    <View style={styles.gridRow}>
                      {pair.map((term) => {
                        const isOpen = expanded === term.id;
                        return (
                          <TouchableOpacity
                            key={term.id}
                            style={[styles.gridCard, isOpen && styles.gridCardOpen]}
                            onPress={() => setExpanded(isOpen ? null : term.id)}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: isOpen }}
                          >
                            <Text style={styles.gridKo} numberOfLines={2}>{term.ko}</Text>
                            <Text style={styles.gridEn} numberOfLines={2}>{term.en}</Text>
                            <Text style={[styles.gridChevron, isOpen && styles.gridChevronOpen]}>{isOpen ? '▲' : '▼'}</Text>
                          </TouchableOpacity>
                        );
                      })}
                      {pair.length === 1 && <View style={styles.gridPlaceholder} />}
                    </View>

                    {openTerm && (
                      <View style={styles.detailPanel}>
                        <Text style={styles.defText}>{lang === 'ko' ? openTerm.defKo : openTerm.defEn}</Text>
                        <TouchableOpacity
                          style={styles.sourceRow}
                          onPress={() => Linking.openURL(openTerm.url)}
                          accessibilityRole="link"
                        >
                          <Text style={styles.sourceText}>📜 {openTerm.statute}</Text>
                          <Text style={styles.sourceLink}>{lang === 'ko' ? '원문 →' : 'Source →'}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
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

  categoryHeader: {
    ...typography.bodyS,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },

  gridRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  gridCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  gridCardOpen: { borderWidth: 1.5, borderColor: colors.brand },
  gridPlaceholder: { flex: 1 },
  gridKo: { ...typography.bodyS, color: colors.text, fontWeight: '700', lineHeight: 19 },
  gridEn: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  gridChevron: { fontSize: 9, color: colors.textCaption, marginTop: spacing.xs },
  gridChevronOpen: { color: colors.action },

  detailPanel: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    padding: spacing.base,
    marginTop: -4,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  defText: { ...typography.bodyM, color: colors.text, lineHeight: 26, marginBottom: spacing.md },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sourceText: { ...typography.caption, color: colors.textCaption, flex: 1 },
  sourceLink: { ...typography.caption, color: colors.action, fontWeight: '700' },

  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.bodyM, color: colors.textSecondary },
});
