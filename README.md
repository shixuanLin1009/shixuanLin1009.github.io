# shixuanlin1009.github.io

林世璿（Shixuan Lin）的個人網站。用 Astro 7 建置，部署到 GitHub Pages。網站支援中英雙語（英文在 `/`，中文在 `/zh/`），內容從後台或 Obsidian 編輯，履歷 PDF 會跟著網站內容自動產生。

```
Obsidian (publish: true) ──▶ 本機 Studio /__studio ──┐
本機後台 /admin（Local Repository）─────────────────┼─▶ git push ─┐
手機／其他電腦 線上後台 /admin（GitHub token）── 直接 commit ───────────┤
                                                                       ▼
          GitHub Actions：astro build → Typst 履歷 PDF（中／英）→ Pagefind 搜尋索引 → Pages
```

## 日常使用

### 1. 在這台電腦上

```bash
npm run dev
```

| 網址 | 用途 |
| --- | --- |
| http://localhost:4321/ | 網站預覽（存檔後即時更新） |
| http://localhost:4321/__studio | **Studio 本機控制台**：Obsidian 同步、履歷 PDF 預覽、一鍵發佈 |
| http://localhost:4321/admin/index.html | **內容後台**（Sveltia CMS）：用 Chrome/Edge 開啟，選「使用本機倉庫」，再選這個資料夾 |

在後台改好內容後，到 Studio 按「發佈到網站」，約 1–2 分鐘後網站和 PDF 就會更新。

### 2. 用 Obsidian 寫部落格

1. 在 Obsidian 新增筆記，插入範本 **Blog Post**（`5 - Templates/Blog Post.md`）。
2. 寫完後把 `publish` 改成 `true`，並設定 `category`：`reading` 是讀書心得，`paper` 是論文心得，`ideas` 是個人發想。
3. 打開 Studio，按「同步」，預覽沒問題後按「發佈」。

支援的語法：

- 圖片：`![[圖.png]]`，或用 `![[圖.png|400]]` 指定寬度
- 影片：`![](YouTube／Vimeo／Bilibili 網址)` 或 `![[clip.mp4]]`
- 其他：callout、`$數學式$`、程式碼、mermaid、`==highlight==`
- `%%註解%%` 不會出現在網站上

筆記之間的 `[[連結]]` 如果對方也有發佈，就會變成網站連結；否則顯示成純文字。同步只會修改網站，**不會修改你的筆記**。

只用命令列也可以：`npm run sync`（加上 `-- --dry-run` 只預覽不寫入），然後 `npm run publish`。

#### 雲端發佈（不用這台電腦）

在其他電腦用 Obsidian 寫的筆記，會由 obsidian-git 推上 GitHub 的私人 vault repo。workflow `Sync from Obsidian` 會在 GitHub 上讀取 vault，執行和 Studio 相同的同步；有變更時，會自動 commit 並重新部署網站。

- **在 Obsidian 裡一鍵發佈（任何電腦）**：`Ctrl+P` →「Obsidian Git: Commit-and-sync」。vault repo 的 `.github/workflows/publish-to-website.yml` 收到推送後，只要有「已發佈或曾經發佈」的筆記被修改，就會立刻觸發網站同步。obsidian-git 的自動推送也會觸發。這個功能需要在 **vault repo** 設定 secret `WEBSITE_TOKEN`：fine-grained token，只授權這個網站 repo，權限 **Actions: Read and write**。
- **立刻發佈（不開 Obsidian）**：GitHub 網頁或手機 App → 這個 repo → Actions →「Sync from Obsidian」→ Run workflow。
- **自動發佈**：每小時整點過 17 分自動檢查一次，沒有變更就不會部署。
- **下架**：把筆記刪除或改成 `publish: false`，下一次雲端同步就會把文章從網站移除。如果 vault 讀取失敗（例如是空的），同步會直接停止，不會誤刪文章。
- **改檔名或搬資料夾**：文章會沿用原本的網址。
- 寫完後要等 obsidian-git 推送（每 10 分鐘一次），或在 Obsidian 執行「Git: Commit-and-sync」立刻推送。

**一次性設定**：建立 `VAULT_TOKEN`。

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token。
2. Repository access 選 **Only select repositories → `-ObsidianVault`**；Permissions 的 **Contents 設為 Read-only**。
3. 到這個網站 repo → Settings → Secrets and variables → Actions → New repository secret，名稱填 `VAULT_TOKEN`，貼上 token。

