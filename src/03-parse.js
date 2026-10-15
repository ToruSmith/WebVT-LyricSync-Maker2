/* ===== [PARSE] SRT 與標記解析：parseSRT / parseTag；版型・進場・退場・特效名稱清單（LAYOUTS/ENTERS/EXITS/FXS，後面各區段會 push 補登）；{} 通用強調 hlText / applyHL ===== */
/* \u6642\u9593\u5B57\u4E32 \u2192 \u79D2\uFF1A\u63A5\u53D7 HH:MM:SS,mmm\uFF0FHH:MM:SS.mmm\uFF0FMM:SS.mmm\uFF1B\u7D50\u675F\u6642\u9593\u5F8C\u9762\u53EF\u5E36 WebVTT \u7684 cue \u8A2D\u5B9A\uFF08\u53EA\u53D6\u7B2C\u4E00\u6BB5\uFF09\uFF1B\u683C\u5F0F\u4E0D\u5C0D\u56DE\u50B3 NaN */
const SRT_T=x=>{const m=String(x).trim().split(/\s+/)[0].replace(",",".").match(/^(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/);return m?(+(m[1]||0))*3600+ +m[2]*60+ +m[3]:NaN};
/* parseSRT(s[,info])\uFF1A\u6642\u9593\u7570\u5E38\uFF08\u8B80\u4E0D\u51FA\u4F86\u3001\u6216\u7D50\u675F\u6642\u9593\u4E0D\u665A\u65BC\u958B\u59CB\uFF09\u7684\u53E5\u5B50\u76F4\u63A5\u7565\u904E\uFF1Binfo \u82E5\u6709\u7D66\uFF0C\u6703\u5BEB\u5165 info.bad\uFF1D\u7565\u904E\u5E7E\u53E5\u3002
   \u6709\u6548\u7684 SRT \u7D50\u679C\u8207\u820A\u7248\u5B8C\u5168\u76F8\u540C\uFF08\u96E2\u7DDA\u6E32\u67D3\u8207\u532F\u5165\u5C08\u6848\u4E5F\u8D70\u9019\u88E1\uFF09\u3002\u6392\u5E8F\u8207\u683C\u5F0F\u5224\u65B7\u5728 parseSubs\uFF08\u53EA\u7528\u65BC\u4F7F\u7528\u8005\u8F09\u5165\u6A94\u6848\uFF09\u3002 */
function parseSRT(s,info){
 s=s.replace(/^\uFEFF/,"").replace(/\r/g,"");const vtt=/^WEBVTT/.test(s);let bad=0;
 const out=s.split(/\n\s*\n/).map(b=>{
  const l=b.trim().split("\n"),i=l.findIndex(x=>x.includes("-->"));if(i<0)return null;
  const [a,z]=l[i].split("-->").map(x=>SRT_T(x));
  if(!(a>=0&&z>a)){bad++;return null}
  let body=l.slice(i+1).join("\n");if(vtt)body=body.replace(/<\/?[a-zA-Z][^>]*>/g,"");   /* WebVTT\uFF1A\u53BB\u6389 <v \u4EBA\u540D>\u3001<c>\u3001<i> \u7B49\u6A19\u7C64 */
  return parseTag(body,a,z);
 }).filter(Boolean);
 if(info)info.bad=bad;return out;
}
/* LRC \u2192 \u53E5\u5B50\uFF1A[mm:ss.xx]\u6B4C\u8A5E\uFF1B\u4E00\u884C\u53EF\u6709\u591A\u500B\u6642\u9593\uFF1B[offset:\u6BEB\u79D2] \u5957\u7528\u4F4D\u79FB\uFF1B<mm:ss.xx> \u9010\u5B57\u6A19\u8A18\u53BB\u6389\uFF1B
   \u7A7A\u6B4C\u8A5E\u7684\u6642\u9593\u9EDE\u53EA\u7576\u4F5C\u300C\u4E0A\u4E00\u53E5\u5230\u6B64\u7D50\u675F\u300D\uFF1B\u6C92\u6709\u7D50\u5C3E\u6A19\u8A18\u6642\uFF0C\u53E5\u5B50\u986F\u793A\u5230\u4E0B\u4E00\u53E5\u958B\u59CB\uFF0C\u4F46\u6700\u9577 10 \u79D2\uFF08\u6700\u5F8C\u4E00\u53E5 4 \u79D2\uFF09\uFF1B
   \u540C\u4E00\u6642\u9593\u9EDE\u7684\u5169\u884C\uFF08\u539F\u6587\uFF0B\u7FFB\u8B6F\uFF09\u5408\u6210\u300C\u539F\u6587||\u7FFB\u8B6F\u300D\uFF0C\u7FFB\u8B6F\u6703\u6210\u70BA\u526F\u6587\u3002 */
function parseLRC(s,info){
 s=s.replace(/^\uFEFF/,"").replace(/\r/g,"");let off=0;const E=[];
 for(const ln of s.split("\n")){
  const om=ln.match(/^\s*\[offset:\s*([+-]?\d+)\s*\]/i);if(om){off=+om[1]/1000;continue}
  const m=ln.match(/^((?:\s*\[\d+:\d+(?:[.:]\d+)?\])+)(.*)$/);if(!m)continue;
  const text=m[2].replace(/<\d+:\d+(?:[.:]\d+)?>/g,"").trim();
  for(const t of m[1].matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g))E.push({t:+t[1]*60+parseFloat(t[2].replace(":",".")),text});
 }
 E.forEach(x=>x.t=Math.max(0,x.t-off));E.sort((a,b)=>a.t-b.t);   /* \u7A69\u5B9A\u6392\u5E8F\uFF1A\u540C\u4E00\u6642\u9593\u4FDD\u6301\u6A94\u6848\u5167\u9806\u5E8F */
 const M=[];for(const x of E){const p=M[M.length-1];if(p&&p.t===x.t&&p.text&&x.text&&!p.text.includes("||"))p.text+="||"+x.text;else M.push({t:x.t,text:x.text})}
 const out=[];M.forEach((x,i)=>{if(!x.text)return;const nx=M.slice(i+1).find(y=>y.t>x.t);out.push(parseTag(x.text,x.t,nx?Math.min(nx.t,x.t+10):x.t+4))});
 if(info)info.bad=0;return out;
}
/* \u4F7F\u7528\u8005\u8F09\u5165\u5B57\u5E55\u6A94\u7684\u5165\u53E3\uFF1A\u4F9D\u526F\u6A94\u540D\uFF0F\u5167\u5BB9\u5224\u65B7 LRC\u3001WebVTT\u3001SRT\uFF0C\u89E3\u6790\u5F8C\u4F9D\u958B\u59CB\u6642\u9593\u6392\u5E8F\uFF08\u7A69\u5B9A\uFF09\u3002
   info \u6703\u5F97\u5230 fmt\uFF08\u683C\u5F0F\u540D\u7A31\uFF09\u3001bad\uFF08\u7565\u904E\u5E7E\u53E5\uFF09\u3001sorted\uFF08\u539F\u672C\u9806\u5E8F\u662F\u5426\u88AB\u8ABF\u6574\uFF09\u3002 */
