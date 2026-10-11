/* ===== [AMBIENT] Canvas 氛圍層（粒子/光暈/噪點/暗角）/ 音訊低頻偵測 / 效能自動降級；另含 applyScene、extra3()（錄製・比例・粒子・色彩・轉場・疊加層勾選面板）、PRESETS 補登 ===== */
let ac=null,an=null,fb=null,lo=1,hi=4,bass=0,bAvg=0,lastHit=0,audioHit=false,abeat=0,flashT=0,ps=[],fpsN=0,fpsT=0;
function initAudio(){ // audio 必須同時 connect 到 destination，錄製時才有聲音
 if(ac){ac.state==="suspended"&&ac.resume();return}
 try{ac=new AudioContext();const src=ac.createMediaElementSource(m);an=ac.createAnalyser();an.fftSize=1024;src.connect(an);an.connect(ac.destination);
  fb=new Uint8Array(an.frequencyBinCount);const bw=ac.sampleRate/1024;lo=Math.max(1,Math.floor(40/bw));hi=Math.ceil(150/bw);ac.resume()}
 catch(e){an=null;note("音訊分析初始化失敗："+e.message+"（節拍改用固定 BPM）")}}
const cv=$("#cv"),cx=cv.getContext("2d"),cv2=$("#cv2"),c2=cv2.getContext("2d");let W=0,H=0,vig=null,scanP=null,noise=null;
let perfLite=false,perfPart=null,warm=0;   /* perfPart：掉幀時的臨時粒子上限（不寫入 CONFIG / localStorage）；warm：暖機幀數 */ // 輕量模式：Canvas 以半解析度繪製、關閉噪點與發光濾鏡
function sizeCv(){const q=perfLite?.5:1;W=SWd();H=SHd();cv.width=cv2.width=W*q;cv.height=cv2.height=H*q;cx.setTransform(q,0,0,q,0,0);c2.setTransform(q,0,0,q,0,0);vig=cx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.95)")}
addEventListener("resize",()=>{sizeCv();cur=-2});sizeCv();
(()=>{const a=document.createElement("canvas");a.width=2;a.height=4;const c=a.getContext("2d");c.fillStyle="#000";c.fillRect(0,0,2,2);scanP=cx.createPattern(a,"repeat");
 const n=document.createElement("canvas");n.width=n.height=128;const g=n.getContext("2d"),d=g.createImageData(128,128);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0);noise=cx.createPattern(n,"repeat")})();
const mkP=()=>({x:Math.random()*W,y:Math.random()*H,v:.2+Math.random()*.8,r:1+Math.random()*2.5,p:Math.random()*6.28});
function audioStep(ts){an.getByteFrequencyData(fb);let sm=0;for(let i=lo;i<=hi;i++)sm+=fb[i];const b=sm/(hi-lo+1)/255;bass+=(b-bass)*.5;bAvg=bAvg*.96+b*.04;
 if(playing&&b>bAvg*1.35&&b>.3&&ts-lastHit>260){lastHit=ts;audioHit=true}}
