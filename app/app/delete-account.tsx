import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DeleteAccountScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const { user, signOut } = useAuth();
  const [step, setStep] = useState<'confirm' | 'deleting' | 'done'>('confirm');

  const DELETED_DATA = lang === 'ko'
    ? ['프로필 및 사용자 이름', '게시글 및 댓글', '커뮤니티 멤버십', '좋아요', '기기 내 근무 일지']
    : ['Profile and username', 'Posts and comments', 'Community memberships', 'Likes', 'On-device work logbook'];

  async function handleDelete() {
    if (!user) {
      // Not logged in — direct to email
      Linking.openURL('mailto:privacy@jurio.app?subject=Account%20Deletion%20Request');
      return;
    }
    setStep('deleting');
    try {
      await supabase.from('post_likes').delete().eq('user_id', user.id);
      await supabase.from('comments').delete().eq('author_id', user.id);
      await supabase.from('posts').delete().eq('author_id', user.id);
      await supabase.from('community_memberships').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      await AsyncStorage.removeItem('juro_logbook_v1');
      await signOut();
      setStep('done');
    } catch {
      setStep('confirm');
    }
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneBox}>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.doneTitle}>{lang === 'ko' ? '계정이 삭제되었습니다' : 'Account deleted'}</Text>
          <Text style={styles.doneSub}>
            {lang === 'ko'
              ? '모든 데이터가 삭제되었습니다. 이용해 주셔서 감사합니다.'
              : 'All your data has been removed. Thank you for using Jurio.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {lang === 'ko' ? '계정 삭제' : 'Delete Account'}
        </Text>
        <Text style={styles.subtitle}>
          {lang === 'ko'
            ? '아래 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'
            : 'The following data will be permanently deleted. This cannot be undone.'}
        </Text>

        <View style={styles.dataBox}>
          {DELETED_DATA.map((item, i) => (
            <Text key={i} style={styles.dataItem}>🗑️ {item}</Text>
          ))}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            {lang === 'ko'
              ? '앱에 로그인되어 있지 않은 경우, privacy@jurio.app으로 이메일을 보내시면 48시간 이내에 처리됩니다.'
              : 'If you are not logged into the app, email privacy@jurio.app and we will process your request within 48 hours.'}
          </Text>
        </View>

        {!user && (
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL('mailto:privacy@jurio.app?subject=Account%20Deletion%20Request')}
          >
            <Text style={styles.emailBtnText}>
              ✉️ {lang === 'ko' ? 'privacy@jurio.app 으로 요청' : 'Request via privacy@jurio.app'}
            </Text>
          </TouchableOpacity>
        )}

        {user && (
          <TouchableOpacity
            style={[styles.deleteBtn, step === 'deleting' && styles.deleteBtnDisabled]}
            onPress={handleDelete}
            disabled={step === 'deleting'}
          >
            <Text style={styles.deleteBtnText}>
              {step === 'deleting'
                ? (lang === 'ko' ? '삭제 중...' : 'Deleting...')
                : (lang === 'ko' ? '내 계정 영구 삭제' : 'Permanently delete my account')}
            </Text>
          </TouchableOpacity>
        )}

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
  dataBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  dataItem: { ...typography.bodyM, color: colors.text, marginBottom: spacing.sm },
  noteBox: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  noteText: { ...typography.bodyS, color: colors.action, lineHeight: 20 },
  emailBtn: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  emailBtnText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: '#DC2626',
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
  },
  deleteBtnDisabled: { backgroundColor: '#FCA5A5' },
  deleteBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  doneEmoji: { fontSize: 56, marginBottom: spacing.base },
  doneTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  doneSub: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
