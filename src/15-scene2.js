/* ===== [SCENE2] 場景層續：P1 補完（pink-stripes diag-fill diag-structure）＋「實驗室」P2／P3（lab:true）。
   規約同 [SCENE]：只用 p.t／p.bp／p.r／p.seed，不用 Math.random、不累積狀態；顏色取 p.R／p.C／p.G1／p.G2；cost 標註成本（輕／中／重）。
   實驗室效果的視覺為依名稱自行詮釋的近似（淨室，未對照 pv-tool 畫面），預設不寫進 AI 規格書。 ===== */
const MONO='ui-monospace,Consolas,Menlo,monospace',TAU=PI*2,lw=(c,p,k,m)=>{c.lineWidth=Math.max(m||1,p.H*k)};
/* ---- P1 補完 ---- */
regScene("pink-stripes","under","stripe",50,(c,p)=>{   /* 粉紅條紋：ghostA／ghostB 交替的斜條，向左慢移 */
 const{W,H,t}=p,sp=W/12,o=(t*sp*.35)%(sp*2),sl=H*.6;
 for(let x=-sp*4-o,i=0;x<W+sp*2;x+=sp,i++){c.fillStyle=i%2?p.G2:p.G1;al(c,p,(.06+.26*p.a)*(i%2?.6:1));c.beginPath();c.moveTo(x,H);c.lineTo(x+sp*.7,H);c.lineTo(x+sp*.7+sl,0);c.lineTo(x+sl,0);c.closePath();c.fill()}});
regScene("diag-fill","under","split",50,(c,p)=>{   /* 斜向填色：一道斜切色帶，色帶邊界隨拍推移，漸層向外淡出 */
 const{W,H,t}=p,d=W*(.04*S(t*.6)+.05*p.bp),g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,p.G1);g.addColorStop(.5,p.R);g.addColorStop(1,p.G2);
 c.fillStyle=g;al(c,p,.1+.4*p.a);c.beginPath();c.moveTo(W*.55+d,0);c.lineTo(W,0);c.lineTo(W,H);c.lineTo(W*.25+d,H);c.closePath();c.fill()});
regScene("diag-structure","under","struct",45,(c,p)=>{   /* 斜向結構線：粗細交錯的平行斜線＋反向細線，構成菱格骨架 */
 const{W,H,t}=p,s=Math.max(30,H/(p.lite?5:7)),o=(t*s*.2)%s;c.strokeStyle=p.R;
 c.beginPath();lw(c,p,.006,2);al(c,p,.1+.35*p.a);for(let x=-H+o;x<W;x+=s){c.moveTo(x,H);c.lineTo(x+H,0)}c.stroke();
 c.beginPath();lw(c,p,.002);c.strokeStyle=p.C;al(c,p,.08+.25*p.a);for(let x=-o;x<W+H;x+=s/2){c.moveTo(x,0);c.lineTo(x-H,H)}c.stroke()});
/* ---- P2：背景／圖案（實驗室）---- */
const LAB={lab:true};
regScene("organic-blob","under","blob",40,(c,p)=>{   /* 有機色塊：三團隨時間呼吸變形的圓潤塊 */
 const{W,H,t,r}=p,n=p.lite?20:40;c.fillStyle=p.R;
 for(let k=0;k<3;k++){const cx=W*(.2+.6*r()),cy=H*(.2+.6*r()),R=H*(.18+.14*r())*(1+.1*p.bp),f=2+k,ph=r()*TAU;al(c,p,(.08+.2*p.a)*(1-k*.2));c.beginPath();
  for(let i=0;i<=n;i++){const a=i/n*TAU,q=R*(1+.18*S(a*f+t*.5+ph)+.1*S(a*(f+2)-t*.7));i?c.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q):c.moveTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q)}c.fill()}},LAB);
regScene("edge-clouds","under","cloud",40,(c,p)=>{   /* 邊緣雲：畫面上下緣一排層疊圓團，緩緩飄移 */
 const{W,H,t,r}=p,n=p.lite?10:16;c.fillStyle=p.C;
 for(const top of[1,0])for(let i=0;i<n;i++){const x=(i+.5)/n*W+S(t*.3+i*1.7)*W*.015,R=H*(.07+.06*r()),y=top?-R*.25+S(t*.4+i)*H*.01:H+R*.25-S(t*.4+i)*H*.01;al(c,p,.05+.14*p.a);c.beginPath();c.arc(x,y,R,0,TAU);c.arc(x+R*.8,y+(top?R*.15:-R*.15),R*.7,0,TAU);c.fill()}},LAB);
