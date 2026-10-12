/* ===== [EDITOR] 句子編輯器：上方工具列＋左側句子列表＋右側詳細欄（Aegisub 式）。
   本檔原本在 13-export.js 內，現獨立成檔（檔名排序在 13-export.js 之前；本檔只在使用者開啟編輯器時才執行，不依賴載入順序）。
   結構：
     editor()        開／關編輯器，建立外框（工具列 edToolbar、批次區 edBatchBox、列表 .edlist、詳細欄 .edside）
     edRender()      重畫列表與詳細欄（保留捲動與選取）。字幕被外部改動後（載入／復原／隨機化／批次）呼叫 refreshEditor() 即可
     edRowFill(i)    只更新第 i 列（時間、文字、標籤）；edRowUpdate(i)＝edRowFill＋同步詳細欄的位置欄位（edSync 轉呼叫它）
     edDetail(i)     詳細欄：文字・時間／動畫／樣式・字體／場景層／位置／風格包 六個群組
     applyPackTo()   把風格包的「版型＋場景＋節拍後製＋字體」套到指定句子（逐句版本；全域設定仍用面板）
     subsReplaced()  字幕整份被換掉（載入 SRT／範例／匯入專案）時呼叫：清勾選、重設選取、重畫編輯器
   慣例：所有改動都走 E(fn,key)＝pushHist→改欄位→cur=-2→更新該列，所以每個動作都能復原；改文字或版型後用 reparse(x)（見 12-ui-editor.js）重算 plain／br／hl。 ===== */
const edOpen={txt:1,anim:1,sty:1,scn:0,pos:0,pack:1},   /* 詳細欄各群組的展開狀態（編輯器關掉再開仍記得） */
 edPackOpt={lay:true,scene:true,font:true};   /* 「套用風格包」要套哪些內容 */
let edFollow=true,edForce=false,edCurUI=null,edCurI=-1,edTmr=0;
const edMk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fmtT=t=>{const m=Math.floor(t/60),s=(t-m*60).toFixed(2);return m+":"+(s<10?"0":"")+s};
const defLay=x=>x.br&&x.br.length?"split":"lowerleft";
const edClean=s=>String(s).replace(/\r/g,"").replace(/\|{2,}/g,"|").replace(/\n\s*\n+/g,"\n").trim();   /* 空行會讓 SRT 斷句、|| 是副文分隔，所以先清掉 */
const ED_COPY=["lay","en","ex","fx","st","font","scene","pos"];   /* 「外觀」＝這些欄位（不含文字與時間） */

/* ---------- 列表 ---------- */
function edTags(i){const x=subs[i],a=[],pv=subs[i-1];
 a.push(x.auto?["a","自動"]:["l",x.lay]);
 if(x.fx)a.push(["",x.fx.split(",")[0]+(x.fx.includes(",")?"+":"")]);
 if(x.st)a.push(["s","@"+x.st.split(",")[0]+(x.st.includes(",")?"+":"")]);
 if(x.scene){const t=x.scene.split(",").filter(z=>!/^(bfx-|none)/.test(z));a.push(["c","場景 "+(t.length?t[0].split(":")[0]+(t.length>1?"+"+(t.length-1):""):"…")])}
 if(x.pos)a.push(["p","位置 "+x.pos]);
 if(x.font)a.push(["","字 "+x.font]);
 if(pv&&x.s<pv.e-.001)a.push(["w","⚠ 重疊"]);
 return a}
function edRowFill(i){const r=EDR[i];if(!r)return;const x=subs[i];
 r.t.textContent=fmtT(x.s)+" – "+fmtT(x.e);r.x.textContent=x.raw.replace(/\s+/g," ").trim();
 r.g.textContent="";edTags(i).forEach(([c,t])=>r.g.append(edMk("span","tg "+c,t)));r.r.title=(tag(x)+x.raw).replace(/\n/g," ")}
