/* ===== [RAND] 逐句「隨機＋適配」：句子編輯器的 🎲（版型／進退場／持續特效／場景層）。
   入口：edRandomize(索引陣列,選項)。單句按鈕在編輯器詳細欄「動畫」群組，批次按鈕在批次區（勾選的句子）；選項 edRandOpt 由兩處共用。
   結果只是寫進該句的標記欄位（lay／en／ex／fx／scene），所以匯出 SRT、project.json、離線渲染完全沿用既有機制；本檔不碰渲染、RENDER 時不會被呼叫。
   這是「編輯時的動作」，可以用 Math.random（和 12-ui-editor 的全域 randomize 一樣）；渲染結果仍是標記的純函數，不受影響。
   「適配」＝下面 RND_* 表＋ rndFit() 規則（全是字串清單，空白分隔）。新增版型／場景／特效後請回來補表（見 CLAUDE.md「新增項目要補的表」）；
   沒補也不會壞：場景未歸類＝當 neutral、特效未歸類＝當 calm 且不互斥、版型未列＝一般版型；selfCheck() 會列出沒歸類的場景與特效。
   初版規則偏保守、只依名稱／層／成本／程式碼可確認的事實制定，並未逐一目視確認，請以縮圖（🖼）與實際播放驗收後再調整表。 ===== */
const RND_SCN_TH={   /* 場景主題：neutral＝任何版型都能搭；tech／grunge＝只和 RND_LAY_TH 指定主題的版型搭 */
 neutral:"halftone dots checker burst radial-rects flow-lines stripes hatch diag-split blocks breathing-blocks squares glow-ring rings pulse-circle color-wash gradient-fade pink-stripes diag-fill diag-structure organic-blob edge-clouds scattered-shapes diamond-shapes shadow-shapes balancing-circles web-lines cross-pattern triangle-grid pink-grid jigsaw-grid texture-bg star-trail light-spot screen-border scalloped-border planet",
 tech:"perspective-grid glitch-bars guides dashed-lines ruler target crop-marks crosshair dimension-lines edge-ticks hud-corners hud-info hud-status data-monitors pixel-window desktop-icon pixel-bg",
 grunge:"smear-brush paper-tear blood-splatter crime-tape"};
const RND_LAY_TH={   /* 版型除了 neutral 之外還接受哪種場景主題 */
 tech:"glitch hud-frame laser-scan split-flap typewriter constellation danmaku formula",
 grunge:"ink-bleed handwrite marker collage polaroid page-flip annotate hanko scatter crayon-shatter victim-outline shatter-text noise-text"};
const RND_SPARSE="ripple-pool particle-form constellation";   /* 自己就是滿畫面特效的版型（再加上 FULLBLEED）：只配「文字之下」的場景，不配蓋在文字上的 over 場景 */
const RND_TEXT_CANVAS="particle-form ripple-pool";             /* 文字畫在 canvas 上：要 DOM 文字的特效（RND_FX_DOM）對它們沒有作用 */
const RND_STRONG_LAY="slam bounce glitch flash-words zoom-tunnel danmaku shatter-text noise-text scatter falling crayon-shatter";   /* 高能量版型：才會配 RND_FX_STRONG */
const RND_FX_STRONG="shake flicker rainbow chromatic stopmotion drum beat-jump";   /* 強烈特效（閃爍、抖動、變色、重拍彈跳）：只配高能量版型 */
const RND_FX_DOM="gradient-flow chromatic outline-pulse track-breathe highlight-word focus-rack";   /* 只作用在 DOM 文字（找 .ch 或帶 font-family 的元素） */
const RND_FX_GRP={cam:"breathe zoom-slow cam-pull cam-pan-l cam-pan-r cam-tilt-up pulse heartbeat drum jelly beat-jump small-circle",color:"rainbow gradient-flow chromatic shimmer outline-pulse",char:"wave track-breathe focus-rack highlight-word noise-drift",jitter:"shake flicker stopmotion",rot:"slow-rotate sway-char"};   /* 同組互斥（float 單獨一組）。cam＝對整句容器動 scale／translate 的特效：同屬性的動畫會互相覆蓋，所以一次只配一個 */
const RND_NEED_SUB="ruby footnote";   /* 版型自己畫副文（SUB_OWN）：這句有副文（||）才會被抽到；沒有副文時 ruby 只剩小圓點、footnote 沒註腳 */
const RND_NO_EN="slam bounce";   /* build() 不套用這些版型的 en（見 05-build.js），隨機時進場留空，不寫沒用的標記 */
const edRandOpt={lay:true,anim:true,fx:true,scn:true,lab:false};   /* 隨機哪些內容；lab＝含實驗室版型與場景 */

