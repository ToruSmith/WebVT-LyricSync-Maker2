/* ===== [WIZARD] 頂欄浮出選單（載入▾／更多▾）＋「⬆ 匯出…」精靈：問「你要拿去做什麼？」再對應到錄製、離線 MP4、透明字層、分層、綠幕、SRT、備份。
   README 的決策知識（什麼時候用哪種輸出、有哪些限制）寫在 WZ_OPTS 的 why／notes；要調整說明只改這張表。
   精靈只負責「選擇與說明」，實際動作都呼叫既有函式：#rec（錄製）、exportProjectUI、exportSRT、exportSRTPlain、exportConfig。 ===== */
if(!RENDER){
 /* --- 浮出選單：position:fixed，不被 #bar 的橫向捲動裁掉 --- */
 const closeMenus=()=>document.querySelectorAll(".menu.on").forEach(m=>m.classList.remove("on"));
 document.querySelectorAll("#bar .mb").forEach(b=>b.onclick=e=>{e.stopPropagation();const m=$("#"+b.dataset.menu),on=!m.classList.contains("on");closeMenus();
  if(on){m.classList.add("on");const r=b.getBoundingClientRect();m.style.top=(r.bottom+2)+"px";m.style.left=Math.max(4,Math.min(r.left,innerWidth-m.offsetWidth-4))+"px"}});
 document.addEventListener("pointerdown",e=>{if(!e.target.closest(".menu,.mb"))closeMenus()});
 document.querySelectorAll(".menu").forEach(m=>m.addEventListener("click",()=>setTimeout(closeMenus,0)));   /* 下一個 tick 才關：讓檔案選擇器（label→input）先被觸發 */
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenus()});
}
const WZ_OPTS=[
 {id:"rec",ico:"🎥",t:"直接錄製（最快）",s:"分享、預覽、不想裝任何東西",
  why:"在瀏覽器裡直接錄這個分頁，結束後自動下載 MP4／WebM。不用安裝任何東西。",
  notes:["授權視窗請選「此分頁」，並勾選「分享分頁音訊」，否則沒有聲音（示範模式本來就是靜音）。","電腦吃力時可能掉幀：改 30 fps、開輕量模式、縮小畫面比例，或改用「高品質 MP4」離線渲染。","錄製中會隱藏所有工具列；按 Esc 或停止共用即可結束。"]},
 {id:"mp4",ico:"🎬",t:"高品質 MP4（離線渲染）",s:"正式成品、不掉幀",
  why:"不錄螢幕，逐幀截圖後用 ffmpeg 合成 MP4，不會掉幀，可指定解析度與 60 fps，還能加輝光、色差、調色與動態模糊。",
  notes:["需要 Node.js 與 ffmpeg（終端機輸入 ffmpeg -version 要能執行）；第一次要 npm install 與 npx playwright install chromium。","流程：① 下載 project.json 放進專案的 input/　② 音樂（和背景影片）自己放進 input/　③ 在專案資料夾貼上指令。","解析度依目前畫面比例（短邊 1080）；比例和預覽不同，版面就會不同。","輝光／色差／調色／動態模糊只影響這支 MP4，網頁預覽看不到。"]},
 {id:"alpha",ico:"🔲",t:"透明字層（疊在影片上）",s:"在剪輯軟體裡疊字",
  why:"只輸出文字，背景透明（ProRes 4444 .mov，加 --webm 另出較小的 VP9 透明版）。放進 Premiere、DaVinci 等疊在你的影片上。",
  notes:["不含背景與音訊；依賴背景的效果（整頁反白閃光等）不會出現。","背景影片、輝光／色差／調色在這個模式不適用（會被忽略）。"]},
 {id:"layers",ico:"🧩",t:"分層輸出（文字層＋背景層）",s:"想在剪輯軟體分別調字與背景",
  why:"同一輪渲染出兩個檔：text_alpha.mov（透明文字）與 ambient.mp4（背景、粒子、暗角、噪點等氛圍，含音訊），在剪輯軟體疊回去即可還原畫面。",
  notes:["兩層同步（氛圍狀態只推進一次）。","渲染時間約為單層的 1.3–2 倍；不套用後製；整頁反白閃光這類依賴背景的效果在分層後無法還原。"]},
 {id:"chroma",ico:"🟩",t:"綠幕（純色背景＋文字）",s:"剪輯軟體不吃透明檔",
  why:"輸出一般 MP4：背景是純色，只留文字，在剪輯軟體用色鍵摳掉。",
  notes:["在剪輯軟體用取樣工具從畫面上吸背景色，不要手打色碼（色彩空間轉換會讓數值偏掉）；摳像時開「去除溢色」。","發光與陰影（@neon、@glow-soft、@trail、@longshadow、@chromatic）、水波折射在綠幕下都不會出現。","文字顏色接近背景色時請換一個鍵色（例如藍幕）。","沒有在真實的剪輯軟體裡實際摳過像；背景影片畫面被忽略，音軌仍會混入。"]},
 {id:"srt",ico:"📝",t:"字幕檔（SRT）",s:"丟給其他字幕工具或平台",
  why:"「帶標記」保留版型、動畫、樣式、場景、位置、字體，之後能再匯入或離線渲染；「純文字」不含任何標記，給一般播放器與影片平台。",
  notes:["純文字版會拿掉 {} 強調括號，副文接在第二行。"]},
 {id:"backup",ico:"💾",t:"備份／換電腦",s:"保存整個專案",
  why:"project.json 一次保存字幕、設定與已上傳的字體，可用面板的「匯入設定 JSON 或渲染專案」整包還原；設定 JSON 只有面板設定。",
  notes:["音樂與背景影片不會包進檔案，還原後要重新載入。","字體檔可能很大（CJK 字體常達數 MB 到十幾 MB）。"]}];
