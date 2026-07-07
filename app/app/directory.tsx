import { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Linking, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import directory from '../content/directory.json';
import { detectNearbyRegion } from '../lib/locationRegion';

const SPECIALIZATIONS = [
  { id: 'unpaid_wages', ko: '임금체불', en: 'Unpaid Wages' },
  { id: 'unfair_dismissal', ko: '부당해고', en: 'Unfair Dismissal' },
  { id: 'harassment', ko: '괴롭힘', en: 'Harassment' },
  { id: 'industrial_accident', ko: '산업재해', en: 'Industrial Accident' },
  { id: 'hr_labor', ko: '인사노무', en: 'HR & Labor' },
  { id: 'safety', ko: '산업안전', en: 'Safety' },
];

const REGIONS_KO = ['서울', '경기남부', '경기북부', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '경남', '경북', '전남', '전북', '충남', '충북'];

export default function DirectoryScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';

  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locatedRegion, setLocatedRegion] = useState<string | null>(null);

  async function handleLocate() {
    setLocating(true);
    try {
      const region = await detectNearbyRegion();
      if (region) {
        setLocatedRegion(region);
        setSelectedRegion(region);
      }
    } finally {
      setLocating(false);
    }
  }

  function clearLocation() {
    setLocatedRegion(null);
    setSelectedRegion(null);
  }

  const filtered = useMemo(() => {
    return (directory as any[]).filter((d) => {
      const nameMatch = !search ||
        d.name.ko.includes(search) ||
        d.name.en.toLowerCase().includes(search.toLowerCase()) ||
        d.affiliation.ko.includes(search) ||
        d.affiliation.en.toLowerCase().includes(search.toLowerCase());
      const specMatch = !selectedSpec || d.specializations.includes(selectedSpec);
      const regionMatch = !selectedRegion || d.region.ko === selectedRegion;
      return nameMatch && specMatch && regionMatch;
    });
  }, [search, selectedSpec, selectedRegion]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[0]}>
        {/* Sticky header + filters */}
        <View style={styles.stickyHeader}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{lang === 'ko' ? '노무사 찾기' : 'Find a Labor Attorney'}</Text>
            <Text style={styles.count}>{filtered.length}</Text>
          </View>

          {/* Location button */}
          {locatedRegion ? (
            <TouchableOpacity style={styles.locatedChip} onPress={clearLocation} activeOpacity={0.8}>
              <Text style={styles.locatedChipText}>📍 {locatedRegion}</Text>
              <Text style={styles.locatedChipX}>  ✕</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.locateBtn} onPress={handleLocate} disabled={locating} activeOpacity={0.8}>
              {locating ? (
                <ActivityIndicator size="small" color={colors.action} />
              ) : (
                <Text style={styles.locateBtnText}>
                  📍 {lang === 'ko' ? '내 주변 노무사 찾기' : 'Find labor attorneys near me'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Search */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={lang === 'ko' ? '이름, 소속, 지역 검색...' : 'Search name, firm, region...'}
              placeholderTextColor={colors.textCaption}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Specialization chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            <TouchableOpacity
              style={[styles.chip, !selectedSpec && styles.chipActive]}
              onPress={() => setSelectedSpec(null)}
            >
              <Text style={[styles.chipText, !selectedSpec && styles.chipTextActive]}>
                {lang === 'ko' ? '전체' : 'All'}
              </Text>
            </TouchableOpacity>
            {SPECIALIZATIONS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, selectedSpec === s.id && styles.chipActive]}
                onPress={() => setSelectedSpec(selectedSpec === s.id ? null : s.id)}
              >
                <Text style={[styles.chipText, selectedSpec === s.id && styles.chipTextActive]}>
                  {lang === 'ko' ? s.ko : s.en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Region chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            <TouchableOpacity
              style={[styles.chip, !selectedRegion && styles.chipActive]}
              onPress={() => setSelectedRegion(null)}
            >
              <Text style={[styles.chipText, !selectedRegion && styles.chipTextActive]}>
                {lang === 'ko' ? '전 지역' : 'All regions'}
              </Text>
            </TouchableOpacity>
            {REGIONS_KO.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, selectedRegion === r && styles.chipActive]}
                onPress={() => setSelectedRegion(selectedRegion === r ? null : r)}
              >
                <Text style={[styles.chipText, selectedRegion === r && styles.chipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>{lang === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}</Text>
            <Text style={styles.emptyHint}>
              {lang === 'ko'
                ? '필터를 지우거나 다른 지역을 선택해 보세요.'
                : 'Try clearing the filters or choosing a different region.'}
            </Text>
            {(search || selectedSpec || selectedRegion) && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={() => { setSearch(''); setSelectedSpec(null); setSelectedRegion(null); setLocatedRegion(null); }}
                accessibilityRole="button"
              >
                <Text style={styles.clearFiltersText}>{lang === 'ko' ? '필터 모두 지우기' : 'Clear all filters'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.emptyCallBtn}
              onPress={() => Linking.openURL('tel:1350')}
              accessibilityRole="button"
            >
              <Text style={styles.emptyCallText}>📞 {lang === 'ko' ? '고용노동부 1350 전화 상담' : 'Call Labor Ministry 1350 instead'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((d: any) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{d.name[lang]}</Text>
                  <Text style={styles.affiliation}>{d.affiliation[lang]}</Text>
                  <Text style={styles.region}>📍 {d.region[lang === 'ko' ? 'ko' : 'en']}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${d.phone.replace(/-/g, '')}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${d.name[lang]}`}
                  >
                    <Text style={styles.callBtnIcon}>📞</Text>
                    <Text style={styles.callBtnLabel}>{lang === 'ko' ? '전화' : 'Call'}</Text>
                  </TouchableOpacity>
                  {d.kcplaaUrl && (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => Linking.openURL(d.kcplaaUrl)}
                      accessibilityRole="link"
                    >
                      <Text style={styles.linkBtnText}>🔗</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.phone}>{d.phone}</Text>

              {d.specializations.length > 0 && (
                <View style={styles.tags}>
                  {d.specializations.slice(0, 4).map((s: string) => {
                    const spec = SPECIALIZATIONS.find(x => x.id === s);
                    return spec ? (
                      <View key={s} style={styles.tag}>
                        <Text style={styles.tagText}>{lang === 'ko' ? spec.ko : spec.en}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}

              <Text style={styles.source}>{lang === 'ko' ? '출처: KCPLAA 한국공인노무사회' : 'Source: KCPLAA'}</Text>
            </View>
          ))
        )}

        <View style={styles.sourceNote}>
          <Text style={styles.sourceNoteText}>
            {lang === 'ko'
              ? '이 정보는 한국공인노무사회(KCPLAA) 공개 자료를 기반으로 합니다. 정확한 상담 가능 여부는 직접 확인하세요.'
              : 'This directory is based on public KCPLAA data. Verify availability directly before consulting.'}
          </Text>
        </View>
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  stickyHeader: { backgroundColor: colors.background, paddingHorizontal: spacing.base, paddingTop: spacing.base, paddingBottom: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  backText: { ...typography.bodyL, color: colors.action, marginRight: spacing.md },
  title: { ...typography.headingM, color: colors.text, fontWeight: '700', flex: 1 },
  count: { ...typography.bodyS, color: colors.textCaption, backgroundColor: colors.surfaceTint, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  locateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.selectedBg, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.brand, paddingVertical: spacing.sm, marginBottom: spacing.sm, minHeight: 40 },
  locateBtnText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  locatedChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.sm },
  locatedChipText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  locatedChipX: { ...typography.bodyS, color: 'rgba(255,255,255,0.75)' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.sm, minHeight: 44 },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.bodyM, lineHeight: undefined, color: colors.text },
  clearBtn: { ...typography.bodyS, color: colors.textCaption, padding: spacing.xs },
  chips: { marginBottom: spacing.xs },
  chip: { backgroundColor: colors.white, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.xs, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.action, borderColor: colors.action },
  chipText: { ...typography.caption, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyText: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  emptyHint: { ...typography.bodyS, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.base },
  clearFiltersBtn: { backgroundColor: colors.selectedBg, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginBottom: spacing.sm },
  clearFiltersText: { ...typography.bodyS, color: colors.action, fontWeight: '700' },
  emptyCallBtn: { backgroundColor: colors.action, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  emptyCallText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.base, marginHorizontal: spacing.base, marginBottom: spacing.sm, ...shadow.card },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  cardInfo: { flex: 1 },
  name: { ...typography.bodyM, color: colors.text, fontWeight: '700' },
  affiliation: { ...typography.bodyS, color: colors.textSecondary, marginTop: 2 },
  region: { ...typography.caption, color: colors.textCaption, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing.xs },
  callBtn: { backgroundColor: colors.action, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, alignItems: 'center', justifyContent: 'center', minWidth: 52 },
  callBtnIcon: { fontSize: 16 },
  callBtnLabel: { ...typography.caption, color: colors.white, fontWeight: '700', marginTop: 1 },
  linkBtn: { backgroundColor: colors.surfaceTint, borderRadius: radius.sm, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  linkBtnText: { fontSize: 18 },
  phone: { ...typography.bodyS, color: colors.action, fontWeight: '600', marginBottom: spacing.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: { backgroundColor: colors.selectedBg, borderRadius: 4, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  tagText: { ...typography.caption, color: colors.action, fontWeight: '600' },
  source: { ...typography.caption, color: colors.textCaption, marginTop: spacing.xs },
  sourceNote: { margin: spacing.base, padding: spacing.md, backgroundColor: colors.surfaceTint, borderRadius: radius.sm },
  sourceNoteText: { ...typography.caption, color: colors.textCaption, lineHeight: 18 },
});