function parseSubs(s,name,info){
 info=info||{};const lrc=/\.lrc$/i.test(name||"")||(!/-->/.test(s)&&/^\s*\[\d+:\d+/m.test(s));
 info.fmt=lrc?"LRC":/^\uFEFF?\s*WEBVTT/.test(s)?"WebVTT":"SRT";
 const a=lrc?parseLRC(s,info):parseSRT(s,info),o=a.slice();a.sort((x,y)=>x.s-y.s);info.sorted=a.some((x,i)=>x!==o[i]);return a;
}
const LAYOUTS=["split","lowerleft","bounce","slam","neon","karaoke","typewriter","vertical","blurfocus","wipe","glitch","stack","outline-big","subtitle-box","poster"];
const ENTERS=["fade","rise","drop","zoomin","zoomout","spin","flip","stagger","mask-up","elastic","swing","ripple"],EXITS=["fade","sink","zoomout-fade","blur-out","slide-out"],FXS=["float","shake","flicker","rainbow"];
/* 登記一個新版型的唯一入口：{brace:1}＝{} 是強調關鍵字；{full:1}＝滿版（忽略位置）。舊版型維持原本的分散登記方式，不動。 */
function registerLayout(name,fn,o={}){NL[name]=fn;if(!LAYOUTS.includes(name))LAYOUTS.push(name);if(o.brace)BRACE_LAYOUTS.add(name);if(o.full)FULLBLEED.add(name)}
const BRACE_LAYOUTS=new Set(["split","poster","diagonal","circle-badge","keyword","hanko","marker","annotate"]);
/* 每句文字大小（標記 $大字高度比例,整體縮放%）：單位與面板 bigRatio（.03–.8）／textScale（20–300）相同；空白或 0＝跟隨全域。
   sb.bigR／sb.txtS 是「取代」全域值（不是相乘）；build() 與讀全域縮放的版型一律經 sbBigR／sbKs 取值（未設定時結果與原本完全相同）。 */
function parseSz(s){const q=String(s||"").split(","),n=(i,lo,hi)=>{const v=parseFloat(q[i]);return v>0&&isFinite(v)?Math.max(lo,Math.min(hi,v)):0};return[n(0,.03,.8),n(1,20,300)]}
const sbBigR=sb=>sb&&sb.bigR>0?sb.bigR:CONFIG.bigRatio,sbKs=sb=>((sb&&sb.txtS>0?sb.txtS:+CONFIG.textScale)||100)/100;
function parseTag(txt,s,e){
 let lay,en,ex,fx,pos="",st="",scene="",sz="";
 const r=txt.match(/^#([\w-]+)?(?:\+([\w-]+))?(?:\+([\w-]+))?(?:~([^\s@^*&$]+))?(?:\^([^\s@*&$]+))?(?:\$([\d.,]*))?(?:\*([^\s@&]+))?(?:@([^\s&]+))?(?:&(\S+))?\s*/);
 let font="";   /* 每句字體：*字體名（encodeURIComponent，* 另編成 %2A）；放在 ^位置 之後、@樣式 之前 */
 if(r){let fr;[,lay,en,ex,fx,pos,sz,fr,st,scene]=r;st=st||"";scene=scene||"";pos=pos||"";if(fr){try{font=decodeURIComponent(fr)}catch(e){font=fr}}txt=txt.slice(r[0].length)}
 const szP=parseSz(sz);
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
 return{s,e,lay,en,ex,fx,pos,st,font,sub,br,plain,hl,raw:txt,bigR:szP[0],txtS:szP[1],auto:!r||(!!(font||scene||sz)&&!lay0&&!en&&!ex&&!fx&&!pos&&!st),scene};
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
