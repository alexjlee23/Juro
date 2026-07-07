import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../../constants/theme';
import Banner from '../../components/ui/Banner';
import BrandHeader from '../../components/ui/BrandHeader';
import hotlines from '../../content/hotlines.json';
import directoryData from '../../content/directory.json';

const HOTLINE_CATEGORIES = {
  gov: ['moel_1350', 'comwel', 'seoul_labor'],
  migrant: ['danuri_1345', 'migrant_1644', 'danuri_multicultural', 'bbb'],
  free: ['kcplaa_nomusa', 'youth_rights'],
  union: ['minjoo_union'],
};

export default function FindScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  const byId = Object.fromEntries(hotlines.map(h => [h.id, h]));

  const renderHotline = (id: string) => {
    const h = byId[id];
    if (!h) return null;
    return (
      <TouchableOpacity
        key={id}
        style={styles.hotlineRow}
        onPress={() => Linking.openURL(`tel:${h.number.replace(/-/g, '')}`)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${h.name[lang as keyof typeof h.name]} ${h.number}`}
      >
        <View style={styles.hotlineInfo}>
          <Text style={styles.hotlineName}>{h.name[lang as keyof typeof h.name]}</Text>
          <Text style={styles.hotlineNumber}>{h.number}</Text>
          <Text style={styles.hotlineAvail}>{h.available[lang as keyof typeof h.available]}</Text>
        </View>
        <View style={styles.callBtn}>
          <Text style={styles.callBtnText}>{lang === 'ko' ? '전화' : 'Call'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{lang === 'ko' ? '도움 찾기' : 'Find Help'}</Text>
        <Text style={styles.subtitle}>
          {lang === 'ko' ? '노무사, 전화 상담, 무료 법률 지원' : 'Labor attorneys, hotlines, free legal help'}
        </Text>

        {/* Directory CTA */}
        <TouchableOpacity
          style={styles.directoryCta}
          onPress={() => router.push('/directory')}
          accessibilityRole="button"
        >
          <Text style={styles.directoryCtaEmoji}>🧑‍⚖️</Text>
          <View style={styles.directoryCtaText}>
            <Text style={styles.directoryCtaTitle}>
              {lang === 'ko' ? '노무사 찾기' : 'Find a Labor Attorney'}
            </Text>
            <Text style={styles.directoryCtaDetail}>
              {lang === 'ko'
                ? `${directoryData.length}명 · 지역·전문분야 검색 · KCPLAA 공인`
                : `${directoryData.length} attorneys · Filter by region & specialty`}
            </Text>
          </View>
          <Text style={styles.directoryArrow}>›</Text>
        </TouchableOpacity>

        {/* Free consult programs */}
        <View style={styles.freeConsult}>
          <Text style={styles.freeConsultTitle}>
            {lang === 'ko' ? '🎁 무료 상담 프로그램' : '🎁 Free consultation programs'}
          </Text>
          <Text style={styles.freeConsultBody}>
            {lang === 'ko'
              ? '국선노무사 · 마을변호사 · 청소년 근로권익센터 (만 24세 이하) · 서울 노동권익센터 지하철 상담'
              : 'Public labor attorney · 청소년 Rights Center (under 24) · Seoul subway consultations'}
          </Text>
          <TouchableOpacity
            style={styles.freeConsultBtn}
            onPress={() => Linking.openURL('tel:16612020')}
            accessibilityRole="button"
          >
            <Text style={styles.freeConsultBtnText}>
              📞 {lang === 'ko' ? '서울노동권익센터 1661-2020' : 'Seoul Labor Rights 1661-2020'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Call preparation tip */}
        <View style={styles.prepTip}>
          <Text style={styles.prepTipTitle}>
            {lang === 'ko' ? '💡 전화 전에 준비하면 좋아요' : '💡 Before you call, have ready:'}
          </Text>
          <Text style={styles.prepTipBody}>
            {lang === 'ko'
              ? '근로계약서 · 급여명세서 · 근무 기간과 시간 · 사장님과 주고받은 메시지. 없어도 상담은 가능합니다.'
              : 'Employment contract · pay stubs · your work dates and hours · messages with your boss. You can still call without them.'}
          </Text>
        </View>

        {/* Government hotlines */}
        <Text style={styles.categoryTitle}>
          {lang === 'ko' ? '🏛️ 정부 기관' : '🏛️ Government'}
        </Text>
        <View style={styles.hotlineGroup}>
          {HOTLINE_CATEGORIES.gov.map(renderHotline)}
        </View>

        {/* Migrant hotlines */}
        <Text style={styles.categoryTitle}>
          {lang === 'ko' ? '🌏 외국인 · 다국어 지원' : '🌏 Migrant & multilingual'}
        </Text>
        <View style={styles.hotlineGroup}>
          {HOTLINE_CATEGORIES.migrant.map(renderHotline)}
        </View>

        {/* Free consult hotlines */}
        <Text style={styles.categoryTitle}>
          {lang === 'ko' ? '🎓 청소년 · 무료 상담' : '🎓 Youth & free consult'}
        </Text>
        <View style={styles.hotlineGroup}>
          {HOTLINE_CATEGORIES.free.map(renderHotline)}
        </View>

        {/* Union */}
        <Text style={styles.categoryTitle}>
          {lang === 'ko' ? '✊ 노동조합' : '✊ Unions'}
        </Text>
        <View style={styles.hotlineGroup}>
          {HOTLINE_CATEGORIES.union.map(renderHotline)}
        </View>

        <View style={styles.offlineNote}>
          <Text style={styles.offlineNoteText}>
            {lang === 'ko'
              ? '📶 오프라인에서도 이용 가능 — 번호는 항상 저장되어 있습니다.'
              : '📶 Available offline — all numbers are stored locally on your device.'}
          </Text>
        </View>

        <Banner />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyM, color: colors.textSecondary, marginBottom: spacing.lg },

  directoryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.action,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  directoryCtaEmoji: { fontSize: 28, marginRight: spacing.md },
  directoryCtaText: { flex: 1 },
  directoryCtaTitle: { ...typography.bodyM, color: colors.white, fontWeight: '700' },
  directoryCtaDetail: { ...typography.bodyS, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  directoryArrow: { ...typography.headingM, color: colors.white },

  freeConsult: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  freeConsultTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  freeConsultBody: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  freeConsultBtn: { alignSelf: 'flex-start', backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  freeConsultBtnText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },

  prepTip: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  prepTipTitle: { ...typography.bodyS, color: colors.text, fontWeight: '700', marginBottom: 2 },
  prepTipBody: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },

  categoryTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.xs },
  hotlineGroup: { marginBottom: spacing.base },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.xs,
    ...shadow.card,
  },
  hotlineInfo: { flex: 1 },
  hotlineName: { ...typography.bodyM, color: colors.text, fontWeight: '600' },
  hotlineNumber: { ...typography.bodyM, color: colors.action, fontWeight: '700', marginTop: 2 },
  hotlineAvail: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  callBtn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  callBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },

  offlineNote: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  offlineNoteText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