function edMarkSel(i,scroll){EDR.forEach((r,k)=>r&&r.r.classList.toggle("sel",k===i));if(scroll&&EDR[i])EDR[i].r.scrollIntoView({block:"nearest"})}
function edPick(i){edForce=true;try{jumpTo(i)}finally{edForce=false}}   /* 使用者點選：跳到該句並暫停（jumpTo→setSel→edOnSel→edSelect） */
edOnSel=i=>{   /* 播放中選取句改變：跟隨播放；正在詳細欄打字時不搶走編輯中的句子 */
 if(!edForce){if(!edFollow)return;const a=document.activeElement,sd=document.querySelector("#edm .edside");if(sd&&a&&sd.contains(a)&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return}
 edSelect(i)};
function edSelect(i){if(!$("#edm"))return;edMarkSel(i,1);if(i!==edCurI||!edCurUI)edDetail(i)}

/* ---------- 重畫 ---------- */
function edRender(){const d=$("#edm");if(!d)return;clearTimeout(edTmr);
 const ls=d.querySelector(".edlist"),keep=ls.scrollTop;ls.textContent="";EDR.length=0;
 if(!subs.length){ls.append(edMk("div","edhint","尚無字幕：用頂欄「載入 ▾」載入 SRT 或範例。"));edDetail(-1);cntUpd();return}
 if(selIdx>=subs.length)selIdx=subs.length-1;if(selIdx<0)selIdx=0;
 subs.forEach((x,i)=>{const r=edMk("div","er"),ck=edMk("input");ck.type="checkbox";ck.checked=EDSEL.has(i);
  ck.onclick=ev=>{ev.stopPropagation();const on=ck.checked;
   if(ev.shiftKey&&lastCk>=0){for(let k=Math.min(lastCk,i);k<=Math.max(lastCk,i);k++){on?EDSEL.add(k):EDSEL.delete(k);if(EDR[k])EDR[k].ck.checked=on}}else on?EDSEL.add(i):EDSEL.delete(i);
   lastCk=i;cntUpd()};
  const t=edMk("span","t"),tx=edMk("span","x"),g=edMk("span","g");r.append(ck,edMk("span","n",i+1),t,tx,g);r.onclick=()=>edPick(i);
  EDR[i]={r,ck,t,x:tx,g};ls.append(r);edRowFill(i)});
 ls.scrollTop=keep;edMarkSel(selIdx,0);edDetail(selIdx);cntUpd();histBtn()}
function edRowUpdate(i){edRowFill(i);if(edCurUI&&edCurUI.i===i)edCurUI.syncPos()}   /* 面板／拖曳／方向鍵改了位置後（edSync）同步這一列與詳細欄 */
function subsReplaced(){EDSEL.clear();lastCk=-1;selIdx=subs.length?0:-1;posRef&&posRef();histBtn();edRender()}

/* ---------- 風格包：逐句套用 ---------- */
/* 一個風格包拆成可逐句寫進 SRT 的三樣東西：版型（版型池輪流，單句重按會換下一個）、場景層＋節拍後製（bfx-*）、字體。其餘（色彩、粒子、後製…）屬全域，請用面板整套套用 */
function packPieces(name,i,cur){const P=PRESETS[name];if(!P)return null;
 const pool=(P.layoutPool||"").split(",").filter(l=>LAYOUTS.includes(l)),k=pool.indexOf(cur);
 const bf=[["beatShake","shake"],["beatZoom","zoom"],["beatTilt","tilt"],["beatHue","hue"]].filter(([q])=>P[q]).map(([q,n])=>"bfx-"+n+":"+P[q]);
 return{lay:pool.length?(cur!==undefined&&k>=0?pool[(k+1)%pool.length]:pool[i%pool.length]):"",scene:[P.sceneAll||"",...bf].filter(Boolean).join(","),font:P.font&&FONTS[P.font]?P.font:""}}
function applyPackTo(list,name,o){o=o||edPackOpt;
 if(!PRESETS[name])return note("找不到風格包："+name);if(!list.length)return note("先在編輯器勾選要套用的句子");
 if(!o.lay&&!o.scene&&!o.font)return note("至少勾一項要套用的內容（版型／場景／字體）");
 pushHist();
 list.forEach(i=>{const x=subs[i];if(!x)return;const pc=packPieces(name,i,list.length===1?x.lay:undefined);
  if(o.lay&&pc.lay){x.lay=pc.lay;x.auto=false}
  if(o.scene&&pc.scene)x.scene=pc.scene;
  if(o.font&&pc.font)x.font=pc.font;
  reparse(x)});
 cur=-2;edRender();posRef&&posRef();
 note("已把風格包「"+name+"」套到 "+list.length+" 句"+(CONFIG.lock?"（注意：目前鎖定版型，版型不會生效）":"")+"；色彩／粒子等全域設定請用面板整套套用。匯出帶標記的 SRT 可存檔")}
function edPackBtns(parent,getList){   /* 風格包按鈕列（詳細欄與批次區共用）：按一下＝套用 */
 const w=edMk("div","packs");[...STYLE_PACKS].forEach(n=>{const P=PRESETS[n],b=edMk("button","",n);b.type="button";
  b.title=n+"｜字體 "+(P.font||"－")+"｜版型池 "+(P.layoutPool||"－")+"｜場景 "+(P.sceneAll||"－");b.onclick=()=>applyPackTo(getList(),n,edPackOpt);b.dataset.th="pack:"+n;w.append(b)});parent.append(w)}
function edPackOptBoxes(parent){const w=edMk("div","edbtns");
 [["lay","版型"],["scene","場景＋節拍後製"],["font","字體"]].forEach(([k,t])=>{const l=edMk("label"),c=edMk("input");c.type="checkbox";c.checked=!!edPackOpt[k];c.onchange=()=>{edPackOpt[k]=c.checked};l.append(c,t);w.append(l)});parent.append(w)}

/* ---------- 詳細欄 ---------- */
function edDetail(i){const d=$("#edm"),sd=d&&d.querySelector(".edside");if(!sd)return;
 clearTimeout(edTmr);const top=edCurI===i?sd.scrollTop:0;sd.textContent="";edCurUI=null;edCurI=i;
 const x=subs[i];if(!x){sd.append(edMk("div","edhint","選一句開始編輯。"));return}
 const E=(fn,key)=>{if(subs[i]!==x)return false;pushHist(key);fn();cur=-2;edRowFill(i);posRef&&posRef();return true},   /* 唯一的寫入入口 */
  G=(id,title,build)=>{const g=edMk("details"),b=edMk("div","gb");g.open=!!edOpen[id];g.append(edMk("summary","",title),b);g.addEventListener("toggle",()=>{edOpen[id]=g.open?1:0});build(b);sd.append(g)},
  F=(label,el,parent)=>{const f=edMk("div","edf");if(label)f.append(edMk("label","",label));f.append(el);parent.append(f);return f},
  inp=(t,v,ph)=>{const e=edMk("input");e.type=t;e.value=v==null?"":v;if(ph)e.placeholder=ph;return e},
  btn=(t,f,tt)=>{const b=edMk("button","",t);b.type="button";if(tt)b.title=tt;b.onclick=f;return b},
  sel=(opts,val,onch,blank)=>{const e=edMk("select");if(blank!=null)e.add(new Option(blank,""));opts.forEach(o=>Array.isArray(o)?e.add(new Option(o[1],o[0])):e.add(new Option(o,o)));e.value=val||"";e.onchange=()=>onch(e.value);return e},
  debounce=f=>{clearTimeout(edTmr);edTmr=setTimeout(f,300)};
 /* 標頭：第幾句、上一句／下一句 */
 {const hd=edMk("div","hd"),nv=edMk("span");hd.append(edMk("span","",`第 ${i+1}／${subs.length} 句`));
  nv.append(btn("◀",()=>subs[i-1]&&edPick(i-1),"上一句"),btn("▶",()=>subs[i+1]&&edPick(i+1),"下一句"));hd.append(nv);sd.append(hd)}
 if(CONFIG.lock)sd.append(edMk("div","edhint edwarn","目前鎖定版型「"+CONFIG.lock+"」：所有句子的版型都會被它蓋掉（頂欄可解除）。"));
 /* 1. 文字・時間 */
 G("txt","文字・時間",b=>{
  const ta=edMk("textarea");ta.value=x.raw.trim();
  const applyT=()=>{if(subs[i]!==x)return;const v=edClean(ta.value);if(!v){ta.style.borderColor="#e55";return note("歌詞不能是空的")}ta.style.borderColor="";if(v===x.raw.trim())return;
   E(()=>{x.raw=v;reparse(x)},"txt"+i)};
  ta.oninput=()=>debounce(applyT);ta.onchange=()=>{clearTimeout(edTmr);applyT()};
  F("歌詞（{字} 標記強調關鍵字；可換行）",ta,b);
  const sb=inp("text",x.sub,"拼音、英文、日期…");const applyS=()=>{if(subs[i]!==x)return;const v=edClean(sb.value).replace(/\n/g," ");if(v===(x.sub||""))return;E(()=>{x.sub=v},"sub"+i)};
  sb.oninput=()=>debounce(applyS);sb.onchange=()=>{clearTimeout(edTmr);applyS()};F("副文（主文下方的小字）",sb,b);
  const si=inp("number"),ei=inp("number"),info=edMk("div","edhint");[si,ei].forEach(e=>{e.step=.01;e.min=0});
  const upT=()=>{si.value=x.s.toFixed(2);ei.value=x.e.toFixed(2);const pv=subs[i-1],nx=subs[i+1],gp=(a,z)=>a<0?"重疊 "+(-a).toFixed(2):"間隔 "+a.toFixed(2);
   info.textContent="長度 "+(x.e-x.s).toFixed(2)+" 秒"+(pv?"｜與上一句"+gp(x.s-pv.e)+" 秒":"")+(nx?"｜與下一句"+gp(nx.s-x.e)+" 秒":"");
   info.classList.toggle("edwarn",!!((pv&&x.s<pv.e-.001)||(nx&&nx.s<x.e-.001)))};
  const setT=(k,v)=>{v=Math.round(parseFloat(v)*1000)/1000;if(!isFinite(v)||v<0){upT();return}const s=k==="s"?v:x.s,e=k==="e"?v:x.e;if(e<=s+.009){note("結束時間必須大於開始時間");upT();return}
   if(v===x[k]){upT();return}E(()=>{x[k]=v},"tm"+i+k);edRowFill(i-1);edRowFill(i+1);upT()};
  si.onchange=()=>setT("s",si.value);ei.onchange=()=>setT("e",ei.value);
  const r=edMk("div","edrow2");F("開始（秒）",si,r);F("結束（秒）",ei,r);b.append(r,info);upT();
  const bx=edMk("div","edbtns"),st=ev=>ev.shiftKey?.01:.1;
  bx.append(btn("開始 −",ev=>setT("s",x.s-st(ev)),"−0.1 秒；按住 Shift＝0.01"),btn("開始 ＋",ev=>setT("s",x.s+st(ev)),"＋0.1 秒；按住 Shift＝0.01"),btn("結束 −",ev=>setT("e",x.e-st(ev)),"−0.1 秒；按住 Shift＝0.01"),btn("結束 ＋",ev=>setT("e",x.e+st(ev)),"＋0.1 秒；按住 Shift＝0.01"),
   btn("開始＝現在",()=>setT("s",now()),"把開始時間設成目前播放位置（對拍用）"),btn("結束＝現在",()=>setT("e",now()),"把結束時間設成目前播放位置"),
   btn("接上句結尾",()=>subs[i-1]&&setT("s",subs[i-1].e),"開始時間＝上一句的結束"),btn("接下句開頭",()=>subs[i+1]&&setT("e",subs[i+1].s),"結束時間＝下一句的開始"));b.append(bx)});
 /* 2. 動畫 */
 G("anim","動畫",b=>{
  F("版型",thRow(sel(LAYOUTS,x.auto?"":x.lay,v=>E(()=>{x.lay=v||defLay(x);x.auto=!v;reparse(x)},"lay"+i),"（自動：依預設／版型池）"),"lay"),b);
  const r=edMk("div","edrow2");
  F("進場",sel(ENTERS,x.en,v=>E(()=>{x.en=v;if(v)x.auto=false},"en"+i),"（預設）"),r);F("退場",sel(EXITS,x.ex,v=>E(()=>{x.ex=v;if(v)x.auto=false},"ex"+i),"（預設）"),r);b.append(r);
  const fi=inp("text",x.fx,"float,shake"),setFx=v=>{E(()=>{x.fx=v;if(v)x.auto=false},"fx"+i);fi.value=v};fi.onchange=()=>setFx(fi.value.replace(/\s/g,""));
  F("持續特效（可複選）",chipBox(FXS,()=>x.fx||"",setFx,n=>"特效 ~"+n),b);F("",fi,b)});
 /* 3. 樣式・字體 */
 G("sty","樣式・字體",b=>{
  const si=inp("text",x.st,"neon,outline"),setSt=v=>{if(v.split(",").filter(Boolean).length>3){note("樣式最多 3 個");si.value=x.st||"";return false}E(()=>{x.st=v;if(v)x.auto=false},"st"+i);si.value=v;return true};
  si.onchange=()=>setSt(si.value.replace(/\s/g,""));
  F("樣式 @（最多 3 個，可疊加）",chipBox([...Object.keys(ST),...Object.keys(STC)],()=>x.st||"",v=>{setSt(v)},n=>"樣式 @"+n),b);F("",si,b);
  const fs=edMk("select"),fill=()=>{const v=x.font||"";fs.innerHTML="";fs.add(new Option("（跟隨全域字體）",""));Object.keys(FONTS).forEach(k=>fs.add(new Option(k,k)));fs.value=FONTS[v]?v:""};fill();fs.onmousedown=fill;   /* 展開前重建：之後才上傳的字體也看得到 */
  fs.onchange=()=>E(()=>{x.font=fs.value},"font"+i);F("這一句的字體",fs,b)});
 /* 4. 場景層 */
 G("scn","場景層（&）",b=>{
  const sc=inp("text",x.scene,"halftone:60,burst"),setSc=v=>{E(()=>{x.scene=v},"sc"+i);sc.value=v};sc.onchange=()=>setSc(sc.value.replace(/\s/g,""));
  sc.title="名稱[:強度]，逗號分隔，最多 "+(CONFIG.sceneMax||3)+" 層；也可寫 bfx-shake:3 這類節拍後製";F("場景層",sc,b);
  const bx=edMk("div","edbtns"),pb=btn("＋ 挑選場景",()=>openScenePop(pb,()=>x.scene||"",v=>setSc(v)),"開啟場景層挑選窗");bx.append(pb,btn("清除這句場景",()=>setSc(""),"改為跟隨全域底層"));b.append(bx);
  b.append(edMk("div","edhint","留空＝跟隨全域底層（目前："+(CONFIG.sceneAll||"無")+"）。Ctrl+K 搜尋「場景層」可一鍵套用。"))});
 /* 5. 位置 */
 G("pos","位置",b=>{
  const pS=sel([["auto","版型原位"],...Object.entries(ANCH)],"",()=>commit(),"跟隨全域"),mkN=ph=>{const e=inp("number","",ph);Object.assign(e,{step:.5,min:-100,max:100});e.title=ph+"（畫面寬／高的 %；相對這句的錨點，不與全域微調相加）";return e},pX=mkN("X%"),pY=mkN("Y%");
  const syncPos=()=>{const p=(x.pos||"").split(":");pS.value=(p[0]===""||p[0]==="auto"||ANCH[p[0]])?p[0]:"";pX.value=p[1]||"";pY.value=p[2]||""};
  const commit=()=>{const a=pS.value,xs=pX.value,ys=pY.value;E(()=>{x.pos=[a,...(xs!==""||ys!==""?[xs||0,ys||0]:[])].join(":");if(x.pos)x.auto=false},"pos"+i)};
  pX.onchange=pY.onchange=commit;syncPos();edCurUI={i,syncPos};
  F("錨點",pS,b);const r=edMk("div","edrow2");F("水平 X%",pX,r);F("垂直 Y%",pY,r);b.append(r);
  const ps=sel(POSPRE,"",v=>{if(!v)return;E(()=>{x.pos=presetPos(v,i);x.auto=false},"pos"+i);syncPos();ps.value=""},"位置預設 → 套用到這一句…");F("",ps,b);
  b.append(btn("這句回到跟隨全域",()=>{E(()=>{x.pos=""},"pos"+i);syncPos()}));
  if(FULLBLEED.has(layOf(x)))b.append(edMk("div","edhint edwarn","此版型為滿版，位置不生效。"));
  b.append(edMk("div","edhint","也可以直接在畫面上拖曳文字，或 Ctrl／⌘＋方向鍵微調。"))});
 /* 6. 風格包 */
 G("pack","風格包（一鍵套用到這一句）",b=>{
  b.append(edMk("div","edhint","勾選要套用的內容後，按風格包名稱：版型從該包的版型池挑（再按一次換下一個）、場景層＋節拍後製、字體。色彩、粒子、後製等全域項目請用面板「風格包・場景層・後製」整套套用。"));
  edPackOptBoxes(b);edPackBtns(b,()=>[i]);
  b.append(btn("這句回到自動（清除所有逐句設定）",()=>{pushHist();Object.assign(x,{auto:true,en:"",ex:"",fx:"",pos:"",st:"",font:"",scene:""});reparse(x);cur=-2;edRender();posRef&&posRef()},"清除版型、進退場、特效、位置、樣式、字體、場景；文字與時間不動"))});
 sd.scrollTop=top}

/* ---------- 工具列與批次區 ---------- */
function edToolbar(){const bar=edMk("div","edtb"),b=(t,f,c,tt)=>{const e=edMk("button",c||"",t);e.type="button";e.onclick=f;if(tt)e.title=tt;bar.append(e);return e},sep=()=>bar.append(edMk("span","sep"));
 const setCk=fn=>{EDSEL.clear();subs.forEach((x,i)=>{if(fn(x,i))EDSEL.add(i);if(EDR[i])EDR[i].ck.checked=EDSEL.has(i)});cntUpd()};
 b("切換高度",()=>{const e=$("#edm");e.style.height=e.style.height!=="46vh"?"46vh":"calc(100vh - 48px)"});b("復原",undo,"hbU");b("重做",redo,"hbR");sep();
 b("全選",()=>setCk(()=>1));b("全不選",()=>setCk(()=>0));b("勾選同版型（以目前句）",()=>{const l=subs[selIdx]?layOf(subs[selIdx]):"";setCk(x=>layOf(x)===l)});
 const c=edMk("span");c.id="edcnt";c.style.opacity=".8";bar.append(c);sep();
 const fl=edMk("label"),fc=edMk("input");fc.type="checkbox";fc.checked=edFollow;fc.onchange=()=>{edFollow=fc.checked};fl.title="播放時，詳細欄自動跟到正在播放的那一句（正在打字時不會搶走）";fl.append(fc,"跟隨播放");bar.append(fl);
 {const sp=edMk("span");sp.style.flex="1";bar.append(sp)}
 b("匯出帶標記的 SRT",exportSRT);b("⬆ 匯出…",()=>$("#exw").click(),"","你要拿去做什麼？錄製、離線 MP4、透明字層、綠幕…");
  return bar}
function edApply(fn,msg){const l=selList();if(!l.length)return note("先在編輯器勾選要套用的句子");pushHist();l.forEach((i,k)=>fn(subs[i],k,i));cur=-2;edRender();posRef&&posRef();note(msg||"已套用到 "+l.length+" 句；請用編輯器的「匯出帶標記的 SRT」存檔")}
function edBatchBox(){const dt=edMk("details","edbatch"),w=edMk("div","in"),b=(t,f,tt)=>{const e=edMk("button","",t);e.type="button";e.onclick=f;if(tt)e.title=tt;w.append(e);return e};
 dt.append(edMk("summary","","批次：套用到已勾選的句子（先用列表左側勾選框選句；Shift 連選）"),w);
 const ps=edMk("select");ps.add(new Option("位置預設…",""));POSPRE.forEach(([v,t])=>ps.add(new Option(t,v)));w.append(ps);
 b("套用預設到勾選",()=>{if(!ps.value)return note("先選一個位置預設");applyTo((y,k)=>{y.pos=presetPos(ps.value,k);y.auto=false})});
 b("把「目前這句」的位置套用到勾選",()=>{const src=subs[selIdx];if(!src)return;applyTo(y=>{y.pos=src.pos;if(y.pos)y.auto=false})});
 b("複製「目前這句」的外觀到勾選",()=>{const src=subs[selIdx];if(!src)return;edApply(y=>{if(y===src)return;ED_COPY.forEach(k=>{y[k]=src[k]});y.auto=src.auto;reparse(y)},"已把這句的外觀（版型、進退場、特效、樣式、字體、場景、位置）複製到勾選句；文字與時間不動")},"版型、進場、退場、特效、樣式、字體、場景、位置；文字與時間不動");
 w.append(edMk("span","sep"));
 const pk=edMk("select");pk.add(new Option("風格包…",""));[...STYLE_PACKS].forEach(n=>pk.add(new Option(n,n)));w.append(pk,thBtn(pk,"pack"));
 b("套用風格包到勾選",()=>{if(!pk.value)return note("先選一個風格包");applyPackTo(selList(),pk.value,edPackOpt)});edPackOptBoxes(w);w.append(edMk("span","sep"));
 b("清除勾選句子的位置",()=>applyTo(y=>{y.pos=""}));
 b("清除勾選句子的場景",()=>{const l=selList();if(!l.length)return note("先在編輯器勾選要套用的句子");clearSceneSubs(l)});
 b("清除全部句子的場景",()=>clearSceneSubs());
 return dt}

/* ---------- 編輯器本體 ---------- */
function editor(){let d=$("#edm");if(d){d.remove();edCurUI=null;edCurI=-1;edLayout();return}
 d=edMk("div");d.id="edm";d.style.height="46vh";EDR.length=0;   /* 預設半高：上半部留給預覽，方便邊看邊調 */
 const body=edMk("div","edbody"),ls=edMk("div","edlist"),sd=edMk("div","edside");ls.tabIndex=0;ls.title="點列表＝跳到該句並暫停（↑↓ 切換）；勾選框可 Shift 連選；詳細欄改的每個動作都能復原；位置與面板「這一句的位置」雙向同步";
 ls.onkeydown=e=>{if(e.key!=="ArrowDown"&&e.key!=="ArrowUp")return;e.preventDefault();const n=Math.max(0,Math.min(subs.length-1,selIdx+(e.key==="ArrowDown"?1:-1)));if(subs[n])edPick(n)};
 body.append(ls,sd);d.append(edToolbar(),edBatchBox(),body);document.body.append(d);
 edRender();histBtn();edLayout();edRO&&edRO.observe(d)}
/* 句子編輯器 × 預覽並排：編輯器開著（且高度 ≤72% 視窗）時，把預覽縮進頂欄下方、編輯器上方；錄製／離線渲染時一律還原。
   做法：在 body 設 --edt/--edh/--edr，CSS 的 #stage 與 applyStage() 依此計算可用區；沒設定時＝原本全視窗。 */
const edRO=typeof ResizeObserver==="function"?new ResizeObserver(()=>edLayout()):null;
function edLayout(){const d=$("#edm"),b=document.body,vs=["--edt","--edh","--edr"];
 const on=!RENDER&&d&&!recording&&!b.classList.contains("rec")&&d.offsetHeight>0&&d.offsetHeight<=innerHeight*.72;
 let g=$("#edgrip");
 if(d&&!recording&&!b.classList.contains("rec")){if(!g){g=document.createElement("div");g.id="edgrip";g.title="拖曳調整預覽與編輯器的比例";document.body.append(g);
   g.onpointerdown=e=>{e.preventDefault();g.setPointerCapture(e.pointerId);g.classList.add("drag");
    const mv=ev=>{const ed=$("#edm");if(ed){ed.style.height=Math.round(Math.max(140,Math.min(Math.floor(innerHeight*.7),innerHeight-ev.clientY)))+"px";edLayout()}},
     up=()=>{g.classList.remove("drag");g.removeEventListener("pointermove",mv);g.removeEventListener("pointerup",up)};g.addEventListener("pointermove",mv);g.addEventListener("pointerup",up)}}
  g.style.bottom=(d.offsetHeight-4)+"px"}else if(g)g.remove();
 const key=on?[$("#bar").offsetHeight,d.offsetHeight,innerWidth,innerHeight].join():"";
 if(key===edLayout.k)return;edLayout.k=key;
 if(on){b.style.setProperty("--edt",$("#bar").offsetHeight+"px");b.style.setProperty("--edh",d.offsetHeight+"px");b.style.setProperty("--edr","240px")}else vs.forEach(k=>b.style.removeProperty(k));
 applyStage()}
edLayout.k="";
if(!RENDER){addEventListener("resize",()=>edLayout());new MutationObserver(()=>edLayout()).observe(document.body,{attributes:true,attributeFilter:["class"]})}   /* 視窗縮放、錄製開始／結束（body.rec）時重算 */
$("#ed").onclick=editor;
