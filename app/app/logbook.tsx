import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, Alert, Share, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius, shadow } from '../constants/theme';
import Banner from '../components/ui/Banner';

const STORAGE_KEY = 'juro_logbook_v1';

interface LogEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  hoursWorked: string;
  payPromised: string;
  payReceived: string;
  note: string;
  createdAt: string;
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string, lang: 'ko' | 'en') {
  const [y, m, d] = iso.split('-');
  return lang === 'ko' ? `${y}년 ${parseInt(m)}월 ${parseInt(d)}일` : `${y}/${m}/${d}`;
}

// ── Add entry form ────────────────────────────────────────────────────────────

function AddEntryForm({ lang, onAdd }: { lang: 'ko' | 'en'; onAdd: (e: LogEntry) => void }) {
  const [date, setDate] = useState(todayISO());
  const [hours, setHours] = useState('');
  const [promised, setPromised] = useState('');
  const [received, setReceived] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!date) {
      Alert.alert(lang === 'ko' ? '날짜를 입력해주세요.' : 'Please enter a date.');
      return;
    }
    onAdd({
      id: newId(),
      date,
      hoursWorked: hours,
      payPromised: promised,
      payReceived: received,
      note,
      createdAt: new Date().toISOString(),
    });
    setHours('');
    setPromised('');
    setReceived('');
    setNote('');
    setDate(todayISO());
  };

  return (
    <View style={styles.addCard}>
      <Text style={styles.addTitle}>{lang === 'ko' ? '+ 근무 기록 추가' : '+ Add shift'}</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '날짜 (YYYY-MM-DD)' : 'Date (YYYY-MM-DD)'}</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-01-15"
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '날짜' : 'Date'}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '근무 시간' : 'Hours worked'}</Text>
          <TextInput
            style={styles.input}
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
            placeholder="8"
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '근무 시간' : 'Hours worked'}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '약속 임금 (₩)' : 'Pay promised (₩)'}</Text>
          <TextInput
            style={styles.input}
            value={promised}
            onChangeText={setPromised}
            keyboardType="numeric"
            placeholder="80,000"
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '약속 임금' : 'Promised pay'}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>{lang === 'ko' ? '실제 지급 (₩)' : 'Pay received (₩)'}</Text>
          <TextInput
            style={styles.input}
            value={received}
            onChangeText={setReceived}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textCaption}
            accessibilityLabel={lang === 'ko' ? '실제 지급' : 'Received pay'}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{lang === 'ko' ? '메모 (선택)' : 'Note (optional)'}</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          value={note}
          onChangeText={setNote}
          placeholder={lang === 'ko' ? '상황 메모...' : 'Situation notes...'}
          placeholderTextColor={colors.textCaption}
          multiline
          numberOfLines={2}
          accessibilityLabel={lang === 'ko' ? '메모' : 'Note'}
        />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd} accessibilityRole="button">
        <Text style={styles.addBtnText}>{lang === 'ko' ? '저장' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Entry row ─────────────────────────────────────────────────────────────────

function EntryRow({ entry, lang, onDelete }: { entry: LogEntry; lang: 'ko' | 'en'; onDelete: () => void }) {
  const promised = parseFloat(entry.payPromised.replace(/,/g, '')) || 0;
  const received = parseFloat(entry.payReceived.replace(/,/g, '')) || 0;
  const diff = promised - received;
  const unpaid = diff > 0;

  return (
    <View style={styles.entryRow}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(entry.date, lang)}</Text>
        {unpaid && (
          <View style={styles.unpaidBadge}>
            <Text style={styles.unpaidBadgeText}>
              {lang === 'ko' ? `미지급 ₩${diff.toLocaleString()}` : `Unpaid ₩${diff.toLocaleString()}`}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel={lang === 'ko' ? '삭제' : 'Delete'}>
          <Text style={styles.deleteBtnText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.entryMeta}>
        {entry.hoursWorked ? (
          <Text style={styles.entryDetail}>⏱ {lang === 'ko' ? `${entry.hoursWorked}시간` : `${entry.hoursWorked}h`}</Text>
        ) : null}
        {entry.payPromised ? (
          <Text style={styles.entryDetail}>💰 {lang === 'ko' ? `약속 ₩${entry.payPromised}` : `Promised ₩${entry.payPromised}`}</Text>
        ) : null}
        {entry.payReceived ? (
          <Text style={[styles.entryDetail, unpaid && styles.unpaidText]}>
            {lang === 'ko' ? `지급 ₩${entry.payReceived}` : `Received ₩${entry.payReceived}`}
          </Text>
        ) : null}
      </View>

      {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LogbookScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const lang = i18n.language as 'ko' | 'en';
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Load from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setEntries(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const save = useCallback((updated: LogEntry[]) => {
    setEntries(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleAdd = (entry: LogEntry) => {
    const updated = [entry, ...entries].sort((a, b) => b.date.localeCompare(a.date));
    save(updated);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      lang === 'ko' ? '기록 삭제' : 'Delete entry',
      lang === 'ko' ? '이 기록을 삭제하시겠어요?' : 'Delete this shift record?',
      [
        { text: lang === 'ko' ? '취소' : 'Cancel', style: 'cancel' },
        { text: lang === 'ko' ? '삭제' : 'Delete', style: 'destructive', onPress: () => save(entries.filter((e) => e.id !== id)) },
      ],
    );
  };

  const handleExport = () => {
    if (entries.length === 0) {
      Alert.alert(lang === 'ko' ? '기록 없음' : 'No entries', lang === 'ko' ? '내보낼 기록이 없습니다.' : 'No records to export.');
      return;
    }

    const title = lang === 'ko' ? '주리오 — 근무 일지 (증거 자료)' : 'Jurio — Work Logbook (Evidence Record)';
    const lines: string[] = [title, '=' .repeat(40), ''];

    // Summary
    const totalPromised = entries.reduce((s, e) => s + (parseFloat(e.payPromised.replace(/,/g, '')) || 0), 0);
    const totalReceived = entries.reduce((s, e) => s + (parseFloat(e.payReceived.replace(/,/g, '')) || 0), 0);
    const totalUnpaid = totalPromised - totalReceived;

    lines.push(lang === 'ko' ? `📋 총 ${entries.length}건 기록` : `📋 Total ${entries.length} shift records`);
    if (totalPromised > 0) lines.push(lang === 'ko' ? `💰 약속 임금 합계: ₩${totalPromised.toLocaleString()}` : `💰 Total promised: ₩${totalPromised.toLocaleString()}`);
    if (totalReceived > 0) lines.push(lang === 'ko' ? `✅ 지급 금액 합계: ₩${totalReceived.toLocaleString()}` : `✅ Total received: ₩${totalReceived.toLocaleString()}`);
    if (totalUnpaid > 0) lines.push(lang === 'ko' ? `⚠️  미지급 합계: ₩${totalUnpaid.toLocaleString()}` : `⚠️  Total unpaid: ₩${totalUnpaid.toLocaleString()}`);
    lines.push('');
    lines.push('-'.repeat(40));
    lines.push('');

    // Individual entries
    entries.forEach((e, i) => {
      lines.push(`[${i + 1}] ${formatDate(e.date, lang)}`);
      if (e.hoursWorked) lines.push(`  ${lang === 'ko' ? '근무' : 'Hours'}: ${e.hoursWorked}${lang === 'ko' ? '시간' : 'h'}`);
      if (e.payPromised) lines.push(`  ${lang === 'ko' ? '약속' : 'Promised'}: ₩${e.payPromised}`);
      if (e.payReceived) lines.push(`  ${lang === 'ko' ? '지급' : 'Received'}: ₩${e.payReceived}`);
      const p = parseFloat(e.payPromised.replace(/,/g, '')) || 0;
      const r = parseFloat(e.payReceived.replace(/,/g, '')) || 0;
      if (p > r) lines.push(`  ${lang === 'ko' ? '⚠️ 미지급' : '⚠️ Unpaid'}: ₩${(p - r).toLocaleString()}`);
      if (e.note) lines.push(`  ${lang === 'ko' ? '메모' : 'Note'}: ${e.note}`);
      lines.push('');
    });

    lines.push('-'.repeat(40));
    lines.push(lang === 'ko'
      ? '이 문서는 노동부 진정 또는 노무사 상담에 활용할 수 있습니다.'
      : 'This document can be used for a labor complaint or 노무사 consultation.');
    lines.push(lang === 'ko' ? '고용노동부: ☎1350 · labor.moel.go.kr' : 'Ministry of Labor: ☎1350 · labor.moel.go.kr');
    lines.push(lang === 'ko' ? '외국인 노동자: ☎1644-0644 · ☎1345' : 'Migrant workers: ☎1644-0644 · ☎1345');
    lines.push('');
    lines.push(lang === 'ko' ? `내보낸 날짜: ${new Date().toLocaleString('ko-KR')}` : `Exported: ${new Date().toLocaleString('en-GB')}`);

    Share.share({
      title,
      message: lines.join('\n'),
    });
  };

  // Summary totals
  const totalPromised = entries.reduce((s, e) => s + (parseFloat(e.payPromised.replace(/,/g, '')) || 0), 0);
  const totalReceived = entries.reduce((s, e) => s + (parseFloat(e.payReceived.replace(/,/g, '')) || 0), 0);
  const totalUnpaid = totalPromised - totalReceived;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
            <Text style={styles.backText}>← {lang === 'ko' ? '뒤로' : 'Back'}</Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{lang === 'ko' ? '근무 일지' : 'Work Logbook'}</Text>
              <Text style={styles.subtitle}>
                {lang === 'ko' ? '근무 기록을 저장해 증거 자료로 활용하세요.' : 'Track your shifts to build an evidence record.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport} accessibilityRole="button">
              <Text style={styles.exportBtnText}>{lang === 'ko' ? '📤 내보내기' : '📤 Export'}</Text>
            </TouchableOpacity>
          </View>

          {/* Summary banner */}
          {entries.length > 0 && (
            <View style={[styles.summaryCard, totalUnpaid > 0 && styles.summaryCardWarn]}>
              <Text style={styles.summaryTitle}>
                {lang === 'ko' ? `총 ${entries.length}건 기록` : `${entries.length} shifts recorded`}
              </Text>
              {totalUnpaid > 0 && (
                <Text style={styles.summaryUnpaid}>
                  {lang === 'ko' ? `⚠️ 미지급 합계: ₩${totalUnpaid.toLocaleString()}` : `⚠️ Total unpaid: ₩${totalUnpaid.toLocaleString()}`}
                </Text>
              )}
              {totalUnpaid === 0 && totalReceived > 0 && (
                <Text style={styles.summaryOk}>
                  {lang === 'ko' ? `✅ 지급 확인됨: ₩${totalReceived.toLocaleString()}` : `✅ All paid: ₩${totalReceived.toLocaleString()}`}
                </Text>
              )}
            </View>
          )}

          {/* Add entry toggle */}
          <TouchableOpacity
            style={styles.addToggle}
            onPress={() => setShowAdd(!showAdd)}
            accessibilityRole="button"
          >
            <Text style={styles.addToggleText}>
              {showAdd
                ? (lang === 'ko' ? '▲ 닫기' : '▲ Close')
                : (lang === 'ko' ? '+ 근무 기록 추가' : '+ Add shift record')}
            </Text>
          </TouchableOpacity>

          {showAdd && <AddEntryForm lang={lang} onAdd={handleAdd} />}

          {/* Entries */}
          {loading ? (
            <Text style={styles.loadingText}>{lang === 'ko' ? '불러오는 중...' : 'Loading...'}</Text>
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📓</Text>
              <Text style={styles.emptyTitle}>{lang === 'ko' ? '기록이 없습니다' : 'No records yet'}</Text>
              <Text style={styles.emptyBody}>
                {lang === 'ko'
                  ? '근무 날짜, 시간, 약속 임금과 실제 지급 금액을 기록해두세요. 노동부 진정이나 노무사 상담에 활용할 수 있습니다.'
                  : 'Record your shifts, hours, and pay. This creates an evidence log you can use for a labor complaint or 노무사 consultation.'}
              </Text>
            </View>
          ) : (
            entries.map((e) => (
              <EntryRow key={e.id} entry={e} lang={lang} onDelete={() => handleDelete(e.id)} />
            ))
          )}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>{lang === 'ko' ? '💡 이 일지로 할 수 있는 것' : '💡 What this logbook is for'}</Text>
            <Text style={styles.tipBody}>
              {lang === 'ko'
                ? '• 내보내기 → 노동부 진정 자료\n• 미지급 금액 자동 계산\n• 노무사 상담 전 정리 자료\n• 모든 데이터는 기기에만 저장됩니다'
                : '• Export → evidence for a labor complaint\n• Auto-calculates unpaid amounts\n• Summary for a 노무사 consultation\n• All data stored only on your device'}
            </Text>
          </View>

          <Banner />
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  backBtn: { marginBottom: spacing.base },
  backText: { ...typography.bodyM, color: colors.action },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.base, gap: spacing.sm },
  title: { ...typography.headingL, color: colors.text, fontWeight: '700', marginBottom: 2 },
  subtitle: { ...typography.bodyS, color: colors.textSecondary },
  exportBtn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  exportBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },

  summaryCard: {
    backgroundColor: colors.selectedBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryCardWarn: { backgroundColor: '#FEF3C7' },
  summaryTitle: { ...typography.bodyS, color: colors.text, fontWeight: '700' },
  summaryUnpaid: { ...typography.bodyS, color: '#92400E', fontWeight: '700', marginTop: 4 },
  summaryOk: { ...typography.bodyS, color: '#065F46', marginTop: 4 },

  addToggle: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.action,
    alignItems: 'center',
  },
  addToggleText: { ...typography.bodyM, color: colors.action, fontWeight: '700' },

  addCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadow.card,
  },
  addTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },

  row: { flexDirection: 'row', marginBottom: spacing.xs },
  inputGroup: { marginBottom: spacing.sm },
  inputLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyM,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputMulti: { height: 60, textAlignVertical: 'top', paddingTop: spacing.sm },
  addBtn: {
    backgroundColor: colors.action,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addBtnText: { ...typography.bodyM, color: colors.white, fontWeight: '700' },

  entryRow: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
  entryDate: { ...typography.bodyS, color: colors.text, fontWeight: '700', flex: 1 },
  unpaidBadge: { backgroundColor: '#FEF3C7', borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  unpaidBadgeText: { fontSize: 10, color: '#92400E', fontWeight: '700' },
  deleteBtn: { padding: 4, marginLeft: spacing.xs },
  deleteBtnText: { fontSize: 18, color: colors.textCaption, lineHeight: 20 },
  entryMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: 2 },
  entryDetail: { ...typography.caption, color: colors.textSecondary },
  unpaidText: { color: '#92400E', fontWeight: '600' },
  entryNote: { ...typography.caption, color: colors.textCaption, fontStyle: 'italic', marginTop: 4 },

  loadingText: { ...typography.bodyM, color: colors.textSecondary, textAlign: 'center', padding: spacing.xl },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyTitle: { ...typography.bodyM, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  emptyBody: { ...typography.bodyS, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  tipCard: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  tipTitle: { ...typography.bodyS, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  tipBody: { ...typography.bodyS, color: colors.textSecondary, lineHeight: 22 },
});
