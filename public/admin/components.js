// Custom editor components for Sveltia CMS. They write the same Markdown that
// the site's remark plugins (src/plugins/remark-obsidian-embeds.ts) and
// Obsidian use, so posts look identical whether written here or in Obsidian.
/* global CMS */

const plainCaption = (c) => (/^(youtube|video|vimeo|bilibili|embed)$/i.test(c ?? '') ? '' : c ?? '');

CMS.registerEditorComponent({
  id: 'youtube',
  label: 'YouTube / Vimeo / Bilibili',
  icon: 'smart_display',
  fields: [
    { name: 'url', label: '影片網址 Video URL', widget: 'string' },
    { name: 'caption', label: '說明 Caption', widget: 'string', required: false },
  ],
  pattern: /^!\[([^\]]*)\]\((https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|bilibili\.com)\/[^)\s]*)\)$/m,
  fromBlock: (match) => ({ url: match[2], caption: plainCaption(match[1]) }),
  toBlock: ({ url = '', caption = '' }) => `![${caption || 'youtube'}](${url})`,
  toPreview: ({ url = '', caption = '' }) => `▶️ **${caption || 'Video'}** — ${url}`,
});

CMS.registerEditorComponent({
  id: 'video',
  label: '上傳影片 Video file',
  icon: 'movie',
  fields: [
    {
      name: 'src',
      label: '影片檔 Video (mp4 / webm, < 50MB)',
      widget: 'file',
      media_folder: '/public/uploads/video',
      public_folder: '/uploads/video',
      accept: 'video/*',
    },
    { name: 'caption', label: '說明 Caption', widget: 'string', required: false },
  ],
  pattern: /^!\[([^\]]*)\]\(([^)\s]+\.(?:mp4|webm|mov|m4v))\)$/m,
  fromBlock: (match) => ({ src: match[2], caption: plainCaption(match[1]) }),
  toBlock: ({ src = '', caption = '' }) => `![${caption || 'video'}](${src})`,
  toPreview: ({ src = '', caption = '' }) => `🎬 **${caption || 'Video'}** — ${src}`,
});

CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout（Obsidian）',
  icon: 'info',
  fields: [
    {
      name: 'type',
      label: '類型 Type',
      widget: 'select',
      default: 'note',
      options: ['note', 'abstract', 'info', 'todo', 'tip', 'success', 'question', 'warning', 'failure', 'danger', 'bug', 'example', 'quote'],
    },
    { name: 'title', label: '標題 Title', widget: 'string', required: false },
    { name: 'fold', label: '預設收合 Collapsed', widget: 'boolean', default: false, required: false },
    { name: 'body', label: '內容 Body', widget: 'text' },
  ],
  pattern: /^> \[!(\w+)\]([+-]?)(?: ([^\n]*))?\n((?:>[^\n]*(?:\n|$))*)/m,
  fromBlock: (match) => ({
    type: match[1].toLowerCase(),
    fold: match[2] === '-',
    title: match[3] ?? '',
    body: (match[4] ?? '')
      .split('\n')
      .map((line) => line.replace(/^> ?/, ''))
      .join('\n')
      .trim(),
  }),
  toBlock: ({ type = 'note', title = '', fold = false, body = '' }) =>
    `> [!${type}]${fold ? '-' : ''}${title ? ` ${title}` : ''}\n` +
    String(body)
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n'),
  toPreview: ({ type = 'note', title = '', body = '' }) => `> **${type.toUpperCase()}${title ? ` · ${title}` : ''}**\n>\n> ${String(body).replace(/\n/g, '\n> ')}`,
});

CMS.init();
