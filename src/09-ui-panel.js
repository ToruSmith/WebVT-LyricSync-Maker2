/* ===== [UI-PANEL] 參數面板 panel/posPanel/bgPanel、字體載入（FontFace + IndexedDB）、套用到畫面 css/bgCss/toneCss/save ===== */
let bfxHueF=false;   /* 這一幀是否有節拍色相（[BEATFX] 設定；toneCss 啟動時就會被呼叫，所以宣告放最前面） */
const P=[["bpm","BPM",40,220,1],["offset","節拍起點 offset(秒)",0,5,.01],["pulse","脈衝強度",0,.3,.005],["bounce","彈跳振幅(px)",0,80,1],["flash","閃白強度",0,.6,.01],
 ["speed","全域速度",.25,4,.05],["enter","進場秒數",.05,4,.05],["exit","退場秒數",.05,3,.05],["bigRatio","大字高度比例",.03,.8,.01],["textScale","文字整體縮放%",20,300,5],["spacing","字距(em)",-.1,2,.05],["weight","字重",100,900,100]];
/* 面板區段錨點：panel() 重建時一併重建；showSec(id) 供 [QUICK]「面板跳轉」使用（id 清單見 QK_SECS） */
function secAnchor(p,id){const a=document.createElement("span");a.dataset.sec=id;a.style.cssText="display:block;height:0";p.append(a)}
const PANEL_TITLES={rhythm:"節奏・字體・顏色",preset:"預設組合・鎖定版型",export:"設定與專案 匯出／匯入",scene:"畫面・粒子・轉場・疊加層",layers:"風格包・場景層・後製",pos:"位置微調",bg:"背景・亮度・陰影"};
let panelOpen=(()=>{try{const r=JSON.parse(localStorage.getItem(LS_PO)||"null");return Array.isArray(r)?r:["rhythm"]}catch(e){return["rhythm"]}})();   /* 各分組展開狀態，panel() 重建後沿用 */
function foldPanel(p){   /* 把 panel() 建好的扁平內容，依 secAnchor 折成 <details> 分組；只搬移節點，事件與參照都不變 */
 let box=null;
 [...p.childNodes].forEach(n=>{const id=n.dataset&&n.dataset.sec;
  if(id){const d=document.createElement("details"),sm=document.createElement("summary");box=document.createElement("div");box.className="pb";d.className="ps";d.dataset.sec=id;sm.textContent=PANEL_TITLES[id]||id;d.append(sm,box);d.open=panelOpen.includes(id);
   d.addEventListener("toggle",()=>{panelOpen=panelOpen.filter(x=>x!==id);if(d.open)panelOpen.push(id);try{localStorage.setItem(LS_PO,JSON.stringify(panelOpen))}catch(e){}});n.replaceWith(d)}
  else if(box)box.append(n)});
 const t=document.createElement("div");t.className="pt";
 [["全部展開",1],["全部收合",0]].forEach(([x,v])=>{const b=document.createElement("button");b.textContent=x;b.onclick=()=>p.querySelectorAll("details.ps").forEach(d=>d.open=!!v);t.append(b)});p.prepend(t)}
