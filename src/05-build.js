/* ===== [BUILD] 建立一句的畫面：syncPlain / build()（版型分派、退場、持續特效、樣式、位置）===== */
const TICKS=[];
/* 主文(plain)是否含 {} 內的字，取決於「實際使用的版型」：關鍵字版型要把它拆出來另外畫，其他版型要留在句子裡。
   parseTag 只依 SRT 標記決定一次；但「鎖定單一版型」或自動換版型會改掉實際版型，因此建構畫面前依實際版型重算，否則 {} 內的字會消失或重複。 */
function syncPlain(){subs.forEach(x=>{const l=LAYOUTS.includes(CONFIG.lock||x.lay)?(CONFIG.lock||x.lay):"lowerleft";x.plain=BRACE_LAYOUTS.has(l)?x.raw.replace(/\{[^}]*\}/g,"").trim():x.raw.replace(/[{}]/g,"").trim()})}
function build(sb){
 syncPlain();TICKS.length=0;anims=[];L.innerHTML="";
 scr=[];lastCt=-1;curFont=sb.font||"";const w=document.createElement("div");w.className="w";L.appendChild(w);
 const lay=LAYOUTS.includes(CONFIG.lock||sb.lay)?(CONFIG.lock||sb.lay):"lowerleft",en=sb.en||({slam:"",bounce:""}[lay]===""?"":"rise"),dur=sb.e-sb.s,vw=SWd(),vh=SHd();
 tK=Math.max(.05,Math.min(1,dur*900/((((+CONFIG.enter||0)/(+CONFIG.speed||1))+(+CONFIG.exit||0))*1000||1)));
 const ks=sbKs(sb),big=Math.min(sbBigR(sb)*vh,vw*.3)*ks,small=Math.min(vh*.045,vw*.03)*ks;
 const acc="var(--a)",fw=document.createElement("div");fw.className="w";w.appendChild(fw);const PS=FULLBLEED.has(lay)?null:resolvePos(sb);let host=fw;if(PS){host=document.createElement("div");host.className="w";fw.appendChild(host)}
 const content=document.createElement("div");content.className="w";host.appendChild(content);
 let list=null;
 if(lay==="split"){
  const [l,r]=[sb.br[0]||sb.plain.slice(0,1),sb.br[1]||""];
  const mk=(t,side)=>{const fs=Math.min(big,vw*.44/Math.max(1,[...t].length));const e=txtEl(`${side}:2cqw;top:50%;font-size:${fs}px;line-height:1;margin-top:${-fs/2}px;letter-spacing:0`);e.textContent=t;if(sb.br.length)e.style.color="var(--a)";content.appendChild(e);
   A(e,[{opacity:0,transform:`translateX(${side==="left"?-40:40}px)`},{opacity:1,transform:"none"}],{duration:D(),delay:(side==="left"?0:150)/CONFIG.speed});e.dataset.big=1;return e};
  if(l)mk(l,"left");if(r)mk(r,"right");
  const sm=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${small}px;letter-spacing:.8em;padding-left:.8em`);
  sm.textContent=sb.plain;content.appendChild(sm);
  A(sm,[{opacity:0,letterSpacing:".2em"},{opacity:1,letterSpacing:".8em"}],{duration:D()*1.3});
  [["left",r?"22cqw":"22cqw"],["right","22cqw"]].forEach(([side,off],i)=>{
   if((side==="right"&&!r)||vw<vh)return; /* 直式畫面太窄，省略細線避免壓到小字 */const ln=document.createElement("div");ln.className="ln";
   ln.style.cssText=`position:absolute;top:50%;${side}:${off};width:10cqw;transform-origin:${side==="left"?"right":"left"}`;
   // 細線由中間向外拉出
   ln.style.transformOrigin=side==="left"?"right":"left";content.appendChild(ln);A(ln,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:D(),delay:200/CONFIG.speed});});
 }else if(lay==="lowerleft"){
  const e=txtEl(`left:6cqw;bottom:12cqh;font-size:${small*1.4}px;white-space:pre-wrap`);e.textContent="。";
  list=chars(sb.plain,e);content.appendChild(e);
  const ln=document.createElement("div");ln.className="ln";ln.style.cssText="position:absolute;left:6cqw;bottom:10cqh;width:60cqw;transform-origin:left";
  content.appendChild(ln);A(ln,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:D()*2});
  enter(e,en||"rise",list);
 }else if(NL[lay]){NL[lay](sb,content,w,big,small,dur,list=[])
 }else{
  const sz=lay==="slam"?big*.9:big*.55;
  const e=txtEl(`left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:${Math.min(sz,vw/(Math.max(sb.plain.length,3))*.9)}px;letter-spacing:.15em`);
  content.appendChild(e);
  if(lay==="bounce"){list=chars(sb.plain,e);list.forEach((c,i)=>A(c,[{opacity:0,transform:"translateY(12cqh)"},{opacity:1,transform:"translateY(-2cqh)",offset:.6},{opacity:1,transform:"none"}],{duration:500/CONFIG.speed,delay:i*60/CONFIG.speed}))}
  else if(lay==="slam"){e.textContent=sb.plain;A(e,[{opacity:0,transform:"translateY(-50%) scale(3)"},{opacity:1,transform:"translateY(-50%) scale(1)"}],{duration:260/CONFIG.speed,easing:"cubic-bezier(.9,0,1,.5)"});
   A(w,[{transform:"translate(0,0)"},{transform:"translate(-14px,8px)"},{transform:"translate(12px,-9px)"},{transform:"translate(-6px,4px)"},{transform:"none"}],{duration:300,delay:260/CONFIG.speed});
   const f=document.createElement("div");f.style.cssText="position:fixed;inset:0;background:#fff;pointer-events:none";w.appendChild(f);A(f,[{opacity:0},{opacity:.7,offset:.1},{opacity:0}],{duration:250,delay:260/CONFIG.speed})}
  else if(lay==="neon"){e.textContent=sb.plain;e.style.textShadow=`0 0 6px #fff,0 0 18px ${acc},0 0 40px ${acc},0 0 80px ${acc}`;enter(e,sb.en||"fade")}
  else if(lay==="karaoke"){list=chars(sb.plain,e,"color:rgba(255,255,255,.3)");const n=list.length,t=dur*1000/n;
   list.forEach((c,i)=>A(c,[{color:"rgba(255,255,255,.3)"},{color:"#fff",textShadow:`0 0 14px ${acc}`}],{duration:t,delay:i*t,easing:"linear"}));enter(e,sb.en||"fade")}
 }
 if(["slam","bounce","karaoke"].indexOf(lay)<0&&lay!=="lowerleft"&&lay!=="split"&&!sb.en)enter(content,"fade");
 else if(lay==="split"||lay==="neon"){}
 if(lay==="split"&&sb.en&&sb.en!=="rise")enter(content,sb.en);
 // 退場：必須在該句結束前完成
 const xd=CONFIG.exit*1000*tK,ds=dur*1000-xd;
 const EX={...EXTRA_EX,sink:[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(4cqh)"}],"zoomout-fade":[{opacity:1,transform:"none"},{opacity:0,transform:"scale(1.3)"}],"blur-out":[{opacity:1,filter:"blur(0)"},{opacity:0,filter:"blur(16px)"}],"slide-out":[{opacity:1,transform:"none"},{opacity:0,transform:"translateX(-20cqw)"}]};
 const EC=EXIT_C[sb.ex],hasCh=!!(EC&&w.querySelector(".ch"));   /* 逐字退場（EXIT_C，src/23-motion-k.js）：有 .ch 才逐字，整句容器先撐住再淡掉；沒有就用 EX 裡的整句版 */
 A(w,hasCh?HOLD:(EX[sb.ex]||[{opacity:1},{opacity:0}]),{duration:xd,delay:ds,easing:"ease-in"});
 if(hasCh){const RR=sr(sb.s),L=[...w.querySelectorAll(".ch")];L.forEach((c,i)=>{const o=EC(c,i,L.length,RR);A(c,o.kf,{duration:xd*(o.dur||.6),delay:ds+(o.at||0)*xd,easing:o.ease||"ease-in"})})}
 if(sb.ex==="track-out")tel(w).forEach(e=>A(e,[{opacity:1},{opacity:0,letterSpacing:".8em"}],{duration:xd,delay:ds,easing:"ease-in"}));
 if(sb.ex==="dissolve"||sb.ex==="shatter"){const RR=sr(sb.s);[...w.querySelectorAll(".ch")].forEach(c=>{const r=()=>RR()-.5,sh=sb.ex==="shatter";
  A(c,sh?[{opacity:1,transform:"none"},{opacity:0,transform:`translate(${r()*60}cqw,${r()*50}cqh) rotate(${r()*540}deg) scale(.3)`}]:[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-3cqh) scale(1.4)"}],{duration:xd*.6,delay:ds+RR()*xd*.4,easing:"ease-in"})})}
 // 持續特效（單句最多 3 個）
 let fl=(sb.fx||"").split(",").filter(Boolean);if(fl.length>3){note("單句最多同時 3 個特效，已忽略多餘的");fl=fl.slice(0,3)}
 const FK={...EXTRA_FK,float:[[{transform:"translateY(0)"},{transform:"translateY(-1.5cqh)"},{transform:"translateY(0)"}],4000,"ease-in-out"],
  shake:[[{transform:"translate(0,0)"},{transform:"translate(2px,-2px)"},{transform:"translate(-2px,1px)"},{transform:"translate(1px,2px)"}],160,"steps(3)"],
  flicker:[[{opacity:1},{opacity:.4},{opacity:1},{opacity:.85},{opacity:.2},{opacity:1}],1300,"steps(5)"],
  rainbow:[[{filter:"hue-rotate(0)"},{filter:"hue-rotate(360deg)"}],6000,"linear"]};
 fl.forEach(f=>{if(FXH[f])return FXH[f](fw,dur);const k=FK[f];if(k)A(fw,k[0],{duration:k[1],iterations:Infinity,easing:k[2],...(f==="float"||f==="shake"?{composite:"add"}:{})})});
 applyHL(content,sb,lay);applyKwFont(content,sb,lay);
 applyStyles(content,sb,dur);
 if(!(PS&&placePos(PS,sb,host,fw,content,small)))addSub(sb,content,small,lay==="lowerleft");
}
