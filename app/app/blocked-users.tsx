import { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { getBlockedIds, unblockUser } from '../lib/moderation';

type BlockedProfile = { id: string; username: string };

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const t = (ko: string, en: string) => (lang === 'ko' ? ko : en);

  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<BlockedProfile[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const ids = [...(await getBlockedIds())];
    if (ids.length === 0) {
      setBlocked([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('id, username').in('id', ids);
    const byId = Object.fromEntries((data ?? []).map((p: any) => [p.id, p.username]));
    // Keep entries even if the profile no longer exists (deleted account)
    setBlocked(ids.map(id => ({ id, username: byId[id] ?? t('알 수 없는 사용자', 'Unknown user') })));
    setLoading(false);
  }

  async function handleUnblock(id: string) {
    await unblockUser(id);
    setBlocked(prev => prev.filter(b => b.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('차단한 사용자', 'Blocked users')}</Text>
        <Text style={styles.subtitle}>
          {t(
            '차단한 사용자의 글과 댓글은 나에게 보이지 않습니다. 차단 목록은 이 기기에만 저장됩니다.',
            'Posts and comments from blocked users are hidden from you. The block list is stored only on this device.'
          )}
        </Text>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={colors.action} /></View>
        ) : blocked.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🙌</Text>
            <Text style={styles.emptyText}>{t('차단한 사용자가 없습니다.', 'You haven\'t blocked anyone.')}</Text>
          </View>
        ) : (
          blocked.map(b => (
            <View key={b.id} style={styles.row}>
              <Text style={styles.username}>{b.username}</Text>
              <TouchableOpacity
                style={styles.unblockBtn}
                onPress={() => handleUnblock(b.id)}
                accessibilityRole="button"
              >
                <Text style={styles.unblockText}>{t('차단 해제', 'Unblock')}</Text>
              </TouchableOpacity>
            </View>
          ))
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
  subtitle: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  center: { paddingVertical: spacing.xl, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyText: { ...typography.bodyM, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  username: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  unblockBtn: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  unblockText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
