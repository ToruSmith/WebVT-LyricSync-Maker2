/* ===== [SCENE] 場景層（句子標記 &）：每句最多 CONFIG.sceneMax（預設 3）層 Canvas 2D 圖案，與版型獨立組合。
   語法：#版型…@樣式&場景1:強度,場景2   強度 0–100（省略＝各場景預設）；未知名稱忽略並 console.warn；同類（grp 相同）互斥，後者取代前者。
   layer："under"＝畫在 #cv（文字之下，氛圍層）、"over"＝畫在 #cv2（文字之上）。三種輸出模式（alpha／chroma／ambonly）由畫布 CSS 規則自動達成。
   全部是「時間的純函數」：只用 t（本句已播秒數）、節拍相位與種子亂數 sr()，不用 Math.random、不累積狀態。顏色一律取 CONFIG.accent／color／ghostA／ghostB。
   新增場景：regScene(名稱,層,同類群組,預設強度,(ctx,p)=>{…})；p＝{t,env,a,W,H,R,C,G1,G2,bp,lite,seed,r}，env＝淡入淡出包絡（用 globalAlpha 乘上去，見 al()）。 ===== */
const SCENES={},SCENE_NAMES=[];
function regScene(n,layer,grp,def,draw){SCENES[n]={layer,grp,def,draw};SCENE_NAMES.push(n)}
function sceneList(sb){
 const mx=Math.max(1,Math.round(+CONFIG.sceneMax||3)),key=sb.scene+"|"+mx;
 if(sb._scK===key)return sb._sc;
 const out=[];
 (sb.scene||"").split(",").filter(Boolean).forEach(tok=>{
  const q=tok.split(":"),n=q[0],S=SCENES[n];
  if(!S){console.warn("[scene] 未知場景名稱，已忽略："+n);return}
  const a=q[1]!==undefined&&q[1]!==""&&isFinite(+q[1])?Math.max(0,Math.min(100,+q[1])):S.def,i=out.findIndex(o=>SCENES[o.n].grp===S.grp);
  if(i>=0)out.splice(i,1);out.push({n,amt:a})});
 if(out.length>mx){console.warn("[scene] 單句最多 "+mx+" 層，已忽略多餘的");out.length=mx}
 sb._scK=key;sb._sc=out;return out}
