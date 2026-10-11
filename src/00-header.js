/* ===== 區段目錄（行號會隨編輯變動，請用 grep -n "===== \[" index.html 取得最新行號，再只讀需要的區段）=====
   核心流程：[RENDER] [CONFIG] [PARSE] [ANIM] [BUILD] [BEAT] [LOOP] [LOAD]
   介面　　：[UI-PANEL] [UI-EDITOR] [EXPORT]（extra() 與 editor() 也在 [EXPORT] 區段內）[QUICK]（⚡快捷選單：所有工具／匯出的單一入口）；句子編輯器與預覽並排＝edLayout()（在 [EXPORT] 區段）
   版型　　：[LAY-A] [FX-ENTER-EXIT]（含版型 B）[LAY-C] [LAY-D] [LAY-E] [LAY-F] [LAY-G]（pv-lyric / pv-vertical）；水波 WebGL 在 [WATER]
   樣式與位置：[STYLE]（@ 樣式、|| 副文）[POS]（^ 位置）
   畫面層　：[AMBIENT]（含 extra3 面板）[OVERLAY]
   輸出　　：[RECORD]（即時錄製）[RENDER-API]（離線渲染）　其他：[MISC]
   新增版型要動的地方：該版型區段的 NL 物件、LAYOUTS.push 名單；含 {} 強調字 → BRACE_LAYOUTS；滿版 → FULLBLEED；想放進範例 → DEMO
   新增「工具／匯出」功能：功能本體照舊寫在對應區段 → 到 [QUICK] 的 quickActions() 加一筆 {id,g,t,h,k,on,run} 就會出現在 ⚡快捷選單（Ctrl+K）→ 若要在面板有按鈕，再到 extra()/extra3() 加。
   新增面板區段：該區塊開頭呼叫 secAnchor(p,"id")，並把 id 加進 [QUICK] 的 QK_SECS 與「面板跳轉」。
   共用函式：匯出＝exportSRT / exportConfig / exportProjectUI；重設＝resetSettings；localStorage 鍵＝LS_CFG / LS_QK / LS_PO。
   面板分組：panel() 結尾的 foldPanel() 依 secAnchor 把扁平內容折成可收合分組（標題見 PANEL_TITLES）；新增區段記得補標題。
   改完用網址加 ?check=1 開啟，F12 主控台會跑 selfCheck()（含快捷表驗證）。 */
