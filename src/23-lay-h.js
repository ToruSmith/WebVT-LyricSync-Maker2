/* ===== [LAY-H] 版型 H（pv 風格文字型，自行實作）：scatter strip cards glow-cards layered falling formula。皆為時間純函數（A() 暫停動畫＋種子亂數 sr()）；顏色取 --c／--a。
   裝飾元素（非主文）標 data-nm（不參與位置量測）；{} 不是這些版型的關鍵字（沿用通用強調 applyHL）。 ===== */
const _fz=(sb,big,k)=>Math.min(fit(sb,big)*k,SWd()*.84/(Math.max(sb.plain.length,3)*1.15));   /* 單行字寬上限：含字距 .1em，直式畫面也放得進 */
const _chs=sb=>[...sb.plain].filter(x=>!/\s/.test(x));
registerLayout("scatter",(sb,c,w,big,sm,dur,list)=>{   /* 散落字：每字在格內隨機偏移、旋轉、縮放，由四方飛入 */
 const r=sr(sb.s),vw=SWd(),vh=SHd(),ch=_chs(sb),n=Math.max(1,ch.length),cols=Math.max(1,Math.min(n,Math.round(Math.sqrt(n*vw/vh*.8)))),rows=Math.ceil(n/cols),cw=vw*.78/cols,chh=vh*.62/rows,z=Math.min(cw,chh,big*.6)*.95;
 ch.forEach((x,i)=>{const k=.75+r()*.6,fs=z*k,cx=vw*.11+(i%cols+.5)*cw+(r()-.5)*cw*.3,cy=vh*.19+(Math.floor(i/cols)+.5)*chh+(r()-.5)*chh*.3,rot=(r()-.5)*40,
   e=txtEl(`left:${cx-fs/2}px;top:${cy-fs/2}px;width:${fs}px;line-height:${fs}px;text-align:center;font-size:${fs}px;letter-spacing:0;rotate:${rot}deg`);
  e.textContent=x;if(r()<.25)e.style.color="var(--a)";c.appendChild(e);list.push(e);
  A(e,[{opacity:0,translate:`${(r()-.5)*40}cqw ${(r()-.5)*40}cqh`,scale:2.2},{opacity:1,translate:"0 0",scale:1}],{duration:D(),delay:Math.min(i*70,dur*300)/CONFIG.speed})})});
registerLayout("strip",(sb,c,w,big,sm,dur,list)=>{   /* 字條：強調色長條上的反白字，左右交錯滑入 */
 const t=[...sb.plain],n=Math.min(3,Math.max(1,Math.ceil(t.length/6))),k=Math.ceil(t.length/n),vw=SWd(),vh=SHd(),z=Math.min(big*.42,vw*.8/Math.max(k,2)/1.1,vh*.8/n/1.7);
 const col=document.createElement("div");col.style.cssText=`position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:${z*.25}px;rotate:-3deg`;c.appendChild(col);
 for(let i=0;i<n;i++){const e=txtEl(`position:relative;align-self:${i%2?"flex-end":"flex-start"};margin:0 8cqw;padding:.08em .35em;background:var(--a);color:color-mix(in srgb,var(--a) 10%,#000);font-size:${z}px;line-height:1.15;letter-spacing:.1em;white-space:pre`);
  list.push(...chars(t.slice(i*k,i*k+k).join(""),e));col.appendChild(e);A(e,[{opacity:0,translate:`${i%2?60:-60}cqw 0`},{opacity:1,translate:"0 0"}],{duration:D(),delay:i*150/CONFIG.speed})}});
function cardsBuild(sb,c,big,list,glow){
 const r=sr(sb.s),vw=SWd(),vh=SHd(),T=_chs(sb),g=T.length>8?2:1,parts=[];for(let i=0;i<T.length;i+=g)parts.push(T.slice(i,i+g).join(""));
 const m=Math.max(1,parts.length),rows=Math.ceil(m/7),per=Math.ceil(m/rows),z=Math.min(big*.5,vw*.9/(per*(g+.75)),vh*.7/rows/1.5);
 const row=document.createElement("div");row.style.cssText=`position:absolute;inset:0;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:${z*.3}px ${z*.2}px`;c.appendChild(row);
 parts.forEach((p,i)=>{const e=txtEl(`position:relative;top:${((r()-.5)*.15).toFixed(3)}em;padding:.18em .25em;font-size:${z}px;line-height:1.1;letter-spacing:0;rotate:${(r()-.5)*10}deg;`+(glow?"background:rgba(8,12,24,.55);color:var(--c);border:.04em solid var(--a);border-radius:.12em;box-shadow:0 0 .4em var(--a),inset 0 0 .3em color-mix(in srgb,var(--a) 40%,transparent);text-shadow:0 0 .3em var(--a)":"background:var(--c);color:#0b0d14;border-radius:.08em;box-shadow:.05em .08em 0 var(--a)"));
  e.textContent=p;row.appendChild(e);list.push(e);A(e,[{opacity:0,transform:"translateY(-30cqh) scale(.7)"},{opacity:1,transform:"none"}],{duration:D(),delay:i*90/CONFIG.speed})})}
