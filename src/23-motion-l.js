/* ===== [MOTION-L] 第四批（JIZURA 移植）：進場 6／退場 6／保持 4／鏡頭 3（做成持續特效）／文字樣式 5。只往表裡加，不改既有項目。
   部分部品改寫自 JIZURA（原作者 hakoniwa，MIT，備份於 ToruSmith/JIZURA；授權全文見根目錄 LICENSE）：只讀動作設計與數值，用 DOM／CSS／Web Animations 重寫，沒有搬 Canvas 程式碼。
   全部是時間純函數（A() 暫停動畫；逐字的「隨機」用索引雜湊，不用 Math.random）。登記方式同 23-motion-k.js（ENTER_X／EXTRA_EX／EXIT_C／FXH／ST）。
   有「近似」的項目在注釋標 ≈：Maker2 只有整句時間（沒有逐字時間碼）、元素是 DOM，做不到的部分改用近似做法。 ===== */
{
const spL=()=>CONFIG.speed,btL=()=>60000/CONFIG.bpm;
const hh=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)};   /* 索引雜湊 0..1（純函數） */
const ecL=(n,pc,fb,gap)=>{ENTER_X[n]=(el,l,d)=>{if(l&&l.length)l.forEach((c,i)=>A(c,pc(i,l.length),{duration:d,delay:i*gap/spL()}));else A(el,fb,{duration:d})}};
/* ---- 進場 ---- */
ecL("bleed-in",(i,n)=>[{opacity:0,transform:"scale(.5)",filter:"blur(8px)"},{opacity:1,transform:"scale(1.04)",filter:"blur(1px)",offset:.7},{opacity:1,transform:"none",filter:"blur(0)"}],[{opacity:0,transform:"scale(.8)",filter:"blur(12px)"},{opacity:1,transform:"none",filter:"blur(0)"}],55);   /* にじみ（逐字由糊變清；整句退路＝糊→清） */
ENTER_X["cursor-sweep"]=(el,l,d)=>{   /* カーソル掃引：一條強調色細棒由左掃到右，字被掃到就出現 */
 if(!el.style.position)el.style.position="relative";
 const bar=document.createElement("div");bar.dataset.nm=1;bar.style.cssText="position:absolute;top:-.05em;bottom:-.05em;left:0;width:.09em;background:var(--a);box-shadow:0 0 .2em var(--a);pointer-events:none";el.appendChild(bar);
 A(bar,[{left:"-2%",opacity:1},{left:"100%",opacity:1,offset:.85},{left:"102%",opacity:0}],{duration:d,easing:"cubic-bezier(.3,.6,.4,1)"});
 if(l&&l.length)l.forEach((c,i)=>A(c,[{opacity:0,transform:"translateX(-.3em) scale(.7)"},{opacity:1,transform:"none"}],{duration:d*.3,delay:d*.8*i/l.length/1+0,easing:"cubic-bezier(.2,.9,.3,1)"}));
 else A(el,[{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0)"}],{duration:d*.85,easing:"cubic-bezier(.3,.6,.4,1)"})};
ENTER_X["track-expand"]=(el,l,d)=>{   /* 字間拡張：字距從緊縮撐開到原本的字距，同時淡入 ≈（以元素本身的 letter-spacing 為終點） */
 const e0=parseFloat(el.style.letterSpacing),end=isNaN(e0)?(+CONFIG.spacing||0):e0;
 A(el,[{opacity:0,letterSpacing:`${(end-.5).toFixed(3)}em`},{opacity:1,letterSpacing:`${end}em`}],{duration:d*1.2,easing:"cubic-bezier(.16,1,.3,1)"})};
ecL("alt-zoom",(i,n)=>i%2===0?[{opacity:0,transform:"scale(2.4)",filter:"blur(8px)"},{opacity:1,transform:"none",filter:"blur(0)"}]:[{opacity:0,transform:"scale(.02)"},{opacity:1,transform:"scale(1.12)",offset:.65},{opacity:1,transform:"none"}],[{opacity:0,transform:"scale(1.8)"},{opacity:1,transform:"none"}],45);   /* 交互ズーム（偶數字從鏡頭前撲來，奇數字從遠處長出） */
ENTER_X["stop-motion"]=(el,l,d)=>{   /* コマ撮り：逐字停格跳向定位，每格姿勢略不同（索引雜湊，不是亂數） */
 const K=5;
 if(l&&l.length)l.forEach((c,i)=>{const kf=[];
  for(let k=0;k<K-1;k++){const f=1-Math.pow(k/(K-1),3),ang=hh(i,81)*6.2832,Dd=.7+.5*hh(i,83),r=(a)=>(hh(i*7+k,a)-.5)*2;
   kf.push({opacity:k===0?0:1,transform:`translate(${(Math.cos(ang)*Dd*f+r(84)*.05).toFixed(3)}em,${(Math.sin(ang)*Dd*f+r(85)*.05).toFixed(3)}em) rotate(${(r(86)*22*f).toFixed(1)}deg) scale(${(1+r(88)*.14*f).toFixed(3)})`,offset:k/K,easing:"steps(1,end)"})}
  kf.push({opacity:1,transform:"none",offset:1});
  A(c,kf,{duration:d,delay:i*60/spL()})});
 else A(el,[{opacity:0},{opacity:1}],{duration:d,easing:"steps(4,end)"})};
ENTER_X["checker-in"]=(el,l,d)=>{   /* 市松：棋盤格分兩階段浮現（先一半格子，再細格補滿） ≈ */
 const ck=(s,o)=>`repeating-conic-gradient(#000 0 25%,transparent 0 50%) ${o} / ${s} ${s}`,kf=[],m=v=>({maskImage:v,WebkitMaskImage:v}),S="steps(1,end)";
 const H="linear-gradient(transparent,transparent)";
 [[H,0],[ck(".36em","0 0"),.22],[`${ck(".36em","0 0")},${ck(".18em",".09em .09em")}`,.5],["linear-gradient(#000,#000)",.78]].forEach(([v,o])=>kf.push({opacity:1,...m(v),offset:o,easing:S}));
 kf.push({opacity:1,...m("linear-gradient(#000,#000)"),offset:1});
 A(el,kf,{duration:d})};
ENTERS.push("bleed-in","cursor-sweep","track-expand","alt-zoom","stop-motion","checker-in");
/* ---- 退場：整句版（EXTRA_EX）＋逐字版（EXIT_C；build 有 .ch 才用）---- */
Object.assign(EXTRA_EX,{
 "backspace-out":[{clipPath:"inset(0)",easing:"steps(9,end)"},{clipPath:"inset(0 100% 0 0)"}],   /* バックスペース：整句版＝由右往左一格一格削掉 */
 "echo-out":[{opacity:1,transform:"none",filter:"none"},{opacity:.75,transform:"scale(1.15)",filter:"drop-shadow(0 0 .12em var(--a))",offset:.4},{opacity:0,transform:"scale(1.5)",filter:"blur(.1em)"}],   /* 残響 ≈（放大擴散＋光暈漸隱，沒有真的輪廓環） */
 "diag-wipe-out":[{clipPath:"polygon(-30% 0,200% 0,200% 100%,-60% 100%)"},{clipPath:"polygon(130% 0,200% 0,200% 100%,100% 100%)"}],   /* 斜めワイプ退場 */
 "spin-out":[{opacity:1,transform:"none"},{opacity:0,transform:"rotate(200deg) scale(.05)"}],   /* 回って消える（整句版） */
 "slash-out":[{opacity:1,transform:"none"},{opacity:1,transform:"scaleX(1.02)",offset:.25},{opacity:0,transform:"translateY(14cqh) rotate(6deg)"}],   /* 一刀両断（整句版＝抖一下後掉落） ≈ */
 "strike-out":[{opacity:1,transform:"none"},{opacity:1,transform:"none",offset:.5},{opacity:0,transform:"scaleY(.05)"}]});   /* 線で消す（整句版沒有線，只留壓扁淡出；有逐字元素時才畫線） */
const swL=(i,n)=>i/Math.max(1,n-1);
Object.assign(EXIT_C,{
 "backspace-out":(c,i,n)=>({kf:[{opacity:1},{opacity:0}],dur:.12,at:(n-1-i)/Math.max(1,n)*.85,ease:"steps(1,end)"}),   /* 由句尾一字一字刪掉 */
 "spin-out":(c,i,n)=>({kf:[{opacity:1,transform:"none"},{opacity:0,transform:`rotate(${(i%2?1:-1)*(i%3?250:200)}deg) scale(.01)`}],dur:.5,at:swL(i,n)*.5}),
 "slash-out":(c,i,n)=>{const L=i<n/2;return{kf:[{opacity:1,transform:"none"},{opacity:0,transform:L?"translate(-5cqw,16cqh) rotate(-10deg)":"translate(5cqw,22cqh) rotate(10deg)"}],dur:.55,at:.12+(L?0:.04),ease:"cubic-bezier(.5,0,1,.6)"}},   /* 左半往左下、右半往右下掉開 ≈ */
 "strike-out":(c,i,n)=>{c.style.backgroundImage="linear-gradient(var(--a),var(--a))";c.style.backgroundRepeat="no-repeat";c.style.backgroundPosition="0 56%";   /* 線畫在每個字自己的背景上，用同一段動畫的 backgroundSize 拉出 */
  return{kf:[{opacity:1,transform:"none",backgroundSize:"0% .07em"},{opacity:1,transform:"none",backgroundSize:"100% .07em",offset:.45},{opacity:1,transform:"none",backgroundSize:"100% .07em",offset:.6},{opacity:0,transform:"scaleY(.05)",backgroundSize:"100% .07em"}],dur:.6,at:swL(i,n)*.4}}});
EXITS.push("backspace-out","echo-out","diag-wipe-out","spin-out","slash-out","strike-out");
/* ---- 保持與鏡頭（持續特效）：獨立屬性 scale／translate／rotate／filter，不和進場的 transform 打架；鏡頭三項只動字幕容器 fw，不動 #stage ---- */
Object.assign(FXH,{
 "shadow-sway"(fw){const a=[];for(let k=0;k<=8;k++){const t=k/8*Math.PI*2,ang=Math.PI/3+Math.PI/4*Math.sin(t),L=.8+.3*Math.sin(t*1.7+1);a.push({filter:`drop-shadow(${(Math.cos(ang)*L).toFixed(3)}cqh ${(Math.sin(ang)*L).toFixed(3)}cqh 0 color-mix(in srgb,var(--a) 45%,rgba(0,0,0,.7)))`,offset:k/8})}A(fw,a,{duration:5500,iterations:Infinity,easing:"linear"})},   /* 影が揺れる：影的方向與長度慢慢擺動 */
 "stretch-beat"(fw){A(fw,[{scale:"1.12 .955"},{scale:"1 1",offset:.4},{scale:"1 1"}],{duration:btL(),iterations:Infinity,easing:"cubic-bezier(.1,.8,.3,1)"})},   /* 横伸び拍：每拍橫向撐開再彈回 */
 dangle(fw){const l=cl(fw);(l.length?l:[fw]).forEach((c,i)=>{c.style.transformOrigin="50% 0";A(c,[{rotate:"-6deg"},{rotate:"6deg"}],{duration:1500+(i*37)%500,iterations:Infinity,direction:"alternate",easing:"ease-in-out",delay:-i*130})})},   /* ぶら下がり：每字像吊著一樣從上緣擺動 */
 "wind-gust"(fw){const l=cl(fw);(l.length?l:[fw]).forEach((c,i,a)=>A(c,[{translate:"0 0",rotate:"0deg",offset:0},{translate:".12em 0",rotate:"3deg",offset:.1},{translate:"-.03em 0",rotate:"-1deg",offset:.22},{translate:"0 0",rotate:"0deg",offset:.36},{translate:"0 0",rotate:"0deg",offset:1}],{duration:2200,iterations:Infinity,easing:"ease-out",delay:i*40}))},   /* 突風：每隔約 2.2 秒一陣風，字由左而右依序被吹歪再彈回 */
 "tilt-down"(fw,dur){A(fw,[{translate:"0 3cqh",scale:1.035},{translate:"0 0",scale:1}],{duration:Math.max(400,dur*1000*.45),easing:"cubic-bezier(.2,.8,.2,1)"})},   /* ティルトダウン：鏡頭往下搖，字從下方升入定位 */
 "dolly-in"(fw,dur){A(fw,[{scale:1,translate:"0 0"},{scale:1.12,translate:"0 -.8cqh"}],{duration:Math.max(600,dur*1000),easing:"cubic-bezier(.5,0,.9,.6)"})},   /* ドリー：整句期間慢慢推近 */
 "step-zoom"(fw,dur){const ms=Math.max(600,dur*1000),T=[.3,.58,.8].slice(0,2+(ms>2500?1:0)),kf=[{scale:1,offset:0}];let s=1;T.forEach(t=>{kf.push({scale:s,offset:t});s+=.04;kf.push({scale:s,offset:Math.min(.99,t+70/ms)})});kf.push({scale:s,offset:1});A(fw,kf,{duration:ms,easing:"linear"})}});   /* 段階ズーム：2～3 次快速小推（每次 +4%） */
FXS.push("shadow-sway","stretch-beat","dangle","wind-gust","tilt-down","dolly-in","step-zoom");
/* ---- 文字樣式（@）---- */
Object.assign(ST,{
 "grad-v":e=>{_lv(e).forEach(x=>{x.style.backgroundImage="linear-gradient(180deg,var(--c) 15%,var(--a) 95%)";x.style.webkitBackgroundClip=x.style.backgroundClip="text";x.style.color="transparent";x.style.webkitTextFillColor="transparent"})},   /* 縦グラデ（上本色→下強調色） */
 "extrude-3d":e=>addSh(e,Array.from({length:12},(_,i)=>`${((i+1)*.012).toFixed(3)}em ${((i+1)*.012).toFixed(3)}em 0 color-mix(in srgb,var(--a) 70%,#000)`).join(",")),   /* 立体（短而實的 3D 厚度，比 longshadow 短） */
 "echo-diag":e=>addSh(e,".04em -.04em 0 color-mix(in srgb,var(--a) 70%,transparent),.08em -.08em 0 color-mix(in srgb,var(--a) 45%,transparent),.12em -.12em 0 color-mix(in srgb,var(--a) 22%,transparent)"),   /* 輪郭の残響 ≈（斜向殘影，不是空心輪廓） */
 condensed:e=>{e.style.scale=".8 1.05"},   /* 長体 */
 extended:e=>{e.style.scale="1.08 .86"},   /* 平体（寬度上限 1.08，避免超出畫面） */
 "step-baseline":e=>{_lv(e).forEach((x,i)=>{x.style.translate=`0 ${(i%2?1:-1)*.09}em`})}});   /* 段違い：奇偶字上下交錯 */
}
