import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import { useConfig } from '../lib/useConfig';

// section: 'universal' = applies to ALL workplaces regardless of size
//          'five_plus' = ONLY applies to workplaces with 5+ employees
const RIGHTS_TOPICS = [
  // ── UNIVERSAL ────────────────────────────────────────────────────────────
  {
    id: 'unpaid-wages',
    emoji: '💰',
    ko: '임금 미지급',
    en: 'Unpaid wages',
    summaryKo: '사용자는 매월 정해진 날에 전액을 직접 지급해야 합니다. 미지급 시 3년 이하 징역 또는 3,000만원 이하 벌금. 재직·퇴직 불문 연 20% 지연이자(2025.10.부터), 고의 체불은 최대 3배 배상. 3년 이내 청구 가능.',
    summaryEn: 'Employer must pay in full on the agreed date. Penalty up to 3 years prison or ₩30M fine. 20%/yr late interest for current and former workers alike (since Oct 2025); willful non-payment risks treble damages. Claims valid for 3 years.',
    statute: '근로기준법 43·36·37·49조',
    urls: [
      { article: '제43조', url: 'https://www.law.go.kr/법령/근로기준법/제43조' },
      { article: '제36조', url: 'https://www.law.go.kr/법령/근로기준법/제36조' },
      { article: '제37조', url: 'https://www.law.go.kr/법령/근로기준법/제37조' },
      { article: '제49조', url: 'https://www.law.go.kr/법령/근로기준법/제49조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
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
    urls: [
      { article: '최저임금위원회', url: 'https://www.minimumwage.go.kr' },
    ],
    lawDateKey: '최저임금법',
    section: 'universal' as const,
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
    urls: [
      { article: '제17조', url: 'https://www.law.go.kr/법령/근로기준법/제17조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'pay-stub',
    emoji: '🧾',
    ko: '임금명세서',
    en: 'Pay stub (payslip)',
    summaryKo: '2021년 11월부터 모든 사업주는 임금 지급 시 항목별 계산 내역이 담긴 명세서를 교부해야 합니다. 미교부 시 최대 500만원 과태료. 받지 못했다면 요청하세요.',
    summaryEn: 'Since Nov 2021, all employers must provide a pay stub with itemized breakdown at every pay period. Penalty up to ₩5M. If you haven\'t received one, ask.',
    statute: '근로기준법 48조',
    urls: [
      { article: '제48조', url: 'https://www.law.go.kr/법령/근로기준법/제48조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'weekly-holiday',
    emoji: '📅',
    ko: '주휴수당',
    en: 'Weekly holiday pay',
    summaryKo: '주 15시간 이상 근무하고 소정 근로일을 모두 채우면 1일분 유급 휴일 지급. 아르바이트·단기 근로자도 포함. 미지급 시 청구 가능.',
    summaryEn: 'Work 15+ hours/week and meet scheduled days → 1 paid rest day. Applies to part-time and short-term workers too.',
    statute: '근로기준법 55조',
    urls: [
      { article: '제55조', url: 'https://www.law.go.kr/법령/근로기준법/제55조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
    migrant: false,
  },
  {
    id: 'severance',
    emoji: '💼',
    ko: '퇴직금',
    en: 'Severance pay',
    summaryKo: '1년 이상 근무 시 평균임금 30일분 이상. 퇴직일로부터 14일 내 지급 의무. 3년 이내 청구 가능. 사업장 규모 무관 적용.',
    summaryEn: '1+ year → 30+ days avg wage. Must be paid within 14 days of leaving. Claim within 3 years. Applies at all workplace sizes.',
    statute: '퇴직급여법 8·9·10조',
    urls: [
      { article: '제8조', url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법/제8조' },
      { article: '제9조', url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법/제9조' },
      { article: '제10조', url: 'https://www.law.go.kr/법령/근로자퇴직급여보장법/제10조' },
    ],
    lawDateKey: '근로자퇴직급여보장법',
    section: 'universal' as const,
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
    urls: [
      { article: '제26조', url: 'https://www.law.go.kr/법령/근로기준법/제26조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
    migrant: false,
  },
  {
    id: 'industrial-accident',
    emoji: '🏥',
    ko: '산업재해 (산재)',
    en: 'Industrial accident',
    summaryKo: '업무상 부상·질병은 근로복지공단(COMWEL)에 산재보험 급여를 신청하세요. 국적·비자 무관 적용. 의료비·휴업급여 지원.',
    summaryEn: 'File with COMWEL (☎1588-0075) for work injuries or illness. Applies regardless of nationality or visa. Covers medical and lost wages.',
    statute: '산업재해보상보험법 37조',
    urls: [
      { article: '제37조', url: 'https://www.law.go.kr/법령/산업재해보상보험법/제37조' },
    ],
    lawDateKey: '산업재해보상보험법',
    section: 'universal' as const,
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
    urls: [
      { article: '제52조', url: 'https://www.law.go.kr/법령/산업안전보건법/제52조' },
    ],
    lawDateKey: '산업안전보건법',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'social-insurance',
    emoji: '🛡️',
    ko: '4대 사회보험',
    en: 'Social insurance (4대보험)',
    summaryKo: '대부분의 근로자는 국민건강보험·국민연금·고용보험·산재보험에 가입됩니다. 사업주가 신고·납부 의무를 집니다. 가입 누락 시 근로복지공단(☎1588-0075)에 신고하세요.',
    summaryEn: 'Most workers are covered by health, pension, employment, and accident insurance. The employer must enroll and pay. If not enrolled, report to COMWEL ☎1588-0075.',
    statute: '국민건강보험법 · 국민연금법 · 고용보험법 · 산재보험법',
    urls: [
      { article: '근로복지공단', url: 'https://www.comwel.or.kr' },
    ],
    lawDateKey: '산업재해보상보험법',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'parental-leave',
    emoji: '👶',
    ko: '출산·육아 휴직',
    en: 'Maternity & parental leave',
    summaryKo: '출산전후휴가 90일(다태아 120일·미숙아 100일), 육아휴직 최대 1년(요건 충족 시 1년 6개월), 배우자 출산휴가 20일. 급여는 고용보험에서 지급. 모든 사업장에 적용되며 거부 시 사업주 처벌.',
    summaryEn: 'Maternity leave: 90 days (120 for multiples, 100 for premature births). Parental leave: up to 1 year (18 months if conditions met). Spousal leave: 20 days. Paid via employment insurance. Applies to ALL employers; refusing it is punishable.',
    statute: '남녀고용평등법 19조',
    urls: [
      { article: '제19조', url: 'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률/제19조' },
    ],
    lawDateKey: '남녀고용평등과일·가정양립지원에관한법률',
    section: 'universal' as const,
    migrant: false,
  },

  {
    id: 'rest-breaks',
    emoji: '☕',
    ko: '휴게시간',
    en: 'Rest breaks',
    summaryKo: '근로 4시간에 30분, 8시간에 1시간 이상 휴게를 근무 도중에 줘야 합니다. 전화·손님 대기를 시키면 휴게가 아니라 유급 근로시간입니다. 모든 사업장 적용.',
    summaryEn: '30 min per 4h of work, 1h per 8h, given during the workday. If you must stay on standby for calls or customers, it is paid working time, not a break. All workplaces.',
    statute: '근로기준법 54조',
    urls: [
      { article: '제54조', url: 'https://www.law.go.kr/법령/근로기준법/제54조' },
    ],
    lawDateKey: '근로기준법',
    section: 'universal' as const,
    migrant: false,
  },
  {
    id: 'sexual-harassment',
    emoji: '🚨',
    ko: '직장 내 성희롱',
    en: 'Sexual harassment',
    summaryKo: '성적 언동으로 굴욕감을 주거나 거부를 이유로 불이익을 주는 것은 금지. 사업주는 조사·피해자 보호 의무가 있으며, 피해자에게 불리한 처우 시 3년 이하 징역. 괴롭힘과 달리 모든 사업장에 적용됩니다.',
    summaryEn: 'Sexual speech/conduct causing humiliation, or disadvantage for refusing it, is prohibited. Employers must investigate and protect victims; retaliation carries up to 3 years in prison. Unlike the harassment rules, this applies at ALL workplace sizes.',
    statute: '남녀고용평등법 12~14조',
    urls: [
      { article: '제12조', url: 'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률/제12조' },
      { article: '제14조', url: 'https://www.law.go.kr/법령/남녀고용평등과일·가정양립지원에관한법률/제14조' },
    ],
    lawDateKey: '남녀고용평등과일·가정양립지원에관한법률',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'fixed-term',
    emoji: '📆',
    ko: '기간제(계약직) 보호',
    en: 'Fixed-term worker protection',
    summaryKo: '한 사업장에서 2년을 초과해 계속 일하면 무기계약직으로 간주됩니다. 이후 "계약만료" 통보는 해고로 다툴 수 있습니다. 같은 일을 하는 정규직과의 차별도 금지 — 노동위원회에 시정 신청 가능.',
    summaryEn: 'Work continuously beyond 2 years → deemed a permanent employee; a later "contract expiry" notice can be challenged as dismissal. Discrimination versus regular workers doing the same job is prohibited — apply to the Labor Relations Commission.',
    statute: '기간제법 4·8조',
    urls: [
      { article: '제4조', url: 'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률/제4조' },
      { article: '제8조', url: 'https://www.law.go.kr/법령/기간제및단시간근로자보호등에관한법률/제8조' },
    ],
    lawDateKey: '기간제및단시간근로자보호등에관한법률',
    section: 'universal' as const,
    migrant: true,
  },
  {
    id: 'unemployment-benefits',
    emoji: '🧭',
    ko: '실업급여 (구직급여)',
    en: 'Unemployment benefits',
    summaryKo: '이직 전 18개월 중 고용보험 180일 이상 + 비자발적 이직(해고·권고사직·계약만료)이면 수급 가능. 임금체불·괴롭힘 등 정당한 사유가 있으면 자발적 퇴사도 가능. 고용센터(고용24)에서 신청하세요.',
    summaryEn: '180+ insured days in the 18 months before leaving, plus involuntary separation (dismissal, requested resignation, contract expiry). Voluntary quitters qualify with just cause — wage arrears, harassment. Apply at the employment center (gojyong24).',
    statute: '고용보험법 40조',
    urls: [
      { article: '제40조', url: 'https://www.law.go.kr/법령/고용보험법/제40조' },
      { article: '고용24', url: 'https://www.work24.go.kr' },
    ],
    lawDateKey: '고용보험법',
    section: 'universal' as const,
    migrant: false,
  },
  {
    id: 'substitute-payment',
    emoji: '🏦',
    ko: '간이대지급금',
    en: 'Substitute payment (대지급금)',
    summaryKo: '회사가 임금·퇴직금을 못 주면 국가가 먼저 지급 — 퇴직자 최대 1,000만원. 노동청 진정으로 체불 확인서를 받은 뒤 근로복지공단(☎1588-0075)에 신청. 소송 없이 가능합니다.',
    summaryEn: 'When the employer cannot pay wages or severance, the state pays first — up to ₩10M for departed workers. Get an arrears confirmation via a labor-office complaint, then apply to COMWEL (☎1588-0075). No lawsuit needed.',
    statute: '임금채권보장법 7조',
    urls: [
      { article: '제7조', url: 'https://www.law.go.kr/법령/임금채권보장법/제7조' },
      { article: '근로복지공단', url: 'https://www.comwel.or.kr' },
    ],
    lawDateKey: '임금채권보장법',
    section: 'universal' as const,
    migrant: true,
  },

  // ── 5인 이상 사업장만 ──────────────────────────────────────────────────
  {
    id: 'overtime',
    emoji: '⏰',
    ko: '연장·야간·휴일 수당',
    en: 'Overtime & premium pay',
    summaryKo: '연장·야간(22~06시)·휴일 근로는 통상임금의 +50%. 8시간 초과 휴일 근로는 +100%. 5인 미만 사업장은 가산임금 미적용.',
    summaryEn: 'Overtime, night (22:00–06:00), and holiday each earn +50%. Holiday >8h = +100%. This premium does NOT apply at workplaces with fewer than 5 employees.',
    statute: '근로기준법 56조',
    urls: [
      { article: '제56조', url: 'https://www.law.go.kr/법령/근로기준법/제56조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: false,
  },
  {
    id: 'working-hours',
    emoji: '🕐',
    ko: '근로시간 · 52시간제',
    en: 'Working hours & 52-hour limit',
    summaryKo: '법정 근로시간은 주 40시간(1일 8시간). 5인 이상 사업장에서는 연장 포함 주 최대 52시간. 이를 초과하는 근로 지시는 거부할 수 있으며 사업주는 처벌을 받습니다.',
    summaryEn: 'Standard hours: 40h/week (8h/day). At 5+ workplaces, max 52h/week including overtime. You can refuse orders that exceed this, and the employer faces penalties.',
    statute: '근로기준법 50·53조',
    urls: [
      { article: '제50조', url: 'https://www.law.go.kr/법령/근로기준법/제50조' },
      { article: '제53조', url: 'https://www.law.go.kr/법령/근로기준법/제53조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: false,
  },
  {
    id: 'annual-leave',
    emoji: '🌴',
    ko: '연차휴가',
    en: 'Annual leave',
    summaryKo: '1년 이상 근무(출근율 80% 이상) → 15일. 1년 미만 → 매월 1일(최대 11일). 상한 25일. 미사용 연차는 수당으로 지급. 5인 이상 사업장 적용.',
    summaryEn: '1+ year (80%+ attendance) → 15 days. Under 1 year → 1 day/month (max 11). Cap: 25 days. Unused leave must be paid out. Applies to 5+ workplaces.',
    statute: '근로기준법 60조',
    urls: [
      { article: '제60조', url: 'https://www.law.go.kr/법령/근로기준법/제60조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: false,
  },
  {
    id: 'unfair-dismissal',
    emoji: '🏛️',
    ko: '부당해고 구제',
    en: 'Unfair dismissal remedy',
    summaryKo: '해고일로부터 3개월 내 노동위원회에 구제 신청 가능. 서면 통보 없는 해고는 무효. 복직 또는 금전 보상 명령 가능. 5인 이상 사업장 적용.',
    summaryEn: 'Apply to the Labor Relations Commission within 3 months of dismissal. Verbal-only dismissal is void. Can order reinstatement or monetary compensation. Applies to 5+ workplaces.',
    statute: '근로기준법 23·27·28조',
    urls: [
      { article: '제23조', url: 'https://www.law.go.kr/법령/근로기준법/제23조' },
      { article: '제27조', url: 'https://www.law.go.kr/법령/근로기준법/제27조' },
      { article: '제28조', url: 'https://www.law.go.kr/법령/근로기준법/제28조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: false,
  },
  {
    id: 'harassment',
    emoji: '🛑',
    ko: '직장 내 괴롭힘',
    en: 'Workplace harassment',
    summaryKo: '사용자는 신고 시 즉시 조사하고 피해자를 보호해야 합니다. 보복 금지. 사용자가 행위자인 경우 최대 1,000만원 과태료. 5인 이상 사업장 적용.',
    summaryEn: 'Employer must investigate immediately and protect the victim. Retaliation is prohibited. Penalty up to ₩10M if employer is the harasser. Applies to 5+ workplaces.',
    statute: '근로기준법 76조의2·3',
    urls: [
      { article: '제76조의2', url: 'https://www.law.go.kr/법령/근로기준법/제76조의2' },
      { article: '제76조의3', url: 'https://www.law.go.kr/법령/근로기준법/제76조의3' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: true,
  },
  {
    id: 'public-holidays',
    emoji: '🎌',
    ko: '공휴일 유급휴일',
    en: 'Paid public holidays',
    summaryKo: '설날·추석 등 관공서 공휴일과 대체공휴일은 유급휴일입니다. 일하면 +50% 가산(8시간 초과 +100%). 2022년부터 공휴일을 연차로 대체하는 것은 금지. 5인 이상 사업장 적용.',
    summaryEn: 'Official public holidays (Seollal, Chuseok, etc.) and substitute holidays are paid days off. Working them earns +50% (+100% beyond 8h). Since 2022, substituting annual leave for public holidays is prohibited. Applies to 5+ workplaces.',
    statute: '근로기준법 55조 2항',
    urls: [
      { article: '제55조', url: 'https://www.law.go.kr/법령/근로기준법/제55조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: false,
  },
  {
    id: 'shutdown-allowance',
    emoji: '⏸️',
    ko: '휴업수당',
    en: 'Shutdown allowance',
    summaryKo: '회사 사정(주문 감소, 자재 부족 등)으로 쉬게 되면 평균임금의 70% 이상을 받아야 합니다. "일 없으니 무급으로 쉬라"는 위법. 5인 이상 사업장 적용.',
    summaryEn: 'If work stops for employer-side reasons (fewer orders, material shortages), you must receive at least 70% of average wage. "No work, stay home unpaid" is illegal. Applies to 5+ workplaces.',
    statute: '근로기준법 46조',
    urls: [
      { article: '제46조', url: 'https://www.law.go.kr/법령/근로기준법/제46조' },
    ],
    lawDateKey: '근로기준법',
    section: 'five_plus' as const,
    migrant: true,
  },
];

type Topic = (typeof RIGHTS_TOPICS)[0] & { summaryKo: string; summaryEn: string };

function SectionHeader({ ko, en, lang }: { ko: string; en: string; lang: 'ko' | 'en' }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{lang === 'ko' ? ko : en}</Text>
    </View>
  );
}

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
          {topic.section === 'five_plus' && <Text style={styles.badge5Plus}>5인+</Text>}
          {topic.migrant && <Text style={styles.badgeMigrant}>외국인</Text>}
        </View>
      </View>
      <Text style={styles.gridTitle}>{lang === 'ko' ? topic.ko : topic.en}</Text>
      <Text style={styles.gridSummary}>{lang === 'ko' ? topic.summaryKo : topic.summaryEn}</Text>
      <View style={styles.gridSourceRow}>
        <Text style={styles.gridStatute} numberOfLines={1}>📜 {topic.statute}</Text>
      </View>
      <View style={styles.gridArticleLinks}>
        {topic.urls.map((u, i) => (
          <TouchableOpacity
            key={i}
            style={styles.articleChip}
            onPress={() => Linking.openURL(u.url)}
            accessibilityRole="link"
          >
            <Text style={styles.articleChipText}>{u.article} →</Text>
          </TouchableOpacity>
        ))}
      </View>
      {updatedLabel ? (
        <Text style={styles.updatedLabel}>
          {lang === 'ko' ? `시행 ${updatedLabel}` : `In effect ${updatedLabel}`}
        </Text>
      ) : null}
    </View>
  );
}

function makeRows(items: Topic[]) {
  const rows: Topic[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

export default function RightsScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { minWageYear, minWageHourly, minWageMonthly, lawDate } = useConfig();

  const topics: Topic[] = RIGHTS_TOPICS.map((t) => {
    if (t.id === 'minimum-wage') {
      const h = minWageHourly.toLocaleString();
      const m = minWageMonthly.toLocaleString();
      return {
        ...t,
        summaryKo: `${minWageYear}년 시간당 ₩${h} (월 209시간 기준 ₩${m}). 외국인 포함 모든 근로자에게 적용. 수습 감액(90%)은 1년 이상 계약·최대 3개월만 가능하며 단순노무직은 감액 불가.`,
        summaryEn: `${minWageYear}: ₩${h}/hr (≈₩${m}/month, 209h). Applies to ALL workers including foreign nationals. Probation cut (90%) only on 1yr+ contracts for max 3 months — never for simple-labor jobs.`,
      };
    }
    return t;
  });

  const universalTopics = topics.filter(t => t.section === 'universal');
  const fivePlusTopics = topics.filter(t => t.section === 'five_plus');

  const universalRows = makeRows(universalTopics);
  const fivePlusRows = makeRows(fivePlusTopics);

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
            <Text style={styles.legendBadge5Plus}>5인+</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '5인 이상 사업장에만 적용' : 'Applies only to 5+ workplaces'}</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendBadgeMigrant}>외국인</Text>
            <Text style={styles.legendText}>{lang === 'ko' ? '외국인 근로자 주요 항목' : 'Key for migrant workers'}</Text>
          </View>
        </View>

        {/* Section 1: Universal rights */}
        <SectionHeader
          ko="모든 근로자 · 사업장 규모 무관"
          en="All workers — regardless of company size"
          lang={lang}
        />

        {universalRows.map((pair, i) => (
          <View key={`u-${i}`} style={styles.gridRow}>
            <GridCard topic={pair[0]} lang={lang} updatedLabel={lawDate(pair[0].lawDateKey)} />
            {pair[1] ? (
              <GridCard topic={pair[1]} lang={lang} updatedLabel={lawDate(pair[1].lawDateKey)} />
            ) : (
              <View style={styles.gridCardPlaceholder} />
            )}
          </View>
        ))}

        {/* Section 2: 5+ employee workplace rights */}
        <SectionHeader
          ko="5인 이상 사업장 추가 권리"
          en="Additional rights — 5+ employee workplaces"
          lang={lang}
        />
        <Text style={styles.sectionNote}>
          {lang === 'ko'
            ? '아래 권리는 5인 이상 사업장에만 법적으로 보장됩니다. 5인 미만 사업장도 최저임금·임금명세서·퇴직금 등 위 권리는 모두 동일하게 적용됩니다.'
            : 'The rights below are only guaranteed by law at workplaces with 5+ employees. Workplaces with fewer than 5 employees are still covered by all rights in the section above.'}
        </Text>

        {fivePlusRows.map((pair, i) => (
          <View key={`f-${i}`} style={styles.gridRow}>
            <GridCard topic={pair[0]} lang={lang} updatedLabel={lawDate(pair[0].lawDateKey)} />
            {pair[1] ? (
              <GridCard topic={pair[1]} lang={lang} updatedLabel={lawDate(pair[1].lawDateKey)} />
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
  legendBadge5Plus: { ...typography.caption, color: colors.action, backgroundColor: colors.selectedBg, borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendBadgeMigrant: { ...typography.caption, color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, fontWeight: '700' },
  legendText: { ...typography.caption, color: colors.textCaption },

  sectionHeader: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  sectionHeaderText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  sectionNote: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 },

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
  badge5Plus: { color: colors.action, backgroundColor: colors.selectedBg, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, fontWeight: '700', fontSize: 9 },
  badgeMigrant: { color: colors.teal, backgroundColor: '#CCFBF1', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, fontWeight: '700', fontSize: 9 },
  gridTitle: { ...typography.bodyS, color: colors.text, fontWeight: '700', marginBottom: spacing.xs, lineHeight: 18 },
  gridSummary: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: spacing.sm, flexGrow: 1 },
  gridSourceRow: { paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 4 },
  gridStatute: { fontSize: 9, color: colors.textCaption },
  gridArticleLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  articleChip: { backgroundColor: colors.selectedBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 },
  articleChipText: { fontSize: 9, color: colors.action, fontWeight: '700' },
  updatedLabel: { fontSize: 9, color: colors.textCaption, marginTop: 4 },

  callToAction: { backgroundColor: colors.selectedBg, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, marginTop: spacing.sm },
  ctaTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  ctaBtn: { backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  ctaBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  ctaBtnSecondary: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.action },
  ctaBtnSecondaryText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
});
