# Maker2 移植 JIZURA 簡單部品：實作規格

Oct 12, 2026 · @Toru Smith

## 目標與範圍

目標：在 Maker2 加入33 項從 JIZURA 改寫的部品（含 3 項準備），讓影片上的字幕更精緻，而且不遮影片。分四個階段做，每階段獨立驗收，可以隨時停在任何一階段。

依據是同一份分析文件《JIZURA 部品移植盤點》：九組部品共 637 個，其中 242 個列為簡單。這份規格只取其中最不遮影片、最貼近「高級字幕」的一批。

| 階段 | 內容 | 數量 | 預估工時 |
| --- | --- | --- | --- |
| 0 地基 | 共用零件：髮絲線與角標、逐字進度取樣器、回歸檢查 | 3 項準備 | 0.5 到 1 天 |
| 1 版型 | 余白、罫線組、全幅字送り、行中強調、級数上げ | 5 個版型 | 2 到 3 天 |
| 2 動作 | 登場、退場、保持 | 約 16 個 | 2 到 3 天 |
| 3 外觀與鏡頭 | 文字加工、鏡頭、風格包 | 12 個 | 2 到 3 天 |

工時是我的粗估，沒有實測，依接手者熟悉程度會差一倍。

**明確不做：**

- 裝飾、畫面效果、轉場三組（簡單項只有 16、13、16 個，價值低）。
- 任何要逐詞時間、碎片或粒子、像素運算、大面積圖形的部品。
- JIZURA 版型自帶的小標籤：羅馬字、編號、時間碼。
- 恐怖風格（名稱以 `hr` 開頭）全部。
- 不修改任何既有版型、進場、退場的行為，不動 `baseline.html`。

## 開工前必讀

先讀 Maker2 的 `CLAUDE.md` 和 `src/00-header.js`（檔案地圖與「新增版型」步驟），再動手。以下是最容易踩到的五件事。

1. **只改 `src/`，不要編輯 `index.html`。** 改完執行 `node build.mjs`，把 `index.html` 和 `src/` 一起提交。CI 會檢查兩者同步。不要整份讀 `index.html`（240KB）和 `baseline.html`（凍結的回歸基準，不要改）。
2. **確定性。** 離線渲染要求同一專案逐格結果完全相同。版型、動作都要是「時間的純函數」：只用 `t`、節拍相位、種子亂數 `sr()`。不要用 `Math.random`，不要累積狀態。違反會讓 `test/*.mjs` 的逐格雜湊失敗。
3. **共用全域作用域，沒有 import。** 後面的檔案可用前面檔案的宣告，頂層不能碰後面的東西。新增檔案不要改到既有檔案的排序。
4. **先放實驗區。** 新版型一律先進 `LAB_LAYOUTS`（見 `src/23-lay-i.js`），驗收過、Toru 點頭才升正式。實驗區預設不寫進 AI 規格書。
5. **程式風格偏密集。** 用 Edit 時先讀目標行，不要整檔重排。沒有確定要用的共用函式，先到原始碼實際搜。

**新增部品的位置與寫法（已讀原始碼確認）**

| 要加的東西 | 寫在哪 | 怎麼註冊 |
| --- | --- | --- |
| 版型 | 新檔 `src/23-lay-j.js`（統一放這裡，檔名排在 `23-lay-i` 之後） | `registerLayout("名稱",(sb,c,w,big,sm,dur,list)=>{…},{brace?,full?})`，再把名稱加進 `LAB_LAYOUTS` |
| 登場 | `src/04-anim.js` 的 `enter()` 裡的關鍵影格表 `k` | 表裡加一項，再 `ENTERS.push("名稱")`（見 `src/11-fx-enter-exit.js` 第 39 行的寫法） |
| 退場 | `src/11-fx-enter-exit.js` 的 `EXTRA_EX` | 表裡加一項，再 `EXITS.push("名稱")` |
| 持續特效（保持） | `src/11-fx-enter-exit.js` 的 `FXH` | 物件裡加一個函式，再 `FXS.push("名稱")` |
| 風格包 | `src/23-styles.js` | `regPack(名稱,{…})` |