regScene("scattered-shapes","under","shapes",45,(c,p)=>{   /* 散落幾何：三角、方、圓隨機散落並緩轉 */
 const{W,H,t,r}=p,n=p.lite?10:16,cl=[p.R,p.G1,p.G2];
 for(let i=0;i<n;i++){const x=r()*W,y=r()*H,z=H*(.03+.05*r()),k=r()*3|0,fill=r()<.5;c.save();c.translate(x,y+S(t*.4+i)*H*.01);c.rotate(t*(.15+.1*(i%3))*(i%2?1:-1)+i);c.fillStyle=c.strokeStyle=cl[i%3];lw(c,p,.003,1.5);al(c,p,(.15+.4*p.a)*(.6+.4*r()));c.beginPath();
  if(k===0){c.moveTo(0,-z);c.lineTo(z,z*.8);c.lineTo(-z,z*.8);c.closePath()}else if(k===1)c.rect(-z*.8,-z*.8,z*1.6,z*1.6);else c.arc(0,0,z*.9,0,TAU);fill?c.fill():c.stroke();c.restore()}},LAB);
regScene("diamond-shapes","under","diamond",45,(c,p)=>{   /* 菱形群：斜向排列的菱形，交替脹縮 */
 const{W,H,t}=p,s=Math.min(W,H)/(p.lite?5:7);c.fillStyle=p.R;c.strokeStyle=p.R;lw(c,p,.003,1.5);
 for(let j=-1;j*s<H+s;j++)for(let i=-1;i*s<W+s;i++){const x=i*s+(j%2?s/2:0),y=j*s*.5+s*.5,z=s*(.22+.2*S(t*1.4+i+j*.8))*(1+.2*p.bp);al(c,p,(.06+.25*p.a)*((i+j)%2?1:.5));c.beginPath();c.moveTo(x,y-z);c.lineTo(x+z,y);c.lineTo(x,y+z);c.lineTo(x-z,y);c.closePath();(i+j)%2?c.fill():c.stroke()}},LAB);
regScene("shadow-shapes","under","shadow",40,(c,p)=>{   /* 陰影幾何：大塊傾斜方塊，帶強調色錯位投影 */
 const{W,H,t,r}=p;
 for(let i=0;i<4;i++){const x=r()*W,y=r()*H,w=W*(.12+.12*r()),h=H*(.2+.2*r()),a=(r()-.5)*.8+S(t*.2+i)*.05,d=H*.012*(1+p.bp);c.save();c.translate(x,y);c.rotate(a);
  c.fillStyle=p.R;al(c,p,.1+.22*p.a);c.fillRect(-w/2+d*2,-h/2+d*2,w,h);c.fillStyle="#000";al(c,p,.1+.25*p.a);c.fillRect(-w/2,-h/2,w,h);c.restore()}},LAB);
regScene("balancing-circles","under","circles",45,(c,p)=>{   /* 平衡圓：橫桿隨時間傾斜，兩端圓大小相反 */
 const{W,H,t}=p,a=S(t*.7)*.12*(1+.4*p.bp),L=W*.28,cx=W/2,cy=H*.78;c.save();c.translate(cx,cy);c.rotate(a);c.strokeStyle=c.fillStyle=p.R;lw(c,p,.004,2);al(c,p,.2+.5*p.a);
 c.beginPath();c.moveTo(-L,0);c.lineTo(L,0);c.stroke();c.beginPath();c.arc(-L,-H*.06,H*.06*(1+.3*S(t*.7)),0,TAU);c.fill();c.beginPath();c.arc(L,-H*.045,H*.045*(1-.3*S(t*.7)),0,TAU);c.fill();c.restore();
 c.beginPath();c.moveTo(cx,cy);c.lineTo(cx-H*.04,H);c.lineTo(cx+H*.04,H);c.closePath();al(c,p,.15+.3*p.a);c.fill()},LAB);