function showSec(id){const p=$("#panel");p.classList.remove("off");const a=p.querySelector(`[data-sec="${id}"]`);if(!a)return note("找不到面板區段："+id);if(a.tagName==="DETAILS")a.open=true;id==="rhythm"?p.scrollTo({top:0,behavior:"smooth"}):a.scrollIntoView({block:"start",behavior:"smooth"})}
function panel(){
 const p=$("#panel");p.innerHTML="";secAnchor(p,"rhythm");
 P.forEach(([k,n,a,b,s])=>{const l=document.createElement("label"),i=document.createElement("input");l.textContent=n+"：";const v=document.createElement("b");v.textContent=CONFIG[k];l.append(v);
  Object.assign(i,{type:"range",min:a,max:b,step:s,value:CONFIG[k]});i.oninput=()=>{CONFIG[k]=+i.value;v.textContent=i.value;save();if(k==="particles")perfPart=null;if(k==="beatHue")toneCss();if(["bigRatio","textScale","spacing","weight","enter","exit","speed"].includes(k))cur=-2};p.append(l,i)});
 const mkc=(k,n)=>{const l=document.createElement("label"),i=document.createElement("input");l.textContent=n;i.type="color";i.dataset.k=k;i.value=CONFIG[k];i.oninput=()=>{CONFIG[k]=i.value;css();cur=-2;save()};p.append(l,i)};
 mkc("color","文字顏色");mkc("accent","強調色");
 const fl=document.createElement("label");fl.textContent="字體";const sel=document.createElement("select");sel.id="fsel";sel.style.width="100%";p.append(fl,sel);fonts();
 sel.onchange=()=>{CONFIG.font=sel.value;save();cur=-2};
 const up=document.createElement("input");up.type="file";up.accept=".ttf,.otf,.woff,.woff2";up.onchange=async()=>{const f=up.files[0];if(!f)return;const buf=await f.arrayBuffer();await addFont(f.name.replace(/\.\w+$/,""),buf);idbPut(f.name,buf)};
 const ul=document.createElement("label");ul.textContent="上傳字體";p.append(ul,up);
 const au=document.createElement("label");au.innerHTML='<input type="checkbox" id="auto"> 自動變化版型';p.append(au);$("#auto").checked=CONFIG.auto;$("#auto").onchange=e=>{CONFIG.auto=e.target.checked;cur=-2};
 const tap=document.createElement("button");tap.textContent="Tap 打拍子";let taps=[];tap.onclick=()=>{const n=performance.now();if(taps.length&&n-taps[taps.length-1]>2000)taps=[];taps.push(n);if(taps.length>=4){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);CONFIG.bpm=Math.round(60000/iv);panel();save()}};p.append(tap);extra(p);extra3(p);extra4(p);posPanel(p);bgPanel(p);foldPanel(p);
}
let selIdx=-1,posRef=null,edOnSel=null;const EDR=[],r2p=v=>String(Math.round((+v||0)*100)/100);
const layOf=x=>{const l=CONFIG.lock||x.lay;return LAYOUTS.includes(l)?l:"lowerleft"};
function setSel(i){if(i>=0&&i<subs.length){selIdx=i;posRef&&posRef();edOnSel&&edOnSel(i)}}
function jumpTo(i){const x=subs[i];if(!x)return;pause();const t=x.s+(x.e-x.s)*.5;if(hasMedia)m.currentTime=t;else vt=t;cur=-2;setSel(i)}   /* 跳到該句中段並暫停，方便看著畫面微調 */
function edSync(i){$("#edm")&&edRowUpdate(i)}   /* 位置等欄位被面板／拖曳改動後，同步編輯器該列與詳細欄（實作在 13-editor.js） */
/* ===== 位置微調工具：復原／重做（快照）、位置預設、有效位置換算 ===== */
const POSPRE=[["mc","正中"],["bc","下中（電影字幕）"],["bc:0:-10","下中偏上"],["bl","左下（歌詞）"],["br","右下"],["tl","左上"],["tc","上中"],["tr","右上"],["ml","左中"],["mr","右中"],["auto","版型原位"],["alt:bl|br","左下／右下 交替"],["alt:tc|bc","上中／下中 交替"]];
const presetPos=(v,k)=>v.startsWith("alt:")?v.slice(4).split("|")[k%2]:v;
const fmtPos=(a,X,Y)=>[a||"auto",...(+X||+Y?[r2p(X),r2p(Y)]:[])].join(":");
const effPos=x=>{const q=resolvePos(x);return q?{a:q.a,x:q.x,y:q.y}:{a:"",x:0,y:0}};   /* 這句「現在實際」的錨點與偏移（含跟隨全域的部分）；拖曳／方向鍵就從這裡開始，畫面不會跳 */
let histA=[],histB=[],histKey="",histT=0,histOf=null;
const cloneSub=o=>({...o,br:o.br&&[...o.br],hl:o.hl&&[...o.hl]});   /* br/hl 是陣列，淺拷貝會讓快照和現行字幕共用同一份 */
const snapSubs=()=>subs.map(cloneSub);
function histBtn(){document.querySelectorAll(".hbU").forEach(b=>b.disabled=!(histOf===subs&&histA.length));document.querySelectorAll(".hbR").forEach(b=>b.disabled=!(histOf===subs&&histB.length))}
function pushHist(key){const t=performance.now();if(histOf!==subs){histA=[];histB=[];histOf=subs;histKey=""}   /* 換了一份字幕（載入 SRT／範例）就清空歷史 */
 if(key&&key===histKey&&t-histT<900){histT=t;return}   /* 連續拖滑桿／連按方向鍵合併成一步 */
 histKey=key||"";histT=t;histA.push(snapSubs());if(histA.length>100)histA.shift();histB=[];histBtn()}
