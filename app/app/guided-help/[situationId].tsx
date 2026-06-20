import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import SourceBlock from '../../components/ui/SourceBlock';
import Button from '../../components/ui/Button';

import unpaidWagesData from '../../content/guided-paths/unpaid-wages.json';

const PATHS: Record<string, any> = {
  'unpaid-wages': unpaidWagesData,
};

export default function GuidedHelpFlow() {
  const { situationId } = useLocalSearchParams<{ situationId: string }>();
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  const data = PATHS[situationId];
  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{lang === 'ko' ? '준비 중입니다.' : 'Coming soon.'}</Text>
          <Button label={lang === 'ko' ? '뒤로' : 'Back'} onPress={() => router.back()} variant="secondary" style={{ marginTop: spacing.base }} />
        </View>
      </SafeAreaView>
    );
  }

  const [currentStepId, setCurrentStepId] = useState<string>(data.steps[0].id);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [stepNote, setStepNote] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const currentStep = data.steps.find((s: any) => s.id === currentStepId);
  const stepIndex = data.steps.findIndex((s: any) => s.id === currentStepId);
  const totalSteps = data.steps.length;

  const handleOption = (option: any) => {
    const newFlags = { ...flags, ...option.sets };
    setFlags(newFlags);
    const note = option.note ? option.note[lang] : null;
    setStepNote(note);
    if (option.next === 'outcome') {
      setTimeout(() => setShowOutcome(true), note ? 1200 : 0);
    } else {
      setTimeout(() => {
        setCurrentStepId(option.next);
        setStepNote(null);
      }, note ? 1200 : 0);
    }
  };

  if (showOutcome) {
    const outcome = data.outcome;
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.outcomeHeader}>
            <Text style={styles.outcomeTitle}>{lang === 'ko' ? '다음 단계' : 'Your next steps'}</Text>
          </View>

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
            {outcome.hotlines.map((h: string) => (
              <Text key={h} style={styles.hotline}>📞 {h}</Text>
            ))}
          </View>

          {/* Sources */}
          {outcome.statutes.map((s: any, i: number) => (
            <SourceBlock key={i} name={s.name} url={s.url} />
          ))}

          <Banner />

          <Button
            label={lang === 'ko' ? '처음으로' : 'Start over'}
            onPress={() => {
              setFlags({});
              setStepNote(null);
              setShowOutcome(false);
              setCurrentStepId(data.steps[0].id);
            }}
            variant="secondary"
            style={{ marginTop: spacing.lg }}
          />
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
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
              style={styles.optionCard}
              onPress={() => handleOption(option)}
              activeOpacity={0.75}
              accessibilityRole="button"
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
});