registerLayout("cards",(sb,c,w,big,sm,dur,list)=>cardsBuild(sb,c,big,list,false));   /* 字卡：每字（>8 字時每 2 字）一張白卡，落下排成列 */
registerLayout("glow-cards",(sb,c,w,big,sm,dur,list)=>cardsBuild(sb,c,big,list,true));   /* 發光字卡：暗底＋強調色發光邊框 */
registerLayout("layered",(sb,c,w,big,sm,dur,list)=>{   /* 疊層字：主文後方三層強調色描邊殘影，向右下展開 */
 const z=_fz(sb,big,1.1);
 for(let i=3;i>=1;i--){const e=CE(c,`font-size:${z}px;letter-spacing:.1em;color:transparent;-webkit-text-stroke:max(1px,.03em) var(--a)`);e.textContent=sb.plain;e.dataset.nm=1;
  A(e,[{opacity:0,translate:"0 0"},{opacity:.7-i*.15,translate:`${i*1.1}cqh ${i*1.1}cqh`}],{duration:D()*1.2,delay:80*i/CONFIG.speed})}
 const e=CE(c,`font-size:${z}px;letter-spacing:.1em`);list.push(...chars(sb.plain,e));if(sb.en)enter(e,sb.en,list)});
registerLayout("falling",(sb,c,w,big,sm,dur,list)=>{   /* 字雨：背景持續落下的淡字＋主文逐字落下彈跳 */
 const r=sr(sb.s),vw=SWd(),z=Math.min(big*.6,vw/Math.max(sb.plain.length,3)*.85),pool=_chs(sb);
 for(let i=0;i<14;i++){const e=txtEl(`left:${((i+.5)/14*100).toFixed(2)}cqw;top:-10cqh;font-size:${z*.35*(.7+r()*.6)}px;opacity:.25;letter-spacing:0;color:var(--a)`);delete e.dataset.t;e.dataset.nm=1;e.textContent=pool[r()*pool.length|0]||"・";c.appendChild(e);
  A(e,[{translate:"0 0"},{translate:"0 130cqh"}],{duration:(2600+r()*2600)/CONFIG.speed,delay:-r()*4000,iterations:Infinity,easing:"linear"})}
 const e=CE(c,`font-size:${z}px;letter-spacing:.1em;padding-left:.1em`),ch=chars(sb.plain,e);list.push(...ch);
 ch.forEach((x,i)=>A(x,[{opacity:0,transform:"translateY(-90cqh)",easing:"cubic-bezier(.55,0,1,.45)"},{opacity:1,transform:"translateY(-80cqh)",offset:.03},{opacity:1,transform:"none",offset:.6,easing:"cubic-bezier(0,.55,.45,1)"},{transform:"translateY(-5cqh)",offset:.78,easing:"cubic-bezier(.55,0,1,.45)"},{transform:"none",offset:.9},{transform:"none"}],{duration:D()*1.6,delay:i*110/CONFIG.speed,easing:"linear"}))});
registerLayout("formula",(sb,c,w,big,sm,dur,list)=>{   /* 公式覆蓋：主文後方漂浮的等寬公式碎片（種子產生） */
 const r=sr(sb.s),vh=SHd(),z=_fz(sb,big,1),SY=["∑","∫","∂","∇","π","λ","Δ","√","∞","θ"],OP=["=","+","−","×","÷","≈","→"],VR=["x","y","t","f(x)","n","e","φ","dx","a²","b²"],pk=a=>a[r()*a.length|0];
 for(let i=0;i<9;i++){const tk=[];for(let k=0,n=4+(r()*4|0);k<n;k++)tk.push(k%2?pk(OP):(r()<.4?pk(SY):pk(VR)));
  const e=txtEl(`left:${(i%3)*33+2}cqw;top:${8+Math.floor(i/3)*30+r()*8}cqh;font-size:${Math.max(10,vh*.03)*(.8+r()*.8)}px;white-space:nowrap;letter-spacing:.08em;color:var(--a);font-family:ui-monospace,Consolas,monospace`);
  delete e.dataset.t;e.dataset.nm=1;e.textContent=tk.join(" ");c.appendChild(e);
  A(e,[{opacity:0},{opacity:.35}],{duration:D(),delay:i*120/CONFIG.speed});A(e,[{translate:"-2cqw 0"},{translate:"2cqw 0"}],{duration:6000,delay:-r()*6000,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})}
 const e=CE(c,`font-size:${z}px;letter-spacing:.1em`);list.push(...chars(sb.plain,e));if(sb.en)enter(e,sb.en,list)});
