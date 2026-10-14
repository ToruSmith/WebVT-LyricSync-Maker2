/* ===== [LAY-K] 版型 K（JIZURA 移植・第二批，「實驗室」）：headline-lead footnote quote tilt-vertical v-ruler list-table ruby big-sandwich cross。
   部分部品改寫自 JIZURA（原作者 hakoniwa；備份於 ToruSmith/JIZURA；MIT，授權全文見根目錄 LICENSE）。只讀設計與數值，用 DOM＋細線重寫，沒有搬 Canvas 程式碼。
   對應：headline-lead＝見出しとリード／footnote＝脚注／quote＝引用／tilt-vertical＝縦倒し／v-ruler＝縦目盛り／list-table＝一覧表／ruby＝ルビ振り／big-sandwich＝大字挟み（tyKeySplit）／cross＝十字組（tyCross）。
   皆為時間純函數；只有文字加細線，不畫底板；非主文的線與點標 data-nm。字級都經 capSize 限制。headline-lead／big-sandwich／cross 吃 {}（BRACE_LAYOUTS）；ruby／footnote 自己畫副文（||，SUB_OWN）。
   共用小工具 _j*、hair、tick、capSize 在 23-lay-j.js。 ===== */
["headline-lead","footnote","quote","tilt-vertical","v-ruler","list-table","ruby","big-sandwich","cross"].forEach(n=>LAB_LAYOUTS.add(n));
SUB_OWN.add("ruby");SUB_OWN.add("footnote");
const _kIn=(e,list,sb,d0,dy=1.2)=>{if(sb.en){const n0=anims.length;enter(e,sb.en,list);_jLate(n0,d0)}else A(e,[{opacity:0,transform:`translateY(${dy}cqh)`},{opacity:1,transform:"none"}],{duration:D(),delay:d0})};
const _kCjk=s=>/[^\x00-\x7f]/.test(s);
/* 取「關鍵字」：{} 內第一段；沒有就取最長的字詞（有空白時）或正中間的字。回傳 [起,止) */
function _kKey(arr,hl){
 let a=hl.indexOf(true);if(a>=0){let b=a;while(b<arr.length&&hl[b])b++;return[a,b]}
 const s=arr.join("");if(/\s/.test(s.trim())){let best=[0,0],i=0;s.split(/(\s+)/).forEach(w=>{if(w.trim()&&w.length>best[1]-best[0])best=[i,i+w.length];i+=w.length});return best}
 const m=Math.floor(arr.length/2);return[m,m+1]}

registerLayout("headline-lead",(sb,c,w,big,sm,dur,list)=>{   /* 見出しとリード：左下一組「大標題＋短強調線＋小導語」。標題＝{} 內的字；沒有 {} 就取前半句；導語＝其餘 */
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...(_jFull(sb))],hl=arr.map((_,j)=>!!(sb.hl&&sb.hl[j]));
 let[a,b]=_kKey(arr,hl);if(a===b||!hl.some(Boolean)){const nl=arr.indexOf("\n");a=0;b=nl>0?nl:Math.max(1,Math.ceil(arr.length/2))}
 const head=arr.slice(a,b).join("").replace(/\n/g," ").trim(),lead=arr.slice(0,a).concat(arr.slice(b)).join("").replace(/\n/g," ").trim();
 const n=Math.max(1,_jN(head)),z=capSize(Math.min(big*.75,vw*(port?.8:.62)/(n*1.1)),.2),zl=Math.max(12,Math.min(z*.38,vh*.05));
 const box=document.createElement("div");box.style.cssText=`position:absolute;left:8cqw;right:8cqw;bottom:14cqh;display:flex;flex-direction:column;align-items:flex-start;gap:${_jpx(zl*.5)}`;c.appendChild(box);
 const e=txtEl(`position:relative;font-size:${_jpx(z)};line-height:1.15;letter-spacing:.04em;white-space:pre-wrap;max-width:84cqw`);e.textContent="";box.appendChild(e);list.push(...chars(head,e));
 hair(box,`position:relative;width:${port?18:12}cqw;height:max(2px,.06em);background:var(--a);transform-origin:left;font-size:${_jpx(z)}`,_jT(200),"X",_jT(300));
 if(lead){const l=txtEl(`position:relative;font-size:${_jpx(zl)};line-height:1.5;letter-spacing:.08em;opacity:.85;max-width:70cqw;white-space:pre-wrap`);l.textContent=lead;box.appendChild(l);A(l,[{opacity:0,transform:"translateY(1cqh)"},{opacity:.85,transform:"none"}],{duration:D(),delay:_jT(350)})}
 _kIn(e,list,sb,0)},{brace:1});

