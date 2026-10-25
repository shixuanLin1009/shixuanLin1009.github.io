import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { formatRange, t, type Locale, type UiKeyOf } from './i18n';
import { localize, overlay } from './localize';
import { paletteAccent } from '../schemas';

const showDrafts = import.meta.env.DEV;

const byOrderThenDate = <T extends { order?: number }>(date: (x: T) => Date | undefined) => (a: T, b: T) =>
  (a.order ?? 0) - (b.order ?? 0) || (date(b)?.getTime() ?? 0) - (date(a)?.getTime() ?? 0);

async function singleton<C extends 'profile' | 'settings' | 'socials' | 'resumeLayout'>(collection: C, id: string) {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`Missing singleton src/content/singletons/${id}.yaml`);
  return entry.data as CollectionEntry<C>['data'];
}

export const getProfile = async (locale: Locale) => localize(await singleton('profile', 'profile'), locale);
export const getSettings = async (locale: Locale) => localize(await singleton('settings', 'settings'), locale);
export const getSocials = async () => (await singleton('socials', 'socials')).items.filter((s) => !s.hidden);

export async function getCategories(locale: Locale) {
  const entries = await getCollection('categories');
  return entries
    .map((e) => ({ id: e.id, ...localize(e.data, locale) }))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
export type Category = Awaited<ReturnType<typeof getCategories>>[number];

export async function getShowcase(locale: Locale) {
  const [en, zh] = await Promise.all([getCollection('showcase'), getCollection('showcaseZh')]);
  const zhById = new Map(zh.map((e) => [e.id, e]));
  return en
    .filter((e) => showDrafts || !e.data.draft)
    .map((entry) => {
      const translation = zhById.get(entry.id);
      const data = locale === 'zh-TW' ? overlay(entry.data, translation?.data) : entry.data;
      return { id: entry.id, ...data, entry, translation };
    })
    .sort(byOrderThenDate((x) => x.date));
}
export type ShowcaseItem = Awaited<ReturnType<typeof getShowcase>>[number];

/** Render the translated body when it exists, otherwise the English one. */
export function renderShowcase(item: ShowcaseItem, locale: Locale) {
  const useZh = locale === 'zh-TW' && item.translation?.body?.trim();
  return render(useZh ? item.translation! : item.entry);
}

export async function getEducation(locale: Locale) {
  return (await getCollection('education'))
    .map((e) => ({ id: e.id, ...localize(e.data, locale) }))
    .sort(byOrderThenDate((x) => x.start));
}

export async function getExperience(locale: Locale) {
  return (await getCollection('experience'))
    .map((e) => ({ id: e.id, ...localize(e.data, locale) }))
    .sort(byOrderThenDate((x) => x.start));
}

export async function getNews(locale: Locale) {
  return (await getCollection('news'))
    .map((e) => ({ id: e.id, ...localize(e.data, locale) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getSkills(locale: Locale) {
  return (await getCollection('skills'))
    .map((e) => ({ id: e.id, ...localize(e.data, locale) }))
    .sort((a, b) => a.order - b.order);
}

export async function getPublications() {
  const profile = await singleton('profile', 'profile');
  const self = new Set([profile.en.name, ...profile.en.nameVariants].map((n) => n.toLowerCase()));
  return (await getCollection('publications'))
    .map((e) => ({
      id: e.id,
      ...e.data,
      authorList: e.data.authors.map((name) => ({ name: name.replace(/\*/g, ''), self: self.has(name.replace(/\*/g, '').toLowerCase()), equal: name.endsWith('*') })),
    }))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}
export type Publication = Awaited<ReturnType<typeof getPublications>>[number];

export async function getPosts() {
  return (await getCollection('blog', (e) => showDrafts || !e.data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}
export type Post = Awaited<ReturnType<typeof getPosts>>[number];

/** CJK text is counted per character (~400/min), latin per word (~220/min). */
export function readingMinutes(body = ''): number {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
  const cjk = (text.match(/[㐀-鿿豈-﫿]/g) ?? []).length;
  const words = (text.replace(/[㐀-鿿豈-﫿]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}

// ---------------------------------------------------------------------------
// Resume — one structure feeds both the /resume page and the Typst PDF.
// ---------------------------------------------------------------------------

const defaultSections = [
  { source: 'summary' },
  { source: 'education' },
  { source: 'experience' },
  { source: 'publications' },
  { source: 'category', category: 'research' },
  { source: 'category', category: 'projects' },
  { source: 'category', category: 'competitions' },
  { source: 'category', category: 'certificates' },
  { source: 'skills' },
] as const;

export type ResumeEntry = {
  title: string;
  subtitle?: string;
  location?: string;
  dates?: string;
  url?: string;
  detail?: string;
  bullets: string[];
};
export type ResumeSection =
  | { kind: 'summary'; title: string; text: string }
  | { kind: 'entries'; title: string; items: ResumeEntry[] }
  | { kind: 'publications'; title: string; items: { title: string; authors: { name: string; self: boolean }[]; venue: string; status: string; note?: string; url?: string }[] }
  | { kind: 'skills'; title: string; items: { group: string; items: string[] }[] };

export async function getResumeData(locale: Locale, site: URL | undefined) {
  const [profile, socials, layout, categories, showcase, education, experience, publications, skills] =
    await Promise.all([
      getProfile(locale),
      getSocials(),
      singleton('resumeLayout', 'resume'),
      getCategories(locale),
      getShowcase(locale),
      getEducation(locale),
      getExperience(locale),
      getPublications(),
      getSkills(locale),
    ]);

  const contact: { label: string; url: string }[] = [];
  if (profile.email) contact.push({ label: profile.email, url: `mailto:${profile.email}` });
  if (site) contact.push({ label: site.host, url: site.href });
  for (const s of socials.filter((s) => s.showOnResume && s.platform !== 'email')) {
    contact.push({ label: s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), url: s.url });
  }

  const sectionTitle = (s: { titleEn?: string; titleZh?: string }, fallback: string) =>
    (locale === 'zh-TW' ? s.titleZh : s.titleEn) || fallback;

  const sections: ResumeSection[] = [];
  const configured = layout.sections.length ? layout.sections : defaultSections;
  for (const s of configured as typeof layout.sections) {
    switch (s.source) {
      case 'summary': {
        const text = profile.resumeSummary ?? profile.bio;
        if (text) sections.push({ kind: 'summary', title: sectionTitle(s, t(locale, 'resume.summary')), text });
        break;
      }
      case 'education':
        sections.push({
          kind: 'entries',
          title: sectionTitle(s, t(locale, 'resume.education')),
          items: education.map((e) => ({
            title: e.degree,
            subtitle: e.school,
            location: e.location,
            dates: formatRange(e.start, e.end, locale, { expected: e.expected }),
            detail: e.courses ? `${t(locale, 'resume.courses')}: ${e.courses}` : undefined,
            bullets: e.bullets,
          })),
        });
        break;
      case 'experience':
        sections.push({
          kind: 'entries',
          title: sectionTitle(s, t(locale, 'resume.experience')),
          items: experience
            .filter((e) => e.showOnResume)
            .map((e) => ({
              title: e.org,
              subtitle: e.role,
              location: e.location,
              dates: formatRange(e.start, e.end, locale, { current: e.current }),
              url: e.url,
              bullets: e.bullets,
            })),
        });
        break;
      case 'publications': {
        const items = publications.filter((p) => p.showOnResume);
        if (items.length)
          sections.push({
            kind: 'publications',
            title: sectionTitle(s, t(locale, 'resume.publications')),
            items: items.map((p) => ({
              title: p.title,
              authors: p.authorList,
              venue: `${p.venueShort ?? p.venue} ${p.year}`,
              status: t(locale, `pub.status.${p.status}` as UiKeyOf<'pub.status.'>),
              note: p.note,
              url: p.links.arxiv ?? p.links.pdf ?? p.links.doi,
            })),
          });
        break;
      }
      case 'category': {
        const cat = categories.find((c) => c.id === s.category);
        const items = showcase
          .filter((i) => i.category === s.category && i.resume?.include)
          .sort((a, b) => (a.resume?.order ?? 0) - (b.resume?.order ?? 0) || b.date.getTime() - a.date.getTime());
        if (cat && items.length)
          sections.push({
            kind: 'entries',
            title: sectionTitle(s, cat.resumeTitle ?? cat.title),
            items: items.map((i) => ({
              title: i.resume?.title ?? i.title,
              subtitle: i.resume?.subtitle ?? i.org,
              location: i.location,
              dates: formatRange(i.date, i.endDate, locale, { current: i.ongoing }),
              bullets: i.resume?.bullets ?? [],
            })),
          });
        break;
      }
      case 'skills':
        if (skills.length)
          sections.push({
            kind: 'skills',
            title: sectionTitle(s, t(locale, 'resume.skills')),
            items: skills.map((g) => ({ group: g.group, items: g.items })),
          });
        break;
    }
  }

  const altName = locale === 'zh-TW' ? (await getProfile('en')).name : undefined;
  const accent = paletteAccent[(await getSettings(locale)).palette];
  return { locale, name: profile.name, altName, headline: profile.headline, accent, contact, sections };
}
export type ResumeData = Awaited<ReturnType<typeof getResumeData>>;
