import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius } from '../../constants/theme';

type Status = 'loading' | 'confirmed' | 'already_signed_in' | 'error';

export default function ConfirmScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const [status, setStatus] = useState<Status>('loading');

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useEffect(() => {
    // Give Supabase a moment to process the URL hash (detectSessionInUrl: true on web)
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Ensure the user has a profile. If not (confirmation was required and
        // profile wasn't created at sign-up time), create it now from metadata.
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          const username =
            (session.user.user_metadata?.username as string | undefined) ??
            session.user.email?.split('@')[0] ??
            'user';
          await supabase
            .from('profiles')
            .insert({ id: session.user.id, username });
        }

        setStatus('confirmed');
      } else {
        // No session yet — the link might have been opened in a different browser
        // or the token has expired. Show a friendly error with a sign-in link.
        setStatus('error');
      }
    }, 800);

    // Also listen for the auth state change event fired when Supabase processes
    // the URL hash (happens on first render on web).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        clearTimeout(timer);

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          const username =
            (session.user.user_metadata?.username as string | undefined) ??
            session.user.email?.split('@')[0] ??
            'user';
          await supabase
            .from('profiles')
            .insert({ id: session.user.id, username });
        }

        setStatus('confirmed');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.action} size="large" />
          <Text style={styles.loadingText}>{t('확인 중…', 'Verifying…')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>{t('링크가 만료됐거나 유효하지 않아요', 'Link expired or invalid')}</Text>
            <Text style={styles.body}>
              {t(
                '인증 링크가 만료됐거나 이미 사용됐습니다. 로그인 화면에서 다시 시도해 보세요.',
                'The confirmation link has expired or already been used. Please sign in or request a new link.'
              )}
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/sign-in')} accessibilityRole="button">
              <Text style={styles.btnText}>{t('로그인하기', 'Sign in')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(auth)/sign-up')} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t('새 계정 만들기', 'Create new account')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // confirmed or already_signed_in
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Image source={require('../../assets/logo.png')} style={styles.cardLogo} accessibilityLabel="Jurio logo" />
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.title}>{t('이메일 인증 완료!', 'Email confirmed!')}</Text>
          <Text style={styles.body}>
            {t(
              '계정이 활성화됐습니다. 주리오에 오신 것을 환영합니다!',
              'Your account is ready. Welcome to Jurio 주리오!'
            )}
          </Text>
          <View style={styles.trustNote}>
            <Text style={styles.trustText}>
              {t(
                '🔒 신분·비자·주민번호를 묻지 않습니다. 신고하지 않습니다.',
                '🔒 We never ask for your ID or visa. We never report you.'
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.replace('/(tabs)/community')}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>{t('커뮤니티 둘러보기 →', 'Explore community →')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)/')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryBtnText}>{t('홈으로', 'Go to Home')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.base },
  loadingText: { ...typography.bodyM, color: colors.textSecondary },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.xxxl },
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
  cardLogo: { width: 44, height: 44, marginBottom: spacing.sm },
  icon: { fontSize: 56, marginBottom: spacing.base },
  title: { ...typography.headingM, color: colors.text, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  body: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  trustNote: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  trustText: { ...typography.bodyS, color: colors.text, lineHeight: 20 },
  btn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    padding: spacing.base,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  btnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.base,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.action,
  },
  secondaryBtnText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
});
