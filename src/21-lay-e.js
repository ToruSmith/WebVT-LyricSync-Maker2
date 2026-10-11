/* ===== [LAY-E] 版型 E：center ripple-pool constellation particle-form hud-frame parallax-depth（輔助 reel 供 hud-frame 用；ripple-pool 的 WebGL 部分在上方 [WATER]）===== */
const reel=(items,css,ms,iter)=>{const h=txtEl(css+";height:1.25em;line-height:1.25em;overflow:hidden;white-space:pre;letter-spacing:.08em;font-family:ui-monospace,Consolas,'Courier New',monospace");delete h.dataset.t;
 const col=document.createElement("div");items.forEach(t=>{const r=document.createElement("div");r.textContent=t;col.appendChild(r)});h.appendChild(col);
 A(col,[{translate:"0 0"},{translate:`0 ${-(items.length-1)*1.25}em`}],{duration:ms,easing:`steps(${Math.max(1,items.length-1)},end)`,iterations:iter||1});return h};
Object.assign(NL,{
 center(sb,c,w,big,sm,dur,list){const z=Math.min(big*.55,SWd()/Math.max(sb.plain.length,3)*.9);
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.15em;padding-left:.15em`);c.appendChild(e);
  list.push(...chars(sb.plain,e));if(sb.en)enter(e,sb.en,list)},
 "ripple-pool"(sb,c,w,big,sm,dur,list){const p=beatMs(),ph=beatPh(sb),z=Math.min(big*.55,SWd()/Math.max(sb.plain.length,3)*.85);
  if(waterGL(sb,c,z,p,ph)){const pm=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.12em;padding-left:.12em;visibility:hidden;pointer-events:none`);delete pm.dataset.t;pm.dataset.pm=1;pm.textContent=sb.plain;c.appendChild(pm);return}
  for(let i=0;i<5;i++){const r=document.createElement("div");
   r.style.cssText="position:absolute;left:50%;top:50%;translate:-50% -50%;width:min(95cqw,95cqh);height:min(95cqw,95cqh);border-radius:50%;border:max(2px,.25cqh) solid rgba(255,255,255,.8);box-shadow:0 0 2cqh color-mix(in srgb,var(--a) 55%,transparent),inset 0 0 2cqh color-mix(in srgb,var(--a) 25%,transparent);pointer-events:none";
   c.appendChild(r);A(r,[{scale:0,opacity:.85},{scale:1,opacity:0}],{duration:p*5,delay:ph-i*p,iterations:Infinity,easing:"cubic-bezier(.2,.6,.3,1)"})}
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.12em;padding-left:.12em`);c.appendChild(e);
  const ch=chars(sb.plain,e),m=(ch.length-1)/2;list.push(...ch);
  ch.forEach((x,i)=>A(x,[{translate:"0 0"},{translate:"0 -.07em",offset:.2},{translate:"0 0",offset:.55}],{duration:p,delay:ph+Math.abs(i-m)*35,iterations:Infinity,easing:"ease-out"}));
  if(sb.en)enter(e,sb.en,list)},
 constellation(sb,c,w,big,sm,dur,list){const r=sr(sb.s),vw=SWd(),vh=SHd(),z=Math.min(big*.5,vw/Math.max(sb.plain.length,3)*.8),E=Math.min(dur*500,2000);
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.15em;padding-left:.15em`);c.appendChild(e);
  const ch=chars(sb.plain,e);list.push(...ch);const o=$("#stage").getBoundingClientRect();
  const ov=document.createElement("div");ov.dataset.nm=1;ov.style.cssText="position:absolute;inset:0;pointer-events:none;overflow:visible";c.appendChild(ov);
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox",`0 0 ${vw} ${vh}`);svg.style.cssText="position:absolute;inset:0;width:100%;height:100%";ov.appendChild(svg);
  const dsz=Math.max(3,vh*.007),dots=[];
  ch.forEach((x,i)=>{const b=x.getBoundingClientRect(),cx=b.left-o.left+b.width/2,cy=b.top-o.top+b.height/2;
   for(let k=0;k<3;k++){const sx=r()*vw,sy=r()*vh,tx=cx+(r()-.5)*b.width*.8,ty=cy+(r()-.5)*b.height*.7;
    const d=document.createElement("div");d.style.cssText=`position:absolute;left:0;top:0;width:${dsz}px;height:${dsz}px;margin:${-dsz/2}px;border-radius:50%;background:#fff;box-shadow:0 0 ${dsz*2}px var(--a)`;ov.appendChild(d);
    A(d,[{translate:`${sx}px ${sy}px`,opacity:0},{translate:`${sx}px ${sy}px`,opacity:1,offset:.25,easing:"cubic-bezier(.5,0,.2,1)"},{translate:`${tx}px ${ty}px`,opacity:1,offset:.85},{translate:`${tx}px ${ty}px`,opacity:.15}],{duration:E+400,delay:i*60});dots.push([sx,sy])}
   A(x,[{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0)"}],{duration:E*.5,delay:E*.55+i*50});
   for(let k=0;k<4;k++){const t=document.createElement("div"),s2=Math.max(3,dsz*1.1);t.style.cssText=`position:absolute;left:0;top:0;width:${s2}px;height:${s2}px;border-radius:50%;background:#fff;box-shadow:0 0 ${s2*2.5}px var(--a);translate:${cx+(r()-.5)*b.width*1.4}px ${cy+(r()-.5)*b.height*1.5}px`;ov.appendChild(t);
    A(t,[{opacity:0},{opacity:.95},{opacity:0}],{duration:1400+r()*1600,delay:E+r()*1200,iterations:Infinity})}});
  for(let j=0;j<dots.length-1;j++){const l=document.createElementNS("http://www.w3.org/2000/svg","line");l.setAttribute("x1",dots[j][0]);l.setAttribute("y1",dots[j][1]);l.setAttribute("x2",dots[j+1][0]);l.setAttribute("y2",dots[j+1][1]);
   l.setAttribute("stroke","rgba(255,255,255,.4)");l.setAttribute("stroke-width","1");svg.appendChild(l);A(l,[{opacity:0},{opacity:.8,offset:.2},{opacity:.8,offset:.45},{opacity:0}],{duration:E*.95})}
  if(sb.en)enter(e,sb.en,list)},
 "particle-form"(sb,c,w,big,sm,dur,list){const r=sr(sb.s),W0=SWd(),H0=SHd(),T=Math.max(600,dur*1000),X=CONFIG.exit*1000,z=Math.min(big*.7,W0/Math.max(sb.plain.length,3)*.85),fam=FONTS[curFont||CONFIG.font]||CONFIG.font;
  const cv=document.createElement("canvas");cv.width=W0;cv.height=H0;const g=cv.getContext("2d",{willReadFrequently:true});
  g.font=`${CONFIG.weight} ${z}px ${fam}`;g.textBaseline="middle";const hasHL=!!(sb.hl&&sb.hl.some(Boolean));
  if(hasHL){const P=[...sb.plain],x0=W0/2-g.measureText(sb.plain).width/2;g.textAlign="left";P.forEach((ch,i)=>{g.fillStyle=sb.hl[i]?"#f00":"#fff";g.fillText(ch,x0+g.measureText(P.slice(0,i).join("")).width,H0/2)})}else{g.textAlign="center";g.fillStyle="#fff";g.fillText(sb.plain,W0/2,H0/2)}
  const d=g.getImageData(0,0,W0,H0).data,step=Math.max(4,Math.round(z/16)),pts=[];
  for(let y=0;y<H0;y+=step)for(let x=0;x<W0;x+=step)if(d[(y*W0+x)*4+3]>128)pts.push([x,y,hasHL&&d[(y*W0+x)*4+1]<128]);
  for(let i=pts.length-1;i>0;i--){const j=r()*(i+1)|0;[pts[i],pts[j]]=[pts[j],pts[i]]}
  const E=Math.min(T*.45,1800),a=E/T,b=Math.max(a+.05,1-X/T),ps=Math.max(2,step*.6);
  pts.slice(0,340).forEach(([x,y,hh])=>{const p=document.createElement("div"),sx=(r()-.5)*W0*2.2+W0/2,sy=(r()-.5)*H0*2.2+H0/2,ex=(r()-.5)*W0*1.6+W0/2,ey=(r()-.5)*H0*1.6+H0/2,ai=a*(.6+.4*r());
   p.style.cssText=`position:absolute;left:0;top:0;width:${ps}px;height:${ps}px;margin:${-ps/2}px;border-radius:50%;background:${hh?"var(--a)":"#fff"};box-shadow:0 0 ${ps*2}px var(--a);pointer-events:none`;c.appendChild(p);
   A(p,[{translate:`${sx}px ${sy}px`,opacity:0,offset:0},{translate:`${sx}px ${sy}px`,opacity:.9,offset:Math.min(.06,ai*.3),easing:"cubic-bezier(.2,.8,.3,1)"},{translate:`${x}px ${y}px`,opacity:1,offset:ai},{translate:`${x}px ${y}px`,opacity:0,offset:Math.min(ai*1.3,b-.02)},{translate:`${x}px ${y}px`,opacity:0,offset:b},{translate:`${x}px ${y}px`,opacity:1,offset:Math.min(b+.02,.99)},{translate:`${ex}px ${ey}px`,opacity:0,offset:1}],{duration:T,easing:"linear"})});
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:0`);if(hasHL)hlText(e,sb);else e.textContent=sb.plain;c.appendChild(e);
  A(e,[{opacity:0,offset:0},{opacity:0,offset:a*.8},{opacity:1,offset:Math.min(a*1.15,b)},{opacity:1,offset:b},{opacity:0,offset:Math.min(b+.03,1)}],{duration:T,easing:"linear"})},
 "hud-frame"(sb,c,w,big,sm,dur,list){const r=sr(sb.s),T=Math.max(600,dur*1000),z=Math.min(big*.5,SWd()/Math.max(sb.plain.length,3)*.85),fs=sm*.55;
  [["left:4cqw;top:6cqh;border-top-width:2px;border-left-width:2px"],["right:4cqw;top:6cqh;border-top-width:2px;border-right-width:2px"],["left:4cqw;bottom:6cqh;border-bottom-width:2px;border-left-width:2px"],["right:4cqw;bottom:6cqh;border-bottom-width:2px;border-right-width:2px"]].forEach(([s],i)=>{
   const b=document.createElement("div");b.style.cssText=`position:absolute;width:5cqh;height:5cqh;border:0 solid var(--a);${s}`;c.appendChild(b);A(b,[{opacity:0,scale:1.6},{opacity:.9,scale:1}],{duration:D()*.8,delay:i*70})});
  const sync=Array.from({length:18},(_,i)=>`SYNC ${String(12+Math.round(i*(70+r()*17)/17)).padStart(2," ")}%`);
  c.appendChild(reel(sync,`left:6.5cqw;top:8.5cqh;font-size:${fs}px;color:var(--a)`,Math.min(T*.7,2600)));
  const xy=Array.from({length:24},()=>`X:${String(r()*9999|0).padStart(4,"0")}  Y:${String(r()*9999|0).padStart(4,"0")}`);
  c.appendChild(reel(xy,`right:6.5cqw;top:8.5cqh;font-size:${fs}px;text-align:right;opacity:.75`,3200,Infinity));
  ["UNIT-"+(100+r()*899|0),"LINK ▸ STABLE","RGB ▸ "+[r(),r(),r()].map(v=>(v*255|0).toString(16).padStart(2,"0")).join("").toUpperCase()].forEach((t,i)=>{
   const e=txtEl(`left:6.5cqw;bottom:${8.5+(2-i)*2.6}cqh;font-size:${fs*.85}px;letter-spacing:.12em;opacity:.6;white-space:pre;font-family:ui-monospace,Consolas,'Courier New',monospace`);delete e.dataset.t;e.textContent=t;c.appendChild(e);A(e,[{opacity:0},{opacity:.6}],{duration:D(),delay:300+i*120})});
  const sc=document.createElement("div");sc.style.cssText="position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--a),transparent);opacity:.5;pointer-events:none";c.appendChild(sc);
  A(sc,[{translate:"0 0"},{translate:`0 ${SHd()}px`}],{duration:3400,iterations:Infinity,easing:"linear"});
  const pb=document.createElement("div");pb.style.cssText="position:absolute;left:4cqw;right:4cqw;bottom:4.5cqh;height:2px;background:rgba(255,255,255,.18)";c.appendChild(pb);
  const pf=document.createElement("div");pf.style.cssText="width:100%;height:100%;background:var(--a);transform-origin:left";pb.appendChild(pf);A(pf,[{scale:"0 1"},{scale:"1 1"}],{duration:T,easing:"linear"});
  const bl=document.createElement("div");bl.style.cssText="position:absolute;right:6.5cqw;top:5.4cqh;width:1.2cqh;height:1.2cqh;background:var(--a)";c.appendChild(bl);A(bl,[{opacity:1},{opacity:0,offset:.5},{opacity:1,offset:.5001}],{duration:900,iterations:Infinity,easing:"steps(1)"});
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.15em;padding-left:.15em`);c.appendChild(e);
  const ch=chars(sb.plain,e);list.push(...ch);ch.forEach((x,i)=>A(x,[{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0)"}],{duration:D()*.7,delay:300+i*45}));
  if(sb.en)enter(e,sb.en,list)},
 "parallax-depth"(sb,c,w,big,sm,dur,list){const T=Math.max(600,dur*1000),z=Math.min(big*.6,SWd()/Math.max(sb.plain.length,3)*.9);
  [{s:2.1,b:9,o:.16,dx:2},{s:1.45,b:3.5,o:.3,dx:5},{s:1,b:0,o:1,dx:9,main:1},{s:1.28,b:6,o:.3,dx:22}].forEach((L0,i)=>{
   const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${z}px;letter-spacing:.1em;padding-left:.1em;filter:blur(${L0.b}px);opacity:${L0.o}`);e.style.transform="none";c.appendChild(e);if(!L0.main)e.dataset.nm=1;
   if(L0.main){list.push(...chars(sb.plain,e))}else e.textContent=sb.plain;
   A(e,[{translate:`${-L0.dx}cqw -50%`,scale:L0.s*.96},{translate:`${L0.dx}cqw -50%`,scale:L0.s*1.04}],{duration:T,easing:"linear"});
   if(L0.main&&sb.en)enter(e,sb.en,list)})}
});
