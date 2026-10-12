/* ===== [THUMBS] 縮圖預覽：版型／場景層／風格包／預設組合 的「懸停預覽」與「縮圖挑選窗」。純 UI 輔助，不碰 CONFIG／subs／畫面渲染，離線渲染（RENDER）完全不啟用。
   資料：thumbs/sheet.webp（單張精靈圖，首次需要時才載入；檔案不在就自動略過、功能照常）＋ 28-thumbs-idx.js（TH_DATA：名稱→格子位置，兩者都由 node test/make-thumbs.mjs 產生，勿手改）。
   用法（其他檔案只需這兩種，不依賴載入順序）：
     ① 任何元素加 data-th="lay:名稱｜scene:名稱｜pack:名稱｜preset:名稱" → 滑鼠停留 0.15 秒顯示預覽（chipBox(...,kind)、edPackBtns、⚡快捷選單已接好）。
     ② 下拉選單：把 select 用 thRow(select,kind) 包起來（kind＝lay／scene／pack／pre；pre＝預設組合，自動分辨風格包或一般預設）→ 多一顆 🖼 按鈕開縮圖挑選窗，
        挑選後只是改 select.value 並觸發 change，原本的 onchange 照跑；滑鼠停在 select 上也會預覽「目前選項」。
   新增版型／場景／風格包後：node test/make-thumbs.mjs → node build.mjs；漏拍的項目介面會自動略過（?check=1 的 selfCheck 會列出）。 */
var thM=null,thSt=0,thQ=[],thTimer=0,thCur=null,thTipEl=null,thPop=null;   /* thSt：0 未載入 1 載入中 2 可用 -1 檔案不存在 */
const TH_LABEL={lay:"版型",scene:"場景層",pack:"風格包",preset:"預設組合"};
function thIx(key){   /* key→精靈圖格子序號；沒有縮圖回 -1 */
 if(typeof TH_DATA==="undefined"||!TH_DATA.idx)return -1;
 if(!thM){thM=new Map();TH_DATA.idx.split(",").forEach((k,i)=>{if(k&&k!=="-")thM.set(k,i)})}
 const i=thM.get(key);return i==null?-1:i}
function thResolve(kind,v){return !v?"":kind==="pre"?(STYLE_PACKS.has(v)?"pack:":"preset:")+v:kind+":"+v}
function thFromId(id){   /* 快捷選單項目 id → 縮圖 key（沒有對應回 ""） */
 const i=id.indexOf(":"),h=id.slice(0,i),n=id.slice(i+1);if(i<0||!n)return "";
 return h==="lock"?"lay:"+n:/^scene-(global|cur|all)$/.test(h)?"scene:"+n:/^pack-(cur|all)$/.test(h)?"pack:"+n:h==="preset"?thResolve("pre",n):""}
function thMissing(){   /* 給 selfCheck：目前登記了、但沒有縮圖的項目 */
 const a=[];LAYOUTS.forEach(n=>thIx("lay:"+n)<0&&a.push("lay:"+n));SCENE_NAMES.forEach(n=>thIx("scene:"+n)<0&&a.push("scene:"+n));
 Object.keys(PRESETS).forEach(n=>{const k=thResolve("pre",n);thIx(k)<0&&a.push(k)});return a}
function thReady(cb){   /* 精靈圖確認載得到才顯示（檔案缺了就整組功能靜默略過） */
 if(thSt===2)return cb();if(thSt===-1||typeof TH_DATA==="undefined")return;
 thQ.push(cb);if(thSt===1)return;thSt=1;
 const im=new Image();im.onload=()=>{thSt=2;thQ.splice(0).forEach(f=>f())};im.onerror=()=>{thSt=-1;thQ=[];thHide();thPop&&thPop.classList.add("nothumb")};
 im.src="thumbs/sheet.webp?v="+TH_DATA.v}
function thTile(key,s){   /* 以 CSS 背景裁切精靈圖，s＝倍率；沒有縮圖回 null */
 const i=thIx(key);if(i<0)return null;const d=document.createElement("div"),w=TH_DATA.w*s,h=TH_DATA.h*s;d.className="thtile";
 d.style.cssText="width:"+w+"px;height:"+h+"px;background-image:url(\"thumbs/sheet.webp?v="+TH_DATA.v+"\");background-size:"+TH_DATA.cols*w+"px auto;background-position:"+(-(i%TH_DATA.cols)*w)+"px "+(-Math.floor(i/TH_DATA.cols)*h)+"px";return d}
function thKeyOf(el){const k=el.dataset.th;if(k)return k;return el.tagName==="SELECT"&&el.dataset.thk?thResolve(el.dataset.thk,el.value):""}

