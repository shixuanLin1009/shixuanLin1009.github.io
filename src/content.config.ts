import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  blogSchema,
  categorySchema,
  educationSchema,
  experienceSchema,
  i18nYaml,
  newsSchema,
  profileSchema,
  publicationSchema,
  resumeLayoutSchema,
  settingsSchema,
  showcaseSchema,
  skillGroupSchema,
  socialsSchema,
  translationOf,
} from './schemas';

// Entry ids are file paths without extension (and without a trailing `/index`),
// so ids never depend on a frontmatter `slug` field and match Sveltia's file names.
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\\/g, '/').replace(/(\/index)?\.(md|ya?ml)$/i, '');

const yamlFolder = (folder: string) =>
  glob({ pattern: '*.{yml,yaml}', base: `./src/content/${folder}`, generateId });

const singleton = (name: string) =>
  glob({ pattern: `${name}.{yml,yaml}`, base: './src/content/singletons', generateId });

export const collections = {
  // Singletons — one YAML file each, `en:` + `zh-TW:` blocks (Sveltia i18n `single_file`).
  profile: defineCollection({ loader: singleton('profile'), schema: i18nYaml(profileSchema) }),
  socials: defineCollection({ loader: singleton('socials'), schema: socialsSchema }),
  settings: defineCollection({ loader: singleton('settings'), schema: i18nYaml(settingsSchema) }),
  resumeLayout: defineCollection({ loader: singleton('resume'), schema: resumeLayoutSchema }),

  // Folder collections of YAML entries (Sveltia i18n `single_file`).
  categories: defineCollection({ loader: yamlFolder('categories'), schema: i18nYaml(categorySchema) }),
  education: defineCollection({ loader: yamlFolder('education'), schema: i18nYaml(educationSchema) }),
  experience: defineCollection({ loader: yamlFolder('experience'), schema: i18nYaml(experienceSchema) }),
  news: defineCollection({ loader: yamlFolder('news'), schema: i18nYaml(newsSchema) }),
  skills: defineCollection({ loader: yamlFolder('skills'), schema: i18nYaml(skillGroupSchema) }),
  publications: defineCollection({ loader: yamlFolder('publications'), schema: publicationSchema }),

  // Showcase items have Markdown bodies, so each locale is its own file (Sveltia `multiple_folders`).
  showcase: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/showcase/en', generateId }),
    schema: showcaseSchema,
  }),
  showcaseZh: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/showcase/zh-TW', generateId }),
    schema: translationOf(showcaseSchema),
  }),

  // Blog posts are single-language: `blog/<slug>/index.md` with images next to them.
  blog: defineCollection({
    loader: glob({ pattern: '**/index.md', base: './src/content/blog', generateId }),
    schema: blogSchema,
  }),
};