registerLayout("footnote",(sb,c,w,big,sm,dur,list)=>{   /* 脚注：正文在下三分之一，句尾加 ※；最下方細線＋小字註腳（註腳＝副文 ||；沒有副文時，若正文分多行就拿最後一行當註腳） */
 const vw=SWd(),vh=SHd(),port=vw<vh;let segs=sb.plain.split("\n").map(s=>s.trim()).filter(Boolean),note=(sb.sub||"").trim();
 if(!note&&segs.length>1)note=segs.pop();
 const main=segs.join(" "),n=Math.max(1,_jN(main)),f=_jFit(n,vw*.8,Math.min(vh*.07,big*.55),port?4:2,1.12),z=capSize(f.z),lines=_jBrk([...main],f.per);
 const e=txtEl(`left:10cqw;right:10cqw;bottom:${note?24:16}cqh;text-align:center;font-size:${_jpx(z)};line-height:1.4;letter-spacing:.06em;white-space:pre`);c.appendChild(e);
 lines.forEach(([a,b],i)=>{const d=document.createElement("div");e.appendChild(d);list.push(...chars([...main].slice(a,b).join(""),d));
  if(note&&i===lines.length-1){const m=document.createElement("span");m.className="ch";m.dataset.nm=1;m.textContent="※";m.style.cssText="font-size:.55em;vertical-align:.55em;color:var(--a);margin-left:.15em";d.appendChild(m)}});
 _kIn(e,list,sb,0);
 if(note){hair(c,"left:10cqw;right:10cqw;bottom:13cqh;opacity:.5;transform-origin:left",_jT(250),"X",_jT(350));
  const nz=Math.max(11,Math.min(z*.5,vh*.035)),t=txtEl(`left:10cqw;right:10cqw;bottom:6.5cqh;text-align:center;font-size:${_jpx(nz)};letter-spacing:.08em;opacity:.8;white-space:pre-wrap;line-height:1.4`);t.textContent="※ "+note;delete t.dataset.t;c.appendChild(t);
  A(t,[{opacity:0},{opacity:.8}],{duration:D(),delay:_jT(400)})}});

registerLayout("quote",(sb,c,w,big,sm,dur,list)=>{   /* 引用：文字置中，左上與右下各一個大引號（強調色、半透明；字級最大約文字的 2.2 倍，不遮影片） */
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain],n=Math.max(1,_jN(sb.plain)),f=_jFit(n,vw*(port?.72:.66),Math.min(vh*.075,big*.55),port?6:3,1.12),z=capSize(f.z),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const cj=_kCjk(sb.plain),qo=cj?"「":"“",qc=cj?"」":"”",qz=Math.min(z*2.2,vh*.16);
 const box=document.createElement("div");box.style.cssText="position:absolute;left:50%;top:50%;translate:-50% -50%;width:max-content;max-width:80cqw";c.appendChild(box);
 const e=txtEl(`position:relative;text-align:center;font-size:${_jpx(z)};line-height:1.4;letter-spacing:.06em;white-space:pre`);box.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});
 [[qo,`left:${_jpx(-qz*.7)};top:${_jpx(-qz*.55)}`],[qc,`right:${_jpx(-qz*.7)};bottom:${_jpx(-qz*.95)}`]].forEach(([q,pos],i)=>{const m=txtEl(`${pos};font-size:${_jpx(qz)};line-height:1;color:var(--a);-webkit-text-fill-color:var(--a);opacity:.6`);m.textContent=q;m.dataset.nm=1;delete m.dataset.t;box.appendChild(m);
  A(m,[{opacity:0,transform:"scale(.6)"},{opacity:.6,transform:"none"}],{duration:D()*.8,delay:_jT(i*180)})});
 _kIn(e,list,sb,_jT(200))});

