/* ===== [CONFIG] 可調參數預設值、字體表 FONTS、範例字幕 DEMO、全域狀態（面板與 CONFIG 雙向綁定；其餘參數另在 [UI-EXTRA]/[OVERLAY] 補登）===== */
const CONFIG={bpm:120,offset:0,pulse:.05,bounce:12,flash:.08,flashEvery:4,speed:1,enter:.6,exit:.4,
 bigRatio:.25,spacing:.5,weight:300,color:"#ffffff",accent:"#7aa8ff",dim:50,font:"明體",auto:false};
const FONTS={明體:'"Noto Serif TC","Source Han Serif TC","Songti TC",PMingLiU,serif',
 黑體:'"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif',
 圓體:'"Noto Sans TC","Yuanti TC","Microsoft JhengHei",sans-serif',
 楷體:'BiauKai,DFKai-SB,"Kaiti TC",cursive',
 等寬:'Consolas,Menlo,"Courier New",monospace',
 英文展示:'Impact,Georgia,Futura,"Helvetica Neue",sans-serif'};
Object.assign(CONFIG,{bokeh:0,leak:0,lightning:0,scratch:0,crt:0,vhs:0,invBar:0,guides:false,snap:true,lock:"",presetName:"",emFont:"（版型預設）",waterRefract:true,textScale:100,bgMode:"gradient",bgColor:"#050608",maskColor:"#000000",brightness:100,vidBright:100,vidContrast:100,vidSat:100,vidBlur:0,textShadow:false,shX:0,shY:.2,shBlur:1.1,shAlpha:35,shLayers:1,glowAcc:25,shColor:"#000000",ghostOn:false,ghostA:"#ff285a",ghostB:"#00dcff",alphaOnly:false,posAnchor:"",posX:0,posY:0,posSafe:6,recFps:60,recLite:false,aspect:"fill",particles:50,pMode:"dots",scan:0,grain:.05,vignette:.5,beatRot:0,tone:"",beatSrc:"bpm",trans:"cut",kb:false,autoPerf:true,sceneMax:3,beatShake:0,beatZoom:0,beatTilt:0,beatHue:0,sceneAll:"",layoutPool:"",sceneBudget:6,autoAccent:false});
const CFG_DEFAULTS=JSON.parse(JSON.stringify(CONFIG));   /* 出廠預設：匯入設定檔時以此為底，避免瀏覽器記住的舊值殘留 */
const LS_CFG="klcfg",LS_QK="klqk",LS_PO="klpo";   /* localStorage 鍵名集中於此：設定、快捷選單「最近使用」、面板分組展開狀態 */
/* 讀取／匯入設定時的基本把關：CFG_DEFAULTS 已有的鍵，型別明顯不對（NaN、null、字串塞給數字…）就丟掉、沿用預設；
   未知鍵原樣保留（離線渲染另有 post、chroma 等鍵）；擋掉 __proto__／constructor／prototype。回傳 {r:清理後的設定, bad:被丟掉的鍵名}。
   數字鍵接受「數字字串」、布林鍵接受 0／1，因為面板的下拉選單會存字串。 */
function cfgClean(o){const r={},bad=[];if(!o||typeof o!=="object"||Array.isArray(o))return{r,bad};
 for(const k of Object.keys(o)){if(k==="__proto__"||k==="constructor"||k==="prototype")continue;
  const v=o[k],d=CFG_DEFAULTS[k];let ok=true;
  if(d!==undefined&&d!==null){const t=typeof d;
   if(t==="number")ok=(typeof v==="number"||(typeof v==="string"&&v.trim()!==""))&&isFinite(+v);
   else if(t==="string")ok=typeof v==="string"||typeof v==="number";
   else if(t==="boolean")ok=typeof v==="boolean"||v===0||v===1;
   else ok=typeof v===t&&v!==null&&Array.isArray(v)===Array.isArray(d)}
  if(ok)r[k]=v;else bad.push(k)}
 return{r,bad}}
