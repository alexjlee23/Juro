import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Switch, Alert, Share,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import BrandHeader from '../../components/ui/BrandHeader';
import { useAuth } from '../../context/AuthContext';

const LOGBOOK_KEY = 'juro_logbook_v1';

interface LogEntry {
  id: string; date: string; hoursWorked: string;
  payPromised: string; payReceived: string; note: string; createdAt: string;
}

function formatDate(iso: string, lang: 'ko' | 'en') {
  const [y, m, d] = iso.split('-');
  return lang === 'ko' ? `${y}년 ${parseInt(m)}월 ${parseInt(d)}일` : `${y}/${m}/${d}`;
}

function SettingRow({ emoji, label, subtitle, onPress, value, isSwitch, danger, download }: {
  emoji: string; label: string; subtitle?: string; onPress?: () => void;
  value?: boolean; isSwitch?: boolean; danger?: boolean; download?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={isSwitch}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
    >
      <Text style={styles.settingEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch value={value} onValueChange={onPress as any} trackColor={{ true: colors.action }} />
      ) : download ? (
        <Text style={styles.downloadIndicator}>↓</Text>
      ) : (
        <Text style={[styles.arrow, danger && styles.arrowDanger]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function MyScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const [largeText, setLargeText] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const { user, profile, signOut } = useAuth();

  // ── Evidence export: reads logbook from device and shares as text ──────────
  async function handleEvidenceExport() {
    try {
      const raw = await AsyncStorage.getItem(LOGBOOK_KEY);
      const entries: LogEntry[] = raw ? JSON.parse(raw) : [];

      if (entries.length === 0) {
        Alert.alert(
          lang === 'ko' ? '근무 일지 기록 없음' : 'No logbook records',
          lang === 'ko'
            ? '근무 일지에 기록이 없습니다.\n아래 "도구 → 근무 일지"에서 근무 기록을 먼저 추가해주세요.'
            : 'Your logbook has no entries yet.\nAdd shift records in Work Logbook first.'
        );
        return;
      }

      const title = lang === 'ko'
        ? '주리오 — 근무 일지 (증거 자료)'
        : 'Jurio — Work Logbook (Evidence Record)';

      const totalPromised = entries.reduce((s, e) => s + (parseFloat(e.payPromised.replace(/,/g, '')) || 0), 0);
      const totalReceived = entries.reduce((s, e) => s + (parseFloat(e.payReceived.replace(/,/g, '')) || 0), 0);
      const totalUnpaid = totalPromised - totalReceived;

      const lines: string[] = [title, '='.repeat(40), ''];
      lines.push(lang === 'ko' ? `📋 총 ${entries.length}건 기록` : `📋 Total ${entries.length} shift records`);
      if (totalPromised > 0) lines.push(lang === 'ko' ? `💰 약속 임금 합계: ₩${totalPromised.toLocaleString()}` : `💰 Total promised: ₩${totalPromised.toLocaleString()}`);
      if (totalReceived > 0) lines.push(lang === 'ko' ? `✅ 지급 금액 합계: ₩${totalReceived.toLocaleString()}` : `✅ Total received: ₩${totalReceived.toLocaleString()}`);
      if (totalUnpaid > 0) lines.push(lang === 'ko' ? `⚠️  미지급 합계: ₩${totalUnpaid.toLocaleString()}` : `⚠️  Total unpaid: ₩${totalUnpaid.toLocaleString()}`);
      lines.push('', '-'.repeat(40), '');

      entries.forEach((e, i) => {
        lines.push(`[${i + 1}] ${formatDate(e.date, lang)}`);
        if (e.hoursWorked) lines.push(`  ${lang === 'ko' ? '근무' : 'Hours'}: ${e.hoursWorked}${lang === 'ko' ? '시간' : 'h'}`);
        if (e.payPromised) lines.push(`  ${lang === 'ko' ? '약속' : 'Promised'}: ₩${e.payPromised}`);
        if (e.payReceived) lines.push(`  ${lang === 'ko' ? '지급' : 'Received'}: ₩${e.payReceived}`);
        const p = parseFloat(e.payPromised.replace(/,/g, '')) || 0;
        const r = parseFloat(e.payReceived.replace(/,/g, '')) || 0;
        if (p > r) lines.push(`  ${lang === 'ko' ? '⚠️ 미지급' : '⚠️ Unpaid'}: ₩${(p - r).toLocaleString()}`);
        if (e.note) lines.push(`  ${lang === 'ko' ? '메모' : 'Note'}: ${e.note}`);
        lines.push('');
      });

      lines.push('-'.repeat(40));
      lines.push(lang === 'ko'
        ? '이 문서는 노동부 진정 또는 노무사 상담에 활용할 수 있습니다.'
        : 'This document can be used for a labor complaint or 노무사 consultation.');
      lines.push(lang === 'ko' ? '고용노동부: ☎1350 · labor.moel.go.kr' : 'Ministry of Labor: ☎1350 · labor.moel.go.kr');
      lines.push(lang === 'ko' ? '외국인 노동자: ☎1644-0644 · ☎1345' : 'Migrant workers: ☎1644-0644 · ☎1345');
      lines.push('', lang === 'ko' ? `내보낸 날짜: ${new Date().toLocaleString('ko-KR')}` : `Exported: ${new Date().toLocaleString('en-GB')}`);

      await Share.share({ title, message: lines.join('\n') });
    } catch {
      Alert.alert(
        lang === 'ko' ? '오류' : 'Error',
        lang === 'ko' ? '내보내기 중 오류가 발생했습니다.' : 'Something went wrong during export.'
      );
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleConfirmSignOut() {
    setConfirmingSignOut(false);
    await signOut();
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <BrandHeader />
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

        {/* Tools */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '도구' : 'Tools'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="🧮" label={lang === 'ko' ? '계산기 (임금·퇴직금)' : 'Calculators (wage & severance)'} onPress={() => router.push('/tools' as any)} />
          <SettingRow emoji="📋" label={lang === 'ko' ? '근로계약서 점검' : 'Contract checker'} onPress={() => router.push('/contract-checker' as any)} />
          <SettingRow emoji="📓" label={t('my.logbook')} onPress={() => router.push('/logbook' as any)} />
          <SettingRow
            emoji="📤"
            label={t('my.evidenceExport')}
            subtitle={t('my.evidenceExportSub')}
            download
            onPress={handleEvidenceExport}
          />
        </View>

        {/* Reference */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '정보' : 'Reference'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="📚" label={lang === 'ko' ? '권리 가이드' : 'Rights guide'} onPress={() => router.push('/rights')} />
          <SettingRow emoji="📖" label={lang === 'ko' ? '용어사전' : 'Glossary'} onPress={() => router.push('/glossary' as any)} />
          <SettingRow emoji="🌏" label={lang === 'ko' ? '외국인 노동자 허브' : 'Migrant worker hub'} onPress={() => router.push('/migrant-hub' as any)} />
        </View>

        {/* Settings */}
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

        {/* Privacy & Legal */}
        <Text style={styles.sectionLabel}>{lang === 'ko' ? '개인정보 & 법률' : 'Privacy & Legal'}</Text>
        <View style={styles.section}>
          <SettingRow emoji="🛡️" label={t('my.privacyCenter')} onPress={() => router.push('/privacy')} />
          <SettingRow emoji="❓" label={t('my.help')} onPress={() => router.push('/help' as any)} />
          <SettingRow emoji="ℹ️" label={t('my.about')} onPress={() => router.push('/about' as any)} />
        </View>

        {/* Account — sign out with inline confirmation */}
        {user && (
          <>
            <Text style={styles.sectionLabel}>{lang === 'ko' ? '계정' : 'Account'}</Text>
            <View style={styles.section}>
              {confirmingSignOut ? (
                <View style={styles.signOutConfirm}>
                  <Text style={styles.signOutQuestion}>
                    {lang === 'ko' ? '정말 로그아웃 하시겠습니까?' : 'Are you sure you want to sign out?'}
                  </Text>
                  <View style={styles.signOutBtns}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setConfirmingSignOut(false)}
                    >
                      <Text style={styles.cancelBtnText}>{lang === 'ko' ? '취소' : 'Cancel'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={handleConfirmSignOut}
                    >
                      <Text style={styles.confirmBtnText}>{lang === 'ko' ? '로그아웃' : 'Sign out'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <SettingRow
                  emoji="🚪"
                  label={lang === 'ko' ? '로그아웃' : 'Sign out'}
                  danger
                  onPress={() => setConfirmingSignOut(true)}
                />
              )}
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
  sectionLabel: {
    ...typography.bodyS,
    color: colors.textCaption,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.base,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  settingLabel: { ...typography.bodyM, color: colors.text },
  settingLabelDanger: { color: '#DC2626' },
  settingSubtitle: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  arrow: { ...typography.headingM, color: colors.textCaption },
  arrowDanger: { color: '#DC2626' },
  downloadIndicator: { fontSize: 18, color: colors.action, fontWeight: '700', marginLeft: spacing.sm },
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

  // Inline sign-out confirmation
  signOutConfirm: {
    padding: spacing.base,
  },
  signOutQuestion: {
    ...typography.bodyM,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  signOutBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...typography.bodyS,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  confirmBtnText: {
    ...typography.bodyS,
    color: colors.white,
    fontWeight: '700',
  },
});
