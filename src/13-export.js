/* ===== [EXPORT] 匯出渲染專案：srt（帶標記）＋ config ＋ 已上傳字體（base64）→ project.json，給 node render/run.mjs --project 用（buildProject / exportProject / projBox）；同區段還有 editor() 句子編輯器、applyPreset()、extra()（預設組合・鎖定版型・設定匯出入面板）===== */
let mediaInfo=null,projInfo=null;
const b64Of=buf=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>{const u=String(r.result);ok(u.slice(u.indexOf(",")+1))};r.onerror=()=>no(r.error);r.readAsDataURL(new Blob([buf]))});
async function buildProject(){
 const fonts=[];for(const[name,buf]of FONTBUF)if(FONTS[name])fonts.push({name,b64:await b64Of(buf)});
 return{srt:srtText(),config:JSON.parse(JSON.stringify(CONFIG)),...(fonts.length?{fonts}:{}),...(mediaInfo?{media:{name:mediaInfo.name,video:!!mediaInfo.video}}:{})}}
function projCmd(){   // 依目前畫面比例給建議解析度（短邊 1080）；離線渲染一律以此尺寸排版，比例要和預覽一致外觀才會一致
 const a=CONFIG.aspect,st=$("#stage"),r=a==="9:16"?9/16:a==="16:9"?16/9:((document.body.style.getPropertyValue("--edh")?innerWidth/innerHeight:st.clientWidth/st.clientHeight)||16/9);
 const W=r>=1?Math.round(1080*r/2)*2:1080,H=r>=1?1080:Math.round(1080/r/2)*2,q=f=>/[\s()&]/.test(f)?`"${f}"`:f;
 const md=mediaInfo?` ${mediaInfo.video?"--video":"--audio"} ${q("input/"+mediaInfo.name)}`:"";
 return{cmd:`node render/run.mjs --project input/project.json${md} --width ${W} --height ${H} --fps 30`,media:mediaInfo?mediaInfo.name:""}}
async function exportProject(){
 if(!subs.length){alert("沒有字幕可匯出，請先載入 SRT。");return null}
 const pj=await buildProject(),blob=new Blob([JSON.stringify(pj)],{type:"application/json"});
 dl(blob,"project.json");
 projInfo={...projCmd(),fonts:(pj.fonts||[]).map(f=>f.name),mb:blob.size/1048576,subs:subs.length};return pj}
function projBox(p){   // 回傳 fill()：依 projInfo 重畫提示框（panel() 重建時也會重畫）
 const b=document.createElement("div");b.id="projbox";b.style.cssText="margin:6px 0;padding:8px;border:1px solid #456;border-radius:6px;font-size:12px;line-height:1.6;display:none";p.append(b);
 const fill=()=>{if(!projInfo){b.style.display="none";return}const i=projInfo;b.style.display="block";b.innerHTML="";
  const t=(x,css)=>{const d=document.createElement("div");d.textContent=x;if(css)d.style.cssText=css;b.append(d);return d};
  t(`已下載 project.json（${i.subs} 句，${i.mb.toFixed(2)} MB${i.fonts.length?"，內含字體："+i.fonts.join("、"):"，沒有自訂字體"}）`);
  t("放進專案的 input/ 資料夾後，在終端機執行：","opacity:.7;margin-top:4px");
  t(i.cmd,"font-family:Consolas,Menlo,monospace;background:rgba(255,255,255,.08);padding:4px 6px;border-radius:4px;word-break:break-all;user-select:all").id="projcmd";
  const cb=document.createElement("button");cb.textContent="複製指令";cb.onclick=()=>{try{navigator.clipboard.writeText(i.cmd);cb.textContent="已複製"}catch(e){}};b.append(cb);
  t(i.media?`音樂／影片檔太大，不會包進 project.json：請把「${i.media}」放進 input/（檔名要和指令一致）。`:"音樂／影片檔太大，不會包進 project.json：若要配樂，把檔案放進 input/ 並在指令加上 --audio input/檔名（背景影片用 --video）。","margin-top:4px");
  t("--width／--height 只是建議值（依目前畫面比例）；比例改了，版面就會和預覽不同。","opacity:.7");
  t("離線後製（輝光 --glow、色差 --aberration、調色 --grade）只影響離線輸出的預覽 MP4，網頁預覽看不到；見 README。","opacity:.7")};
 fill();return fill}
