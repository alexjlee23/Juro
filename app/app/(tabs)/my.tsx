import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import { useAuth } from '../../context/AuthContext';

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
  const { user, profile, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert(
      lang === 'ko' ? '로그아웃' : 'Sign out',
      lang === 'ko' ? '로그아웃 하시겠습니까?' : 'Are you sure you want to sign out?',
      [
        { text: lang === 'ko' ? '취소' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ko' ? '로그아웃' : 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(tabs)' as any);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('my.title')}</Text>

        {/* User greeting or sign-in prompt */}
        {user ? (
          <View style={styles.userBanner}>
            <Text style={styles.userBannerText}>👋 {profile?.username ?? ''}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.signInPrompt} onPress={() => router.push('/(auth)/sign-up' as any)}>
            <Text style={styles.signInPromptText}>
              {lang === 'ko' ? '로그인하면 글쓰기·케이스 저장이 가능합니다' : 'Sign in to post and save your cases'}
            </Text>
            <Text style={styles.signInLink}>{lang === 'ko' ? '로그인 / 회원가입 →' : 'Sign in / Sign up →'}</Text>
          </TouchableOpacity>
        )}

        {/* Trust badge */}
        <View style={styles.trustBadge}>
          <Text style={styles.trustText}>
            🔒 {lang === 'ko' ? '신고하지 않습니다 · 신분증을 묻지 않습니다' : 'We never report you · We never ask for your ID'}
          </Text>
        </View>

        {/* My Cases */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '내 케이스' : 'My cases'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="📂" label={lang === 'ko' ? '내 케이스 & 진행 상황' : 'My cases & progress'} onPress={() => router.push('/my-cases' as any)} />
        </View>

        {/* Menu sections */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '도구' : 'Tools'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="🧮" label={lang === 'ko' ? '계산기 (임금·퇴직금)' : 'Calculators (wage & severance)'} onPress={() => router.push('/tools' as any)} />
          <SettingRow emoji="📋" label={lang === 'ko' ? '근로계약서 점검' : 'Contract checker'} onPress={() => router.push('/contract-checker' as any)} />
          <SettingRow emoji="📓" label={t('my.logbook')} onPress={() => router.push('/logbook' as any)} />
          <SettingRow emoji="📤" label={t('my.evidenceExport')} onPress={() => router.push('/logbook' as any)} />
        </View>

        <Text style={styles.sectionLabel}>{lang === 'ko' ? '정보' : 'Reference'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="📚" label={lang === 'ko' ? '권리 가이드' : 'Rights guide'} onPress={() => router.push('/rights')} />
          <SettingRow emoji="📖" label={lang === 'ko' ? '용어사전' : 'Glossary'} onPress={() => router.push('/glossary' as any)} />
          <SettingRow emoji="🌏" label={lang === 'ko' ? '외국인 노동자 허브' : 'Migrant worker hub'} onPress={() => router.push('/migrant-hub' as any)} />
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
          <SettingRow emoji="🔔" label={t('my.alerts')} onPress={() => router.push('/alerts' as any)} />
        </View>

        <Text style={styles.sectionLabel}>{lang === 'ko' ? '개인정보 & 법률' : 'Privacy & Legal'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="🛡️" label={t('my.privacyCenter')} onPress={() => router.push('/privacy')} />
          <SettingRow emoji="❓" label={t('my.help')} onPress={() => router.push('/help' as any)} />
          <SettingRow emoji="ℹ️" label={t('my.about')} onPress={() => router.push('/about' as any)} />
        </View>

        {user && (
          <>
            <Text style={styles.sectionLabel}>{lang === 'ko' ? '계정' : 'Account'}</Text>
            <View style={styles.section}>
              <SettingRow emoji="🚪" label={lang === 'ko' ? '로그아웃' : 'Sign out'} onPress={handleSignOut} />
            </View>
          </>
        )}

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
  userBanner: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  userBannerText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  userEmail: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  signInPrompt: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    ...shadow.card,
  },
  signInPromptText: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.xs },
  signInLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
