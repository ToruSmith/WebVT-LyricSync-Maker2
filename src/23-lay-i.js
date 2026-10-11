/* ===== [LAY-I] 版型 I（P2／P3 文字型，「實驗室」，自行詮釋，未對照 pv-tool 畫面）：staggered-text noise-text victim-outline cute-outline vertical-sub hero-text shatter-text crayon-shatter。
   皆為時間純函數（A() 暫停動畫＋種子亂數 sr()）；顏色取 --c／--a 與 ghostA／ghostB；非主文裝飾標 data-nm。不吃 {}、非滿版。實驗室版型預設不寫進 AI 規格書（LAB_LAYOUTS）。 ===== */
const LAB_LAYOUTS=new Set(["staggered-text","noise-text","victim-outline","cute-outline","vertical-sub","hero-text","shatter-text","crayon-shatter"]);
const _gh=()=>[CONFIG.ghostOn?CONFIG.ghostA:"#ff285a",CONFIG.ghostOn?CONFIG.ghostB:"#00dcff"];
registerLayout("staggered-text",(sb,c,w,big,sm,dur,list)=>{   /* 交錯字：奇偶字上下錯位，從相反方向滑入 */
 const z=_fz(sb,big,1),e=CE(c,`font-size:${z}px;letter-spacing:.08em`),ch=chars(sb.plain,e);list.push(...ch);
 ch.forEach((x,i)=>{x.style.position="relative";x.style.top=(i%2?.26:-.26)+"em";if(!sb.en)A(x,[{opacity:0,transform:`translateX(${i%2?8:-8}cqw)`},{opacity:1,transform:"none"}],{duration:D(),delay:i*70/CONFIG.speed})});
 if(sb.en)enter(e,sb.en,list)});
registerLayout("noise-text",(sb,c,w,big,sm,dur,list)=>{   /* 雜訊字：主文加兩層色差殘影，每 80ms 換一次抖動位置 */
 const z=_fz(sb,big,1),[g1,g2]=_gh(),r=sr(sb.s),J=()=>{const a=[];for(let i=0;i<8;i++)a.push({translate:`${((r()-.5)*.14).toFixed(3)}em ${((r()-.5)*.06).toFixed(3)}em`});return a};
 [g1,g2].forEach(col=>{const e=CE(c,`font-size:${z}px;letter-spacing:.1em;color:${col};opacity:.75`);e.textContent=sb.plain;e.dataset.nm=1;delete e.dataset.t;
  A(e,J(),{duration:640,iterations:Infinity,easing:"steps(1)"})});
 const e=CE(c,`font-size:${z}px;letter-spacing:.1em`);list.push(...chars(sb.plain,e));enter(e,sb.en||"fade",list)});
registerLayout("victim-outline",(sb,c,w,big,sm,dur,list)=>{   /* 受害者描邊：空心粗描邊字，後方錯位的強調色描邊像粉筆輪廓，輕微抖動 */
 const z=_fz(sb,big,1.05),st=`font-size:${z}px;letter-spacing:.1em;font-weight:600;color:transparent;`;
 const b=CE(c,st+`-webkit-text-stroke:max(1.5px,.022em) var(--a)`);b.textContent=sb.plain;b.dataset.nm=1;delete b.dataset.t;A(b,[{translate:".03em .04em",rotate:"-.4deg"},{translate:".05em .02em",rotate:".4deg"}],{duration:420,iterations:Infinity,direction:"alternate",easing:"steps(2)"});
 const e=CE(c,st+`-webkit-text-stroke:max(1.5px,.018em) var(--c)`);list.push(...chars(sb.plain,e));enter(e,sb.en||"fade",list)});
registerLayout("cute-outline",(sb,c,w,big,sm,dur,list)=>{   /* 可愛描邊：圓潤白色厚描邊貼紙字＋彩色字心，逐字彈跳、交替傾斜 */
 const z=_fz(sb,big,1),e=CE(c,`font-size:${z}px;letter-spacing:.04em;font-weight:900;color:var(--a);-webkit-text-stroke:.16em #fff;paint-order:stroke fill;text-shadow:.05em .08em 0 rgba(0,0,0,.28)`),ch=chars(sb.plain,e);list.push(...ch);
 ch.forEach((x,i)=>{x.style.rotate=(i%2?4:-4)+"deg";if(!sb.en)A(x,[{opacity:0,transform:"translateY(8cqh) scale(.4)"},{opacity:1,transform:"translateY(-2cqh) scale(1.15)",offset:.6},{opacity:1,transform:"none"}],{duration:D(),delay:i*80/CONFIG.speed})});
 if(sb.en)enter(e,sb.en,list)});
