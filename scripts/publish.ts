/**
 * Commit and push everything (site edits, synced posts, uploads).
 * GitHub Actions then rebuilds the site and both resume PDFs.
 *
 *   npm run publish
 *   npm run publish -- -m "blog: new post on VLA papers"
 */
import { publish, status } from './git';

const args = process.argv.slice(2);
const i = args.findIndex((a) => a === '-m' || a === '--message');
const message = i >= 0 ? args[i + 1] : `content: update site (${new Date().toISOString().slice(0, 10)})`;

const before = await status();
if (!before.files.length && !before.ahead) {
  console.log('Nothing to publish.');
  process.exit(0);
}
console.log(`Publishing ${before.files.length} changed file(s)…`);
const result = await publish(message);
console.log(result.log.join('\n'));
if (!result.ok) process.exit(1);
console.log(`\n✓ Pushed. Deploy progress: ${before.actionsUrl ?? 'GitHub → Actions'}`);