if(!RENDER)try{Object.assign(CONFIG,cfgClean(JSON.parse(localStorage.getItem(LS_CFG)||"{}")).r)}catch(e){}
if(!RENDER)["posAnchor","posX","posY"].forEach(k=>CONFIG[k]=CFG_DEFAULTS[k]);   /* 全域位置只在本次使用有效，不跨次保存：每次開啟一律從「版型原位（正中）」開始；各句自己的位置存在 SRT 標記裡 */
const $=s=>document.querySelector(s),SWd=()=>$("#stage").clientWidth,SHd=()=>$("#stage").clientHeight,m=$("#m"),L=$("#L");
const DEMO=`1
00:00:01,000 --> 00:00:03,700
#split+rise 你慢慢的。{靠}{近}

2
00:00:04,000 --> 00:00:06,700
#bounce+drop+sink 我承认。

3
00:00:07,000 --> 00:00:09,700
#slam 不要回頭

4
00:00:10,000 --> 00:00:12,700
#glitch+scramble+glitch-out 訊號中斷

5
00:00:13,000 --> 00:00:15,700
#neon+zoomin+blur-out~flicker 在夜色裡發光

6
00:00:16,000 --> 00:00:18,700
#karaoke 一起唱到天亮

7
00:00:19,000 --> 00:00:21,700
#typewriter+fade+dissolve 把心事寫給你

8
00:00:22,000 --> 00:00:24,700
#keyword 我只想{擁抱}你

9
00:00:25,000 --> 00:00:27,700
#marker+rise 把最重要的話{說出口}

10
00:00:28,000 --> 00:00:30,700
#handwrite 寫一封給未來的信

11
00:00:31,000 --> 00:00:33,700
#collage 街頭的霓虹與雨

12
00:00:34,000 --> 00:00:36,700
#flash-words 快 跑 不 要 停下來

13
00:00:37,000 --> 00:00:39,700
#blurfocus+swing~float 慢慢對焦

14
00:00:40,000 --> 00:00:42,700
#poster+mask-up~shimmer {晚安}好夢

15
00:00:43,000 --> 00:00:46,000
#ripple-pool 聽見水波||RIPPLE

16
00:00:46,300 --> 00:00:49,300
#constellation 星座連線||CONSTELLATION

17
00:00:49,600 --> 00:00:52,600
#particle-form 聚成光||PARTICLES

18
00:00:52,900 --> 00:00:55,900
#hud-frame 同步完成||SYNC COMPLETE

19
00:00:56,200 --> 00:00:59,200
#parallax-depth 向前走||DEPTH

20
00:00:59,500 --> 00:01:02,500
#center+zoomin@outline,chromatic 樣式組合||STYLE MIX

21
00:01:02,800 --> 00:01:05,800
#center+rise@gradient,longshadow 漸層長影

22
00:01:06,100 --> 00:01:09,100
#center+fade@neon,glitch 訊號閃爍||GLITCH

23
00:01:09,400 --> 00:01:12,400
#polaroid 回憶相片||POLAROID

24
00:01:12,700 --> 00:01:15,700
#page-flip 翻開下一頁||PAGE

25
00:01:16,000 --> 00:01:19,000
#ink-bleed 墨色暈開||INK

26
00:01:19,300 --> 00:01:22,300
#laser-scan 垂直掃描||SCAN

27
00:01:22,600 --> 00:01:25,600
#laser-scan 光線掃描||SCAN

28
00:01:25,900 --> 00:01:28,900
#split-flap 到站時刻||STATION

29
00:01:29,200 --> 00:01:32,200
#wave-path 隨波逐流||WAVE

30
00:01:32,500 --> 00:01:35,500
#mirror-reflect 水面倒影||REFLECT

31
00:01:35,800 --> 00:01:38,800
#cylinder 滾筒翻轉||CYLINDER

32
00:01:39,100 --> 00:01:42,100
#iris-frame 光圈聚焦||IRIS

33
00:01:42,400 --> 00:01:45,400
#annotate 這是{最重要}的{一句}話||ANNOTATE

34
00:01:45,700 --> 00:01:48,700
#center+iris 光圈進場`;
let subs=[],hasMedia=false,playing=false,vt=0,lastP=0,cur=-2,lastT=0,anims=[],lastBeat=0,recording=false,lastStart=0,vary=0;

