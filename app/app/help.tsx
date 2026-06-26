import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

type FAQ = { q: string; a: string };

const FAQS_KO: FAQ[] = [
  { q: '주리오는 무료인가요?', a: '네, 완전 무료입니다. 광고도 없고, 숨은 비용도 없습니다.' },
  { q: '제 개인정보는 안전한가요?', a: '신분증, 비자번호, 국적을 절대 묻지 않습니다. 위치 정보는 기기 내에서만 처리되고 서버로 전송되지 않습니다. 주리오는 어떤 기관에도 사용자를 신고하지 않습니다.' },
  { q: 'AI가 법률 자문을 해주나요?', a: '아닙니다. 주리오 AI는 관련 법령을 찾아드릴 뿐이며 법률 자문이 아닙니다. 구체적인 상황에 대한 판단은 반드시 노무사 또는 변호사와 상담하세요.' },
  { q: '외국인 노동자도 이용할 수 있나요?', a: '네. 한국 노동법은 체류 자격에 관계없이 국내에서 일하는 모든 노동자를 보호합니다. 앱은 한국어·영어로 제공되며, 다국어 상담 전화(☎ 1345, ☎ 1644-0644)도 안내합니다.' },
  { q: '게시물은 어떻게 삭제하나요?', a: '커뮤니티 게시물은 해당 글 상세 화면에서 삭제할 수 있습니다. 문제가 있는 게시물은 신고 기능을 이용해 주세요.' },
  { q: '계정을 삭제하려면 어떻게 하나요?', a: '내 정보 → 개인정보 센터 → 계정 삭제에서 바로 삭제할 수 있습니다.' },
];

const FAQS_EN: FAQ[] = [
  { q: 'Is Jurio free?', a: 'Yes, completely free. No ads, no hidden costs.' },
  { q: 'Is my information safe?', a: 'We never ask for your ID, visa number, or nationality. Location is processed on-device only and never sent to our servers. Jurio never reports users to any authority.' },
  { q: 'Does the AI give legal advice?', a: 'No. The Jurio AI only retrieves relevant statutes — it is not legal advice. For judgment on your specific situation, always consult a certified 노무사 or lawyer.' },
  { q: 'Can migrant workers use this app?', a: 'Yes. Korean labour law protects all workers in Korea regardless of visa status. The app is available in Korean and English, and we guide you to multilingual hotlines (☎ 1345, ☎ 1644-0644).' },
  { q: 'How do I delete a post?', a: 'Open the post detail screen and use the delete option. To report a problematic post, use the report button on the post.' },
  { q: 'How do I delete my account?', a: 'Go to My → Privacy Center → Delete account.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;
  const faqs = lang === 'ko' ? FAQS_KO : FAQS_EN;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('내 정보', 'My')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('도움말 & 문의', 'Help & Contact')}</Text>
        <Text style={styles.subtitle}>
          {t('자주 묻는 질문이나 문의사항을 확인하세요.', 'Find answers to common questions or reach out to us.')}
        </Text>

        <Text style={styles.sectionLabel}>{t('자주 묻는 질문', 'Frequently asked questions')}</Text>
        <View style={styles.faqSection}>
          {faqs.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, i === faqs.length - 1 && styles.faqItemLast]}
              onPress={() => setOpenIndex(openIndex === i ? null : i)}
              accessibilityRole="button"
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqChevron}>{openIndex === i ? '▲' : '▼'}</Text>
              </View>
              {openIndex === i && (
                <Text style={styles.faqA}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('문의하기', 'Contact us')}</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:help@jurio.app')}>
            <Text style={styles.contactEmoji}>✉️</Text>
            <View style={styles.contactBody}>
              <Text style={styles.contactLabel}>{t('이메일 문의', 'Email support')}</Text>
              <Text style={styles.contactValue}>help@jurio.app</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactRow, styles.contactRowLast]} onPress={() => router.push('/privacy' as any)}>
            <Text style={styles.contactEmoji}>🛡️</Text>
            <View style={styles.contactBody}>
              <Text style={styles.contactLabel}>{t('개인정보 처리방침', 'Privacy policy')}</Text>
              <Text style={styles.contactValue}>{t('개인정보 센터에서 확인', 'View in Privacy Center')}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hotlineBox}>
          <Text style={styles.hotlineTitle}>{t('노동 문제 긴급 상담', 'Emergency labour support')}</Text>
          <TouchableOpacity onPress={() => Linking.openURL('tel:1350')}>
            <Text style={styles.hotlineItem}>📞 {t('고용노동부', 'Ministry of Employment & Labor')} ☎ 1350</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:1644-0644')}>
            <Text style={styles.hotlineItem}>🌏 {t('외국인 노동자 상담', 'Migrant worker helpline')} ☎ 1644-0644</Text>
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
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 24 },
  sectionLabel: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.base },
  faqSection: { backgroundColor: colors.white, borderRadius: radius.md, ...shadow.card, overflow: 'hidden', marginBottom: spacing.xs },
  faqItem: { padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  faqItemLast: { borderBottomWidth: 0 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { ...typography.bodyM, color: colors.text, fontWeight: '600', flex: 1, paddingRight: spacing.sm },
  faqChevron: { ...typography.caption, color: colors.textCaption },
  faqA: { ...typography.bodyM, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 24 },
  contactCard: { backgroundColor: colors.white, borderRadius: radius.md, ...shadow.card, overflow: 'hidden', marginBottom: spacing.xs },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  contactRowLast: { borderBottomWidth: 0 },
  contactEmoji: { fontSize: 22, marginRight: spacing.md },
  contactBody: { flex: 1 },
  contactLabel: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  contactValue: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  arrow: { ...typography.headingM, color: colors.textCaption },
  hotlineBox: { backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.base, marginTop: spacing.sm },
  hotlineTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  hotlineItem: { ...typography.bodyS, color: colors.action, lineHeight: 28, fontWeight: '500' },
});
