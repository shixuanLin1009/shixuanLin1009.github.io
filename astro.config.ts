import { existsSync, readdirSync, readFileSync } from 'node:fs';
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
import rehypeHeadingLevels from './src/plugins/rehype-heading-levels';
import remarkMark from './src/plugins/remark-mark';
import remarkObsidianEmbeds from './src/plugins/remark-obsidian-embeds';
import remarkStripComments from './src/plugins/remark-strip-comments';

// Unlisted blog posts (`unlisted: true`) stay out of the sitemap.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const unlisted = readdirSync(blogDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/index.md`, blogDir)))
  .filter((d) => {
    const frontmatter = readFileSync(new URL(`${d.name}/index.md`, blogDir), 'utf8').split(/^---\s*$/m)[1] ?? '';
    return /^unlisted:\s*true\s*$/m.test(frontmatter);
  })
  .map((d) => `/blog/${d.name}/`);

export default defineConfig({
  site: 'https://shixuanlin1009.github.io',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !/\/(admin|__studio)\//.test(page) && !unlisted.some((path) => page.endsWith(path)),
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hant-TW' } },
    }),
    studio(),
  ],
  markdown: {
    // Astro 7 defaults to the Sätteri processor; remark/rehype plugins need `unified()`.
    processor: unified({
      remarkPlugins: [remarkStripComments, remarkMark, remarkMath, remarkObsidianEmbeds],
      rehypePlugins: [
        rehypeHeadingLevels,
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
