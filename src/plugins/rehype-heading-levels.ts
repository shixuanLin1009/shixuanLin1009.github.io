import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Content sits under the page's own <h1>, so shift headings until the highest
 * one is an <h2>. Obsidian notes often start at `###`; without this the
 * outline skips levels and the table of contents stays empty.
 */
export default function rehypeHeadingLevels() {
  return (tree: Root) => {
    const headings: Element[] = [];
    visit(tree, 'element', (el: Element) => {
      if (/^h[1-6]$/.test(el.tagName)) headings.push(el);
    });
    if (!headings.length) return;
    const level = (el: Element) => Number(el.tagName[1]);
    const delta = 2 - Math.min(...headings.map(level));
    if (delta === 0) return;
    for (const h of headings) h.tagName = `h${Math.min(6, Math.max(2, level(h) + delta))}`;
  };
}
