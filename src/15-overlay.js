/* ===== [OVERLAY] 句間轉場 transition() 與疊加層 overlays()（bokeh 漏光 閃電 刮痕 CRT VHS；第二層 Canvas，位於字幕之上）===== */
["bokeh","leak","lightning","scratch","crt","vhs","invBar"].forEach(k=>{if(!(k in CONFIG))CONFIG[k]=false});
let wipeT=0,bk=[],bolt=null,lt=0,jit=0,had=false;
function transition(){const t=CONFIG.trans;
 if(t==="flash")flashT=1;else if(t==="wipe")wipeT=1;
 else if(t==="crossfade")L.animate([{opacity:0},{opacity:1}],{duration:450});
 else if(t==="zoom")$("#pulse").animate([{transform:"scale(1.3)",filter:"blur(10px)"},{transform:"scale(1)",filter:"blur(0)"}],{duration:450,easing:"ease-out"})}
const crtP=(()=>{const a=document.createElement("canvas");a.width=a.height=3;const c=a.getContext("2d");c.fillStyle="rgba(255,0,0,.1)";c.fillRect(0,0,1,3);c.fillStyle="rgba(0,255,0,.1)";c.fillRect(1,0,1,3);c.fillStyle="rgba(0,0,255,.1)";c.fillRect(2,0,1,3);c.fillStyle="rgba(0,0,0,.25)";c.fillRect(0,2,3,1);return c2.createPattern(a,"repeat")})();
function overlays(ts,dt){
 const o=CONFIG,pu=$("#pulse"),any=o.bokeh||o.leak||o.lightning||o.scratch||o.crt||o.vhs||wipeT>0;
 if(!any){if(had){c2.clearRect(0,0,W,H);had=false}pu.style.translate="";return}
 had=true;c2.clearRect(0,0,W,H);c2.globalCompositeOperation="lighter";
 if(o.bokeh){if(!bk.length)for(let i=0;i<12;i++)bk.push({x:Math.random()*W,y:Math.random()*H,r:30+Math.random()*70,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*10,a:.06+Math.random()*.1});
  bk.forEach(b=>{b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;const g=c2.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);g.addColorStop(0,`rgba(255,255,255,${b.a+bass*.1})`);g.addColorStop(.8,`rgba(255,255,255,${b.a*.5})`);g.addColorStop(1,"rgba(255,255,255,0)");c2.fillStyle=g;c2.beginPath();c2.arc(b.x,b.y,b.r,0,6.3);c2.fill()})}
 if(o.leak){const a=.14+.1*Math.sin(ts/1500)+bass*.2,g=c2.createLinearGradient(0,0,W*.45,0);g.addColorStop(0,`rgba(255,110,40,${a})`);g.addColorStop(1,"rgba(255,110,40,0)");c2.fillStyle=g;c2.fillRect(0,0,W,H);
  const g2=c2.createRadialGradient(W,0,0,W,0,H*.7);g2.addColorStop(0,`rgba(255,200,120,${a*.8})`);g2.addColorStop(1,"rgba(255,200,120,0)");c2.fillStyle=g2;c2.fillRect(0,0,W,H)}
 c2.globalCompositeOperation="source-over";
 if(o.lightning){if(lt<=0&&Math.random()<.004){lt=1;let x=W*(.2+.6*Math.random()),y=0;bolt=[[x,y]];while(y<H*.7){y+=30;x+=(Math.random()-.5)*80;bolt.push([x,y])}}
  if(lt>0){const al=lt*(Math.sin(lt*28)>-.3?1:.3);c2.fillStyle=`rgba(220,230,255,${al*.4})`;c2.fillRect(0,0,W,H);c2.strokeStyle=`rgba(255,255,255,${al})`;c2.lineWidth=3;c2.shadowColor="#9cf";c2.shadowBlur=20;c2.beginPath();bolt.forEach((p,i)=>i?c2.lineTo(p[0],p[1]):c2.moveTo(p[0],p[1]));c2.stroke();c2.shadowBlur=0;lt-=dt*3.5}}
 if(o.scratch&&Math.random()<.35){c2.strokeStyle="rgba(255,255,255,.3)";c2.lineWidth=1;for(let i=0,n=1+Math.random()*3|0;i<n;i++){const x=Math.random()*W,y=Math.random()*H*.8;c2.beginPath();c2.moveTo(x,y);c2.lineTo(x+(Math.random()-.5)*6,y+H*(.1+Math.random()*.4));c2.stroke()}
  for(let i=0;i<6;i++){c2.fillStyle="rgba(255,255,255,.4)";c2.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1+Math.random()*2)}}
 if(o.crt){c2.fillStyle=crtP;c2.fillRect(0,0,W,H);const g=c2.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*1.05);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.75)");c2.fillStyle=g;c2.fillRect(0,0,W,H)}
 if(o.vhs){if(Math.random()<.03)jit=(Math.random()-.5)*16;jit*=.8;pu.style.translate=`${jit.toFixed(1)}px 0`;
  const y=(ts/5)%(H+120)-60;c2.fillStyle="rgba(255,255,255,.07)";c2.fillRect(0,y,W,26);
  for(let i=0;i<8;i++){c2.fillStyle=`rgba(255,255,255,${.1+Math.random()*.2})`;c2.fillRect(Math.random()*W,y+Math.random()*26,40+Math.random()*200,1+Math.random()*2)}
  for(let i=0;i<14;i++){c2.fillStyle=`rgba(255,255,255,${Math.random()*.3})`;c2.fillRect(Math.random()*W,H-28+Math.random()*28,20+Math.random()*120,1+Math.random()*2)}}
 else pu.style.translate="";
 if(wipeT>0){const x=(1-wipeT)*W*1.3-W*.15,g=c2.createLinearGradient(x-W*.08,0,x+W*.08,0);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(.5,"rgba(255,255,255,.7)");g.addColorStop(1,"rgba(255,255,255,0)");c2.fillStyle=g;c2.fillRect(x-W*.08,0,W*.16,H);wipeT-=dt*2.2}
}
Object.assign(PRESETS.復古VHS,{vhs:1,scratch:1,crt:1});Object.assign(PRESETS.賽博龐克,{crt:1,trans:"wipe"});Object.assign(PRESETS.櫻花日系,{leak:1,bokeh:1});Object.assign(PRESETS.動畫PV,{bokeh:1,trans:"crossfade"});Object.assign(PRESETS.遊戲PV,{lightning:1,trans:"zoom"});Object.assign(PRESETS.強烈節奏,{invBar:1});