function restoreSubs(sn){subs.splice(0,subs.length,...sn.map(cloneSub));cur=-2;if(selIdx>=subs.length)selIdx=subs.length-1;posRef&&posRef();refreshEditor();histBtn()}
function undo(){if(histOf!==subs||!histA.length)return note("沒有可復原的動作");histB.push(snapSubs());restoreSubs(histA.pop());histKey="";note("已復原")}
function redo(){if(histOf!==subs||!histB.length)return note("沒有可重做的動作");histA.push(snapSubs());restoreSubs(histB.pop());histKey="";note("已重做")}
function nudge(dx,dy){const x=subs[selIdx];if(!x||FULLBLEED.has(layOf(x)))return;pushHist("nudge"+selIdx);const e=effPos(x);x.pos=fmtPos(e.a,e.x+dx,e.y+dy);x.auto=false;cur=-2;edSync(selIdx);posRef&&posRef()}
function guidesCss(){const g=document.getElementById("guides");if(!g)return;const sf=+CONFIG.posSafe||0;
 document.getElementById("vl").style.left=sf+"%";document.getElementById("vr").style.left=(100-sf)+"%";document.getElementById("ht").style.top=sf+"%";document.getElementById("hb").style.top=(100-sf)+"%";g.classList.toggle("on",!!CONFIG.guides)}
