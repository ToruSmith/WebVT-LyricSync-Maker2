/* ===== [FX-ENTER-EXIT] 退場表 EXTRA_EX / 持續特效表 FXH（wave shimmer gradient-flow chromatic outline-pulse highlight-word）/ ring 輔助 / 版型 B：scroll orbit diagonal marquee circle-badge zoom-tunnel split-screen ===== */
let scr=[],curFont="";
const HOLD=[{opacity:1,filter:"none"},{opacity:1,offset:.85},{opacity:0}];
const EXTRA_EX={dissolve:[{opacity:1,filter:"blur(0)"},{opacity:0,filter:"blur(10px)"}],shatter:HOLD,
 "glitch-out":[{opacity:1,transform:"none"},{opacity:1,transform:"translateX(14px) skewX(20deg)",filter:"hue-rotate(90deg)",offset:.3},{opacity:.6,transform:"translateX(-18px)",filter:"hue-rotate(200deg)",offset:.6},{opacity:0,transform:"translateX(6px)"}]};
const EXTRA_FK={};
const tel=fw=>[...fw.querySelectorAll('[style*="font-family"]')],cl=fw=>[...fw.querySelectorAll(".ch")];
const FXH={
 wave(fw){let l=cl(fw);if(!l.length)l=[fw];l.forEach((c,i)=>A(c,[{translate:"0 0"},{translate:"0 -1.2cqh"},{translate:"0 0"},{translate:"0 1.2cqh"},{translate:"0 0"}],{duration:1800,delay:0,iterations:Infinity,easing:"ease-in-out",iterationStart:(i*.12)%1}))},
 shimmer(fw){const d=document.createElement("div");d.style.cssText="position:absolute;top:0;bottom:0;width:30cqw;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);mix-blend-mode:overlay;pointer-events:none";fw.appendChild(d);
  A(d,[{transform:"translateX(-40cqw) skewX(-20deg)"},{transform:"translateX(130cqw) skewX(-20deg)",offset:.3},{transform:"translateX(130cqw) skewX(-20deg)"}],{duration:4000,iterations:Infinity,easing:"linear"})},
 "gradient-flow"(fw){/* 有逐字 .ch 時，漸層要畫在每個字上：background-clip:text 不會穿過帶動畫的 inline-block 子框，套在父層字會整句消失（只剩光暈） */
  const ch=cl(fw),els=ch.length?ch:tel(fw);
  els.forEach((e,i)=>{e.style.cssText+=";background-image:linear-gradient(90deg,#fff,var(--a),#fff,var(--a));background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent";
  A(e,[{backgroundPosition:"0 0"},{backgroundPosition:"300% 0"}],{duration:4000,delay:ch.length?-i*350:0,iterations:Infinity,easing:"linear"})})},
 chromatic(fw){tel(fw).forEach(e=>A(e,[{textShadow:"-1px 0 rgba(255,0,0,.8),1px 0 rgba(0,200,255,.8)"},{textShadow:"-4px 0 rgba(255,0,0,.8),4px 0 rgba(0,200,255,.8)"}],{duration:60000/CONFIG.bpm,iterations:Infinity,direction:"alternate",easing:"ease-in-out"}))},
 "outline-pulse"(fw){tel(fw).forEach(e=>A(e,[{textShadow:"0 0 0 transparent"},{textShadow:"0 0 16px var(--a),0 0 2px var(--a)",offset:.1},{textShadow:"0 0 0 transparent"}],{duration:60000/CONFIG.bpm,iterations:Infinity,easing:"ease-out"}))},
 "highlight-word"(fw,dur){const l=cl(fw);if(!l.length)return;const t=dur*1000/l.length;l.forEach((c,i)=>A(c,[{color:"var(--c)"},{color:"var(--a)",offset:.3},{color:"var(--c)"}],{duration:t*1.6,delay:i*t,easing:"linear"}))}};
