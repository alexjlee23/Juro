import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../constants/theme';

export default function CommunityScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.emoji}>👥</Text>
        <Text style={styles.title}>{t('tabs.community')}</Text>
        <Text style={styles.body}>
          {lang === 'ko'
            ? '커뮤니티 기능은 Phase 2에서 추가됩니다.\n노무사 Q&A, 직종별 채널, 실시간 인기글이 생길 예정입니다.'
            : 'Community features are coming in Phase 2.\n노무사 Q&A, job-type channels, and trending posts.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emoji: { fontSize: 56, marginBottom: spacing.base },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  body: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 26 },
});
