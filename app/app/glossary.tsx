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
    defKo: '임금을 제때, 전액 지급하지 않는 것. 3년 이하 징역 또는 3,000만원 이하 벌금 대상이며, 퇴직자에게는 지급이 늦어진 기간에 대해 연 20%의 지연이자가 붙습니다. 노동포털(labor.moel.go.kr)에서 무료로 진정을 접수할 수 있고, 청구 시효는 3년입니다.',
    defEn: 'Failure to pay wages in full and on time. Punishable by up to 3 years in prison or a ₩30M fine, and for departed workers, 20%/year interest accrues on late payment. File a free complaint at labor.moel.go.kr. Claims expire after 3 years.',
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
    defKo: '출산 전후 90일(다태아 120일), 출산 후에 45일 이상이 확보되어야 합니다. 급여는 고용보험과 사업주가 분담 지급하며, 사업장 규모와 무관하게 모든 여성 근로자에게 적용됩니다. 임신 중 근로시간 단축 제도도 있습니다.',
    defEn: '90 days around childbirth (120 for multiples), with at least 45 days after birth. Paid via employment insurance and the employer. Applies to all female workers at any workplace size. Reduced hours during pregnancy are also available.',
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

        {/* Terms grouped by category */}
        {CATEGORY_ORDER.map((cat) => {
          const list = filtered.filter(t => t.cat === cat);
          if (!list.length) return null;
          return (
            <View key={cat}>
              <Text style={styles.categoryHeader}>{CATEGORIES[cat][lang]}</Text>
              {list.map((term) => {
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