registerLayout("vertical-sub",(sb,c,w,big,sm,dur,list)=>{   /* 直式副文：主文橫排偏左，右側一條直排淡色回聲字＋細線 */
 const z=_fz(sb,big,.85),vh=SHd(),e=txtEl(`left:6cqw;top:50%;margin-top:${-z*.6}px;font-size:${z}px;line-height:1.2;letter-spacing:.1em;white-space:nowrap`);c.appendChild(e);list.push(...chars(sb.plain,e));enter(e,sb.en||"rise",list);
 const v=txtEl(`right:7cqw;top:10cqh;writing-mode:vertical-rl;font-size:${Math.min(z*.55,vh*.085)}px;letter-spacing:.3em;opacity:.6;color:var(--a);max-height:80cqh`);delete v.dataset.t;v.dataset.nm=1;v.textContent=sb.plain;c.appendChild(v);A(v,[{opacity:0},{opacity:.55}],{duration:D()*1.3,delay:D()*.4});
 const ln=document.createElement("div");ln.style.cssText="position:absolute;right:4cqw;top:10cqh;bottom:10cqh;width:1px;background:var(--a);opacity:.5;transform-origin:top";ln.dataset.nm=1;c.appendChild(ln);A(ln,[{transform:"scaleY(0)"},{transform:"scaleY(1)"}],{duration:D()*1.5})});
registerLayout("hero-text",(sb,c,w,big,sm,dur,list)=>{   /* 英雄字：粗體巨字＋六層強調色擠出立體陰影，重重砸入 */
 const z=_fz(sb,big,1.15),ex=[];for(let i=1;i<=6;i++)ex.push(`${(i*.018).toFixed(3)}em ${(i*.022).toFixed(3)}em 0 color-mix(in srgb,var(--a) ${100-i*9}%,#000)`);
 const e=CE(c,`font-size:${z}px;letter-spacing:.06em;font-weight:900;text-shadow:${ex.join(",")}`);list.push(...chars(sb.plain,e));
 if(sb.en)enter(e,sb.en,list);else A(e,[{opacity:0,transform:"scale(2.4) rotate(-3deg)"},{opacity:1,transform:"scale(.94) rotate(0)",offset:.6},{opacity:1,transform:"none"}],{duration:D()*.9,easing:"cubic-bezier(.2,.9,.2,1)"})});
const SHARDS=["0 0,100% 0,50% 50%","100% 0,100% 100%,50% 50%","100% 100%,0 100%,50% 50%","0 100%,0 0,50% 50%"];
function shatterBuild(sb,c,big,list,crayon){   /* 每個字拆成 4 片三角碎片，從隨機位置與角度飛回拼合 */
 const z=_fz(sb,big,1),r=sr(sb.s),e=CE(c,`font-size:${z}px;letter-spacing:.06em;font-weight:${crayon?800:900}`),ch=[...sb.plain].filter(x=>!/\s/.test(x));
 ch.forEach((t,i)=>{const w=document.createElement("span");w.className="ch";w.textContent=t;w.style.cssText="position:relative;display:inline-block;color:transparent;-webkit-text-fill-color:transparent";e.appendChild(w);list.push(w);
  if(crayon)w.style.rotate=((r()-.5)*7)+"deg";
  SHARDS.forEach((p,k)=>{const s=document.createElement("span");s.textContent=t;s.dataset.nm=1;
   s.style.cssText=`position:absolute;inset:0;clip-path:polygon(${p});color:${crayon?"var(--a)":"var(--c)"};-webkit-text-fill-color:${crayon?"var(--a)":"var(--c)"};`+(crayon?"-webkit-text-stroke:.025em var(--c);text-shadow:.025em .02em 0 rgba(255,255,255,.35),-.02em .03em 0 rgba(0,0,0,.3)":"");w.appendChild(s);
   A(s,[{opacity:0,transform:`translate(${(r()-.5)*60}cqw,${(r()-.5)*50}cqh) rotate(${(r()-.5)*360}deg) scale(${.4+r()*1.2})`},{opacity:1,transform:"none"}],{duration:D()*1.2,delay:(i*60+k*30)/CONFIG.speed,easing:"cubic-bezier(.2,.8,.2,1)"})})})}
registerLayout("shatter-text",(sb,c,w,big,sm,dur,list)=>shatterBuild(sb,c,big,list,false));   /* 碎裂字（P3）：4 片碎片拼合 */
registerLayout("crayon-shatter",(sb,c,w,big,sm,dur,list)=>shatterBuild(sb,c,big,list,true));   /* 蠟筆碎裂（P3）：同上，字心強調色、粗糙描邊與微傾斜 */
