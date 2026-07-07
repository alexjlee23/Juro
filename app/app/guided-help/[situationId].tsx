import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import SourceBlock from '../../components/ui/SourceBlock';
import Button from '../../components/ui/Button';

import { Linking } from 'react-native';
import unpaidWagesData from '../../content/guided-paths/unpaid-wages.json';
import injuryData from '../../content/guided-paths/injury.json';
import dismissalData from '../../content/guided-paths/dismissal.json';
import dangerousData from '../../content/guided-paths/dangerous.json';
import contractData from '../../content/guided-paths/contract.json';
import visaThreatData from '../../content/guided-paths/visa-threat.json';

const PATHS: Record<string, any> = {
  'unpaid-wages': unpaidWagesData,
  'injury': injuryData,
  'dismissal': dismissalData,
  'dangerous': dangerousData,
  'contract': contractData,
  'visa-threat': visaThreatData,
};

const SITUATION_META: Record<string, {
  emoji: string;
  ko: string;
  en: string;
  hotlines: { label: { ko: string; en: string }; number: string }[];
}> = {
  'injury': {
    emoji: '🤕',
    ko: '일하다 다쳤어요 (산재)',
    en: 'I was injured at work',
    hotlines: [
      { label: { ko: '근로복지공단 · 1588-0075', en: 'COMWEL · 1588-0075' }, number: '15880075' },
      { label: { ko: '고용노동부 · 1350', en: 'Labor Ministry · 1350' }, number: '1350' },
    ],
  },
  'dismissal': {
    emoji: '🚫',
    ko: '해고됐어요 (부당해고)',
    en: 'I was fired',
    hotlines: [
      { label: { ko: '고용노동부 · 1350', en: 'Labor Ministry · 1350' }, number: '1350' },
      { label: { ko: '서울노동권익센터 · 1661-2020', en: 'Seoul Labor Rights · 1661-2020' }, number: '16612020' },
    ],
  },
  'dangerous': {
    emoji: '⚠️',
    ko: '위험한 일을 시켜요',
    en: 'Forced to do dangerous work',
    hotlines: [
      { label: { ko: '고용노동부 (위험 작업 신고) · 1350', en: 'Labor Ministry (report hazard) · 1350' }, number: '1350' },
    ],
  },
  'contract': {
    emoji: '📄',
    ko: '계약이 이상해요',
    en: 'My contract looks wrong',
    hotlines: [
      { label: { ko: '고용노동부 · 1350', en: 'Labor Ministry · 1350' }, number: '1350' },
    ],
  },
  'visa-threat': {
    emoji: '🛂',
    ko: '비자로 협박해요 (외국인 노동자)',
    en: 'Boss is threatening my visa',
    hotlines: [
      { label: { ko: '외국인 종합안내 (24시간) · 1345', en: 'Immigration hotline (24h) · 1345' }, number: '1345' },
      { label: { ko: '외국인력 상담 (18개 언어) · 1644-0644', en: 'Foreign worker hotline · 1644-0644' }, number: '16440644' },
      { label: { ko: '다누리 (24시간) · 1577-1366', en: 'Danuri (24h) · 1577-1366' }, number: '15771366' },
    ],
  },
};

function extractPhone(text: string): string | null {
  const match = text.match(/[\d]{4}-[\d]{4}|[\d]{3,4}-[\d]{3,4}|1\d{2,3}/);
  return match ? match[0].replace(/-/g, '') : null;
}

