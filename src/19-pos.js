/* ===== [POS] 位置：九宮格錨點 + XY 微調（全域設定，單句可用 ^ 覆蓋錨點；全域 X/Y 微調會疊加在句子的 ^位置:X:Y 之上）；resolvePos / groupRect / placePos =====
   做法：先量出文字實際範圍（版型穩定狀態），再把「文字（含副文預留高度）」整塊對齊到錨點，最後用 translate 平移整層。
   未設定位置時完全不介入（不建立外層、不量測），舊 SRT 外觀不變。 */
const FULLBLEED=new Set(["hud-frame","laser-scan","iris-frame","marquee","danmaku","border-run","zoom-tunnel"]); // 滿版效果：忽略位置
const ANCH={tl:"左上",tc:"上中",tr:"右上",ml:"左中",mc:"正中",mr:"右中",bl:"左下",bc:"下中",br:"右下"};
function resolvePos(sb){
 let a=CONFIG.posAnchor||"",x=+CONFIG.posX||0,y=+CONFIG.posY||0;
 /* 句子自己有位置（^錨點:X:Y）時完全以它為準，不再疊加全域微調：X／Y＝相對「錨點」（auto＝版型原位）的偏移 %。
    錨點留空（^:X:Y）＝沿用全域錨點；沒有位置標記的句子才跟隨全域錨點與全域微調 */
 if(sb.pos){const q=sb.pos.split(":");a=q[0]==="auto"?"":ANCH[q[0]]?q[0]:a;x=+q[1]||0;y=+q[2]||0}
 if(!ANCH[a])a="";
 return(a||x||y)?{a,x,y}:null}
const rangeRect=e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect()};
/* 子元素外框聯集：用在「內容會被 overflow:hidden 裁切」的版型（split-flap 的字柱遠高於可見磚塊），避免 Range 把被裁掉的部分也算進範圍 */
const childRect=e=>{let l=1e9,t=1e9,r=-1e9,b=-1e9;[...e.children].forEach(c=>{const q=c.getBoundingClientRect();if(q.width<.5||q.height<.5)return;l=Math.min(l,q.left);t=Math.min(t,q.top);r=Math.max(r,q.right);b=Math.max(b,q.bottom)});return l<r?{left:l,top:t,right:r,bottom:b,width:r-l,height:b-t}:{left:0,top:0,right:0,bottom:0,width:0,height:0}};
/* 一句版面的實際範圍（相對舞台）：主文 + 裝飾線；有底色／邊框的元素取外框（例如 subtitle-box 的黑條），其餘取文字範圍。不含副文 */
function groupRect(root){
 const o=$("#stage").getBoundingClientRect();let l=1e9,t=1e9,r=-1e9,b=-1e9;
 root.querySelectorAll("[data-t],[data-pm],.ln").forEach(e=>{if(e.closest("[data-nm]"))return;
  const cs=getComputedStyle(e),bg=cs.backgroundColor,box=e.classList.contains("ln")||(bg!=="rgba(0, 0, 0, 0)"&&bg!=="transparent")||(cs.backgroundImage!=="none"&&!/text/.test(cs.webkitBackgroundClip||cs.backgroundClip||""))||parseFloat(cs.borderTopWidth)>0;
  const q=box?e.getBoundingClientRect():e.hasAttribute("data-rg")?childRect(e):rangeRect(e);if(q.width<.5||q.height<.5)return;
  l=Math.min(l,q.left-o.left);t=Math.min(t,q.top-o.top);r=Math.max(r,q.right-o.left);b=Math.max(b,q.bottom-o.top)});
 return l<r&&t<b?{l,t,r,b}:null}
function placePos(PS,sb,host,fw,content,small){
 const vw=SWd(),vh=SHd();
 // 量測時把所有動畫停在「進場完成、退場未開始」的穩定時刻，量完還原
 const T0=Math.max(0,(sb.e-sb.s)*1000-CONFIG.exit*1000*tK-1);
 anims.forEach(a=>{try{a.currentTime=T0}catch(e){}});
 const G=groupRect(content);
 anims.forEach(a=>{try{a.currentTime=0}catch(e){}});
 if(!G)return false;
 const{l,t:tp,r,b}=G;
 if(!(l<r&&tp<b))return false;
 const fs=small*.62,sub=sb.sub||"",gap=fs*.9;let subH=0;
 if(sub){const per=Math.max(1,Math.floor(vw*.9/(fs*1.55)));subH=sub.split("\n").reduce((n,x)=>n+Math.max(1,Math.ceil([...x].length/per)),0)*fs*1.4+gap}
 const U={l,t:tp,r,b:b+subH},uw=U.r-U.l,uh=U.b-U.t,sf=(CONFIG.posSafe==null?6:+CONFIG.posSafe)/100,mx=sf*vw,my=sf*vh;
 let dx=0,dy=0;
 if(PS.a){const rw=PS.a[0],cl=PS.a[1];
  const tx=uw>vw-2*mx?(vw-uw)/2:cl==="l"?mx:cl==="r"?vw-mx-uw:(vw-uw)/2,
        ty=uh>vh-2*my?(vh-uh)/2:rw==="t"?my:rw==="b"?vh-my-uh:(vh-uh)/2;
  dx=tx-U.l;dy=ty-U.t}
 dx+=PS.x/100*vw;dy+=PS.y/100*vh;
 const ex=vw*.015,ey=vh*.015; // 微調不可把內容推出畫面；本身就比畫面大的方向不夾（例如 split）
 if(uw<=vw-2*ex)dx=Math.min(Math.max(dx,ex-U.l),vw-ex-uw-U.l);
 if(uh<=vh-2*ey)dy=Math.min(Math.max(dy,ey-U.t),vh-ey-uh-U.t);
 host.style.translate=`${dx.toFixed(2)}px ${dy.toFixed(2)}px`;
 if(sub){ // 副文貼在主文下緣，不隨 translate 走，位置另外算
  const col=PS.a?PS.a[1]:"c",mL=l+dx,mR=r+dx,mB=b+dy;
  const e=txtEl(`top:${(mB+gap).toFixed(1)}px;left:0;width:max-content;max-width:${(vw*.9).toFixed(0)}px;text-align:${col==="l"?"left":col==="r"?"right":"center"};${col==="c"?"padding-left:.55em;":""}font-size:${fs}px;letter-spacing:.55em;font-weight:300;white-space:pre-wrap`);
  delete e.dataset.t;e.textContent=sub;fw.appendChild(e);
  const wd=e.getBoundingClientRect().width,want=col==="l"?mL:col==="r"?mR-wd:(mL+mR)/2-wd/2;
  e.style.left=Math.min(Math.max(want,ex),Math.max(ex,vw-ex-wd)).toFixed(1)+"px";
  A(e,[{opacity:0},{opacity:.6}],{duration:D()*1.4,delay:D()*.6})}
 return true}
const beatMs=()=>60000/CONFIG.bpm,beatPh=sb=>{const p=beatMs();let ph=((CONFIG.offset-sb.s)*1000)%p;return ph<0?ph+p:ph};

