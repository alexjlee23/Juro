import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  const getConfirmRedirectUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/auth/confirm`;
    }
    return 'https://juro-gamma.vercel.app/auth/confirm';
  };

  async function handleSignUp() {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert(t('입력 오류', 'Missing fields'), t('모든 항목을 입력하세요.', 'Please fill in all fields.'));
      return;
    }
    if (username.trim().length < 2) {
      Alert.alert(t('닉네임 오류', 'Username error'), t('닉네임은 2자 이상이어야 합니다.', 'Username must be at least 2 characters.'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('비밀번호 오류', 'Password error'), t('비밀번호는 6자 이상이어야 합니다.', 'Password must be at least 6 characters.'));
      return;
    }

    setLoading(true);

    // Check if username is taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .single();

    if (existing) {
      setLoading(false);
      Alert.alert(t('닉네임 중복', 'Username taken'), t('이미 사용 중인 닉네임입니다.', 'That username is already taken.'));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getConfirmRedirectUrl(),
        data: { username: username.trim() },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      Alert.alert(t('가입 실패', 'Sign up failed'), error?.message ?? t('오류가 발생했습니다.', 'An error occurred.'));
      return;
    }

    // Try to create profile now (succeeds when email confirmation is disabled
    // and a session is returned immediately; silently skipped otherwise —
    // the confirm page will create it after the user verifies their email).
    if (data.session) {
      await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: username.trim() })
        .select()
        .single();
    }

    setLoading(false);
    setSentEmail(email.trim());
    setEmailSent(true);
  }

  // ── "Check your email" state ──────────────────────────────────────────────
  if (emailSent) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emailSentCard}>
            <Text style={styles.emailSentIcon}>📬</Text>
            <Text style={styles.emailSentTitle}>
              {t('이메일을 확인해 주세요', 'Check your email')}
            </Text>
            <Text style={styles.emailSentBody}>
              {t(
                `${sentEmail} 로 인증 링크를 보냈습니다.\n링크를 클릭하면 계정이 활성화됩니다.`,
                `We sent a confirmation link to\n${sentEmail}\n\nClick the link in that email to activate your account.`
              )}
            </Text>
            <View style={styles.emailSentNote}>
              <Text style={styles.emailSentNoteText}>
                {t(
                  '이메일이 안 보이면 스팸 폴더를 확인하세요.',
                  "Can't find it? Check your spam folder."
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace('/(auth)/sign-in')}
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>{t('로그인 화면으로', 'Go to sign in')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => setEmailSent(false)}
              accessibilityRole="button"
            >
              <Text style={styles.resendText}>{t('이메일 다시 입력', 'Use a different email')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Sign-up form ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('회원가입', 'Create account')}</Text>
          <Text style={styles.subtitle}>{t('계정을 만들면 커뮤니티에 참여할 수 있습니다.', 'Create an account to join communities.')}</Text>

          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              {t(
                '🔒 국적·비자·주민번호는 절대 묻지 않습니다. 신고하지 않습니다.',
                '🔒 We never ask for your visa, nationality, or ID. We never report you.'
              )}
            </Text>
          </View>

          <Text style={styles.label}>{t('닉네임 (커뮤니티에 표시)', 'Username (shown in community)')}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={t('닉네임 입력 (2자 이상)', 'Enter username (min 2 chars)')}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textCaption}
          />

          <Text style={styles.label}>{t('이메일', 'Email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textCaption}
          />

          <Text style={styles.label}>{t('비밀번호 (6자 이상)', 'Password (min 6 characters)')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t('비밀번호 입력', 'Enter password')}
            secureTextEntry
            placeholderTextColor={colors.textCaption}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>{t('가입하기', 'Create account')}</Text>
            }
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('이미 계정이 있으신가요?', 'Already have an account?')}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
              <Text style={styles.switchLink}>{t('로그인', 'Sign in')}</Text>
            </TouchableOpacity>
          </View>
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
  // Email-sent state
  emailSentCard: {
    marginTop: spacing.xxxl,
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
  emailSentIcon: { fontSize: 48, marginBottom: spacing.base },
  emailSentTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  emailSentBody: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  emailSentNote: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  emailSentNoteText: { ...typography.bodyS, color: colors.textSecondary, textAlign: 'center' },
  resendBtn: { marginTop: spacing.md, paddingVertical: spacing.sm },
  resendText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  backBtn: { marginBottom: spacing.lg },
  backText: { ...typography.bodyM, color: colors.action },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.base },
  privacyNote: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  privacyText: { ...typography.bodyS, color: colors.text, lineHeight: 20 },
  label: { ...typography.bodyS, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...typography.bodyM,
    color: colors.text,
    marginBottom: spacing.base,
  },
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
  switchRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' },
  switchText: { ...typography.bodyS, color: colors.textSecondary },
  switchLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
