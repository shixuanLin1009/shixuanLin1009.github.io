import type { Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Remove Obsidian `%%comments%%` that sit inside a paragraph. Comments that span
 * several blocks are removed earlier, by the Obsidian sync script.
 */
export default function remarkStripComments() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text) => {
      if (node.value.includes('%%')) node.value = node.value.replace(/%%[\s\S]*?%%/g, '');
    });
  };
}