const hashN=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))%100003;return h};
function drawScenes(layer,ctx){
 const sb=cur>=0&&subs[cur];if(!sb||!sb.scene)return false;
 const L=sceneList(sb).filter(o=>SCENES[o.n].layer===layer);if(!L.length)return false;
 const t=now(),ct=Math.max(0,t-sb.s),dur=sb.e-sb.s,ein=Math.max(.05,CONFIG.enter/(+CONFIG.speed||1)*tK),eout=Math.max(.05,CONFIG.exit*tK),
  env=Math.max(0,Math.min(1,ct/ein,(dur-ct)/eout));
 if(env<=0)return false;
 const b=(t-CONFIG.offset)*CONFIG.bpm/60,ph=b-Math.floor(b),
  P0={t:ct,env,W,H,R:CONFIG.accent,C:CONFIG.color,G1:CONFIG.ghostOn?CONFIG.ghostA:"#ff285a",G2:CONFIG.ghostOn?CONFIG.ghostB:"#00dcff",bp:b<0?0:Math.exp(-ph*5),lite:perfLite};
 L.forEach(o=>{const seed=cur*17+hashN(o.n),p=Object.assign({},P0,{a:o.amt/100,seed,r:sr(seed/1000)});
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";SCENES[o.n].draw(ctx,p);ctx.restore()});
 return true}
let scOv=false;
function sceneOver(){   /* 文字之上的場景層：overlays() 這一幀若沒有清過 #cv2（had 為 false）就由這裡負責清 */
 const sb=cur>=0&&subs[cur],want=!!(sb&&sb.scene&&sceneList(sb).some(o=>SCENES[o.n].layer==="over"));
 if(!want){if(scOv&&!had)c2.clearRect(0,0,W,H);scOv=false;return}
 if(!had)c2.clearRect(0,0,W,H);scOv=true;drawScenes("over",c2)}
const al=(c,p,v)=>{c.globalAlpha=Math.max(0,Math.min(1,v*p.env))},PI=Math.PI,S=Math.sin;
/* ---- 圖案（under）---- */
regScene("halftone","under","pattern",60,(c,p)=>{   /* 半色調網點：斜向漸層＋緩慢波動，隨拍脹縮 */
 const{W,H,t}=p,s=Math.max(10,Math.min(W,H)/(p.lite?14:24)),mx=s*.5*(.45+.55*p.a)*(1+.2*p.bp);c.fillStyle=p.R;al(c,p,.55);c.beginPath();
 for(let j=0;j*s*.87<H+s;j++)for(let i=0;i*s<W+s;i++){const x=i*s+(j%2?s/2:0),y=j*s*.87,g=Math.max(0,Math.min(1,(x/W*.5+(1-y/H)*.5)*(.6+.4*S(t*.8+(x+y)/(W*.35)))*1.3)),r=mx*(.12+.88*g);c.moveTo(x+r,y);c.arc(x,y,r,0,PI*2)}
 c.fill()});
regScene("dots","under","pattern",50,(c,p)=>{   /* 點陣網：等大圓點緩慢漂移 */
 const{W,H,t}=p,s=Math.min(W,H)/(p.lite?12:18),r=s*(.08+.14*p.a)*(1+.2*p.bp),o=(t*s*.25)%s;c.fillStyle=p.C;al(c,p,.45);c.beginPath();
 for(let y=-s+o;y<H+s;y+=s)for(let x=-s+o;x<W+s;x+=s){c.moveTo(x+r,y);c.arc(x,y,r,0,PI*2)}c.fill()});
regScene("checker","under","pattern",40,(c,p)=>{   /* 棋盤格 */
 const{W,H,t}=p,s=Math.min(W,H)/7,o=(t*s*.3)%(s*2);c.fillStyle=p.R;al(c,p,.08+.22*p.a);
 for(let j=-1;j*s<H+s;j++)for(let i=-2;i*s<W+s*2;i++)if((i+j)%2===0)c.fillRect(i*s+o,j*s,s,s)});
regScene("burst","under","radial",50,(c,p)=>{   /* 放射線 */
 const{W,H,t}=p,n=p.lite?24:48,x0=W/2,y0=H/2,R0=H*.1*(1+.25*p.bp),R1=Math.hypot(W,H)*.6;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.003*(.5+p.a));al(c,p,.12+.4*p.a);c.beginPath();
 for(let i=0;i<n;i++){const a=i*PI*2/n+t*.04,e=i%3===0?1:.7;c.moveTo(x0+Math.cos(a)*R0,y0+Math.sin(a)*R0);c.lineTo(x0+Math.cos(a)*R1*e,y0+Math.sin(a)*R1*e)}c.stroke()});
regScene("radial-rects","under","radial",50,(c,p)=>{   /* 放射長方塊 */
 const{W,H,t}=p,n=12,L=H*(.22+.12*p.bp)*(.6+.8*p.a),w=H*.025;c.fillStyle=p.R;al(c,p,.35);
 for(let i=0;i<n;i++){c.save();c.translate(W/2,H/2);c.rotate(i*PI*2/n+t*.15);c.fillRect(H*.28,-w/2,L,w);c.restore()}});
regScene("perspective-grid","under","grid",55,(c,p)=>{   /* 透視格線（地平線以下，向前捲動；線色向地平線漸隱） */
 const{W,H,t}=p,hz=H*.52,m=10,f=(t*.35)%1,gr=c.createLinearGradient(0,hz,0,H);gr.addColorStop(0,p.R+"00");gr.addColorStop(1,p.R);
 c.strokeStyle=gr;c.lineWidth=Math.max(1,H*.0025);al(c,p,.2+.6*p.a);c.beginPath();
 for(let k=0;k<m;k++){const u=(k+f)/m,y=hz+(H-hz)*u*u;c.moveTo(0,y);c.lineTo(W,y)}
 for(let i=-10;i<=10;i++){c.moveTo(W/2+i*W*.012,hz);c.lineTo(W/2+i*W*.16,H)}
 c.stroke()});
regScene("flow-lines","under","flow",50,(c,p)=>{   /* 流動曲線 */
 const{W,H,t}=p,n=7;c.strokeStyle=p.R;c.lineWidth=Math.max(1,H*.003);
 for(let k=0;k<n;k++){al(c,p,(.12+.3*p.a)*(1-k/(n+2)));c.beginPath();for(let x=0;x<=W;x+=W/(p.lite?30:60)){const y=H*(.25+.5*k/(n-1))+S(x/W*PI*2+t*(.6+k*.12)+k)*H*(.04+.04*p.a)*(1+.3*p.bp);x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}});
regScene("stripes","under","stripe",50,(c,p)=>{   /* 平行四邊形條紋（向右慢移） */
 const{W,H,t}=p,sp=W/9,o=(t*sp*.3)%sp,sl=H*.45;c.fillStyle=p.R;al(c,p,.08+.3*p.a);
 for(let x=-sp*2+o;x<W+sp;x+=sp){c.beginPath();c.moveTo(x,H);c.lineTo(x+sp*.38,H);c.lineTo(x+sp*.38+sl,0);c.lineTo(x+sl,0);c.closePath();c.fill()}});
regScene("hatch","under","hatch",50,(c,p)=>{   /* 斜線填紋 */
 const{W,H,t}=p,s=Math.max(8,H/(p.lite?30:45)),o=(t*s*.5)%s;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.0025);al(c,p,.08+.3*p.a);c.beginPath();
 for(let x=-H+o;x<W;x+=s){c.moveTo(x,H);c.lineTo(x+H,0)}c.stroke()});
regScene("diag-split","under","split",50,(c,p)=>{   /* 斜切分割：一側染強調色 */
 const{W,H,t}=p,d=S(t*.5)*W*.03,x1=W*.62+d,x2=W*.38+d;c.fillStyle=p.R;al(c,p,.1+.3*p.a);c.beginPath();c.moveTo(0,0);c.lineTo(x1,0);c.lineTo(x2,H);c.lineTo(0,H);c.closePath();c.fill();
 c.strokeStyle=p.C;c.lineWidth=Math.max(1.5,H*.004);al(c,p,.5);c.beginPath();c.moveTo(x1,0);c.lineTo(x2,H);c.stroke()});
regScene("blocks","under","blocks",45,(c,p)=>{   /* 背景色塊（種子位置，慢漂） */
 const{W,H,t,r}=p;c.fillStyle=p.R;for(let i=0;i<6;i++){const w=W*(.15+r()*.3),h=H*(.15+r()*.4),x=r()*(W-w)+S(t*.2+i)*W*.02,y=r()*(H-h)+S(t*.23+i*2)*H*.02;al(c,p,(.05+.18*p.a)*(.6+.4*r()));c.fillRect(x,y,w,h)}});
regScene("breathing-blocks","under","blocks",45,(c,p)=>{   /* 呼吸方塊格 */
 const{W,H,t}=p,cn=8,s=W/cn,rn=Math.ceil(H/s);c.fillStyle=p.R;al(c,p,.1+.3*p.a);
 for(let j=0;j<rn;j++)for(let i=0;i<cn;i++){const k=.35+.35*S(t*1.6+i*.7+j*.5)+.2*p.bp,z=s*k;c.fillRect(i*s+(s-z)/2,j*s+(s-z)/2,z,z)}});
regScene("squares","under","squares",50,(c,p)=>{   /* 置中套疊方框 */
 const{W,H,t}=p;c.strokeStyle=p.R;c.lineWidth=Math.max(1.5,H*.004);
 for(let k=0;k<6;k++){c.save();c.translate(W/2,H/2);c.rotate((k%2?1:-1)*t*.08*(1+k*.2));al(c,p,(.15+.5*p.a)*(1-k/7));const z=H*(.16+k*.1)*(1+.05*p.bp);c.strokeRect(-z/2,-z/2,z,z);c.restore()}});
regScene("glow-ring","under","ring",60,(c,p)=>{   /* 發光圓環 */
 const{W,H}=p,r=H*.3*(1+.04*p.bp);c.strokeStyle=p.R;c.lineWidth=Math.max(2,H*.012);if(!p.lite){c.shadowColor=p.R;c.shadowBlur=H*.04}al(c,p,.35+.6*p.a);c.beginPath();c.arc(W/2,H/2,r,0,PI*2);c.stroke()});
regScene("rings","under","ring",55,(c,p)=>{   /* 同心圓擴散 */
 const{W,H,t}=p;c.strokeStyle=p.R;c.lineWidth=Math.max(1.5,H*.004);for(let k=0;k<5;k++){const u=(t*.22+k/5)%1;al(c,p,(1-u)*(.2+.6*p.a));c.beginPath();c.arc(W/2,H/2,u*H*.75,0,PI*2);c.stroke()}});
regScene("pulse-circle","under","ring",50,(c,p)=>{   /* 隨拍脈動圓 */
 const{W,H}=p,r=H*.2*(1+.35*p.bp);c.fillStyle=p.R;al(c,p,.12+.3*p.a);c.beginPath();c.arc(W/2,H/2,r,0,PI*2);c.fill()});
/* ---- 覆蓋（over，文字之上）---- */
regScene("glitch-bars","over","glitch",50,(c,p)=>{   /* 故障橫條：每 1/10 秒換一組（種子隨時間格） */
 const{W,H,t}=p,r=sr(p.seed/1000+Math.floor(t*10)),n=3+Math.round(p.a*7);
 for(let i=0;i<n;i++){const y=r()*H,h=H*(.004+r()*.03),x=r()*W*.5,w=W*(.2+r()*.6);c.fillStyle=[p.R,p.G1,p.G2][i%3];al(c,p,.25+.4*r());c.fillRect(x,y,w,h)}});
regScene("guides","over","guide",50,(c,p)=>{   /* 構圖參考：三分線＋黃金螺旋 */
 const{W,H}=p;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.0025);al(c,p,.12+.3*p.a);c.beginPath();
 for(const f of[1/3,2/3]){c.moveTo(W*f,0);c.lineTo(W*f,H);c.moveTo(0,H*f);c.lineTo(W,H*f)}c.stroke();
 let w=Math.min(W*.86,H*.86*1.618),h=w/1.618,x=(W-w)/2,y=(H-h)/2;c.strokeStyle=p.R;al(c,p,.4+.5*p.a);c.lineWidth=Math.max(1.5,H*.004);c.beginPath();
 for(let k=0;k<9;k++){const s=Math.min(w,h),m=k%4;
  if(m===0){c.arc(x+s,y+s,s,PI,1.5*PI);x+=s;w-=s}else if(m===1){c.arc(x,y+s,s,1.5*PI,2*PI);y+=s;h-=s}else if(m===2){c.arc(x+w-s,y,s,0,.5*PI);w-=s}else{c.arc(x+s,y+h-s,s,.5*PI,PI);h-=s}}
 c.stroke()});