這張表是我讀原始碼得到的。文字加工（`@` 樣式）和鏡頭的接入點我沒有確認，見對應階段的說明。

**既有的測試與檢查：**

```
node build.mjs            # src/ → index.html
npm run build:check       # 檢查 index.html 是否與 src/ 同步
npm run check             # 建置加全部回歸（需 npm install 與 npx playwright install chromium）
node test/spec-sync.mjs   # 手冊與程式清單同步；新增版型、場景、風格包後手冊要補
# 網址加 ?check=1，F12 主控台跑 selfCheck()
```

每次提交前都要跑完上面四個。特別注意沒有瀏覽器就跑不了 `npm run check`。

**JIZURA 原始碼怎麼找：** 備份在 ToruSmith/JIZURA（MIT 授權）。用 `grep -n "'部品key'" src/*.js` 找定義。每個部品是 `J.register(組, key, 定義)` 或組內的註冊函式，其中 `apply(env, it, p)` 是逐字函式。繁中字體對照表在 JIZURA 的 i18n 檔。

**授權：** JIZURA 是 MIT。Maker2 的 repo 目前沒有 LICENSE 檔，`package.json` 寫 ISC。改寫或整段搬過來的程式碼，要在檔頭註明來源與 MIT 授權宣告，這一點請 Toru 確認怎麼處理。

## 階段 0：地基

先做三件共用的準備，後面每個部品才不用重寫。讀過 Maker2 的 `enter()` 之後，我改了原本的想法：登場、退場在 Maker2 是「關鍵影格表」，這批簡單部品約 16 個，直接讀 JIZURA 的 `apply` 再手寫成關鍵影格最容易維護，不需要做一個自動取樣器。取樣器需要假造 JIZURA 的 `env`（畫布尺寸、字級、種子），反而是新的維護負擔。

### 0-1 髮絲線與角標零件

用途：階段 1 的五個版型都要畫細線和小方點。新檔 `src/23-lay-j.js` 頂端加兩個函式：

- `hair(c, css, delay)`：在容器 `c` 加一條 1px 細線。`css` 給位置與長度（用 `cqw`／`cqh`），線色用 `var(--c)` 或 `var(--a)`。進場用 `scaleX` 從 0 到 1，`transform-origin` 由 `css` 決定。要在細線標 `data-nm=1`（非主文裝飾，規格見「實驗區版型」的寫法）。
- `tick(c, css, delay)`：同上，但是一個小方點（邊長約 `.5em`），進場用 `scale(0→1)`。

驗收：線和點都是時間的純函數（用 `A()`）；在 16:9 和 9:16 兩種畫面比例下都不會切到邊；深色和淺色影片背景上都看得清楚（線色要加一層細陰影，不要依賴不透明底色）。

### 0-2 可調字級上限

大字類版型（大字挿み、級数上げ）容易變成遮影片的巨字。新增一個 `capSize(z, ratio)` 工具，把字級限制在畫面高度的某個比例以下（預設 0.28）。版型內用 Maker2 既有的 `_fz(sb,big,倍率)` 算字級後，再套 `capSize`。驗收：在 9:16 下輸入 3 字和 20 字的句子，字都在畫面內。

### 0-3 回歸基準

在開始之前跑一次 `npm run check`，記下結果，後面每階段結束都要同樣通過。既有逐格雜湊測試不能變。

**階段 0 完成定義：** `src/23-lay-j.js` 存在且頂端有0-1 和 0-2 的工具；`node build.mjs`、`npm run build:check`、`npm run check` 全部通過；現有內容的行為沒有變。

## 階段 1：五個版型

每個版型都是 `src/23-lay-j.js` 裡的一個 `registerLayout`，先進 `LAB_LAYOUTS`。共同規則：只用文字加細線，不畫底板；所有非主文的線和點都標 `data-nm=1`；字級預設經過 0-2 的 `capSize`；不加羅馬字、編號、時間碼；進場退場預設沿用句子自己的 `sb.en`／`sb.ex`。執行順序照下面編號，前兩個最簡單，建議先做，給 Toru 看過再繼續。