export default function GuidedHelpFlow() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  const data = PATHS[situationId];
  if (!data) {
    const meta = SITUATION_META[situationId];
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
          </TouchableOpacity>

          <Text style={styles.comingSoonEmoji}>{meta?.emoji ?? '🔧'}</Text>
          <Text style={styles.comingSoonTitle}>
            {meta ? (lang === 'ko' ? meta.ko : meta.en) : (lang === 'ko' ? '준비 중' : 'Coming soon')}
          </Text>
          <View style={styles.comingSoonBox}>
            <Text style={styles.comingSoonBody}>
              {lang === 'ko'
                ? '이 안내는 곧 추가됩니다. 지금 당장 도움이 필요하다면 아래 전화 상담을 이용하세요.'
                : "This guided flow is coming soon. For immediate help, use the hotlines below."}
            </Text>
          </View>

          {meta && meta.hotlines.length > 0 && (
            <View>
              <Text style={styles.hotlineSectionTitle}>{lang === 'ko' ? '지금 바로 도움받기' : 'Get help right now'}</Text>
              {meta.hotlines.map((h, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.hotlineRow}
                  onPress={() => Linking.openURL(`tel:${h.number}`)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                >
                  <Text style={styles.hotlineEmoji}>📞</Text>
                  <Text style={styles.hotlineLabel}>{h.label[lang]}</Text>
                  <View style={styles.callChip}>
                    <Text style={styles.callChipText}>{lang === 'ko' ? '전화' : 'Call'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Always show the general labor line */}
          <TouchableOpacity
            style={styles.nomusakRow}
            onPress={() => router.push('/directory')}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <Text style={styles.hotlineEmoji}>🧑‍⚖️</Text>
            <Text style={styles.hotlineLabel}>{lang === 'ko' ? '노무사 찾기 (422명 · 지역별 검색)' : 'Find a labor attorney (directory)'}</Text>
            <Text style={styles.hotlineArrow}>›</Text>
          </TouchableOpacity>

          <Banner />
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const [currentStepId, setCurrentStepId] = useState<string>(data.steps[0].id);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [stepNote, setStepNote] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  const currentStep = data.steps.find((s: any) => s.id === currentStepId);
  const stepIndex = data.steps.findIndex((s: any) => s.id === currentStepId);
  const totalSteps = data.steps.length;

  const handleOption = (option: any) => {
    if (transitioning) return;
    setTransitioning(true);
    const newFlags = { ...flags, ...option.sets };
    setFlags(newFlags);
    const note = option.note ? option.note[lang] : null;
    setStepNote(note);
    if (option.next === 'outcome') {
      setHistory(h => [...h, currentStepId]);
      if (note) {
        setTimeout(() => { setShowOutcome(true); setTransitioning(false); }, 1200);
      } else {
        setShowOutcome(true);
        setTransitioning(false);
      }
    } else {
      setHistory(h => [...h, currentStepId]);
      if (note) {
        setTimeout(() => {
          setCurrentStepId(option.next);
          setStepNote(null);
          setTransitioning(false);
        }, 1200);
      } else {
        setCurrentStepId(option.next);
        setTransitioning(false);
      }
    }
  };

  const handleBack = () => {
    if (showOutcome) {
      setShowOutcome(false);
      setStepNote(null);
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentStepId(prev);
      setStepNote(null);
    } else {
      router.back();
    }
  };

  if (showOutcome) {
    const outcome = data.outcome;
    const personalizedNotes = ((outcome.notes_if ?? []) as Array<{
      type: 'warning' | 'info' | 'tip';
      when: Record<string, string>;
      note: { ko: string; en: string };
    }>).filter(patch =>
      Object.entries(patch.when).every(([k, v]) => flags[k] === v)
    );
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
          </TouchableOpacity>

          <View style={styles.outcomeHeader}>
            <Text style={styles.outcomeTitle}>{lang === 'ko' ? '다음 단계' : 'Your next steps'}</Text>
          </View>

          {/* Personalized notes based on collected flags */}
          {personalizedNotes.length > 0 && (
            <View style={styles.personalizedSection}>
              <Text style={styles.personalizedHeader}>
                {lang === 'ko' ? '📌 내 상황에 맞는 안내' : '📌 Tailored to your situation'}
              </Text>
              {personalizedNotes.map((n, i) => (
                <View
                  key={i}
                  style={[
                    styles.personalizedNote,
                    n.type === 'warning' ? styles.noteWarning :
                    n.type === 'tip' ? styles.noteTip :
                    styles.noteInfo,
                  ]}
                >
                  <Text style={styles.personalizedNoteText}>{n.note[lang]}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Right */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>① {lang === 'ko' ? '당신의 권리' : 'Your right'}</Text>
            <Text style={styles.blockBody}>{outcome.right[lang]}</Text>
          </View>

          {/* Steps */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>② {lang === 'ko' ? '할 일 — 순서대로' : 'What to do — in order'}</Text>
            {outcome.steps.map((step: any, i: number) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step[lang]}</Text>
              </View>
            ))}
          </View>

          {/* Evidence */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>③ {lang === 'ko' ? '모아야 할 증거' : 'Evidence to gather'}</Text>
            {outcome.evidence.map((e: any, i: number) => (
              <Text key={i} style={styles.bulletItem}>• {e[lang]}</Text>
            ))}
          </View>

          {/* Deadlines */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>⏰ {lang === 'ko' ? '중요 기한' : 'Key deadlines'}</Text>
            {outcome.deadlines.map((d: any, i: number) => (
              <Text key={i} style={styles.bulletItem}>• {d[lang]}</Text>
            ))}
          </View>

          {/* Hotlines */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>④ {lang === 'ko' ? '실제 사람과 상담하기' : 'Talk to a real person'}</Text>
            {outcome.hotlines.map((h: string) => {
              const phone = extractPhone(h);
              return phone ? (
                <TouchableOpacity
                  key={h}
                  style={styles.hotlineRow}
                  onPress={() => Linking.openURL(`tel:${phone}`)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                >
                  <Text style={styles.hotlineEmoji}>📞</Text>
                  <Text style={styles.hotlineRowLabel}>{h}</Text>
                  <View style={styles.callChip}>
                    <Text style={styles.callChipText}>{lang === 'ko' ? '전화' : 'Call'}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text key={h} style={styles.hotline}>📞 {h}</Text>
              );
            })}
          </View>

          {/* Sources */}
          {outcome.statutes.map((s: any, i: number) => (
            <SourceBlock key={i} name={s.name} url={s.url} />
          ))}

          <Banner />

          {/* Post-outcome CTAs */}
          <TouchableOpacity
            style={styles.findHelpBtn}
            onPress={() => router.push('/directory' as any)}
            activeOpacity={0.75}
          >
            <Text style={styles.findHelpBtnText}>
              🧑‍⚖️ {lang === 'ko' ? '내 주변 노무사·상담소 찾기' : 'Find nearby help'}
            </Text>
          </TouchableOpacity>

          <Button
            label={lang === 'ko' ? '처음으로' : 'Start over'}
            onPress={() => {
              setFlags({});
              setStepNote(null);
              setShowOutcome(false);
              setCurrentStepId(data.steps[0].id);
              setHistory([]);
            }}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
          <TouchableOpacity style={styles.homeLink} onPress={() => router.push('/(tabs)/' as any)}>
            <Text style={styles.homeLinkText}>{lang === 'ko' ? '홈으로 돌아가기' : 'Back to home'}</Text>
          </TouchableOpacity>
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progress}>
          {data.steps.map((_: any, i: number) => (
            <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.progressText}>{stepIndex + 1} / {totalSteps}</Text>

        {/* Question */}
        <Text style={styles.question}>{currentStep.question[lang]}</Text>

        {/* Note from previous answer */}
        {stepNote && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>ℹ️ {stepNote}</Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.options}>
          {currentStep.options.map((option: any) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, transitioning && styles.optionCardDisabled]}
              onPress={() => handleOption(option)}
              activeOpacity={0.75}
              accessibilityRole="button"
              disabled={transitioning}
            >
              <Text style={styles.optionLabel}>{option.label[lang]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorText: { ...typography.bodyL, color: colors.text },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  // Coming-soon screen
  comingSoonEmoji: { fontSize: 48, marginBottom: spacing.sm },
  comingSoonTitle: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  comingSoonBox: { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.brand },
  comingSoonBody: { ...typography.bodyM, color: colors.text, lineHeight: 26 },
  hotlineSectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  nomusakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.selectedBg,
    borderRadius: radius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  hotlineEmoji: { fontSize: 20, marginRight: spacing.md },
  hotlineLabel: { flex: 1, ...typography.bodyM, color: colors.text, fontWeight: '600' },
  hotlineArrow: { ...typography.headingM, color: colors.action },
  callChip: { backgroundColor: colors.action, borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  callChipText: { ...typography.caption, color: colors.white, fontWeight: '700' },
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyL, color: colors.action },
  progress: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.action },
  progressText: { ...typography.caption, color: colors.textCaption, marginBottom: spacing.lg },
  question: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  noteBox: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  noteText: { ...typography.bodyS, color: colors.text },
  options: { gap: spacing.sm },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 56,
    justifyContent: 'center',
    ...shadow.card,
  },
  optionLabel: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  optionCardDisabled: { opacity: 0.5 },
  outcomeHeader: { marginBottom: spacing.lg },
  outcomeTitle: { ...typography.headingL, color: colors.text, fontWeight: '700' },
  block: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  blockTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  blockBody: { ...typography.bodyM, color: colors.text, lineHeight: 26 },
  stepRow: { flexDirection: 'row', marginBottom: spacing.sm },
  stepNum: { ...typography.bodyM, color: colors.action, fontWeight: '700', marginRight: spacing.sm, minWidth: 20 },
  stepText: { ...typography.bodyM, color: colors.text, flex: 1, lineHeight: 26 },
  bulletItem: { ...typography.bodyM, color: colors.text, marginBottom: spacing.xs, lineHeight: 24 },
  hotline: { ...typography.bodyL, color: colors.action, fontWeight: '700', marginBottom: spacing.xs },
  hotlineRowLabel: { flex: 1, ...typography.bodyM, color: colors.text, fontWeight: '600' },
  findHelpBtn: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.action,
  },
  findHelpBtnText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  homeLink: { alignItems: 'center', paddingVertical: spacing.md },
  homeLinkText: { ...typography.bodyS, color: colors.textCaption },
  personalizedSection: { marginBottom: spacing.base },
  personalizedHeader: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  personalizedNote: { borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.xs, borderLeftWidth: 3 },
  noteWarning: { backgroundColor: '#FEF3C7', borderLeftColor: '#D97706' },
  noteInfo: { backgroundColor: colors.infoBg, borderLeftColor: colors.action },
  noteTip: { backgroundColor: '#CCFBF1', borderLeftColor: colors.teal },
  personalizedNoteText: { ...typography.bodyS, color: colors.text, lineHeight: 20 },
});
