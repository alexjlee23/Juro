import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';
import Button from '../components/ui/Button';

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;

  const handleDelete = () => {
    Alert.alert(
      t('privacy.deleteAccount'),
      t('privacy.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('privacy.deleteButton'), style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const DATA_ITEMS = lang === 'ko'
    ? ['앱 사용 이벤트 (익명, PII 없음)', '기기 언어 설정', '오프라인 근무 일지 (기기 내 저장)', '앱 충돌 리포트 (Sentry — 익명)']
    : ['App usage events (anonymous, no PII)', 'Device language preference', 'Offline work logbook (stored on-device only)', 'Crash reports (Sentry — anonymous)'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('privacy.title')}</Text>
        <Text style={styles.subtitle}>{t('privacy.subtitle')}</Text>

        {/* Trust pledge */}
        <View style={styles.trustBox}>
          <Text style={styles.trustText}>🔒 {t('privacy.neverReport')}</Text>
        </View>

        {/* Data collected */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('privacy.dataCollected')}</Text>
          {DATA_ITEMS.map((item, i) => (
            <Text key={i} style={styles.item}>• {item}</Text>
          ))}
          <Text style={styles.caption}>
            {lang === 'ko'
              ? '신분증, 비자번호, 위치 정보(서버 전송 없음)는 수집하지 않습니다.'
              : 'We do not collect national ID, visa numbers, or location data (location is processed on-device only).'}
          </Text>
        </View>

        {/* Consent */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('privacy.consent')}</Text>
          <Text style={styles.item}>✅ {lang === 'ko' ? '게스트 모드 (계정 없음)' : 'Guest mode (no account)'}</Text>
          <Text style={styles.item}>✅ {lang === 'ko' ? '익명 사용 분석 동의' : 'Anonymous analytics consent'}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button label={`⬇️ ${t('privacy.download')}`} onPress={() => {}} variant="secondary" style={{ marginBottom: spacing.sm }} />
          <Button label={`🗑️ ${t('privacy.deleteAccount')}`} onPress={handleDelete} variant="destructive" />
        </View>

        {/* Contact */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>{t('privacy.contact')}</Text>
          <Text style={styles.item}>privacy@jurio.app</Text>
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
  trustBox: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  trustText: { ...typography.bodyM, color: colors.action, fontWeight: '700', textAlign: 'center' },
  block: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  blockTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  item: { ...typography.bodyM, color: colors.text, marginBottom: spacing.xs, lineHeight: 24 },
  caption: { ...typography.caption, color: colors.textCaption, marginTop: spacing.sm, lineHeight: 18 },
  actions: { marginBottom: spacing.base },
});
