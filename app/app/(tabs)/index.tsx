import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, Linking, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import { useConfig } from '../../lib/useConfig';

type SearchItem = {
  type: 'situation' | 'right' | 'hotline' | 'directory';
  label: { ko: string; en: string };
  detail: { ko: string; en: string };
  keywords: string[];
  emoji: string;
  path?: string;
  number?: string;
};

const SEARCH_INDEX: SearchItem[] = [
  // Situations
  { type: 'situation', emoji: '💰', label: { ko: '임금을 못 받았어요', en: "I wasn't paid" }, detail: { ko: '임금체불 · 급여 미지급 · 퇴직금 · 수당', en: 'Unpaid wages · Salary · Severance · Premium pay' }, keywords: ['임금', '급여', '월급', '체불', '퇴직금', '수당', '미지급', 'wage', 'salary', 'paid', 'unpaid', 'money', 'paycheck', 'severance'], path: '/guided-help/unpaid-wages' },
  { type: 'situation', emoji: '🤕', label: { ko: '일하다 다쳤어요', en: 'I was injured at work' }, detail: { ko: '산재 · 산업재해 · 업무상 부상', en: 'Industrial accident · Workers comp' }, keywords: ['산재', '산업재해', '다쳤', '부상', '사고', 'injury', 'accident', 'hurt', 'injured'], path: '/guided-help/injury' },
  { type: 'situation', emoji: '🚫', label: { ko: '해고됐어요', en: 'I was fired' }, detail: { ko: '부당해고 · 권고사직 · 해고예고', en: 'Unfair dismissal · Wrongful termination' }, keywords: ['해고', '부당해고', '짤렸', '권고사직', 'fired', 'dismissed', 'dismissal', 'termination', 'laid off'], path: '/guided-help/dismissal' },
  { type: 'situation', emoji: '⚠️', label: { ko: '위험한 일을 시켜요', en: 'Forced to do dangerous work' }, detail: { ko: '작업중지권 · 산업안전 · 강제노동', en: 'Right to refuse · Safety hazard' }, keywords: ['위험', '안전', '작업중지', '강제', 'dangerous', 'safety', 'hazard', 'unsafe', 'refuse', 'forced'], path: '/guided-help/dangerous' },
  { type: 'situation', emoji: '📄', label: { ko: '계약이 이상해요', en: 'My contract looks wrong' }, detail: { ko: '근로계약서 · 불공정 조항 · 계약 위반', en: 'Contract issues · Illegal terms' }, keywords: ['계약', '근로계약서', '계약위반', '불공정', 'contract', 'agreement', 'terms'], path: '/guided-help/contract' },
  { type: 'situation', emoji: '🛂', label: { ko: '비자로 협박해요', en: 'Boss threatening my visa' }, detail: { ko: '외국인 노동자 · 체류 위협 · E-9', en: 'Migrant workers · Visa threat' }, keywords: ['비자', '협박', '외국인', '체류', 'E-9', 'visa', 'threat', 'immigration', 'migrant', 'deport'], path: '/guided-help/visa-threat' },
  // Rights
  { type: 'right', emoji: '💵', label: { ko: '최저임금', en: 'Minimum wage' }, detail: { ko: '2026년 ₩10,320/시간', en: '2026: ₩10,320 per hour' }, keywords: ['최저임금', '시급', '최저', 'minimum wage', 'hourly', '10320'], path: '/rights' },
  { type: 'right', emoji: '📋', label: { ko: '근로계약서', en: 'Employment contract' }, detail: { ko: '근로기준법 제17조 · 서면 교부 의무', en: 'Must be given in writing (LSA §17)' }, keywords: ['근로계약서', '계약서', 'contract', '계약', '17조'], path: '/rights' },
  { type: 'right', emoji: '⏰', label: { ko: '연장·야간·휴일 수당', en: 'Overtime & premium pay' }, detail: { ko: '+50% 가산 (근로기준법 제56조)', en: '+50% premium (LSA §56)' }, keywords: ['연장', '야간', '휴일', '수당', '가산', '56조', 'overtime', 'night pay', 'holiday pay', 'premium'], path: '/rights' },
  { type: 'right', emoji: '💼', label: { ko: '퇴직금', en: 'Severance pay' }, detail: { ko: '1년 이상 근무 → 평균임금 30일분 이상', en: '1+ year → 30+ days average wage' }, keywords: ['퇴직금', '퇴직', '퇴사', 'severance', 'retirement pay'], path: '/rights' },
  { type: 'right', emoji: '📅', label: { ko: '주휴수당', en: 'Weekly holiday pay' }, detail: { ko: '주 15시간 이상 근무 시 적용', en: 'For workers 15+ hours/week' }, keywords: ['주휴', '주휴수당', 'weekly holiday', 'weekly pay'], path: '/rights' },
  { type: 'right', emoji: '🌴', label: { ko: '연차휴가', en: 'Annual leave' }, detail: { ko: '1년 15일 · 월 1일 (근로기준법 제60조)', en: '15 days/year (LSA §60)' }, keywords: ['연차', '휴가', '60조', 'annual leave', 'vacation', 'time off'], path: '/rights' },
  { type: 'right', emoji: '🏛️', label: { ko: '부당해고 구제', en: 'Unfair dismissal remedy' }, detail: { ko: '노동위원회 · 해고일로부터 3개월 내 신청', en: 'Labor tribunal within 3 months of dismissal' }, keywords: ['부당해고', '노동위원회', '구제신청', 'unfair dismissal', 'tribunal', 'appeal', '3개월'], path: '/rights' },
  { type: 'right', emoji: '🛑', label: { ko: '직장 내 괴롭힘', en: 'Workplace harassment' }, detail: { ko: '근로기준법 제76조의2 · 사용자 조사 의무', en: 'LSA §76-2 · Employer must investigate' }, keywords: ['괴롭힘', '성희롱', '갑질', 'harassment', 'bullying', 'abuse', 'sexual'], path: '/rights' },
  { type: 'right', emoji: '🏥', label: { ko: '산업재해 (산재)', en: 'Industrial accident' }, detail: { ko: '산재보험법 · COMWEL ☎1588-0075', en: 'Workers comp · COMWEL 1588-0075' }, keywords: ['산재', '산업재해', '업무상재해', '근로복지공단', 'industrial accident', 'workers comp', 'comwel'], path: '/rights' },
  // Hotlines
  { type: 'hotline', emoji: '📞', label: { ko: '고용노동부 · 1350', en: 'Labor Ministry · 1350' }, detail: { ko: '임금·근로 모든 상담 · 월~금 09:00–18:00', en: 'All work questions · Mon–Fri 09:00–18:00' }, keywords: ['1350', '고용노동부', '노동부', '노동 상담', 'labor', 'ministry'], number: '1350' },
  { type: 'hotline', emoji: '📞', label: { ko: '외국인 종합안내 · 1345', en: 'Immigration hotline · 1345' }, detail: { ko: '24시간 · 약 20개 언어', en: '24 hours · ~20 languages' }, keywords: ['1345', '외국인', '이민', '24시간', 'immigration', 'migrant', 'foreign', '24h', 'multilingual'], number: '1345' },
  { type: 'hotline', emoji: '📞', label: { ko: '외국인력 상담 · 1644-0644', en: 'Foreign worker hotline' }, detail: { ko: '18개 언어 · 외국인 노동 전문', en: '18 languages · Specialist support' }, keywords: ['1644', '0644', '외국인 노동', 'foreign worker', '18 languages'], number: '1644-0644' },
  { type: 'hotline', emoji: '📞', label: { ko: '근로복지공단 · 1588-0075', en: 'COMWEL · 1588-0075' }, detail: { ko: '산재 신청 · 대지급금', en: 'Industrial accident claims · Substitute pay' }, keywords: ['comwel', '근로복지공단', '산재', '대지급금', '1588', '0075', 'workers compensation'], number: '1588-0075' },
  { type: 'hotline', emoji: '📞', label: { ko: '청소년 근로권익센터 · 1644-3119', en: 'Youth Rights Center · 1644-3119' }, detail: { ko: '만 24세 이하 노무사 무료 상담', en: 'Free help for workers under 24' }, keywords: ['청소년', '알바', '24세', '1644-3119', 'youth', 'young worker'], number: '1644-3119' },
  { type: 'hotline', emoji: '📞', label: { ko: '다누리 · 1577-1366', en: 'Danuri · 1577-1366' }, detail: { ko: '24시간 · 13개 언어', en: '24h · 13 languages' }, keywords: ['다누리', '다문화', '1577', '1366', 'danuri', 'multicultural'], number: '1577-1366' },
  // Directory
  { type: 'directory', emoji: '🧑‍⚖️', label: { ko: '노무사 찾기 (422명)', en: 'Find a 노무사 (422)' }, detail: { ko: '지역·전문분야 검색 · KCPLAA 공인', en: 'Filter by region & specialty · KCPLAA verified' }, keywords: ['노무사', '노동변호사', '상담', '전문가', 'nomusa', 'labor attorney', 'lawyer', 'consult', 'find'], path: '/directory' },
];

