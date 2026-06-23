import { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';

export default function NewPostScreen() {
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  async function handleSubmit() {
    if (!user) { router.push('/(auth)/sign-in' as any); return; }
    if (!title.trim()) {
      Alert.alert(t('제목 필요', 'Title required'), t('제목을 입력하세요.', 'Please enter a title.'));
      return;
    }
    if (!body.trim()) {
      Alert.alert(t('내용 필요', 'Body required'), t('내용을 입력하세요.', 'Please enter some content.'));
      return;
    }

    setSubmitting(true);
    const { data: newPost, error } = await supabase.from('posts').insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      is_anonymous: anonymous,
    }).select('id').single();

    if (error || !newPost) {
      setSubmitting(false);
      Alert.alert(t('오류', 'Error'), t('게시글 등록에 실패했습니다.', 'Failed to create post.'));
      return;
    }

    // Navigate to the new post
    router.replace(`/community/post/${newPost.id}` as any);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('뒤로', 'Back')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('새 글 쓰기', 'Write a post')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('제목', 'Title')}</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder={t('제목을 입력하세요', 'Enter a title')}
              placeholderTextColor={colors.textCaption}
              maxLength={100}
            />

            <Text style={styles.label}>{t('내용', 'Content')}</Text>
            <TextInput
              style={styles.bodyInput}
              value={body}
              onChangeText={setBody}
              placeholder={t('내용을 입력하세요.\n법률 자문이 아닌 경험·정보 공유를 권장합니다.', 'Share your experience or information.\n(Not a place for legal advice.)')}
              placeholderTextColor={colors.textCaption}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{body.length}/2000</Text>
          </View>

          {/* Anonymous toggle */}
          <TouchableOpacity style={styles.anonRow} onPress={() => setAnonymous(!anonymous)}>
            <View style={[styles.checkbox, anonymous && styles.checkboxChecked]}>
              {anonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.anonTextGroup}>
              <Text style={styles.anonLabel}>{t('익명으로 게시', 'Post anonymously')}</Text>
              <Text style={styles.anonHint}>
                {t('다른 사용자에게 닉네임이 표시되지 않습니다.', 'Your username will not be shown to others.')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              {t(
                '📢 이 커뮤니티는 노동자 간 정보 공유 공간입니다. 법률 자문이 아니며, 법적 판단은 노무사와 상담하세요.',
                '📢 This community is for peer information sharing, not legal advice. Consult a 노무사 for legal decisions.'
              )}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
          >
            {submitting
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.submitBtnText}>{t('게시하기', 'Post')}</Text>
            }
          </TouchableOpacity>

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
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.base },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginBottom: spacing.base, ...shadow.card },
  label: { ...typography.bodyS, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  titleInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyM,
    color: colors.text,
    marginBottom: spacing.base,
  },
  bodyInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.bodyM,
    color: colors.text,
    minHeight: 160,
    marginBottom: spacing.xs,
  },
  charCount: { ...typography.caption, color: colors.textCaption, textAlign: 'right' },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.action, borderColor: colors.action },
  checkmark: { color: colors.white, fontSize: 12, fontWeight: '700' },
  anonTextGroup: { flex: 1 },
  anonLabel: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  anonHint: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  disclaimer: { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.brand },
  disclaimerText: { ...typography.bodyS, color: colors.text, lineHeight: 20 },
  submitBtn: { backgroundColor: colors.action, borderRadius: radius.sm, padding: spacing.base, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
});
