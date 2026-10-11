/* ===== [LAY-G] 版型 G：pv-lyric（橫排、靠左）／pv-vertical（直排、靠右）— 仿 PV 歌詞排版 =====
   語法：#pv-lyric 看天台上{流星}(路過)　（大字字體：#pv-lyric*字體名 單句指定，或面板「強調字字體」全域設定）
     {…}＝毛筆大字關鍵字（發光、色差收斂、帶淡墨暈影）；(…) 或（…）＝關鍵字右下的小註解，可省略。
     沒寫 {} 時，自動把句尾 2 個字當關鍵字。毛筆字體請在字體選單選「毛筆」，或用「載入字體」放入自己的毛筆字型。
   固定毫秒的延遲請乘 tK（短句縮放係數），否則短句時會拖到退場之後。
   與全域設定共用：動畫時長＝進場秒數、顏色＝強調色、位置＝文字位置錨點。預設組合「仿PV歌詞」搭配最合適。 */
delete CONFIG.kwFont;delete CFG_DEFAULTS.kwFont;   /* v2 試用版遺留的舊設定鍵 */
const pvKwFont=sb=>sb.font?(FONTS[sb.font]||sb.font):(emFontCss(sb)||FONTS.毛筆);   /* 優先順序見上方「強調字字體」說明 */
FONTS.毛筆='"Zhi Mang Xing","Ma Shan Zheng","Liu Jian Mao Cao","Kaiti TC",BiauKai,DFKai-SB,"Noto Serif TC",serif';
function pvBuild(sb,c,big,vert){
 let note="",raw=sb.raw.replace(/[（(]([^）)]*)[）)]/,(_,t)=>(note=t.trim(),"")).trim();
 let items=raw.split(/(\{[^}]*\})/).filter(Boolean).map(p=>/^\{/.test(p)?{t:p.slice(1,-1),k:1}:{t:p.trim(),k:0}).filter(x=>x.t);
 if(!items.some(x=>x.k)){const a=[...raw],cut=Math.max(0,a.length-2);items=[{t:a.slice(0,cut).join("").trim(),k:0},{t:a.slice(cut).join(""),k:1}].filter(x=>x.t)}
 const n=items.reduce((s,x)=>s+[...x.t].length*(x.k?1.9:1),0)||1,
  base=Math.min(big*.2,vert?SHd()*.74/(n*1.25):SWd()*.62/(n*1.15)),acc=CONFIG.accent;
 const GLOW=`0 0 .12em #fff,0 0 .5em ${acc},0 0 1.1em ${acc}`,SPLIT=`-.08em 0 rgba(255,60,110,.85),.08em 0 rgba(60,220,255,.85),0 0 .5em ${acc}`;
 const e=txtEl(vert?`right:7cqw;top:12cqh;display:flex;flex-direction:row-reverse;align-items:flex-start;gap:.6em;font-size:${base}px;letter-spacing:.35em`
  :`left:5cqw;top:54cqh;display:flex;align-items:baseline;gap:.4em;white-space:nowrap;font-size:${base}px;letter-spacing:.12em`);
 c.appendChild(e);
 const lastK=items.map(x=>x.k).lastIndexOf(1);
 items.forEach((x,i)=>{
  const sp=document.createElement(vert?"div":"span"),dl=i*150/CONFIG.speed*tK;
  sp.style.cssText=vert?"position:relative;display:block;writing-mode:vertical-rl;width:fit-content;height:fit-content":"position:relative;display:inline-block";
  if(!x.k){sp.textContent=x.t;sp.style.opacity=".92";e.appendChild(sp);
   A(sp,[{opacity:0,filter:"blur(8px)",transform:vert?"translateY(-.8em)":"translateX(-.8em)"},{opacity:.92,filter:"blur(0)",transform:"none"}],{duration:D()*1.3,delay:dl});return}
  sp.style.cssText+=`;font-family:${pvKwFont(sb)};font-size:1.9em;font-weight:700;letter-spacing:.02em;line-height:1.1;transform-origin:20% 70%;text-shadow:${GLOW}`;
  sp.textContent=x.t;
  const gh=document.createElement("span");gh.textContent=x.t;   /* 淡墨暈影：模糊、偏色、略偏移的同字複本 */
  gh.style.cssText=`position:absolute;left:0;top:0;color:${acc};filter:blur(.1em);opacity:.5;transform:translate(.04em,.05em);pointer-events:none;letter-spacing:inherit`;sp.appendChild(gh);
  e.appendChild(sp);
  A(sp,[{opacity:0,filter:"blur(14px)",transform:"scale(1.35)",textShadow:SPLIT},{opacity:1,filter:"blur(0)",transform:"scale(1)",textShadow:GLOW}],{duration:D()*1.7,delay:dl+120/CONFIG.speed*tK});
  A(gh,[{opacity:0},{opacity:.5}],{duration:D()*2.2,delay:dl+300/CONFIG.speed*tK});
  if(note&&i===lastK){const nt=document.createElement("div");
   nt.style.cssText=`position:absolute;${vert?"top:calc(100% + .2em);left:0":"left:calc(100% + .2em);bottom:-.15em"};writing-mode:horizontal-tb;font-family:${FONTS.黑體};font-size:.3em;font-weight:400;letter-spacing:.05em;line-height:1.3;white-space:nowrap;text-shadow:none;opacity:.8`;
   nt.innerHTML="<div style='letter-spacing:.2em'>‹‹‹</div>";const t2=document.createElement("div");t2.textContent="（"+note+"）";nt.appendChild(t2);sp.appendChild(nt);
   A(nt,[{opacity:0,transform:"translateY(.4em)"},{opacity:.8,transform:"none"}],{duration:D(),delay:dl+D()*.9})}
 });
 if(vert)A(e,[{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(-40% -40% -40% -40%)"}],{duration:D()*1.6,easing:"linear"});
}
registerLayout("pv-lyric",(sb,c,w,big)=>pvBuild(sb,c,big,false),{brace:1});
registerLayout("pv-vertical",(sb,c,w,big)=>pvBuild(sb,c,big,true),{brace:1});
