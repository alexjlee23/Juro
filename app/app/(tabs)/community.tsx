import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';

type Community = {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  description_ko: string;
  description_en: string;
  emoji: string;
  category: string;
  member_count: number;
  post_count: number;
};

const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  type: { ko: '👤 근로자 유형', en: '👤 Worker type' },
  region: { ko: '📍 지역별', en: '📍 By region' },
  industry: { ko: '🏭 업종별', en: '🏭 By industry' },
  situation: { ko: '⚠️ 상황별', en: '⚠️ By situation' },
  general: { ko: '💬 자유', en: '💬 General' },
};

const CATEGORY_ORDER = ['type', 'region', 'industry', 'situation', 'general'];

export default function CommunityScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const { user, profile, signOut } = useAuth();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useEffect(() => { load(); }, [user]);

  // Refresh membership state and counts whenever this tab comes back into focus
  useFocusEffect(useCallback(() => { load(); }, [user]));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('communities').select('*').order('category').order('name_ko');
    setCommunities(data ?? []);
    if (user) {
      const { data: memberships } = await supabase
        .from('community_memberships')
        .select('community_id')
        .eq('user_id', user.id);
      setJoinedIds(new Set(memberships?.map((m: any) => m.community_id) ?? []));
    } else {
      setJoinedIds(new Set());
    }
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const grouped = communities.reduce<Record<string, Community[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.action} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('커뮤니티', 'Community')}</Text>
            <Text style={styles.subtitle}>{t('비슷한 처지의 노동자들과 이야기하세요', 'Talk with workers like you')}</Text>
          </View>
          {user && (
            <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>{t('로그아웃', 'Sign out')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Auth banner */}
        {user ? (
          <View style={styles.userBanner}>
            <Text style={styles.userBannerText}>
              👋 {profile?.username ?? ''} {t('님, 환영합니다!', ', welcome!')}
            </Text>
          </View>
        ) : (
          <View style={styles.authPrompt}>
            <Text style={styles.authPromptTitle}>{t('가입하면 글을 쓸 수 있어요', 'Join to post and comment')}</Text>
            <Text style={styles.authPromptBody}>
              {t('읽기는 누구나 가능합니다. 글쓰기·참여는 무료 계정이 필요합니다.', 'Anyone can read. Posting requires a free account.')}
            </Text>
            <View style={styles.authBtns}>
              <TouchableOpacity style={styles.authBtnPrimary} onPress={() => router.push('/(auth)/sign-up' as any)}>
                <Text style={styles.authBtnPrimaryText}>{t('무료 회원가입', 'Sign up free')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authBtnSecondary} onPress={() => router.push('/(auth)/sign-in' as any)}>
                <Text style={styles.authBtnSecondaryText}>{t('로그인', 'Sign in')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Joined communities */}
        {user && joinedIds.size > 0 && (
          <>
            <Text style={styles.sectionLabel}>{t('✅ 참여 중인 커뮤니티', '✅ My communities')}</Text>
            <View style={styles.list}>
              {communities
                .filter(c => joinedIds.has(c.id))
                .map(c => (
                  <CommunityCard key={c.id} community={c} lang={lang} joined
                    onPress={() => router.push(`/community/${c.id}` as any)} />
                ))}
            </View>
          </>
        )}

        {/* All communities by category */}
        {CATEGORY_ORDER.map(cat => {
          const list = grouped[cat];
          if (!list?.length) return null;
          return (
            <View key={cat}>
              <Text style={styles.sectionLabel}>{CATEGORY_LABELS[cat]?.[lang] ?? cat}</Text>
              <View style={styles.list}>
                {list.map(c => (
                  <CommunityCard key={c.id} community={c} lang={lang} joined={joinedIds.has(c.id)}
                    onPress={() => router.push(`/community/${c.id}` as any)} />
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {t(
              '커뮤니티 글은 노동자 간 정보 공유이며, 법률 자문이 아닙니다. 법적 판단은 노무사와 상담하세요.',
              'Community posts are peer information sharing, not legal advice. Consult a 노무사 for legal decisions.'
            )}
          </Text>
        </View>
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CommunityCard({
  community, lang, joined, onPress,
}: { community: Community; lang: 'ko' | 'en'; joined: boolean; onPress: () => void }) {
  const name = lang === 'ko' ? community.name_ko : community.name_en;
  const desc = lang === 'ko' ? community.description_ko : community.description_en;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
      <Text style={styles.cardEmoji}>{community.emoji}</Text>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{name}</Text>
          {joined && <Text style={styles.joinedBadge}>{lang === 'ko' ? '참여 중' : 'Joined'}</Text>}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{desc}</Text>
        <Text style={styles.cardMeta}>
          {'👥 '}{community.member_count.toLocaleString()}{lang === 'ko' ? '명' : ' members'}
          {'  ·  '}{'📝 '}{community.post_count.toLocaleString()}{lang === 'ko' ? '개' : ' posts'}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.base },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700' },
  subtitle: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  logoutBtn: { paddingTop: 4 },
  logoutText: { ...typography.bodyS, color: colors.textCaption },
  userBanner: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.base },
  userBannerText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  authPrompt: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, ...shadow.card, borderLeftWidth: 3, borderLeftColor: colors.brand },
  authPromptTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  authPromptBody: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.md },
  authBtns: { flexDirection: 'row', gap: spacing.sm },
  authBtnPrimary: { backgroundColor: colors.action, borderRadius: radius.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  authBtnPrimaryText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  authBtnSecondary: { backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderWidth: 1.5, borderColor: colors.action },
  authBtnSecondaryText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  sectionLabel: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, ...shadow.card },
  cardEmoji: { fontSize: 28, marginRight: spacing.md },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  cardName: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  joinedBadge: { ...typography.caption, color: colors.action, backgroundColor: colors.selectedBg, borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 1, fontWeight: '600' },
  cardDesc: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption, color: colors.textCaption },
  arrow: { ...typography.headingM, color: colors.textCaption, marginLeft: spacing.sm },
  disclaimer: { backgroundColor: colors.surfaceTint, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.lg },
  disclaimerText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