regScene("dashed-lines","over","dash",50,(c,p)=>{   /* 虛線參考線（虛線緩慢流動） */
 const{W,H,t}=p,d=H*.02;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.003);c.setLineDash([d,d]);c.lineDashOffset=-t*d*2;al(c,p,.2+.45*p.a);c.beginPath();
 c.moveTo(W/2,0);c.lineTo(W/2,H);c.moveTo(0,H/2);c.lineTo(W,H/2);c.rect(W*.06,H*.08,W*.88,H*.84);c.stroke()});
regScene("ruler","over","ruler",50,(c,p)=>{   /* 尺規刻度（上緣、左緣）＋移動指標 */
 const{W,H,t}=p,s=Math.min(W,H)/40;c.strokeStyle=p.C;c.fillStyle=p.R;c.lineWidth=Math.max(1,H*.0022);al(c,p,.25+.5*p.a);c.beginPath();
 for(let i=0,x=0;x<W;i++,x+=s){const l=i%5?s*.45:s*.9;c.moveTo(x,0);c.lineTo(x,l)}
 for(let i=0,y=0;y<H;i++,y+=s){const l=i%5?s*.45:s*.9;c.moveTo(0,y);c.lineTo(l,y)}c.stroke();
 const mx=(t*.12%1)*W;c.beginPath();c.moveTo(mx,s*1.1);c.lineTo(mx-s*.3,s*1.7);c.lineTo(mx+s*.3,s*1.7);c.closePath();c.fill()});
