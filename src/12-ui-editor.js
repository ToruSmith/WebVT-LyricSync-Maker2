/* ===== [UI-EDITOR] 預設組合表 PRESETS / 隨機化 randomize / 帶標記 SRT 的產生與匯出（tc・tag・srtText・exportSRT）；句子編輯器本體 editor() 在下方 [EXPORT] 區段 ===== */
const PRESETS={動畫PV:{font:"圓體",pulse:.05,accent:"#7aa8ff",weight:300,spacing:.5},霓虹夜:{font:"黑體",pulse:.07,accent:"#ff2bd6",weight:300,spacing:.3,dim:60},
 簡約明體:{font:"明體",pulse:.02,accent:"#cccccc",weight:300,spacing:.6,bounce:4},強烈節奏:{font:"英文展示",pulse:.12,bounce:30,flash:.2,speed:1.3,weight:700,spacing:.1},
 遊戲PV:{font:"黑體",pulse:.08,accent:"#ffd23a",speed:1.2,weight:500,spacing:.25},復古VHS:{font:"等寬",accent:"#44ffcc",pulse:.04,weight:400,spacing:.2,dim:55},
 櫻花日系:{font:"楷體",accent:"#ffb3c7",pulse:.03,weight:300,spacing:.5,speed:.8},賽博龐克:{font:"等寬",accent:"#00f0ff",pulse:.09,flash:.15,weight:500,spacing:.2},
 極簡海報:{font:"明體",accent:"#ffffff",pulse:.01,bounce:0,weight:200,spacing:.7,speed:.8},
 仿PV歌詞:{font:"黑體",accent:"#a9c8ff",pulse:.015,bounce:0,flash:0,speed:.85,enter:.8,exit:.5,weight:300,spacing:.1,dim:35,particles:0,grain:.03,vignette:.35,trans:"crossfade"}};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function randomize(){if(!subs.length)return note("請先載入 SRT 或範例");if(subs.some(x=>!x.auto)&&!confirm("會覆寫全部 "+subs.length+" 句的版型、進場、退場與特效（逐句設定會被取代；可按復原還原）。繼續？"))return;pushHist();subs.forEach(x=>{x.lay=pick(LAYOUTS);x.en=pick(ENTERS);x.ex=pick(EXITS);x.fx=Math.random()<.4?pick(FXS):"";x.auto=false;reparse(x)});cur=-2;refreshEditor();note("已隨機化版型、動畫與特效（可復原）")}
$("#rnd").onclick=randomize;
$("#barUndo").onclick=()=>undo();$("#barRedo").onclick=()=>redo();
const tc=t=>{const z=(n,l=2)=>String(n).padStart(l,"0"),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return`${z(h)}:${z(m)}:${z(Math.floor(s))},${z(Math.round(s%1*1000),3)}`};
const fTag=x=>x.font?"*"+encodeURIComponent(x.font).replace(/\*/g,"%2A"):"";
const scTag=x=>x.scene?"&"+x.scene:"";
const tag=x=>x.auto&&!x.en&&!x.ex&&!x.fx?(x.font||x.scene?"#"+fTag(x)+scTag(x)+" ":""):"#"+x.lay+(x.en||x.ex?"+"+(x.en||"fade"):"")+(x.ex?"+"+x.ex:"")+(x.fx?"~"+x.fx:"")+(x.pos?"^"+x.pos:"")+fTag(x)+(x.st?"@"+x.st:"")+scTag(x)+" ";
/* 依目前欄位重新解析一句的文字衍生欄位（raw／plain／br／hl／sub；auto 句同步 lay）。版型或文字改了之後 plain 會不同（BRACE_LAYOUTS 會把 {} 內文字抽走），
   這樣與「匯出 SRT 再匯入」的結果一致。改標記語法時，tag() 與 parseTag 要一起看。 */
function reparse(x){const t=tag(x),n=parseTag((t||(/^\s*#/.test(x.raw)?"# ":""))+x.raw+(x.sub?"||"+x.sub:""),x.s,x.e);x.raw=n.raw;x.plain=n.plain;x.br=n.br;x.hl=n.hl;x.sub=n.sub;if(x.auto)x.lay=n.lay}
const srtText=()=>subs.map((x,i)=>`${i+1}\n${tc(x.s)} --> ${tc(x.e)}\n${tag(x)}${x.raw}${x.sub?"||"+x.sub:""}\n`).join("\n");
function exportSRT(){dl(new Blob([srtText()],{type:"text/plain"}),"lyrics_tagged.srt")}
/* 純文字 SRT：不含 # 標記（{} 強調括號也拿掉），副文接在第二行；給一般播放器／平台用 */
const srtPlainText=()=>subs.map((x,i)=>`${i+1}\n${tc(x.s)} --> ${tc(x.e)}\n${x.raw.replace(/[{}]/g,"").trim()}${x.sub?"\n"+x.sub:""}\n`).join("\n");
function exportSRTPlain(){dl(new Blob([srtPlainText()],{type:"text/plain"}),"lyrics.srt")}
