import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ── Content filter (first line of defence before a post/comment is submitted) ──
// Store-compliance requirement: UGC apps must filter objectionable content.
// Server-side AI moderation is planned; this client-side check blocks the
// obvious cases (profanity, scams, personal data) at the point of writing.
const BANNED_PATTERNS: { re: RegExp; reasonKo: string; reasonEn: string }[] = [
  {
    re: /(시발|씨발|씨빨|병신|지랄|좆|개새끼|새끼야|미친놈|미친년|엿먹|꺼져라)/i,
    reasonKo: '욕설이 포함되어 있습니다. 표현을 수정해 주세요.',
    reasonEn: 'Contains abusive language. Please edit your text.',
  },
  {
    re: /(고수익\s*알바|당일\s*지급.*문의|텔레그램\s*@|리딩방|코인\s*투자\s*방|대출\s*문의|급전\s*필요.*연락)/i,
    reasonKo: '스팸·사기 광고로 의심되는 내용이 포함되어 있습니다.',
    reasonEn: 'Content looks like spam or a scam advertisement.',
  },
  {
    re: /\d{6}[-\s]?[1-4]\d{6}/,
    reasonKo: '주민등록번호로 보이는 숫자가 포함되어 있습니다. 개인정보는 절대 올리지 마세요.',
    reasonEn: 'This looks like a national ID number. Never post personal identification data.',
  },
];

/** Returns a bilingual rejection reason if the text violates content rules, else null. */
export function checkContent(text: string, lang: 'ko' | 'en'): string | null {
  for (const p of BANNED_PATTERNS) {
    if (p.re.test(text)) return lang === 'ko' ? p.reasonKo : p.reasonEn;
  }
  return null;
}

// ── Reporting ────────────────────────────────────────────────────────────────
export type ReportReason = 'spam' | 'abuse' | 'scam' | 'privacy' | 'other';

export const REPORT_REASONS: { id: ReportReason; ko: string; en: string }[] = [
  { id: 'spam', ko: '스팸·광고', en: 'Spam / ads' },
  { id: 'abuse', ko: '욕설·혐오', en: 'Abuse / hate' },
  { id: 'scam', ko: '사기·구인사기', en: 'Scam / fake job' },
  { id: 'privacy', ko: '개인정보 노출', en: 'Personal info' },
  { id: 'other', ko: '기타', en: 'Other' },
];

export async function submitReport(params: {
  targetType: 'post' | 'comment';
  targetId: string;
  reason: ReportReason;
  reporterId?: string | null;
}): Promise<boolean> {
  const { error } = await supabase.from('reports').insert({
    target_type: params.targetType,
    target_id: params.targetId,
    reason: params.reason,
    reporter_id: params.reporterId ?? null,
  });
  return !error;
}

// ── Block list (on-device, works for guests too) ─────────────────────────────
const BLOCK_KEY = 'juro_blocked_users_v1';

export async function getBlockedIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(BLOCK_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export async function blockUser(userId: string): Promise<void> {
  const ids = await getBlockedIds();
  ids.add(userId);
  await AsyncStorage.setItem(BLOCK_KEY, JSON.stringify([...ids]));
}

export async function unblockUser(userId: string): Promise<void> {
  const ids = await getBlockedIds();
  ids.delete(userId);
  await AsyncStorage.setItem(BLOCK_KEY, JSON.stringify([...ids]));
}
