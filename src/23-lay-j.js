/* ===== [LAY-J] 版型 J（JIZURA 移植・階段 0＋1，「實驗室」）：margin baseline full-track line-focus scale-steps；共用小工具 hair／tick／capSize。
   部分部品改寫自 JIZURA（852wa/JIZURA，MIT）：只讀其設計與數值後用 DOM＋細線重寫，沒有搬 Canvas 程式碼；原專案採 MIT 授權，授權全文見原專案 LICENSE。
   對應：margin＝tyMargin（余白）／baseline＝tyBaseline（罫線組）／full-track＝tyFullTrack（全幅字送り）／line-focus＝tyLineFocus（行中強調）／scale-steps＝tyScaleSteps（級数上げ）。
   皆為時間純函數（A() 暫停動畫＋種子亂數 sr()，不用 Math.random、不累積狀態）；只用文字加細線，不畫底板、不加不透明底色；
   非主文的線與點標 data-nm；不做 JIZURA 自帶的羅馬字、編號、時間碼。baseline／line-focus 吃 {}（BRACE_LAYOUTS）。 ===== */
/* ---- 階段 0：共用小工具 ---- */
/* hair(c,css,delay,ax,dur)：在容器 c 加一條 1px 髮絲線。css 給位置與長度（cqw／cqh）與 transform-origin，後寫的宣告會蓋掉預設（例如 background:var(--a)）。
   進場 scaleX（ax="Y" 則 scaleY）0→1；delay／dur 單位 ms，dur 預設 D()*.8。細陰影讓線在深淺背景都看得見。 */
function hair(c,css,delay=0,ax="X",dur){
 const e=document.createElement("div");e.dataset.nm=1;
 e.style.cssText=`position:absolute;height:1px;background:var(--c);box-shadow:0 0 2px rgba(0,0,0,.6);${css||""}`;c.appendChild(e);
 A(e,[{transform:`scale${ax}(0)`},{transform:`scale${ax}(1)`}],{duration:dur==null?D()*.8:dur,delay});return e}
/* tick(c,css,delay,dur)：小方點，邊長預設 .5em（可由 css 覆寫 width／height／border-radius）；進場 scale 0→1。 */
function tick(c,css,delay=0,dur){
 const e=document.createElement("div");e.dataset.nm=1;
 e.style.cssText=`position:absolute;width:.5em;height:.5em;background:var(--a);box-shadow:0 0 2px rgba(0,0,0,.6);${css||""}`;c.appendChild(e);
 A(e,[{transform:"scale(0)"},{transform:"scale(1)"}],{duration:dur==null?D()*.5:dur,delay});return e}