registerLayout("tilt-vertical",(sb,c,w,big,sm,dur,list)=>{   /* 縦倒し：文字轉 90 度橫躺，沿畫面右緣由上往下讀，旁邊一條細線；字小、佔寬很窄 */
 const vw=SWd(),vh=SHd(),arr=[...sb.plain],n=Math.max(1,_jN(sb.plain)),M=Math.min(vw,vh);
 const cols=n>26?2:1,per=Math.ceil(n/cols),z=capSize(Math.min(M*.075,vh*.72/(per*1.1),big*.5),.1),lines=_jBrk(arr,per);if(!lines.length)return;
 const e=txtEl(`right:9cqw;top:50%;translate:0 -50%;font-size:${_jpx(z)};line-height:1.5;letter-spacing:.14em;writing-mode:vertical-rl;text-orientation:sideways;white-space:pre`);c.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");d.style.whiteSpace="pre";e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});
 hair(c,`right:${_jpx(vw*.09+z*(lines.length*1.5+.5))};top:22cqh;width:1px;height:56cqh;transform-origin:top;opacity:.6`,0,"Y",_jT(400));
 _kIn(e,list,sb,_jT(150),0)});

registerLayout("v-ruler",(sb,c,w,big,sm,dur,list)=>{   /* 縦目盛り：左緣一條垂直刻度尺（每 5 格一長刻度），一個強調色小標記停在文字的高度；文字在尺右側，左對齊 */
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain],n=Math.max(1,_jN(sb.plain)),f=_jFit(n,vw*(port?.7:.6),Math.min(vh*.07,big*.5),port?5:3,1.12),z=capSize(f.z),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const N=25;for(let i=0;i<N;i++){const lg=i%5===0;hair(c,`left:7cqw;width:${lg?2.6:1.4}cqw;top:calc(14cqh + ${(i*(72/(N-1))).toFixed(2)}cqh);transform-origin:left;opacity:${lg?.8:.45}`,_jT(i*14),"X",_jT(200))}
 tick(c,"left:6.4cqw;top:50%;margin-top:-.25em;font-size:12px;width:.9em;height:.9em;border-radius:50%",_jT(300));
 const e=txtEl(`left:${port?14:13}cqw;top:50%;translate:0 -50%;font-size:${_jpx(z)};line-height:1.4;letter-spacing:.08em;white-space:pre;text-align:left`);c.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});
 _kIn(e,list,sb,_jT(250),0)});