const EDSEL=new Set();let lastCk=-1;
const selList=()=>[...EDSEL].filter(i=>i<subs.length).sort((a,b)=>a-b);
function cntUpd(){const e=$("#edcnt");if(e)e.textContent="已勾選 "+selList().length+" 句"}
function applyTo(f){const l=selList();if(!l.length)return note("先在編輯器勾選要套用的句子");pushHist();l.forEach((i,k)=>{f(subs[i],k,i);edSync(i)});cur=-2;posRef&&posRef();note("已套用到 "+l.length+" 句；請用編輯器的「匯出帶標記的 SRT」存檔")}
if(!RENDER){
 document.addEventListener("keydown",e=>{const T=e.target;if(/TEXTAREA|SELECT/.test(T.tagName)||(T.tagName==="INPUT"&&!["range","checkbox","button"].includes(T.type)))return;
  const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;if(!mod)return;
  if(k==="z"&&!e.shiftKey){e.preventDefault();undo()}
  else if(k==="y"||(k==="z"&&e.shiftKey)){e.preventDefault();redo()}
  else if(e.key.startsWith("Arrow")){e.preventDefault();const st=e.shiftKey?2:.5;nudge(e.key==="ArrowLeft"?-st:e.key==="ArrowRight"?st:0,e.key==="ArrowUp"?-st:e.key==="ArrowDown"?st:0)}});
 /* 在畫面上拖曳文字：從這句目前的有效位置出發，位移換算成相對錨點的 X／Y %；吸附到中心線與安全邊界（Alt 暫時關閉） */
 (()=>{const st=$("#stage");let D=null;const G0=document.getElementById("guides");
  const mark=ids=>G0.querySelectorAll("i").forEach(el=>el.classList.toggle("hit",ids.includes(el.id)));
  st.addEventListener("pointerdown",e=>{if(recording||e.button!==0)return;
   const t=now(),i=subs.findIndex(s=>t>=s.s&&t<s.e);if(i<0)return;const x=subs[i];
   if(FULLBLEED.has(layOf(x))){note("此版型為滿版，位置不生效");return}
   const G=groupRect(L);if(!G)return;const o=st.getBoundingClientRect(),px=e.clientX-o.left,py=e.clientY-o.top,mx=SWd()*.04,my=SHd()*.04;
   if(px<G.l-mx||px>G.r+mx||py<G.t-my||py>G.b+my)return;   /* 只有按在文字附近才開始拖 */
   e.preventDefault();try{st.setPointerCapture(e.pointerId)}catch(_){}
   pause();pushHist("drag"+Math.random());D={i,x,sx:e.clientX,sy:e.clientY,b:effPos(x),G,moved:false};st.style.cursor="move";G0.classList.add("drag");setSel(i)});
  st.addEventListener("pointermove",e=>{if(!D)return;let dx=e.clientX-D.sx,dy=e.clientY-D.sy;if(!D.moved&&Math.hypot(dx,dy)<3)return;D.moved=true;
   const vw=SWd(),vh=SHd(),G=D.G;let ids=[];
   if(CONFIG.snap!==false&&!e.altKey){const sf=(+CONFIG.posSafe||0)/100,thr=Math.min(vw,vh)*.012,cand=pr=>{let b=null;pr.forEach(([v,t,id])=>{const d=t-v;if(Math.abs(d)<thr&&(!b||Math.abs(d)<Math.abs(b[0])))b=[d,id]});return b};
    const bx=cand([[(G.l+G.r)/2+dx,vw/2,"vc"],[G.l+dx,sf*vw,"vl"],[G.r+dx,vw-sf*vw,"vr"]]),by=cand([[(G.t+G.b)/2+dy,vh/2,"hc"],[G.t+dy,sf*vh,"ht"],[G.b+dy,vh-sf*vh,"hb"]]);
    if(bx){dx+=bx[0];ids.push(bx[1])}if(by){dy+=by[0];ids.push(by[1])}}
   mark(ids);D.x.pos=fmtPos(D.b.a,D.b.x+dx/vw*100,D.b.y+dy/vh*100);D.x.auto=false;cur=-2;edSync(D.i);posRef&&posRef()});
  const end=()=>{if(!D)return;if(!D.moved){histA.pop();histKey="";histBtn()}D=null;st.style.cursor="";G0.classList.remove("drag");mark([])};
  st.addEventListener("pointerup",end);st.addEventListener("pointercancel",end)})();
}
function posPanel(p){secAnchor(p,"pos");
 const hd=t=>{const h=document.createElement("label");h.innerHTML="<b>"+t+"</b>";h.style.marginTop="14px";p.append(h)};
 hd("── 這一句的位置 ──");
 const info=document.createElement("div"),warn=document.createElement("div");info.style.cssText="margin:4px 0;line-height:1.5;opacity:.9";warn.style.cssText="margin:4px 0;color:#ffb347;line-height:1.5";p.append(info,warn);
 const al=document.createElement("label");al.textContent="錨點（下面的 X／Y 以它為原點）";
 const as=document.createElement("select");as.style.width="100%";[["","跟隨全域"],["auto","版型原位"],...Object.entries(ANCH)].forEach(([v,t])=>as.add(new Option(t,v)));p.append(al,as);
 const mk=n=>{const l=document.createElement("label"),r=document.createElement("input"),nn=document.createElement("input");l.textContent=n;
  Object.assign(r,{type:"range",min:-100,max:100,step:.5,value:0});Object.assign(nn,{type:"number",min:-100,max:100,step:.5,value:0});nn.style.cssText="width:100%;margin-top:2px";p.append(l,r,nn);return{r,nn}};
 const X=mk("水平 X %（右為正，相對錨點）"),Y=mk("垂直 Y %（下為正，相對錨點）"),all=[as,X.r,X.nn,Y.r,Y.nn];
 const sync=light=>{
  if(!subs[selIdx]&&subs.length)selIdx=0;const x=subs[selIdx];
  if(!x){info.textContent="（尚無句子）";warn.textContent="";all.forEach(e=>e.disabled=true);return}
  const fb=FULLBLEED.has(layOf(x));all.forEach(e=>e.disabled=fb);
  const q=(x.pos||"").split(":"),gd=(CONFIG.posAnchor?ANCH[CONFIG.posAnchor]:"版型原位")+"，X "+(+CONFIG.posX||0)+"，Y "+(+CONFIG.posY||0);
  info.textContent="第 "+(selIdx+1)+"／"+subs.length+" 句　"+x.s.toFixed(1)+"s　"+x.raw.replace(/\s+/g," ").trim().slice(0,14)+(fb?"　（此版型為滿版，位置不生效）":x.pos?"　〔本句自訂〕":"　〔跟隨全域："+gd+"〕");
  warn.textContent=(CONFIG.posAnchor||+CONFIG.posX||+CONFIG.posY)?"⚠ 全域位置不是預設：所有「跟隨全域」的句子都會偏離版型原位（見下方「全域預設」）":"";
  if(!light){as.value=(q[0]==="auto"||ANCH[q[0]])?q[0]:"";X.r.value=X.nn.value=+q[1]||0;Y.r.value=Y.nn.value=+q[2]||0}};
 const commit=()=>{const x=subs[selIdx];if(!x)return;pushHist("pos"+selIdx);const a=+X.r.value||0,b=+Y.r.value||0;x.pos=[as.value,...(a||b?[r2p(a),r2p(b)]:[])].join(":");if(x.pos)x.auto=false;cur=-2;edSync(selIdx);sync(true)};
 as.onchange=commit;
 [[X,Y],[Y,X]].forEach(([T])=>{T.r.oninput=()=>{T.nn.value=T.r.value;commit()};T.nn.onchange=()=>{T.r.value=T.nn.value;T.nn.value=T.r.value;commit()}});
 const bt=(t,f,tip)=>{const b=document.createElement("button");b.textContent=t;if(tip)b.title=tip;b.onclick=f;p.append(b);return b};
 {const hr=document.createElement("div");hr.style.cssText="display:flex;gap:6px;margin:6px 0";[["復原 Ctrl+Z","hbU",undo],["重做 Ctrl+Y","hbR",redo]].forEach(([t,c,f])=>{const b=document.createElement("button");b.textContent=t;b.className=c;b.onclick=f;hr.append(b)});p.append(hr);histBtn()}
 {const ps=document.createElement("select");ps.style.cssText="width:100%;margin:4px 0";ps.add(new Option("位置預設 → 套用到這一句…",""));POSPRE.forEach(([v,t])=>ps.add(new Option(t,v)));
  ps.onchange=()=>{const x=subs[selIdx];if(!x||!ps.value)return;pushHist();x.pos=presetPos(ps.value,selIdx);x.auto=false;cur=-2;edSync(selIdx);sync(false);ps.value=""};p.append(ps)}
 bt("這句回到跟隨全域",()=>{const x=subs[selIdx];if(!x)return;pushHist();x.pos="";cur=-2;edSync(selIdx);sync()});
 const copyTo=from=>{const x=subs[selIdx];if(!x)return;if(!confirm("把這句的位置「"+(x.pos||"跟隨全域")+"」複製到"+(from?"之後的所有句子":"全部句子")+"？"))return;
  pushHist();subs.forEach((y,i)=>{if(y===x||(from&&i<selIdx))return;y.pos=x.pos;if(y.pos)y.auto=false;edSync(i)});cur=-2;note("已複製位置；請用編輯器的「匯出帶標記的 SRT」存檔")};
 bt("複製這句位置到之後的句子",()=>copyTo(1));bt("複製這句位置到全部句子",()=>copyTo(0));
 const tip=document.createElement("div");tip.style.cssText="margin:6px 0;opacity:.7;line-height:1.5";tip.textContent="💡 直接在畫面上拖曳文字即可移動（Alt＝暫時關閉吸附）；Ctrl＋方向鍵微調 0.5%，再加 Shift 為 2%；Ctrl+Z 復原。";p.append(tip);
 posRef=()=>sync(false);sync(false);
 hd("── 全域預設（只影響沒有自訂位置的句子）──");
 const l=document.createElement("label");l.textContent="全域錨點（九宮格；滿版版型不受影響）";const s=document.createElement("select");s.style.width="100%";
 [["","版型原位（預設）"],...Object.entries(ANCH).map(([k,v])=>[k,v])].forEach(([v,t])=>s.add(new Option(t,v)));s.value=CONFIG.posAnchor||"";s.onchange=()=>{CONFIG.posAnchor=s.value;cur=-2;save();posRef&&posRef()};p.append(l,s);
 [["posX","全域水平微調 %",-50,50,1],["posY","全域垂直微調 %",-50,50,1],["posSafe","安全邊界 %",0,20,1]].forEach(([k,n,a,b,st])=>{
  const l=document.createElement("label"),i=document.createElement("input"),v=document.createElement("b");l.textContent=n+"：";v.textContent=CONFIG[k];l.append(v);
  Object.assign(i,{type:"range",min:a,max:b,step:st,value:CONFIG[k]});i.oninput=()=>{CONFIG[k]=+i.value;v.textContent=i.value;cur=-2;save();guidesCss();posRef&&posRef()};p.append(l,i)});
 [["guides","顯示參考線（中心十字＋安全邊界）"],["snap","拖曳時吸附到中心線／安全邊界（Alt 暫時關閉）"]].forEach(([k,t])=>{const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.checked=k==="snap"?CONFIG.snap!==false:!!CONFIG.guides;c.onchange=()=>{CONFIG[k]=c.checked;save();guidesCss()};l.append(c," "+t);p.append(l)});
 bt("全域位置回到版型原位",()=>{Object.assign(CONFIG,{posAnchor:"",posX:0,posY:0});cur=-2;save();panel()});
 bt("把目前全域位置寫入「沒有自訂位置」的句子",bakePos,"把「全域錨點＋微調」寫成這些句子各自的 ^位置:X:Y，並把全域微調歸零（畫面不變）。已有自訂位置的句子不動。之後用編輯器的「匯出帶標記的 SRT」存檔");
 bt("清除所有句子的位置",clearPos,"移除每句的 ^位置 標記（含 ^auto），全部改為跟隨全域")}
