/* ===== [ANIM] 動畫工具：A()（全部暫停，每幀由媒體時間設定 currentTime）/ D() / chars / txtEl / enter ===== */
function A(el,kf,o){const a=el.animate(kf,Object.assign({fill:"both",easing:"cubic-bezier(.2,.7,.2,1)"},o));a.pause();anims.push(a);return a}
let tK=1;   /* 短句縮放係數：句長放不下「進場＋退場」時等比縮短（build 內設定；一般句子恆為 1） */
const D=()=>CONFIG.enter*1000/CONFIG.speed*tK;
function chars(txt,parent,css){return[...txt].map(c=>{const s=document.createElement("span");s.className="ch";s.textContent=c;if(css)s.style.cssText=css;parent.appendChild(s);return s})}
function txtEl(css){const d=document.createElement("div");d.style.cssText=`position:absolute;font-family:${FONTS[curFont||CONFIG.font]||curFont||CONFIG.font};font-weight:${CONFIG.weight};letter-spacing:${CONFIG.spacing}em;color:var(--c);${css}`;d.dataset.t="1";return d}
function enter(el,kind,list){
 const d=D();
   if(kind==="scramble"&&list){list.forEach((c,i)=>{scr.push({c,f:c.textContent,end:i*80/CONFIG.speed+d*.6});A(c,[{opacity:0},{opacity:1}],{duration:d*.3,delay:i*80/CONFIG.speed})});return}
  if(["stagger","ripple","flip"].includes(kind)&&list){const kf={stagger:[{opacity:0},{opacity:1}],ripple:[{opacity:0,transform:"translateY(3cqh)"},{opacity:1,transform:"translateY(-1.5cqh)",offset:.6},{opacity:1,transform:"none"}],flip:[{opacity:0,transform:"perspective(600px) rotateX(90deg)"},{opacity:1,transform:"none"}]}[kind];list.forEach((c,i)=>A(c,kf,{duration:d,delay:i*80/CONFIG.speed}));return}
 const k={fade:[{opacity:0},{opacity:1}],rise:[{opacity:0,transform:"translateY(5cqh)"},{opacity:1,transform:"none"}],
  zoomin:[{opacity:0,transform:"scale(.6)"},{opacity:1,transform:"scale(1)"}],
  drop:[{opacity:0,transform:"translateY(-12cqh)"},{opacity:1,transform:"translateY(1.5cqh)",offset:.7},{opacity:1,transform:"none"}],
  zoomout:[{opacity:0,transform:"scale(1.8)"},{opacity:1,transform:"scale(1)"}],
  spin:[{opacity:0,transform:"perspective(800px) rotateY(90deg)"},{opacity:1,transform:"none"}],
  elastic:[{opacity:0,transform:"scale(0)"},{opacity:1,transform:"scale(1.2)",offset:.5},{transform:"scale(.93)",offset:.75},{transform:"scale(1)"}],
  swing:[{opacity:0,transform:"rotate(-25deg)"},{opacity:1,transform:"rotate(14deg)",offset:.4},{transform:"rotate(-6deg)",offset:.7},{transform:"none"}],
  "split-reveal":[{clipPath:"inset(50% 0 50% 0)",opacity:1},{clipPath:"inset(0)",opacity:1}],iris:[{clipPath:"circle(0% at 50% 50%)",opacity:1},{clipPath:"circle(75% at 50% 50%)",opacity:1}],"mask-up":[{clipPath:"inset(100% 0 0 0)",transform:"translateY(4cqh)"},{clipPath:"inset(0)",transform:"none"}]}[kind]||[{opacity:0},{opacity:1}];
 A(el,k,{duration:d});
}
