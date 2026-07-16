import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../constants/theme';

export const TERMS_GATE_KEY = 'juro_terms_gate_v1';

/**
 * EULA gate (App Review Guideline 1.2): presented at first launch, before any
 * login or registration. The app is unusable until the user agrees.
 */
export default function TermsGate({ onAgree }: { onAgree: () => void }) {
  const { i18n } = useTranslation();
  const lang = (i18n.language as 'ko' | 'en') ?? 'ko';
  const t = (ko: string, en: string) => (lang === 'ko' ? ko : en);

  async function agree() {
    await AsyncStorage.setItem(TERMS_GATE_KEY, 'yes');
    onAgree();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Language toggle so the reviewer (and users) can read it in English */}
        <View style={styles.langRow}>
          <TouchableOpacity
            onPress={() => i18n.changeLanguage(lang === 'ko' ? 'en' : 'ko')}
            style={styles.langToggle}
            accessibilityRole="button"
            accessibilityLabel="Change language"
          >
            <Text style={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.brandHeader}>
          <Image source={require('../../assets/logo.png')} style={styles.brandLogo} accessibilityLabel="Jurio logo" />
          <Text style={styles.brandName}>{t('주리오', 'Jurio')}</Text>
        </View>

        <Text style={styles.title}>{t('이용약관 (EULA)', 'Terms of Use (EULA)')}</Text>
        <Text style={styles.subtitle}>
          {t(
            '주리오를 사용하려면 아래 약관에 동의해야 합니다.',
            'You must agree to these terms to use Jurio.'
          )}
        </Text>

        <View style={styles.card}>
          <Text style={styles.point}>
            🚫 {t(
              '부적절한 콘텐츠와 악성 사용자에 대한 무관용 원칙(zero tolerance): 욕설·혐오, 괴롭힘, 음란물, 스팸, 사기, 개인정보 노출은 금지됩니다.',
              'ZERO TOLERANCE for objectionable content and abusive users: abuse, hate, harassment, sexual content, spam, scams, and exposing personal data are prohibited.'
            )}
          </Text>
          <Text style={styles.point}>
            🚩 {t(
              '신고된 콘텐츠는 24시간 이내 검토 후 삭제되며, 위반한 사용자의 계정은 예고 없이 정지·삭제됩니다.',
              'Reported content is reviewed within 24 hours and removed; violating users\' accounts are suspended or terminated without notice.'
            )}
          </Text>
          <Text style={styles.point}>
            🛡️ {t(
              '모든 게시글·댓글을 신고(🚩)하거나 작성자를 차단(🚫)할 수 있고, 신고한 콘텐츠는 내 화면에서 즉시 사라집니다. 문의: help@jurio.dev',
              'You can report (🚩) any post/comment or block (🚫) any user; reported content disappears from your feed immediately. Contact: help@jurio.dev'
            )}
          </Text>
          <Text style={styles.point}>
            ⚖️ {t(
              '주리오의 정보는 일반 법률 정보이며 법률 자문이 아닙니다.',
              'Jurio provides general legal information, not legal advice.'
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://jurio-gamma.vercel.app/terms')}
          accessibilityRole="link"
          style={{ marginBottom: spacing.base }}
        >
          <Text style={styles.link}>{t('이용약관 전문 보기 →', 'Read the full Terms of Use →')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={agree} accessibilityRole="button">
          <Text style={styles.btnText}>{t('동의합니다', 'I Agree')}</Text>
        </TouchableOpacity>
        <Text style={styles.declineNote}>
          {t(
            '동의하지 않으면 주리오를 사용할 수 없습니다.',
            'If you do not agree, you cannot use Jurio.'
          )}
        </Text>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  langToggle: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  langText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  brandHeader: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  brandLogo: { width: 56, height: 56, marginBottom: spacing.xs },
  brandName: { ...typography.headingM, color: colors.brand, fontWeight: '700' },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { ...typography.bodyS, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.base, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  point: { ...typography.bodyS, color: colors.text, lineHeight: 21 },
  link: { ...typography.bodyS, color: colors.action, fontWeight: '700', textAlign: 'center' },
  btn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    padding: spacing.base,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  declineNote: { ...typography.caption, color: colors.textCaption, textAlign: 'center' },
});