function ambient(ts,dt){
 if(an){audioStep(ts);
  L.style.filter=perfLite?"":`drop-shadow(0 0 ${(bass*28).toFixed(1)}px var(--a))`}else bass*=.9;
 // 效能自動降級：平均 fps < 50 時粒子數減 40%
 if(!playing)warm=0;
 if(playing&&dt<.5){if(warm<45)warm++;else{fpsN++;fpsT+=dt;if(fpsN>=90){const pc=perfPart==null?CONFIG.particles:perfPart;if(CONFIG.autoPerf&&fpsN/fpsT<50&&pc>10){perfPart=Math.floor(pc*.6);note("偵測到掉幀，已自動降低粒子數至 "+perfPart)}else if(CONFIG.autoPerf&&fpsN/fpsT<50&&!perfLite){perfLite=true;sizeCv();note("仍然掉幀，已切換為輕量模式（畫布半解析度、關閉噪點與發光）")}fpsN=fpsT=0}}}
 cx.clearRect(0,0,W,H);
 const R=CONFIG.accent,sp=1+bass*4,N=perfPart==null?CONFIG.particles:Math.min(CONFIG.particles,perfPart),md=CONFIG.pMode;
 const g=cx.createRadialGradient(W/2,H/2,0,W/2,H/2,(.25+bass*.6)*H);if(CONFIG.glowAcc!==0){g.addColorStop(0,R+Math.round((CONFIG.glowAcc==null?25:+CONFIG.glowAcc)*2.55).toString(16).padStart(2,"0"));g.addColorStop(1,R+"00");cx.fillStyle=g;cx.fillRect(0,0,W,H)}
 drawScenes("under",cx);
 while(ps.length<N)ps.push(mkP());ps.length=Math.min(ps.length,N);
 cx.strokeStyle="rgba(255,255,255,.4)";
 for(const p of ps){
  if(md==="dots"){p.y-=p.v*60*dt*sp;if(p.y<-5)p.y=H+5;cx.fillStyle="rgba(255,255,255,.45)";cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.3);cx.fill()}
  else if(md==="snow"){p.y+=p.v*50*dt*sp;p.x+=Math.sin(p.p+ts/1000)*20*dt;if(p.y>H+5)p.y=-5;cx.fillStyle="rgba(255,255,255,.8)";cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.3);cx.fill()}
  else if(md==="rain"){p.y+=p.v*900*dt;if(p.y>H+20){p.y=-20;p.x=Math.random()*W}cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-3,p.y+18);cx.stroke()}
  else if(md==="sakura"){p.y+=p.v*60*dt*sp;p.x+=Math.sin(p.p+ts/900)*40*dt;if(p.y>H+10){p.y=-10;p.x=Math.random()*W}cx.fillStyle="#ffb3c7";cx.beginPath();cx.ellipse(p.x,p.y,p.r*2.4,p.r*1.3,p.p+ts/800,0,6.3);cx.fill()}
  else{cx.fillStyle=`rgba(255,255,255,${.3+.7*Math.abs(Math.sin(p.p+ts/700))})`;cx.beginPath();cx.arc(p.x,p.y,p.r*.6,0,6.3);cx.fill()}}
 if(CONFIG.scan>0){cx.globalAlpha=Math.min(1,CONFIG.scan*3);cx.fillStyle=scanP;cx.fillRect(0,0,W,H);cx.globalAlpha=1}
 if(CONFIG.grain>0&&!perfLite){cx.save();cx.globalAlpha=CONFIG.grain;cx.globalCompositeOperation="overlay";cx.translate(Math.random()*128|0,Math.random()*128|0);cx.fillStyle=noise;cx.fillRect(-128,-128,W+128,H+128);cx.restore()}
 if(CONFIG.vignette>0){cx.globalAlpha=CONFIG.vignette;cx.fillStyle=vig;cx.fillRect(0,0,W,H);cx.globalAlpha=1}
 if(flashT>0){cx.fillStyle=`rgba(255,255,255,${flashT*.5})`;cx.fillRect(0,0,W,H);flashT-=dt*4}overlays(ts,dt);sceneOver();
}
function applyScene(){applyStage();toneCss();bgCss();guidesCss();document.body.classList.toggle("kb",!!CONFIG.kb)}
function extra3(p){secAnchor(p,"scene");
 const sel=(t,k,o)=>{const l=document.createElement("label");l.textContent=t;const e=document.createElement("select");e.style.width="100%";o.forEach(([a,v])=>e.add(new Option(a,v)));e.value=CONFIG[k];e.onchange=()=>{CONFIG[k]=e.value;save();applyScene()};p.append(l,e)};
 sel("錄製幀率","recFps",[["60 fps","60"],["30 fps（較不吃效能）","30"]]);
 sel("畫面比例","aspect",[["填滿視窗","fill"],["16:9","16:9"],["9:16 直式","9:16"]]);
 sel("粒子樣式","pMode",[["光點上飄","dots"],["雪","snow"],["雨","rain"],["櫻花","sakura"],["星空","stars"]]);
 sel("色彩","tone",[["原色",""],["黑白","grayscale(1)"],["復古褪色","sepia(.6) contrast(.9) saturate(.8)"],["冷色調","hue-rotate(-20deg) saturate(1.1)"],["暖色調","hue-rotate(25deg) saturate(1.2) sepia(.2)"]]);
 sel("節拍來源","beatSrc",[["固定 BPM","bpm"],["音訊低頻偵測","audio"]]);
 sel("句間轉場","trans",[["cut","cut"],["flash 閃白","flash"],["crossfade 淡入","crossfade"],["wipe 掃過","wipe"],["zoom-through 穿越","zoom"]]);
 [["kb","緩慢推近 (Ken Burns)"],["autoPerf","掉幀時自動降級"],["recLite","錄製輕量模式（半解析度畫布、關噪點與發光）"],["bokeh","光斑 bokeh"],["leak","漏光"],["lightning","閃電"],["scratch","老電影刮痕"],["crt","CRT 畫素格與暗角"],["vhs","VHS 抖動與追蹤線"],["invBar","每小節首拍反相閃一下"]].forEach(([k,t])=>{const l=document.createElement("label");const c=document.createElement("input");c.type="checkbox";c.checked=!!CONFIG[k];c.onchange=()=>{CONFIG[k]=c.checked;save();applyScene()};l.append(c," "+t);p.append(l)});const rb=document.createElement("button");rb.textContent="重設所有設定";rb.onclick=()=>resetSettings();p.append(rb)}
P.push(["particles","粒子數量",0,200,5],["scan","掃描線",0,.2,.01],["grain","噪點",0,.2,.01],["vignette","暗角",0,1,.05],["dim","背景暗度",0,90,5],["beatRot","隨拍旋轉(度)",0,3,.1]);
Object.assign(PRESETS.櫻花日系,{pMode:"sakura",particles:40,tone:"sepia(.2) saturate(1.1)"});Object.assign(PRESETS.復古VHS,{scan:.12,grain:.12,tone:"sepia(.6) contrast(.9) saturate(.8)"});
Object.assign(PRESETS.賽博龐克,{pMode:"rain",particles:60,scan:.08,trans:"flash"});Object.assign(PRESETS.強烈節奏,{beatRot:1.2,trans:"flash",particles:90});Object.assign(PRESETS.霓虹夜,{pMode:"stars",particles:80});
css();
