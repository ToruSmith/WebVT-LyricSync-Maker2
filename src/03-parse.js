/* ===== [PARSE] SRT 與標記解析：parseSRT / parseTag；版型・進場・退場・特效名稱清單（LAYOUTS/ENTERS/EXITS/FXS，後面各區段會 push 補登）；{} 通用強調 hlText / applyHL ===== */
function parseSRT(s){
 s=s.replace(/^\uFEFF/,"").replace(/\r/g,"");
 return s.split(/\n\s*\n/).map(b=>{
  const l=b.trim().split("\n"),i=l.findIndex(x=>x.includes("-->"));if(i<0)return null;
  const [a,z]=l[i].split("-->").map(x=>{const p=x.trim().replace(",",".").split(":");return +p[0]*3600+ +p[1]*60+ +p[2]});
  return parseTag(l.slice(i+1).join("\n"),a,z);
 }).filter(Boolean);
}
const LAYOUTS=["split","lowerleft","bounce","slam","neon","karaoke","typewriter","vertical","blurfocus","wipe","glitch","stack","outline-big","subtitle-box","poster"];
const ENTERS=["fade","rise","drop","zoomin","zoomout","spin","flip","stagger","mask-up","elastic","swing","ripple"],EXITS=["fade","sink","zoomout-fade","blur-out","slide-out"],FXS=["float","shake","flicker","rainbow"];
/* 登記一個新版型的唯一入口：{brace:1}＝{} 是強調關鍵字；{full:1}＝滿版（忽略位置）。舊版型維持原本的分散登記方式，不動。 */
function registerLayout(name,fn,o={}){NL[name]=fn;if(!LAYOUTS.includes(name))LAYOUTS.push(name);if(o.brace)BRACE_LAYOUTS.add(name);if(o.full)FULLBLEED.add(name)}
const BRACE_LAYOUTS=new Set(["split","poster","diagonal","circle-badge","keyword","hanko","marker","annotate"]);
function parseTag(txt,s,e){
 let lay,en,ex,fx,pos="",st="",scene="";
 const r=txt.match(/^#([\w-]+)?(?:\+([\w-]+))?(?:\+([\w-]+))?(?:~([^\s@^*&]+))?(?:\^([^\s@*&]+))?(?:\*([^\s@&]+))?(?:@([^\s&]+))?(?:&(\S+))?\s*/);
 let font="";   /* 每句字體：*字體名（encodeURIComponent，* 另編成 %2A）；放在 ^位置 之後、@樣式 之前 */
 if(r){let fr;[,lay,en,ex,fx,pos,fr,st,scene]=r;st=st||"";scene=scene||"";pos=pos||"";if(fr){try{font=decodeURIComponent(fr)}catch(e){font=fr}}txt=txt.slice(r[0].length)}
 let sub="";const bi=txt.indexOf("||");if(bi>=0){sub=txt.slice(bi+2).trim();txt=txt.slice(0,bi)}
 const br=[...txt.matchAll(/\{([^}]*)\}/g)].map(x=>x[1]);
 let plain=txt.replace(/\{[^}]*\}/g,"").trim();
 const lay0=lay;if(!lay)lay=br.length?"split":"lowerleft";
 /* 只有這些版型會把 {} 當成「要強調的關鍵字」另外處理；其他版型若照舊把 {} 內的字整段拿掉，歌詞就會少字。
    所以其他版型只去掉括號符號、保留文字（匯出 SRT 用的 raw 仍保留 {}，不影響編輯器與匯出） */
 if(!BRACE_LAYOUTS.has(lay))plain=txt.replace(/[{}]/g,"").trim();
 /* hl：主文每個字是否在 {} 內，供「非關鍵字版型」做通用強調 */
 let hl=[],ib=false;for(const c of txt){if(c==="{")ib=true;else if(c==="}")ib=false;else hl.push(ib)}
 const s0=txt.replace(/[{}]/g,""),lead=[...s0].length-[...s0.trimStart()].length;hl=hl.slice(lead,lead+[...txt.replace(/[{}]/g,"").trim()].length);
 return{s,e,lay,en,ex,fx,pos,st,font,sub,br,plain,hl,raw:txt,auto:!r||(!!(font||scene)&&!lay0&&!en&&!ex&&!fx&&!pos&&!st),scene};
}
/* 通用強調：非關鍵字版型中，{} 內的字改用強調色＋加粗＋發光（不改動畫、不改排版） */
const HL_SKIP=new Set(["text-mask","particle-form"]);   /* 這兩個版型在各自的程式內處理 {} 強調字 */
/* 把 e 的文字拆成逐字 span，{} 內的字改用強調色（不改字重，避免和 canvas 取樣的位置對不上） */
function hlText(e,sb,bold){const P=[...sb.plain];e.textContent="";P.forEach((ch,i)=>{const sp=document.createElement("span");sp.textContent=ch;if(sb.hl&&sb.hl[i]){sp.style.cssText="color:var(--a);-webkit-text-fill-color:var(--a);text-shadow:0 0 .3em var(--a)"+(bold?";font-weight:900":"")+(emFontCss(sb)?";font-family:"+emFontCss(sb):"")}e.appendChild(sp)})}   /* ripple-pool 的 WebGL 字改在 waterText 內逐字上色；簡化版走 DOM，由此通用流程處理 */
/* ===== 強調字字體（全版型共用的唯一入口）=====
   面板「強調字字體」＝ CONFIG.emFont；「（版型預設）」＝完全不介入（各版型維持原本字體）。
   優先順序：這句自己的 *字體（整句，含強調字）＞ 面板強調字字體 ＞ 版型預設（pv-lyric/pv-vertical 的預設是毛筆）。
   作用範圍：① BRACE_LAYOUTS 的 {} 強調字（找「文字剛好等於 {} 內容」的葉節點）② 其他版型的通用強調（applyHL / hlText）。
   不支援：particle-form、ripple-pool（文字畫在 canvas 上）。 */