const rndSet=s=>new Set(String(s).split(/\s+/).filter(Boolean));
const rndPick=(a,rng)=>a[Math.floor((rng||Math.random)()*a.length)];
/* 某個版型的適配條件（純函數，可單獨測試）：accept＝接受的場景主題、sparse＝只配 under、strong＝可配強烈特效、textCanvas＝文字在 canvas */
function rndFit(lay){const acc=new Set(["neutral"]);Object.keys(RND_LAY_TH).forEach(t=>{if(rndSet(RND_LAY_TH[t]).has(lay))acc.add(t)});
 return{accept:acc,sparse:rndSet(RND_SPARSE).has(lay)||FULLBLEED.has(lay),strong:rndSet(RND_STRONG_LAY).has(lay),textCanvas:rndSet(RND_TEXT_CANVAS).has(lay),noEn:rndSet(RND_NO_EN).has(lay)}}
const rndSceneTh=n=>Object.keys(RND_SCN_TH).find(t=>rndSet(RND_SCN_TH[t]).has(n))||"neutral";
/* 版型：排除實驗室（除非 o.lab）、排除這句目前的版型與前一句的版型（至少有別的可選時） */
function rndLayout(x,prevLay,o,rng){const ns=rndSet(RND_NEED_SUB),p=LAYOUTS.filter(l=>(o.lab||!LAB_LAYOUTS.has(l))&&!(ns.has(l)&&!x.sub)),q=p.filter(l=>l!==x.lay&&l!==prevLay);return rndPick(q.length?q:p,rng)}
/* 場景層：1～2 層（不超過 CONFIG.sceneMax）；第一層取 under，第二層優先取 over（不是 sparse 版型時），否則取不同群組的 under；成本總和不超過 CONFIG.sceneBudget；同群組不重複。
   回傳新的場景字串（保留這句原有的 bfx-* 節拍後製標記），沒有可選的就回傳 null（呼叫端不動這句的場景）。 */
function rndScene(x,lay,o,rng){const F=rndFit(lay),mx=Math.max(1,Math.round(+CONFIG.sceneMax||3)),bud=Math.max(1,+CONFIG.sceneBudget||6);
 const ok=n=>{const S=SCENES[n];return S&&(o.lab||!S.lab)&&F.accept.has(rndSceneTh(n))&&!(F.sparse&&S.layer==="over")};
 const pickL=[],used=new Set();let cost=0;const take=n=>{const S=SCENES[n];pickL.push(n);used.add(S.grp);cost+=SCENE_COST[S.cost]||1};
 const fits=(n)=>!used.has(SCENES[n].grp)&&cost+(SCENE_COST[SCENES[n].cost]||1)<=bud;
 const under=SCENE_NAMES.filter(n=>ok(n)&&SCENES[n].layer==="under"),over=SCENE_NAMES.filter(n=>ok(n)&&SCENES[n].layer==="over");
 const first=[...under,...over].filter(fits);if(!first.length)return null;
 const u1=under.filter(fits);take(rndPick(u1.length?u1:over.filter(fits),rng));   /* 第一層：優先 under（不蓋文字） */
 if(Math.min(mx,2)>1&&(rng||Math.random)()<.5){const o2=SCENES[pickL[0]].layer==="over"?[]:over.filter(fits),c=o2.length?o2:under.filter(fits);if(c.length)take(rndPick(c,rng))}   /* 第二層：優先 over，否則不同群組的 under */
 const keep=String(x.scene||"").split(",").filter(t=>/^bfx-/.test(t));return[...pickL,...keep].join(",")}
/* 持續特效：1～2 個（單句上限 3，見 build()）；強烈特效只給高能量版型；要 DOM 文字的特效不給文字在 canvas 的版型；同組互斥 */
function rndFx(lay,o,rng){const F=rndFit(lay),strong=rndSet(RND_FX_STRONG),dom=rndSet(RND_FX_DOM),grp={};Object.keys(RND_FX_GRP).forEach(g=>rndSet(RND_FX_GRP[g]).forEach(f=>grp[f]=g));
 let c=FXS.filter(f=>(F.strong||!strong.has(f))&&!(F.textCanvas&&dom.has(f)));const out=[],used=new Set();
 const n=(rng||Math.random)()<.6?1:2;
 for(let k=0;k<n&&c.length;k++){const f=rndPick(c,rng);out.push(f);used.add(grp[f]||f);c=c.filter(z=>!used.has(grp[z]||z)&&z!==f)}
 return out.join(",")}