const SITUATIONS = [
  { id: 'unpaid-wages', emoji: '💰', ko: '임금 못 받음', en: "Wasn't paid" },
  { id: 'injury', emoji: '🤕', ko: '일하다 다쳤어요', en: 'Injured at work' },
  { id: 'dismissal', emoji: '🚫', ko: '해고됐어요', en: 'I was fired' },
  { id: 'dangerous', emoji: '⚠️', ko: '위험한 일', en: 'Dangerous work' },
  { id: 'contract', emoji: '📄', ko: '계약이 이상해요', en: 'Contract issue' },
  { id: 'visa-threat', emoji: '🛂', ko: '비자 협박', en: 'Visa threat' },
];

const QUICK_HOTLINES = [
  { number: '1350', dialNumber: '1350', ko: '고용노동부', en: 'Labor Ministry' },
  { number: '1345', dialNumber: '1345', ko: '외국인 종합', en: 'Immigration 24h' },
  { number: '1644-0644', dialNumber: '16440644', ko: '외국인력', en: 'Foreign worker' },
  { number: '1588-0075', dialNumber: '15880075', ko: 'COMWEL', en: 'COMWEL' },
];

export default function HomeScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const [query, setQuery] = useState('');
  const { minWageYear, minWageHourly } = useConfig();

  // Patch minimum wage search item with live values from Supabase
  const SEARCH_INDEX_LIVE = useMemo(() => SEARCH_INDEX.map(item => {
    if (item.type === 'right' && item.keywords.includes('10320')) {
      return {
        ...item,
        detail: {
          ko: `${minWageYear}년 ₩${minWageHourly.toLocaleString()}/시간`,
          en: `${minWageYear}: ₩${minWageHourly.toLocaleString()} per hour`,
        },
        keywords: [...item.keywords.filter(k => k !== '10320'), String(minWageHourly)],
      };
    }
    return item;
  }), [minWageYear, minWageHourly]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return SEARCH_INDEX_LIVE.filter(item =>
      item.label.ko.includes(q) ||
      item.label.en.toLowerCase().includes(q) ||
      item.detail.ko.includes(q) ||
      item.detail.en.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [query, SEARCH_INDEX_LIVE]);

  const grouped = searchResults ? {
    situations: searchResults.filter(r => r.type === 'situation'),
    rights: searchResults.filter(r => r.type === 'right'),
    contacts: searchResults.filter(r => r.type === 'hotline' || r.type === 'directory'),
  } : null;

  const handleResultPress = (item: SearchItem) => {
    if (item.number) {
      Linking.openURL(`tel:${item.number.replace(/-/g, '')}`);
    } else if (item.path) {
      router.push(item.path as any);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fixed header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{lang === 'ko' ? '주리오' : 'Jurio'}</Text>
        <TouchableOpacity
          onPress={() => i18n.changeLanguage(lang === 'ko' ? 'en' : 'ko')}
          style={styles.langToggle}
          accessibilityRole="button"
          accessibilityLabel="Change language"
        >
          <Text style={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar — always visible, below header */}
      <View style={styles.searchOuter}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'ko' ? '상황, 권리, 전화번호 검색...' : 'Search situation, rights, hotlines...'}
            placeholderTextColor={colors.textCaption}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search results overlay */}
      {query.length > 0 ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {grouped && searchResults!.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsEmoji}>🤔</Text>
              <Text style={styles.noResultsTitle}>{lang === 'ko' ? '검색 결과 없음' : 'No results found'}</Text>
              <Text style={styles.noResultsHint}>
                {lang === 'ko' ? '1350으로 전화하시면 바로 상담 가능합니다.' : 'Call 1350 for immediate help from the Labor Ministry.'}
              </Text>
              <TouchableOpacity style={styles.callFallback} onPress={() => Linking.openURL('tel:1350')}>
                <Text style={styles.callFallbackText}>📞 1350 — {lang === 'ko' ? '지금 전화' : 'Call now'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {grouped && grouped.situations.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>{lang === 'ko' ? '상황별 안내' : 'Guided Help'}</Text>
              {grouped.situations.map((item, i) => (
                <TouchableOpacity key={i} style={styles.resultRow} onPress={() => handleResultPress(item)} activeOpacity={0.75}>
                  <Text style={styles.resultEmoji}>{item.emoji}</Text>
                  <View style={styles.resultText}>
                    <Text style={styles.resultLabel}>{item.label[lang]}</Text>
                    <Text style={styles.resultDetail}>{item.detail[lang]}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {grouped && grouped.rights.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>{lang === 'ko' ? '권리 정보' : 'Rights info'}</Text>
              {grouped.rights.map((item, i) => (
                <TouchableOpacity key={i} style={styles.resultRow} onPress={() => handleResultPress(item)} activeOpacity={0.75}>
                  <Text style={styles.resultEmoji}>{item.emoji}</Text>
                  <View style={styles.resultText}>
                    <Text style={styles.resultLabel}>{item.label[lang]}</Text>
                    <Text style={styles.resultDetail}>{item.detail[lang]}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {grouped && grouped.contacts.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>{lang === 'ko' ? '상담 전화 · 전문가' : 'Hotlines · Experts'}</Text>
              {grouped.contacts.map((item, i) => (
                <TouchableOpacity key={i} style={styles.resultRow} onPress={() => handleResultPress(item)} activeOpacity={0.75}>
                  <Text style={styles.resultEmoji}>{item.emoji}</Text>
                  <View style={styles.resultText}>
                    <Text style={styles.resultLabel}>{item.label[lang]}</Text>
                    <Text style={styles.resultDetail}>{item.detail[lang]}</Text>
                  </View>
                  {item.number ? (
                    <View style={styles.callChip}>
                      <Text style={styles.callChipText}>{lang === 'ko' ? '전화' : 'Call'}</Text>
                    </View>
                  ) : (
                    <Text style={styles.arrow}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      ) : (
        /* ── Normal home content ── */
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.homeContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>{lang === 'ko' ? '무슨 일이 있나요?' : "What's happening?"}</Text>
            <Text style={styles.greetingSubtitle}>{lang === 'ko' ? '상황을 고르거나 위에서 검색하세요.' : 'Pick your situation or search above.'}</Text>
          </View>

          {/* Trust promise */}
          <View style={styles.trustBanner}>
            <Text style={styles.trustText}>
              🔒 {lang === 'ko'
                ? '신고하지 않습니다 · 신분증·비자번호 묻지 않습니다'
                : 'We never report you · Never ask for your ID or visa'}
            </Text>
          </View>

          {/* Emergency call strip */}
          <TouchableOpacity
            style={styles.emergencyStrip}
            onPress={() => Linking.openURL('tel:1350')}
            accessibilityRole="button"
          >
            <View style={styles.emergencyLeft}>
              <Text style={styles.emergencyBadge}>{lang === 'ko' ? '지금 전화' : 'Call now'}</Text>
              <Text style={styles.emergencyNumber}>📞 1350</Text>
            </View>
            <Text style={styles.emergencyDesc}>
              {lang === 'ko' ? '고용노동부 · 모든 노동 상담\n무료 · 탭하면 바로 연결' : 'Labor Ministry · All work issues\nFree · Tap to call directly'}
            </Text>
          </TouchableOpacity>

          {/* Situation tiles — all 6 */}
          <Text style={styles.sectionTitle}>{lang === 'ko' ? '어떤 상황인가요?' : "What's your situation?"}</Text>

          {/* Quick links — directly above the 6 tiles */}
          <View style={styles.quickLinks}>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/rights')} accessibilityRole="button">
              <Text style={styles.quickLinkEmoji}>📖</Text>
              <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '권리 가이드' : 'Rights guide'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/migrant-hub' as any)} accessibilityRole="button">
              <Text style={styles.quickLinkEmoji}>🌏</Text>
              <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '외국인 노동자' : 'Migrant workers'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/directory')} accessibilityRole="button">
              <Text style={styles.quickLinkEmoji}>🧑‍⚖️</Text>
              <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '노무사 찾기' : 'Find attorney'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLink} onPress={() => router.push('/(tabs)/map')} accessibilityRole="button">
              <Text style={styles.quickLinkEmoji}>📞</Text>
              <Text style={styles.quickLinkLabel}>{lang === 'ko' ? '상담 전화' : 'Hotlines'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tilesGrid}>
            {SITUATIONS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.tile}
                onPress={() => router.push(`/guided-help/${s.id}` as any)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={lang === 'ko' ? s.ko : s.en}
              >
                <Text style={styles.tileEmoji}>{s.emoji}</Text>
                <Text style={styles.tileLabel} numberOfLines={2}>{lang === 'ko' ? s.ko : s.en}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tappable hotlines */}
          <Text style={styles.hotlineTitle}>{lang === 'ko' ? '주요 상담 전화 · 탭하면 바로 전화' : 'Tap to call'}</Text>
          <View style={styles.hotlineGrid}>
            {QUICK_HOTLINES.map((h) => (
              <TouchableOpacity
                key={h.number}
                style={styles.hotlineCard}
                onPress={() => Linking.openURL(`tel:${h.dialNumber}`)}
                activeOpacity={0.75}
                accessibilityRole="button"
              >
                <Text style={styles.hotlineNumber}>{h.number}</Text>
                <Text style={styles.hotlineDesc}>{lang === 'ko' ? h.ko : h.en}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Banner />
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  appName: { ...typography.headingM, color: colors.brand, fontWeight: '700' },
  langToggle: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  langText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },

  searchOuter: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 50,
    ...shadow.card,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.bodyM, color: colors.text },
  clearBtn: { ...typography.bodyM, color: colors.textCaption, paddingLeft: spacing.sm },

  // Search results
  resultsContent: { paddingHorizontal: spacing.base, paddingTop: spacing.sm },
  noResults: { alignItems: 'center', paddingVertical: spacing.xl },
  noResultsEmoji: { fontSize: 40, marginBottom: spacing.sm },
  noResultsTitle: { ...typography.bodyL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  noResultsHint: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.base },
  callFallback: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  callFallbackText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  resultSection: { marginBottom: spacing.base },
  resultSectionTitle: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  resultEmoji: { fontSize: 24, marginRight: spacing.md },
  resultText: { flex: 1 },
  resultLabel: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  resultDetail: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  arrow: { ...typography.headingM, color: colors.textCaption },
  callChip: { backgroundColor: colors.action, borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  callChipText: { ...typography.caption, color: colors.white, fontWeight: '700' },

  // Home content
  homeContent: { paddingHorizontal: spacing.base },
  greeting: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  greetingTitle: { ...typography.headingXL, color: colors.text, fontWeight: '700' },
  greetingSubtitle: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.xs },

  emergencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  emergencyLeft: { alignItems: 'flex-start' },
  emergencyBadge: { ...typography.caption, color: colors.warningFill, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  emergencyNumber: { ...typography.headingM, color: colors.white, fontWeight: '700' },
  emergencyDesc: { ...typography.bodyS, color: '#94A3B8', flex: 1, lineHeight: 20 },

  trustBanner: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  trustText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  sectionTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  tile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'flex-start',
    ...shadow.card,
    minHeight: 88,
  },
  tileEmoji: { fontSize: 28, marginBottom: spacing.xs },
  tileLabel: { ...typography.bodyS, color: colors.text, fontWeight: '600', lineHeight: 20 },

  quickLinks: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  quickLink: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
    minHeight: 64,
    justifyContent: 'center',
  },
  quickLinkEmoji: { fontSize: 22, marginBottom: 4 },
  quickLinkLabel: { ...typography.caption, color: colors.text, fontWeight: '600', textAlign: 'center' },

  hotlineTitle: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', marginBottom: spacing.sm },
  hotlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  hotlineCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  hotlineNumber: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  hotlineDesc: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
});
