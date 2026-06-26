import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';

const SITUATIONS = [
  { id: 'unpaid-wages', emoji: '💰', ko: '임금을 못 받았어요', en: "I wasn't paid" },
  { id: 'injury', emoji: '🤕', ko: '일하다 다쳤어요', en: 'I was injured at work' },
  { id: 'dismissal', emoji: '🚫', ko: '해고됐어요', en: 'I was fired' },
  { id: 'dangerous', emoji: '⚠️', ko: '위험한 일을 시켜요', en: "I'm told to do dangerous work" },
  { id: 'contract', emoji: '📄', ko: '계약이 이상해요', en: 'My contract looks wrong' },
  { id: 'visa-threat', emoji: '🛂', ko: '비자로 협박해요', en: 'My boss is threatening my visa' },
];

export default function GuidedHelpIndex() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('guidedHelp.title')}</Text>
        <Text style={styles.subtitle}>{t('guidedHelp.subtitle')}</Text>

        <View style={styles.list}>
          {SITUATIONS.map((s) => {
                return (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() => router.push(`/guided-help/${s.id}` as any)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={lang === 'ko' ? s.ko : s.en}
              >
                <Text style={styles.emoji}>{s.emoji}</Text>
                <View style={styles.textBlock}>
                  <Text style={styles.situationKo}>{s.ko}</Text>
                  <Text style={styles.situationEn}>{s.en}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          })}
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
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },
  list: { gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.card,
  },
  cardDisabled: { opacity: 0.5 },
  emoji: { fontSize: 28, marginRight: spacing.md },
  textBlock: { flex: 1 },
  situationKo: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  situationEn: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  arrow: { ...typography.headingM, color: colors.action },
  soon: { ...typography.caption, color: colors.textCaption, backgroundColor: colors.surfaceTint, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
});
