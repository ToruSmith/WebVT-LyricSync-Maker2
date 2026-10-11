/* ===== [BEAT] 節拍：onBeat / beatTick（跨過整數拍才觸發；跳轉時只重新校正，不補發）===== */
function onBeat(n){
 if(!n&&n!==0)return;
 const p=$("#pulse");
 p.animate([{transform:`scale(${1+CONFIG.pulse}) rotate(${(n%2?1:-1)*CONFIG.beatRot}deg)`},{transform:"scale(1) rotate(0deg)"}],{duration:250,easing:"ease-out"});
 L.querySelectorAll("[data-big]").forEach(e=>e.animate([{translate:`0 -${CONFIG.bounce}px`},{translate:"0 0"}],{duration:250,easing:"ease-out"}));
 if(n%CONFIG.flashEvery===0)p.animate([{filter:`brightness(${1+CONFIG.flash})`},{filter:"brightness(1)"}],{duration:100});if(CONFIG.invBar&&n%CONFIG.flashEvery===0)document.body.animate([{filter:"invert(1)"},{filter:CONFIG.tone||"none"}],{duration:90});
}
function beatTick(t){
 const b=Math.floor((t-CONFIG.offset)*CONFIG.bpm/60);
 if(CONFIG.beatSrc==="audio"&&an){if(playing&&audioHit)onBeat(++abeat);audioHit=false}else if(b===lastBeat+1&&playing)onBeat(b);lastBeat=b;
}
