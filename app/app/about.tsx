import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

const LINKS = [
  { emoji: '⚖️', labelKo: '국가법령정보센터', labelEn: 'National Legislation Info Centre', url: 'https://www.law.go.kr' },
  { emoji: '📖', labelKo: '찾기 쉬운 생활법령', labelEn: 'Easy Law', url: 'https://easylaw.go.kr' },
  { emoji: '🏛️', labelKo: '고용노동부 포털', labelEn: 'Ministry of Employment & Labor', url: 'https://labor.moel.go.kr' },
  { emoji: '🏥', labelKo: '근로복지공단 (COMWEL)', labelEn: 'COMWEL', url: 'https://total.comwel.or.kr' },
];

export default function AboutScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('내 정보', 'My')}</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Image source={require('../assets/logo.png')} style={styles.heroImage} accessibilityLabel="Jurio logo" />
          <Text style={styles.heroLogo}>주리오</Text>
          <Text style={styles.heroTagline}>
            {t('당신의 권리를 알고, 당당하게.', 'Know your rights. Walk with confidence.')}
          </Text>
          <Text style={styles.heroVersion}>v1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('우리의 사명', 'Our mission')}</Text>
          <Text style={styles.blockBody}>
            {t(
              '주리오는 한국에서 일하는 모든 노동자가 자신의 권리를 쉽게 알고, 필요한 도움을 빠르게 찾을 수 있도록 만든 앱입니다.\n\n한국어와 영어로 제공되며, 법 정보는 항상 출처와 최신 날짜를 표시합니다. 이주 노동자와 불안정한 고용 상태의 노동자를 위해 설계됐습니다.',
              'Jurio is an app built to help every worker in Korea easily understand their rights and quickly find the help they need.\n\nAvailable in Korean and English, all legal information is sourced and date-stamped. Designed with migrant and precarious workers in mind.'
            )}
          </Text>
        </View>

        {/* Principles */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('약속', 'Our promises')}</Text>
          {[
            t('🔒 신분증·비자번호를 절대 묻지 않습니다', '🔒 We never ask for your ID or visa number'),
            t('🚫 어떤 기관에도 사용자를 신고하지 않습니다', '🚫 We never report users to any authority'),
            t('📍 위치 정보는 기기 내에서만 처리됩니다', '📍 Location is processed on-device only'),
            t('⚖️ AI는 법령을 찾아드릴 뿐, 법률 자문이 아닙니다', '⚖️ AI retrieves statutes only — not legal advice'),
            t('📅 모든 법 정보에 출처와 최신 날짜를 표시합니다', '📅 All legal content shows its source and update date'),
          ].map((item, i) => (
            <Text key={i} style={styles.principleItem}>{item}</Text>
          ))}
        </View>

        {/* Sources */}
        <Text style={styles.sectionLabel}>{t('출처 & 공식 링크', 'Sources & official links')}</Text>
        <View style={styles.linksCard}>
          {LINKS.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkRow, i === LINKS.length - 1 && styles.linkRowLast]}
              onPress={() => Linking.openURL(link.url)}
            >
              <Text style={styles.linkEmoji}>{link.emoji}</Text>
              <Text style={styles.linkLabel}>{t(link.labelKo, link.labelEn)}</Text>
              <Text style={styles.arrow}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            {t(
              '주리오가 제공하는 정보는 일반적인 법률 정보이며 법률 자문이 아닙니다. 귀하의 구체적인 상황에 대한 법적 판단은 반드시 공인 노무사 또는 변호사와 상담하시기 바랍니다.',
              'Information provided by Jurio is general legal information, not legal advice. For judgment on your specific situation, always consult a certified 노무사 (labour attorney) or lawyer.'
            )}
          </Text>
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
  heroCard: {
    backgroundColor: colors.action,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroImage: { width: 64, height: 64, marginBottom: spacing.sm, backgroundColor: colors.white, borderRadius: 16, },
  heroLogo: { fontSize: 32, fontWeight: '800', color: colors.white, marginBottom: spacing.xs },
  heroTagline: { ...typography.bodyM, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, marginBottom: spacing.sm },
  heroVersion: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
  block: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, ...shadow.card },
  blockTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  blockBody: { ...typography.bodyM, color: colors.textSecondary, lineHeight: 26 },
  principleItem: { ...typography.bodyM, color: colors.text, lineHeight: 28 },
  sectionLabel: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  linksCard: { backgroundColor: colors.white, borderRadius: radius.md, ...shadow.card, overflow: 'hidden', marginBottom: spacing.base },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  linkRowLast: { borderBottomWidth: 0 },
  linkEmoji: { fontSize: 20, marginRight: spacing.md },
  linkLabel: { ...typography.bodyM, color: colors.text, flex: 1 },
  arrow: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  disclaimerBox: { backgroundColor: colors.surfaceTint, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.base },
  disclaimerText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
