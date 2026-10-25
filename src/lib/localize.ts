import type { Locale } from './i18n';

const isEmpty = (v: unknown) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

/**
 * Per-field locale fallback: start from the English value and overlay every
 * non-empty translated field. Nested objects merge recursively; arrays are
 * replaced as a whole (a translated bullet list replaces the English one).
 */
export function overlay<T>(base: T, translation: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(translation)) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(translation)) {
    if (isEmpty(value)) continue;
    const current = out[key];
    out[key] = isPlainObject(current) && isPlainObject(value) ? overlay(current, value) : value;
  }
  return out as T;
}

/** Resolve a `{ en, zh-TW }` YAML entry for a locale. */
export function localize<T>(data: { en: T; 'zh-TW'?: unknown }, locale: Locale): T {
  return locale === 'en' ? data.en : overlay(data.en, data['zh-TW']);
}
