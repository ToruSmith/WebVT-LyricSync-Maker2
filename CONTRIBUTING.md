# 貢獻指南

這份文件是「人類貢獻流程」的唯一來源。想先了解工具怎麼用，請看 [README.md](README.md)；想了解驗證項目與已知限制，請看 [DEVELOPMENT.md](DEVELOPMENT.md)；程式碼慣例（給人也給 AI 助手）在 [CLAUDE.md](CLAUDE.md)。

## 從 clone 到 PR

需要 Node.js（`^20.19.0 || ^22.13.0 || >=24`，CI 用 22）。

    git clone https://github.com/ToruSmith/WebVT-LyricSync-Maker2.git
    cd WebVT-LyricSync-Maker2
    npm install
    npx playwright install chromium     # 行為測試與逐像素回歸需要瀏覽器
    node build.mjs                      # src/ → index.html
    npm run check                       # 建置＋lint＋行為測試＋全部回歸；先確認改動前是綠的

接著：

1. 開一個分支，**只改 `src/`**（再次強調：不要直接編輯 `index.html`）。找程式碼先讀 `src/00-header.js` 的檔案地圖，用 `grep -n "===== \[" src/*.js` 找區段。
2. 改一個小地方（例如改一句提示文字、或新增一個行為測試案例），重建並檢查：

        node build.mjs
        npm run check

3. 把 `src/` 與重建後的 `index.html` **一起提交**，開 Pull Request。PR 範本會列出檢查清單。

沙箱或已預裝 Chromium 的環境若啟動失敗（版本對不上），請設 `CHROME_PATH` 指向現成的 Chromium，不要執行 `playwright install`；細節見 [CLAUDE.md](CLAUDE.md)「本機跑瀏覽器測試」。

## 必須遵守的規則

**(a) 改 `src/` 後必須重建並一起提交 `index.html`。** `index.html` 是 `node build.mjs` 把 `src/` 串接出來的產物；CI 的 `build-in-sync` 會檢查兩者同步，不同步就失敗。

**(b) `index.html` 發生合併衝突時，不要手動合併。** 先只解決 `src/` 裡的衝突，再重新產生：

    git checkout --theirs index.html   # 或 --ours；內容之後會被覆蓋，選哪邊都可以
    node build.mjs
    git add index.html

**(c) 新增版型／場景／特效／風格包要補的表。** 登記入口、隨機適配表（`src/13-rand.js` 的 `RND_*`）、縮圖、設定鍵（`CONFIG` 與 `CFG_DEFAULTS`）、功能手冊同步等，請看 [CLAUDE.md](CLAUDE.md)「程式慣例」與「縮圖預覽」兩節；[DEVELOPMENT.md](DEVELOPMENT.md)「開發備忘：新增版型時」也有對應步驟。這裡不重複內容，以那兩處為準。`?check=1` 加上 `selfCheck()` 會列出漏登記的項目。

**(d) 不得為了通過測試而更新 `baseline.html`。** 它是凍結的逐像素回歸基準。回歸失敗代表畫面和基準不同：若是你不預期的變化，請修程式；若是刻意的視覺改動，請在 PR 說明原因，由維護者決定，不要自己改基準。

另外兩條會讓離線渲染結果不一致，請特別留意（細節在 [CLAUDE.md](CLAUDE.md)）：

- **確定性**：版型、場景層、特效都是「時間的純函數」，不要用 `Math.random`、不要累積狀態。
- **標記語法**：`#版型+進場+退場~特效^位置$…` 的解析（`parseTag`）與輸出（`tag()`）要**同時**修改，否則離線渲染會與網頁不一致。

## 回報問題

請用 issue 範本，附上瀏覽器與版本、能重現的 SRT 範例（用自己編的合成內容，不要貼受版權保護的歌詞）、以及錯誤畫面或主控台（F12）訊息。
