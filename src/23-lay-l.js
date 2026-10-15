/* ===== [LAY-L] 版型 L（JIZURA 移植・第四批，「實驗室」）：frame-box corners drop-cap split-cut erode-repeat justify-stack。
   部分部品改寫自 JIZURA（原作者 hakoniwa；備份於 ToruSmith/JIZURA）。JIZURA is Copyright (c) 2026 hakoniwa, released under the MIT License（授權全文見本倉庫根目錄 LICENSE 的「Third-party notices」）。
   只讀其設計與數值後用 DOM＋細線重寫，沒有搬 Canvas 程式碼。
   對應：frame-box＝frameBox（額縁）／corners＝corners（対角配置）／drop-cap＝dropCap（大きな頭文字）／split-cut＝tySplitType（断ち割り）／erode-repeat＝tyErode（削り反復）／justify-stack＝tyJustify（幅揃え）。
   皆為時間純函數（A() 暫停動畫；不用 Math.random、不累積狀態；變化一律由句子編號 _jIdx 輪替）；只用文字加細線，不畫底板、不加不透明底色；
   非主文的線與點標 data-nm；不做 JIZURA 自帶的羅馬字、No. 編號、時間碼。不吃 {}。 ===== */
["frame-box","corners","drop-cap","split-cut","erode-repeat","justify-stack"].forEach(n=>LAB_LAYOUTS.add(n));
/* 進場：有指定進場就交給 enter()，並整體延後 d0；否則用預設淡入上移 */
function _lEn(sb,el,list,d0,kf){
 if(sb.en){const n0=anims.length;enter(el,sb.en,list);_jLate(n0,d0)}
 else A(el,kf||[{opacity:0,transform:"translateY(1.2cqh)"},{opacity:1,transform:"none"}],{duration:D(),delay:d0})}
/* 文字寬度（em）：用 canvas 量（含字距），量不到退回估計值 */
let _lCtx=null;
function _lW(t,fam,ls){
 try{_lCtx=_lCtx||document.createElement("canvas").getContext("2d");_lCtx.font=`${CONFIG.weight} 100px ${fam}`;
  const w=_lCtx.measureText(t).width/100;if(w>0)return w+[...t].length*ls}catch(e){}
 return _jCw(t)+[...t].length*ls}
const _lFam=()=>FONTS[curFont||CONFIG.font]||curFont||CONFIG.font;

