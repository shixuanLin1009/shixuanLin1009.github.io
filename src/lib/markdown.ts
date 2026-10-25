/**
 * Tiny inline Markdown renderer for short CMS fields (bio, news, resume
 * bullets): **bold**, *italic*, `code` and [links](url). Everything else is
 * escaped. Long-form content goes through Astro's Markdown pipeline instead.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inlineMd(text = ''): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
      const external = /^https?:/.test(url);
      return `<a href="${url}" class="link"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    });
}

/** Paragraph-level version: blank lines separate paragraphs. */
export function blockMd(text = ''): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inlineMd(p.replace(/\s*\n\s*/g, ' '))}</p>`)
    .join('');
}

/**
 * Attributes for a link whose URL should not appear verbatim in the HTML
 * (mailto: links). `MailDecode` in the base layout restores the href on load.
 */
export function protectedHref(url: string): Record<string, string> {
  if (!url.startsWith('mailto:')) return { href: url };
  return { href: '#', 'data-m': Buffer.from([...url].reverse().join(''), 'utf8').toString('base64') };
}

/** Strip inline Markdown markers, e.g. for meta descriptions and the PDF fallback. */
export const plainMd = (text = '') =>
  text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
