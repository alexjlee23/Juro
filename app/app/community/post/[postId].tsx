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
import ReportModal from '../../../components/ui/ReportModal';
import { checkContent, getBlockedIds, blockUser } from '../../../lib/moderation';

type Post = {
  id: string; community_id: string; title: string; body: string;
  is_anonymous: boolean; like_count: number; comment_count: number;
  created_at: string; author_id: string;
  profiles: { username: string } | null;
};

type Comment = {
  id: string; post_id: string; author_id: string; body: string;
  is_anonymous: boolean; created_at: string;
  parent_comment_id: string | null;
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
  const commentInputRef = useRef<TextInput>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useEffect(() => { load(); getBlockedIds().then(setBlockedIds); }, [postId]);

  async function handleBlock(userId: string) {
    await blockUser(userId);
    setBlockedIds(await getBlockedIds());
  }

  async function load() {
    setLoading(true);

    // Use separate profile lookup (same pattern as community board) because the
    // PostgREST join syntax profiles(username) may be blocked by RLS on this schema.
    const [{ data: rawPost }, { data: rawComments }] = await Promise.all([
      supabase.from('posts').select('*').eq('id', postId).single(),
      supabase.from('comments').select('*').eq('post_id', postId).order('created_at'),
    ]);

    if (rawPost) {
      const authorIds = new Set<string>([rawPost.author_id]);
      (rawComments ?? []).forEach((c: any) => authorIds.add(c.author_id));
      const { data: profileData } = await supabase
        .from('profiles').select('id, username').in('id', [...authorIds]);
      const profileMap = Object.fromEntries(
        (profileData ?? []).map((p: any) => [p.id, { username: p.username }])
      );

      setPost({ ...rawPost, profiles: profileMap[rawPost.author_id] ?? null } as Post);
      setComments(
        (rawComments ?? []).map((c: any) => ({
          ...c,
          profiles: profileMap[c.author_id] ?? null,
        })) as Comment[]
      );

      if (user) {
        const { data: like } = await supabase
          .from('post_likes').select('user_id')
          .eq('post_id', postId).eq('user_id', user.id).single();
        setLiked(!!like);
      }
    } else {
      setPost(null);
      setComments([]);
    }
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleLike() {
    if (!user || !post) { router.push('/(auth)/sign-up' as any); return; }
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

  function startReply(comment: Comment) {
    const username = comment.is_anonymous
      ? t('익명', 'Anonymous')
      : (comment.profiles?.username ?? t('알 수 없음', 'Unknown'));
    // Thread one level deep: replies to a reply attach to the top-level comment
    const parentId = comment.parent_comment_id ?? comment.id;
    setReplyTo({ id: parentId, username });
    setTimeout(() => {
      commentInputRef.current?.focus();
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  async function handleComment() {
    if (!user || !post) { router.push('/(auth)/sign-up' as any); return; }
    if (!commentText.trim()) return;

    // Content filter (store compliance — objectionable content check before publish)
    const violation = checkContent(commentText, lang);
    if (violation) { setContentError(violation); return; }
    setContentError(null);
    setSubmitting(true);

    const { data: newComment } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      body: commentText.trim(),
      is_anonymous: anonymous,
      parent_comment_id: replyTo?.id ?? null,
    }).select('*').single();

    if (newComment) {
      const { data: authorProfile } = await supabase
        .from('profiles').select('id, username').eq('id', user.id).single();
      await supabase.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', postId);
      setComments(prev => [...prev, { ...newComment, profiles: authorProfile ?? null } as Comment]);
      setPost(p => p ? { ...p, comment_count: p.comment_count + 1 } : p);
      setCommentText('');
      setReplyTo(null);
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

  const authorName = post.is_anonymous
    ? t('익명', 'Anonymous')
    : (post.profiles?.username ?? t('알 수 없음', 'Unknown'));

  // Separate top-level comments from replies for threaded display.
  // Comments from blocked users are hidden entirely.
  const visibleComments = comments.filter(c => !blockedIds.has(c.author_id));
  const topLevel = visibleComments.filter(c => !c.parent_comment_id);
  const repliesFor = (id: string) => visibleComments.filter(c => c.parent_comment_id === id);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          {/* ── Post ── */}
          {blockedIds.has(post.author_id) ? (
            <View style={styles.postCard}>
              <Text style={styles.blockedText}>
                🚫 {t('차단한 사용자의 게시글입니다.', 'Post from a user you blocked.')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/blocked-users' as any)}>
                <Text style={styles.blockedManageLink}>{t('차단 관리 →', 'Manage blocks →')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.postAuthor}>{authorName}</Text>
              <Text style={styles.postTime}>{timeAgo(post.created_at, lang)}</Text>
            </View>
            <Text style={styles.postBody}>{post.body}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity
                style={[styles.likeBtn, liked && styles.likeBtnActive]}
                onPress={handleLike}
              >
                <Text style={[styles.likeBtnText, liked && styles.likeBtnActiveText]}>
                  ❤️ {post.like_count} {t('공감', 'Like')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.commentCount}>💬 {post.comment_count}</Text>
              {user && (
                <TouchableOpacity
                  style={styles.commentQuickBtn}
                  onPress={() => {
                    setReplyTo(null);
                    setTimeout(() => {
                      commentInputRef.current?.focus();
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                >
                  <Text style={styles.commentQuickBtnText}>✏️ {t('댓글', 'Comment')}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.modRow}>
                <TouchableOpacity
                  onPress={() => setReportTarget({ type: 'post', id: post.id })}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  accessibilityRole="button"
                >
                  <Text style={styles.modBtnText}>🚩 {t('신고', 'Report')}</Text>
                </TouchableOpacity>
                {(!user || user.id !== post.author_id) && (
                  <TouchableOpacity
                    onPress={() => handleBlock(post.author_id)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.modBtnText}>🚫 {t('차단', 'Block')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          )}

          {/* ── Threaded comments ── */}
          <Text style={styles.sectionTitle}>
            {t('댓글', 'Comments')} {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>

          {comments.length === 0 ? (
            <View style={styles.noCommentsBox}>
              <Text style={styles.noCommentsText}>
                {t('아직 댓글이 없습니다. 첫 번째로 대화를 시작해 보세요!', 'No comments yet. Start the conversation!')}
              </Text>
            </View>
          ) : (
            <View style={styles.commentList}>
              {topLevel.map(c => {
                const cName = c.is_anonymous
                  ? t('익명', 'Anonymous')
                  : (c.profiles?.username ?? t('알 수 없음', 'Unknown'));
                const replies = repliesFor(c.id);
                return (
                  <View key={c.id} style={styles.commentThread}>
                    {/* Top-level comment */}
                    <View style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{cName}</Text>
                        <Text style={styles.commentTime}>{timeAgo(c.created_at, lang)}</Text>
                      </View>
                      <Text style={styles.commentBody}>{c.body}</Text>
                      <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.replyBtn} onPress={() => startReply(c)}>
                          <Text style={styles.replyBtnText}>{t('↩ 답글', '↩ Reply')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.replyBtn} onPress={() => setReportTarget({ type: 'comment', id: c.id })}>
                          <Text style={styles.replyBtnText}>🚩 {t('신고', 'Report')}</Text>
                        </TouchableOpacity>
                        {(!user || user.id !== c.author_id) && (
                          <TouchableOpacity style={styles.replyBtn} onPress={() => handleBlock(c.author_id)}>
                            <Text style={styles.replyBtnText}>🚫 {t('차단', 'Block')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Replies to this comment */}
                    {replies.length > 0 && (
                      <View style={styles.repliesBlock}>
                        {replies.map(r => {
                          const rName = r.is_anonymous
                            ? t('익명', 'Anonymous')
                            : (r.profiles?.username ?? t('알 수 없음', 'Unknown'));
                          return (
                            <View key={r.id} style={styles.replyRow}>
                              <View style={styles.replyThreadLine} />
                              <View style={styles.replyCard}>
                                <View style={styles.commentHeader}>
                                  <Text style={styles.commentAuthor}>{rName}</Text>
                                  <Text style={styles.commentTime}>{timeAgo(r.created_at, lang)}</Text>
                                </View>
                                <Text style={styles.commentBody}>{r.body}</Text>
                                <View style={styles.commentActions}>
                                  <TouchableOpacity style={styles.replyBtn} onPress={() => startReply(r)}>
                                    <Text style={styles.replyBtnText}>{t('↩ 답글', '↩ Reply')}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={styles.replyBtn} onPress={() => setReportTarget({ type: 'comment', id: r.id })}>
                                    <Text style={styles.replyBtnText}>🚩 {t('신고', 'Report')}</Text>
                                  </TouchableOpacity>
                                  {(!user || user.id !== r.author_id) && (
                                    <TouchableOpacity style={styles.replyBtn} onPress={() => handleBlock(r.author_id)}>
                                      <Text style={styles.replyBtnText}>🚫 {t('차단', 'Block')}</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Comment / reply input ── */}
          {user ? (
            <View style={styles.commentInput}>
              {replyTo && (
                <View style={styles.replyIndicator}>
                  <Text style={styles.replyIndicatorText}>
                    ↩ {lang === 'ko'
                      ? `${replyTo.username}님에게 답글`
                      : `Replying to ${replyTo.username}`}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.replyIndicatorClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.anonRow}>
                <TouchableOpacity style={styles.anonToggle} onPress={() => setAnonymous(!anonymous)}>
                  <View style={[styles.checkbox, anonymous && styles.checkboxChecked]}>
                    {anonymous && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.anonLabel}>{t('익명으로 작성', 'Write anonymously')}</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                ref={commentInputRef}
                style={styles.textInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder={
                  replyTo
                    ? (lang === 'ko' ? `${replyTo.username}님에게 답글...` : `Reply to ${replyTo.username}...`)
                    : t('댓글을 입력하세요...', 'Write a comment...')
                }
                placeholderTextColor={colors.textCaption}
                multiline
                maxLength={500}
              />
              {contentError && (
                <View style={styles.contentErrorBox}>
                  <Text style={styles.contentErrorText}>⚠️ {contentError}</Text>
                </View>
              )}
              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>{commentText.length}/500</Text>
                <TouchableOpacity
                  style={[styles.submitBtn, (!commentText.trim() || submitting) && styles.submitBtnDisabled]}
                  onPress={handleComment}
                  disabled={!commentText.trim() || submitting}
                >
                  {submitting
                    ? <ActivityIndicator color={colors.white} size="small" />
                    : <Text style={styles.submitBtnText}>
                        {replyTo ? t('답글 달기', 'Post reply') : t('댓글 달기', 'Post comment')}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>
                {t('가입하면 댓글을 달고 대화에 참여할 수 있어요.', 'Sign up to comment and join the conversation.')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up' as any)}>
                <Text style={styles.signInLink}>{t('무료 가입 →', 'Sign up free →')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ReportModal
        target={reportTarget}
        reporterId={user?.id ?? null}
        lang={lang}
        onClose={() => setReportTarget(null)}
      />
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

  // Post card
  postCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  postTitle: { ...typography.headingM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  postAuthor: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  postTime: { ...typography.bodyS, color: colors.textCaption },
  postBody: { ...typography.bodyM, color: colors.text, lineHeight: 26, marginBottom: spacing.base },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  likeBtnActive: { backgroundColor: '#FEE2E2' },
  likeBtnText: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '600' },
  likeBtnActiveText: { color: '#DC2626' },
  commentCount: { ...typography.bodyS, color: colors.textCaption },
  commentQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  commentQuickBtnText: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  modRow: { flexDirection: 'row', gap: spacing.md, marginLeft: 'auto' },
  modBtnText: { ...typography.caption, color: colors.textCaption, fontWeight: '600' },
  commentActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  blockedText: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.sm },
  blockedManageLink: { ...typography.bodyS, color: colors.action, fontWeight: '600' },
  contentErrorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  contentErrorText: { ...typography.caption, color: '#B91C1C', lineHeight: 18 },

  // Comment section
  sectionTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  noCommentsBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadow.card,
  },
  noCommentsText: { ...typography.bodyS, color: colors.textCaption, textAlign: 'center' },

  commentList: { gap: spacing.sm, marginBottom: spacing.base },
  commentThread: { gap: spacing.xs },

  // Top-level comment
  commentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  commentHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs, alignItems: 'center' },
  commentAuthor: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  commentTime: { ...typography.caption, color: colors.textCaption, flex: 1 },
  commentBody: { ...typography.bodyS, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  replyBtn: { alignSelf: 'flex-start', paddingVertical: 2 },
  replyBtnText: { ...typography.caption, color: colors.textCaption, fontWeight: '600' },

  // Replies
  repliesBlock: { paddingLeft: spacing.md, gap: spacing.xs },
  replyRow: { flexDirection: 'row', alignItems: 'stretch' },
  replyThreadLine: {
    width: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
    marginRight: spacing.sm,
  },
  replyCard: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
  },

  // Comment input
  commentInput: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    ...shadow.card,
    marginBottom: spacing.base,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.action,
  },
  replyIndicatorText: { ...typography.caption, color: colors.action, flex: 1, fontWeight: '600' },
  replyIndicatorClose: { ...typography.bodyS, color: colors.textCaption, paddingLeft: spacing.sm },
  anonRow: { marginBottom: spacing.sm },
  anonToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
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
    marginBottom: spacing.xs,
    textAlignVertical: 'top',
  },
  inputFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  charCount: { ...typography.caption, color: colors.textCaption },
  submitBtn: { backgroundColor: colors.action, borderRadius: radius.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },

  // Unauthenticated prompt
  signInPrompt: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  signInText: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: 'center' },
  signInLink: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
});
