import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCallouts from 'rehype-callouts';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkMath from 'remark-math';
import studio from './integrations/studio';
import remarkMark from './src/plugins/remark-mark';
import remarkObsidianEmbeds from './src/plugins/remark-obsidian-embeds';
import remarkStripComments from './src/plugins/remark-strip-comments';

export default defineConfig({
  site: 'https://shixuanlin1009.github.io',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !/\/(admin|__studio)\//.test(page),
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hant-TW' } },
    }),
    studio(),
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri processor; remark/rehype plugins need `unified()`.
    processor: unified({
      remarkPlugins: [remarkStripComments, remarkMark, remarkMath, remarkObsidianEmbeds],
      rehypePlugins: [
        rehypeKatex,
        [rehypeCallouts, { theme: 'obsidian' }],
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1, dataPagefindIgnore: '' },
            content: { type: 'text', value: '#' },
          },
        ],
      ],
    }),
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] },
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
  image: {
    layout: 'constrained',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
