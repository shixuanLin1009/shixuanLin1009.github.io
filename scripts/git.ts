/** Small git wrapper shared by the Studio and `npm run publish`. */
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export type GitResult = { ok: boolean; stdout: string; stderr: string };

export function git(args: string[]): Promise<GitResult> {
  return new Promise((resolve) => {
    execFile('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }, (err, stdout, stderr) =>
      resolve({ ok: !err, stdout: stdout.trim(), stderr: stderr.trim() }),
    );
  });
}

export type ChangedFile = { status: string; path: string };
export type GitStatus = {
  branch: string;
  ahead: number;
  behind: number;
  files: ChangedFile[];
  remoteOk: boolean;
  actionsUrl?: string;
  siteUrl: string;
};

function repoWebUrl(remote: string): string | undefined {
  const m = remote.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  return m ? `https://github.com/${m[1]}/${m[2]}` : undefined;
}

export async function status(fetchRemote = true): Promise<GitStatus> {
  const remoteOk = fetchRemote ? (await git(['fetch', '--quiet', 'origin'])).ok : true;
  const branch = (await git(['rev-parse', '--abbrev-ref', 'HEAD'])).stdout;
  const counts = await git(['rev-list', '--left-right', '--count', 'HEAD...@{u}']);
  const [ahead, behind] = counts.ok ? counts.stdout.split(/\s+/).map(Number) : [0, 0];
  const porcelain = await git(['status', '--porcelain=v1', '-uall', '-z']);
  const files = porcelain.stdout
    .split('\0')
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2).trim() || '?', path: line.slice(3) }));
  const web = repoWebUrl((await git(['remote', 'get-url', 'origin'])).stdout);
  return { branch, ahead, behind, files, remoteOk, actionsUrl: web && `${web}/actions`, siteUrl: 'https://shixuanlin1009.github.io' };
}

export async function pull(): Promise<GitResult> {
  return git(['pull', '--rebase', '--autostash']);
}

/** Stage everything, commit, rebase onto the remote (online CMS edits), push. Stops on conflicts. */
export async function publish(message: string): Promise<{ ok: boolean; log: string[] }> {
  const log: string[] = [];
  const step = async (args: string[]) => {
    const r = await git(args);
    log.push(`$ git ${args.join(' ')}`, ...[r.stdout, r.stderr].filter(Boolean));
    return r;
  };
  await step(['add', '-A']);
  const staged = await git(['diff', '--cached', '--quiet']);
  if (!staged.ok) {
    const commit = await step(['commit', '-m', message.trim() || 'content: update site']);
    if (!commit.ok) return { ok: false, log };
  } else {
    log.push('(no local changes to commit)');
  }
  const rebase = await step(['pull', '--rebase']);
  if (!rebase.ok) {
    await step(['rebase', '--abort']);
    log.push('⚠ 和線上（CMS）的修改有衝突，已取消 rebase。請手動解決後再發佈。');
    return { ok: false, log };
  }
  const push = await step(['push', 'origin', 'HEAD']);
  return { ok: push.ok, log };
}
