import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';

function SettingRow({ emoji, label, onPress, value, isSwitch }: {
  emoji: string; label: string; onPress?: () => void; value?: boolean; isSwitch?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={isSwitch}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
    >
      <Text style={styles.settingEmoji}>{emoji}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      {isSwitch ? (
        <Switch value={value} onValueChange={onPress as any} trackColor={{ true: colors.action }} />
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function MyScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language;
  const [largeText, setLargeText] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('my.title')}</Text>

        {/* Trust badge */}
        <View style={styles.trustBadge}>
          <Text style={styles.trustText}>
            🔒 {lang === 'ko' ? '신고하지 않습니다 · 신분증을 묻지 않습니다' : 'We never report you · We never ask for your ID'}
          </Text>
        </View>

        {/* Menu sections */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '도구' : 'Tools'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="📋" label={t('my.cases')} onPress={() => {}} />
          <SettingRow emoji="🔖" label={t('my.saved')} onPress={() => {}} />
          <SettingRow emoji="📓" label={t('my.logbook')} onPress={() => {}} />
          <SettingRow emoji="📤" label={t('my.evidenceExport')} onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>{lang === 'ko' ? '설정' : 'Settings'}</Text>
        <View style={styles.section}>
          <SettingRow
            emoji="🌐"
            label={`${t('my.language')}: ${lang === 'ko' ? '한국어' : 'English'}`}
            onPress={() => i18n.changeLanguage(lang === 'ko' ? 'en' : 'ko')}
          />
          <SettingRow
            emoji="🔤"
            label={t('my.largeText')}
            isSwitch
            value={largeText}
            onPress={() => setLargeText(!largeText)}
          />
          <SettingRow emoji="🔔" label={t('my.alerts')} onPress={() => {}} />
        </View>

        <Text style={styles.sectionLabel}>{lang === 'ko' ? '개인정보 & 법률' : 'Privacy & Legal'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="🛡️" label={t('my.privacyCenter')} onPress={() => router.push('/privacy')} />
          <SettingRow emoji="❓" label={t('my.help')} onPress={() => {}} />
          <SettingRow emoji="ℹ️" label={t('my.about')} onPress={() => {}} />
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
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.base },
  trustBadge: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trustText: { ...typography.bodyS, color: colors.action, fontWeight: '600', textAlign: 'center' },
  sectionLabel: { ...typography.bodyS, color: colors.textCaption, fontWeight: '700', marginBottom: spacing.xs, marginTop: spacing.base, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    ...shadow.card,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 52,
  },
  settingEmoji: { fontSize: 20, marginRight: spacing.md },
  settingLabel: { ...typography.bodyM, color: colors.text, flex: 1 },
  arrow: { ...typography.headingM, color: colors.textCaption },
});