regScene("web-lines","under","web",45,(c,p)=>{   /* 蛛網連線：漂移的節點，距離近的連線 */
 const{W,H,t,r}=p,n=p.lite?10:18,pts=[];for(let i=0;i<n;i++){const x0=r(),y0=r(),sx=.2+r()*.4,sy=.2+r()*.4,ph=r()*TAU;pts.push([(x0+.08*S(t*sx+ph))*W,(y0+.08*S(t*sy+ph*1.3))*H])}
 const D=Math.min(W,H)*.32;c.strokeStyle=p.R;lw(c,p,.002);
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);if(d<D){al(c,p,(1-d/D)*(.15+.5*p.a));c.beginPath();c.moveTo(...pts[i]);c.lineTo(...pts[j]);c.stroke()}}
 c.fillStyle=p.C;al(c,p,.3+.4*p.a);pts.forEach(q=>{c.beginPath();c.arc(q[0],q[1],H*.005*(1+p.bp),0,TAU);c.fill()})},{lab:true,cost:"中"});
regScene("cross-pattern","under","cross",45,(c,p)=>{   /* 十字圖案：規則的加號陣列，緩慢旋轉 */
 const{W,H,t}=p,s=Math.min(W,H)/(p.lite?8:12),z=s*.18;c.strokeStyle=p.C;lw(c,p,.003,1.5);al(c,p,.06+.3*p.a);c.beginPath();
 for(let y=s/2;y<H;y+=s)for(let x=s/2;x<W;x+=s){const a=t*.3*((x+y)/s%2?1:-1)*.2;const ca=Math.cos(a),sa=Math.sin(a);c.moveTo(x-z*ca,y-z*sa);c.lineTo(x+z*ca,y+z*sa);c.moveTo(x+z*sa,y-z*ca);c.lineTo(x-z*sa,y+z*ca)}c.stroke()},LAB);
regScene("triangle-grid","under","tri",45,(c,p)=>{   /* 三角網格：三個方向的線構成三角格，向上緩移 */
 const{W,H,t}=p,s=H/(p.lite?5:8),hh=s*.866,o=(t*s*.15)%hh;c.strokeStyle=p.R;lw(c,p,.002);al(c,p,.08+.3*p.a);c.beginPath();
 for(let y=-hh+o;y<H+hh;y+=hh){c.moveTo(0,y);c.lineTo(W,y)}
 for(let x=-H*1.2;x<W+H*1.2;x+=s){c.moveTo(x,H);c.lineTo(x+H/Math.tan(PI/3),0);c.moveTo(x,0);c.lineTo(x+H/Math.tan(PI/3),H)}c.stroke()},LAB);
regScene("pink-grid","under","gridp",45,(c,p)=>{   /* 粉紅方格：ghostA 格線，部分格子隨節拍閃爍填色 */
 const{W,H,t}=p,cn=p.lite?8:12,s=W/cn,rn=Math.ceil(H/s);c.strokeStyle=p.G1;lw(c,p,.002);al(c,p,.1+.3*p.a);c.beginPath();
 for(let i=0;i<=cn;i++){c.moveTo(i*s,0);c.lineTo(i*s,H)}for(let j=0;j<=rn;j++){c.moveTo(0,j*s);c.lineTo(W,j*s)}c.stroke();
 c.fillStyle=p.G1;const k=Math.floor(t*4);
 for(let j=0;j<rn;j++)for(let i=0;i<cn;i++){const h=sr(hashN(i+","+j)/1000+k*.31)();if(h<.1){al(c,p,(.1+.35*p.a)*(.6+.4*p.bp));c.fillRect(i*s,j*s,s,s)}}},LAB);
regScene("jigsaw-grid","under","jig",40,(c,p)=>{   /* 拼圖格：格線上交錯的圓形凸／凹榫（每條邊的方向由格座標雜湊決定） */
 const{W,H,t}=p,cn=p.lite?5:7,s=W/cn,rn=Math.ceil(H/s),b=s*.1,o=S(t*.5)*s*.02;c.strokeStyle=p.R;lw(c,p,.003,1.5);al(c,p,.1+.35*p.a);c.beginPath();
 for(let j=0;j<=rn;j++)for(let i=0;i<cn;i++){const x=i*s+o,y=j*s,d=hashN(i+":"+j)%2?1:-1;c.moveTo(x,y);c.lineTo(x+s*.5-b,y);c.moveTo(x+s*.5+b,y);c.lineTo(x+s,y);c.moveTo(x+s*.5+b,y-d*b);c.arc(x+s*.5,y-d*b,b,0,TAU)}
 for(let i=0;i<=cn;i++)for(let j=0;j<rn;j++){const x=i*s+o,y=j*s,d=hashN(j+"|"+i)%2?1:-1;c.moveTo(x,y);c.lineTo(x,y+s*.5-b);c.moveTo(x,y+s*.5+b);c.lineTo(x,y+s);c.moveTo(x+d*b+b,y+s*.5);c.arc(x+d*b,y+s*.5,b,0,TAU)}c.stroke()},{lab:true,cost:"中"});