JIZURA 原始碼在 `src/11p_typo1.js`（五個都在這個檔，用 `grep -n "tyMargin"` 等找到定義）。這五個我都讀過到繪圖主體，其中余白和罫線組讀完整個實作。

### 1-1 余白（tyMargin）

- **畫面：** 文字靠畫面角落（左下、右上、右下、左中四選一），旁邊拉出一條髮絲線，線尾收在一個小方點。
- **程式：** 用 `hair`、`tick`；角落由句子編號輪替，不用亂數。文字最多佔畫面寬度 55%，超過時自動換行。
- **動畫：** 線先拉出（約 0.3 秒），文字再淡入，縮進這個視覺重心。
- **驗收：** 四個角落都不超出安全區；文字和線不重疊；一句 1 字和 30 字都能顯示。

### 1-2 罫線組（tyBaseline）

- **畫面：** 2 到 3 行文字，每行下方一條橫跨畫面的髮絲基線，關鍵字下再加一條強調色粗線。
- **程式：** 用 `{}` 標記當關鍵字（加入 `{brace:true}`），省掉原版的自動挑字；沒有 `{}` 時不畫粗線。基線用 `hair`。
- **動畫：** 基線由左至右依行拉出，文字跟著淡入，粗線最後拉出。
- **驗收：** 一、二、三行分別測；粗線長度跟關鍵字寬度一致。

### 1-3 全幅字送り（tyFullTrack）

- **畫面：** 每個字平均撐開到整個畫面寬度（直式畫面改為高度），像超大字距的標題，多半附一條細線。
- **程式：** `display:flex; justify-content:space-between`，左右留 6cqw。句子超過 12 字時改為兩行各自撐開。
- **動畫：** 字從中心向兩側散開（用 `chars()` 逐字 translate），線再拉出。
- **驗收：** 2 字和 12 字都不亂；帶標點符號的句子不分散到看不懂。

### 1-4 行中強調（tyLineFocus）

- **畫面：** 顯示整句歌詞，這一鏡的片段用底線、圓點或框線標出。
- **程式：** 用 `{}` 當「這一鏡的片段」（加入 `{brace:true}`），其餘文字降低透明度到 0.45。標記用 span 加 `::after`，三種樣式由句子編號輪替。
- **動畫：** 整句先淡入，再把標記拉出。
- **驗收：** 沒有 `{}` 時整句正常顯示不報錯；`{}` 在句首、句尾、中間各測一次。

### 1-5 級数上げ（tyScaleSteps）

- **畫面：** 一句拆成 2 到 7 段，字級依比例逐段放大（或縮小），基線對齊。
- **程式：** 依逗號、空格切段；沒有可切的就平均切。用 flex 與 `align-items:baseline`。最大一段經過 `capSize`。
- **動畫：** 由小到大依序淡入。
- **驗收：** 2、4、7 段各測一次；直式畫面不溢出。

**階段 1 完成定義：** 五個版型都能在版型下拉選單選到；用一份測試 SRT（附在 `test/` 下，約 10 句，含短句、長句、帶 `{}` 的句子）和一段深色影片、一段淺色影片，分別截圖，16:9 和 9:16 各一組；`?check=1` 的 `selfCheck()` 沒有新報錯；縮圖與手冊按「驗收與交付」的規定補。

## 階段 2：登場、退場、保持（共 16 個）

這一階段不動任何既有項目，只在表裡新增。每個部品的做法：到 JIZURA 用 `grep -n "'日文key'" src/*.js` 找到原版 `apply` 裡的數字（位移量、模糊量、延遲間隔），再照下表的寫法重寫成 Maker2 的關鍵影格。不要嘗試把 JIZURA 的 `apply` 整段搬過來，它依賴 Canvas 的 `env`。每個部品的名稱用 ASCII 連字號，避免和現有名稱重複。

### 2-1 登場（6 個，寫在 `src/04-anim.js` 的 `enter()` 關鍵影格表）

逐字類需要傳入 `list`（`chars()` 的結果），照現有 `stagger`、`ripple` 的寫法用 `list.forEach((c,i)=>A(c,kf,{duration:d,delay:i*80/CONFIG.speed}))`。