const ring=(c,txt,n,css,R,cfg)=>{const r=document.createElement("div");r.className="w";c.appendChild(r);
 const t=[...txt];while(t.length<n)t.push(...[...txt,"・"]);t.length=Math.max(n,1);
 t.forEach((ch,i)=>{const a=cfg.arc?(i/(t.length-1||1)-.5)*cfg.arc:i*360/t.length,e=txtEl(`left:50%;top:50%;${css};transform:translate(-50%,-50%) rotate(${a}deg) translateY(-${R}cqh)`);e.textContent=ch;r.appendChild(e);A(e,[{opacity:0},{opacity:1}],{duration:D()*.5,delay:i*(cfg.step||40)})});return r};
Object.assign(NL,{
 scroll(sb,c){const i=subs.indexOf(sb),ks=(+CONFIG.textScale||100)/100;for(let k=-2;k<=2;k++){const x=subs[i+k];if(!x)continue;const e=txtEl(`left:8cqw;right:8cqw;top:calc(50% + ${k*11*ks}cqh);margin-top:-1em;font-size:${Math.min((k?3.2:5)*1.5*ks*SHd()/100,SWd()*.84*.96/(1.1*Math.max(1,[...x.plain].length)))}px;letter-spacing:.1em;filter:blur(${Math.abs(k)*2}px)`);e.textContent=x.plain;c.appendChild(e);
  A(e,[{translate:"0 9cqh",opacity:0},{translate:"0 0",opacity:k?.8/(Math.abs(k)+.5):1}],{duration:D()*1.3})}},
 orbit(sb,c,w,big,sm,dur){const r=ring(c,sb.plain,sb.plain.length,`font-size:${sm*1.8}px;letter-spacing:0`,Math.min(30,SWd()/SHd()*34),{arc:Math.min(320,sb.plain.length*16),step:70});A(r,[{transform:"rotate(-20deg)"},{transform:"rotate(30deg)"}],{duration:dur*1000,easing:"linear"})},
 diagonal(sb,c,w,big,sm){const r=document.createElement("div");r.className="w";r.style.transform="rotate(-8deg)";c.appendChild(r);
  const a=txtEl(`left:9cqw;top:12cqh;font-size:${Math.min(big*1.8,SWd()*.4)}px;letter-spacing:0;line-height:1`);a.textContent=sb.br[0]||sb.plain.slice(0,2);r.appendChild(a);enter(a,sb.en||"rise");
  const b=txtEl(`left:6cqw;right:6cqw;top:62cqh;font-size:${sm*1.5}px`);b.textContent=sb.plain;r.appendChild(b);enter(b,"fade")},
 marquee(sb,c){const ks=(+CONFIG.textScale||100)/100,h=(sb.plain+"　").repeat(6);[[ -11,"0","-50%",""],[13.4,"-50%","0","color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.7)"]].forEach(([off,a,b,css],i)=>{
  const e=txtEl(`left:0;top:${47+off*ks}cqh;margin-top:-.6em;font-size:${(i?14:10)*ks}cqh;white-space:nowrap;letter-spacing:.1em;${css}`);e.textContent=h+h;c.appendChild(e);A(e,[{translate:a+" 0"},{translate:b+" 0"}],{duration:12000,iterations:Infinity,easing:"linear"})});enter(c,"fade")},
 "circle-badge"(sb,c,w,big,sm,dur){const r=ring(c,sb.plain,22,`font-size:${sm*1.4}px;letter-spacing:0`,24,{step:30});A(r,[{transform:"rotate(0)"},{transform:"rotate(360deg)"}],{duration:12000,iterations:Infinity,easing:"linear"});
  const e=CE(c,`font-size:${big*1.3}px;letter-spacing:0`);e.textContent=sb.br[0]||sb.plain[0];enter(e,"zoomin")},
 "zoom-tunnel"(sb,c,w,big){const z=fit(sb,big);for(let i=0;i<5;i++){const e=CE(c,`font-size:${z}px;opacity:.6`);e.textContent=sb.plain;A(e,[{transform:"scale(.6)",opacity:0},{opacity:.5,offset:.3},{transform:"scale(3)",opacity:0}],{duration:2000,delay:i*400,iterations:Infinity,easing:"ease-in"})}
  const m=CE(c,`font-size:${z}px`);m.textContent=sb.plain;enter(m,"zoomin")},
 "split-screen"(sb,c,w,big){const t=[...sb.plain],k=Math.ceil(t.length/2),z=fit(sb,big);
  [[t.slice(0,k).join(""),`bottom:calc(50% + ${z*.3}px)`,-1],[t.slice(k).join(""),`top:calc(50% + ${z*.3}px)`,1]].forEach(([x,top,d],i)=>{const e=txtEl(`left:0;right:0;${top};text-align:center;font-size:${z}px;line-height:1.1`);e.textContent=x;c.appendChild(e);A(e,[{opacity:0,translate:`${d*25}cqw 0`},{opacity:1,translate:"0 0"}],{duration:D(),delay:i*150})});
  const l=document.createElement("div");l.className="ln";l.style.cssText="position:absolute;left:10cqw;right:10cqw;top:50%";c.appendChild(l);A(l,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:D()})}});
