import { ui, type UiKey } from '../i18n/ui';

export type UiKeyOf<P extends string> = Extract<UiKey, `${P}${string}`>;

export const locales = ['en', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** URL prefix per locale; English lives at the site root. */
const prefixes: Record<Locale, string> = { en: '', 'zh-TW': '/zh' };

export const htmlLang: Record<Locale, string> = { en: 'en', 'zh-TW': 'zh-Hant-TW' };

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function getLocale(url: URL): Locale {
  const path = url.pathname.slice(base.length);
  return path === '/zh' || path.startsWith('/zh/') ? 'zh-TW' : 'en';
}

/** Build a site URL for `path` (e.g. `/resume/`) in the given locale. */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${prefixes[locale]}${clean}`.replace(/\/{2,}/g, '/') || '/';
}

/** The same page in another locale. Blog posts are single-language, so they map to the blog index. */
export function switchLocalePath(url: URL, target: Locale): string {
  let path = url.pathname.slice(base.length) || '/';
  if (path === '/zh' || path.startsWith('/zh/')) path = path.slice(3) || '/';
  if (/^\/blog\/(?!tags\/)[^/]+\/?$/.test(path)) path = '/blog/';
  return localePath(path, target);
}

export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  let s: string = ui[locale][key] ?? ui.en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

const monthFmt = {
  en: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' }),
  'zh-TW': new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'numeric', timeZone: 'UTC' }),
};
const dayFmt = {
  en: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
  'zh-TW': new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }),
};

export const formatMonth = (d: Date, locale: Locale) => monthFmt[locale].format(d);
export const formatDay = (d: Date, locale: Locale) => dayFmt[locale].format(d);
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function formatRange(
  start: Date,
  end: Date | undefined,
  locale: Locale,
  opts: { current?: boolean; expected?: boolean } = {},
): string {
  const from = formatMonth(start, locale);
  if (!end) return opts.current ? `${from} – ${t(locale, 'date.present')}` : from;
  const to = formatMonth(end, locale) + (opts.expected ? ` (${t(locale, 'date.expected')})` : '');
  return from === to ? from : `${from} – ${to}`;
}
