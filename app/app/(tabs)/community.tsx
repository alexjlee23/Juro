import { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import BrandHeader from '../../components/ui/BrandHeader';

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
  type:      { ko: '👤 근로자 유형', en: '👤 Worker type' },
  region:    { ko: '📍 지역별',      en: '📍 By region' },
  industry:  { ko: '🏭 업종별',      en: '🏭 By industry' },
  situation: { ko: '⚠️ 상황별',     en: '⚠️ By situation' },
  general:   { ko: '💬 자유',        en: '💬 General' },
};

const CATEGORY_ORDER = ['general', 'type', 'situation', 'industry', 'region'];

// Explicit display order for regional communities (capital first, then by city size)
const REGION_ORDER = [
  'seoul', 'gyeonggi-incheon', 'daegu-gyeongbuk', 'busan-ulsan-gyeongnam',
  'daejeon-chungcheong', 'gwangju-jeolla', 'gangwon', 'jeju',
];

export default function CommunityScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'ko' | 'en';
  const { user } = useAuth();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Scroll indicator for the joined-communities chip row
  const [chipsScrollX, setChipsScrollX] = useState(0);
  const [chipsContentW, setChipsContentW] = useState(0);
  const [chipsViewW, setChipsViewW] = useState(0);
  const chipsOverflow = chipsContentW > chipsViewW + 1;

  function onChipsScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setChipsScrollX(e.nativeEvent.contentOffset.x);
  }

  const t = (ko: string, en: string) => lang === 'ko' ? ko : en;

  useFocusEffect(useCallback(() => { load(); }, [user]));

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from('communities').select('*').order('category').order('name_ko');
      if (error) { setLoadError(true); setLoading(false); return; }
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
    } catch {
      setLoadError(true);
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

  if (grouped.region) {
    grouped.region.sort((a, b) => {
      const ai = REGION_ORDER.indexOf(a.slug);
      const bi = REGION_ORDER.indexOf(b.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }

  // Joined chips follow the same order as the browse section:
  // 자유 → 근로자 유형 → 상황별 → 업종별 → 지역별 (regions last, in fixed order)
  const joinedList = communities
    .filter(c => joinedIds.has(c.id))
    .sort((a, b) => {
      const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      if (a.category === 'region') {
        const ai = REGION_ORDER.indexOf(a.slug);
        const bi = REGION_ORDER.indexOf(b.slug);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      }
      return a.name_ko.localeCompare(b.name_ko, 'ko');
    });

  // Only show communities in the browse section that haven't been joined yet
  const hasUnjoined = CATEGORY_ORDER.some(cat =>
    (grouped[cat] ?? []).some(c => !joinedIds.has(c.id))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.action} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 16 }]}>
            {t(
              '커뮤니티를 불러오지 못했습니다.\n인터넷 연결을 확인해 주세요.',
              'Could not load communities.\nCheck your internet connection.'
            )}
          </Text>
          <TouchableOpacity
            onPress={load}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>{t('다시 시도', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <BrandHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('커뮤니티', 'Community')}</Text>
          <Text style={styles.subtitle}>
            {t('비슷한 처지의 노동자들과 이야기하세요', 'Talk with workers who understand')}
          </Text>
        </View>

        {/* Auth nudge — logged-out users only */}
        {!user && (
          <View style={styles.authPrompt}>
            <Text style={styles.authPromptTitle}>
              {t('가입하면 글을 쓸 수 있어요', 'Sign up to post & comment')}
            </Text>
            <Text style={styles.authPromptBody}>
              {t('읽기는 누구나 가능해요. 글쓰기는 무료 계정이 필요해요.', 'Anyone can read. Writing requires a free account.')}
            </Text>
            <View style={styles.authBtns}>
              <TouchableOpacity
                style={styles.authBtnPrimary}
                onPress={() => router.push('/(auth)/sign-up' as any)}
              >
                <Text style={styles.authBtnPrimaryText}>{t('무료 가입', 'Sign up free')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authBtnSecondary}
                onPress={() => router.push('/(auth)/sign-in' as any)}
              >
                <Text style={styles.authBtnSecondaryText}>{t('로그인', 'Sign in')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* My Communities — horizontal quick-access chips */}
        {user && joinedList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('내 커뮤니티', 'My Communities')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              onScroll={onChipsScroll}
              scrollEventThrottle={16}
              onContentSizeChange={(w) => setChipsContentW(w)}
              onLayout={(e) => setChipsViewW(e.nativeEvent.layout.width)}
            >
              {joinedList.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.chip}
                  onPress={() => router.push(`/community/${c.id}` as any)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipEmoji}>{c.emoji}</Text>
                  <Text style={styles.chipName} numberOfLines={2}>
                    {lang === 'ko' ? c.name_ko : c.name_en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Scroll-position indicator — only when chips overflow the screen */}
            {chipsOverflow && (() => {
              const TRACK_W = 64;
              const thumbW = Math.max(16, TRACK_W * (chipsViewW / chipsContentW));
              const maxScroll = chipsContentW - chipsViewW;
              const progress = maxScroll > 0 ? Math.min(1, Math.max(0, chipsScrollX / maxScroll)) : 0;
              return (
                <View style={styles.chipsTrack} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <View
                    style={[
                      styles.chipsThumb,
                      { width: thumbW, transform: [{ translateX: progress * (TRACK_W - thumbW) }] },
                    ]}
                  />
                </View>
              );
            })()}
          </View>
        )}

        {/* Browse section — only communities not yet joined */}
        {hasUnjoined && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {user && joinedList.length > 0
                ? t('둘러보기', 'Explore')
                : t('모든 커뮤니티', 'All Communities')}
            </Text>

            {CATEGORY_ORDER.map(cat => {
              const list = (grouped[cat] ?? []).filter(c => !joinedIds.has(c.id));
              if (!list.length) return null;
              return (
                <View key={cat} style={styles.categoryGroup}>
                  <Text style={styles.categoryLabel}>
                    {CATEGORY_LABELS[cat]?.[lang] ?? cat}
                  </Text>
                  <View style={styles.cardList}>
                    {list.map(c => (
                      <CommunityCard
                        key={c.id}
                        community={c}
                        lang={lang}
                        onPress={() => router.push(`/community/${c.id}` as any)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* All joined — nothing left to browse */}
        {user && joinedList.length > 0 && !hasUnjoined && (
          <View style={styles.allJoinedBox}>
            <Text style={styles.allJoinedText}>
              {t('모든 커뮤니티에 참여 중입니다 🎉', 'You\'ve joined all communities 🎉')}
            </Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {t(
              '커뮤니티 글은 노동자 간 정보 공유이며 법률 자문이 아닙니다.\n부적절한 콘텐츠는 각 게시글의 🚩 신고 버튼 또는 help@jurio.app 으로 알려주세요. 24시간 이내에 검토·삭제하며, 위반 사용자의 계정은 정지됩니다.',
              'Community posts are peer information sharing, not legal advice.\nReport inappropriate content via the 🚩 button on any post or help@jurio.app. Reports are reviewed within 24 hours; violating content is removed and offending accounts suspended.'
            )}
          </Text>
        </View>
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CommunityCard({
  community, lang, onPress,
}: { community: Community; lang: 'ko' | 'en'; onPress: () => void }) {
  const name = lang === 'ko' ? community.name_ko : community.name_en;
  const desc = lang === 'ko' ? community.description_ko : community.description_en;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <Text style={styles.cardEmoji}>{community.emoji}</Text>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{desc}</Text>
        <Text style={styles.cardMeta}>
          {'👥 '}{community.member_count.toLocaleString()}
          {lang === 'ko' ? '명' : ' members'}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },

  header: { marginBottom: spacing.lg },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700' },
  subtitle: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },

  errorText: { ...typography.bodyM, color: colors.text },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
  },
  retryText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },

  // Auth nudge
  authPrompt: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    ...shadow.card,
  },
  authPromptTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  authPromptBody: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.md },
  authBtns: { flexDirection: 'row', gap: spacing.sm },
  authBtnPrimary: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  authBtnPrimaryText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  authBtnSecondary: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.action,
  },
  authBtnSecondaryText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },

  // Section wrapper
  section: { marginBottom: spacing.lg },
  sectionLabel: {
    ...typography.bodyM,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  // Horizontal chips for joined communities
  chipsRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  chipsTrack: {
    alignSelf: 'center',
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  chipsThumb: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.action,
  },
  chip: {
    width: 88,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
    borderWidth: 1.5,
    borderColor: colors.selectedBg,
  },
  chipEmoji: { fontSize: 26, marginBottom: spacing.xs },
  chipName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Category groups inside browse
  categoryGroup: { marginBottom: spacing.md },
  categoryLabel: {
    ...typography.bodyS,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    paddingLeft: 2,
  },
  cardList: { gap: spacing.sm },

  // Community card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  cardEmoji: { fontSize: 24, marginRight: spacing.md, width: 32, textAlign: 'center' },
  cardBody: { flex: 1 },
  cardName: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: 2 },
  cardDesc: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  cardMeta: { ...typography.caption, color: colors.textCaption },
  arrow: { ...typography.headingM, color: colors.textCaption, marginLeft: spacing.sm },

  // All joined state
  allJoinedBox: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  allJoinedText: { ...typography.bodyS, color: colors.action, fontWeight: '600', textAlign: 'center' },

  disclaimer: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  disclaimerText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