LAYOUTS.push("scroll","orbit","diagonal","marquee","circle-badge","zoom-tunnel","split-screen");
ENTERS.push("scramble","split-reveal");EXITS.push("dissolve","shatter","glitch-out");FXS.push("wave","shimmer","gradient-flow","chromatic","outline-pulse","highlight-word");
/* ===== 階段 2（JIZURA 移植）：新增進場／退場／保持。只往表裡加，不改既有項目；進場的表在 04-anim.js 的 enter()。
   來源對照（JIZURA key）：blur-stagger＝blurStagger／track-in＝trackIn／skew-in＝skewIn／wipe＝wipe／clock-wipe＝clockWipe／neon-on＝neonOn；
   vacuum＝vacuumOut／sweep-cover＝sweepCover／wipe-out＝wipe／clock-out＝clockOut；breathe＝breathe／track-breathe＝trackBreathe／zoom-slow＝zoomSlow／focus-rack＝focusRack。
   部分部品改寫自 JIZURA（原作者 hakoniwa，MIT，備份於 ToruSmith/JIZURA；授權全文見根目錄 LICENSE）：只讀數值與動作設計，用關鍵影格重寫。 ===== */
/* 時計ワイプ：conic-gradient 遮罩，角度寫死在 36 段關鍵影格裡（相鄰兩段的遮罩圖會交叉淡化，看起來是連續掃過）。
   不能用「註冊 --ang 再在遮罩裡 var(--ang)」：動畫值裡的 var() 取的是動畫前的底值，--ang 動起來遮罩也不會跟著變（已在 Chromium 實測）。
   純時間函數（WAAPI 暫停＋由時間設定）。不支援 conic 遮罩時退回斜向擦除（CLOCK_DIAG）。 */
const CLOCK_OK=!!(window.CSS&&CSS.supports&&(CSS.supports("mask-image","conic-gradient(#000 0deg,transparent 0)")||CSS.supports("-webkit-mask-image","conic-gradient(#000 0deg,transparent 0)")));
const CLOCK_KF=inn=>{const a=[];for(let k=0;k<=36;k++){const d=(10*k).toFixed(0),m=inn?`conic-gradient(#000 ${d}deg,transparent 0)`:`conic-gradient(transparent ${d}deg,#000 0)`;a.push({maskImage:m,WebkitMaskImage:m,offset:k/36})}return a},
 CLOCK_DIAG=["polygon(-1% 0,0% 0,-30% 100%,-1% 100%)","polygon(-1% 0,130% 0,100% 100%,-1% 100%)"];