function dl(b,n){const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=n;a.click()}
const exportConfig=()=>dl(new Blob([JSON.stringify(CONFIG)],{type:"application/json"}),"lyrics_config.json");
let projFill=()=>{};   /* projBox() 回傳的重畫函式（panel() 重建後指向新的提示框）；匯出後呼叫它更新提示 */
async function exportProjectUI(){await exportProject();projFill()}
function resetSettings(msg){if(confirm(msg||"清除已儲存的設定並重新載入頁面？")){try{localStorage.removeItem(LS_CFG)}catch(e){}location.reload()}}
function editor(){let d=$("#edm");if(d){d.remove();edLayout();return}
 d=document.createElement("div");d.id="edm";EDR.length=0;d.style.cssText="position:fixed;inset:auto 240px 0 0;height:46vh;background:rgba(10,12,20,.95);z-index:6;overflow:auto;padding:10px;font-size:12px";   /* 預設半高：上半部留給預覽，方便邊看邊調位置 */
 const sel=(o,v,f)=>{const e=document.createElement("select");["",...o].forEach(x=>e.add(new Option(x||"（預設）",x)));e.value=v||"";e.onchange=()=>{f(e.value);cur=-2};return e};
 {const h=document.createElement("div");h.style.cssText="opacity:.7;margin-bottom:6px";h.textContent="可用樣式（@，最多 3 個，逗號分隔）："+[...Object.keys(ST),...Object.keys(STC)].join("、");d.append(h)}
 d.addEventListener("change",e=>{if(e.target.type==="checkbox"||e.target.dataset.nohist)return;pushHist()},true);   /* 捕獲階段：先存快照，再讓各欄位寫入，編輯器內的任何修改都能復原 */
 {const bar=document.createElement("div");bar.style.cssText="position:sticky;top:-10px;z-index:2;background:rgba(10,12,20,.98);padding:6px 0;margin-bottom:6px;border-bottom:1px solid #3a4470;display:flex;flex-wrap:wrap;gap:6px;align-items:center";
  const b=(t,f,c)=>{const e=document.createElement("button");e.textContent=t;e.onclick=f;if(c)e.className=c;bar.append(e);return e};
  const setCk=fn=>{EDSEL.clear();subs.forEach((x,i)=>{if(fn(x,i))EDSEL.add(i);if(EDR[i])EDR[i].ck.checked=EDSEL.has(i)});cntUpd()};
  b("切換高度",()=>{d.style.height=d.style.height!=="46vh"?"46vh":"calc(100vh - 48px)"});b("復原",undo,"hbU");b("重做",redo,"hbR");
  b("全選",()=>setCk(()=>1));b("全不選",()=>setCk(()=>0));b("勾選同版型（以目前句）",()=>{const l=subs[selIdx]?layOf(subs[selIdx]):"";setCk(x=>layOf(x)===l)});
  const ps=document.createElement("select");ps.dataset.nohist=1;ps.add(new Option("位置預設…",""));POSPRE.forEach(([v,t])=>ps.add(new Option(t,v)));bar.append(ps);
  b("套用預設到勾選",()=>{if(!ps.value)return note("先選一個位置預設");applyTo((y,k)=>{y.pos=presetPos(ps.value,k);y.auto=false})});
  b("把「目前這句」的位置套用到勾選",()=>{const src=subs[selIdx];if(!src)return;applyTo(y=>{y.pos=src.pos;if(y.pos)y.auto=false})});
  b("清除勾選句子的位置",()=>applyTo(y=>{y.pos=""}));
  b("清除勾選句子的場景",()=>{const l=selList();if(!l.length)return note("先在編輯器勾選要套用的句子");clearSceneSubs(l)});
  b("清除全部句子的場景",()=>clearSceneSubs());
  const c=document.createElement("span");c.id="edcnt";c.style.opacity=".8";bar.append(c);
  bar.append(Object.assign(document.createElement("div"),{textContent:"點左側句子＝跳到該句並暫停；勾選框可用 Shift 連選一段；位置欄與面板「這一句的位置」雙向同步",style:"opacity:.7;width:100%"}));d.append(bar);cntUpd();histBtn()}
  subs.forEach((x,xi)=>{const r=document.createElement("div");r.style.cssText="display:flex;gap:6px;align-items:center;margin:4px 0";r.append(Object.assign(document.createElement("span"),{textContent:x.s.toFixed(1)+"s　"+x.raw.replace(/\s+/g," ").trim().slice(0,12),style:"width:150px;cursor:pointer;text-decoration:underline dotted",title:"點一下：跳到這句並暫停",onclick:()=>jumpTo(xi)}),
  sel(LAYOUTS,x.lay,v=>{x.lay=v||"lowerleft";x.auto=!v}),sel(ENTERS,x.en,v=>{x.en=v;if(v)x.auto=false}),sel(EXITS,x.ex,v=>{x.ex=v;if(v)x.auto=false}),sel(Object.keys(FONTS),x.font,v=>x.font=v));
  const f=document.createElement("input");f.placeholder="特效 float,shake";f.value=x.fx||"";f.onchange=()=>{x.fx=f.value;if(f.value)x.auto=false;cur=-2};
   const sI=document.createElement("input");sI.placeholder="樣式 neon,outline";sI.value=x.st||"";sI.onchange=()=>{x.st=sI.value.replace(/\s/g,"");x.auto=false;cur=-2};
   const scI=document.createElement("input");scI.placeholder="場景層 halftone:60,burst";scI.title="場景層（&）：名稱[:強度]，逗號分隔，最多 3 層；Ctrl+K 搜尋「場景層」可一鍵套用";scI.value=x.scene||"";scI.onchange=()=>{x.scene=scI.value.replace(/\s/g,"");cur=-2};const scB=document.createElement("button");scB.type="button";scB.textContent="＋場景";scB.title="開啟場景層挑選窗";scB.onclick=()=>openScenePop(scB,()=>x.scene||"",v=>{x.scene=v;scI.value=v;cur=-2});
   const bI=document.createElement("input");bI.placeholder="副文";bI.value=x.sub||"";bI.onchange=()=>{x.sub=bI.value;cur=-2};
   const pp=(x.pos||"").split(":"),pS=document.createElement("select");[["","位置：跟隨全域"],["auto","位置：版型原位"],...Object.entries(ANCH).map(([k,v])=>[k,"位置："+v])].forEach(([v,t])=>pS.add(new Option(t,v)));pS.value=pp[0]||"";
   const nI=(ph,v)=>{const i=document.createElement("input");Object.assign(i,{type:"number",placeholder:ph,title:ph+"（畫面寬/高的 %；相對這句的錨點，不再與全域微調相加）",value:v||"",step:.5,min:-100,max:100});i.style.width="54px";return i},pX=nI("X%",pp[1]),pY=nI("Y%",pp[2]);
   const sp=()=>{const a=pS.value,xs=pX.value,ys=pY.value;x.pos=[a,...(xs!==""||ys!==""?[xs||0,ys||0]:[])].join(":");if(x.pos)x.auto=false;cur=-2;jumpTo(xi)};pS.onchange=pX.onchange=pY.onchange=sp;
   const ck=document.createElement("input");ck.type="checkbox";ck.checked=EDSEL.has(xi);
   ck.onclick=ev=>{const on=ck.checked;if(ev.shiftKey&&lastCk>=0){for(let i=Math.min(lastCk,xi);i<=Math.max(lastCk,xi);i++){on?EDSEL.add(i):EDSEL.delete(i);if(EDR[i])EDR[i].ck.checked=on}}else on?EDSEL.add(xi):EDSEL.delete(xi);lastCk=xi;cntUpd()};
   EDR[xi]={pS,pX,pY,ck};r.append(f,sI,scI,scB,bI,pS,pX,pY);r.prepend(ck);d.append(r)});
 const b=document.createElement("button");b.textContent="匯出帶標記的 SRT";b.onclick=exportSRT;d.append(b);document.body.append(d);edLayout();edRO&&edRO.observe(d)}