| Maker2 名稱 | JIZURA 來源 | 關鍵影格 | 注意 |
| --- | --- | --- | --- |
| `blur-stagger` | ブラー段差（blurStagger） | 逐字：`opacity:0; filter:blur(12px); translateY(1cqh)` → `none`，延遲每字 60ms | 無 `list` 時退回整句淡入 |
| `track-in` | 字間収束（trackIn） | 整句：`letterSpacing:.6em; opacity:0` → 目前字距與 `opacity:1` | 終點字距要讀 `CONFIG.spacing`，不要寫死 |
| `skew-in` | スキュー（skewIn） | `opacity:0; translateX(-6cqw) skewX(-20deg)` → `none` | 直式版型要改成從上方進入 |
| `wipe` | ワイプ（wipe） | `clipPath:inset(0 100% 0 0)` → `inset(0)` | 照現有 `split-reveal` 的 `clipPath` 寫法 |
| `clock-wipe` | 時計回り（clockWipe） | 用 `CSS.registerProperty` 註冊 `--ang`，`mask-image:conic-gradient(#000 var(--ang),transparent 0)`，`--ang` 從 0deg 跑到 360deg | 這個最有風險：離線渲染的 Chromium 如果不支援，就改成 `wipe` 的斜向版本，並在 PR 裡說明 |
| `neon-on` | ネオン点灯（neonOn） | 透明度閉爆序列 `0, 1, .3, 1, .6, 1`，同時 `textShadow` 由 0 長到 `0 0 16px var(--a)` | 不要改到文字本色 |

### 2-2 退場（6 個，寫在 `src/11-fx-enter-exit.js` 的 `EXTRA_EX`）

退場表的項目是整句一組關鍵影格（見 `dissolve`、`glitch-out`）。逐字延遲的退場要先確認退場路徑能拿到 `.ch` 逐字元素；拿不到就改用整句版本，不要硬改既有退場的呼叫方式。

| Maker2 名稱 | JIZURA 來源 | 關鍵影格 |
| --- | --- | --- |
| `blur-out-stagger` | 字ごとボケ（blurOutStagger） | `opacity:1; blur(0)` → `opacity:0; blur(10px)`，逐字延遲 |
| `track-out` | 字間が開く（trackOutWide） | `letterSpacing` 從目前值長到 `.8em`，同時淡出 |
| `vacuum` | 一点に吸われる（vacuumOut） | `scale(1)` → `scale(0)` 指向文字中心，加 `blur(6px)` 與淡出 |
| `sweep-cover` | バーで隠す（sweepCover） | 一根 0.3em 寬的強調色線由左掃到右，線左側的文字用 `clipPath:inset(0 0 0 X)` 隱藏，兩個動畫同時長度 |
| `wipe-out` | ワイプ退場（wipe） | `clipPath:inset(0)` → `inset(0 0 0 100%)` |
| `clock-out` | 時計ワイプ（clockOut） | 和 `clock-wipe` 同一個寫法，反向。如果 `clock-wipe` 退回為斜向，這個也要一起退回 |

### 2-3 保持（4 個，寫在 `src/11-fx-enter-exit.js` 的 `FXH`）

`FXH` 的項目是函式 `(fw, dur)`，`fw` 是整句容器，用 `cl(fw)` 拿逐字元素，照 `wave`、`shimmer` 的寫法。這四個幅度都很小，故意挑的。

| Maker2 名稱 | JIZURA 來源 | 做法 |
| --- | --- | --- |
| `breathe` | 呼吸（breathe） | 整句 `scale` 1 → 1.03 → 1，4 秒一週期，`ease-in-out`，無限重複 |
| `track-breathe` | 字間の呼吸（trackBreathe） | 整句 `letterSpacing` 由目前值來回變化 ±0.03em，週期 5 秒 |
| `zoom-slow` | じわ寄り（zoomSlow） | 整句 `scale` 1 → 1.06，長度 `dur`（跟句子時間同長），`linear`，不重複 |
| `focus-rack` | ピント送り（focusRack） | 逐字輪流模糊 `blur(0)` → `blur(1.5px)` → `blur(0)`，每字延遲 `dur/字數`，跟 `highlight-word` 的節奏一致 |

