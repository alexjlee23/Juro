import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius } from '../../constants/theme';

type Mode = 'signup' | 'signin';

export default function AuthScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const params = useLocalSearchParams<{ mode?: string }>();

  const [mode, setMode] = useState<Mode>(params.mode === 'signin' ? 'signin' : 'signup');

  // Sign-up fields
  const [username, setUsername] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suLoading, setSuLoading] = useState(false);
  const [suError, setSuError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // Sign-in fields
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState('');

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  function switchMode(m: Mode) {
    setMode(m);
    setSuError('');
    setSiError('');
  }

  const getConfirmRedirectUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/auth/confirm`;
    }
    return 'https://jurio-gamma.vercel.app/auth/confirm';
  };

  async function handleSignUp() {
    setSuError('');
    if (!username.trim() || !suEmail.trim() || !suPassword) {
      setSuError(t('모든 항목을 입력해 주세요.', 'Please fill in all fields.'));
      return;
    }
    if (username.trim().length < 2) {
      setSuError(t('닉네임은 2자 이상이어야 합니다.', 'Username must be at least 2 characters.'));
      return;
    }
    if (suPassword.length < 6) {
      setSuError(t('비밀번호는 6자 이상이어야 합니다.', 'Password must be at least 6 characters.'));
      return;
    }
    setSuLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: suEmail.trim(),
        password: suPassword,
        options: {
          emailRedirectTo: getConfirmRedirectUrl(),
          data: { username: username.trim() },
        },
      });
      if (error) { setSuLoading(false); setSuError(error.message); return; }
      if (!data.user) { setSuLoading(false); setSuError(t('오류가 발생했습니다. 다시 시도해 주세요.', 'Something went wrong. Please try again.')); return; }

      // An existing (already-registered) email returns a user with no identities.
      if (data.user.identities && data.user.identities.length === 0) {
        setSuLoading(false);
        setSuError(t('이미 가입된 이메일입니다. 로그인해 주세요.', 'This email is already registered. Please sign in.'));
        return;
      }

      setSuLoading(false);
      if (data.session) {
        // Email confirmation is disabled in Supabase — signed in immediately.
        // Don't show a "check your email" screen for an email that will never come.
        await supabase.from('profiles').insert({ id: data.user.id, username: username.trim() });
        router.replace('/(tabs)/community');
      } else {
        // Email confirmation required — a verification email is on its way.
        setSentEmail(suEmail.trim());
        setEmailSent(true);
      }
    } catch (err: unknown) {
      setSuLoading(false);
      setSuError(t('오류: ', 'Error: ') + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ── Resend verification email (from the email-sent card) ──────────────────
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (resending || resent) return;
    setResending(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: sentEmail,
        options: { emailRedirectTo: getConfirmRedirectUrl() },
      });
      setResent(true);
      setTimeout(() => setResent(false), 60_000); // allow again after 60s
    } finally {
      setResending(false);
    }
  }

  async function handleSignIn() {
    setSiError('');
    if (!siEmail.trim() || !siPassword) {
      setSiError(t('이메일과 비밀번호를 입력해 주세요.', 'Please enter your email and password.'));
      return;
    }
    setSiLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail.trim(), password: siPassword });
    setSiLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        // Verified-email requirement: point them back to their inbox with a resend path.
        setSentEmail(siEmail.trim());
        setEmailSent(true);
      } else {
        setSiError(t('이메일 또는 비밀번호가 틀렸습니다.', 'Incorrect email or password.'));
      }
    } else {
      router.replace('/(tabs)/community');
    }
  }

  // ── Email-sent confirmation state ─────────────────────────────────────────
  if (emailSent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={styles.card}>
            <Image source={require('../../assets/logo.png')} style={styles.cardLogo} accessibilityLabel="Jurio logo" />
            <Text style={styles.cardIcon}>📬</Text>
            <Text style={styles.cardTitle}>{t('이메일을 확인해 주세요', 'Check your email')}</Text>
            <Text style={styles.cardBody}>
              {t(`${sentEmail} 로 인증 링크를 보냈습니다.\n링크를 클릭하면 계정이 활성화됩니다.`,
                `We sent a confirmation link to\n${sentEmail}\n\nClick it to activate your account.`)}
            </Text>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{t('이메일이 안 보이면 스팸 폴더를 확인하세요.', "Can't find it? Check your spam folder.")}</Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, (resending || resent) && styles.btnDisabled]}
              onPress={handleResend}
              disabled={resending || resent}
              accessibilityRole="button"
            >
              {resending
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnText}>
                    {resent
                      ? t('✓ 다시 보냈습니다', '✓ Email resent')
                      : t('인증 메일 다시 보내기', 'Resend verification email')}
                  </Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setEmailSent(false); switchMode('signin'); }}>
              <Text style={styles.secondaryBtnText}>{t('로그인 화면으로', 'Go to sign in')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEmailSent(false)}>
              <Text style={styles.secondaryBtnText}>{t('다른 이메일로 가입', 'Use a different email')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Auth form ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.brandHeader}>
            <Image source={require('../../assets/logo.png')} style={styles.brandLogo} accessibilityLabel="Jurio logo" />
            <Text style={styles.brandName}>{t('주리오', 'Jurio')}</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                {t('회원가입', 'Sign up')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => switchMode('signin')}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                {t('로그인', 'Sign in')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy note (sign-up only) */}
          {mode === 'signup' && (
            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                {t(
                  '🔒 국적·비자·주민번호는 절대 묻지 않습니다. 신고하지 않습니다.',
                  '🔒 We never ask for your visa, nationality, or ID. We never report you.'
                )}
              </Text>
            </View>
          )}

          {/* ── SIGN UP FORM ── */}
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>{t('닉네임 (커뮤니티에 표시)', 'Username (shown in community)')}</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={v => { setUsername(v); setSuError(''); }}
                placeholder={t('닉네임 입력 (2자 이상)', 'Enter username (min 2 chars)')}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.textCaption}
              />

              <Text style={styles.label}>{t('이메일', 'Email')}</Text>
              <TextInput
                style={styles.input}
                value={suEmail}
                onChangeText={v => { setSuEmail(v); setSuError(''); }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.textCaption}
              />

              <Text style={styles.label}>{t('비밀번호 (6자 이상)', 'Password (min 6 chars)')}</Text>
              <TextInput
                style={styles.input}
                value={suPassword}
                onChangeText={v => { setSuPassword(v); setSuError(''); }}
                placeholder={t('비밀번호 입력', 'Enter password')}
                secureTextEntry
                placeholderTextColor={colors.textCaption}
              />

              {!!suError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {suError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, suLoading && styles.btnDisabled]}
                onPress={handleSignUp}
                disabled={suLoading}
                accessibilityRole="button"
              >
                {suLoading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.btnText}>{t('가입하기', 'Create account')}</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchRow} onPress={() => switchMode('signin')}>
                <Text style={styles.switchText}>{t('이미 계정이 있으신가요? ', 'Already have an account? ')}</Text>
                <Text style={styles.switchLink}>{t('로그인', 'Sign in')}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── SIGN IN FORM ── */}
          {mode === 'signin' && (
            <>
              <Text style={styles.label}>{t('이메일', 'Email')}</Text>
              <TextInput
                style={styles.input}
                value={siEmail}
                onChangeText={v => { setSiEmail(v); setSiError(''); }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={colors.textCaption}
              />

              <Text style={styles.label}>{t('비밀번호', 'Password')}</Text>
              <TextInput
                style={styles.input}
                value={siPassword}
                onChangeText={v => { setSiPassword(v); setSiError(''); }}
                placeholder={t('비밀번호 입력', 'Enter password')}
                secureTextEntry
                placeholderTextColor={colors.textCaption}
              />

              {!!siError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {siError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, siLoading && styles.btnDisabled]}
                onPress={handleSignIn}
                disabled={siLoading}
                accessibilityRole="button"
              >
                {siLoading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.btnText}>{t('로그인', 'Sign in')}</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchRow} onPress={() => switchMode('signup')}>
                <Text style={styles.switchText}>{t('계정이 없으신가요? ', "Don't have an account? ")}</Text>
                <Text style={styles.switchLink}>{t('회원가입', 'Sign up')}</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  centeredContent: { paddingHorizontal: spacing.base, paddingTop: spacing.xxxl },
  backBtn: { marginBottom: spacing.lg },
  backText: { ...typography.bodyM, color: colors.action },

  brandHeader: { alignItems: 'center', marginBottom: spacing.lg },
  brandLogo: { width: 56, height: 56, marginBottom: spacing.xs },
  brandName: { ...typography.headingM, color: colors.brand, fontWeight: '700' },
  cardLogo: { width: 44, height: 44, marginBottom: spacing.sm },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: { backgroundColor: colors.action },
  tabText: { ...typography.bodyM, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.white },

  // Privacy
  privacyNote: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  privacyText: { ...typography.bodyS, color: colors.text, lineHeight: 20 },

  // Form
  label: { ...typography.bodyS, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.bodyM,
    // lineHeight inside TextInput clips character bottoms on iOS
    lineHeight: undefined,
    color: colors.text,
    marginBottom: spacing.base,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: { ...typography.bodyS, color: '#B91C1C', lineHeight: 20 },
  btn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.action,
    marginTop: spacing.sm,
  },
  secondaryBtnText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  switchText: { ...typography.bodyS, color: colors.textSecondary },
  switchLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },

  // Email sent card
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#0B1D3A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { fontSize: 48, marginBottom: spacing.base },
  cardTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  cardBody: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  noteBox: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  noteText: { ...typography.bodyS, color: colors.textSecondary, textAlign: 'center' },
});