/* ---- frame-box 額縁：字被一個細線框圈住；框式依句子編號輪替 full／double／corners；四邊依序拉出 ---- */
registerLayout("frame-box",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain],n=Math.max(1,_jN(sb.plain)),sty=["full","double","corners"][_jIdx(sb)%3];
 const f=_jFit(n,vw*(port?.7:.6),Math.min(vh*.19,big*.8),port?5:3,1.1),z=capSize(f.z,.19),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const box=document.createElement("div");box.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;padding:${_jpx(z*.7)} ${_jpx(z*.8)};font-size:${_jpx(z)}`;c.appendChild(box);
 const e=txtEl("position:relative;text-align:center;line-height:1.2;letter-spacing:.04em");box.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");d.style.whiteSpace="pre";e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});
 const T=_jT(0),L=D()*.85,lw="max(2px,.04em)";
 const edge=(css,ax,dl,col)=>{const h=hair(box,css,T+dl,ax,L*.5);h.style.background=col||"var(--c)";return h};
 if(sty==="corners"){const arm=_jpx(z*.9);
  [["top:0;left:0","left top","X"],["top:0;left:0","left top","Y"],["top:0;right:0","right top","X"],["top:0;right:0","right top","Y"],
   ["bottom:0;left:0","left bottom","X"],["bottom:0;left:0","left bottom","Y"],["bottom:0;right:0","right bottom","X"],["bottom:0;right:0","right bottom","Y"]].forEach(([p,o,ax],i)=>{
   const h=hair(box,`${p};transform-origin:${o};${ax==="X"?`width:${arm};height:${lw}`:`height:${arm};width:${lw}`}`,T+(i>>1)*_jT(60),ax,L*.5);h.style.background="var(--a)"})}
 else{
  edge(`top:0;left:0;right:0;height:${lw};transform-origin:left`,"X",0);
  edge(`top:0;right:0;bottom:0;width:${lw};height:auto;transform-origin:top`,"Y",_jT(120));
  edge(`bottom:0;left:0;right:0;height:${lw};transform-origin:right`,"X",_jT(240));
  edge(`top:0;left:0;bottom:0;width:${lw};height:auto;transform-origin:bottom`,"Y",_jT(360));
  if(sty==="double"){const g=_jpx(z*.16);
   edge(`top:${g};left:${g};right:${g};height:1px;transform-origin:left;opacity:.55`,"X",_jT(200),"var(--a)");
   edge(`bottom:${g};left:${g};right:${g};height:1px;transform-origin:right;opacity:.55`,"X",_jT(320),"var(--a)");
   edge(`top:${g};bottom:${g};left:${g};width:1px;height:auto;transform-origin:bottom;opacity:.55`,"Y",_jT(440),"var(--a)");
   edge(`top:${g};bottom:${g};right:${g};width:1px;height:auto;transform-origin:top;opacity:.55`,"Y",_jT(280),"var(--a)")}}
 _lEn(sb,e,list,_jT(260))});

/* ---- corners 対角配置：句子切成兩段，前段在一角、後段在對角；底下一條細線拐彎連過去，線尾收在強調色小點 ---- */
registerLayout("corners",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),port=vw<vh,txt=sb.plain.trim(),G=[...txt].filter(x=>!/\s/.test(x));if(G.length<2)return;
 let A0,B0;const sp=txt.split(/[,，、;；\s]+/).filter(Boolean);
 if(sp.length>=2){const k=Math.ceil(sp.length/2),lat=/\s/.test(txt)&&G.filter(ch=>/[\x21-\x7e]/.test(ch)).length>G.length*.6;A0=sp.slice(0,k).join(lat?" ":"");B0=sp.slice(k).join(lat?" ":"")}
 else{const a=[...txt],k=Math.ceil(a.length/2);A0=a.slice(0,k).join("").trim();B0=a.slice(k).join("").trim()}
 if(!A0||!B0)return;
 const anti=_jIdx(sb)%2===1,maxPer=port?5:9,ar=[...A0],br=[...B0],la=_jBrk(ar,maxPer),lb=_jBrk(br,maxPer);if(!la.length||!lb.length)return;
 const bw=vw*(port?.84:.58),mx=Math.max(...la.map(([a,b])=>b-a),...lb.map(([a,b])=>b-a));
 const z=capSize(Math.min(bw/(mx*1.1),vh*(port?.24:.3)/(Math.max(la.length,lb.length)*1.1),big*.7),.22);
 const mk=(arr,ls,right,css)=>{const e=txtEl(`${css};font-size:${_jpx(z)};line-height:1.1;letter-spacing:.02em;text-align:${right?"right":"left"}`);c.appendChild(e);
  ls.forEach(([a,b])=>{const d=document.createElement("div");d.style.whiteSpace="pre";e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});return e};
 const ea=mk(ar,la,anti,`${anti?"right":"left"}:7.5cqw;top:13cqh`),eb=mk(br,lb,!anti,`${anti?"left":"right"}:7.5cqw;bottom:13cqh`);
 const hA=la.length*z*1.1,yLine=`calc(13cqh + ${_jpx(hA+z*.16)})`,xe=anti?"left:7.5cqw":"right:7.5cqw";
 hair(c,`left:7.5cqw;right:7.5cqw;top:${yLine};transform-origin:${anti?"right":"left"};opacity:.6`,_jT(150),"X",D()*.8);
 const v=hair(c,`${anti?"left":"right"}:7.5cqw;top:${yLine};bottom:calc(13cqh + ${_jpx(lb.length*z*1.1+z*.16)});height:auto;width:1px;transform-origin:top;opacity:.6`,_jT(150)+D()*.5,"Y",D()*.5);
 tick(c,`${anti?"left":"right"}:calc(7.5cqw - .25em);bottom:calc(13cqh + ${_jpx(lb.length*z*1.1+z*.16)} - .25em);font-size:${_jpx(z*.5)}`,_jT(150)+D()*.95,D()*.3);
 const d1=_jT(120);_lEn(sb,ea,list.filter(x=>ea.contains(x)),0,[{opacity:0,transform:`translateX(${anti?2:-2}cqw)`},{opacity:1,transform:"none"}]);
 _lEn(sb,eb,list.filter(x=>eb.contains(x)),d1+D()*.3,[{opacity:0,transform:`translateX(${anti?-2:2}cqw)`},{opacity:1,transform:"none"}])});

/* ---- drop-cap 大きな頭文字：第一個字放大成 2～3 行高，其餘字繞在右邊；首字式依句子編號輪替 fill／accent／outline ---- */
registerLayout("drop-cap",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain.trim()],cap=arr[0],rest=arr.slice(1),nR=rest.filter(x=>!/\s/.test(x)).length;if(!cap||nR<2)return;
 const cl=nR<=10?2:3,per=Math.ceil(nR/cl),lines=_jBrk(rest,per),Lr=lines.length,lead=1.3,kc=((cl-1)*lead+1)/.86,gap=.5,style=["fill","accent","outline"][_jIdx(sb)%3];
 let z=Math.min(vw*(port?.84:.66)/(per*1.06+kc*1.04+gap),vh*.62/((Math.max(Lr,cl)-1)*lead+1),big*.7);z=Math.min(z,vh*.28/kc);z=capSize(z,.16);
 const row=document.createElement("div");row.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;display:flex;align-items:flex-start;gap:${_jpx(z*gap)};font-size:${_jpx(z)}`;c.appendChild(row);
 const ce=txtEl(`position:relative;flex:none;font-size:${kc.toFixed(3)}em;line-height:.86;letter-spacing:0;${style==="accent"?"color:var(--a);":""}${style==="outline"?"color:transparent;-webkit-text-stroke:max(2px,.025em) var(--c);":""}`);row.appendChild(ce);
 const cc=chars(cap,ce);
 const re=txtEl(`position:relative;flex:0 1 auto;line-height:${lead};letter-spacing:.04em;padding-top:.05em`);row.appendChild(re);
 const rl=[];lines.forEach(([a,b])=>{const d=document.createElement("div");d.style.whiteSpace="pre";re.appendChild(d);rl.push(...chars(rest.slice(a,b).join(""),d))});
 list.push(...cc,...rl);
 const rule=hair(row,`position:relative;order:0;flex:none;width:1px;height:auto;align-self:stretch;margin:0 ${_jpx(-z*gap*.5)};transform-origin:top;opacity:.5`,_jT(200),"Y",D()*.7);
 row.insertBefore(rule,re);
 _lEn(sb,ce,cc,0,[{opacity:0,transform:"scale(1.25)",filter:"blur(6px)"},{opacity:1,transform:"none",filter:"blur(0)"}]);
 _lEn(sb,re,rl,_jT(220))});

