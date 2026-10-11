/* ===== [LAY-F] 版型 F：polaroid page-flip ink-bleed laser-scan split-flap wave-path mirror-reflect cylinder iris-frame annotate。皆為時間的純函數（A() 暫停動畫 + 種子亂數）===== */
const PAPER="#f3eee2",INK="#2a2622",NS="http://www.w3.org/2000/svg";
const regProp=(...n)=>n.forEach(x=>{try{CSS.registerProperty({name:x,syntax:"<percentage>",inherits:false,initialValue:"-20%"})}catch(e){}});
Object.assign(NL,{
 polaroid(sb,c,w,big,sm,dur,list){const r=sr(sb.s),vw=SWd(),ch=[...sb.plain],n=ch.length<=3?1:ch.length<=6?2:3,k=Math.ceil(ch.length/n);
  const parts=Array.from({length:n},(_,i)=>ch.slice(i*k,(i+1)*k).join("")).filter(Boolean),m=Math.max(...parts.map(p=>[...p].length),2),fs=Math.min(big*.38,vw*.6/parts.length/m*.9);
  const row=txtEl("inset:0;display:flex;align-items:center;justify-content:center");c.appendChild(row);
  parts.forEach((p,i)=>{const card=document.createElement("div");
   card.style.cssText=`position:relative;top:${(r()-.5)*5}cqh;margin:0 -1.2cqw;padding:${fs*.28}px ${fs*.28}px ${fs*.9}px;background:${PAPER};rotate:${(r()-.5)*12+(i-(parts.length-1)/2)*3}deg;box-shadow:0 1.2cqh 3cqh rgba(0,0,0,.55);z-index:${i}`;
   const ph=txtEl(`position:relative;padding:${fs*.35}px ${fs*.4}px;background:linear-gradient(135deg,color-mix(in srgb,var(--a) 55%,#101826),#0b1020);font-size:${fs}px;letter-spacing:.1em;line-height:1.1;white-space:pre`);
   list.push(...chars(p,ph));card.appendChild(ph);
   if(i===0){const t=document.createElement("div");t.style.cssText=`position:absolute;left:50%;top:-${fs*.3}px;width:${fs*1.6}px;height:${fs*.55}px;translate:-50% 0;rotate:-4deg;background:rgba(255,235,160,.6)`;card.appendChild(t)}
   row.appendChild(card);A(card,[{translate:`${(i%2?1:-1)*(90+r()*20)}cqw ${(r()-.5)*30}cqh`,scale:1.4,opacity:0},{translate:"0 0",scale:1,opacity:1}],{duration:D()*1.1,delay:i*320/CONFIG.speed,easing:"cubic-bezier(.2,.8,.2,1)"})});
  if(sb.en)enter(row,sb.en,list)},
 "page-flip"(sb,c,w,big,sm,dur,list){const i=subs.indexOf(sb),prev=i>0?subs[i-1].plain:"",vw=SWd(),vh=SHd(),ks=(+CONFIG.textScale||100)/100,pw=Math.min(vw*.4*ks,vw*.48,vh*.78*ks),ph=Math.min(vh*.56*ks,pw*.8,vh*.92);
  const st=document.createElement("div");st.style.cssText=`position:absolute;inset:0;perspective:${vw*1.5}px`;c.appendChild(st);
  const pg=(txt,css)=>{const p=txtEl(`top:${-ph/2}px;width:${pw}px;height:${ph}px;background:${PAPER};color:${INK};display:flex;align-items:center;justify-content:center;font-size:${Math.min(ph*.3,pw*.8/Math.max([...txt].length,3))}px;letter-spacing:.12em;box-shadow:0 1.5cqh 4cqh rgba(0,0,0,.45);${css}`);p.style.left="50%";p.style.top="50%";p.style.marginTop=-ph/2+"px";p.textContent=txt;return p};
  const left=pg("","margin-left:"+(-pw)+"px;background:linear-gradient(90deg,#e6e0d0,#d9d2bf)");st.appendChild(left);
  const right=pg(sb.plain,"background:linear-gradient(90deg,#d9d2bf,"+PAPER+" 10%)");st.appendChild(right);
  const leaf=document.createElement("div");leaf.style.cssText=`position:absolute;left:50%;top:50%;margin-top:${-ph/2}px;width:${pw}px;height:${ph}px;transform-origin:left center;transform-style:preserve-3d`;
  const f=pg(prev,"left:0;margin:0;top:0;backface-visibility:hidden");f.style.left="0";f.style.top="0";f.style.marginTop="0";const b=pg("","left:0;margin:0;backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(90deg,#d9d2bf,#e9e3d3)");b.style.left="0";b.style.top="0";b.style.marginTop="0";
  leaf.append(f,b);st.appendChild(leaf);const T=Math.max(800,dur*1000);
  A(leaf,[{transform:"rotateY(0deg)"},{transform:"rotateY(-180deg)"}],{duration:Math.min(T*.45,D()*1.8),delay:150,easing:"cubic-bezier(.6,0,.3,1)"})},
 "ink-bleed"(sb,c,w,big,sm,dur){const r=sr(sb.s),z=fit(sb,big)*1.05,T=Math.max(800,dur*1000),E=Math.min(T*.55,2000);regProp("--k0","--k1","--k2");
  if(!document.getElementById("inkf")){const s=document.createElementNS(NS,"svg");s.setAttribute("width","0");s.setAttribute("height","0");s.style.position="absolute";
   s.innerHTML='<filter id="inkf" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>';document.body.appendChild(s)}
  const o=CE(c,`font-size:${z}px;letter-spacing:.1em`);o.style.filter="url(#inkf)";const e=document.createElement("div");e.style.whiteSpace="pre";e.textContent=sb.plain;o.appendChild(e);
  const g=[0,1,2].map(k=>`radial-gradient(circle at ${15+r()*70}% ${30+r()*40}%,#000 var(--k${k}),transparent calc(var(--k${k}) + 14%))`).join(",");e.style.webkitMaskImage=e.style.maskImage=g;
  [0,1,2].forEach(k=>A(e,[{["--k"+k]:"-20%"},{["--k"+k]:"110%"}],{duration:E,delay:k*E*.15,easing:"cubic-bezier(.3,.6,.4,1)"}))},
 "laser-scan"(sb,c,w,big,sm,dur){const i=subs.indexOf(sb),vert=i%2===1,z=fit(sb,big),S=Math.min(Math.max(dur*450,700),1800),SW=SWd(),SH=SHd();
  const e=CE(c,`font-size:${z}px;letter-spacing:.12em`);e.textContent=sb.plain;const cl=vert?"inset(0 0 100% 0)":"inset(0 100% 0 0)";
  A(e,[{clipPath:cl},{clipPath:"inset(0)"}],{duration:S,easing:"linear"});
  const mk=css=>{const d=document.createElement("div");d.style.cssText="position:absolute;pointer-events:none;"+css;c.appendChild(d);return d};
  const end=vert?`0 ${SH}px`:`${SW}px 0`,mv=d=>A(d,[{translate:"0 0",opacity:1},{translate:end,opacity:1,offset:.97},{translate:end,opacity:0}],{duration:S*1.03,easing:"linear"});
  const gl="0 0 2cqh 4px var(--a),0 0 6cqh var(--a)";
  mv(mk(vert?`left:0;right:0;top:0;height:3px;background:var(--a);box-shadow:${gl}`:`top:0;bottom:0;left:0;width:3px;background:var(--a);box-shadow:${gl}`));
  mv(mk(vert?`left:0;right:0;top:-14cqh;height:14cqh;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--a) 35%,transparent))`:`top:0;bottom:0;left:-14cqw;width:14cqw;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--a) 35%,transparent))`));
  const gr=mk("inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4cqh),repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4cqh)");
  A(gr,[{clipPath:cl,opacity:1},{clipPath:"inset(0)",opacity:1,offset:.5},{clipPath:"inset(0)",opacity:.35}],{duration:S*1.5,easing:"linear"})},
 "split-flap"(sb,c,w,big,sm,dur){const r=sr(sb.s),chs=[...sb.plain],fs=Math.min(big*.45,SWd()/Math.max(chs.length,4)*.78),pool=[...new Set([...subs.map(x=>x.plain).join(""),..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"])].filter(x=>!/\s/.test(x));
  const row=CE(c,`font-size:${fs}px;gap:.12em;letter-spacing:0`);row.dataset.rg="1";
  chs.forEach((ch,i)=>{if(/\s/.test(ch)){const s=document.createElement("div");s.style.width=".5em";row.appendChild(s);return}
   const n=7+(r()*5|0),items=Array.from({length:n-1},()=>pool[r()*pool.length|0]);items.push(ch);
   const t=document.createElement("div");t.style.cssText=`position:relative;width:${/[\x00-\xff]/.test(ch)?.7:1.05}em;height:1.3em;line-height:1.3em;overflow:hidden;text-align:center;background:linear-gradient(#2e3441 50%,#232834 50%);border-radius:.1em;border:1px solid rgba(255,255,255,.1);box-shadow:inset 0 0 .15em rgba(0,0,0,.6)`;
   const col=document.createElement("div");items.forEach(x=>{const d=document.createElement("div");d.textContent=x;col.appendChild(d)});t.appendChild(col);
   const sp=document.createElement("div");sp.style.cssText="position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:rgba(0,0,0,.85)";t.appendChild(sp);row.appendChild(t);
   A(col,[{translate:"0 0"},{translate:`0 ${-(n-1)*1.3}em`}],{duration:(500+r()*500)/CONFIG.speed,delay:i*70/CONFIG.speed,easing:`steps(${n-1},end)`});
   A(t,[{opacity:0},{opacity:1}],{duration:200,delay:i*70/CONFIG.speed})})},
 "wave-path"(sb,c,w,big,sm,dur,list){const z=Math.min(big*.5,SWd()/Math.max(sb.plain.length,3)*.85),e=CE(c,`font-size:${z}px;letter-spacing:.1em`),ch=chars(sb.plain,e);list.push(...ch);
  const P=4200/CONFIG.speed,amp=z*.32,ph=.7,N=24,wch=z*1.1;
  ch.forEach((x,i)=>{const kf=Array.from({length:N+1},(_,j)=>{const a=2*Math.PI*j/N+i*ph,sl=amp*ph/wch*Math.cos(a);return{translate:`0 ${(amp*Math.sin(a)).toFixed(1)}px`,rotate:`${(Math.atan(sl)*180/Math.PI).toFixed(1)}deg`}});A(x,kf,{duration:P,iterations:Infinity,easing:"linear"})});
  if(sb.en)enter(e,sb.en,list)},
 "mirror-reflect"(sb,c,w,big,sm,dur,list){const z=fit(sb,big)*.9,col=txtEl(`inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:${z}px;letter-spacing:.12em`);c.appendChild(col);
  const e=document.createElement("div");e.style.cssText="line-height:1.15;white-space:pre";list.push(...chars(sb.plain,e));
  const rf=document.createElement("div"),mk="linear-gradient(to top,rgba(0,0,0,.9),transparent 78%)";rf.style.cssText=`line-height:1.15;white-space:pre;transform:scaleY(-1);opacity:.45;-webkit-mask-image:${mk};mask-image:${mk}`;
  chars(sb.plain,rf).forEach((x,i)=>A(x,[{transform:"translateY(0) skewX(0deg)"},{transform:"translateY(.03em) skewX(3deg)"},{transform:"translateY(-.02em) skewX(-3deg)"},{transform:"translateY(0) skewX(0deg)"}],{duration:2600+i*180,iterations:Infinity,easing:"ease-in-out"}));
  const wl=document.createElement("div");wl.style.cssText="width:70cqw;height:2px;background:linear-gradient(90deg,transparent,var(--a),transparent);opacity:.7;margin:.02em 0";col.append(e,wl,rf);
  if(sb.en){enter(e,sb.en,list);A(rf,[{opacity:0},{opacity:.45}],{duration:D()})}},
 cylinder(sb,c,w,big){const i=subs.indexOf(sb),prev=i>0?subs[i-1].plain:"",next=subs[i+1]?subs[i+1].plain:"",z=fit(sb,big)*.8,R=z*3.4,T=Math.max(800,dur(sb)),X=CONFIG.exit*1000,step=36;
  const a=Math.min(.4,D()*1.3/T),b=Math.max(a+.05,1-X/T);
  const st=document.createElement("div");st.style.cssText=`position:absolute;inset:0;perspective:${SWd()*1.6}px`;c.appendChild(st);
  const dr=document.createElement("div");dr.style.cssText="position:absolute;left:0;right:0;top:50%;height:0;transform-style:preserve-3d";st.appendChild(dr);
  const row=(t,ang,op)=>{if(!t)return;const e=txtEl(`left:0;right:0;top:${-z*.6}px;height:${z*1.2}px;line-height:${z*1.2}px;text-align:center;font-size:${z}px;letter-spacing:.12em;white-space:pre;transform:rotateX(${ang}deg) translateZ(${R}px)`);e.textContent=t;dr.appendChild(e);A(e,op,{duration:T,easing:"linear"})};
  row(prev,step,[{opacity:1},{opacity:.3,offset:a},{opacity:.3}]);row(sb.plain,0,[{opacity:.3},{opacity:1,offset:a},{opacity:1,offset:b},{opacity:.3}]);row(next,-step,[{opacity:.3},{opacity:.3,offset:b},{opacity:1}]);
  A(dr,[{transform:`translateZ(${-R}px) rotateX(${-step}deg)`,easing:"cubic-bezier(.3,.7,.3,1)"},{transform:`translateZ(${-R}px) rotateX(0deg)`,offset:a},{transform:`translateZ(${-R}px) rotateX(0deg)`,offset:b,easing:"cubic-bezier(.7,0,.7,.3)"},{transform:`translateZ(${-R}px) rotateX(${step}deg)`}],{duration:T,easing:"linear"})},
 "iris-frame"(sb,c,w,big,sm,dur,list){const i=subs.indexOf(sb),rect=i%2===1,vw=SWd(),vh=SHd(),T=Math.max(800,dur*1000),X=CONFIG.exit*1000,n=Math.max(sb.plain.length,2);
  const d=Math.min(vh*.8,vw*.62),W0=rect?Math.min(vw*.78,d*1.7):d,H0=rect?d*.55:d,fs=Math.min(big*.42,W0*.82/n),a=Math.min(.35,D()*1.2/T),b=Math.max(a+.05,1-X/T);
  const ap=document.createElement("div");ap.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;border:2px solid var(--a);border-radius:${rect?"1.2cqh":"50%"};box-shadow:0 0 0 120vmax rgba(0,0,0,.86),0 0 3cqh var(--a),inset 0 0 3cqh rgba(122,168,255,.25);pointer-events:none`;c.appendChild(ap);
  A(ap,[{width:"0px",height:"0px",easing:"cubic-bezier(.3,.7,.3,1)"},{width:W0+"px",height:H0+"px",offset:a},{width:W0+"px",height:H0+"px",offset:b,easing:"cubic-bezier(.7,0,.7,.3)"},{width:"0px",height:"0px"}],{duration:T,easing:"linear"});
  const e=CE(c,`font-size:${fs}px;letter-spacing:.12em`);list.push(...chars(sb.plain,e));
  A(e,[{opacity:0},{opacity:0,offset:a*.6},{opacity:1,offset:a},{opacity:1,offset:b},{opacity:0}],{duration:T,easing:"linear"});if(sb.en)enter(e,sb.en,list)},
 annotate(sb,c,w,big){const e=txtEl(`inset:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;padding:0 8cqw;font-size:${Math.min(big*.5,SWd()/Math.max(sb.plain.length,4)*.9)}px;letter-spacing:.12em;white-space:pre-wrap`);c.appendChild(e);
  const SHP=["M6 22 C2 8,38 1,78 4 C104 7,102 36,60 38 C20 40,-2 30,10 12","M2 34 C28 30,58 38,98 31","M50 3 L56 18 L72 18 L59 27 L64 42 L50 33 L36 42 L41 27 L28 18 L44 18 Z"];
  let parts=sb.raw.split(/(\{[^}]*\})/).filter(Boolean),k=0;if(!sb.br.length)parts=["{"+sb.raw+"}"];
  parts.forEach(p=>{const kw=/^\{/.test(p),sp=document.createElement("span");sp.style.cssText="position:relative;display:inline-block";const tx=document.createElement("span");tx.textContent=kw?p.slice(1,-1):p;sp.appendChild(tx);e.appendChild(sp);A(sp,[{opacity:0},{opacity:1}],{duration:D()});
   if(kw){const m=k%3,sv=document.createElementNS(NS,"svg");sv.setAttribute("viewBox",m===2?"0 0 100 45":"0 0 100 40");sv.setAttribute("preserveAspectRatio","none");
    sv.style.cssText=m===2?"position:absolute;right:-.55em;top:-.75em;width:.8em;height:.8em;overflow:visible":"position:absolute;left:-.3em;top:-.2em;width:calc(100% + .6em);height:calc(100% + .4em);overflow:visible";
    const pa=document.createElementNS(NS,"path");pa.setAttribute("d",SHP[m]);pa.setAttribute("pathLength","1");Object.assign(pa.style,{fill:"none",stroke:"var(--a)",strokeWidth:m===2?"2.5px":"4px",strokeLinecap:"round",strokeLinejoin:"round",strokeDasharray:"1",vectorEffect:"non-scaling-stroke",filter:"drop-shadow(0 0 .12em var(--a))"});
    sv.appendChild(pa);sp.appendChild(sv);A(pa,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:D()*.9,delay:D()+(k++)*350,easing:"cubic-bezier(.6,0,.3,1)"})}})}
});
const dur=sb=>(sb.e-sb.s)*1000;


