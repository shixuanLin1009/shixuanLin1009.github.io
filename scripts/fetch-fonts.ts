/**
 * Download the CJK font used by the Typst resume (pinned + checksum-verified).
 * Runs automatically from scripts/resume.ts; CI caches resume/fonts/.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const fontDir = path.join(root, 'resume', 'fonts');

// google/fonts @ e7db6ca — SIL Open Font License 1.1
const FONTS = [
  {
    file: 'NotoSerifTC[wght].ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf',
    sha256: '0077e18f57c6908f4a000969880940bdb0dad057c0e8d98b49dc364c3d1b09c6',
  },
];

const sha256 = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

export async function ensureFonts(log = console.log) {
  await mkdir(fontDir, { recursive: true });
  for (const font of FONTS) {
    const target = path.join(fontDir, font.file);
    if (existsSync(target) && sha256(await readFile(target)) === font.sha256) continue;
    log(`Downloading ${font.file} …`);
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`Font download failed (${res.status}): ${font.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const actual = sha256(buf);
    if (actual !== font.sha256) throw new Error(`Checksum mismatch for ${font.file}: got ${actual}`);
    await writeFile(`${target}.part`, buf);
    await rename(`${target}.part`, target);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await ensureFonts();
  console.log(`Fonts ready in ${path.relative(root, fontDir)}`);
}
