import { useEffect, useRef, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView,
  Platform, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { colors, typography, spacing, radius, shadow } from '../../../constants/theme';

type Post = {
  id: string; community_id: string; title: string; body: string;
  is_anonymous: boolean; like_count: number; comment_count: number;
  created_at: string; author_id: string;
  profiles: { username: string } | null;
};

type Comment = {
  id: string; post_id: string; author_id: string; body: string;
  is_anonymous: boolean; created_at: string;
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

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useEffect(() => { load(); }, [postId]);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('posts').select('*, profiles(username)').eq('id', postId).single(),
      supabase.from('comments').select('*, profiles(username)').eq('post_id', postId).order('created_at'),
    ]);
    setPost(p as Post | null);
    setComments((c ?? []) as Comment[]);

    if (user && p) {
      const { data: like } = await supabase
        .from('post_likes').select('user_id').eq('post_id', postId).eq('user_id', user.id).single();
      setLiked(!!like);
    }
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleLike() {
    if (!user || !post) { router.push('/(auth)/sign-in' as any); return; }
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.from('posts').update({ like_count: Math.max(0, post.like_count - 1) }).eq('id', postId);
      setPost(p => p ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      await supabase.from('posts').update({ like_count: post.like_count + 1 }).eq('id', postId);
      setPost(p => p ? { ...p, like_count: p.like_count + 1 } : p);
    }
    setLiked(!liked);
  }

  async function handleComment() {
    if (!user || !post) { router.push('/(auth)/sign-in' as any); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    const { data: newComment } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      body: commentText.trim(),
      is_anonymous: anonymous,
    }).select('*, profiles(username)').single();

    if (newComment) {
      await supabase.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', postId);
      setComments(prev => [...prev, newComment as Comment]);
      setPost(p => p ? { ...p, comment_count: p.comment_count + 1 } : p);
      setCommentText('');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={colors.action} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('게시글을 찾을 수 없습니다.', 'Post not found.')}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const authorName = post.is_anonymous ? t('익명', 'Anonymous') : (post.profiles?.username ?? t('알 수 없음', 'Unknown'));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          {/* Post */}
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.postAuthor}>{authorName}</Text>
              <Text style={styles.postTime}>{timeAgo(post.created_at, lang)}</Text>
            </View>
            <Text style={styles.postBody}>{post.body}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={[styles.likeBtn, liked && styles.likeBtnActive]} onPress={handleLike}>
                <Text style={[styles.likeBtnText, liked && styles.likeBtnActiveText]}>
                  ❤️ {post.like_count} {t('공감', 'Like')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.commentCount}>💬 {post.comment_count} {t('댓글', 'comments')}</Text>
            </View>
          </View>

          {/* Comments */}
          <Text style={styles.commentSectionTitle}>{t('댓글', 'Comments')} {comments.length}</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>{t('아직 댓글이 없습니다.', 'No comments yet.')}</Text>
          ) : (
            <View style={styles.commentList}>
              {comments.map(c => (
                <View key={c.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {c.is_anonymous ? t('익명', 'Anonymous') : (c.profiles?.username ?? t('알 수 없음', 'Unknown'))}
                    </Text>
                    <Text style={styles.commentTime}>{timeAgo(c.created_at, lang)}</Text>
                  </View>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Comment input */}
          {user ? (
            <View style={styles.commentInput}>
              <View style={styles.anonRow}>
                <TouchableOpacity style={styles.anonToggle} onPress={() => setAnonymous(!anonymous)}>
                  <View style={[styles.checkbox, anonymous && styles.checkboxChecked]}>
                    {anonymous && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.anonLabel}>{t('익명으로 댓글', 'Comment anonymously')}</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder={t('댓글을 입력하세요...', 'Write a comment...')}
                placeholderTextColor={colors.textCaption}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.submitBtn, (!commentText.trim() || submitting) && styles.submitBtnDisabled]}
                onPress={handleComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={styles.submitBtnText}>{t('댓글 달기', 'Post comment')}</Text>
                }
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>{t('로그인하면 댓글을 달 수 있어요.', 'Sign in to comment.')}</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
                <Text style={styles.signInLink}>{t('로그인 →', 'Sign in →')}</Text>
              </TouchableOpacity>
            </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { ...typography.bodyM, color: colors.text, marginBottom: spacing.base },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },
  postCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, ...shadow.card },
  postTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  postMeta: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  postAuthor: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  postTime: { ...typography.bodyS, color: colors.textCaption },
  postBody: { ...typography.bodyM, color: colors.text, lineHeight: 26, marginBottom: spacing.base },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  likeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceTint, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  likeBtnActive: { backgroundColor: '#FEE2E2' },
  likeBtnText: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '600' },
  likeBtnActiveText: { color: '#DC2626' },
  commentCount: { ...typography.bodyS, color: colors.textCaption },
  commentSectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  noComments: { ...typography.bodyS, color: colors.textCaption, marginBottom: spacing.base },
  commentList: { gap: spacing.sm, marginBottom: spacing.base },
  commentCard: { backgroundColor: colors.white, borderRadius: radius.sm, padding: spacing.md, ...shadow.card },
  commentHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  commentAuthor: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  commentTime: { ...typography.caption, color: colors.textCaption },
  commentBody: { ...typography.bodyS, color: colors.text, lineHeight: 20 },
  commentInput: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, ...shadow.card, marginBottom: spacing.base },
  anonRow: { marginBottom: spacing.sm },
  anonToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.action, borderColor: colors.action },
  checkmark: { color: colors.white, fontSize: 11, fontWeight: '700' },
  anonLabel: { ...typography.bodyS, color: colors.textSecondary },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.bodyM,
    color: colors.text,
    minHeight: 80,
    marginBottom: spacing.sm,
    textAlignVertical: 'top',
  },
  submitBtn: { backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  signInPrompt: { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.base },
  signInText: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.xs },
  signInLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