/* ---- split-cut 断ち割り：每行字從中線切成上下兩半，上半往右、下半往左錯開；切線是一條強調色細線由左拉到右 ---- */
registerLayout("split-cut",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain.trim()],n=Math.max(1,_jN(sb.plain));
 const f=_jFit(n,vw*(port?.8:.76),Math.min(vh*.3,big*.9),port?4:3,1.06),z=capSize(f.z,.3),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const L=lines.length,lead=1.16,idx=_jIdx(sb),off=(.08+.07*((idx*7)%3)/2)*(idx%2?-1:1),cutY=[.02,-.06,.08][idx%3];
 const wrap=document.createElement("div");wrap.style.cssText=`position:absolute;left:0;right:0;top:50%;translate:0 -50%;font-size:${_jpx(z)}`;c.appendChild(wrap);
 const cutPct=(50+cutY/lead*100).toFixed(2);
 lines.forEach(([a,b],li)=>{
  const t=arr.slice(a,b).join(""),row=document.createElement("div");row.style.cssText=`position:relative;height:${lead}em;line-height:${lead}em;text-align:center;white-space:pre`;wrap.appendChild(row);
  const mkh=(top)=>{const h=txtEl(`inset:0;text-align:center;line-height:${lead}em;letter-spacing:.03em;white-space:pre;clip-path:inset(${top?`0 0 ${(100-cutPct).toFixed(2)}% 0`:`${cutPct}% 0 0 0`})`);h.textContent=t;row.appendChild(h);return h};
  const top=mkh(true),bot=mkh(false),X=off.toFixed(3),d0=_jT(li*90);
  A(top,[{opacity:0,transform:"translateX(0)"},{opacity:1,transform:`translateX(${X}em)`}],{duration:D(),delay:d0,easing:"cubic-bezier(.16,1,.3,1)"});
  A(bot,[{opacity:0,transform:"translateX(0)"},{opacity:1,transform:`translateX(${-X}em)`}],{duration:D(),delay:d0,easing:"cubic-bezier(.16,1,.3,1)"});
  const ln=hair(row,`left:4cqw;right:4cqw;top:${cutPct}%;background:var(--a);opacity:.9;transform-origin:left`,_jT(160+li*80),"X",D()*.7);ln.style.height="max(1.5px,.02em)"});
 if(sb.en){/* 兩半各自演進場太雜：有指定進場時只套在整塊上 */const n0=anims.length;enter(wrap,sb.en,[]);_jLate(n0,0)}});

