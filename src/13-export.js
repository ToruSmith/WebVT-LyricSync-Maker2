/* ===== [EXPORT] 匯出渲染專案：srt（帶標記）＋ config ＋ 已上傳字體（base64）→ project.json，給 node render/run.mjs --project 用（buildProject / exportProject / projBox）；同區段還有 applyPreset()、extra()（預設組合・鎖定版型・設定匯出入面板）。句子編輯器已移到 13-editor.js===== */
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
    subs=parseSRT(J.srt==="@demo"?DEMO:String(J.srt||""));subsReplaced();
    let msg=`專案已還原：${subs.length} 句${J.fonts&&J.fonts.length?"，字體："+J.fonts.map(x=>x.name).join("、"):""}`;
    if(J.media&&J.media.name&&!hasMedia){mediaInfo=J.media;msg+=`。音樂／影片不會存在專案裡，請再載入「${J.media.name}」`;alert(msg)}
    css();cur=-2;save();panel();note(msg);return}
   Object.assign(CONFIG,JSON.parse(JSON.stringify(CFG_DEFAULTS)),J);css();cur=-2;save();panel()}catch(e){alert("設定檔格式錯誤："+e.message)}};
  const fl=document.createElement("label");fl.textContent="匯入設定 JSON 或渲染專案（project.json）";p.append(fl,f);
}