/* capSize(z,ratio)：字級不超過畫面高度的 ratio（預設 .28），避免大字遮影片。 */
const capSize=(z,ratio=.28)=>Math.min(z,SHd()*ratio);
/* ---- 本檔內部輔助（_j 開頭，避免和別檔撞名）---- */
const _jT=ms=>ms/CONFIG.speed*tK;   /* 依速度與短句縮放係數換算延遲／長度 */
const _jpx=x=>x.toFixed(2)+"px";
const _jN=s=>[...s].filter(c=>!/\s/.test(c)).length;
const _jFull=sb=>(sb.raw!=null?sb.raw:sb.plain).replace(/[{}]/g,"").trim();   /* {} 版型的 plain 會拿掉 {} 內的字，要完整句子改由 raw 還原；sb.hl 與它逐字對齊 */
const _jPunct=/[、。，．,.!?！？」』）)〕】》〉…ー:;：；%]/;   /* 不可出現在行首；全幅字送り也把它們黏在前一字 */
const _jOpen=/[「『（(〔【《〈“‘]/;
const _jCw=s=>[...s].reduce((a,ch)=>a+(/[\x21-\x7e]/.test(ch)?.58:1.04),0);   /* 估字寬（em）：半形 .58、全形 1.04 */
/* 斷行：回傳 [起,止) 索引範圍陣列（索引對齊 arr，不丟字）；先依 \n 硬斷，再依 per 平均斷；拉丁文在空白處斷，中日文不讓標點落行首 */
function _jBrk(arr,per){
 const out=[],n=arr.length,segs=[];let s=0;
 for(let i=0;i<=n;i++)if(i===n||arr[i]==="\n"){segs.push([s,i]);s=i+1}
 const push=(a,b)=>{while(a<b&&/\s/.test(arr[a]))a++;while(b>a&&/\s/.test(arr[b-1]))b--;if(b>a)out.push([a,b])};
 segs.forEach(([s0,e0])=>{
  const len=e0-s0;if(len<=per){push(s0,e0);return}
  const tg=Math.ceil(len/Math.ceil(len/per)),lat=arr.slice(s0,e0).filter(ch=>/[\x21-\x7e]/.test(ch)).length>len*.6;
  let a=s0;
  while(a<e0){
   if(e0-a<=tg){push(a,e0);break}
   let b=a+tg;
   if(lat){let j=b;while(j>a&&arr[j]!==" ")j--;if(j>a)b=j;else{j=b;while(j<e0&&arr[j]!==" ")j++;b=j}}
   else while(b<e0&&_jPunct.test(arr[b]))b++;
   push(a,b);a=b}});
 return out}
/* 字數 n 放進寬 maxW、最多 Lmax 行：回傳每行字數 per 與字級 z（cw＝每字寬度 em） */
function _jFit(n,maxW,z0,Lmax,cw){
 let per=Math.max(1,Math.floor(maxW/(z0*cw)));if(Math.ceil(n/per)>Lmax)per=Math.ceil(n/Lmax);
 return{per,z:Math.min(z0,maxW/(per*cw))}}
/* 把「這次 enter() 新建的動畫」整體往後延 ms（enter() 本身沒有 delay 參數；動畫仍是暫停＋由時間設定，依然是純函數） */
function _jLate(n0,ms){for(let i=n0;i<anims.length;i++){const f=anims[i].effect,t=f.getTiming();f.updateTiming({delay:(+t.delay||0)+ms})}}
const _jIdx=sb=>Math.max(0,subs.indexOf(sb));   /* 句子編號（輪替用，不用亂數）；縮圖等找不到時當 0 */
/* 一行字：把 arr[a..b) 逐字放進 host，{} 內的字（hl 為 true）包進有相對定位的 span 並交給 mark(run) 加標記；回傳 .ch 元素 */
function _jRuns(host,arr,a,b,hl,ef,mark){
 let wrap=null;
 for(let j=a;j<b;j++){
  if(hl[j]){if(!wrap){wrap=document.createElement("span");wrap.style.cssText="position:relative;display:inline-block;line-height:1.1";host.appendChild(wrap);mark(wrap)}
   const s=chars(arr[j],wrap)[0];if(ef)s.style.fontFamily=ef}
  else{wrap=null;chars(arr[j],host)}}
 return[...host.querySelectorAll(".ch")]}

/* ---- 階段 1 ---- */
LAB_LAYOUTS.add("margin");LAB_LAYOUTS.add("baseline");LAB_LAYOUTS.add("full-track");LAB_LAYOUTS.add("line-focus");LAB_LAYOUTS.add("scale-steps");

registerLayout("margin",(sb,c,w,big,sm,dur,list)=>{   /* 余白（JIZURA tyMargin）：文字靠角落（左下／右上／右下／左中依句子編號輪替），旁邊拉出一條髮絲線，線尾收在小方點；線先拉出，文字再淡入並向內收 */
 const vw=SWd(),vh=SHd(),M=Math.min(vw,vh),port=vw<vh,arr=[...sb.plain],n=Math.max(1,_jN(sb.plain));
 const pos=["bl","tr","br","lc"][_jIdx(sb)%4],right=pos==="tr"||pos==="br";
 const f=_jFit(n,vw*.55,Math.min(M*.07,big*.5),port?5:3,1.12),z=capSize(f.z),lines=_jBrk(arr,f.per);if(!lines.length)return;
 const Y={bl:"bottom:14cqh",br:"bottom:14cqh",tr:"top:14cqh",lc:"top:50%;translate:0 -50%"}[pos];
 const row=document.createElement("div");row.style.cssText=`position:absolute;left:8cqw;right:8cqw;${Y};display:flex;flex-direction:${right?"row-reverse":"row"};align-items:center;gap:${_jpx(z*.8)};font-size:${_jpx(z)}`;c.appendChild(row);
 const e=txtEl(`position:relative;flex:0 1 auto;max-width:55cqw;text-align:${right?"right":"left"};line-height:1.4;letter-spacing:.1em`);row.appendChild(e);
 lines.forEach(([a,b])=>{const d=document.createElement("div");d.style.whiteSpace="pre";e.appendChild(d);list.push(...chars(arr.slice(a,b).join(""),d))});
 hair(row,`position:relative;flex:1 1 0;min-width:0;transform-origin:${right?"right":"left"}`,0,"X",_jT(300));
 tick(row,`position:relative;flex:none;width:.2em;height:.2em;margin-${right?"right":"left"}:${_jpx(-z*.8)}`,_jT(240),_jT(200));
 const d0=_jT(300);
 if(sb.en){const n0=anims.length;enter(e,sb.en,list);_jLate(n0,d0)}
 else A(e,[{opacity:0,transform:`translateX(${right?2:-2}cqw)`},{opacity:1,transform:"none"}],{duration:D(),delay:d0})});

registerLayout("baseline",(sb,c,w,big,sm,dur,list)=>{   /* 罫線組（JIZURA tyBaseline）：2～3 行字，每行下一條橫跨畫面的髮絲基線；{} 關鍵字下再加一條強調色粗線（沒有 {} 就不畫）。基線依行由左拉出，文字跟著淡入，粗線最後拉出 */
 const vw=SWd(),vh=SHd(),port=vw<vh,full=_jFull(sb),arr=[...full],n=Math.max(1,_jN(full));
 const hl=arr.map((_,j)=>!!(sb.hl&&sb.hl[j])),nl=[2,3,3][_jIdx(sb)%3],ef=emFontCss(sb);
 let p=n<=4?arr.length:Math.max(4,Math.ceil(n/nl)),lines=_jBrk(arr,p);
 for(let g=0;lines.length>6&&g<arr.length;g++)lines=_jBrk(arr,++p);   /* 最多 6 行，但寧可放大每行字數也不丟字 */
 if(!lines.length)return;
 const L=lines.length,lead=1.62,maxLen=Math.max(...lines.map(([a,b])=>b-a));
 const z=capSize(Math.min(vh*.7/(L*lead),port?vw*.17:vh*.16,vw*(port?.72:.7)/(maxLen*1.05),big*.7)),x0=port?16:14;
 const bars=[],nB=_jT(L*100)+D()*.5;
 lines.forEach(([a,b],li)=>{
  const yc=(li-(L-1)/2)*z*lead,row=txtEl(`left:${x0}cqw;top:calc(50% + ${_jpx(yc-z/2)});font-size:${_jpx(z)};line-height:1;letter-spacing:.04em;white-space:pre`);c.appendChild(row);
  const ch=_jRuns(row,arr,a,b,hl,ef,wr=>bars.push(wr));list.push(...ch);
  hair(c,`left:6cqw;right:6cqw;top:calc(50% + ${_jpx(yc+z*.56)});transform-origin:left;opacity:.55`,_jT(li*100),"X",D()*.8);
  const d0=_jT(li*100+150);
  if(sb.en){const n0=anims.length;enter(row,sb.en,ch);_jLate(n0,d0)}
  else A(row,[{opacity:0,transform:"translateY(1.2cqh)"},{opacity:1,transform:"none"}],{duration:D(),delay:d0})});
 bars.forEach(wr=>{const bar=document.createElement("div");bar.dataset.nm=1;
  bar.style.cssText="position:absolute;left:0;right:0;top:100%;margin-top:.025em;height:.07em;min-height:2px;background:var(--a);box-shadow:0 0 2px rgba(0,0,0,.6);transform-origin:left";wr.appendChild(bar);
  A(bar,[{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:D()*.6,delay:nB})})},{brace:1});

registerLayout("full-track",(sb,c,w,big,sm,dur,list)=>{   /* 全幅字送り（JIZURA tyFullTrack）：每個字平均撐開到整個畫面寬（直式畫面改為高度），左右（上下）留 6～8；超過 12 字改兩行（直式兩欄）各自撐開；字從中心向兩側散開，線再拉出 */
 const vw=SWd(),vh=SHd(),port=vw<vh,arr=[...sb.plain],hlv=sb.hl||[],U=[];
 const lat=/\s/.test(sb.plain)&&arr.filter(ch=>/[\x21-\x7e]/.test(ch)).length>_jN(sb.plain)*.6;
 if(lat){let cur=null;arr.forEach((ch,j)=>{if(/\s/.test(ch)){cur=null;return}if(!cur){cur={t:"",k:!!hlv[j]};U.push(cur)}cur.t+=ch})}
 if(U.length<2){U.length=0;let pend="",pk=false;   /* 逐字：標點黏在前一字，開括號黏在下一字，才不會被撐開到看不懂 */
  arr.forEach((ch,j)=>{if(/\s/.test(ch))return;
   if(_jPunct.test(ch)&&U.length){U[U.length-1].t+=ch;return}
   if(_jOpen.test(ch)){pend+=ch;pk=pk||!!hlv[j];return}
   U.push({t:pend+ch,k:!!hlv[j]||pk});pend="";pk=false});
  if(pend){if(U.length)U[U.length-1].t+=pend;else U.push({t:pend,k:false})}}
 const k=U.length;if(!k)return;
 const rows=k>12?[U.slice(0,Math.ceil(k/2)),U.slice(Math.ceil(k/2))]:[U],R=rows.length,mc=r=>Math.max(...r.map(u=>_jCw(u.t)));
 let z;
 if(!port){const S=Math.max(...rows.map(r=>r.reduce((a,u)=>a+_jCw(u.t),0)));z=capSize(Math.min(big*.7,vh*.2,vw*.88*.84/S))}
 else{const Sv=Math.max(...rows.map(r=>r.length)),cwid=rows.reduce((a,r)=>a+mc(r),0)+(R-1)*.4;z=capSize(Math.min(big*.7,vw*.24,vh*.11,vh*.84*.84/Sv,vw*.84/cwid))}
 rows.forEach((r,ri)=>{
  const o=(ri-(R-1)/2)*z*(port?1.15:1.25);
  const e=txtEl(port?`top:8cqh;bottom:8cqh;left:50%;margin-left:${_jpx(o-z/2)};width:${_jpx(z)};display:flex;flex-direction:column;justify-content:${r.length<2?"center":"space-between"};align-items:center;font-size:${_jpx(z)};line-height:1;letter-spacing:0;white-space:pre`
   :`left:6cqw;right:6cqw;top:50%;margin-top:${_jpx(o-z/2)};height:${_jpx(z)};display:flex;justify-content:${r.length<2?"center":"space-between"};align-items:center;font-size:${_jpx(z)};line-height:1;letter-spacing:0;white-space:pre`);
  c.appendChild(e);
  const us=r.map(u=>{const s=document.createElement("span");s.className="ch";s.textContent=u.t;if(u.k)s.style.cssText="color:var(--a);text-shadow:0 0 .35em var(--a)";e.appendChild(s);return s});list.push(...us);
  if(sb.en)enter(e,sb.en,us);
  else us.forEach((s,j)=>{const u=us.length>1?j/(us.length-1):.5,off=((.5-u)*(port?84:88)).toFixed(2)+(port?"cqh":"cqw"),T=port?"translateY":"translateX";
   A(s,[{opacity:0,transform:`${T}(${off})`},{opacity:1,offset:.45},{opacity:1,transform:"none"}],{duration:D()*1.2,delay:_jT(ri*80),easing:"cubic-bezier(.2,.8,.2,1)"})})});
 const d1=D()*.7;
 if(!port)hair(c,`left:6cqw;right:6cqw;top:calc(50% + ${_jpx((R-1)/2*z*1.25+z*.68)});transform-origin:center;opacity:.6`,d1,"X",D()*.9);
 else hair(c,`top:8cqh;bottom:8cqh;height:auto;width:1px;left:calc(50% + ${_jpx((R-1)/2*z*1.15+z*.7)});transform-origin:center;opacity:.6`,d1,"Y",D()*.9)});

registerLayout("line-focus",(sb,c,w,big,sm,dur,list)=>{   /* 行中強調（JIZURA tyLineFocus）：顯示整句，{} 內是「這一鏡的片段」，其餘降到 .45 透明度；片段以底線／圓點／框線標出（依句子編號輪替）；整句先淡入，再把標記拉出。沒有 {} 就整句正常顯示、不畫標記 */
 const vw=SWd(),vh=SHd(),M=Math.min(vw,vh),port=vw<vh,full=_jFull(sb),arr=[...full],hl=arr.map((_,j)=>!!(sb.hl&&sb.hl[j])),any=hl.some(Boolean),ef=emFontCss(sb);
 const n=Math.max(1,_jN(full)),nLn=n>(port?7:12)?Math.ceil(n/(port?6:11)):1,lines=_jBrk(arr,Math.max(1,Math.ceil(arr.length/nLn)));if(!lines.length)return;
 const L=lines.length,maxLen=Math.max(...lines.map(([a,b])=>b-a)),z=capSize(Math.min(M*.12,big*.8,vw*.82/(maxLen*1.1),vh*.56/(L*1.7))),mk=["bar","dot","box"][_jIdx(sb)%3];
 const e=txtEl(`inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:${_jpx(z)};line-height:1.7;letter-spacing:.08em`);c.appendChild(e);
 const md=D()*.8,mdur=D()*.5,RUN="position:relative;display:inline-block;line-height:1.1";
 lines.forEach(([a,b],li)=>{
  const d=document.createElement("div");d.style.whiteSpace="pre";e.appendChild(d);
  const runs=[],md1=md+_jT(li*100);let host=d,kind=-1;
  for(let j=a;j<b;j++){
   const want=!any?0:hl[j]?2:1;
   if(want!==kind){kind=want;host=d;
    if(want===1){host=document.createElement("span");host.style.opacity=".45";d.appendChild(host)}
    else if(want===2&&mk!=="dot"){host=document.createElement("span");host.style.cssText=RUN;d.appendChild(host);runs.push(host)}}
   let h=host;
   if(want===2&&mk==="dot"){h=document.createElement("span");h.style.cssText=RUN;host.appendChild(h);   /* 圓點：每個字上方一點，所以每個字自己一層 */
    if(!/\s/.test(arr[j]))tick(h,"left:50%;top:-.05em;translate:-50% -100%;width:.16em;height:.16em;border-radius:50%",md1,mdur)}
   const s=chars(arr[j],h)[0];if(ef&&want===2)s.style.fontFamily=ef}
  runs.forEach(r=>{
   if(mk==="bar")hair(r,"left:0;right:0;top:100%;margin-top:.04em;height:.06em;min-height:2px;background:var(--a);transform-origin:left",md1,"X",mdur);
   else hair(r,"left:-.14em;right:-.14em;top:-.06em;bottom:-.06em;height:auto;background:transparent;border:max(1px,.03em) solid var(--a);transform-origin:left",md1,"X",mdur)})});
 list.push(...e.querySelectorAll(".ch"));
 if(sb.en)enter(e,sb.en,list);
 else A(e,[{opacity:0,transform:"translateY(1.5cqh)"},{opacity:1,transform:"none"}],{duration:D()})},{brace:1});

registerLayout("scale-steps",(sb,c,w,big,sm,dur,list)=>{   /* 級数上げ（JIZURA tyScaleSteps）：一句拆成 2～7 段（依逗號／空白切，切不出來就平均切），字級依比例逐段放大（或縮小），基線對齊；由小到大依序淡入，底下一條髮絲線 */
 const vw=SWd(),vh=SHd(),port=vw<vh,txt=sb.plain,r=sr(sb.s),dir=["up","up","down"][_jIdx(sb)%3],ratio=2+r()*.8;
 const G=[...txt].filter(x=>!/\s/.test(x)),lat=G.filter(ch=>/[\x21-\x7e]/.test(ch)).length>G.length*.6;
 let U=txt.split(/[,，、;；\s]+/).filter(Boolean);
 const chunk=(a,k,j)=>{const m=Math.ceil(a.length/k),o=[];for(let i=0;i<a.length;i+=m)o.push(a.slice(i,i+m).join(j));return o};
 if(U.length>7)U=chunk(U,Math.min(5,Math.ceil(U.length/3)),lat?" ":"");
 else if(U.length<2){if(G.length>=2)U=G.length<=7?G.slice():chunk(G,Math.min(5,Math.ceil(G.length/3)),"");else U=[txt.trim()||txt]}
 const k=U.length;if(!k||!U[0])return;
 const f=U.map((u,i)=>{const t=k>1?i/(k-1):1;return Math.pow(ratio,dir==="up"?t:1-t)}),fmax=Math.max(...f),cw=U.map(_jCw),gm=lat?.22:.14;
 let base;
 if(!port){let tot=0;U.forEach((u,i)=>{tot+=cw[i]*f[i]+(i?gm*f[i]:0)});base=Math.min(vw*.86/tot,vh*.52/fmax,big*1.2/fmax)}
 else{let tot=0;f.forEach(x=>{tot+=x*1.12});base=Math.min(vh*.78/tot,vw*.5/fmax,big*1.2/fmax);U.forEach((u,i)=>{base=Math.min(base,vw*.8/(cw[i]*f[i]))})}
 const zmax=capSize(base*fmax);base=zmax/fmax;
 const order=[...U.keys()].sort((a,b)=>f[a]-f[b]||a-b),rk=[];order.forEach((j,i)=>rk[j]=i);
 let e;
 if(!port){const wrap=document.createElement("div");wrap.style.cssText="position:absolute;left:0;right:0;top:50%;translate:0 -50%;display:flex;justify-content:center";c.appendChild(wrap);
  const col=document.createElement("div");col.style.cssText="display:flex;flex-direction:column;align-items:stretch";wrap.appendChild(col);
  e=txtEl(`position:relative;display:flex;align-items:baseline;white-space:pre;font-size:${_jpx(base)};line-height:1.05;letter-spacing:.02em`);col.appendChild(e);
  hair(col,`position:relative;margin-top:${_jpx(zmax*.12)};transform-origin:left;opacity:.6`,_jT(k*130)+D()*.4,"X",D()*.9)}
 else{e=txtEl(`left:10cqw;top:50%;translate:0 -50%;display:flex;flex-direction:column;align-items:flex-start;white-space:pre;font-size:${_jpx(base)};line-height:1.12;letter-spacing:.02em`);c.appendChild(e)}
 U.forEach((u,j)=>{
  const s=document.createElement(port?"div":"span");s.style.cssText=`font-size:${f[j].toFixed(4)}em;`+(port?"":`display:inline-block;margin-left:${j?gm:0}em`);e.appendChild(s);
  const ch=chars(u,s),d0=_jT(rk[j]*130);list.push(...ch);
  if(sb.en){const n0=anims.length;enter(s,sb.en,ch);_jLate(n0,d0)}
  else A(s,[{opacity:0,transform:"translateY(1.5cqh)"},{opacity:1,transform:"none"}],{duration:D(),delay:d0})})});