/* 位置寫入／清除：只改記憶體中的字幕；要存檔請用編輯器的「匯出帶標記的 SRT」 */
function refreshEditor(){$("#edm")&&edRender()}   /* 字幕被外部改動（載入／復原／批次）後，重畫編輯器列表與詳細欄，保留捲動與選取 */
function bakePos(){
 const g=CONFIG.posAnchor||"",gx=+CONFIG.posX||0,gy=+CONFIG.posY||0;
 if(!subs.length)return;
 if(!g&&!gx&&!gy)return note("全域位置是「版型原位」且微調為 0，沒有可寫入的內容");
 if(!confirm("會把目前的全域位置（錨點＋水平／垂直微調）寫入「沒有自訂位置」的句子，並把全域微調歸零，畫面看起來不變。已有自訂位置的句子不動。確定嗎？"))return;
 let n=0;pushHist();
 subs.forEach((x,i)=>{if(x.pos)return;x.pos=[g,...(gx||gy?[r2p(gx),r2p(gy)]:[])].join(":");if(x.pos)x.auto=false;n++;edSync(i)});
 Object.assign(CONFIG,{posX:0,posY:0});cur=-2;save();panel();
 note("已把全域位置寫入 "+n+" 句（全域微調已歸零；錨點保留）。請用編輯器的「匯出帶標記的 SRT」存檔")}