regScene("texture-bg","under","tex",40,(c,p)=>{   /* 紙質紋理：種子斑點與細纖維，整體微微漂移 */
 const{W,H,t,r}=p,n=p.lite?120:300,ox=S(t*.1)*W*.004,oy=Math.cos(t*.08)*H*.004;c.fillStyle=p.C;c.strokeStyle=p.C;lw(c,p,.0012);
 for(let i=0;i<n;i++){const x=r()*W+ox,y=r()*H+oy,z=H*(.001+.003*r()),q=r();al(c,p,(.08+.3*p.a)*q);if(i%4){c.beginPath();c.arc(x,y,z,0,TAU);c.fill()}else{const a=r()*TAU,l=H*(.01+.03*r());c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}}},{lab:true,cost:"中"});
regScene("pixel-bg","under","pix",40,(c,p)=>{   /* 像素背景：粗像素格的值雜訊，每 0.25 秒換一格 */
 const{W,H,t}=p,cs=Math.max(8,H/(p.lite?16:26)),k=Math.floor(t*4);c.fillStyle=p.R;
 for(let y=0;y<H;y+=cs)for(let x=0;x<W;x+=cs){const v=sr(hashN((x/cs|0)+","+(y/cs|0))/1000+k*.173)();if(v>.55){al(c,p,(v-.55)*(.2+.7*p.a));c.fillRect(x,y,cs-1,cs-1)}}},{lab:true,cost:"中"});
regScene("star-trail","under","star",45,(c,p)=>{   /* 星軌：繞著畫面外極點旋轉的星點與弧形拖尾 */
 const{W,H,t,r}=p,n=p.lite?24:48,px=W*.7,py=-H*.2,w=.05;c.strokeStyle=p.C;lw(c,p,.0025,1);
 for(let i=0;i<n;i++){const R=H*(.35+r()*1.1),a0=r()*TAU,a=a0+t*w,l=.12+.25*r(),tw=.6+.4*S(t*2+i);al(c,p,(.3+.65*p.a)*tw);c.beginPath();c.arc(px,py,R,a-l,a);c.stroke()}},LAB);
regScene("light-spot","under","light",40,(c,p)=>{   /* 光斑：兩道緩動聚光，中心較亮 */
 const{W,H,t}=p;for(let k=0;k<2;k++){const x=W*(.5+.3*S(t*.31+k*2.4)),y=H*(.45+.25*Math.cos(t*.27+k*1.7)),R=H*(.45+.1*p.bp),g=c.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,k?p.R:p.C);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;al(c,p,.08+.35*p.a);c.fillRect(0,0,W,H)}},LAB);
/* ---- P2：邊框／HUD（over）---- */
regScene("screen-border","over","border",45,(c,p)=>{   /* 螢幕邊框：雙層內縮邊框，四角缺口 */
 const{W,H}=p,m=H*.035,q=m*.5;c.strokeStyle=p.R;lw(c,p,.006,2);al(c,p,.3+.6*p.a);c.strokeRect(m,m,W-2*m,H-2*m);lw(c,p,.002);al(c,p,.2+.4*p.a);c.strokeRect(m+q,m+q,W-2*(m+q),H-2*(m+q));
 c.fillStyle=p.R;al(c,p,.4+.5*p.a);[[m,m],[W-m,m],[m,H-m],[W-m,H-m]].forEach(([x,y])=>c.fillRect(x-q*.5,y-q*.5,q,q))},LAB);
