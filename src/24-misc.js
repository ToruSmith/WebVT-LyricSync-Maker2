/* ===== [MISC] 預設組合補登（電影字幕・街頭拼貼）/ 畫面比例 applyStage / 啟動序列（css→applyScene→panel）===== */
PRESETS["電影字幕（底部置中）"]={font:"黑體",weight:500,spacing:.06,pulse:0,bounce:0,flash:0,particles:0,grain:0,vignette:0,trans:"cut",dim:30,textScale:35,textShadow:true,posAnchor:"bc",posSafe:8,lock:"center"};
PRESETS.街頭拼貼={font:"英文展示",weight:700,spacing:.05,grain:.12,scratch:1,pulse:.06,accent:"#ffd166"};
function applyStage(){const s=$("#stage"),a=CONFIG.aspect||"fill";
 if(document.body.style.getPropertyValue("--edh")){   /* 句子編輯器開著：預覽縮進「頂欄下、編輯器上」的可用區；「填滿視窗」改用視窗比例縮放，版面才與全螢幕一致 */
  const r=a==="9:16"?9/16:a==="16:9"?16/9:(innerWidth/innerHeight||16/9);
  s.style.width=`min(var(--avw),calc(var(--avh)*${r}))`;s.style.height=`min(var(--avh),calc(var(--avw)/${r}))`;sizeCv();cur=-2;return}
 s.style.width=a==="fill"?"100vw":a==="9:16"?"min(100vw,56.25vh)":"min(100vw,177.78vh)";s.style.height=a==="fill"?"100vh":a==="9:16"?"min(100vh,177.78vw)":"min(100vh,56.25vw)";sizeCv();cur=-2}
css();applyScene();panel();