function clearPos(){
 const n=subs.filter(x=>x.pos).length;
 if(!n)return note("沒有句子帶位置標記");
 if(!confirm("會清除 "+n+" 句的 ^位置 標記（含 ^auto），全部改為跟隨全域。確定嗎？"))return;
 pushHist();subs.forEach(x=>x.pos="");cur=-2;refreshEditor();
 note("已清除 "+n+" 句的位置標記，全部跟隨全域。請用編輯器的「匯出帶標記的 SRT」存檔")}
function bgPanel(p){secAnchor(p,"bg");
 const h=document.createElement("label");h.innerHTML="<b>── 背景與亮度 ──</b>";h.style.marginTop="14px";p.append(h);
 const sel=(k,n,opts)=>{const l=document.createElement("label");l.textContent=n;const s=document.createElement("select");s.style.width="100%";
  opts.forEach(([v,t])=>{const o=document.createElement("option");o.value=v;o.textContent=t;s.append(o)});s.value=CONFIG[k];s.onchange=()=>{CONFIG[k]=s.value;bgCss();save()};p.append(l,s)};
 const col=(k,n)=>{const l=document.createElement("label");l.textContent=n;const i=document.createElement("input");i.type="color";i.dataset.k=k;i.value=CONFIG[k];i.oninput=()=>{CONFIG[k]=i.value;css();cur=-2;save()};p.append(l,i)};
 const rng=(k,n,a,b,s)=>{const l=document.createElement("label"),i=document.createElement("input"),v=document.createElement("b");l.textContent=n+"：";v.textContent=CONFIG[k];l.append(v);
  Object.assign(i,{type:"range",min:a,max:b,step:s,value:CONFIG[k]});i.oninput=()=>{CONFIG[k]=+i.value;v.textContent=i.value;bgCss();save()};p.append(l,i)};
 const chk=(k,n)=>{const l=document.createElement("label"),i=document.createElement("input");i.type="checkbox";i.id="chk_"+k;i.checked=!!CONFIG[k];i.onchange=()=>{CONFIG[k]=i.checked;bgCss();save()};l.append(i," "+n);p.append(l)};
 sel("bgMode","背景模式",[["gradient","漸層（流動）"],["solid","純色"],["transparent","透明（無背景）"]]);
 col("bgColor","純色背景色");col("maskColor","遮罩顏色（深淺見「背景暗度」）");
 rng("brightness","畫面亮度%",50,150,5);
 rng("glowAcc","強調色背景光暈 %（0＝關閉）",0,60,1);
 rng("vidBright","影片亮度%",30,200,5);rng("vidContrast","影片對比%",30,200,5);rng("vidSat","影片飽和%",0,200,5);rng("vidBlur","影片模糊(px)",0,30,1);
chk("textShadow","文字柔和陰影（提升可讀性）");
 {const sr=(k,n,a,b,st)=>{const l=document.createElement("label"),i=document.createElement("input"),v=document.createElement("b");l.textContent="　"+n+"：";v.textContent=CONFIG[k];l.append(v);Object.assign(i,{type:"range",min:a,max:b,step:st,value:CONFIG[k]});
   i.oninput=()=>{CONFIG[k]=+i.value;v.textContent=i.value;if(!CONFIG.textShadow){CONFIG.textShadow=true;const t=document.getElementById("chk_textShadow");if(t)t.checked=true}bgCss();save()};p.append(l,i)};
  sr("shAlpha","陰影濃度 %",0,100,5);sr("shBlur","陰影模糊（畫面高度 %）",0,5,.1);sr("shX","陰影水平偏移",-3,3,.1);sr("shY","陰影垂直偏移",-3,3,.1);sr("shLayers","陰影疊加層數（越多越濃）",1,4,1);
  col("shColor","　陰影顏色");
  const l=document.createElement("label"),i=document.createElement("input");i.type="checkbox";i.checked=!!CONFIG.ghostOn;i.onchange=()=>{CONFIG.ghostOn=i.checked;cur=-2;save()};l.append(i," 自訂「色差／glitch」殘影顏色（預設：粉紅／青、紅／藍）");p.append(l);
  col("ghostA","　殘影顏色 A");col("ghostB","　殘影顏色 B")}
 {const l=document.createElement("label"),i=document.createElement("input");i.type="checkbox";i.checked=CONFIG.waterRefract!==false;i.onchange=()=>{CONFIG.waterRefract=i.checked;save();cur=-2};l.append(i," 水波折射（ripple-pool，需 WebGL2）");p.append(l)}
 chk("alphaOnly","只輸出字（透明；預覽顯示棋盤格）");
}
function fonts(){const s=$("#fsel");s.innerHTML="";Object.keys(FONTS).forEach(k=>{const o=new Option(k+"　靠近 Aa 123",k);o.style.fontFamily=FONTS[k];s.add(o)});s.value=CONFIG.font}
const FONTBUF=new Map();   /* 自訂字體原始位元組（匯出渲染專案用；鍵＝檔名去副檔名，與 FONTS 相同） */
async function addFont(name,buf,keep){try{const ff=new FontFace(name,buf);await ff.load();document.fonts.add(ff);FONTBUF.set(name,buf);FONTS[name]=`"${name}",`+FONTS.明體;fonts();if(!keep){$("#fsel").value=name;CONFIG.font=name;note("字體已載入："+name)}cur=-2}catch(e){alert("字體載入失敗："+e.message)}}
/* IndexedDB 保存上傳字體，下次自動載入 */
const db=new Promise(r=>{try{const q=indexedDB.open("klfonts",1);q.onupgradeneeded=()=>q.result.createObjectStore("f");q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}});
async function idbPut(k,v){const d=await db;if(d)d.transaction("f","readwrite").objectStore("f").put(v,k)}
db.then(d=>{if(!d)return;const s=d.transaction("f").objectStore("f"),c=s.openCursor();c.onsuccess=()=>{const r=c.result;if(r){addFont(r.key.replace(/\.\w+$/,""),r.value,true);r.continue()}}});
function hex6(c,fb){const x=hex6.x||(hex6.x=document.createElement("canvas").getContext("2d")),S="#010203";x.fillStyle=S;x.fillStyle=String(c==null?"":c).trim();let v=x.fillStyle;if(v===S&&!/^#010203$/i.test(String(c).trim()))return fb;if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();const m=/^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);return m?"#"+[1,2,3].map(i=>(+m[i]).toString(16).padStart(2,"0")).join(""):fb}
function css(){CONFIG.color=hex6(CONFIG.color,"#ffffff");CONFIG.accent=hex6(CONFIG.accent,"#7aa8ff");CONFIG.shColor=hex6(CONFIG.shColor,"#000000");CONFIG.ghostA=hex6(CONFIG.ghostA,"#ff285a");CONFIG.ghostB=hex6(CONFIG.ghostB,"#00dcff");document.querySelectorAll("#panel input[type=color][data-k]").forEach(i=>{const v=CONFIG[i.dataset.k];if(v&&i.value!==v)i.value=v});document.documentElement.style.setProperty("--c",CONFIG.color);document.documentElement.style.setProperty("--a",CONFIG.accent);$("#mask").style.background=`rgba(${rgbOf(CONFIG.maskColor)},${CONFIG.dim/100})`;bgCss()}
function rgbOf(h){h=/^#[0-9a-f]{6}$/i.test(h||"")?h:"#000000";return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(",")}
function isChroma(){return document.documentElement.classList.contains("chroma")}
function toneCss(){const T=RENDER?document.body:$("#stage");if(!RENDER)document.body.style.filter="";if(isChroma()){T.style.filter="";return}const f=[CONFIG.tone||"",(+CONFIG.brightness||100)!==100?`brightness(${CONFIG.brightness}%)`:"",(+CONFIG.beatHue>0||bfxHueF)&&!isRec()?"hue-rotate(var(--bhue,0deg))":""].filter(Boolean).join(" ");T.style.filter=f}
function shCss(){const c=CONFIG,n=Math.max(1,Math.min(4,Math.round(+c.shLayers||1))),a=Math.max(0,Math.min(1,(+c.shAlpha)/100)),one=`${+c.shX||0}cqh ${+c.shY||0}cqh ${Math.max(0,+c.shBlur||0)}cqh rgba(${rgbOf(hex6(c.shColor,"#000000"))},${a})`;document.documentElement.style.setProperty("--tsh",Array(n).fill(one).join(","));document.documentElement.style.setProperty("--dsh",Array(n).fill(`drop-shadow(${+c.shX||0}cqh ${+c.shY||0}cqh ${Math.max(0,+c.shBlur||0)}cqh rgba(${rgbOf(hex6(c.shColor,"#000000"))},${a}))`).join(" "))}
function bgCss(){shCss();const c=CONFIG,r=document.documentElement,bg=$("#bg");
 if(c.bgMode==="solid"){bg.style.background=c.bgColor;bg.style.animation="none"}else{bg.style.background="";bg.style.animation=""}
 const vd=c.vidBright==100&&c.vidContrast==100&&c.vidSat==100&&!+c.vidBlur;const vf=vd?"":`brightness(${c.vidBright}%) contrast(${c.vidContrast}%) saturate(${c.vidSat}%) blur(${c.vidBlur}px)`;m.style.filter=vf;const mi=document.getElementById("mimg");if(mi)mi.style.filter=vf;
 r.classList.toggle("nobg",c.bgMode==="transparent"||!!c.alphaOnly);r.classList.toggle("alpha",!!c.alphaOnly);
 const ck=/^#[0-9a-f]{6}$/i.test(c.chroma||"")?c.chroma:"";r.classList.toggle("chroma",!!ck);if(ck)r.style.setProperty("--ck",ck);
 document.body.classList.toggle("tshadow",!!c.textShadow);toneCss()}
function save(){try{localStorage.setItem(LS_CFG,JSON.stringify(CONFIG))}catch(e){}}
$("#unlock").onclick=()=>{CONFIG.lock="";cur=-2;save();panel()};
$("#tg").onclick=()=>$("#panel").classList.toggle("off");
