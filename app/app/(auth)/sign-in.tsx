import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert(t('입력 오류', 'Missing fields'), t('이메일과 비밀번호를 입력하세요.', 'Please enter your email and password.'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert(t('로그인 실패', 'Sign in failed'), t('이메일 또는 비밀번호가 틀렸습니다.', 'Incorrect email or password.'));
    } else {
      router.replace('/(tabs)/community');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('로그인', 'Sign in')}</Text>
          <Text style={styles.subtitle}>{t('주리오 계정으로 로그인하세요.', 'Sign in to your Jurio account.')}</Text>

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

          <Text style={styles.label}>{t('비밀번호', 'Password')}</Text>
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
            onPress={handleSignIn}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>{t('로그인', 'Sign in')}</Text>
            }
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{t('계정이 없으신가요?', "Don't have an account?")}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
              <Text style={styles.switchLink}>{t('회원가입', 'Sign up')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.lg },
  backText: { ...typography.bodyM, color: colors.action },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.xl },
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
