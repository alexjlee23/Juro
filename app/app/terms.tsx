import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';

export default function TermsScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => (lang === 'ko' ? ko : en);

  const sections: { title: string; body: string }[] = lang === 'ko' ? [
    {
      title: '1. 약관의 동의',
      body: '주리오(Jurio) 계정을 만들거나 서비스를 이용하면 본 이용약관에 동의하는 것으로 간주됩니다. 동의하지 않으면 계정을 만들 수 없습니다.',
    },
    {
      title: '2. 법률 자문이 아닙니다',
      body: '주리오가 제공하는 모든 정보는 일반적인 법률 정보이며 법률 자문이 아닙니다. 주리오를 이용해도 노무사-의뢰인 관계가 형성되지 않습니다. 구체적인 상황에 대한 판단은 반드시 공인노무사 또는 관계 기관과 상담하세요.',
    },
    {
      title: '3. 커뮤니티 규칙 — 무관용 원칙',
      body: '주리오는 부적절한 콘텐츠와 악성 사용자에 대해 무관용 원칙(zero tolerance)을 적용합니다.\n\n금지되는 콘텐츠: 욕설·혐오·차별 발언, 괴롭힘·협박, 음란물, 스팸·광고, 사기·구인사기, 타인의 개인정보 노출, 명예훼손, 불법 행위 조장.\n\n신고된 콘텐츠는 24시간 이내에 검토하며, 규칙을 위반한 콘텐츠는 삭제하고 작성자의 계정을 예고 없이 정지 또는 삭제할 수 있습니다. 모든 게시글과 댓글에는 신고(🚩) 기능이 있으며, 다른 사용자를 차단(🚫)할 수 있습니다.',
    },
    {
      title: '4. 사용자 콘텐츠',
      body: '커뮤니티에 게시한 콘텐츠의 책임은 작성자에게 있습니다. 게시글은 노동자 간 정보 공유이며 법률 자문이 아닙니다. 주리오는 서비스 운영·개선을 위해 게시된 콘텐츠를 표시·보관할 수 있습니다.',
    },
    {
      title: '5. 계정',
      body: '계정 생성에는 이메일 주소만 필요합니다. 주리오는 신분증·비자번호를 절대 요구하지 않습니다. 계정과 데이터는 앱 내(내 정보 → 개인정보 센터) 또는 웹(jurio-gamma.vercel.app/delete-account)에서 언제든 삭제할 수 있습니다.',
    },
    {
      title: '6. 책임의 제한',
      body: '주리오는 무료 공익 서비스로 제공되며, 정보의 정확성을 위해 노력하지만 법령 개정 등으로 최신 정보와 차이가 있을 수 있습니다. 서비스 이용으로 발생한 결정과 결과에 대한 책임은 이용자에게 있습니다.',
    },
    {
      title: '7. 약관의 변경 및 문의',
      body: '약관이 변경되면 앱 내에 공지합니다. 부적절한 콘텐츠·활동 신고 및 문의: help@jurio.app (24시간 이내 조치) 또는 앱 내 도움말·문의 페이지.',
    },
  ] : [
    {
      title: '1. Acceptance of Terms',
      body: 'By creating a Jurio account or using the service, you agree to these Terms of Use. If you do not agree, you may not create an account.',
    },
    {
      title: '2. Not Legal Advice',
      body: 'All information provided by Jurio is general legal information, not legal advice. Using Jurio does not create an attorney–client relationship. For your specific situation, always consult a certified labor attorney or the relevant authority.',
    },
    {
      title: '3. Community Rules — Zero Tolerance',
      body: 'Jurio has ZERO TOLERANCE for objectionable content and abusive users.\n\nProhibited content: abusive, hateful, or discriminatory speech; harassment or threats; sexual content; spam or advertising; scams and fake job offers; exposing others\' personal information; defamation; promotion of illegal activity.\n\nReported content is reviewed within 24 hours; content that violates these rules is removed, and the author\'s account may be suspended or terminated without notice. Every post and comment has a report (🚩) function, and you can block (🚫) any user.',
    },
    {
      title: '4. User Content',
      body: 'You are responsible for the content you post. Community posts are peer information sharing, not legal advice. Jurio may display and store posted content to operate and improve the service.',
    },
    {
      title: '5. Accounts',
      body: 'Only an email address is required to create an account. Jurio never asks for your national ID or visa number. You can delete your account and data anytime in the app (My → Privacy Center) or on the web (jurio-gamma.vercel.app/delete-account).',
    },
    {
      title: '6. Limitation of Liability',
      body: 'Jurio is provided as a free public-interest service. We strive for accuracy, but laws change and information may lag. You are responsible for decisions made based on the service.',
    },
    {
      title: '7. Changes & Contact',
      body: 'Changes to these terms will be announced in the app. To report inappropriate content or activity, or for any inquiry: help@jurio.app (actioned within 24 hours) or the in-app Help page.',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('이용약관', 'Terms of Use')}</Text>
        <Text style={styles.subtitle}>{t('시행일: 2026년 7월 9일', 'Effective: July 9, 2026')}</Text>

        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

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
  subtitle: { ...typography.caption, color: colors.textCaption, marginBottom: spacing.lg },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  sectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  sectionBody: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 22 },
});
