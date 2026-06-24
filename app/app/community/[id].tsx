import { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';

type Community = {
  id: string; name_ko: string; name_en: string;
  description_ko: string; description_en: string;
  emoji: string; member_count: number; post_count: number;
};

type Post = {
  id: string; title: string; body: string;
  is_anonymous: boolean; like_count: number; comment_count: number;
  created_at: string; author_id: string;
  profiles: { username: string } | null;
};

function timeAgo(dateStr: string, lang: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (lang === 'ko') {
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    if (h < 24) return `${h}시간 전`;
    return `${d}일 전`;
  }
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function CommunityBoardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postsError, setPostsError] = useState(false);

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useEffect(() => { load(); }, [id, user]);

  async function load() {
    setLoading(true);
    setPostsError(false);

    const [{ data: comm }, { data: postData, error: postErr }] = await Promise.all([
      supabase.from('communities').select('*').eq('id', id).single(),
      supabase.from('posts')
        .select('*, profiles(username)')
        .eq('community_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    setCommunity(comm ?? null);
    if (postErr) {
      setPostsError(true);
      setPosts([]);
    } else {
      setPosts((postData ?? []) as Post[]);
    }

    if (user) {
      const { data: mem } = await supabase
        .from('community_memberships')
        .select('user_id')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();
      setIsJoined(!!mem);
    }
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleJoinLeave() {
    if (!user) {
      router.push('/(auth)/sign-up' as any);
      return;
    }
    setJoining(true);
    if (isJoined) {
      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', id)
        .eq('user_id', user.id);
      if (error) {
        Alert.alert(
          t('오류', 'Error'),
          t('커뮤니티를 나가지 못했습니다. 다시 시도해 주세요.', 'Could not leave community. Please try again.')
        );
      } else {
        setIsJoined(false);
      }
    } else {
      const { error } = await supabase
        .from('community_memberships')
        .insert({ community_id: id, user_id: user.id });
      if (error) {
        Alert.alert(
          t('참여 실패', 'Join failed'),
          t('커뮤니티 참여에 실패했습니다. 로그인 상태를 확인해 주세요.', 'Could not join community. Please check you are signed in and try again.')
        );
      } else {
        setIsJoined(true);
        // Silently re-fetch posts — they may be gated by membership in the DB
        const { data: newPosts, error: postErr } = await supabase
          .from('posts')
          .select('*, profiles(username)')
          .eq('community_id', id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!postErr) {
          setPostsError(false);
          setPosts((newPosts ?? []) as Post[]);
        }
      }
    }
    setJoining(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={colors.action} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!community) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('커뮤니티를 찾을 수 없습니다.', 'Community not found.')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnCenter}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = lang === 'ko' ? community.name_ko : community.name_en;
  const desc = lang === 'ko' ? community.description_ko : community.description_en;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('커뮤니티', 'Community')}</Text>
        </TouchableOpacity>

        {/* Community header */}
        <View style={styles.commHeader}>
          <Text style={styles.commEmoji}>{community.emoji}</Text>
          <View style={styles.commInfo}>
            <Text style={styles.commName}>{name}</Text>
            <Text style={styles.commDesc}>{desc}</Text>
            <Text style={styles.commMeta}>
              👥 {community.member_count.toLocaleString()}{t('명', ' members')}
              {'  ·  '}
              📝 {community.post_count.toLocaleString()}{t('개 게시글', ' posts')}
            </Text>
          </View>
        </View>

        {/* Join/Leave + Write */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.joinBtn, isJoined && styles.joinBtnLeave]}
            onPress={handleJoinLeave}
            disabled={joining}
            accessibilityRole="button"
          >
            {joining
              ? <ActivityIndicator color={isJoined ? colors.action : colors.white} size="small" />
              : <Text style={[styles.joinBtnText, isJoined && styles.joinBtnLeaveText]}>
                  {isJoined ? t('커뮤니티 떠나기', 'Leave') : t('커뮤니티 참여하기', 'Join community')}
                </Text>
            }
          </TouchableOpacity>
          {user && isJoined && (
            <TouchableOpacity
              style={styles.writeBtn}
              onPress={() => router.push(`/community/new-post?communityId=${id}` as any)}
              accessibilityRole="button"
            >
              <Text style={styles.writeBtnText}>✏️ {t('글 쓰기', 'Write post')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Posts */}
        {postsError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>{t('게시글을 불러오지 못했습니다.', 'Could not load posts.')}</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.emptyJoinBtn}>
              <Text style={styles.emptyJoinText}>{t('다시 시도 →', 'Retry →')}</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              {!user
                ? t('게시글을 보려면 로그인 후 커뮤니티에 참여하세요.', 'Sign in and join this community to see posts.')
                : !isJoined
                ? t('커뮤니티에 참여하면 게시글을 볼 수 있습니다.', 'Join this community to see posts.')
                : t('아직 게시글이 없습니다. 첫 번째 글을 써보세요!', 'No posts yet. Be the first to write!')}
            </Text>
            {user && !isJoined && (
              <TouchableOpacity onPress={handleJoinLeave} style={styles.emptyJoinBtn}>
                <Text style={styles.emptyJoinText}>{t('참여하고 글 보기 →', 'Join to see posts →')}</Text>
              </TouchableOpacity>
            )}
            {!user && (
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)} style={styles.emptyJoinBtn}>
                <Text style={styles.emptyJoinText}>{t('로그인 →', 'Sign in →')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.postList}>
            {posts.map(post => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => router.push(`/community/post/${post.id}` as any)}
                activeOpacity={0.75}
                accessibilityRole="button"
              >
                <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.postBody} numberOfLines={2}>{post.body}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postAuthor}>
                    {post.is_anonymous ? t('익명', 'Anonymous') : (post.profiles?.username ?? t('알 수 없음', 'Unknown'))}
                  </Text>
                  <Text style={styles.postTime}>{timeAgo(post.created_at, lang)}</Text>
                  <Text style={styles.postStats}>❤️ {post.like_count}  💬 {post.comment_count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!user && (
          <View style={styles.signInPrompt}>
            <Text style={styles.signInPromptText}>
              {t('로그인하면 글을 쓰고 댓글을 달 수 있어요.', 'Sign in to post and comment.')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
              <Text style={styles.signInLink}>{t('로그인 →', 'Sign in →')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { ...typography.bodyM, color: colors.text, marginBottom: spacing.base },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.base },
  backBtnCenter: { marginTop: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },
  commHeader: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, ...shadow.card },
  commEmoji: { fontSize: 36, marginRight: spacing.md, marginTop: 4 },
  commInfo: { flex: 1 },
  commName: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  commDesc: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.xs },
  commMeta: { ...typography.caption, color: colors.textCaption },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  joinBtn: { flex: 1, backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  joinBtnLeave: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.action },
  joinBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  joinBtnLeaveText: { color: colors.action },
  writeBtn: { flex: 1, backgroundColor: colors.selectedBg, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  writeBtnText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.base },
  emptyText: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.base },
  emptyJoinBtn: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  emptyJoinText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  postList: { gap: spacing.sm },
  postCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, ...shadow.card },
  postTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  postBody: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postAuthor: { ...typography.caption, color: colors.action, fontWeight: '600' },
  postTime: { ...typography.caption, color: colors.textCaption, flex: 1 },
  postStats: { ...typography.caption, color: colors.textCaption },
  signInPrompt: { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.lg, alignItems: 'center' },
  signInPromptText: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.xs },
  signInLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