沒有設定 `VAULT_TOKEN` 時，這個 workflow 什麼都不會做。vault 只會在 GitHub 的執行環境裡暫時讀取，不會被 commit 或部署。另外，公開 repo 如果 60 天沒有任何活動，GitHub 會暫停排程，到 Actions 頁面重新啟用即可。

### 3. 用手機或其他電腦更新（線上後台）

1. 到 GitHub → Settings → Developer settings → Fine-grained tokens 建立 token。
   - 只授權 `shixuanLin1009.github.io` 這個 repo。
   - 權限：Contents 設為 Read and write。
2. 打開 https://shixuanlin1009.github.io/admin/ ，選「使用存取權杖登入」，貼上 token。

存檔會直接 commit 到 GitHub，網站和 PDF 會自動重建。下次在本機開 Studio 時，會自動拉取這些線上修改。

### 4. 履歷 PDF

- PDF 用 `resume/template.typ` 排版，資料是網站的 `/cv/en.json` 和 `/cv/zh-TW.json`，所以 PDF 一定和網頁版履歷一致。
- 每次部署都會在 CI 重新產生兩份 PDF：`/cv/Shixuan_Lin_Resume_EN.pdf`、`/cv/Shixuan_Lin_Resume_ZH.pdf`。
- 某個作品要出現在履歷上：在後台勾選該作品的「放進履歷」，並填寫履歷條列。
- 章節順序：在後台的「網站設定 → 履歷章節順序」調整。
- **電話不會公開**：把 `PHONE=09xx-xxx-xxx` 寫在 `.env.local`（不會被 commit）。在 Studio 勾選「含電話的私人版」，就會在 `resume/private/` 產生投遞用的 PDF，這份檔案只存在本機。

### 5. 常見調整

| 想做的事 | 在哪裡改 |
| --- | --- |
| 自我介紹、頭像、研究興趣 | 後台 → 網站設定 → 個人資料 |
| 社群連結（IG、FB、LinkedIn、Scholar…） | 後台 → 網站設定 → 社群連結（取消勾選「隱藏」才會顯示） |
| 首頁新增一個區塊（例如 Talks） | 後台 → 作品分類 → 新增 |
| 作品、研究、競賽、證照 | 後台 → 作品・研究・競賽（勾選「精選」會放在首頁大卡片） |
| 主色 | 後台 → 網站設定 → 網站資訊 → 主色（`npm run dev` 時右下角的圓點可以即時預覽） |
| 流量分析 | 註冊 [GoatCounter](https://www.goatcounter.com/)，在後台 → 網站資訊 → 流量分析填入代碼 |

## 指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 本機開發（網站、後台、Studio） |
| `npm run build` | 完整建置：網站 → PDF → 搜尋索引（CI 也是跑這個） |
| `npm run preview` | 預覽 `dist/`（搜尋功能只在這裡和線上可用） |
| `npm run sync` | Obsidian 同步（`-- --dry-run` 只預覽、`-- --force` 覆蓋網站端修改、`-- --prune` 一併下架已取消發佈的文章） |
| `npm run resume` | 從執行中的 dev server 產生 PDF 到 `public/cv/`（`-- --private` 會加上電話） |
| `npm run publish` | commit 並 push 所有變更（`-- -m "訊息"`） |
| `npm run check` | 型別檢查 |

## 檔案結構

```
src/content/            所有內容（後台和 Obsidian 同步都寫到這裡）
  singletons/           個人資料、社群、網站設定、履歷章節順序
  categories/ showcase/ 首頁分類與作品（showcase/en、showcase/zh-TW）
  education/ experience/ publications/ news/ skills/
  blog/<slug>/index.md  部落格文章（圖片放在同一個資料夾）
src/views/              頁面（英文和中文共用；src/pages/zh/ 只是包一層）
src/plugins/            Markdown 外掛：Obsidian 影片／圖片尺寸、==highlight==、%%註解%%
public/admin/           Sveltia CMS 設定（config.yml）與自訂編輯元件
integrations/studio/    本機 Studio（只在 npm run dev 時存在）
scripts/                Obsidian 同步、履歷 PDF、發佈
resume/template.typ     履歷 PDF 版型
studio.config.json      Obsidian vault 路徑
```

## 注意事項

- 這個 repo 是公開的（GitHub Pages 免費方案），不要 commit 私人資料。電話之類的資料放 `.env.local`。
- Sveltia CMS 版本鎖定在 `public/admin/index.html`。升級前先在本機測過。
- 線上後台的 GitHub token 會過期，過期後重新產生即可。