regScene("target","over","target",50,(c,p)=>{   /* 瞄準框：圓環＋缺口十字＋旋轉四角 */
 const{W,H,t}=p,x=W/2,y=H/2,r=H*.26*(1+.03*p.bp),g=r*.35;c.strokeStyle=p.R;c.lineWidth=Math.max(1.5,H*.004);al(c,p,.3+.6*p.a);c.beginPath();c.arc(x,y,r,0,PI*2);
 c.moveTo(x-r*1.25,y);c.lineTo(x-g,y);c.moveTo(x+g,y);c.lineTo(x+r*1.25,y);c.moveTo(x,y-r*1.25);c.lineTo(x,y-g);c.moveTo(x,y+g);c.lineTo(x,y+r*1.25);c.stroke();
 c.save();c.translate(x,y);c.rotate(t*.4);c.beginPath();for(let i=0;i<4;i++){c.rotate(PI/2);c.moveTo(r*1.1,-r*.12);c.lineTo(r*1.1,r*.12)}c.stroke();c.restore()});
regScene("color-wash","over","wash",30,(c,p)=>{   /* 整面染色（強調色） */
 c.fillStyle=p.R;al(c,p,.05+.4*p.a);c.fillRect(0,0,p.W,p.H)});
regScene("gradient-fade","over","grad",50,(c,p)=>{   /* 底部漸層遮罩（強調色向上淡出） */
 const g=c.createLinearGradient(0,p.H,0,p.H*.35);g.addColorStop(0,p.R);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;al(c,p,.15+.6*p.a);c.fillRect(0,0,p.W,p.H)});