let wzSel="rec",wzO={fps:"30",blur:"",glow:false,aber:false,grade:"",webm:false,ck:"#00ff00"},wzDone=false;
function wzCmd(k){let c=projCmd().cmd;
 if(k==="mp4"){c=c.replace("--fps 30","--fps "+wzO.fps);if(wzO.blur)c+=" --blur "+wzO.blur;if(wzO.glow)c+=" --glow";if(wzO.aber)c+=" --aberration";if(wzO.grade)c+=" --grade "+wzO.grade}
 else if(k==="alpha")c+=" --alpha"+(wzO.webm?" --webm":"");
 else if(k==="layers")c+=" --layers";
 else if(k==="chroma")c+=" --chroma"+(wzO.ck&&wzO.ck.toLowerCase()!=="#00ff00"?" "+wzO.ck.slice(1):"");
 return c}
function wzRender(){const box=$("#exwiz");if(!box)return;const L=box.querySelector(".xl"),R=box.querySelector(".xr");L.textContent="";R.textContent="";
 const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 WZ_OPTS.forEach(o=>{const b=mk("button","xo"+(o.id===wzSel?" on":""));b.type="button";const t=mk("b","",o.ico+" "+o.t);b.append(t,mk("span","",o.s));b.onclick=()=>{wzSel=o.id;wzDone=false;wzRender()};L.append(b)});
 const o=WZ_OPTS.find(x=>x.id===wzSel),k=o.id,btn=(t,f,c)=>{const b=mk("button",c||"",t);b.type="button";b.onclick=f;return b};
 R.append(mk("h3","",o.ico+" "+o.t),mk("p","why",o.why));
 if(!subs.length)R.append(mk("div","edwarn","還沒有字幕：請先用頂欄「載入 ▾」載入 SRT 或範例。"));
 const row=()=>{const r=mk("div","opt");R.append(r);return r},chk=(p,t,key,after)=>{const l=mk("label"),c=mk("input");c.type="checkbox";c.checked=!!wzO[key];c.onchange=()=>{wzO[key]=c.checked;after?after():wzRender()};l.append(c,t);p.append(l)},
  sel=(p,t,key,opts)=>{const l=mk("label","",t),e=mk("select");opts.forEach(([v,x])=>e.add(new Option(x,v)));e.value=wzO[key];e.onchange=()=>{wzO[key]=e.value;wzRender()};l.append(e);p.append(l)};
 const cmdBox=()=>{R.append(mk("div","","終端機指令（在專案資料夾執行）："));const c=mk("div","cmd",wzCmd(k));R.append(c);
  const r=row();r.append(btn("複製指令",()=>{try{navigator.clipboard.writeText(wzCmd(k));note("已複製離線渲染指令")}catch(e){prompt("複製這行指令：",wzCmd(k))}}))};
 const dlProj=()=>{R.append(mk("div","","① 下載 project.json，放進專案的 input/ 資料夾"));const r=row();r.append(btn(wzDone?"✓ 已下載（再下載一次）":"下載 project.json",async()=>{if(!subs.length)return note("請先載入 SRT 或範例");await exportProjectUI();wzDone=true;wzRender()},"go"))};
 if(k==="rec"){const r=row();sel(r,"錄製幀率","recFps",[["60","60 fps"],["30","30 fps（較不吃效能）"]]);
  const l=mk("label"),c=mk("input");c.type="checkbox";c.checked=!!CONFIG.recLite;c.onchange=()=>{CONFIG.recLite=c.checked;save()};l.append(c,"輕量模式（半解析度畫布、關噪點與發光）");r.append(l);
  R.querySelector("select").onchange=ev=>{CONFIG.recFps=ev.target.value;save()};R.querySelector("select").value=String(CONFIG.recFps||"60");
  R.append(btn("開始錄製（倒數 3 秒）",()=>{closeWz();$("#rec").click()},"go"))}
 else if(k==="mp4"){const r=row();sel(r,"幀率","fps",[["30","30 fps"],["60","60 fps"]]);sel(r,"動態模糊","blur",[["","無"],["4","4（建議）"],["8","8（更柔，更慢）"]]);
  const r2=row();chk(r2,"輝光","glow");chk(r2,"色差","aber");sel(r2,"調色","grade",[["","無"],["warm","warm"],["cool","cool"],["film","film"]]);dlProj();cmdBox()}
 else if(k==="alpha"){const r=row();chk(r,"同時輸出 --webm（VP9 透明，檔案小很多）","webm");dlProj();cmdBox();R.append(mk("div","edhint","輸出：output/text_alpha.mov"+(wzO.webm?"、output/text_alpha.webm":"")))}
 else if(k==="layers"){dlProj();cmdBox();R.append(mk("div","edhint","輸出：output/text_alpha.mov ＋ output/ambient.mp4"))}
 else if(k==="chroma"){const r=row(),l=mk("label","","鍵色"),c=mk("input");c.type="color";c.value=wzO.ck;c.oninput=()=>{wzO.ck=c.value;R.querySelector(".cmd").textContent=wzCmd(k)};l.append(c);r.append(l);dlProj();cmdBox();R.append(mk("div","edhint","輸出：output/preview.mp4（一般 MP4，背景為純色）"))}
 else if(k==="srt"){const r=row();r.append(btn("下載帶標記的 SRT",()=>{if(!subs.length)return note("請先載入 SRT 或範例");exportSRT()},"go"),btn("下載純文字 SRT（無標記）",()=>{if(!subs.length)return note("請先載入 SRT 或範例");exportSRTPlain()}))}
 else if(k==="backup"){const r=row();r.append(btn("下載 project.json（字幕＋設定＋字體）",async()=>{if(!subs.length)return note("請先載入 SRT 或範例");await exportProjectUI();wzDone=true;wzRender()},"go"),btn("下載設定 JSON",exportConfig));
  if(wzDone)R.append(mk("div","edhint","✓ 已下載 project.json"))}
 const ul=mk("ul");o.notes.forEach(n=>ul.append(mk("li","",n)));R.append(ul);
 if(!hasMedia&&(k==="rec"||k==="mp4"||k==="layers"||k==="chroma"))R.append(mk("div","edhint edwarn",k==="rec"?"目前沒有載入音樂／影片：錄出來是靜音。":"目前沒有載入音樂／影片：指令不含 --audio，成品是靜音。有音樂請放進 input/ 並在指令加上 --audio input/檔名。"));
 R.append(mk("div","edhint","想看全部細節：README「離線渲染」「綠幕輸出」「分層輸出」。"))}
function openExportWizard(){let box=$("#exwiz");if(!box){box=document.createElement("div");box.id="exwiz";
  box.innerHTML='<div class="xb"><div class="xh"><span>⬆ 匯出：你要拿去做什麼？</span><button type="button" id="exwx">關閉 ✕</button></div><div class="xm"><div class="xl"></div><div class="xr"></div></div></div>';
  document.body.append(box);box.addEventListener("pointerdown",e=>{if(e.target===box)closeWz()});$("#exwx").onclick=closeWz;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&box.classList.contains("on"))closeWz()})}
 wzRender();box.classList.add("on")}
function closeWz(){const b=$("#exwiz");b&&b.classList.remove("on")}
$("#exw").onclick=openExportWizard;
