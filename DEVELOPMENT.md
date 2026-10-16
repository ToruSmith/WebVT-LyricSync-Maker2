# 開發者文件

> 本檔內容原文搬自 [README.md](README.md)（開發備忘、驗證與 CI、目前已知限制），未改寫字句。貢獻流程請看 [CONTRIBUTING.md](CONTRIBUTING.md)；使用說明在 [README.md](README.md)。

## 開發備忘：新增版型時

- **登記入口**：新版型用 `registerLayout(名稱, 函式, {brace:1, full:1})`——`brace:1`＝`{}` 是關鍵字（寫入 `BRACE_LAYOUTS`）、`full:1`＝滿版（寫入 `FULLBLEED`）。舊版型維持原本的分散登記，不動。`pv-lyric`／`pv-vertical` 就在 `[LAY-G]` 區段用這個入口登記。
- **自我檢查**：網址加 `?check=1`（或在主控台呼叫 `window.__selfCheck()`），會列出漏登記的項目：`NL` 與 `LAYOUTS` 不一致、`BRACE_LAYOUTS`／`FULLBLEED` 不在 `LAYOUTS`、`LAYOUTS` 重複，以及 `CONFIG` 有但 `CFG_DEFAULTS` 沒有的欄位（匯入設定時舊值會殘留）。
- **區段目錄與檔案地圖**：見 `src/00-header.js` 開頭的註解；用 `grep -n "===== \["` 搜 `src/` 下的 `.js` 檔取得區段位置，再只讀需要的檔案。`index.html` 是 `node build.mjs` 由 `src/` 串接出來的產物，不要直接編輯，也不要整份讀它。
- **隨機適配表**：新增版型／場景／特效後，到 `src/13-rand.js` 補 `RND_*` 表（場景主題、版型主題、高能量版型、強烈特效、特效群組…）；沒補不會壞，`?check=1` 的 selfCheck 會列出沒歸類的場景與特效。
- **設定鍵**：新增設定要同時進 `CONFIG` 與 `CFG_DEFAULTS`（後者是匯入設定時的底）。
- **縮圖預覽**：新增版型／場景層／風格包／預設組合後，執行 `node test/make-thumbs.mjs`（只重拍指定項目可加名稱：`node test/make-thumbs.mjs neon,波普`）再 `node build.mjs`，並把 `thumbs/sheet.webp` 與 `src/28-thumbs-idx.js` 一起提交；漏拍的項目介面會自動略過（`?check=1` 會列出）。

- **滿版性質**（整個畫面都是它的一部分，例如邊框、滿版掃描）：把版型名稱加進 `FULLBLEED` 集合（用 `registerLayout(..., {full:1})`，或在 `src/` 對應版型檔補登），位置設定會被忽略。
- **有獨立裝飾元素**（底色框、裝飾線、圖章）：想讓它跟著文字一起對齊就標 `data-pm`（`.ln` 線條自動算）；氛圍性質、不該影響對齊的（星點、整層光暈）標 `data-nm`。此項目前**未自動驗證**（早期版本的 `test/coverage.mjs` 已不在本倉庫），請在網頁上用九宮格位置實際檢查對齊。
- **預設組合**：套用時位置一律還原；文字縮放、文字陰影、鎖定版型只在「上一個組合設過」時才還原，其餘保留使用者手調的值（`CONFIG.presetName` 記錄上一個組合）。新增組合若要設這三個欄位之外、使用者常手調的欄位，請比照 `applyPreset` 的 `PRESET_KEEP`。

## 驗證

本倉庫實際收錄的驗證（需先 `npm install` 與 `npx playwright install chromium`；`baseline.html` 是凍結基準，不要改）：

    npm run check                           # 建置＋lint＋行為測試＋全部回歸檢查（見 package.json 的 scripts.check）
    node test/behavior.mjs                  # 行為測試：載入 SRT／WebVTT／LRC／Big5／UTF-16、標記 SRT 匯入再匯出逐字相同、設定匯入把關、面板摘要、複製按鈕、精靈焦點與 ARIA
    npm run build:check                     # 只檢查 index.html 是否與 src/ 同步（CI 也跑這個）
    npm run lint                            # 全域作用域 lint：重複宣告、未定義名稱、頂層先用後宣告（不需瀏覽器；CI 也跑這個）
    node test/ui-parity.mjs                 # UI 功能對等：舊的面板項目、快捷項目、頂欄項目一個不少
    node test/spec-sync.mjs                 # 功能手冊與程式的清單同步
    node test/scene.mjs                     # 場景層
    node test/styles.mjs [16:9|9:16]        # 風格包・全域底層・版型池
    node test/beatfx-layouts.mjs [9:16]     # 節拍後製與版型
    node verify-kit/regress-all.mjs baseline.html index.html 16:9   # 與凍結基準逐像素回歸
    node render/run.mjs --selftest --seconds 12   # 同一專案渲染兩次，逐格比對，必須完全相同
    node test/make-thumbs.mjs               # 重拍「縮圖預覽」的精靈圖 thumbs/sheet.webp（不屬於 check；見 [README](README.md)「縮圖預覽」）

**CI（GitHub Actions，`.github/workflows/check-build.yml`）**：每次 push／PR 跑三道檢查——`build-in-sync`（只需 Node）、`lint`（只需 Node）、`regression`（裝 Chromium 與 CJK 字體後跑 `npm run check`）。依賴版本由 `package-lock.json` 鎖定（CI 用 `npm ci`），逐像素回歸對瀏覽器版本敏感，升級 Playwright 時請一併更新鎖定檔並重跑 `npm run check`。

以下是早期版本使用過的腳本，**本倉庫目前未收錄**（保留名稱供查找；需要時請補檔，或以上面的項目取代）：
`test/baseline.mjs`、`combos.mjs`、`allsheet.mjs`、`position.mjs`、`project-export.mjs`、`post.mjs`、`chroma.mjs`、`coverage.mjs`、`regress.mjs`、`phases.mjs`、`layers.mjs`、`audio-check.mjs`。

## 目前已知限制

- 必須從第 0 格依序渲染（粒子、閃電等狀態會累積）；任意跳格、多瀏覽器並行尚未支援。
- `--layers` 分層：依賴背景的效果（整頁反白閃光等）在分層後無法還原；分層輸出不套用後製。
- `--chroma` 綠幕：發光、陰影、水波折射一律移除；色彩空間與摳像效果見 [README](README.md)「綠幕輸出」。
- 背景影片的版面與網頁版相同（等比縮放、不裁切）；不同比例的影片會有黑邊。
- 「只輸出字」下，依賴背景的效果（如整頁反白閃光）不會出現。
- Big5 與 GBK 位元組可能互相誤判（提示列會標出判斷結果）；LRC 沒有結尾標記時單句最長顯示 10 秒。
- 面板最上方的「目前這句」摘要是唯讀的，不會把單句設定寫回全域參數（原因見 [README](README.md)「介面導覽」）。