/* 退場 */
{const BAR="linear-gradient(var(--a),var(--a))";
Object.assign(EXTRA_EX,{
 vacuum:[{opacity:1,transform:"none",filter:"blur(0)"},{opacity:0,transform:"scale(0)",filter:"blur(6px)"}],   /* 收向舞台中心（取不到文字中心） */
 "sweep-cover":[{clipPath:"inset(0 0 0 0)",backgroundImage:BAR,backgroundRepeat:"no-repeat",backgroundSize:"0 100%",backgroundPosition:"0% 0",offset:0},
  {clipPath:"inset(0 0 0 0)",backgroundImage:BAR,backgroundRepeat:"no-repeat",backgroundSize:".3cqw 100%",backgroundPosition:"0% 0",offset:.02},
  {clipPath:"inset(0 0 0 99.7%)",backgroundImage:BAR,backgroundRepeat:"no-repeat",backgroundSize:".3cqw 100%",backgroundPosition:"100% 0",offset:1}],   /* 一根強調色細條由左掃到右，條左側的字被 clipPath 隱藏；條與裁切同在整句容器上，所以長度一致 */
 "wipe-out":[{clipPath:"inset(0)"},{clipPath:"inset(0 0 0 100%)"}],
 "clock-out":CLOCK_OK?CLOCK_KF(0):[{clipPath:CLOCK_DIAG[1]},{clipPath:CLOCK_DIAG[0]}]})}
/* 保持 */
Object.assign(FXH,{
 breathe(fw){A(fw,[{scale:1},{scale:1.03},{scale:1}],{duration:4000,iterations:Infinity,easing:"ease-in-out"})},   /* 用獨立的 scale 屬性，不和進場的 transform 打架 */
 "track-breathe"(fw){tel(fw).forEach(e=>{const cs=getComputedStyle(e),fs=parseFloat(cs.fontSize)||16,ls=parseFloat(cs.letterSpacing)||0;   /* 字距寫在各文字元素上，不會從父層繼承，所以逐元素加動畫 */
  A(e,[{letterSpacing:(ls-.03*fs)+"px"},{letterSpacing:(ls+.03*fs)+"px"}],{duration:2500,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})})},
 "zoom-slow"(fw,dur){A(fw,[{scale:1},{scale:1.06}],{duration:dur*1000,easing:"linear"})},
 "focus-rack"(fw,dur){const l=cl(fw);if(!l.length)return;const t=dur*1000/l.length;l.forEach((c,i)=>A(c,[{filter:"blur(0)"},{filter:"blur(1.5px)",offset:.5},{filter:"blur(0)"}],{duration:t*1.6,delay:i*t,easing:"linear"}))}});
Object.assign(FXH,{   /* 鏡頭型（概念參考 JIZURA 鏡頭，MIT）：只動字幕容器 fw，用獨立屬性 scale／translate，位移 <3% 畫面 */
 "cam-pull"(fw,dur){A(fw,[{scale:1.06},{scale:1}],{duration:dur*1000,easing:"linear"})},
 "cam-pan-l"(fw,dur){A(fw,[{translate:"1.5cqw 0"},{translate:"-1.5cqw 0"}],{duration:dur*1000,easing:"linear"})},
 "cam-pan-r"(fw,dur){A(fw,[{translate:"-1.5cqw 0"},{translate:"1.5cqw 0"}],{duration:dur*1000,easing:"linear"})},
 "cam-tilt-up"(fw,dur){A(fw,[{translate:"0 1.5cqh"},{translate:"0 -1.5cqh"}],{duration:dur*1000,easing:"linear"})}});
FXS.push("cam-pull","cam-pan-l","cam-pan-r","cam-tilt-up");
ENTERS.push("blur-stagger","track-in","skew-in","wipe","clock-wipe","neon-on");EXITS.push("vacuum","sweep-cover","wipe-out","clock-out");FXS.push("breathe","track-breathe","zoom-slow","focus-rack");