regScene("scalloped-border","over","border",45,(c,p)=>{   /* 波浪花邊：四邊一排半圓扇貝 */
 const{W,H,t}=p,r=H*.022,o=(t*r*.5)%(r*2);c.fillStyle=p.R;al(c,p,.25+.55*p.a);c.beginPath();
 for(let x=-r*2+o;x<W+r;x+=r*2){c.moveTo(x+r,0);c.arc(x,0,r,0,PI);c.moveTo(x+r,H);c.arc(x,H,r,PI,TAU)}
 for(let y=-r*2+o;y<H+r;y+=r*2){c.moveTo(0,y+r);c.arc(0,y,r,PI/2,PI*1.5,true);c.moveTo(W,y+r);c.arc(W,y,r,PI*1.5,PI/2,true)}c.fill()},LAB);
regScene("hud-corners","over","hudc",50,(c,p)=>{   /* HUD 四角：L 形角標＋刻度，隨拍閃一下 */
 const{W,H,t}=p,m=H*.04,l=H*.09;c.strokeStyle=p.R;lw(c,p,.004,2);al(c,p,.35+.5*p.a+.1*p.bp);c.beginPath();
 [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(([x,y,sx,sy])=>{c.moveTo(x,y+sy*l);c.lineTo(x,y);c.lineTo(x+sx*l,y);for(let i=1;i<4;i++){c.moveTo(x+sx*l*(.2+i*.15),y);c.lineTo(x+sx*l*(.2+i*.15),y+sy*l*.1)}});c.stroke()},LAB);
regScene("hud-info","over","hudi",50,(c,p)=>{   /* HUD 資訊面板（右上）：標題、數據列與條 */
 const{W,H,t}=p,w=W*(W>H?.2:.36),h=H*.16,x=W-w-H*.04,y=H*.04,f=Math.max(9,H*.02);c.strokeStyle=p.R;lw(c,p,.002);al(c,p,.3+.5*p.a);c.strokeRect(x,y,w,h);c.fillStyle=p.R;c.font=`${f}px ${MONO}`;c.textBaseline="top";
 c.fillText("SYSTEM INFO",x+f*.6,y+f*.5);for(let i=0;i<3;i++){const v=.5+.45*S(t*(.7+i*.3)+i*2);c.fillStyle=p.C;c.fillText(["CPU","MEM","NET"][i]+" "+String(Math.round(v*100)).padStart(3," ")+"%",x+f*.6,y+f*(1.9+i*1.3));c.fillStyle=p.R;c.fillRect(x+w*.58,y+f*(2.05+i*1.3),w*.36*v,f*.5)}},LAB);
regScene("hud-status","over","huds",50,(c,p)=>{   /* HUD 狀態文字（左下）：REC 計時＋BPM */
 const{W,H,t}=p,f=Math.max(10,H*.024),x=H*.05,y=H-H*.05,ct=Math.floor(t),ms=Math.floor(t%1*10);c.font=`${f}px ${MONO}`;c.textBaseline="alphabetic";c.fillStyle=p.G1;al(c,p,(Math.floor(t*2)%2?.35:.9)*(.5+.5*p.a));c.beginPath();c.arc(x+f*.4,y-f*1.25,f*.32,0,TAU);c.fill();
 c.fillStyle=p.R;al(c,p,.4+.55*p.a);c.fillText("REC  00:"+String(Math.floor(ct/60)).padStart(2,"0")+":"+String(ct%60).padStart(2,"0")+"."+ms,x+f*1.1,y-f);c.fillStyle=p.C;al(c,p,.3+.4*p.a);c.fillText("BPM "+Math.round(CONFIG.bpm)+"  ·  STANDBY",x,y)},LAB);
regScene("data-monitors","over","mon",45,(c,p)=>{   /* 資料監視器（右下）：波形折線＋長條 */
 const{W,H,t}=p,w=W*(W>H?.2:.4),h=H*.1,x=W-w-H*.04,y=H-h-H*.04;c.strokeStyle=p.R;lw(c,p,.002);al(c,p,.3+.5*p.a);c.strokeRect(x,y,w,h);c.beginPath();
 for(let i=0;i<=40;i++){const u=i/40,v=.5+.3*S(u*9+t*3)*S(u*3-t)+.1*p.bp;i?c.lineTo(x+u*w,y+h*(1-v)):c.moveTo(x+u*w,y+h*(1-v))}c.stroke();
 c.fillStyle=p.G2;for(let i=0;i<8;i++){const v=.2+.7*Math.abs(S(t*(1+i*.2)+i));al(c,p,.35+.4*p.a);c.fillRect(x+w*.05+i*w*.045,y-h*.1-h*.5*v,w*.03,h*.5*v)}},LAB);
regScene("pixel-window","over","win",40,(c,p)=>{   /* 像素視窗（左上）：復古作業系統小視窗，標題列＋三顆按鈕 */
 const{W,H,t}=p,w=W*(W>H?.2:.42),h=H*.14,x=H*.05,y=H*.05+S(t*.5)*H*.004,tb=h*.22;c.fillStyle="#000";al(c,p,.45*p.a+.1);c.fillRect(x,y,w,h);c.fillStyle=p.R;al(c,p,.5+.4*p.a);c.fillRect(x,y,w,tb);
 c.strokeStyle=p.R;lw(c,p,.003,2);c.strokeRect(x,y,w,h);c.fillStyle=p.C;[0,1,2].forEach(i=>c.fillRect(x+w-(i+1)*tb*1.1,y+tb*.2,tb*.6,tb*.6));
 c.font=`${Math.max(9,tb*.7)}px ${MONO}`;c.textBaseline="middle";c.fillStyle="#000";c.fillText("lyrics.exe",x+tb*.4,y+tb*.5);c.fillStyle=p.C;for(let i=0;i<3;i++)c.fillRect(x+tb*.4,y+tb*(1.6+i*.8),w*(.4+.4*Math.abs(S(i*2+Math.floor(t))))*.8,tb*.3)},LAB);
regScene("desktop-icon","over","icon",40,(c,p)=>{   /* 桌面圖示（左側一排）：資料夾圖示＋檔名 */
 const{H,t}=p,s=H*.07,x=H*.05,f=Math.max(9,s*.2);c.font=`${f}px ${MONO}`;c.textAlign="center";c.textBaseline="top";
 ["LYRICS","MEMO","MUSIC","TRASH"].forEach((n,i)=>{const y=H*.3+i*s*1.5,hl=Math.floor(t*.5)%4===i;c.fillStyle=p.R;al(c,p,(.4+.5*p.a)*(hl?1:.7));c.fillRect(x,y+s*.15,s*.45,s*.12);c.fillRect(x,y+s*.25,s,s*.6);c.fillStyle=p.C;al(c,p,.5+.4*p.a);c.fillText(n,x+s/2,y+s*.95)});c.textAlign="start"},LAB);
/* ---- P3（實驗室，最複雜；成本較高）---- */
regScene("smear-brush","under","smear",35,(c,p)=>{   /* 塗抹筆刷：數道粗筆觸，邊緣以多重細筆毛刺模擬，緩緩橫移 */
 const{W,H,t,r}=p,n=p.lite?3:5;c.lineCap="round";c.strokeStyle=p.R;
 for(let k=0;k<n;k++){const y=H*(.15+.7*r()),x0=W*(-.1+.3*r()),L=W*(.5+.5*r()),th=H*(.05+.06*r()),sh=(t*W*.02+k*37)%(W*.08);
  for(let b=0;b<(p.lite?4:9);b++){const yy=y+(b-4)*th/9,wob=S(b*1.7+k)*th*.1;al(c,p,(.04+.1*p.a)*(.6+.4*r()));c.lineWidth=th/9*1.4;c.beginPath();c.moveTo(x0+sh+wob,yy);c.quadraticCurveTo(x0+L*.5+sh,yy+S(t*.4+k+b)*th*.15,x0+L+sh-wob*2,yy+wob);c.stroke()}}},{lab:true,cost:"中"});
regScene("paper-tear","over","tear",40,(c,p)=>{   /* 撕紙邊：畫面下緣一條不規則撕裂的紙邊＋陰影 */
 const{W,H,r}=p,n=p.lite?30:60,y0=H*.93,pts=[];for(let i=0;i<=n;i++)pts.push([i/n*W,y0+(r()-.5)*H*.022+S(i*.7)*H*.006]);
 c.beginPath();c.moveTo(0,H);pts.forEach(q=>c.lineTo(q[0],q[1]));c.lineTo(W,H);c.closePath();c.shadowColor="rgba(0,0,0,.6)";c.shadowBlur=H*.015;c.shadowOffsetY=-H*.004;c.fillStyle=p.C;al(c,p,.35+.55*p.a);c.fill()},{lab:true,cost:"中"});
regScene("blood-splatter","under","splat",40,(c,p)=>{   /* 噴濺：中心大滴＋放射小滴＋向下流淌的血痕（用 ghostA 色，不寫死紅色） */
 const{W,H,t,r}=p,cx=W*(.3+.4*r()),cy=H*(.3+.3*r()),n=p.lite?16:34,g=Math.min(1,t*1.5+.2);c.fillStyle=p.G1;al(c,p,.35+.5*p.a);
 c.beginPath();c.arc(cx,cy,H*.05*g,0,TAU);c.fill();
 for(let i=0;i<n;i++){const a=r()*TAU,d=H*(.07+.3*r())*g,z=H*(.004+.016*r())*(1-d/(H*.4)*.5);c.beginPath();c.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,Math.max(1,z),0,TAU);c.fill()}
 for(let i=0;i<4;i++){const x=cx+(r()-.5)*H*.1,l=H*(.1+.2*r())*Math.min(1,t*.4),w=H*.008;c.fillRect(x-w/2,cy,w,l);c.beginPath();c.arc(x,cy+l,w*.8,0,TAU);c.fill()}},{lab:true,cost:"中"});
