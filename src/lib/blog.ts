import type { ImageMetadata } from 'astro';
import type { Post } from './content';
import { t, type Locale, type UiKeyOf } from './i18n';

const known = ['reading', 'paper', 'ideas', 'daily'] as const;

export function categoryLabel(category: string, locale: Locale): string {
  return (known as readonly string[]).includes(category)
    ? t(locale, `blog.cat.${category}` as UiKeyOf<'blog.cat.'>)
    : category;
}

/** Categories in a stable order: the three defaults first, then any custom ones. */
export function blogCategories(posts: Post[]): string[] {
  const used = new Set(posts.map((p) => p.data.category));
  return [...known.filter((c) => used.has(c)), ...[...used].filter((c) => !(known as readonly string[]).includes(c)).sort()];
}

export function tagCounts(posts: Post[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const tag of p.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const tagSlug = (tag: string) => tag.trim().toLowerCase().replace(/[\s/]+/g, '-');

const images = import.meta.glob<ImageMetadata>('/src/content/blog/**/*.{png,jpg,jpeg,webp,gif,avif}', {
  eager: true,
  import: 'default',
});

/** Resolve a post's `cover`: a public path/URL stays a string, a file next to the post becomes an optimizable asset. */
export function resolveCover(post: Post): ImageMetadata | string | undefined {
  const cover = post.data.cover;
  if (!cover) return undefined;
  if (/^(https?:)?\//.test(cover)) return cover;
  return images[`/src/content/blog/${post.id}/${cover.replace(/^\.\//, '')}`];
}