/* ---- 懸停預覽 ---- */
function thHide(){clearTimeout(thTimer);thCur=null;if(thTipEl)thTipEl.style.display="none"}
function thShow(el){
 const key=thKeyOf(el);if(!key||thIx(key)<0)return;
 thReady(()=>{if(thCur!==el||!el.isConnected)return;
  if(!thTipEl){thTipEl=document.createElement("div");thTipEl.id="thtip";document.body.append(thTipEl)}
  const c=document.createElement("div"),k=key.indexOf(":");c.className="thc";c.textContent=(TH_LABEL[key.slice(0,k)]||"")+"｜"+key.slice(k+1);
  thTipEl.textContent="";thTipEl.append(thTile(key,1.5),c);thTipEl.style.display="block";
  const r=el.getBoundingClientRect(),w=thTipEl.offsetWidth,h=thTipEl.offsetHeight;
  let y=r.bottom+6;if(y+h>innerHeight-4)y=Math.max(4,r.top-h-6);
  thTipEl.style.left=Math.max(4,Math.min(innerWidth-w-4,r.left))+"px";thTipEl.style.top=y+"px"})}

/* ---- 縮圖挑選窗（依 select 現有的 option 產生；點一格＝改 select.value＋觸發 change） ---- */
function thPopClose(){if(thPop){thPop.remove();thPop=null}}
function thPickSel(btn,sel,kind){
 if(thPop&&thPop.anchor===btn){thPopClose();return}thPopClose();thHide();thReady(()=>{});
 const d=document.createElement("div"),g=document.createElement("div"),h=document.createElement("div");d.className="thpop"+(thSt===-1?" nothumb":"");d.anchor=btn;g.className="thgrid";
 h.className="thh";h.textContent="點一格套用（Esc 關閉）";d.append(h,g);
 [...sel.options].forEach(o=>{
  const c=document.createElement("div"),key=thResolve(kind,o.value),t=key?thTile(key,1):null;c.className="thcard"+(o.value===sel.value?" on":"");c.title=o.text;
  if(t)c.append(t);else{const n=document.createElement("div");n.className="thtile none";n.textContent=o.value?"（無縮圖）":o.text;c.append(n)}
  const l=document.createElement("div");l.className="thl";l.textContent=o.value?o.text:"";if(o.value)c.append(l);
  c.onclick=()=>{thPopClose();if(sel.value!==o.value||!o.value){sel.value=o.value;sel.dispatchEvent(new Event("change",{bubbles:true}))}};g.append(c)});
 const r=btn.getBoundingClientRect(),W=Math.min(660,innerWidth-16),below=innerHeight-r.bottom-12,above=r.top-12,up=below<300&&above>below;   /* 下方放不下就往上開 */
 d.style.width=W+"px";d.style.left=Math.max(8,Math.min(innerWidth-W-8,r.right-W))+"px";d.style.maxHeight=Math.max(160,Math.min(up?above:below,560))+"px";
 document.body.append(d);thPop=d;d.style.top=Math.max(8,Math.min(innerHeight-d.offsetHeight-8,up?r.top-d.offsetHeight-4:r.bottom+4))+"px";   /* 一律夾在視窗內 */
 const on=g.querySelector(".on");on&&on.scrollIntoView({block:"nearest"})}
function thBtn(sel,kind){   /* 只回傳 🖼 按鈕（空間窄的工具列用）；同時讓 select 支援懸停預覽 */
 sel.dataset.thk=kind;const b=document.createElement("button");b.type="button";b.className="thbtn";b.textContent="🖼";b.title="用縮圖挑選（滑鼠停在下拉選單上，也會預覽目前選項）";b.onclick=()=>thPickSel(b,sel,kind);return b}
function thRow(sel,kind){const d=document.createElement("div");d.className="throw";d.append(sel,thBtn(sel,kind));return d}

if(!RENDER){
 document.addEventListener("pointerover",e=>{
  if(e.pointerType&&e.pointerType!=="mouse")return;
  const el=e.target.closest&&e.target.closest("[data-th],[data-thk]");if(el===thCur)return;
  thHide();if(!el)return;thCur=el;thTimer=setTimeout(()=>thShow(el),150)},true);
 document.addEventListener("pointerdown",e=>{thHide();if(thPop&&!thPop.contains(e.target)&&e.target!==thPop.anchor)thPopClose()},true);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")thPopClose();thHide()},true);
 addEventListener("scroll",thHide,true);addEventListener("blur",thHide);document.documentElement.addEventListener("mouseleave",thHide);
}
