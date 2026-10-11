/* ===== [LOOP] 主迴圈：loop / step（以 currentTime 為時間基準）、進度條 ===== */
const now=()=>hasMedia?m.currentTime:vt;
function endT(){return hasMedia?(m.duration||0):(subs.length?subs[subs.length-1].e+1:0)}
let lastCt=-1,mUrl=null,lastBuilt=-1;   /* lastBuilt：上一次實際建立的句子索引，用來避免「調參數重建同一句」也觸發句間轉場 */const tmEl=$("#tm"),seekEl=$("#seek"),unEl=$("#unlock");
function loop(ts){
 const dt=(ts-lastP)/1000;lastP=ts;
 if(!hasMedia&&playing){vt+=Math.min(dt,.1);if(vt>=endT()){vt=endT();playing=false;$("#play").textContent="重播";done()}}
 step(ts,dt);
 requestAnimationFrame(loop);
}
function step(ts,dt){
 const t=now();
 if(Math.abs(t-lastT)>.5){lastBeat=Math.floor((t-CONFIG.offset)*CONFIG.bpm/60)}
 lastT=t;
 const i=subs.findIndex(s=>t>=s.s&&t<s.e);
 if(i!==cur){cur=i;if(i>=0&&i!==selIdx)setSel(i);if(i>=0&&i!==lastBuilt)transition();lastBuilt=i;if(i>=0){let sb=subs[i];if(CONFIG.auto&&sb.auto){sb.lay=LAYOUTS[i%LAYOUTS.length]}build(sb)}else{L.innerHTML="";anims=[]}}
 if(i>=0){const ct=(t-subs[i].s)*1000;if(ct!==lastCt){lastCt=ct;anims.forEach(a=>a.currentTime=ct);scr.forEach(o=>{o.c.textContent=ct>=o.end||/\s/.test(o.f)?o.f:"▒▓░#@%&*"[Math.floor(Math.random()*8)]})}}
 ambient(ts,dt);beatTick(t);
 unEl.style.display=CONFIG.lock?"":"none";TICKS.forEach(f=>f(t));beatFx(t);tmEl.textContent=t.toFixed(1);if(!seeking)seekEl.value=endT()?t/endT()*1000:0;
}
let seeking=false;
$("#seek").oninput=e=>{seeking=true;const t=e.target.value/1000*endT();hasMedia?m.currentTime=t:vt=t;cur=-2};
$("#seek").onchange=()=>seeking=false;
