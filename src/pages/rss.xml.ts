import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getListedPosts, getProfile } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const [posts, profile] = await Promise.all([getListedPosts(), getProfile('en')]);
  return rss({
    title: `${profile.name} — Blog`,
    description: 'Reading notes, paper notes and ideas.',
    site: site!,
    items: posts
      .filter((p) => !p.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
        categories: [post.data.category, ...post.data.tags],
      })),
    customData: '<language>zh-TW</language>',
  });
};
