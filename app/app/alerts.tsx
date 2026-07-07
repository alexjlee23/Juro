import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

export default function AlertsScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  const [lawChanges, setLawChanges] = useState(true);
  const [minWage, setMinWage] = useState(true);
  const [caseReminders, setCaseReminders] = useState(true);
  const [consultSchedule, setConsultSchedule] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('내 정보', 'My')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('알림 설정', 'Alerts')}</Text>
        <Text style={styles.subtitle}>
          {t('중요한 법 개정, 최저임금 변경, 케이스 마감일을 놓치지 마세요.', 'Never miss important law changes, minimum wage updates, or case deadlines.')}
        </Text>

        <Text style={styles.sectionLabel}>{t('법률 & 정책', 'Law & policy')}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowEmoji}>⚖️</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{t('근로기준법 개정 알림', 'Labor law changes')}</Text>
              <Text style={styles.rowDesc}>{t('법이 바뀌면 즉시 알림', 'Notified when laws change')}</Text>
            </View>
            <Switch value={lawChanges} onValueChange={setLawChanges} trackColor={{ true: colors.action }} />
          </View>
          <View style={[styles.row, styles.rowNoBorder]}>
            <Text style={styles.rowEmoji}>💰</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{t('최저임금 변경 알림', 'Minimum wage updates')}</Text>
              <Text style={styles.rowDesc}>{t('매년 1월 새 최저임금 공지', 'New rate announced each January')}</Text>
            </View>
            <Switch value={minWage} onValueChange={setMinWage} trackColor={{ true: colors.action }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('내 케이스', 'My cases')}</Text>
        <View style={styles.section}>
          <View style={[styles.row, styles.rowNoBorder]}>
            <Text style={styles.rowEmoji}>📅</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{t('케이스 마감일 알림', 'Case deadline reminders')}</Text>
              <Text style={styles.rowDesc}>{t('부당해고 3개월 등 중요 기한 알림', 'e.g. unfair dismissal 3-month limit')}</Text>
            </View>
            <Switch value={caseReminders} onValueChange={setCaseReminders} trackColor={{ true: colors.action }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t('상담 일정', 'Consultations')}</Text>
        <View style={styles.section}>
          <View style={[styles.row, styles.rowNoBorder]}>
            <Text style={styles.rowEmoji}>🗓️</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{t('무료 상담 일정 알림', 'Free consultation alerts')}</Text>
              <Text style={styles.rowDesc}>{t('근처 무료 노무 상담 일정 공지', 'Nearby free labor attorney sessions')}</Text>
            </View>
            <Switch value={consultSchedule} onValueChange={setConsultSchedule} trackColor={{ true: colors.action }} />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t(
              '📱 알림을 받으려면 기기의 알림 권한을 허용해 주세요. 설정 → 앱 → 주리오 → 알림.',
              '📱 To receive alerts, allow notifications in your device settings: Settings → Apps → Jurio → Notifications.'
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
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 24 },
  sectionLabel: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.base },
  section: { backgroundColor: colors.white, borderRadius: radius.md, ...shadow.card, overflow: 'hidden', marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowNoBorder: { borderBottomWidth: 0 },
  rowEmoji: { fontSize: 22, marginRight: spacing.md },
  rowBody: { flex: 1 },
  rowLabel: { ...typography.bodyM, color: colors.text, fontWeight: '600', marginBottom: 2 },
  rowDesc: { ...typography.caption, color: colors.textCaption, lineHeight: 16 },
  infoBox: { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.base },
  infoText: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 20 },
});