regScene("crime-tape","over","tape",45,(c,p)=>{   /* 警戒膠帶：兩條交叉斜帶，黑色斜紋＋文字（帶色取強調色，位於畫面邊緣不蓋主文） */
 const{W,H,t}=p,h=H*.06,f=h*.55,txt="  LYRIC SCENE · DO NOT CROSS ·",L=txt.length*f*.62;
 for(const[x0,y0,x1,y1] of[[-W*.05,H*.18,W*1.05,H*.06],[-W*.05,H*.9,W*1.05,H*.8]]){c.save();c.translate(x0,y0);c.rotate(Math.atan2(y1-y0,x1-x0));const ln=Math.hypot(x1-x0,y1-y0);
  c.fillStyle=p.R;al(c,p,.5+.45*p.a);c.fillRect(0,-h/2,ln,h);c.fillStyle="#000";al(c,p,.5+.4*p.a);for(let x=-h+(t*h*.3)%(h*1.6);x<ln;x+=h*1.6){c.beginPath();c.moveTo(x,-h/2);c.lineTo(x+h*.5,-h/2);c.lineTo(x+h*.5-h*.4,h/2);c.lineTo(x-h*.4,h/2);c.fill()}
  c.font=`bold ${f}px ${MONO}`;c.textBaseline="middle";c.fillStyle="#000";al(c,p,.85);for(let x=-L+(t*f*2)%L;x<ln;x+=L)c.fillText(txt,x,0);c.restore()}},{lab:true,cost:"中"});