驗收（三組共用）：到編輯器的進場、退場、持續特效下拉選單都能選到新項；用 SRT 標記 `#版型+進場+退場~特效` 手寫一句也能套用；離線渲染兩次結果逐格相同（驗確定性）；手冊的進場、退場、特效清單補上新項（`node test/spec-sync.mjs` 會檢查）。

**階段 2 完成定義：** 上述 16 項都註冊、都能用，每項一張 16:9 截圖（登場和退場各截進行中的一幀）；`npm run check` 通過。

## 階段 3：外觀、鏡頭、風格包（共 12 個）

讀過 Maker2 的原始碼後，這一階段和我先前的建議有兩處不同，先說明：

- Maker2 的 `@` 樣式已有 10 種（`src/18-style.js`）：`neon`、`glow-soft`、`chromatic`、`longshadow`、`trail`、`outline`、`stamp`，加上 `gradient`、`karaoke`、`glitch`。所以 JIZURA 的「長い影」和「ネオン管」已有類似項，不再做。
- Maker2 沒有「鏡頭」這個機制。「ゆっくり寄る」和階段 2 的 `zoom-slow` 重複，「拍でズーム」和節拍後製 `beatZoom` 重複。所以鏡頭改成加 4 個不重複的「持續特效」。

### 3-1 文字加工（5 個，寫在 `src/18-style.js` 的 `ST`）

`ST` 的項目是 `e=>{...}`，用 `addSh(e, 陰影字串)` 疊加陰影。新增的名稱要同時讓 `@` 標記和編輯器選單看得到（照 `neon` 的註冊方式查一下它在哪些地方被列出：`grep -n "longshadow" src/*.js`，每個出現的地方都要跟著補，我沒有逐一確認）。

| Maker2 名稱 | JIZURA 來源 | 做法 |
| --- | --- | --- |
| `double-line` | 二重縁（doubleOutline） | 兩層疊在同一個字上：外層粗描邊用 `paint-order:stroke fill` 加 `-webkit-text-stroke:.12em var(--a)`，內層細描邊用第二個同文字元素 `-webkit-text-stroke:.03em var(--c)`。寫法可參考 `23-lay-i.js` 的 `cute-outline` |
| `emphasis-dot` | 傍点（emphasisDots） | CSS `text-emphasis: filled dot var(--a)`，`text-emphasis-position: over`；直式時用 `right` |
| `gloss-sweep` | 光沢スイープ（gradientSweep） | 逐字用 `background-clip:text` 的亮帶漸層，照 `gradient-flow` 的寫法（注釋說得很清楚：要畫在每個字上，不要畫在父層），但只掃一次，不循環 |
| `shadow-stack` | 多重影（shadowStack） | 三層水平偏移陰影，偏移量 `.04em`、`.08em`、`.12em`，透明度遞減 |
| `split-tone` | 上下二色（splitColor） | `linear-gradient(180deg,var(--c) 50%,var(--a) 50%)` 加 `background-clip:text`，無逐字拆解需求 |

### 3-2 鏡頭類持續特效（4 個，寫在 `FXH`）

寫法和階段 2 的保持一樣。重點：用 `translate`、`scale` 這些獨立屬性（`wave` 就是這樣寫），不要用 `transform`，否則會和登場動畫的 `transform` 打架。只動字幕容器 `fw`，不要動 `#stage`（那會連影片一起動，而且和節拍後製打架）。

| Maker2 名稱 | JIZURA 來源 | 做法 |
| --- | --- | --- |
| `cam-pull` | 引き（pullOut） | `scale` 1.06 → 1，長度 `dur`，`linear` |
| `cam-pan-l` | 左パン（panL） | `translate` `1.5cqw 0` → `-1.5cqw 0`，長度 `dur`，`linear` |
| `cam-pan-r` | 右パン（panR） | 反向 |
| `cam-tilt-up` | ティルト（tiltUp） | `translate` `0 1.5cqh` → `0 -1.5cqh`，長度 `dur`，`linear` |

