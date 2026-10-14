/* ===== [DECOR-K] 裝飾場景 K（JIZURA 移植・第二批）：crop-marks（トンボ）／crosshair（照準線）／dimension-lines（寸法線）／edge-ticks（端の目盛り）。
   全部是細線，畫在文字之上（over 層）、不填色、不遮影片；時間純函數。概念參考 JIZURA 裝飾部品（原作者 hakoniwa，MIT，授權見根目錄 LICENSE），以 Canvas 2D 自行繪製。 ===== */
regScene("crop-marks","over","crop",50,(c,p)=>{   /* トンボ：四角的裁切標記（L 形，外側各一條短線），輕微隨拍 */
 const{W,H}=p,m=H*.05,l=H*.05,g=H*.012;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.0025);al(c,p,.35+.5*p.a);c.beginPath();
 [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(([x,y,sx,sy])=>{c.moveTo(x-sx*(g+l),y);c.lineTo(x-sx*g,y);c.moveTo(x,y-sy*(g+l));c.lineTo(x,y-sy*g)});c.stroke()});
regScene("crosshair","over","cross2",50,(c,p)=>{   /* 照準線：貫穿畫面的細十字＋中央小圓，圓緩慢呼吸；中央留白（不穿過文字中心） */
 const{W,H,t}=p,x=W/2,y=H/2,r=H*.035*(1+.15*S(t*1.6)+.1*p.bp),gap=r*1.6;c.strokeStyle=p.R;c.lineWidth=Math.max(1,H*.0022);al(c,p,.25+.45*p.a);c.beginPath();
 c.moveTo(0,y);c.lineTo(x-gap,y);c.moveTo(x+gap,y);c.lineTo(W,y);c.moveTo(x,0);c.lineTo(x,y-gap);c.moveTo(x,y+gap);c.lineTo(x,H);c.moveTo(x+r,y);c.arc(x,y,r,0,PI*2);c.stroke()});
regScene("dimension-lines","over","dim",50,(c,p)=>{   /* 寸法線：畫面上緣與左緣各一條帶箭頭的尺寸線，線上有小短刻（像製圖標註），不寫數字 */
 const{W,H}=p,m=H*.05,a=H*.014;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.0022);al(c,p,.3+.5*p.a);c.beginPath();
 c.moveTo(m,m);c.lineTo(W-m,m);c.moveTo(m,m);c.lineTo(m+a*1.6,m-a*.6);c.moveTo(m,m);c.lineTo(m+a*1.6,m+a*.6);c.moveTo(W-m,m);c.lineTo(W-m-a*1.6,m-a*.6);c.moveTo(W-m,m);c.lineTo(W-m-a*1.6,m+a*.6);
 c.moveTo(m,m-a);c.lineTo(m,m+a);c.moveTo(W-m,m-a);c.lineTo(W-m,m+a);
 c.moveTo(m,m);c.lineTo(m,H-m);c.moveTo(m,m);c.lineTo(m-a*.6,m+a*1.6);c.moveTo(m,m);c.lineTo(m+a*.6,m+a*1.6);c.moveTo(m,H-m);c.lineTo(m-a*.6,H-m-a*1.6);c.moveTo(m,H-m);c.lineTo(m+a*.6,H-m-a*1.6);
 c.moveTo(m-a,H-m);c.lineTo(m+a,H-m);c.stroke()});
regScene("edge-ticks","over","edge",45,(c,p)=>{   /* 端の目盛り：畫面四邊中央各一小段短刻度（像相機取景器），隨時間有一個亮點沿著下緣緩慢移動 */
 const{W,H,t}=p,s=H*.012,n=11;c.strokeStyle=p.C;c.lineWidth=Math.max(1,H*.002);al(c,p,.3+.5*p.a);c.beginPath();
 for(let i=0;i<n;i++){const f=(i-(n-1)/2)*s*2.4,l=i%5===0?s*1.6:s;c.moveTo(W/2+f,H-H*.04);c.lineTo(W/2+f,H-H*.04-l);c.moveTo(W/2+f,H*.04);c.lineTo(W/2+f,H*.04+l);c.moveTo(W*.025,H/2+f);c.lineTo(W*.025+l,H/2+f);c.moveTo(W*.975,H/2+f);c.lineTo(W*.975-l,H/2+f)}c.stroke();
 const k=((t*.1)%1)*(n-1)-(n-1)/2;c.fillStyle=p.R;c.beginPath();c.arc(W/2+k*s*2.4,H-H*.04-s*2.2,s*.35,0,PI*2);c.fill()});