/* 句子編輯器 × 預覽並排：編輯器開著（且高度 ≤72% 視窗）時，把預覽縮進頂欄下方、編輯器上方；錄製／離線渲染時一律還原。
   做法：在 body 設 --edt/--edh/--edr，CSS 的 #stage 與 applyStage() 依此計算可用區；沒設定時＝原本全視窗。 */
const edRO=typeof ResizeObserver==="function"?new ResizeObserver(()=>edLayout()):null;
function edLayout(){const d=$("#edm"),b=document.body,vs=["--edt","--edh","--edr"];
 const on=!RENDER&&d&&!recording&&!b.classList.contains("rec")&&d.offsetHeight>0&&d.offsetHeight<=innerHeight*.72;
 let g=$("#edgrip");
 if(d&&!recording&&!b.classList.contains("rec")){if(!g){g=document.createElement("div");g.id="edgrip";g.title="拖曳調整預覽與編輯器的比例";document.body.append(g);
   g.onpointerdown=e=>{e.preventDefault();g.setPointerCapture(e.pointerId);g.classList.add("drag");
    const mv=ev=>{const ed=$("#edm");if(ed){ed.style.height=Math.round(Math.max(140,Math.min(Math.floor(innerHeight*.7),innerHeight-ev.clientY)))+"px";edLayout()}},
     up=()=>{g.classList.remove("drag");g.removeEventListener("pointermove",mv);g.removeEventListener("pointerup",up)};g.addEventListener("pointermove",mv);g.addEventListener("pointerup",up)}}
  g.style.bottom=(d.offsetHeight-4)+"px"}else if(g)g.remove();
 const key=on?[$("#bar").offsetHeight,d.offsetHeight,innerWidth,innerHeight].join():"";
 if(key===edLayout.k)return;edLayout.k=key;
 if(on){b.style.setProperty("--edt",$("#bar").offsetHeight+"px");b.style.setProperty("--edh",d.offsetHeight+"px");b.style.setProperty("--edr","240px")}else vs.forEach(k=>b.style.removeProperty(k));
 applyStage()}
