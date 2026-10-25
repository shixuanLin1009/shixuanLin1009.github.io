/**
 * Obsidian → blog sync.
 *
 * Notes with `publish: true` in their frontmatter become posts in
 * src/content/blog/<slug>/index.md. Only file-level work happens here
 * (choosing notes, resolving [[links]] and ![[attachments]], copying files,
 * stripping %%comments%%); Obsidian syntax such as callouts and ==highlights==
 * is rendered at build time by the site's remark plugins.
 *
 * The vault is never modified. Each post remembers its note (`obsidian.source`)
 * and a hash of what was generated, so a re-sync can tell "changed in Obsidian"
 * from "edited on the site" and refuses to overwrite the latter unless forced.
 *
 *   npm run sync                 # sync new and changed notes
 *   npm run sync -- --dry-run    # only show what would happen
 *   npm run sync -- --force      # also overwrite posts edited on the site
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug as headingSlug } from 'github-slugger';
import matter from 'gray-matter';
import { pinyin } from 'pinyin-pro';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'src', 'content', 'blog');
const videoDir = path.join(root, 'public', 'uploads', 'video');
const filesDir = path.join(root, 'public', 'uploads', 'files');

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
const VIDEO_WARN_BYTES = 50 * 1024 * 1024;
const CATEGORY_ALIASES: Record<string, string> = {
  讀書心得: 'reading',
  閱讀: 'reading',
  論文心得: 'paper',
  論文: 'paper',
  個人發想: 'ideas',
  發想: 'ideas',
};

export type StudioConfig = { vaultPath: string; exclude: string[] };
export type NoteStatus = 'new' | 'changed' | 'synced' | 'conflict' | 'error';
export type NoteReport = {
  source: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  status: NoteStatus;
  warnings: string[];
};
export type RemovedPost = { slug: string; source: string; title: string };
export type ScanResult = { vault: string; notes: NoteReport[]; removed: RemovedPost[] };

type Asset = { from: string; to: string };
type Plan = NoteReport & { content: string; hash: string; assets: Asset[]; previousSlug?: string };

// ---------------------------------------------------------------------------
// config & vault index
// ---------------------------------------------------------------------------

export async function loadConfig(): Promise<StudioConfig> {
  const base = JSON.parse(await readFile(path.join(root, 'studio.config.json'), 'utf8'));
  const localFile = path.join(root, 'studio.config.local.json');
  const local = existsSync(localFile) ? JSON.parse(await readFile(localFile, 'utf8')) : {};
  const config: StudioConfig = { exclude: [], ...base, ...local };
  // GitHub Actions checks the vault out somewhere else (.github/workflows/obsidian-sync.yml).
  if (process.env.VAULT_PATH) config.vaultPath = path.resolve(process.env.VAULT_PATH);
  return config;
}

type VaultIndex = { files: string[]; byName: Map<string, string[]> };

async function indexVault(vault: string, exclude: string[]): Promise<VaultIndex> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const rel = path.relative(vault, path.join(dir, entry.name)).split(path.sep).join('/');
      if (exclude.some((x) => rel === x || rel.startsWith(`${x}/`))) continue;
      if (entry.isDirectory()) await walk(path.join(dir, entry.name));
      else files.push(rel);
    }
  };
  await walk(vault);
  const byName = new Map<string, string[]>();
  const add = (key: string, rel: string) => byName.set(key, [...(byName.get(key) ?? []), rel]);
  for (const rel of files) {
    const name = path.posix.basename(rel).toLowerCase();
    add(name, rel);
    if (name.endsWith('.md')) add(name.slice(0, -3), rel);
  }
  return { files, byName };
}

/** Obsidian-style link resolution: exact path, then same folder, then shortest path. */
function resolve(index: VaultIndex, rawTarget: string, fromNote: string): string | undefined {
  let target = rawTarget.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  try {
    target = decodeURIComponent(target);
  } catch {}
  if (!target) return undefined;
  const lower = target.toLowerCase();
  let candidates: string[];
  if (target.includes('/')) {
    const fromDir = path.posix.dirname(fromNote);
    const relative = path.posix.normalize(path.posix.join(fromDir, target)).toLowerCase();
    candidates = index.files.filter((f) => {
      const l = f.toLowerCase();
      return l === relative || l === `${relative}.md` || l === lower || l === `${lower}.md` || l.endsWith(`/${lower}`) || l.endsWith(`/${lower}.md`);
    });
  } else {
    candidates = index.byName.get(lower) ?? [];
  }
  if (candidates.length <= 1) return candidates[0];
  const fromDir = path.posix.dirname(fromNote);
  return candidates.find((c) => path.posix.dirname(c) === fromDir) ?? [...candidates].sort((a, b) => a.length - b.length)[0];
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const isTrue = (v: unknown) => v === true || v === 'true' || v === 'yes';
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function toDay(value: unknown, fallback: Date): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return isoDay(value);
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return isoDay(new Date(value));
  return isoDay(fallback);
}