regScene("planet","under","planet",45,(c,p)=>{   /* 行星：右下大球（漸層球體）＋傾斜光環＋一顆繞行小衛星 */
 const{W,H,t}=p,x=W*.78,y=H*.7,R=H*.2*(1+.015*p.bp),g=c.createRadialGradient(x-R*.35,y-R*.35,R*.1,x,y,R);g.addColorStop(0,p.C);g.addColorStop(.45,p.R);g.addColorStop(1,"#000");
 c.save();c.translate(x,y);c.rotate(-.35);c.strokeStyle=p.C;lw(c,p,.004,2);al(c,p,.15+.3*p.a);c.beginPath();c.ellipse(0,0,R*1.7,R*.4,0,PI,TAU);c.stroke();c.restore();
 c.fillStyle=g;al(c,p,.2+.6*p.a);c.beginPath();c.arc(x,y,R,0,TAU);c.fill();
 c.save();c.translate(x,y);c.rotate(-.35);c.strokeStyle=p.C;lw(c,p,.004,2);al(c,p,.2+.4*p.a);c.beginPath();c.ellipse(0,0,R*1.7,R*.4,0,0,PI);c.stroke();c.restore();
 const a=t*.5;c.fillStyle=p.C;al(c,p,.5+.4*p.a);c.beginPath();c.arc(x+Math.cos(a)*R*2.1,y+Math.sin(a)*R*.7,R*.1,0,TAU);c.fill()},{lab:true,cost:"中"});
