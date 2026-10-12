/* ===== 區段目錄與檔案地圖 =====
   【先讀這段】index.html 是 build.mjs 把 src/ 的 .js 依檔名排序、原樣串接出來的產物（同一個全域作用域，後面的檔案可直接用前面檔案的宣告）。
   勿直接編輯 index.html，也不要整份讀它（240KB）：改 src/ → node build.mjs → index.html 與 src/ 一起提交。baseline.html 是凍結基準，不要改。
   找區段：grep -n "===== \[" 加上 src 目錄下的 .js 檔，每個檔案第一行就是它的區段標頭；只讀需要的檔案。

   檔案地圖（檔名與內容有幾處不完全對應，以此表為準）：
   00-header      本檔（只有註解）
   01-render      [RENDER]   離線渲染旗標 RENDER
   02-config      [CONFIG]   CONFIG／CFG_DEFAULTS（出廠預設）／FONTS／DEMO／LS_* 鍵
   03-parse       [PARSE]    parseSRT／parseTag、LAYOUTS／ENTERS／EXITS／FXS、registerLayout、BRACE_LAYOUTS、{} 強調字
   04-anim 05-build 06-beat 07-loop 08-load   [ANIM] [BUILD]（build() 建一句畫面）[BEAT] [LOOP]（主迴圈 step）[LOAD]（載入 SRT／媒體、note()、快捷鍵）
   09-ui-panel    [UI-PANEL] panel()、位置工具 posPanel、復原重做 pushHist／undo／redo、畫面拖曳、字體載入、css()／save()、refreshEditor()
   10-lay-a 11-fx-enter-exit 16-lay-c 17-lay-d 21-lay-e 22-lay-f 23-lay-g 23-lay-h 23-lay-i   各組版型（17 也有種子亂數 sr()；23-lay-i 是實驗室版型）
   12-ui-editor   [UI-EDITOR] PRESETS 預設組合表、randomize、帶標記 SRT 的 tag／reparse／srtText／exportSRT／exportSRTPlain（句子編輯器本體在 13-editor）
   13-editor      [EDITOR]   句子編輯器（列表＋詳細欄）：editor／edRender／edRowFill／edDetail／applyPackTo／subsReplaced／edLayout
   13-export      [EXPORT]   project.json 匯出、applyPreset()、extra()（預設組合・匯出入面板）
   14-ambient     [AMBIENT]  粒子／音訊／效能降級、applyScene()、extra3()（畫面・粒子・轉場面板）
   15-overlay     [OVERLAY]  transition() 與疊加層 overlays()
   15-scene 15-scene2   [SCENE] [SCENE2]  場景層（&）：regScene、sceneList、sceneBfx、poolLay（自動變化版型的版型池）
   16-beatfx      [BEATFX]   節拍後製（震動／縮放／傾斜／色相）
   18-style 19-pos 20-water   [STYLE]（@ 樣式、|| 副文）[POS]（^ 位置）[WATER]（水波 WebGL）
   23-styles      [STYLES]   風格包 regPack／PACK_KEEP、清除（packReset／clearPack／clearSceneSubs／clearAllLayers）、場景挑選器、extra4()（風格包・場景層・後製面板）
   24-misc        [MISC]     補登預設組合、applyStage（畫面比例）、啟動序列
   25-wizard      [WIZARD]   頂欄浮出選單、「⬆ 匯出…」精靈（WZ_OPTS：用途→做法與限制，來自 README）
   25-quick       [QUICK]    ⚡快捷選單（Ctrl+K）：所有工具／匯出／清除的單一入口 quickActions()
   26-record      [RECORD]   全螢幕錄製、selfCheck()
   27-render-api  [RENDER-API] 離線渲染介面（render/run.mjs 呼叫）
   28-thumbs-idx 28-thumbs  [THUMBS-IDX] [THUMBS]  縮圖預覽（懸停預覽＋🖼 挑選窗；thRow／thBtn／data-th）。idx 由 test/make-thumbs.mjs 產生勿手改；精靈圖在 thumbs/sheet.webp
   （另有 src/index.template.html、src/style.css；build.mjs 會把它們與所有 .js 組成 index.html。）
   檔名前綴有重複（15、16、23），串接順序以完整檔名排序為準；新增檔案請避免改動既有檔案的相對順序。

   常用做法：
   新增版型：該版型區段的 NL 物件、LAYOUTS.push 名單；含 {} 強調字 → BRACE_LAYOUTS；滿版 → FULLBLEED；想放進範例 → DEMO
   新增「工具／匯出」功能：功能本體照舊寫在對應區段 → 到 [QUICK] 的 quickActions() 加一筆 {id,g,t,h,k,on,run} 就會出現在 ⚡快捷選單（Ctrl+K）→ 若要在面板有按鈕，再到 extra()/extra3()/extra4() 加。
   新增面板區段：該區塊開頭呼叫 secAnchor(p,"id")，並把 id 加進 [QUICK] 的 QK_SECS 與「面板跳轉」。
   新增設定鍵：同時加進 CONFIG 與 CFG_DEFAULTS（後者是匯入設定與「清除」的底）。
   新增風格包：regPack(名稱,{…})。清除風格包時會自動還原該包定義過的所有欄位，不需另外維護清單；PACK_KEEP 只用於「從風格包切到別的預設組合」。
   共用函式：匯出＝exportSRT / exportConfig / exportProjectUI；重設＝resetSettings；localStorage 鍵＝LS_CFG / LS_QK / LS_PO。
   面板分組：panel() 結尾的 foldPanel() 依 secAnchor 把扁平內容折成可收合分組（標題見 PANEL_TITLES）；新增區段記得補標題。
   頂欄分四區（載入▾／播放／編輯／匯出…）；舊的 #rec 按鈕藏在頂欄內，只由精靈與快捷選單觸發。字幕整份被換掉要呼叫 subsReplaced()，局部被改要呼叫 refreshEditor()。
   慣例：cur=-2 表示「下一幀要重建這一句的畫面」，改了字幕或設定後要設；selIdx＝編輯器／位置工具目前選的句子索引。
   改完：node build.mjs；用網址加 ?check=1 開啟，F12 主控台會跑 selfCheck()（含快捷表驗證）；完整驗證 npm run check。 */
