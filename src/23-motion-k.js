/* ===== [MOTION-K] 第二批（JIZURA 移植）：進場／退場（含逐字退場）／保持／文字樣式。只往表裡加，不改既有項目。
   來源對照（JIZURA key）見各項目後面的注釋；部分部品改寫自 JIZURA（原作者 hakoniwa，MIT，備份於 ToruSmith/JIZURA；授權全文見根目錄 LICENSE）：只讀動作設計與數值，用 WAAPI 關鍵影格重寫。
   全部是時間純函數（A() 暫停動畫；逐字的「隨機」用索引雜湊或種子亂數 sr()，不用 Math.random）。
   進場：ENTER_X[名稱]=(el,list,d)（04-anim.js 的 enter() 會先查這張表）；退場：整句版放 EXTRA_EX，逐字版放 EXIT_C（05-build.js 在有 .ch 時使用）；保持：FXH（(fw,dur)）。 ===== */
{
const sp=()=>CONFIG.speed;
/* 進場：整句 ew(名稱,關鍵影格[,選項])；逐字 ec(名稱,(i,n)=>關鍵影格,整句退路,每字延遲ms) */
const ew=(n,kf,o)=>{ENTER_X[n]=(el,l,d)=>A(el,kf,Object.assign({duration:d},o))};
const ec=(n,pc,fb,gap=70)=>{ENTER_X[n]=(el,l,d)=>{if(l&&l.length)l.forEach((c,i)=>A(c,pc(i,l.length),{duration:d,delay:i*gap/sp()}));else A(el,fb,{duration:d})}};
const bl=(inn,k)=>{const a=[];for(let j=0;j<=k;j++){const v=(inn?j/k:1-j/k)*12.5,m=`repeating-linear-gradient(180deg,#000 0,#000 ${v.toFixed(2)}%,transparent ${v.toFixed(2)}%,transparent 12.5%)`;a.push({maskImage:m,WebkitMaskImage:m,offset:j/k})}return a};   /* 百葉窗：8 條橫帶，帶寬由 0 長到滿（或相反）；遮罩圖逐段寫死（動畫值裡的 var() 不會跟著動，見 CLOCK_KF 的說明） */
/* ---- 整句進場 ---- */
ew("slide-l",[{opacity:0,transform:"translateX(-12cqw)"},{opacity:1,transform:"none"}]);   /* 左からスライド */
ew("slide-r",[{opacity:0,transform:"translateX(12cqw)"},{opacity:1,transform:"none"}]);   /* 右からスライド */
ew("whip",[{opacity:0,transform:"translateX(-30cqw)",filter:"blur(10px)"},{opacity:1,transform:"translateX(1.5cqw)",filter:"blur(0)",offset:.75},{opacity:1,transform:"none"}],{easing:"cubic-bezier(.1,.8,.2,1)"});   /* ホイップ */
ew("pop",[{opacity:0,transform:"scale(.2)"},{opacity:1,transform:"scale(1.12)",offset:.6},{opacity:1,transform:"scale(1)"}]);   /* ポップ */
ew("stretch-in",[{opacity:0,transform:"scaleX(0)"},{opacity:1,transform:"scaleX(1.1)",offset:.7},{opacity:1,transform:"scaleX(1)"}]);   /* 伸縮 */
ew("big-jump",[{opacity:0,transform:"translateY(25cqh) scale(.6)"},{opacity:1,transform:"translateY(-4cqh) scale(1.05)",offset:.6},{opacity:1,transform:"none"}]);   /* 大ジャンプ */
ew("squash-land",[{opacity:0,transform:"translateY(-20cqh) scaleY(1.2)"},{opacity:1,transform:"translateY(0) scale(1.15,.8)",offset:.6},{opacity:1,transform:"none"}]);   /* 潰れて着地 */
ew("wobble-land",[{opacity:0,transform:"translateY(-15cqh) rotate(-6deg)"},{opacity:1,transform:"rotate(4deg)",offset:.6},{transform:"rotate(-2deg)",offset:.8},{transform:"none"}]);   /* ぐらぐら着地 */
ew("stamp-in",[{opacity:0,transform:"scale(2.2) rotate(-6deg)"},{opacity:1,transform:"scale(.94)",offset:.6},{opacity:1,transform:"scale(1)"}]);   /* スタンプ */
ew("blur-in",[{opacity:0,filter:"blur(14px)"},{opacity:1,filter:"blur(0)"}]);   /* ブラー */
ew("open-h",[{clipPath:"inset(0 50% 0 50%)",opacity:1},{clipPath:"inset(0)",opacity:1}]);   /* 中央から左右に開く（スライス） */
ew("unfold",[{opacity:0,transform:"perspective(700px) rotateX(-90deg)",transformOrigin:"50% 0"},{opacity:1,transform:"none",transformOrigin:"50% 0"}]);   /* 折り開き */
ew("roll-in",[{opacity:0,transform:"translateX(-30cqw) rotate(-360deg)"},{opacity:1,transform:"none"}]);   /* 転がり */
ew("blink-in",[{opacity:0,offset:0},{opacity:1,offset:.15},{opacity:0,offset:.3},{opacity:1,offset:.45},{opacity:.2,offset:.6},{opacity:1,offset:.75},{opacity:1}],{easing:"steps(1,end)"});   /* 点滅 */
ew("overexpose",[{opacity:0,filter:"brightness(6) blur(4px)"},{opacity:1,filter:"brightness(1) blur(0)"}]);   /* 露出オーバー */
ew("blinds-in",bl(1,8),{easing:"linear"});   /* ブラインド */
ew("wipe-diag",[{clipPath:CLOCK_DIAG[0],opacity:1},{clipPath:CLOCK_DIAG[1],opacity:1}],{easing:"linear"});   /* 斜めワイプ */
/* ---- 逐字進場（沒有逐字元素時退回整句版）---- */
ec("fan-open",(i,n)=>[{opacity:0,transform:"rotate(-40deg)",transformOrigin:"50% 100%"},{opacity:1,transform:"none",transformOrigin:"50% 100%"}],[{opacity:0},{opacity:1}],60);   /* 扇開き */
ec("domino-in",(i,n)=>[{opacity:0,transform:"rotate(-80deg)",transformOrigin:"0 100%"},{opacity:1,transform:"none",transformOrigin:"0 100%"}],[{opacity:0},{opacity:1}],90);   /* ドミノ */
ec("bubble-in",(i,n)=>[{opacity:0,transform:"translateY(4cqh) scale(.2)"},{opacity:1,transform:"translateY(-1cqh) scale(1.15)",offset:.6},{opacity:1,transform:"none"}],[{opacity:0,transform:"translateY(4cqh) scale(.6)"},{opacity:1,transform:"none"}],70);   /* 泡 */
ec("dot-grow",(i,n)=>[{opacity:0,transform:"scale(.05)",filter:"blur(3px)"},{opacity:1,transform:"scale(1)",filter:"blur(0)"}],[{opacity:0,transform:"scale(.3)"},{opacity:1,transform:"none"}],70);   /* 点から字 */
ec("magnet",(i,n)=>[{opacity:0,transform:`translate(${i%2?-16:16}cqw,${((i%3)-1)*6}cqh)`},{opacity:1,transform:"none"}],[{opacity:0},{opacity:1}],50);   /* 磁石（逐字從左右兩側吸向定位） */
ec("spiral-in",(i,n)=>{const a=i*2.39996,r=14;return[{opacity:0,transform:`translate(${(Math.cos(a)*r).toFixed(2)}cqh,${(Math.sin(a)*r).toFixed(2)}cqh) rotate(${(i%2?1:-1)*180}deg)`},{opacity:1,transform:"none"}]},[{opacity:0,transform:"rotate(-90deg) scale(.5)"},{opacity:1,transform:"none"}],60);   /* 螺旋集合（黃金角分布，與句長無關的固定座標） */
ec("drop-stagger",(i,n)=>[{opacity:0,transform:"translateY(-9cqh)"},{opacity:1,transform:"translateY(1cqh)",offset:.7},{opacity:1,transform:"none"}],[{opacity:0,transform:"translateY(-9cqh)"},{opacity:1,transform:"none"}],70);   /* 逐字落下 */
ENTER_X.type=(el,l,d)=>{if(l&&l.length)l.forEach((c,i)=>A(c,[{opacity:0},{opacity:1}],{duration:1,delay:i*Math.max(40,d*.7/l.length)/sp(),easing:"steps(1,end)"}));else A(el,[{opacity:0},{opacity:1}],{duration:d})};   /* タイプ */
ENTER_X["random-order"]=(el,l,d)=>{if(!l||!l.length){A(el,[{opacity:0},{opacity:1}],{duration:d});return}const n=l.length;let k=3;const g=(a,b)=>b?g(b,a%b):a;while(g(k,n)!==1)k++;l.forEach((c,i)=>A(c,[{opacity:0},{opacity:1}],{duration:d*.5,delay:((i*k+3)%n)/n*d*.6}))};   /* ランダム順（固定的排列，非亂數） */
ENTERS.push("slide-l","slide-r","whip","pop","stretch-in","big-jump","squash-land","wobble-land","stamp-in","blur-in","open-h","unfold","roll-in","blink-in","overexpose","blinds-in","wipe-diag","fan-open","domino-in","bubble-in","dot-grow","magnet","spiral-in","drop-stagger","type","random-order");

/* ---- 退場：整句 ---- */
Object.assign(EXTRA_EX,{
 "slide-r-out":[{opacity:1,transform:"none"},{opacity:0,transform:"translateX(20cqw)"}],
 "slide-up-out":[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-8cqh)"}],
 "slide-down-out":[{opacity:1,transform:"none"},{opacity:0,transform:"translateY(8cqh)"}],
 "tip-over":[{opacity:1,transform:"perspective(800px) rotateX(0)"},{opacity:0,transform:"perspective(800px) rotateX(80deg)"}],   /* パタン倒れ */
 "flip-out":[{opacity:1,transform:"perspective(800px) rotateY(0)"},{opacity:0,transform:"perspective(800px) rotateY(90deg)"}],
 "stretch-out":[{opacity:1,transform:"scaleX(1)"},{opacity:0,transform:"scaleX(0)"}],   /* 伸縮退場 */
 "squash-out":[{opacity:1,transform:"scaleY(1)"},{opacity:0,transform:"scaleY(.05)"}],   /* 潰れる */
 "pop-out":[{opacity:1,transform:"scale(1)"},{opacity:1,transform:"scale(1.15)",offset:.4},{opacity:0,transform:"scale(0)"}],   /* 弾ける */
 "fly-through":[{opacity:1,transform:"none",filter:"blur(0)"},{opacity:0,transform:"scale(3)",filter:"blur(8px)"}],   /* 手前へ抜ける */
 "close-h":[{clipPath:"inset(0)"},{clipPath:"inset(0 50% 0 50%)"}],   /* 中央で閉じる */
 "close-v":[{clipPath:"inset(0)"},{clipPath:"inset(50% 0 50% 0)"}],   /* 上下から閉じる */
 "wipe-r-out":[{clipPath:"inset(0)"},{clipPath:"inset(0 100% 0 0)"}],
 "wipe-up-out":[{clipPath:"inset(0)"},{clipPath:"inset(0 0 100% 0)"}],   /* 巻き取る */
 "wipe-down-out":[{clipPath:"inset(0)"},{clipPath:"inset(100% 0 0 0)"}],
 "blinds-out":bl(0,8),   /* ブラインド */
 "flicker-out":[{opacity:1,offset:0},{opacity:0,offset:.15},{opacity:1,offset:.3},{opacity:0,offset:.45},{opacity:.6,offset:.6},{opacity:0,offset:.8},{opacity:0}],
 "roll-out":[{opacity:1,transform:"none"},{opacity:0,transform:"translateX(40cqw) rotate(360deg)"}],   /* 転がって去る */
 "twist-out":[{opacity:1,transform:"none"},{opacity:0,transform:"rotate(12deg) skewX(25deg) scale(.7)"}],   /* ねじれ */
 "track-out":[{opacity:1},{opacity:0}]});   /* 字間が開く：字距在 05-build.js 另外對各文字元素加動畫 */
/* ---- 退場：逐字（EXIT_C；整句版在上面的 EXTRA_EX 或預設淡出）---- */
const sw=(i,n,r)=>i/Math.max(1,n-1);
Object.assign(EXIT_C,{
 "blur-out-stagger":(c,i,n)=>({kf:[{opacity:1,filter:"blur(0)"},{opacity:0,filter:"blur(10px)"}],dur:.5,at:sw(i,n)*.5}),   /* 字ごとボケ */
 gravity:(c,i,n,R)=>({kf:[{opacity:1,transform:"none"},{opacity:0,transform:`translateY(60cqh) rotate(${((R()-.5)*60).toFixed(1)}deg)`}],dur:.7,at:R()*.3,ease:"cubic-bezier(.5,0,1,.6)"}),   /* 重力落下 */
 "leaf-fall":(c,i,n,R)=>({kf:[{opacity:1,transform:"none"},{opacity:1,transform:`translate(${((R()-.5)*6).toFixed(1)}cqw,12cqh) rotate(${((R()-.5)*90).toFixed(0)}deg)`,offset:.5},{opacity:0,transform:`translate(${((R()-.5)*14).toFixed(1)}cqw,32cqh) rotate(${((R()-.5)*180).toFixed(0)}deg)`}],dur:.65,at:sw(i,n)*.35}),   /* ひらひら落ちる */
 "domino-out":(c,i,n)=>({kf:[{opacity:1,transform:"none",transformOrigin:"0 100%"},{opacity:0,transform:"rotate(75deg)",transformOrigin:"0 100%"}],dur:.4,at:sw(i,n)*.6}),   /* ドミノ倒し */
 "wave-out":(c,i,n)=>({kf:[{opacity:1,transform:"none"},{opacity:1,transform:"translateY(-2.5cqh)",offset:.35},{opacity:0,transform:"translateY(3cqh)"}],dur:.5,at:sw(i,n)*.5})});   /* 波で崩れる */
EXITS.push("slide-r-out","slide-up-out","slide-down-out","tip-over","flip-out","stretch-out","squash-out","pop-out","fly-through","close-h","close-v","wipe-r-out","wipe-up-out","wipe-down-out","blinds-out","flicker-out","roll-out","twist-out","track-out","blur-out-stagger","gravity","leaf-fall","domino-out","wave-out");

/* ---- 保持（持續特效）：全部用獨立屬性 scale／translate／rotate，不和進場的 transform 打架；拍速用 60000/CONFIG.bpm ---- */
const bt=()=>60000/CONFIG.bpm;
Object.assign(FXH,{
 pulse(fw){A(fw,[{scale:1.05},{scale:1}],{duration:bt(),iterations:Infinity,easing:"ease-out"})},   /* 脈動（隨拍） */
 heartbeat(fw){A(fw,[{scale:1,offset:0},{scale:1.06,offset:.12},{scale:1,offset:.24},{scale:1.04,offset:.36},{scale:1}],{duration:bt()*2,iterations:Infinity,easing:"ease-out"})},   /* 鼓動 */
 "beat-jump"(fw){A(fw,[{translate:"0 0"},{translate:"0 -1.6cqh",offset:.3},{translate:"0 0"}],{duration:bt(),iterations:Infinity,easing:"ease-out"})},   /* 拍で跳ねる */
 drum(fw){A(fw,[{scale:1.09},{scale:1,offset:.5},{scale:1}],{duration:bt(),iterations:Infinity,easing:"cubic-bezier(.1,.9,.3,1)"})},   /* 太鼓 */
 "slow-rotate"(fw){A(fw,[{rotate:"-1.2deg"},{rotate:"1.2deg"}],{duration:6000,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})},   /* ゆっくり回転（左右にゆれる） */
 "sway-char"(fw){const l=cl(fw);(l.length?l:[fw]).forEach((c,i)=>A(c,[{rotate:"-4deg"},{rotate:"4deg"}],{duration:2000,iterations:Infinity,direction:"alternate",easing:"ease-in-out",delay:-i*180}))},   /* 逐字ゆれ */
 "small-circle"(fw){const a=[];for(let k=0;k<=8;k++){const t=k/8*Math.PI*2;a.push({translate:`${(Math.cos(t)*.7).toFixed(3)}cqh ${(Math.sin(t)*.7).toFixed(3)}cqh`,offset:k/8})}A(fw,a,{duration:4000,iterations:Infinity,easing:"linear"})},   /* 小さな円運動 */
 jelly(fw){A(fw,[{scale:"1.03 .97"},{scale:".97 1.03"}],{duration:900,iterations:Infinity,direction:"alternate",easing:"ease-in-out"})},   /* ぷるぷる */
 "noise-drift"(fw){const l=cl(fw);(l.length?l:[fw]).forEach((c,i)=>{const a=[];for(let k=0;k<=5;k++){const h=Math.sin((i+1)*12.9898+k*78.233)*43758.5453,x=((h-Math.floor(h))-.5)*.9,g=Math.sin((i+1)*39.346+k*11.135)*43758.5453,y=((g-Math.floor(g))-.5)*.9;a.push({translate:`${k%5?x.toFixed(3):0}cqh ${k%5?y.toFixed(3):0}cqh`,offset:k/5})}A(c,a,{duration:5000,iterations:Infinity,easing:"ease-in-out",delay:-i*400})})}});   /* ノイズ漂流（用 sin 雜湊的固定軌跡，不是亂數） */
FXS.push("pulse","heartbeat","beat-jump","drum","slow-rotate","sway-char","small-circle","jelly","noise-drift");

/* ---- 文字樣式（@）---- */
Object.assign(ST,{
 underline:e=>{e.style.textDecoration="underline";e.style.textDecorationColor="var(--a)";e.style.textDecorationThickness=".07em";e.style.textUnderlineOffset=".16em"},   /* 下線 */
 strike:e=>{e.style.textDecoration="line-through";e.style.textDecorationColor="var(--a)";e.style.textDecorationThickness=".07em"},   /* 取り消し線 */
 marker:e=>{_lv(e).forEach(x=>{x.style.backgroundImage="linear-gradient(transparent 58%,color-mix(in srgb,var(--a) 55%,transparent) 58%,color-mix(in srgb,var(--a) 55%,transparent) 92%,transparent 92%)"})},   /* 蛍光ペン（字下半的半透明色帶，不蓋字） */
 "shadow-soft":e=>addSh(e,"0 .06em .3em rgba(0,0,0,.65)"),   /* ぼかし影 */
 "shadow-offset":e=>addSh(e,".07em .07em 0 rgba(0,0,0,.7)"),   /* ずらし影 */
 "tracking-wide":e=>{e.style.letterSpacing=`calc(${e.style.letterSpacing||"0em"} + .14em)`}});   /* 字間広め */
}
