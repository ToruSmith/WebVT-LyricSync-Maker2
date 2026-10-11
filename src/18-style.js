/* ===== [STYLE] 文字樣式（@）ST / STC / applyStyles、副文（||）addSub。全部以時間驅動（A() 暫停動畫 + 種子亂數），離線渲染可重現 ===== */
const tEls=c=>[...c.querySelectorAll("[data-t]")];
const isV=e=>/^vertical/.test(e.style.writingMode||"");
const charify=c=>{tEls(c).forEach(e=>{if(!isV(e)&&!e.querySelector(".ch")&&!e.children.length&&e.textContent.trim()){const t=e.textContent;e.textContent="";chars(t,e)}});return[...c.querySelectorAll(".ch")]};
const addSh=(e,s)=>{e.style.textShadow=[e.style.textShadow,s].filter(Boolean).join(",")};
const ST={
 neon:e=>addSh(e,"0 0 .06em #fff,0 0 .3em var(--a),0 0 .7em var(--a),0 0 1.4em var(--a)"),
 "glow-soft":e=>addSh(e,"0 0 .3em rgba(255,255,255,.45),0 0 .9em color-mix(in srgb,var(--a) 70%,transparent)"),
 chromatic:e=>addSh(e,CONFIG.ghostOn?`-.04em 0 color-mix(in srgb,${hex6(CONFIG.ghostA,"#ff285a")} 85%,transparent),.04em 0 color-mix(in srgb,${hex6(CONFIG.ghostB,"#00dcff")} 85%,transparent)`:"-.04em 0 rgba(255,40,90,.85),.04em 0 rgba(0,220,255,.85)"),
 longshadow:e=>addSh(e,Array.from({length:30},(_,i)=>`${(i+1)*.022}em ${(i+1)*.022}em 0 color-mix(in srgb,var(--a) 55%,#000)`).join(",")),
 trail:e=>addSh(e,Array.from({length:8},(_,i)=>`${-(i+1)*.05}em 0 ${(i+1)*.012}em rgba(255,255,255,${(.34-i*.04).toFixed(2)})`).join(",")),
 outline:e=>{e.style.color="transparent";e.style.webkitTextStroke=".04em var(--c)"},
 stamp:e=>Object.assign(e.style,{border:".07em solid var(--a)",color:"var(--a)",padding:".08em .3em",width:"fit-content",marginInline:"auto",rotate:"-4deg",borderRadius:".1em"})
};
const STC={
 gradient:c=>{tEls(c).filter(isV).forEach(e=>{e.style.background="linear-gradient(180deg,var(--c),var(--a))";e.style.webkitBackgroundClip=e.style.backgroundClip="text";e.style.color="transparent"});const ch=charify(c),n=Math.max(1,ch.length-1);ch.forEach((x,i)=>{x.style.color=`color-mix(in srgb,var(--c) ${Math.round(100-i/n*100)}%,var(--a))`})},
 karaoke:(c,sb,dur)=>{tEls(c).filter(isV).forEach(e=>{e.style.background="linear-gradient(180deg,#fff 50%,rgba(255,255,255,.3) 50%)";e.style.backgroundSize="100% 200%";e.style.webkitBackgroundClip=e.style.backgroundClip="text";e.style.color="transparent";A(e,[{backgroundPosition:"0 100%"},{backgroundPosition:"0 0"}],{duration:dur*1000,easing:"linear"})});const ch=charify(c),n=Math.max(1,ch.length),t=dur*1000/n;ch.forEach((x,i)=>{x.style.color="rgba(255,255,255,.3)";A(x,[{color:"rgba(255,255,255,.3)"},{color:"#fff",textShadow:"0 0 .4em var(--a)"}],{duration:t,delay:i*t,easing:"linear"})})},
 glitch:c=>{const b="drop-shadow(-.04em 0 rgba(255,40,90,.85)) drop-shadow(.04em 0 rgba(0,220,255,.85))",s="steps(1,end)";
  tEls(c).forEach((e,i)=>A(e,[{translate:"0 0",filter:"none",easing:s},{translate:".02em 0",filter:b,offset:.06,easing:s},{translate:"-.03em .01em",filter:b,offset:.09,easing:s},{translate:"0 0",filter:"none",offset:.12,easing:s},{translate:"-.015em 0",filter:b,offset:.56,easing:s},{translate:"0 0",filter:"none",offset:.59}],{duration:1800+i*230,iterations:Infinity}))}
};
function applyStyles(c,sb,dur){
 let st=(sb.st||"").split(",").filter(x=>ST[x]||STC[x]);
 if(st.length>3){note("單句最多同時 3 個樣式，已忽略多餘的");st=st.slice(0,3)}
 if(st.includes("karaoke")&&st.includes("gradient"))note("karaoke 與 gradient 同時使用會搶同一個顏色，以 karaoke 為準");
 st.sort((a,b)=>(a==="karaoke")-(b==="karaoke"));
 st.forEach(k=>{if(ST[k])tEls(c).forEach(e=>ST[k](e));else STC[k](c,sb,dur)})}
function addSub(sb,c,small,left){
 if(!sb.sub)return;
 const e=txtEl(`${left?"left:6cqw;bottom:6.5cqh;":"left:0;right:0;bottom:6cqh;text-align:center;padding-left:.55em;"}font-size:${small*.62}px;letter-spacing:.55em;font-weight:300;white-space:pre-wrap`);
 delete e.dataset.t;e.textContent=sb.sub;c.appendChild(e);A(e,[{opacity:0},{opacity:.6}],{duration:D()*1.4,delay:D()*.6})}
