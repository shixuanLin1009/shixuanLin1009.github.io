# CLAUDE.md

林世璿（Shixuan Lin）的個人網站，部署在 https://shixuanlin1009.github.io 。
**一律用繁體中文回答使用者**，程式碼、指令、檔名、commit 訊息可以用英文。

## 技術與指令

- Astro 7（Markdown 用 `@astrojs/markdown-remark` 的 `unified()`）、Tailwind CSS v4、TypeScript、Node 24。
- 部署：push 到 `main` → `.github/workflows/deploy.yml` → GitHub Pages，大約 2 分鐘上線。
- **改完要先驗證，再 commit**：
  - `npm ci`
  - `npx astro check`：型別檢查，必須 0 errors
  - `npx astro build`：網站建置，必須成功
  - `npm run build` 還會產生履歷 PDF，需要 `typst`（0.15.1）。沒有 typst 時只跑 `npx astro build` 即可，CI 會產生 PDF。
- 本機開發：`npm run dev`。只有在使用者自己的電腦上才有 Studio（`/__studio`，在 `integrations/studio/`，只在 dev 時存在）。

## 內容放在哪裡（`src/content/`）

| 內容 | 位置 | 格式 |
| --- | --- | --- |
| 個人資料、社群連結、網站設定、履歷章節順序 | `singletons/{profile,socials,settings,resume}.yaml` | |
| 首頁分類區塊（Research、Projects…） | `categories/*.yaml` | 新增一個檔案，首頁就多一個區塊 |
| 作品／研究／競賽／證照（含詳細頁） | `showcase/en/<slug>.md` 和 `showcase/zh-TW/<slug>.md` | 兩個語言的檔名必須相同 |
| 學歷、經歷、技能、News | `education/` `experience/` `skills/` `news/` | YAML |
| 論文 | `publications/*.yaml` | 單一語言 |
| 部落格 | `blog/<slug>/index.md`（圖片放在同一個資料夾） | 單一語言 |

Schema 在 `src/schemas.ts`，collection 定義在 `src/content.config.ts`。資料讀取和中英 fallback 都在 `src/lib/content.ts`、`src/lib/localize.ts`。

## 雙語規則

- 英文在 `/`，中文在 `/zh/`。`src/pages/zh/` 只是包一層，共用 `src/views/` 的頁面元件。**新增頁面時兩個語言都要加。**
- YAML 內容的格式是 `en:` 和 `zh-TW:` 兩個區塊（Sveltia 的 `single_file`）。中文沒填的欄位會自動顯示英文。新增內容時盡量兩個語言都填。
- 介面文字放在 `src/i18n/ui.ts`，新增 key 時 `en` 和 `zh` 都要加。
- 中文欄位不要用 YAML 的 `>-` 折行寫法，會在中文字之間多出空格；請寫成單行。

## 部落格（重要）

- 部落格文章是從使用者的 **Obsidian vault**（私人 repo `shixuanLin1009/-ObsidianVault`）自動同步過來的，做法是 `scripts/obsidian-sync.ts`，加上 `.github/workflows/obsidian-sync.yml` 雲端同步。
- **frontmatter 有 `obsidian:` 欄位的文章，不要直接修改。** 下次同步會被覆蓋或標成衝突。請告訴使用者回 Obsidian 修改。
- Obsidian 的 frontmatter 欄位：`publish`（是否發佈）、`unlisted`（上線但不出現在列表、搜尋、RSS）、`draft`、`category`、`tags`、`description`、`slug`、`cover`、`lang`。
- 部落格分類：`reading`、`paper`、`ideas`、`daily`。新增分類要同時改四個地方：
  - `src/lib/blog.ts` 的 `known`
  - `src/i18n/ui.ts` 的 `blog.cat.*`（中英文都要加）
  - `public/admin/config.yml` 的分類選項
  - `scripts/obsidian-sync.ts` 的 `CATEGORY_ALIASES`（中文別名）

## 履歷 PDF

- `resume/template.typ`（Typst），資料來自網站的 `/cv/<locale>.json`（`src/pages/cv/[locale].json.ts` → `getResumeData()`）。網頁版履歷和 PDF 用的是同一份資料。
- 作品要放進履歷：在 showcase 的 frontmatter 設定 `resume.include: true`，並填寫 `resume.bullets`。
- **電話號碼絕對不能 commit**，這個 repo 是公開的。電話只放在本機的 `.env.local`。

## 後台（Sveltia CMS）

- 設定檔是 `public/admin/config.yml`。在 schema 新增欄位時，CMS 也要加上對應欄位。
- CMS 只能用 token 登入（`auth_methods: [token]`），因為 GitHub Pages 沒有 OAuth 伺服器。
- Sveltia 的版本固定在 `public/admin/index.html`，不要隨便升級。

## 其他注意

- 主色由 `settings.yaml` 的 `palette` 決定，目前是 `petrol`。顏色變數定義在 `src/styles/global.css`。
- 中文使用系統字型，**不要加入中文網頁字型**（每頁會多 1–2MB，Lighthouse 效能會掉到 50 分以下）。
- Astro 7 的編譯器比較嚴格，例如 `<div>` 放在 `<p>` 裡會直接 build 失敗。
- commit 訊息用英文、簡短描述改了什麼。不要 commit `dist/`、`.env*`、`resume/private/`、`resume/fonts/`。
- 完整使用說明在 `README.md`（中文）。
