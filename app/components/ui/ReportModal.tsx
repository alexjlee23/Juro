import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { REPORT_REASONS, ReportReason, submitReport } from '../../lib/moderation';

type Target = { type: 'post' | 'comment'; id: string } | null;

/**
 * Bottom-sheet style report dialog (store compliance: UGC content reporting).
 * Reports are reviewed within 24 hours; content that violates the rules is removed.
 */
export default function ReportModal({
  target, reporterId, lang, onClose, onReported,
}: {
  target: Target;
  reporterId?: string | null;
  lang: 'ko' | 'en';
  onClose: () => void;
  /** Called after a report is accepted — hide the content from this user's feed immediately. */
  onReported?: (target: { type: 'post' | 'comment'; id: string }) => void;
}) {
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const t = (ko: string, en: string) => (lang === 'ko' ? ko : en);

  function close() {
    setSelected(null);
    setState('idle');
    onClose();
  }

  async function handleSubmit() {
    if (!target || !selected) return;
    setState('sending');
    const ok = await submitReport({
      targetType: target.type,
      targetId: target.id,
      reason: selected,
      reporterId,
    });
    if (ok) onReported?.(target);
    setState(ok ? 'done' : 'error');
  }

  return (
    <Modal visible={!!target} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {state === 'done' ? (
            <>
              <Text style={styles.title}>✅ {t('신고가 접수되었습니다', 'Report received')}</Text>
              <Text style={styles.body}>
                {t(
                  '이 콘텐츠는 회원님의 화면에서 즉시 숨겨졌습니다. 24시간 이내에 검토하며, 규칙을 위반한 콘텐츠는 삭제되고 작성자 계정은 정지됩니다. 문의: help@jurio.dev',
                  'This content has been hidden from your feed immediately. We review reports within 24 hours; violating content is removed and the author\'s account suspended. Contact: help@jurio.dev'
                )}
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={close} accessibilityRole="button">
                <Text style={styles.primaryBtnText}>{t('닫기', 'Close')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                🚩 {target?.type === 'comment' ? t('댓글 신고', 'Report comment') : t('게시글 신고', 'Report post')}
              </Text>
              <Text style={styles.body}>
                {t('신고 사유를 선택해 주세요.', 'Choose a reason for the report.')}
              </Text>

              {REPORT_REASONS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.reason, selected === r.id && styles.reasonSelected]}
                  onPress={() => setSelected(r.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selected === r.id }}
                >
                  <View style={[styles.radio, selected === r.id && styles.radioOn]} />
                  <Text style={[styles.reasonText, selected === r.id && styles.reasonTextSelected]}>
                    {lang === 'ko' ? r.ko : r.en}
                  </Text>
                </TouchableOpacity>
              ))}

              {state === 'error' && (
                <Text style={styles.errorText}>
                  {t('전송에 실패했습니다. 다시 시도해 주세요.', 'Failed to send. Please try again.')}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, (!selected || state === 'sending') && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={!selected || state === 'sending'}
                accessibilityRole="button"
              >
                {state === 'sending'
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={styles.primaryBtnText}>{t('신고하기', 'Submit report')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={close} accessibilityRole="button">
                <Text style={styles.secondaryBtnText}>{t('취소', 'Cancel')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(11,29,58,0.45)', justifyContent: 'center', padding: spacing.base },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.base,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  title: { ...typography.bodyL, color: colors.text, fontWeight: '700', marginBottom: spacing.xs },
  body: { ...typography.bodyS, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  reason: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  reasonSelected: { borderColor: colors.action, backgroundColor: colors.selectedBg },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  radioOn: { borderColor: colors.action, backgroundColor: colors.action },
  reasonText: { ...typography.bodyS, color: colors.text },
  reasonTextSelected: { color: colors.action, fontWeight: '700' },
  errorText: { ...typography.caption, color: '#B42318', marginBottom: spacing.xs },
  primaryBtn: {
    backgroundColor: colors.action, borderRadius: radius.sm,
    paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm,
  },
  primaryBtnText: { ...typography.bodyS, color: colors.white, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  secondaryBtn: { paddingVertical: spacing.md, alignItems: 'center' },
  secondaryBtnText: { ...typography.bodyS, color: colors.textSecondary, fontWeight: '600' },
});
