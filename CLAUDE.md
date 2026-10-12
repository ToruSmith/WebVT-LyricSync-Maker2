# CLAUDE.md

動態歌詞字幕工具：單頁網頁（`index.html`）＋離線渲染（`render/run.mjs`，Playwright 逐幀截圖＋ffmpeg）。使用說明見 `README.md`，SRT 標記與清單見《動態歌詞字幕工具_功能手冊與SRT標記指南.md》。

## 鐵則

1. **只改 `src/`，不要編輯 `index.html`。** `index.html` 是 `node build.mjs` 把 `src/*.js`（依檔名排序）、`src/style.css`、`src/index.template.html` 原樣串接出來的產物。改完一定要 `node build.mjs`，並把 `index.html` 與 `src/` 一起提交（CI 會檢查兩者同步）。
2. **不要整份讀 `index.html`（240KB）與 `baseline.html`（176KB，凍結的回歸基準，不要改）。** 找程式碼用 `grep -n "===== \[" src/*.js` 找區段，只讀需要的檔案。
3. **先讀 `src/00-header.js`**：裡面有檔案地圖（哪個區段在哪個檔）、新增版型／工具／面板區段／設定鍵／風格包的步驟。
4. 所有 `src/*.js` 共用同一個全域作用域，沒有 import。後面的檔案可用前面檔案的宣告；前面檔案要用後面的東西，只能在「執行時」才碰到（函式內），不能在頂層。檔名前綴有重複（15、16、23），順序以完整檔名排序為準。

## 常用指令

    node build.mjs            # src/ → index.html
    npm run build:check       # 檢查 index.html 是否與 src/ 同步
    npm run check             # 建置＋全部回歸（需 npm install、npx playwright install chromium；沒有瀏覽器就跑不了）
    node test/spec-sync.mjs   # 功能手冊與程式的清單同步（新增版型／場景／風格包後，手冊要補，否則失敗）
    # 網址加 ?check=1，F12 主控台跑 selfCheck()（版型／場景／快捷表登記是否一致）

## 程式慣例（改之前先知道）

- **確定性**：離線渲染要求同一專案逐格結果完全相同。版型、場景層、特效都是「時間的純函數」：只用 `t`／節拍相位／種子亂數 `sr()`，**不要用 `Math.random`、不要累積狀態**。違反會讓 `test/*.mjs` 的逐格雜湊失敗。
- `cur=-2`＝「下一幀要重建這一句的畫面」，改了字幕或設定後要設。`selIdx`＝編輯器／位置工具目前選的句子。`pushHist()` 在改 `subs` 之前呼叫才能復原（只涵蓋字幕，不含 `CONFIG`）。
- 設定：新鍵要同時進 `CONFIG` 與 `CFG_DEFAULTS`（後者是匯入設定與各種「清除／還原」的底）。`CONFIG` 會存進 localStorage（`LS_CFG`）。
- 句子標記語法：`#版型+進場+退場~特效^位置*字體@樣式&場景 文字||副文`。解析在 `parseTag`（`03-parse.js`），輸出在 `tag()`（`12-ui-editor.js`）。**改語法要同時改兩處，離線渲染才一致。**
- 風格包：`regPack(名稱,{…})`（`23-styles.js`）。清除風格包（`packReset`）會自動還原該包定義過的所有欄位，新增風格包不需另外維護還原清單。
- 工具／匯出／清除功能的入口集中在 `25-quick.js` 的 `quickActions()`（Ctrl+K）；面板按鈕在 `extra()`／`extra3()`／`extra4()`。UI 對等測試（`test/ui-parity.mjs`）只檢查「舊項目不消失」，所以可以新增、不能無故刪改既有的面板項目與快捷 id。
- 程式風格偏密集（一行多個語句）。用 `Edit` 時請先 `Read` 目標行，`old_string` 取足夠唯一的片段；不要為了排版整檔重排（會讓 diff 無法檢視）。

## 縮圖預覽（`28-thumbs.js`）

- 版型／場景層／風格包／預設組合的懸停預覽與 🖼 縮圖挑選窗；**純 UI，不碰 CONFIG／subs／渲染**，`RENDER` 時不啟用。資料是 `thumbs/sheet.webp`（精靈圖，首次需要才載入，檔案不在就靜默略過）＋ `src/28-thumbs-idx.js`（`TH_DATA`，**由 `node test/make-thumbs.mjs` 產生，別手改**）。
- 接入方式只有兩種：① 元素加 `data-th="lay|scene|pack|preset:名稱"`（chipBox 的第 6 參數 `kind`、`edPackBtns`、快捷選單 `thFromId(a.id)` 已接好）；② 下拉選單用 `thRow(select,kind)` 包起來（窄工具列用 `thBtn`），kind＝`lay`／`scene`／`pack`／`pre`（`pre`＝預設組合，自動分辨風格包或一般預設）。挑選窗只是改 `select.value` 並觸發 `change`，原本的 `onchange` 照跑，所以不要在別處重複寫套用邏輯。
- 新增版型／場景／風格包後：`node test/make-thumbs.mjs`（可帶名稱只重拍部分）→ `node build.mjs`，把 `thumbs/sheet.webp`、`src/28-thumbs-idx.js` 與 `index.html` 一起提交。沒重拍也不會壞，只是該項目沒有預覽（`?check=1` 的 selfCheck 會列出）。

## 已知落差（不是你搞壞的）

- README 提到的部分測試腳本（`test/chroma.mjs`、`post.mjs`、`position.mjs` 等）不在本倉庫；實際存在的見 README「驗證」。
- `test/_dbg.mjs`、`_err.mjs`、`_sheet.mjs` 是臨時除錯腳本，寫死 `/tmp/sh`，不屬於 `npm run check`（縮圖改用正式的 `test/make-thumbs.mjs`，同樣不屬於 check）。
- 功能手冊若沒有「風格包／場景層／7.6」等章節，`spec-sync` 會失敗：代表手冊比程式舊，需補手冊而不是改測試。

## UI 結構備忘（頂欄・編輯器・匯出精靈）

- 頂欄 `#bar` 分四區；舊 id（`#fs #fm #demo #rec #ed #rnd #unlock #qkb #tg #play`）一律留在 `#bar` 內（`ui-parity` 與 `selfCheck` 會檢查），`#rec` 是隱藏按鈕，由精靈與 ⚡快捷觸發。浮出選單用 `position:fixed`（`#bar` 有橫向捲動），`#bar` z-index 要高於面板與編輯器。
- 句子編輯器在 `src/13-editor.js`（列表＋詳細欄）。字幕整份被換掉 → `subsReplaced()`；局部被改 → `refreshEditor()`；位置被外部改 → `edSync(i)`。編輯器內所有寫入走 `E(fn,key)`（`pushHist` → 改 → `cur=-2` → 更新該列）。改文字或版型後要呼叫 `reparse(x)`（`12-ui-editor.js`），否則 `plain/br/hl` 會和版型不一致。
- 匯出精靈在 `src/25-wizard.js`，用途說明集中在 `WZ_OPTS`；指令由 `projCmd()` 加旗標組成。
