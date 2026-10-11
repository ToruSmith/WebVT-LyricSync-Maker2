/* ===== [LAY-A] 版型 A（NL 表）：typewriter vertical blurfocus wipe glitch stack outline-big subtitle-box poster；輔助 CE / fit ===== */
const CE=(c,css)=>{const e=txtEl(`inset:0;display:flex;align-items:center;justify-content:center;text-align:center;${css}`);c.appendChild(e);return e};
const fit=(sb,big)=>{const n=Math.max(sb.plain.length,3),ln=Math.ceil(n/18);return Math.min(big*.55,SWd()/(n/ln)*.9,SHd()/ln*.5)}; // 長句自動換行並縮小
const NL={
 typewriter(sb,c,w,big,sm,dur,list){const e=txtEl(`left:8cqw;right:8cqw;top:50%;margin-top:-1em;font-size:${sm*1.8}px;white-space:pre-wrap`);c.appendChild(e);
  const l=chars(sb.plain,e),t=dur*600/l.length;l.forEach((x,i)=>A(x,[{opacity:0},{opacity:1}],{duration:1,delay:i*t}));
  const cu=document.createElement("span");cu.textContent="▏";e.appendChild(cu);A(cu,[{opacity:1},{opacity:1,offset:.5},{opacity:0,offset:.5},{opacity:0}],{duration:1000,iterations:Infinity,easing:"linear"})},
 vertical(sb,c,w,big,sm){const n=Math.max(1,[...sb.plain].length),fs=Math.min(sm*2,SHd()*.74/(n*1.6)),e=txtEl(`right:12cqw;top:12cqh;font-size:${fs}px;writing-mode:vertical-rl;letter-spacing:.6em`);e.textContent=sb.plain;c.appendChild(e);enter(e,sb.en||"fade");
  const ln=document.createElement("div");ln.className="ln";ln.style.cssText="position:absolute;right:8cqw;top:12cqh;width:2px;height:70cqh;transform-origin:top";c.appendChild(ln);A(ln,[{transform:"scaleY(0)"},{transform:"scaleY(1)"}],{duration:D()*2})},
 blurfocus(sb,c,w,big){const e=CE(c,`font-size:${fit(sb,big)}px`);e.textContent=sb.plain;A(e,[{opacity:0,filter:"blur(22px)",letterSpacing:"1.2em"},{opacity:1,filter:"blur(0)",letterSpacing:CONFIG.spacing+"em"}],{duration:D()*1.6})},
 wipe(sb,c,w,big){const e=CE(c,`font-size:${fit(sb,big)}px`);e.textContent=sb.plain;A(e,[{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)"}],{duration:D()*1.5,easing:"linear"});
  const b=document.createElement("div");b.style.cssText="position:absolute;top:30cqh;height:40cqh;width:3px;background:#fff;box-shadow:0 0 12px #fff";c.appendChild(b);A(b,[{left:"0",opacity:1},{left:"100%",opacity:1,offset:.98},{left:"100%",opacity:0}],{duration:D()*1.5,easing:"linear"})},
 glitch(sb,c,w,big){const z=fit(sb,big);[[CONFIG.ghostOn?hex6(CONFIG.ghostA,"#ff3333"):"#f33",1],[CONFIG.ghostOn?hex6(CONFIG.ghostB,"#3399ff"):"#39f",-1]].forEach(([col,d])=>{const g=CE(c,`font-size:${z}px;color:${col};mix-blend-mode:screen`);g.textContent=sb.plain;
   A(g,[{transform:`translate(${d*14}px,0)`,clipPath:"inset(10% 0 60% 0)"},{transform:`translate(${-d*8}px,0)`,clipPath:"inset(55% 0 10% 0)",offset:.4},{transform:`translate(${d*3}px,0)`,clipPath:"inset(0)"}],{duration:300,easing:"steps(6)"})});
  const e=CE(c,`font-size:${z}px`);e.textContent=sb.plain;enter(e,"fade")},
 stack(sb,c,w,big,sm,dur,list){const t=[...sb.plain],n=Math.min(3,Math.max(1,t.length)),k=Math.ceil(t.length/n);
  const e=txtEl(`inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 8cqw;font-size:${big*.9}px;line-height:1.05;letter-spacing:.05em`);c.appendChild(e);
  for(let i=0;i<n;i++){const r=document.createElement("div");r.textContent=t.slice(i*k,i*k+k).join("");r.style.textAlign=i%2?"right":"left";e.appendChild(r);A(r,[{opacity:0,transform:`translateX(${i%2?8:-8}cqw)`},{opacity:1,transform:"none"}],{duration:D(),delay:i*150})}},
 "outline-big"(sb,c,w,big){const b=CE(c,`font-size:${big*2.4}px;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.7);letter-spacing:0;opacity:.8`);b.textContent=sb.plain.slice(0,3);enter(b,"zoomin");
  const e=CE(c,`font-size:${fit(sb,big)*.5}px`);e.textContent=sb.plain;enter(e,sb.en||"rise")},
 "subtitle-box"(sb,c,w,big,sm,dur){const e=txtEl(`left:10cqw;right:10cqw;bottom:8cqh;padding:1.2cqh 2cqw;background:rgba(0,0,0,.55);text-align:center;font-size:${sm*1.6}px;letter-spacing:.1em`);c.appendChild(e);
  const l=chars(sb.plain,e,"color:rgba(255,255,255,.4)"),t=dur*800/l.length;l.forEach((x,i)=>A(x,[{color:"rgba(255,255,255,.4)"},{color:"#fff"}],{duration:t,delay:i*t,easing:"linear"}));enter(e,"fade")},
 poster(sb,c,w,big,sm){const t=sb.br[0]||sb.plain;const e=CE(c,`font-size:${Math.min(fit({plain:t},big)*1.2,SWd()/Math.max(t.length,3)*.9)}px;margin-top:-8cqh`);e.textContent=t;enter(e,sb.en||"rise");
  const ln=document.createElement("div");ln.className="ln";ln.style.cssText="position:absolute;left:30cqw;right:30cqw;top:62cqh;transform-origin:center";c.appendChild(ln);A(ln,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:D()*1.5});
  const s2=CE(c,`font-size:${sm}px;margin-top:20cqh;letter-spacing:.8em`);s2.textContent=sb.plain;enter(s2,"fade")}
};
