/* ===== [BEATFX] 節拍後製：震動／縮放／傾斜／色相（CONFIG.beatShake／beatZoom／beatTilt／beatHue，預設 0＝關）。
   作用於 #stage 的獨立屬性 translate／scale／rotate，與色相走 CSS 變數 --bhue（併入 toneCss 的濾鏡，綠幕時自動關閉）。
   時間純函數：只由 t、BPM、offset 與種子亂數 sr() 決定（不吃音訊節拍／不累積狀態），離線渲染與預覽一致；錄製時建議關閉色相（重濾鏡）。 ===== */
let bfxOn=false;
function beatFx(t){
 const o=CONFIG,sh=+o.beatShake||0,zm=+o.beatZoom||0,tl=+o.beatTilt||0,hu=+o.beatHue||0,s=$("#stage").style;
 if(!(sh||zm||tl||hu)){if(bfxOn){s.translate=s.scale=s.rotate="";document.documentElement.style.removeProperty("--bhue");bfxOn=false}return}
 bfxOn=true;const b=(t-o.offset)*o.bpm/60,n=Math.floor(b),e=b<0?0:Math.exp(-(b-n)*6),rr=sr((n+.5)/1000),dx=rr()*2-1,dy=rr()*2-1,sg=n%2?1:-1;
 s.translate=sh?`${(dx*sh*e).toFixed(3)}% ${(dy*sh*e).toFixed(3)}%`:"";
 s.scale=(sh||zm)?String((1+2*sh/100+zm/100*e).toFixed(4)):"";
 s.rotate=tl?`${(sg*tl*e).toFixed(3)}deg`:"";
 document.documentElement.style.setProperty("--bhue",hu?`${(sg*hu*e).toFixed(2)}deg`:"0deg")}
P.push(["beatShake","節拍震動 %",0,5,.1],["beatZoom","節拍縮放 %",0,10,.5],["beatTilt","節拍傾斜(度)",0,5,.1],["beatHue","節拍色相(度)",0,90,5],["sceneMax","每句場景層上限",1,5,1]);
