import { z } from 'astro/zod';

/**
 * Sveltia CMS can write `null`, `''` or `[]` for fields that were cleared.
 * Strip those before validation so optional fields stay optional and
 * per-field locale fallback (see `src/lib/localize.ts`) works.
 */
export function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined || v === '') continue;
      if (Array.isArray(v) && v.length === 0) continue;
      out[k] = stripEmpty(v);
    }
    return out;
  }
  return value;
}

/**
 * Deep partial *without* defaults, for translations. Zod's `.partial()` still
 * applies `.default()`s, which would let an untranslated `featured: false`
 * override the English `featured: true` during locale fallback.
 */
export function translationOf<T extends z.ZodObject>(schema: T): z.ZodType<DeepPartial<z.infer<T>>> {
  const loosen = (field: z.ZodType): z.ZodType => {
    let f = field;
    while (f instanceof z.ZodDefault || f instanceof z.ZodOptional) f = f.unwrap() as z.ZodType;
    if (f instanceof z.ZodObject) f = translationOf(f);
    return f.optional();
  };
  const shape = Object.fromEntries(
    Object.entries(schema.shape).map(([k, v]) => [k, loosen(v as z.ZodType)]),
  );
  return z.object(shape) as unknown as z.ZodType<DeepPartial<z.infer<T>>>;
}

export type DeepPartial<T> = T extends Date | unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** A YAML entry stored as `{ en: {...}, zh-TW: {...} }` (Sveltia i18n `single_file`). */
export const i18nYaml = <T extends z.ZodObject>(schema: T) =>
  z.object({
    en: z.preprocess(stripEmpty, schema),
    'zh-TW': z.preprocess(stripEmpty, translationOf(schema)).optional(),
  });

const strings = z.array(z.string()).default([]);
const link = z.object({ label: z.string(), url: z.string() });

export const profileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  tagline: z.string().optional(),
  affiliation: z.string().optional(),
  bio: z.string(),
  about: z.string().optional(),
  resumeSummary: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  motto: z.string().optional(),
  interests: strings,
  nameVariants: strings,
});

export const socialsSchema = z.preprocess(
  stripEmpty,
  z.object({
    items: z
      .array(
        z.object({
          platform: z.string(),
          label: z.string(),
          url: z.string(),
          showInHero: z.boolean().default(true),
          showOnResume: z.boolean().default(false),
          hidden: z.boolean().default(false),
        }),
      )
      .default([]),
  }),
);

export const palettes = ['ocean', 'lagoon', 'petrol', 'graphite', 'graphite-teal', 'slate'] as const;

/** Heading color used by the resume PDF for each palette (light-mode accent). */
export const paletteAccent: Record<(typeof palettes)[number], string> = {
  ocean: '#0e7490',
  lagoon: '#0f766e',
  petrol: '#155e75',
  graphite: '#18181b',
  'graphite-teal': '#0e7490',
  slate: '#334155',
};

export const settingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  footer: z.string().optional(),
  palette: z.enum(palettes).default('ocean'),
  analytics: z
    .object({
      provider: z.enum(['none', 'goatcounter', 'umami', 'cloudflare', 'google']).default('none'),
      id: z.string().optional(),
      scriptUrl: z.string().optional(),
    })
    .default({ provider: 'none' }),
});

export const resumeSectionSources = [
  'summary',
  'education',
  'experience',
  'publications',
  'category',
  'skills',
] as const;

export const resumeLayoutSchema = z.preprocess(
  stripEmpty,
  z.object({
    sections: z
      .array(
        z.object({
          source: z.enum(resumeSectionSources),
          category: z.string().optional(),
          titleEn: z.string().optional(),
          titleZh: z.string().optional(),
        }),
      )
      .default([]),
  }),
);

export const categorySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  resumeTitle: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().default(0),
  layout: z.enum(['cards', 'list']).default('cards'),
  showOnHome: z.boolean().default(true),
});

export const showcaseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  ongoing: z.boolean().default(false),
  role: z.string().optional(),
  org: z.string().optional(),
  location: z.string().optional(),
  tags: strings,
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  links: z.array(link).default([]),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  draft: z.boolean().default(false),
  resume: z
    .object({
      include: z.boolean().default(false),
      order: z.number().default(0),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      bullets: strings,
    })
    .optional(),
});

export const educationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  location: z.string().optional(),
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
  expected: z.boolean().default(false),
  gpa: z.string().optional(),
  courses: z.string().optional(),
  bullets: strings,
  url: z.string().optional(),
  order: z.number().default(0),
});

export const experienceSchema = z.object({
  org: z.string(),
  role: z.string(),
  type: z.enum(['research', 'work', 'leadership', 'teaching', 'other']).default('work'),
  location: z.string().optional(),
  start: z.coerce.date(),
  end: z.coerce.date().optional(),
  current: z.boolean().default(false),
  url: z.string().optional(),
  bullets: strings,
  tags: strings,
  showOnResume: z.boolean().default(true),
  order: z.number().default(0),
});

export const newsSchema = z.object({
  date: z.coerce.date(),
  text: z.string(),
  link: z.string().optional(),
});

export const skillGroupSchema = z.object({
  group: z.string(),
  items: strings,
  order: z.number().default(0),
});

export const publicationSchema = z.preprocess(
  stripEmpty,
  z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    venueShort: z.string().optional(),
    year: z.coerce.number(),
    status: z.enum(['preprint', 'submitted', 'under-review', 'accepted', 'published']).default('published'),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint', 'thesis']).default('conference'),
    note: z.string().optional(),
    abstract: z.string().optional(),
    links: z
      .object({
        pdf: z.string().optional(),
        arxiv: z.string().optional(),
        code: z.string().optional(),
        project: z.string().optional(),
        video: z.string().optional(),
        slides: z.string().optional(),
        doi: z.string().optional(),
      })
      .default({}),
    bibtex: z.string().optional(),
    showcase: z.string().optional(),
    selected: z.boolean().default(false),
    showOnResume: z.boolean().default(true),
  }),
);

export const blogSchema = z.preprocess(
  stripEmpty,
  z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    lang: z.enum(['en', 'zh-TW']).default('zh-TW'),
    category: z.string().default('ideas'),
    tags: strings,
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    /** Live at its URL but left out of lists, tags, RSS, search and the sitemap — for previewing. */
    unlisted: z.boolean().default(false),
    obsidian: z.object({ source: z.string(), hash: z.string() }).optional(),
  }),
);
