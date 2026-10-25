import { existsSync, readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegrationLogger } from 'astro';
import type { ViteDevServer } from 'vite';
import { pull, publish, status } from '../../scripts/git';
import { removePost, scanVault, syncNotes } from '../../scripts/obsidian-sync';
import { buildResume, resumeFiles } from '../../scripts/resume';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

function send(res: ServerResponse, code: number, data: unknown, type = 'application/json; charset=utf-8') {
  res.statusCode = code;
  res.setHeader('content-type', type);
  res.setHeader('cache-control', 'no-store');
  res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data));
}

/**
 * These endpoints change files and push to GitHub, so only same-origin requests
 * from the Studio page are accepted: a custom header forces a CORS preflight
 * that the dev server never approves for other sites.
 */
function trusted(req: IncomingMessage): boolean {
  if (req.headers['x-studio'] !== '1') return false;
  if (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return false;
  const origin = req.headers.origin;
  return !origin || new URL(origin).host === req.headers.host;
}

export function attachStudio(server: ViteDevServer, logger: AstroIntegrationLogger) {
  const devUrl = () => server.resolvedUrls?.local[0] ?? `http://localhost:${server.config.server.port ?? 4321}/`;

  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/__studio')) return next();
    const route = `${req.method} ${url.pathname.replace(/\/$/, '')}`;

    try {
      if (route === 'GET /__studio') {
        return send(res, 200, readFileSync(path.join(here, 'ui.html'), 'utf8'), 'text/html; charset=utf-8');
      }
      if (route.startsWith('GET /__studio/private/')) {
        const name = path.basename(url.pathname);
        const file = path.join(root, 'resume', 'private', name);
        if (!Object.values(resumeFiles).includes(name as never) || !existsSync(file)) return send(res, 404, 'Not found', 'text/plain');
        return send(res, 200, readFileSync(file), 'application/pdf');
      }
      if (!url.pathname.startsWith('/__studio/api/')) return send(res, 404, { error: 'Not found' });
      if (!trusted(req)) return send(res, 403, { error: 'Forbidden' });

      switch (route) {
        case 'GET /__studio/api/status':
          return send(res, 200, await status(url.searchParams.get('fetch') !== '0'));
        case 'POST /__studio/api/pull': {
          const r = await pull();
          return send(res, r.ok ? 200 : 500, { ok: r.ok, log: [r.stdout, r.stderr].filter(Boolean) });
        }
        case 'GET /__studio/api/obsidian':
          return send(res, 200, await scanVault());
        case 'POST /__studio/api/obsidian/sync': {
          const body = await readJson(req);
          const result = await syncNotes({
            sources: Array.isArray(body.sources) ? (body.sources as string[]) : undefined,
            force: body.force === true,
          });
          return send(res, 200, result);
        }
        case 'POST /__studio/api/obsidian/remove': {
          const body = await readJson(req);
          await removePost(String(body.slug));
          return send(res, 200, { ok: true });
        }
        case 'POST /__studio/api/resume': {
          const body = await readJson(req);
          const log: string[] = [];
          const files = await buildResume({ from: 'dev', devUrl: devUrl(), private: body.private === true, log: (m) => log.push(m) });
          return send(res, 200, { ok: true, log, files: files.map((f) => path.relative(root, f).split(path.sep).join('/')) });
        }
        case 'POST /__studio/api/publish': {
          const body = await readJson(req);
          const result = await publish(String(body.message ?? ''));
          return send(res, result.ok ? 200 : 500, result);
        }
      }
      return send(res, 404, { error: 'Not found' });
    } catch (err) {
      logger.error(err instanceof Error ? err.stack ?? err.message : String(err));
      return send(res, 500, { error: err instanceof Error ? err.message : String(err) });
    }
  });

  logger.info('Studio → /__studio');
}
