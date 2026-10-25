import type { Html, Image, Paragraph, Root } from 'mdast';
import type {} from 'mdast-util-to-hast'; // adds `data.hProperties` to mdast nodes
import { visit } from 'unist-util-visit';

/**
 * Media handling shared by Obsidian-synced posts and posts written in the CMS:
 *
 * - `![caption](https://youtu.be/…)`, Vimeo and Bilibili links → responsive iframe
 * - `![caption](/uploads/video/clip.mp4)` → `<video>`
 * - `![alt|400](img.png)` / `![alt|400x300](img.png)` → sized image (Obsidian syntax)
 * - bare relative image paths (`img.png`) → `./img.png` so Astro optimizes them
 */
export default function remarkObsidianEmbeds() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || index === undefined) return;
      const meaningful = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (meaningful.length !== 1 || meaningful[0].type !== 'image') return;
      const html = embedHtml(meaningful[0]);
      if (html) parent.children.splice(index, 1, { type: 'html', value: html } satisfies Html);
    });

    visit(tree, 'image', (node: Image) => {
      const size = node.alt?.match(/^(.*?)\s*\|\s*(\d+)(?:x(\d+))?$/);
      if (size) {
        node.alt = size[1];
        node.data = { ...node.data, hProperties: { ...(node.data?.hProperties ?? {}), width: size[2], ...(size[3] ? { height: size[3] } : {}) } };
      }
      if (!/^([a-z][a-z0-9+.-]*:|\/|\.|#)/i.test(node.url)) node.url = `./${node.url}`;
    });
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const isCaption = (alt?: string | null) => !!alt && !/^(youtube|video|vimeo|bilibili|embed)$/i.test(alt.trim());

function figure(inner: string, alt?: string | null) {
  const caption = isCaption(alt) ? `<figcaption>${esc(alt!)}</figcaption>` : '';
  return `<figure class="embed">${inner}${caption}</figure>`;
}

function iframe(src: string, title: string) {
  return `<div class="embed-frame"><iframe src="${esc(src)}" title="${esc(title)}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
}

function parseSeconds(t: string | null): number | undefined {
  if (!t) return;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : undefined;
}

export function embedHtml(node: Image): string | undefined {
  const url = node.url.trim();
  const title = isCaption(node.alt) ? node.alt! : 'Embedded video';

  let u: URL | undefined;
  try {
    u = new URL(url);
  } catch {
    u = undefined;
  }

  if (u) {
    const host = u.hostname.replace(/^(www\.|m\.)/, '');
    let yt: string | undefined;
    if (host === 'youtu.be') yt = u.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      yt = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1];
    }
    if (yt) {
      const start = parseSeconds(u.searchParams.get('t') ?? u.searchParams.get('start'));
      const src = `https://www.youtube-nocookie.com/embed/${yt}${start ? `?start=${start}` : ''}`;
      return figure(iframe(src, title), node.alt);
    }
    const vimeo = host === 'vimeo.com' ? u.pathname.match(/^\/(\d+)/)?.[1] : undefined;
    if (vimeo) return figure(iframe(`https://player.vimeo.com/video/${vimeo}`, title), node.alt);
    const bvid = host.endsWith('bilibili.com') ? u.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] : undefined;
    if (bvid) return figure(iframe(`https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`, title), node.alt);
  }

  if (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url)) {
    return figure(`<video controls preload="metadata" playsinline src="${esc(url)}"></video>`, node.alt);
  }
  return undefined;
}