registerLayout("list-table",(sb,c,w,big,sm,dur,list)=>{   /* 一覧表：像目錄或表格，每行一條細分隔線；用換行分行，行內用 ｜ 分成「項目｜內容」兩欄；單行長句自動拆成 2～4 行 */
 const vw=SWd(),vh=SHd(),port=vw<vh;let rows=sb.plain.split("\n").map(s=>s.trim()).filter(Boolean);
 if(rows.length<2){const arr=[...rows[0]||""],n=Math.max(1,_jN(sb.plain));rows=_jBrk(arr,Math.max(4,Math.ceil(n/Math.min(4,Math.max(2,Math.ceil(n/8)))))).map(([a,b])=>arr.slice(a,b).join(""))}
 rows=rows.slice(0,6);const cells=rows.map(r=>r.split(/[｜|\t]/).map(s=>s.trim()));
 const mx=Math.max(...cells.map(x=>_jN(x.join(""))),1),z=capSize(Math.min(vh*.075,vw*(port?.78:.6)/(mx*1.12+1),big*.5),.1);
 const box=document.createElement("div");box.style.cssText=`position:absolute;left:${port?8:14}cqw;right:${port?8:14}cqw;bottom:12cqh;display:flex;flex-direction:column`;c.appendChild(box);
 cells.forEach((cs,i)=>{const row=document.createElement("div");row.style.cssText=`position:relative;display:flex;justify-content:space-between;align-items:baseline;gap:1em;padding:${_jpx(z*.3)} 0;font-size:${_jpx(z)}`;box.appendChild(row);
  cs.forEach((t,j)=>{const e=txtEl(`position:relative;line-height:1.3;letter-spacing:.06em;white-space:pre-wrap;${cs.length>1&&j===0?"font-size:.62em;opacity:.75;":""}`);e.textContent="";row.appendChild(e);const l=chars(t,e);list.push(...l);
   const n0=anims.length;if(sb.en)enter(e,sb.en,l);else A(e,[{opacity:0,transform:"translateX(-1.5cqw)"},{opacity:1,transform:"none"}],{duration:D()});_jLate(n0,_jT(i*120+150))});
  hair(row,"left:0;right:0;bottom:0;opacity:.5;transform-origin:left",_jT(i*120),"X",_jT(300))})});

registerLayout("ruby",(sb,c,w,big,sm,dur,list)=>{   /* ルビ振り：每個字上方一行小注音。注音取自副文（||），平均分給每個字；沒有副文就在每個字上方放一個強調色小圓點（傍点） */
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain],n=Math.max(1,_jN(sb.plain)),f=_jFit(n,vw*.8,Math.min(vh*.085,big*.6),port?4:2,1.2),z=capSize(f.z),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const rb=[...(sb.sub||"").replace(/\s+/g,"")],m=rb.length,vis=arr.map((ch,i)=>!/\s/.test(ch)),idx=[];vis.forEach((v,i)=>{if(v)idx.push(i)});
 const rt=i=>{const k=idx.indexOf(i);if(k<0)return"";if(!m)return"●";const a=Math.floor(k*m/idx.length),b=Math.floor((k+1)*m/idx.length);return rb.slice(a,Math.max(b,a)).join("")};
 const e=txtEl(`left:8cqw;right:8cqw;bottom:14cqh;text-align:center;font-size:${_jpx(z)};line-height:1.9;letter-spacing:.06em;white-space:pre`);c.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");e.appendChild(d);
  for(let i=a;i<b;i++){if(!vis[i]){chars(arr[i],d);continue}const r=document.createElement("ruby");d.appendChild(r);list.push(chars(arr[i],r)[0]);
   const t=document.createElement("rt");t.dataset.nm=1;t.textContent=rt(i);t.style.cssText=`font-size:.38em;color:var(--a);-webkit-text-fill-color:var(--a);letter-spacing:.02em;font-weight:400;opacity:.9${m?"":";font-size:.22em;line-height:1"}`;r.appendChild(t);A(t,[{opacity:0},{opacity:.9}],{duration:D()*.8,delay:_jT(300)})}});
 _kIn(e,list,sb,0)});

