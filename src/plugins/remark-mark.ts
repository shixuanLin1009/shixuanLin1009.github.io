import type { Root, PhrasingContent, Text } from 'mdast';
import { SKIP, visit } from 'unist-util-visit';

/** Obsidian `==highlight==` → `<mark>`. */
export default function remarkMark() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('==')) return;
      const parts: PhrasingContent[] = [];
      const re = /==([^=\n](?:[^\n]*?[^=\n])?)==/g;
      let last = 0;
      for (const m of node.value.matchAll(re)) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        parts.push({
          type: 'emphasis',
          data: { hName: 'mark' },
          children: [{ type: 'text', value: m[1] }],
        });
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return [SKIP, index + parts.length];
    });
  };
}
