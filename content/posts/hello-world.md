---
title: "Hello World — 第一篇文章"
date: 2026-06-05
tags: [meta]
draft: false
---

歡迎來到我的個人網站！這是第一篇示範文章。

## 如何新增文章

1. 在 `content/posts/` 資料夾新增一個 `.md` 檔案
2. 在檔案頂端填寫 frontmatter（標題、日期、標籤）
3. 用 Obsidian 或任何編輯器撰寫內文
4. `git add . && git commit -m "add post" && git push`
5. GitHub Actions 會自動重新部署網站

## Frontmatter 說明

```yaml
---
title: "文章標題"
date: 2026-06-05       # 發布日期
tags: [tag1, tag2]     # 標籤（可多個）
draft: false           # true 則不會發布
---
```