const KW_DEF="（版型預設）";
const emFontCss=sb=>{if(sb&&sb.font)return"";const k=CONFIG.emFont;return(k&&k!==KW_DEF&&FONTS[k])||""};
function applyKwFont(root,sb,lay){
 const ff=emFontCss(sb);if(!ff||!sb.br.length||!BRACE_LAYOUTS.has(lay)||/^pv-/.test(lay))return;   /* pv-* 在 pvBuild 內自己處理 */
 const S=new Set(sb.br.map(x=>x.trim()));
 root.querySelectorAll("*").forEach(e=>{if(e.children.length||e.tagName==="CANVAS"||e.closest("svg"))return;if(S.has(e.textContent.trim()))e.style.fontFamily=ff})}
function emFontUI(p){const l=document.createElement("label");l.textContent="強調字字體（所有 {} 強調字；預設＝各版型原本的字體）";const e=document.createElement("select");e.style.width="100%";
 const fill=()=>{e.innerHTML="";[KW_DEF,...Object.keys(FONTS)].forEach(k=>e.add(new Option(k,k)));e.value=CONFIG.emFont&&(CONFIG.emFont===KW_DEF||FONTS[CONFIG.emFont])?CONFIG.emFont:KW_DEF};
 fill();e.onmousedown=fill;   /* 展開前重建選項：之後才上傳的字體也看得到 */
 e.onchange=()=>{CONFIG.emFont=e.value;save();cur=-2};p.append(l,e)}
function applyHL(root,sb,lay){
 if(!sb.hl||!sb.hl.some(Boolean)||BRACE_LAYOUTS.has(lay)||HL_SKIP.has(lay))return;
 const P=[...sb.plain],ef=emFontCss(sb),css=e=>{e.style.color="var(--a)";e.style.fontWeight="900";e.style.textShadow="0 0 .35em var(--a)";if(ef)e.style.fontFamily=ef};
 const parents=new Set([...root.querySelectorAll(".ch")].map(x=>x.parentNode));
 parents.forEach(pn=>{const k=[...pn.children].filter(x=>x.classList.contains("ch"));if(k.length===P.length)k.forEach((x,i)=>{if(sb.hl[i])css(x)})});
 let cur=0;
 [...root.querySelectorAll("*")].forEach(el=>{
  if(el.children.length||el.dataset.pm||el.classList.contains("ch")||el.tagName==="CANVAS"||el.tagName==="svg"||el.closest("svg"))return;
  const T=[...el.textContent];if(!T.length)return;
  let off=-1;if(el.textContent===sb.plain)off=0;else if(cur<P.length&&P.slice(cur,cur+T.length).join("")===el.textContent){off=cur;cur+=T.length}
  if(off<0)return;
  el.textContent="";T.forEach((c,i)=>{const sp=document.createElement("span");sp.textContent=c;if(sb.hl[off+i])css(sp);el.appendChild(sp)})});
}
