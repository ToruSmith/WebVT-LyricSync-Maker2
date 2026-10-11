/* ===== [BEATFX] 節拍後製：震動／縮放／傾斜／色相（CONFIG.beatShake／beatZoom／beatTilt／beatHue，預設 0＝關）。
   作用於 #stage 的獨立屬性 translate／scale／rotate，與色相走 CSS 變數 --bhue（併入 toneCss 的濾鏡，綠幕時自動關閉）。
   時間純函數：只由 t、BPM、offset 與種子亂數 sr() 決定（不吃音訊節拍／不累積狀態），離線渲染與預覽一致；錄製時建議關閉色相（重濾鏡）。 ===== */
let bfxOn=false,bfxRec=false,bfxAb=0,bfxHit=-9;
function isRec(){return!RENDER&&document.body.classList.contains("rec")}   /* 預覽錄製中（非離線）：色相濾鏡太重，自動關閉 */
function beatFx(t){
 const o=CONFIG,ov=cur>=0&&subs[cur]?sceneBfx(subs[cur]):null,rec=isRec();   /* 單句覆寫：&bfx-shake:2 等（見 [SCENE]）；沒有覆寫就用全域值 */
 const sh=+(ov&&"shake"in ov?ov.shake:o.beatShake)||0,zm=+(ov&&"zoom"in ov?ov.zoom:o.beatZoom)||0,tl=+(ov&&"tilt"in ov?ov.tilt:o.beatTilt)||0,hu=rec?0:+(ov&&"hue"in ov?ov.hue:o.beatHue)||0,s=$("#stage").style;
 if(rec!==bfxRec||(hu!==0)!==bfxHueF){bfxRec=rec;bfxHueF=hu!==0;toneCss()}
 if(!(sh||zm||tl||hu)){if(bfxOn){s.translate=s.scale=s.rotate="";document.documentElement.style.removeProperty("--bhue");bfxOn=false}return}
 bfxOn=true;const b=(t-o.offset)*o.bpm/60;let n=Math.floor(b),e=b<0?0:Math.exp(-(b-n)*6);
 if(o.beatSrc==="audio"&&an){   /* 音訊驅動：以 abeat（偵測到的低頻拍）計數與其發生時間做衰減；沒有音訊分析器時退回 BPM。離線渲染的 __setAudio 路徑逐格確定，預覽與離線一致性待整合階段實測 */
  if(abeat!==bfxAb){bfxAb=abeat;bfxHit=t}
  n=abeat;e=t>=bfxHit?Math.exp(-(t-bfxHit)*6):0}
 const rr=sr((n+.5)/1000),dx=rr()*2-1,dy=rr()*2-1,sg=n%2?1:-1;
 s.translate=sh?`${(dx*sh*e).toFixed(3)}% ${(dy*sh*e).toFixed(3)}%`:"";
 s.scale=(sh||zm)?String((1+2*sh/100+zm/100*e).toFixed(4)):"";
 s.rotate=tl?`${(sg*tl*e).toFixed(3)}deg`:"";
 document.documentElement.style.setProperty("--bhue",hu?`${(sg*hu*e).toFixed(2)}deg`:"0deg")}
P.push(["beatShake","節拍震動 %",0,5,.1],["beatZoom","節拍縮放 %",0,10,.5],["beatTilt","節拍傾斜(度)",0,5,.1],["beatHue","節拍色相(度)",0,90,5],["sceneMax","每句場景層上限",1,5,1]);
