import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Hardcoded fallback — used when Supabase is unreachable (offline / first launch)
export const CONFIG_FALLBACK: Record<string, string> = {
  minimum_wage_hourly:   '10320',
  minimum_wage_monthly:  '2156880',
  minimum_wage_year:     '2026',
  minimum_wage_source:   'minimumwage.go.kr',
  law_date_근로기준법:         '2024-01-01',
  law_date_최저임금법:         '2024-01-01',
  law_date_산업재해보상보험법:  '2024-01-01',
  law_date_산업안전보건법:      '2024-01-01',
  law_date_근로자퇴직급여보장법: '2024-01-01',
  law_date_외국인고용법:        '2024-01-01',
  last_sync_at: '',
};

export type AppConfig = typeof CONFIG_FALLBACK;

let _cache: AppConfig | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(_cache ?? CONFIG_FALLBACK);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    const now = Date.now();
    if (_cache && now - _cacheTime < CACHE_TTL_MS) {
      setConfig(_cache);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('key, value');
        if (!error && data && data.length > 0) {
          const map: AppConfig = { ...CONFIG_FALLBACK };
          data.forEach((row: { key: string; value: string }) => {
            map[row.key] = row.value;
          });
          _cache = map;
          _cacheTime = Date.now();
          setConfig(map);
        }
      } catch {
        // network unavailable — keep fallback values
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived helpers
  const minWageHourly   = parseInt(config.minimum_wage_hourly ?? '10320', 10);
  const minWageMonthly  = parseInt(config.minimum_wage_monthly ?? '2156880', 10);
  const minWageYear     = config.minimum_wage_year ?? '2026';

  function lawDate(statuteKo: string): string {
    const raw = config[`law_date_${statuteKo}`];
    if (!raw) return '';
    // Format: "2024-01-01" → "2024. 1. 1."
    const [y, m, d] = raw.split('-');
    return `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}.`;
  }

  return { config, loading, minWageHourly, minWageMonthly, minWageYear, lawDate };
}
