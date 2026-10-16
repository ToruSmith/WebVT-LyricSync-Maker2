/* ===== [RENDER-API] 離線渲染介面（render/run.mjs 呼叫：__loadProject / __renderFrame / __layer）===== */
let __fps=30,__last=-1;
if(RENDER){
 __fps=Number(new URLSearchParams(location.search).get("fps"))||30;
 document.body.classList.add("rec");document.documentElement.classList.add("rendering");CONFIG.autoPerf=false;perfLite=false;CONFIG.aspect="fill";
 /* CSS 動畫（背景流動、kb 推近）從一開始就暫停，避免瀏覽器合成器在頁面載入初期自行播放而造成不一致 */
 {const st=document.createElement("style");st.textContent="*{animation-play-state:paused!important}";document.head.appendChild(st)}
 /* 節拍閃動、轉場原本是即時播放的 Web Animation：離線時改為暫停，並依「虛擬時間」逐幀推進 */
 let rt=[],inRT=false,vnow=0;const _an=Element.prototype.animate;
 Element.prototype.animate=function(k,o){const a=_an.call(this,k,o);if(inRT){a.pause();a.currentTime=0;rt.push({a,t0:vnow})}return a};
 const wrap=f=>function(...x){inRT=true;try{return f.apply(this,x)}finally{inRT=false}};
 /* eslint-disable-next-line no-func-assign -- 離線渲染刻意覆蓋：包住 onBeat／transition，讓它們內建立的動畫改由時間驅動 */
 onBeat=wrap(onBeat);transition=wrap(transition);
 /* eslint-disable-next-line no-func-assign -- 離線渲染刻意覆蓋：總長度改由 project 決定 */
 let __dur=0,__aud=null;endT=()=>__dur>0?__dur:(subs.length?subs[subs.length-1].e+1:0);
 const __im=document.createElement("img");__im.id="mimg";m.after(__im);
 window.__loadProject=async p=>{
  for(const f of p.fonts||[]){try{const ff=new FontFace(f.name,await(await fetch("data:application/octet-stream;base64,"+(f.b64||f.data))).arrayBuffer());await ff.load();document.fonts.add(ff);FONTS[f.name]=`"${f.name}",`+FONTS.明體}catch(e){console.error("字體載入失敗："+f.name+"："+e.message)}}
  an=null;__aud=null;
  Object.assign(CONFIG,p.config||{});CONFIG.aspect="fill";CONFIG.autoPerf=false;
  __dur=+p.mediaDuration||0;__im.style.display=p.bgVideo?"block":"none";__im.removeAttribute("src");
  subs=parseSRT(p.srt==="@demo"||!p.srt?DEMO:p.srt);hasMedia=false;playing=true;vt=0;cur=-2;lastBeat=0;lastT=0;lastCt=-1;__last=-1;rt=[];
  css();applyScene();sizeCv();await document.fonts.ready;
  return{duration:endT(),fps:__fps,frames:Math.ceil(endT()*__fps),width:innerWidth,height:innerHeight,subs:subs.length}};
 window.__setAudio=a=>{lo=a.lo;hi=a.hi;fb=new Uint8Array(512);__aud={rows:Uint8Array.from(a.rows),nb:a.hi-a.lo+1,S:a.S,R:a.R,ptr:0};
  an={getByteFrequencyData(arr){const o=__aud.ptr++*__aud.nb;for(let i=0;i<__aud.nb;i++)arr[lo+i]=o+i<__aud.rows.length?__aud.rows[o+i]:0}}};
 window.__renderFrame=async(t,bg)=>{
  const dt=__last<0?1/__fps:Math.max(0,t-__last);__last=t;vnow=t;vt=t;playing=true;
  if(__aud){__aud.ptr=Math.round(t*__fps)*__aud.S;for(let j=0;j<__aud.S-1;j++)audioStep(t*1000-(__aud.S-1-j)*1000/__aud.R)}
  step(t*1000,dt);
  rt=rt.filter(o=>{const ct=(vnow-o.t0)*1000;if(ct>=o.a.effect.getComputedTiming().endTime){o.a.cancel();return false}o.a.currentTime=ct;return true});
  document.getAnimations().forEach(a=>{if(a instanceof CSSAnimation){a.pause();a.currentTime=t*1000}});
  if(bg&&__im.getAttribute("src")!==bg){__im.src=bg;try{await __im.decode()}catch(e){}}
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true};
 window.__layer=m=>{const r=document.documentElement.classList;r.toggle("alpha",m==="text");r.toggle("nobg",m==="text");r.toggle("ambonly",m==="amb")};   // 'text'＝透明文字層；'amb'＝氛圍層（無文字）；其他＝一般完整畫面
window.__ready=document.fonts.ready.then(()=>true);
}else requestAnimationFrame(t=>{lastP=t;loop(t)});