function asList(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,，]/) : [];
  return list.map((t) => String(t).trim().replace(/^#/, '')).filter(Boolean);
}

export function suggestSlug(title: string): string {
  const ascii = /[A-Za-z]/.test(title) && !/[㐀-鿿]/.test(title);
  const text = ascii ? title : pinyin(title, { toneType: 'none', type: 'array', nonZh: 'consecutive' }).slice(0, 10).join(' ');
  return (
    text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/, '') || `post-${sha(title).slice(0, 8)}`
  );
}

function safeFileName(rel: string, taken: Map<string, string>): string {
  const ext = path.posix.extname(rel).toLowerCase();
  const base = path.posix
    .basename(rel, path.posix.extname(rel))
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  let name = `${base || `file-${sha(rel).slice(0, 8)}`}${ext}`;
  if (taken.has(name) && taken.get(name) !== rel) name = `${base || 'file'}-${sha(rel).slice(0, 6)}${ext}`;
  taken.set(name, rel);
  return name;
}

function plainExcerpt(body: string): string {
  const para = body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|>|!\[|\||-{3,}|\$\$)/.test(p));
  if (!para) return '';
  const text = para
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`=~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 120 ? `${text.slice(0, 118)}…` : text;
}

/** Hash of a post's meaningful content, independent of YAML formatting. */
function canonicalHash(fileText: string): string {
  const parsed = matter(fileText.replace(/\r\n?/g, '\n'));
  const data: Record<string, unknown> = { ...parsed.data };
  delete data.obsidian;
  const norm = (v: unknown): unknown =>
    v instanceof Date ? isoDay(v) : Array.isArray(v) ? v.map(norm) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, norm(x)])) : v;
  return sha(JSON.stringify({ data: norm(data), body: parsed.content.trim() })).slice(0, 16);
}

// ---------------------------------------------------------------------------
// existing site posts
// ---------------------------------------------------------------------------

type SitePost = { slug: string; source?: string; storedHash?: string; currentHash: string; title: string; date?: string };

async function readSitePosts(): Promise<SitePost[]> {
  if (!existsSync(blogDir)) return [];
  const posts: SitePost[] = [];
  for (const entry of await readdir(blogDir, { withFileTypes: true })) {
    const file = path.join(blogDir, entry.name, 'index.md');
    if (!entry.isDirectory() || !existsSync(file)) continue;
    const text = await readFile(file, 'utf8');
    const { data } = matter(text);
    posts.push({
      slug: entry.name,
      source: data.obsidian?.source,
      storedHash: data.obsidian?.hash,
      currentHash: canonicalHash(text),
      title: String(data.title ?? entry.name),
      date: data.date ? toDay(data.date, new Date()) : undefined,
    });
  }
  return posts;
}

// ---------------------------------------------------------------------------
// planning: what each publishable note turns into
// ---------------------------------------------------------------------------

async function planNote(
  vault: string,
  index: VaultIndex,
  source: string,
  published: Map<string, string>,
  existing: SitePost | undefined,
): Promise<Plan> {
  const abs = path.join(vault, source);
  // Vault notes written on Windows use CRLF; the repo stores LF (.gitattributes).
  const raw = (await readFile(abs, 'utf8')).replace(/\r\n?/g, '\n');
  const info = await stat(abs);
  const { data: fm, content } = matter(raw);
  const warnings: string[] = [];
  const title = String(fm.title ?? path.posix.basename(source, '.md'));
  const slug = published.get(source)!;
  const assets: Asset[] = [];
  const taken = new Map<string, string>();

  const attach = (rel: string): { url: string; kind: 'image' | 'video' | 'file' } => {
    const name = safeFileName(rel, taken);
    if (IMAGE.test(rel)) {
      assets.push({ from: path.join(vault, rel), to: path.join(blogDir, slug, name) });
      return { url: `./${name}`, kind: 'image' };
    }
    if (VIDEO.test(rel)) {
      assets.push({ from: path.join(vault, rel), to: path.join(videoDir, `${slug}-${name}`) });
      return { url: `/uploads/video/${slug}-${name}`, kind: 'video' };
    }
    assets.push({ from: path.join(vault, rel), to: path.join(filesDir, slug, name) });
    return { url: `/uploads/files/${slug}/${name}`, kind: 'file' };
  };

  const linkTo = (inner: string): string => {
    const [targetPart, alias] = inner.split('|');
    const [target, heading] = targetPart.split('#');
    const resolved = target ? resolve(index, target, source) : source;
    const label = alias?.trim() || [target, heading?.replace(/^\^.*/, '')].filter(Boolean).join(' › ') || inner;
    const targetSlug = resolved ? published.get(resolved) : undefined;
    if (!targetSlug) return label;
    const anchor = heading && !heading.startsWith('^') ? `#${headingSlug(heading.trim())}` : '';
    return `[${label}](/blog/${targetSlug}/${anchor})`;
  };

  const embed = (inner: string): string => {
    const [targetPart, ...rest] = inner.split('|');
    const alias = rest.join('|').trim();
    const target = targetPart.split('#')[0].trim();
    let rel = resolve(index, target, source);
    // Excalidraw: use the SVG/PNG the plugin auto-exports next to the drawing.
    if ((rel && /\.excalidraw(\.md)?$/i.test(rel)) || /\.excalidraw(\.md)?$/i.test(target)) {
      const stem = (rel ?? target).replace(/\.md$/i, '');
      const exported = [`${stem}.svg`, `${stem}.png`, `${stem.replace(/\.excalidraw$/i, '')}.svg`, `${stem.replace(/\.excalidraw$/i, '')}.png`]
        .map((c) => resolve(index, c, source))
        .find(Boolean);
      if (!exported) {
        warnings.push(`Excalidraw「${target}」沒有匯出的 SVG/PNG（請在 Excalidraw 外掛設定開啟 Auto-export SVG）`);
        return '';
      }
      rel = exported;
    }
    if (!rel) {
      warnings.push(`找不到附件或筆記「${target}」`);
      return alias || target;
    }
    if (rel.endsWith('.md')) {
      warnings.push(`嵌入筆記「${target}」不支援，已改成連結`);
      return linkTo(inner);
    }
    const { url, kind } = attach(rel);
    if (kind === 'image') {
      const width = /^\d+(x\d+)?$/.test(alias) ? alias : '';
      const alt = width ? path.posix.basename(rel, path.posix.extname(rel)) : alias || path.posix.basename(rel, path.posix.extname(rel));
      return `![${alt.replace(/[[\]]/g, '')}${width ? `|${width}` : ''}](${url})`;
    }
    if (kind === 'video') return `![${alias || 'video'}](${url})`;
    return `[${alias || path.posix.basename(rel)}](${url})`;
  };

  const transformText = (text: string): string =>
    text
      .replace(/%%[\s\S]*?%%/g, '')
      .split('\n')
      .map((line) =>
        line
          .split(/(`+[^`]*`+)/)
          .map((seg, i) => {
            if (i % 2 === 1) return seg; // inline code
            return seg
              .replace(/!\[\[([^\]]+?)\]\]/g, (_m, inner: string) => embed(inner))
              .replace(/\[\[([^\]]+?)\]\]/g, (_m, inner: string) => linkTo(inner))
              .replace(/!\[([^\]]*)\]\((?!https?:|\/|#|data:|mailto:)([^)\s]+)\)/g, (m, alt: string, target: string) => {
                const rel = resolve(index, target, source);
                if (!rel) {
                  warnings.push(`找不到圖片「${target}」`);
                  return m;
                }
                const { url } = attach(rel);
                return `![${alt}](${url})`;
              })
              .replace(/\s\^[A-Za-z0-9-]+$/, ''); // block reference ids
          })
          .join(''),
      )
      .join('\n');

  // Transform everything outside fenced code blocks.
  const body = content
    .split(/^((?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)[ \t]*$)/m)
    .map((part, i) => (i % 2 === 1 ? part : transformText(part)))
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  let cover: string | undefined;
  if (fm.cover) {
    const target = String(fm.cover).replace(/^!?\[\[|\]\]$/g, '');
    const rel = resolve(index, target, source);
    if (rel && IMAGE.test(rel)) cover = attach(rel).url;
    else if (/^https?:/.test(String(fm.cover))) cover = String(fm.cover);
    else warnings.push(`找不到封面「${fm.cover}」`);
  }

  for (const a of assets) {
    if (!existsSync(a.from)) continue;
    const size = (await stat(a.from)).size;
    if (VIDEO.test(a.from) && size > VIDEO_WARN_BYTES) {
      warnings.push(`影片「${path.basename(a.from)}」有 ${(size / 1024 / 1024).toFixed(0)}MB，建議改上傳到 YouTube 再嵌入（GitHub 單檔上限 100MB）`);
    }
  }

  const rawCategory = String(fm.category ?? 'ideas').trim();
  const category = CATEGORY_ALIASES[rawCategory] ?? rawCategory.toLowerCase();
  const cjk = (body.match(/[㐀-鿿]/g) ?? []).length;
  const lang = fm.lang === 'en' || fm.lang === 'zh-TW' ? fm.lang : cjk > body.length * 0.05 ? 'zh-TW' : 'en';
  // Without a `date:` in the note, keep the date the post was first published with:
  // file times are meaningless in a fresh clone (the cloud sync), so they are only
  // used the very first time a note is published.
  const date =
    fm.date || fm.created ? toDay(fm.date ?? fm.created, info.mtime) : (existing?.date ?? toDay(undefined, info.birthtime ?? info.mtime));

  const frontmatter: Record<string, unknown> = {
    title,
    description: fm.description ? String(fm.description) : fm.summary ? String(fm.summary) : plainExcerpt(body) || undefined,
    date,
    ...(fm.updated ? { updated: toDay(fm.updated, info.mtime) } : {}),
    lang,
    category,
    tags: asList(fm.tags),
    ...(cover ? { cover } : {}),
    ...(isTrue(fm.draft) ? { draft: true } : {}),
  };
  for (const k of Object.keys(frontmatter)) if (frontmatter[k] === undefined) delete frontmatter[k];

  const render = (hash: string) =>
    `---\n${YAML.stringify({ ...frontmatter, obsidian: { source, hash } }, { lineWidth: 0 }).trim()}\n---\n\n${body}\n`;
  const hash = canonicalHash(render(''));
  const contentOut = render(hash);

  let status: NoteStatus = 'new';
  if (existing) {
    const editedOnSite = existing.storedHash !== undefined && existing.currentHash !== existing.storedHash;
    const assetsMissing = assets.some((a) => !existsSync(a.to));
    if (editedOnSite) status = 'conflict';
    else if (existing.storedHash === hash && existing.slug === slug && !assetsMissing) status = 'synced';
    else status = 'changed';
    if (editedOnSite) warnings.push('這篇文章在網站端（CMS）被修改過；同步會覆蓋那些修改。');
  }

  return {
    source,
    title,
    slug,
    date,
    category,
    status,
    warnings,
    content: contentOut,
    hash,
    assets,
    previousSlug: existing && existing.slug !== slug ? existing.slug : undefined,
  };
}

async function buildPlans(): Promise<{ vault: string; plans: Plan[]; removed: RemovedPost[] }> {
  const config = await loadConfig();
  const vault = config.vaultPath;
  if (!existsSync(vault)) throw new Error(`Obsidian vault not found: ${vault} (edit studio.config.json)`);
  const index = await indexVault(vault, config.exclude);
  const sitePosts = await readSitePosts();
  const bySource = new Map(sitePosts.filter((p) => p.source).map((p) => [p.source!, p]));

  // 1. Which notes are published, and under which slug.
  const published = new Map<string, string>();
  const errors = new Map<string, string>();
  const used = new Map<string, string>();
  for (const rel of index.files.filter((f) => f.endsWith('.md'))) {
    const { data } = matter((await readFile(path.join(vault, rel), 'utf8')).replace(/\r\n?/g, '\n'));
    if (!isTrue(data.publish)) continue;
    const title = String(data.title ?? path.posix.basename(rel, '.md'));
    const slug = data.slug ? suggestSlug(String(data.slug)) : (bySource.get(rel)?.slug ?? suggestSlug(title));
    const owner = sitePosts.find((p) => p.slug === slug);
    if (used.has(slug)) errors.set(rel, `slug「${slug}」和「${used.get(slug)}」重複，請在 frontmatter 加上不同的 slug:`);
    else if (owner && owner.source !== rel) {
      const who = owner.source ? `「${owner.source}」` : '網站上另一篇文章';
      errors.set(rel, `slug「${slug}」已被${who}使用，請在 frontmatter 加上不同的 slug:`);
    }
    used.set(slug, rel);
    published.set(rel, slug);
  }

  // 2. Plan each note.
  const plans: Plan[] = [];
  for (const [rel, slug] of published) {
    if (errors.has(rel)) {
      plans.push({ source: rel, title: path.posix.basename(rel, '.md'), slug, date: '', category: '', status: 'error', warnings: [errors.get(rel)!], content: '', hash: '', assets: [] });
      continue;
    }
    plans.push(await planNote(vault, index, rel, published, bySource.get(rel)));
  }

  // 3. Posts whose note was deleted or unpublished.
  const removed = sitePosts
    .filter((p) => p.source && !published.has(p.source))
    .map((p) => ({ slug: p.slug, source: p.source!, title: p.title }));

  plans.sort((a, b) => b.date.localeCompare(a.date));
  return { vault, plans, removed };
}

// ---------------------------------------------------------------------------
// public API (used by the CLI below and by the local Studio)
// ---------------------------------------------------------------------------

const report = ({ content: _c, hash: _h, assets: _a, previousSlug: _p, ...r }: Plan): NoteReport => r;

export async function scanVault(): Promise<ScanResult> {
  const { vault, plans, removed } = await buildPlans();
  return { vault, notes: plans.map(report), removed };
}

async function writePlan(plan: Plan) {
  const dir = path.join(blogDir, plan.slug);
  await mkdir(dir, { recursive: true });
  // Drop images from a previous sync that the note no longer uses.
  const keep = new Set(plan.assets.map((a) => path.resolve(a.to)));
  for (const f of await readdir(dir)) {
    if (f !== 'index.md' && !keep.has(path.resolve(dir, f))) await rm(path.join(dir, f), { force: true });
  }
  for (const a of plan.assets) {
    if (!existsSync(a.from)) continue;
    await mkdir(path.dirname(a.to), { recursive: true });
    await copyFile(a.from, a.to);
  }
  await writeFile(path.join(dir, 'index.md'), plan.content);
  if (plan.previousSlug) await rm(path.join(blogDir, plan.previousSlug), { recursive: true, force: true });
}

export async function syncNotes(opts: { sources?: string[]; force?: boolean } = {}) {
  const { plans } = await buildPlans();
  const written: string[] = [];
  const skipped: { source: string; reason: string }[] = [];
  for (const plan of plans) {
    if (opts.sources && !opts.sources.includes(plan.source)) continue;
    if (plan.status === 'synced') continue;
    if (plan.status === 'error') {
      skipped.push({ source: plan.source, reason: plan.warnings[0] });
      continue;
    }
    if (plan.status === 'conflict' && !opts.force) {
      skipped.push({ source: plan.source, reason: '網站端有修改（用 force 覆蓋）' });
      continue;
    }
    await writePlan(plan);
    written.push(plan.slug);
  }
  return { written, skipped };
}

export async function removePost(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`);
  await rm(path.join(blogDir, slug), { recursive: true, force: true });
  await rm(path.join(filesDir, slug), { recursive: true, force: true });
  if (existsSync(videoDir)) {
    for (const f of await readdir(videoDir)) if (f.startsWith(`${slug}-`)) await rm(path.join(videoDir, f), { force: true });
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const icons: Record<NoteStatus, string> = { new: '＋', changed: '～', synced: '✓', conflict: '!', error: '✗' };
  const scan = await scanVault();
  console.log(`Vault: ${scan.vault}\n`);
  for (const n of scan.notes) {
    console.log(`${icons[n.status]} [${n.status}] ${n.title}  →  /blog/${n.slug}/`);
    for (const w of n.warnings) console.log(`    ⚠ ${w}`);
  }
  for (const r of scan.removed) console.log(`− [removed] ${r.title}  (/blog/${r.slug}/ — note gone or unpublished; delete it in Studio)`);
  if (!scan.notes.length) console.log('No notes with `publish: true` found.');
  if (!args.includes('--dry-run')) {
    const { written, skipped } = await syncNotes({ force: args.includes('--force') });
    console.log(`\nSynced ${written.length} post(s).`);
    for (const s of skipped) console.log(`  skipped ${s.source}: ${s.reason}`);
  }
}