edLayout.k="";
if(!RENDER){addEventListener("resize",()=>edLayout());new MutationObserver(()=>edLayout()).observe(document.body,{attributes:true,attributeFilter:["class"]})}   /* 視窗縮放、錄製開始／結束（body.rec）時重算 */
$("#ed").onclick=editor;
/* 套用預設組合：先把「氛圍類」欄位與位置還原成預設，再疊上組合內容。
   文字縮放／文字陰影／鎖定版型是使用者常手調的欄位：只有「上一個套用的組合設過它」才還原，
   否則保留使用者目前的值（CONFIG.presetName 記錄上一個組合，隨設定匯出入）。位置一律還原。 */
const PRESET_KEEP={textScale:100,textShadow:false,lock:""};
function applyPreset(name){
 const P=PRESETS[name];if(!P)return false;const prev=PRESETS[CONFIG.presetName]||{},back={};
 Object.keys(PRESET_KEEP).forEach(k=>{if(k in prev)back[k]=PRESET_KEEP[k]});
 if(typeof STYLE_PACKS!=="undefined"&&STYLE_PACKS.has(CONFIG.presetName))PACK_KEEP.forEach(k=>{back[k]=CFG_DEFAULTS[k]});   /* 離開風格包：把它動過的欄位還原成出廠預設（舊預設之間不受影響） */
 Object.assign(CONFIG,{bokeh:0,leak:0,lightning:0,scratch:0,crt:0,vhs:0,invBar:0,scan:0,grain:.05,pMode:"dots",tone:"",trans:"cut",kb:0,beatRot:0,particles:50,posAnchor:"",posX:0,posY:0,posSafe:6},back,P,{presetName:name});
 perfPart=null;applyScene();css();cur=-2;save();panel();return true}
function extra(p){secAnchor(p,"preset");
 const mk=(t,f)=>{const b=document.createElement("button");b.textContent=t;b.onclick=f;p.append(b)};
 const l=document.createElement("label");l.textContent="預設組合";const ps=document.createElement("select");ps.style.width="100%";ps.add(new Option("選擇…",""));Object.keys(PRESETS).forEach(k=>ps.add(new Option(k,k)));
 ps.onchange=()=>applyPreset(ps.value);
 const l2=document.createElement("label");l2.textContent="鎖定單一版型";const ls=document.createElement("select");ls.style.width="100%";ls.add(new Option("（不鎖定）",""));LAYOUTS.forEach(k=>ls.add(new Option(k,k)));ls.value=CONFIG.lock||"";ls.onchange=()=>{CONFIG.lock=ls.value;cur=-2;save()};
 p.append(l,ps,l2,ls);emFontUI(p);
 mk("清除瀏覽器記住的設定（恢復預設）",()=>resetSettings("會清除瀏覽器記住的所有設定（顏色、色彩、陰影…）並重新載入頁面；已上傳的字體不受影響。確定嗎？"));
  secAnchor(p,"export");
  mk("匯出設定 JSON",exportConfig);
 mk("匯出渲染專案（project.json）",exportProjectUI);projFill=projBox(p);
 const f=document.createElement("input");f.type="file";f.accept=".json";f.id="cfgImport";
  f.onchange=async()=>{try{const J=JSON.parse(await txt(f.files[0]));
   if(J&&typeof J==="object"&&J.config&&typeof J.config==="object"&&"srt" in J){   /* 渲染專案（project.json）：字幕＋設定＋字體一起還原 */
    for(const ft of J.fonts||[]){try{const buf=await(await fetch("data:application/octet-stream;base64,"+(ft.b64||ft.data))).arrayBuffer();await addFont(ft.name,buf);idbPut(ft.name+".ttf",buf)}catch(e){console.error("字體還原失敗："+ft.name,e)}}
    Object.assign(CONFIG,JSON.parse(JSON.stringify(CFG_DEFAULTS)),J.config);   /* 在字體載入之後套用，config.font 才會是最後的值 */
    subs=parseSRT(J.srt==="@demo"?DEMO:String(J.srt||""));
    let msg=`專案已還原：${subs.length} 句${J.fonts&&J.fonts.length?"，字體："+J.fonts.map(x=>x.name).join("、"):""}`;
    if(J.media&&J.media.name&&!hasMedia){mediaInfo=J.media;msg+=`。音樂／影片不會存在專案裡，請再載入「${J.media.name}」`;alert(msg)}
    css();cur=-2;save();panel();note(msg);return}
   Object.assign(CONFIG,JSON.parse(JSON.stringify(CFG_DEFAULTS)),J);css();cur=-2;save();panel()}catch(e){alert("設定檔格式錯誤："+e.message)}};
  const fl=document.createElement("label");fl.textContent="匯入設定 JSON 或渲染專案（project.json）";p.append(fl,f);
}