/* ---- erode-repeat 削り反復：同一句重複 2～5 行，每行多出（或少掉）一段；主行用本字顏色與進場，其餘行淡階；左對齊在整句的寬度上 ---- */
registerLayout("erode-repeat",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),arr=[...sb.plain.trim()],S=arr.filter(x=>!/\s/.test(x)).length;if(S<2)return;
 const R=Math.min(5,Math.max(2,S)),lens=[];for(let r=0;r<R;r++){const l=Math.max(1,Math.round(arr.length*(r+1)/R));if(!lens.includes(l))lens.push(l)}
 const erode=_jIdx(sb)%3===2;if(erode)lens.reverse();
 const rows=lens.map(l=>arr.slice(0,l).join("").trim()).filter(Boolean),Rn=rows.length,mainR=erode?0:Rn-1,leadK=1.34;if(!Rn)return;
 const fam=_lFam(),fw=_lW(arr.join(""),fam,.04);
 const z=capSize(Math.min(vw*.74/fw,vh*.8/(Rn*leadK),big*.7),.16);
 const col=document.createElement("div");col.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;display:flex;flex-direction:column;align-items:flex-start;font-size:${_jpx(z)};line-height:${leadK}`;c.appendChild(col);
 rows.forEach((t,r)=>{
  const e=txtEl(`position:relative;white-space:pre;letter-spacing:.04em`);col.appendChild(e);
  if(r===mainR){const ch=chars(t,e);list.push(...ch);_lEn(sb,e,ch,_jT(r*110))}
  else{e.textContent=t;e.dataset.nm=1;const dist=Math.abs(r-mainR)/Math.max(1,Rn-1);e.style.color="var(--c)";
   A(e,[{opacity:0},{opacity:.75-.45*dist}],{duration:D()*.5,delay:_jT(r*110)})}})});

/* ---- justify-stack 幅揃え：2～4 行，每行各自調字級撐到同一寬度（行首行尾切齊）；行間可加細線；字級不超過畫面高度 .2 ---- */
registerLayout("justify-stack",(sb,c,w,big,sm,dur,list)=>{
 const vw=SWd(),vh=SHd(),port=vw<vh,txt=sb.plain.trim(),G=[...txt].filter(x=>!/\s/.test(x)),n=G.length;if(n<3)return;
 const lat=/\s/.test(txt)&&G.filter(ch=>/[\x21-\x7e]/.test(ch)).length>n*.6;let Ln=n<=5?2:n<=10?3:4,units=lat?txt.split(/\s+/).filter(Boolean):G;Ln=Math.min(Ln,units.length);if(Ln<2)return;
 const lines=[],per=Math.ceil(units.length/Ln);for(let i=0;i<units.length;i+=per)lines.push(units.slice(i,i+per).join(lat?" ":""));
 for(let i=1;i<lines.length;i++){while(lines[i]&&_jPunct.test([...lines[i]][0])){const ch=[...lines[i]][0];lines[i-1]+=ch;lines[i]=lines[i].slice(ch.length)}}
 const ls=lines.filter(Boolean);if(ls.length<2)return;
 const Wb=port?vw*.84:Math.min(vw*.62,vh*1.15),fam=_lFam(),tr=.01,gapK=.1,rules=_jIdx(sb)%3!==1;
 let sz=ls.map(l=>Math.min(Wb/_lW(l,fam,tr),vh*.36,big*.9));
 const tot=sz.reduce((a,s)=>a+s*(1+gapK),0)-sz[sz.length-1]*gapK,k=Math.min(1,vh*.84/tot);sz=sz.map(s=>capSize(s*k,.2));
 const col=document.createElement("div");col.style.cssText=`position:absolute;left:50%;top:50%;translate:-50% -50%;width:${_jpx(Wb)};display:flex;flex-direction:column;align-items:center;gap:${_jpx(Math.min(...sz)*gapK)}`;c.appendChild(col);
 ls.forEach((t,i)=>{
  const e=txtEl(`position:relative;white-space:pre;font-size:${_jpx(sz[i])};line-height:1.05;letter-spacing:${tr}em;text-align:center`);col.appendChild(e);
  const ch=chars(t,e);list.push(...ch);
  _lEn(sb,e,ch,_jT(i*100),[{opacity:0,transform:`translateX(${i%2?4:-4}cqw)`,clipPath:"inset(0 0 0 0)"},{opacity:1,transform:"none",clipPath:"inset(0 0 0 0)"}]);
  if(rules&&i<ls.length-1)hair(col,`position:relative;width:100%;opacity:.45;transform-origin:${i%2?"right":"left"}`,_jT(i*100+160),"X",D()*.6)})});
