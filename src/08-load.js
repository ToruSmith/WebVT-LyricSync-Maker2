/* ===== [LOAD] 載入 SRT・媒體・範例 / 播放暫停 / 快捷鍵 ===== */
const txt=f=>f.arrayBuffer().then(b=>new TextDecoder("utf-8").decode(b));
/* 字幕檔編碼自動判斷：UTF-16（有 BOM）→ UTF-8（嚴格）→ Big5 → GBK → 最後放寬的 UTF-8。Big5／GBK 無法百分之百分辨，所以載入後會在提示列寫出判斷結果。 */
const txtAuto=async f=>{const b=new Uint8Array(await f.arrayBuffer());
 if(b[0]===0xFF&&b[1]===0xFE)return{text:new TextDecoder("utf-16le").decode(b),enc:"UTF-16"};
 if(b[0]===0xFE&&b[1]===0xFF)return{text:new TextDecoder("utf-16be").decode(b),enc:"UTF-16"};
 for(const [n,l] of [["utf-8","UTF-8"],["big5","Big5"],["gbk","GBK"]])try{return{text:new TextDecoder(n,{fatal:true}).decode(b),enc:l}}catch(e){}
 return{text:new TextDecoder("utf-8").decode(b),enc:"UTF-8（有無法辨識的字元）"}};
$("#fs").onchange=async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
 const {text,enc}=await txtAuto(f),info={},a=parseSubs(text,f.name,info);
 if(!a.length){note("沒有讀到可用的字幕（判斷為 "+info.fmt+"，編碼 "+enc+(info.bad?"，"+info.bad+" 句時間格式異常":"")+"）。目前的字幕沒有變動。");return}
 subs=a;cur=-2;subsReplaced();
 note(subs.length+" 句已載入（"+info.fmt+"，"+enc+(/^(Big5|GBK)$/.test(enc)?" 自動判斷，若出現亂碼請先轉存為 UTF-8":"")+(info.bad?"；略過 "+info.bad+" 句時間格式異常":"")+(info.sorted?"；已依時間排序":"")+"）")};
$("#fm").onchange=e=>{const f=e.target.files[0];e.target.value="";if(!f)return;mUrl&&URL.revokeObjectURL(mUrl);m.src=mUrl=URL.createObjectURL(f);mediaInfo={name:f.name,video:f.type.startsWith("video")};hasMedia=true;pause();m.style.display=f.type.startsWith("video")?"block":"none";cur=-2;note("媒體已載入")};
$("#demo").onclick=()=>{CONFIG.lock="";CONFIG.auto=false;Object.assign(CONFIG,{posAnchor:"",posX:0,posY:0});save();panel(); /* 範例要照標記呈現，先解除鎖定與自動變化 */
 subs=parseSRT(DEMO);subsReplaced();hasMedia=false;m.removeAttribute("src");m.style.display="none";vt=0;cur=-2;Object.assign(CONFIG,{bpm:120,offset:0});play()};
function play(){if(!hasMedia&&vt>=endT())vt=0;playing=true;hasMedia&&(m.play(),initAudio());$("#play").textContent="暫停"}
function pause(){playing=false;hasMedia&&m.pause();$("#play").textContent="播放"}
$("#play").onclick=()=>playing?pause():play();
m.onended=()=>{playing=false;$("#play").textContent="播放";done()};
m.onplay=()=>playing=true;
function note(s){$("#note").textContent=s}
subs=parseSRT(DEMO);note("示範模式：錄出的影片為靜音（預期行為）。載入音樂/影片後才有聲音。");
/* 快捷鍵：空白鍵 播放/暫停，← → 跳轉 5 秒 */
document.addEventListener("keydown",e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&e.target.type!=="range")return;
 if(e.code==="Space"){e.preventDefault();$("#play").click()}
 else if((e.code==="ArrowLeft"||e.code==="ArrowRight")&&!e.ctrlKey&&!e.metaKey){if(e.target.type==="range"&&e.target.id!=="seek")return;e.preventDefault();const d=e.code==="ArrowLeft"?-5:5;hasMedia?m.currentTime=Math.max(0,m.currentTime+d):vt=Math.max(0,Math.min(endT(),vt+d));cur=-2}});