registerLayout("big-sandwich",(sb,c,w,big,sm,dur,list)=>{   /* 大字挟み（JIZURA tyKeySplit）：關鍵字放大置中，前後文字縮小夾在兩側（直式畫面改為上下夾）；關鍵字＝{} 內第一段，沒有就取最長字詞或正中間的字；大字上限約畫面高度 26% */
 const vw=SWd(),vh=SHd(),port=vw<vh,full=_jFull(sb),arr=[...full],hl=arr.map((_,j)=>!!(sb.hl&&sb.hl[j])),[a,b]=_kKey(arr,hl),T=(x,y)=>arr.slice(x,y).join("").replace(/\n/g," ").trim();
 const key=T(a,b),pre=T(0,a),post=T(b,arr.length),kn=Math.max(1,_jN(key)),zk=capSize(Math.min(big*.9,vw*(port?.8:.42)/(kn*1.1)),.26),zs=Math.max(12,Math.min(zk*.3,vh*.06));
 const row=document.createElement("div");row.style.cssText=`position:absolute;left:6cqw;right:6cqw;top:50%;translate:0 -50%;display:flex;flex-direction:${port?"column":"row"};align-items:center;justify-content:center;gap:${_jpx(zs*.8)}`;c.appendChild(row);
 const side=(t,al)=>{if(!t)return;const e=txtEl(`position:relative;font-size:${_jpx(zs)};line-height:1.4;letter-spacing:.08em;opacity:.85;max-width:${port?80:26}cqw;white-space:pre-wrap;text-align:${port?"center":al}`);e.textContent=t;row.appendChild(e);return e};
 const pe=side(pre,"right"),e=txtEl(`position:relative;font-size:${_jpx(zk)};line-height:1.1;letter-spacing:.02em;white-space:pre;color:var(--a);-webkit-text-fill-color:var(--a)`);e.textContent="";row.appendChild(e);list.push(...chars(key,e));
 const po=side(post,"left");[pe,po].forEach((x,i)=>{if(x)A(x,[{opacity:0,transform:`translate${port?"Y":"X"}(${(i?1:-1)*2}cqw)`},{opacity:.85,transform:"none"}],{duration:D(),delay:_jT(250)})});
 _kIn(e,list,sb,0,0)},{brace:1});

registerLayout("cross",(sb,c,w,big,sm,dur,list)=>{   /* 十字組（JIZURA tyCross）：關鍵字在中央，前文在它左邊橫排＋上方直排、後文在右邊橫排＋下方直排（直排是淡淡的回聲，只取最近 6 字）；字都小，不遮影片 */
 const vw=SWd(),vh=SHd(),port=vw<vh,full=_jFull(sb),arr=[...full],hl=arr.map((_,j)=>!!(sb.hl&&sb.hl[j])),[a,b]=_kKey(arr,hl),T=(x,y)=>arr.slice(x,y).join("").replace(/\n/g," ").trim();
 const key=T(a,b),pre=T(0,a),post=T(b,arr.length),kn=Math.max(1,_jN(key)),zk=capSize(Math.min(big*.7,vw*(port?.6:.3)/(kn*1.1)),.2),zs=Math.max(11,Math.min(zk*.28,vh*.045));
 const g=document.createElement("div");g.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;display:grid;grid-template-columns:auto auto auto;grid-template-rows:auto auto auto;align-items:center;justify-items:center;gap:${_jpx(zs*.6)}`;c.appendChild(g);
 const cell=(t,r,col,css,fx)=>{if(!t)return;const e=txtEl(`position:relative;grid-row:${r};grid-column:${col};font-size:${_jpx(zs)};letter-spacing:.1em;line-height:1.3;${css}`);e.textContent=t;g.appendChild(e);A(e,[{opacity:0},{opacity:fx}],{duration:D(),delay:_jT(250)})};
 const hp=port?pre.slice(-5):pre.slice(-12),hq=port?post.slice(0,5):post.slice(0,12),vp=[...pre].slice(-6).join(""),vq=[...post].slice(0,6).join("");
 cell(vp,1,2,"writing-mode:vertical-rl;white-space:pre;align-self:end",.5);cell(hp,2,1,"justify-self:end;white-space:pre-wrap;text-align:right;max-width:26cqw",.85);
 const e=txtEl(`position:relative;grid-row:2;grid-column:2;font-size:${_jpx(zk)};line-height:1.1;white-space:pre;color:var(--a);-webkit-text-fill-color:var(--a)`);e.textContent="";g.appendChild(e);list.push(...chars(key,e));
 cell(hq,2,3,"justify-self:start;white-space:pre-wrap;text-align:left;max-width:26cqw",.85);cell(vq,3,2,"writing-mode:vertical-rl;white-space:pre;align-self:start",.5);
 _kIn(e,list,sb,0,0)},{brace:1});
