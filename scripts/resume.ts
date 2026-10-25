/**
 * Build the resume PDFs with Typst from the site's own /cv/<locale>.json.
 *
 *   tsx scripts/resume.ts --from dist        # CI: after `astro build`, writes dist/cv/*.pdf
 *   tsx scripts/resume.ts --from dev         # local: reads the running dev server, writes public/cv/*.pdf
 *   tsx scripts/resume.ts --from dev --private
 *       # also writes resume/private/*.pdf including PHONE from .env.local (never committed or deployed)
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureFonts, fontDir } from './fetch-fonts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resumeDir = path.join(root, 'resume');
const template = path.join(resumeDir, 'template.typ');

export const resumeFiles = { en: 'Shixuan_Lin_Resume_EN.pdf', 'zh-TW': 'Shixuan_Lin_Resume_ZH.pdf' } as const;
type Locale = keyof typeof resumeFiles;
const locales = Object.keys(resumeFiles) as Locale[];

export type ResumeOptions = { from: 'dist' | 'dev'; devUrl?: string; private?: boolean; log?: (msg: string) => void };

function readPhone(): string | undefined {
  const env = path.join(root, '.env.local');
  if (!existsSync(env)) return undefined;
  const match = readFileSync(env, 'utf8').match(/^PHONE\s*=\s*"?([^"\r\n]+)"?/m);
  return match?.[1].trim();
}

function typst(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('typst', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d));
    proc.on('error', (err) => reject(new Error(`Could not run typst (is it installed and on PATH?): ${err.message}`)));
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`typst exited with ${code}\n${stderr}`))));
  });
}

async function loadData(opts: ResumeOptions, locale: Locale): Promise<unknown> {
  if (opts.from === 'dist') {
    return JSON.parse(await readFile(path.join(root, 'dist', 'cv', `${locale}.json`), 'utf8'));
  }
  const url = new URL(`/cv/${locale}.json`, opts.devUrl ?? 'http://localhost:4321');
  const res = await fetch(url).catch(() => undefined);
  if (!res?.ok) throw new Error(`Could not fetch ${url} — start the dev server first (npm run dev).`);
  return res.json();
}

export async function buildResume(opts: ResumeOptions): Promise<string[]> {
  const log = opts.log ?? console.log;
  await ensureFonts(log);
  const outDir = opts.from === 'dist' ? path.join(root, 'dist', 'cv') : path.join(root, 'public', 'cv');
  await mkdir(outDir, { recursive: true });
  const phone = opts.private ? readPhone() : undefined;
  if (opts.private && !phone) log('No PHONE=… in .env.local — private PDFs will match the public ones.');
  const written: string[] = [];

  for (const locale of locales) {
    const dataFile = `data.${locale}.json`;
    await writeFile(path.join(resumeDir, dataFile), JSON.stringify(await loadData(opts, locale), null, 2));
    const base = ['compile', template, '--root', resumeDir, '--font-path', fontDir, '--ignore-system-fonts', '--input', `data=${dataFile}`];

    const out = path.join(outDir, resumeFiles[locale]);
    await typst([...base, out]);
    written.push(out);

    if (opts.private) {
      const privateDir = path.join(resumeDir, 'private');
      await mkdir(privateDir, { recursive: true });
      const privateOut = path.join(privateDir, resumeFiles[locale]);
      await typst([...base, ...(phone ? ['--input', `phone=${phone}`] : []), privateOut]);
      written.push(privateOut);
    }
    log(`✓ ${path.relative(root, out)}`);
  }
  return written;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const from = args[args.indexOf('--from') + 1] === 'dist' ? 'dist' : 'dev';
  buildResume({ from, private: args.includes('--private') }).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
