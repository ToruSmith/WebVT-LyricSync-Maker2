/* ===== [LAY-D] 版型 D：collage handwrite marker；停格抖動特效 stopmotion；種子亂數 sr()；並在區段末補登 center ripple-pool … annotate 等後段版型名稱到 LAYOUTS ===== */
FONTS.手寫='"Segoe Script","Bradley Hand","Kaiti TC",BiauKai,DFKai-SB,"Comic Sans MS",cursive';
const sr=q=>{let a=Math.floor(q*1000)+7;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}; // 以句子起點為種子，跳轉後排版不變
Object.assign(NL,{
 collage(sb,c,w,big){const r=sr(sb.s),fk=Object.values(FONTS),bg=[["#f4efe1","#111"],["#111","#f4efe1"],["#e63946","#fff"],["#ffd166","#111"],["transparent","#fff"]];
  const e=txtEl("inset:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:1cqh .6cqw;padding:0 8cqw;letter-spacing:0");c.appendChild(e);
  const z=Math.min(big*.5,SWd()/Math.max(sb.plain.length,4)*.8);
  [...sb.plain].forEach((ch,i)=>{if(/\s/.test(ch))return;const b=bg[r()*bg.length|0],sp=document.createElement("span");sp.textContent=ch;
   sp.style.cssText=`display:inline-block;font-family:${fk[r()*fk.length|0]};font-size:${z*(.7+r()*.8)}px;padding:.08em .14em;background:${b[0]};color:${b[1]};rotate:${(r()-.5)*16}deg;translate:0 ${(r()-.5)*3}cqh;box-shadow:${b[0]==="transparent"?"none":"2px 3px 0 rgba(0,0,0,.4)"}`;
   e.appendChild(sp);A(sp,[{opacity:0,transform:"scale(1.6)"},{opacity:1,transform:"scale(1)"}],{duration:140,delay:i*90,easing:"steps(2)"})})},
 handwrite(sb,c,w,big,sm,dur){const r=sr(sb.s),z=Math.min(big*.7,SWd()/Math.max(sb.plain.length,4)*.85);
  const e=txtEl(`inset:0;display:flex;align-items:center;justify-content:center;padding:0 6cqw;font-size:${z}px;letter-spacing:.08em`);e.style.fontFamily=(curFont||CONFIG.font!=="明體")?(FONTS[curFont||CONFIG.font]||FONTS.手寫):FONTS.手寫;   /* 有指定每句字體、或全域字體不是預設明體時，尊重使用者選擇；否則維持手寫（楷體）風 */
  c.appendChild(e);
  const l=chars(sb.plain,e),n=l.length,t=Math.min(dur*600/n,260);
  l.forEach((x,i)=>{x.style.translate=`0 ${(r()-.5)*2}cqh`;x.style.rotate=`${(r()-.5)*5}deg`;A(x,[{clipPath:"inset(-10% 100% -10% 0)"},{clipPath:"inset(-10% 0 -10% 0)"}],{duration:t*1.4,delay:i*t,easing:"linear"})});
  const ln=document.createElement("div");ln.style.cssText=`position:absolute;left:12cqw;right:12cqw;top:calc(50% + ${z*.75}px);height:3px;border-radius:2px;background:var(--a);transform-origin:left`;c.appendChild(ln);A(ln,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:n*t,easing:"linear"})},
 marker(sb,c,w,big){const e=txtEl(`inset:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;padding:0 8cqw;font-size:${Math.min(big*.5,SWd()/Math.max(sb.plain.length,4)*.9)}px;letter-spacing:.12em;white-space:pre-wrap`);c.appendChild(e);
  let parts=sb.raw.split(/(\{[^}]*\})/).filter(Boolean),k=0;if(!sb.br.length)parts=["{"+sb.raw+"}"];
  parts.forEach(p=>{const kw=/^\{/.test(p),sp=document.createElement("span");sp.style.cssText="position:relative;display:inline-block";
   if(kw){const hl=document.createElement("span");hl.style.cssText="position:absolute;left:-.1em;right:-.1em;top:48%;bottom:2%;background:var(--a);opacity:.55;transform-origin:left";sp.appendChild(hl);
    A(hl,[{transform:"skewX(-8deg) scaleX(0)"},{transform:"skewX(-8deg) scaleX(1)"}],{duration:D()*.8,delay:D()+(k++)*250,easing:"cubic-bezier(.7,0,.3,1)"})}
   const tx=document.createElement("span");tx.style.position="relative";tx.textContent=kw?p.slice(1,-1):p;sp.appendChild(tx);e.appendChild(sp);A(sp,[{opacity:0},{opacity:1}],{duration:D()})})}});
FXH.stopmotion=fw=>A(fw,[{translate:"0 0",rotate:"0deg"},{translate:"2px 1px",rotate:".6deg"},{translate:"-1px 2px",rotate:"-.5deg"},{translate:"1px -2px",rotate:".3deg"}],{duration:400,iterations:Infinity,easing:"steps(3)"});
LAYOUTS.push("collage","handwrite","marker");FXS.push("stopmotion");
LAYOUTS.push("center","ripple-pool","constellation","particle-form","hud-frame","parallax-depth","polaroid","page-flip","ink-bleed","laser-scan","split-flap","wave-path","mirror-reflect","cylinder","iris-frame","annotate");ENTERS.push("iris");