/* 對一句做隨機。prev＝前一句（避免連續同版型）。回傳「有變動的項目」說明（給提示用）。 */
function rndSentence(x,prev,o,rng){const ch=[];
 if(o.lay){x.lay=rndLayout(x,prev&&prev.lay,o,rng);x.auto=false;ch.push("版型")}
 const lay=layOf(x),F=rndFit(lay);
 if(o.anim){x.en=F.noEn?"":rndPick(ENTERS,rng);x.ex=rndPick(EXITS,rng);x.auto=false;ch.push("進退場")}
 if(o.fx){x.fx=rndFx(lay,o,rng);x.auto=false;ch.push("特效")}
 if(o.scn){const s=rndScene(x,lay,o,rng);if(s!==null){x.scene=s;ch.push("場景")}}
 reparse(x);return ch}
/* 編輯器入口：list＝句子索引陣列；整批只做一次 pushHist，一次復原就回到按之前 */
function edRandomize(list,o,rng){o=o||edRandOpt;
 if(!list.length)return note("先在編輯器勾選要隨機的句子");
 if(!o.lay&&!o.anim&&!o.fx&&!o.scn)return note("至少勾一項要隨機的內容（版型／進退場／持續特效／場景層）");
 pushHist();list.forEach(i=>{const x=subs[i];if(x)rndSentence(x,subs[i-1],o,rng)});
 cur=-2;edRender();posRef&&posRef();
 note("已隨機 "+list.length+" 句"+(CONFIG.lock?"（注意：目前鎖定版型，畫面版型不會變）":"")+(o.scn&&CONFIG.sceneAll?"（隨機場景會取代全域底層「"+CONFIG.sceneAll+"」）":"")+"；可復原。匯出帶標記的 SRT 可存檔")}
function edRandBoxes(parent){const w=edMk("div","edbtns");
 [["lay","版型"],["anim","進退場"],["fx","持續特效"],["scn","場景層"],["lab","含實驗室"]].forEach(([k,t])=>{const l=edMk("label"),c=edMk("input");c.type="checkbox";c.checked=!!edRandOpt[k];c.onchange=()=>{edRandOpt[k]=c.checked};
  l.title=k==="lab"?"預設不含實驗室版型與場景（尚在試驗、未寫進正式規格書）":k==="scn"?"隨機的場景層會取代這句原本的場景（bfx-* 節拍後製保留）；留空的句子才跟隨全域底層":k==="fx"?"依版型挑選：強烈特效（抖動／閃爍／變色）只配高能量版型":"";
  l.append(c,t);w.append(l)});parent.append(w)}
/* selfCheck 用：表裡有打錯的名稱＝錯誤；沒歸類的場景／特效只提示（不算錯） */
function rndCheck(){const out=[],L=new Set(LAYOUTS),S=new Set(SCENE_NAMES),F=new Set(FXS),info=[];
 const chk=(tab,set,lab)=>Object.keys(tab).forEach(k=>rndSet(tab[k]).forEach(n=>set.has(n)||out.push("隨機適配表 "+lab+"."+k+" 有未登記的名稱："+n)));
 chk(RND_SCN_TH,S,"RND_SCN_TH");chk(RND_LAY_TH,L,"RND_LAY_TH");chk(RND_FX_GRP,F,"RND_FX_GRP");
 [["RND_SPARSE",RND_SPARSE,L],["RND_TEXT_CANVAS",RND_TEXT_CANVAS,L],["RND_STRONG_LAY",RND_STRONG_LAY,L],["RND_NO_EN",RND_NO_EN,L],["RND_NEED_SUB",RND_NEED_SUB,L],["RND_FX_STRONG",RND_FX_STRONG,F],["RND_FX_DOM",RND_FX_DOM,F]].forEach(([k,s,set])=>rndSet(s).forEach(n=>set.has(n)||out.push("隨機適配表 "+k+" 有未登記的名稱："+n)));
 const seen={};Object.keys(RND_SCN_TH).forEach(t=>rndSet(RND_SCN_TH[t]).forEach(n=>{seen[n]&&out.push("場景同時列在兩個主題："+n);seen[n]=1}));
 const noS=SCENE_NAMES.filter(n=>!seen[n]),g=new Set();Object.keys(RND_FX_GRP).forEach(k=>rndSet(RND_FX_GRP[k]).forEach(n=>g.add(n)));rndSet(RND_FX_STRONG).forEach(n=>g.add(n));rndSet(RND_FX_DOM).forEach(n=>g.add(n));g.add("float");
 const noF=FXS.filter(n=>!g.has(n));
 noS.length&&info.push("這些場景沒歸類（隨機時當 neutral）："+noS.join(" "));noF.length&&info.push("這些特效沒歸類（隨機時當 calm、不互斥）："+noF.join(" "));
 info.length&&console.info("[selfCheck] 隨機適配表："+info.join("；"));return out}