位移量故意很小（不到畫面寬度的 3%），目的是讓字幕「有呈現感」而不是「在動」。

### 3-3 風格包（3 個，寫在 `src/23-styles.js`）

Maker2 的風格包是一組設定（字體、字重、字距、字色、強調色、粒子、版型池等，見現有 16 個的寫法），和 JIZURA 的「風格」（配色加字體角色）不完全同級。對應方式：取 JIZURA 風格的第一組配色的文字色與強調色（`J.STYLES.鍵.schemes[0]` 的 `fg` 和 `accent`），不要帶背景色。

| 包名 | JIZURA 來源 | 版型池（用前面新增的版型） |
| --- | --- | --- |
| `金夜` | 金夜（gold） | `margin`、`baseline`、`line-focus` |
| `深海` | 深海（ocean） | `full-track`、`margin` |
| `單色座標` | モノ・RGB（mono） | `scale-steps`、`baseline` |

字體只用 Maker2 `FONTS` 表裡已有的鍵，這一輪不新增字體檔。包名要先確認和現有 16 個不重複（我所提的「金夜」等三個名稱可能和現有的「青墨」「夜色」重疑，要改名就改。上表的版型池名稱只是代號，實際註冊名稱以階段 1 為準）。

**階段 3 完成定義：** 12 項都註冊、都能用；風格包套用後的樣式在深色和淺色影片上各截一張圖；手冊、縮圖、`npm run check` 都通過。

## 驗收與交付

每個階段開一個獨立分支和一個 PR，不要四個階段合成一個。每個 PR 都要讓 Toru 能用截圖判斷「要不要繼續」。

| 階段 | 分支名稱 | PR 必須包含 |
| --- | --- | --- |
| 0 | `port/jizura-0-base` | `src/23-lay-j.js`、`index.html`，`npm run check` 的輸出 |
| 1 | `port/jizura-1-layouts` | 五個版型、測試 SRT、截圖（16:9 和 9:16、深色和淺色影片各一組）、手冊、縮圖、`index.html` |
| 2 | `port/jizura-2-motion` | 16 個動作、截圖、手冊、`index.html` |
| 3 | `port/jizura-3-look` | 12 項、截圖、手冊、縮圖、`index.html` |

**每個 PR 都要跑的檢查（全部通過才能提交）：**

1. `node build.mjs`，且 `index.html` 和 `src/` 一起提交。
2. `npm run build:check`。
3. `npm run check`（需要 Playwright 和 Chromium）。
4. `node test/spec-sync.mjs`：手冊（《動態歌詞字幕工具\_功能手冊與SRT標記指南.md》）要補上新的版型、進場、退場、特效、樣式、風格包。
5. `node test/make-thumbs.mjs`（可帶名稱只重拍新增的）再 `node build.mjs`，把 `thumbs/sheet.webp` 和 `src/28-thumbs-idx.js` 一起提交。沒重拍不會壞，只是該項目沒有預覽。
6. 網址加 `?check=1`，`selfCheck()` 沒有新的警告。
7. 離線渲染同一份測試 SRT 兩次，兩次逐格雜湊相同。

如果某個檢查在你的環境跑不了（例如沒有瀏覽器），在 PR 裡寫明哪一項沒跑、為什麼，不要省略不說。

**禁止事項：** 不改 `baseline.html`；不改既有版型、進場、退場的行為；不用 `Math.random`；不加外部字體檔或程式庫；不把 JIZURA 的 Canvas 程式碼整段貼進來。

**遇到阻礙時：** 規格和原始碼對不上、或某個部品在 Maker2 做不出來（例如 `clock-wipe`），就跳過該項並在 PR 裡寫明，繼續做其他項。不要為了湊數量而勉強做。

**授權與來源註記：** `src/23-lay-j.js` 檔頭要寫「部分部品改寫自 JIZURA（852wa/JIZURA，MIT）」，給每個部品一行註解寫明對應的 JIZURA key。是否要加 LICENSE 檔，由 Toru 決定。
