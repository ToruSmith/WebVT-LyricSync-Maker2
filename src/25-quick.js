/* ===== [QUICK] 快捷選單（頂欄「⚡ 快捷」或 Ctrl+K）：所有工具、匯出、載入、面板跳轉集中在 quickActions() 這一張表。
   新增功能：在 quickActions() 的陣列加一筆 {id,g,t,h,k,on,run}：g＝群組（須在 QK_GROUPS；null＝只在搜尋時出現）、t＝名稱、h＝右側提示、
   k＝搜尋關鍵字、on＝() => true 或「不可用的原因」字串、run＝執行內容。選單只負責呼叫既有函式／按鈕，不含功能邏輯；?check=1 的 selfCheck 會驗證這張表。===== */
const QK_GROUPS=["匯出","載入","編輯","面板跳轉","檢視與系統"];
const QK_SECS=["rhythm","preset","export","scene","layers","pos","bg"];   /* 對應 secAnchor(p,id) 的面板區段 */
function quickActions(){
 const needSubs=()=>subs.length?true:"請先載入 SRT 或範例",click=q=>()=>$(q).click(),jump=id=>()=>showSec(id),
 A=[
  {id:"exp-wizard",g:"匯出",t:"匯出精靈：你要拿去做什麼？",h:"錄製／MP4／透明字層／綠幕／SRT",k:"wizard export 匯出 精靈 用途 錄製 mp4 透明 綠幕 srt 分層",run:openExportWizard},
  {id:"exp-srt",g:"匯出",t:"匯出帶標記的 SRT",h:"lyrics_tagged.srt",k:"srt export 字幕 標記 下載",on:needSubs,run:exportSRT},
  {id:"exp-srt-plain",g:"匯出",t:"匯出純文字 SRT（無標記）",h:"lyrics.srt",k:"srt plain 純文字 字幕 無標記 下載",on:needSubs,run:exportSRTPlain},
  {id:"exp-cfg",g:"匯出",t:"匯出設定 JSON",h:"lyrics_config.json",k:"config json 設定 下載",run:exportConfig},
  {id:"exp-proj",g:"匯出",t:"匯出渲染專案 project.json",h:"字幕＋設定＋字體",k:"project render 離線 渲染 專案 備份",on:needSubs,run:async()=>{await exportProjectUI();showSec("export")}},
  {id:"exp-cmd",g:"匯出",t:"複製離線渲染指令",h:"node render/run.mjs …",k:"command cmd 指令 複製",run:async()=>{const c=projCmd().cmd;try{await navigator.clipboard.writeText(c);note("已複製離線渲染指令："+c)}catch(e){prompt("複製這行指令：",c)}}},
  {id:"exp-rec",g:"匯出",t:"全螢幕錄製並下載影片",h:"mp4／webm",k:"record 錄製 影片 錄影",on:needSubs,run:click("#rec")},
  {id:"ld-srt",g:"載入",t:"載入字幕（SRT／LRC／VTT）",h:"",k:"srt lrc vtt load 字幕 歌詞 開啟",run:click("#fs")},
  {id:"ld-media",g:"載入",t:"載入音樂／影片",h:"",k:"media audio video 音樂 影片 媒體",run:click("#fm")},
  {id:"ld-json",g:"載入",t:"匯入設定 JSON／渲染專案",h:"project.json 整包還原",k:"import json 匯入 還原 設定 專案",run:click("#cfgImport")},
  {id:"ld-demo",g:"載入",t:"載入範例",h:"",k:"demo 範例 示範",run:click("#demo")},
  {id:"ed-editor",g:"編輯",t:"句子編輯器（開／關）",h:"",k:"editor 編輯器 逐句",run:click("#ed")},
  {id:"ed-rnd",g:"編輯",t:"隨機化版型與動畫",h:"可復原",k:"random 隨機 靈感",on:needSubs,run:click("#rnd")},
  {id:"ed-undo",g:"編輯",t:"復原",h:"Ctrl+Z",k:"undo 復原",on:()=>histOf===subs&&histA.length?true:"沒有可復原的動作",run:undo},
  {id:"ed-redo",g:"編輯",t:"重做",h:"Ctrl+Y",k:"redo 重做",on:()=>histOf===subs&&histB.length?true:"沒有可重做的動作",run:redo},
  {id:"ed-unlock",g:"編輯",t:"解除版型鎖定",h:"",k:"unlock lock 鎖定 解除",on:()=>CONFIG.lock?true:"目前沒有鎖定版型",run:click("#unlock")},
  {id:"ed-bake",g:"編輯",t:"把全域位置寫入各句",h:"",k:"position bake 位置 寫入",on:needSubs,run:bakePos},
  {id:"ed-clrpos",g:"編輯",t:"清除所有句子的位置",h:"",k:"position clear 位置 清除",on:needSubs,run:clearPos},
  {id:"ed-clrpack",g:"編輯",t:"清除風格包（還原它動過的設定）",h:"",k:"style pack clear reset 風格包 風格 清除 還原",on:()=>STYLE_PACKS.has(CONFIG.presetName)?true:"目前沒有套用風格包",run:clearPack},
  {id:"ed-clrscene-g",g:"編輯",t:"清除全域底層場景",h:"",k:"scene global clear 場景 全域 底層 清除",on:()=>CONFIG.sceneAll?true:"全域底層場景是空的",run:()=>{CONFIG.sceneAll="";cur=-2;save();panel()}},
  {id:"ed-clrpool",g:"編輯",t:"清除版型池",h:"",k:"layout pool clear 版型池 清除",on:()=>CONFIG.layoutPool?true:"版型池是空的",run:()=>{CONFIG.layoutPool="";cur=-2;save();panel()}},
  {id:"ed-clrscene-s",g:"編輯",t:"清除所有句子的場景",h:"",k:"scene sentence clear 場景 句子 逐句 清除",on:()=>subs.some(x=>x.scene)?true:"沒有句子帶有場景標記",run:()=>clearSceneSubs()},
  {id:"ed-clrall",g:"編輯",t:"一鍵清除：風格包＋全域場景＋版型池＋逐句場景",h:"會先確認",k:"clear all reset 一鍵 全部 清除 風格包 場景 版型池",run:clearAllLayers},
  {id:"nav-rhythm",g:"面板跳轉",t:"節奏・字體・顏色",h:"面板最上方",k:"bpm 字體 顏色 節奏 tap",run:jump("rhythm")},
  {id:"nav-preset",g:"面板跳轉",t:"預設組合・鎖定版型・設定匯出入",h:"",k:"preset 預設 鎖定 匯出 匯入",run:jump("preset")},
  {id:"nav-export",g:"面板跳轉",t:"面板的匯出區",h:"",k:"export 匯出",run:jump("export")},
  {id:"nav-scene",g:"面板跳轉",t:"畫面比例・粒子・轉場・疊加層",h:"",k:"aspect 比例 粒子 轉場 疊加 特效 錄製幀率",run:jump("scene")},
  {id:"nav-layers",g:"面板跳轉",t:"風格包・全域場景層・版型池",h:"",k:"style pack 風格 場景層 全域 底層 版型池 取色 後製",run:jump("layers")},
  {id:"nav-pos",g:"面板跳轉",t:"位置微調",h:"",k:"position 位置 錨點 參考線",run:jump("pos")},
  {id:"nav-bg",g:"面板跳轉",t:"背景與亮度・陰影",h:"",k:"background 背景 亮度 陰影 影片",run:jump("bg")},
  {id:"sys-play",g:"檢視與系統",t:"播放／暫停",h:"空白鍵",k:"play pause 播放 暫停",run:click("#play")},
  {id:"sys-panel",g:"檢視與系統",t:"顯示／隱藏參數面板",h:"",k:"panel 參數 面板",run:click("#tg")},
  {id:"sys-guides",g:"檢視與系統",t:"顯示／隱藏參考線",h:CONFIG.guides?"目前：開":"目前：關",k:"guides 參考線 安全邊界",run:()=>{CONFIG.guides=!CONFIG.guides;save();guidesCss();panel()}},
  {id:"sys-reset",g:"檢視與系統",t:"清除記住的設定（恢復預設）",h:"會重新載入",k:"reset 重設 清除 預設",run:()=>resetSettings()}];
 Object.keys(PRESETS).forEach(n=>A.push({id:"preset:"+n,g:null,t:"預設組合："+n,h:"",k:"preset 預設 組合 套用"+(STYLE_PACKS.has(n)?" 風格 風格包 style pack":""),run:()=>applyPreset(n)}));
 [["","（清除）"],...SCENE_NAMES.map(n=>[n,n])].forEach(([n,t])=>A.push({id:"scene-global:"+n,g:null,t:"場景層：設為全域底層 "+t,h:"",k:"scene 場景層 全域 底層 sceneAll",run:()=>{CONFIG.sceneAll=n;cur=-2;save();panel()}}));
 [["off","關閉","0,0,0,0"],["light","輕度","1,2,1,10"],["mid","中度","2,4,2,20"],["strong","強烈","3,6,3,40"]].forEach(([id,t,v])=>{const q=v.split(",").map(Number);A.push({id:"bfx-"+id,g:null,t:"後製：節拍後製 "+t,h:"",k:"beat fx 後製 節拍 震動 縮放 傾斜 色相 shake zoom tilt hue",run:()=>{Object.assign(CONFIG,{beatShake:q[0],beatZoom:q[1],beatTilt:q[2],beatHue:q[3]});cur=-2;save();toneCss();panel()}})});
 [["","（不鎖定）"],...LAYOUTS.map(l=>[l,l])].forEach(([l,n])=>A.push({id:"lock:"+l,g:null,t:"鎖定版型："+n,h:"",k:"lock layout 鎖定 版型",run:()=>{CONFIG.lock=l;cur=-2;save();panel()}}));
 [["","（清除）"],...SCENE_NAMES.map(n=>[n,n])].forEach(([n,t])=>{
  A.push({id:"scene-cur:"+n,g:null,t:"場景層：套用到目前這句 "+t,h:"",k:"scene 場景層 圖案 疊加 &",on:needSubs,run:()=>{const x=subs[selIdx];if(!x)return;pushHist();x.scene=n;cur=-2;refreshEditor()}});
  A.push({id:"scene-all:"+n,g:null,t:"場景層：套用到全部句子 "+t,h:"",k:"scene 場景層 圖案 疊加 &",on:needSubs,run:()=>{pushHist();subs.forEach(x=>x.scene=n);cur=-2;refreshEditor()}})});
 [...STYLE_PACKS].forEach(n=>{
  A.push({id:"pack-cur:"+n,g:null,t:"風格包：套用到目前這句 "+n,h:"版型＋場景＋字體",k:"style pack 風格包 風格 逐句 這句 "+n,on:needSubs,run:()=>applyPackTo([selIdx],n,edPackOpt)});
  A.push({id:"pack-all:"+n,g:null,t:"風格包：套用到全部句子 "+n,h:"逐句寫入，可復原",k:"style pack 風格包 風格 逐句 全部 "+n,on:needSubs,run:()=>applyPackTo(subs.map((_,i)=>i),n,edPackOpt)})});
 return A}
if(!RENDER)(()=>{
 const box=$("#qk"),inp=$("#qks"),list=$("#qkl"),btn=$("#qkb");let items=[],act=0;
 const recent=()=>{try{const r=JSON.parse(localStorage.getItem(LS_QK)||"[]");return Array.isArray(r)?r:[]}catch(e){return[]}},
  remember=id=>{try{localStorage.setItem(LS_QK,JSON.stringify([id,...recent().filter(x=>x!==id)].slice(0,4)))}catch(e){}},
  isOn=()=>box.classList.contains("on"),close=()=>box.classList.remove("on"),
  setAct=(i,scroll)=>{if(!items.length)return;act=(i+items.length)%items.length;items.forEach((it,j)=>it.d.classList.toggle("act",j===act));scroll&&items[act].d.scrollIntoView({block:"nearest"})},
  pick=it=>{if(!it)return;if(!it.ok)return note(it.r);close();remember(it.a.id);   /* 先關選單再執行；同一次點擊內執行，錄製／選檔才拿得到使用者授權 */
   try{const r=it.a.run();r&&r.catch&&r.catch(e=>alert("執行失敗："+e.message))}catch(e){alert("執行失敗："+e.message)}},
  mk=(tag,cls,txt)=>{const e=document.createElement(tag);e.className=cls;if(txt!=null)e.textContent=txt;return e};
 function draw(){
  const q=inp.value.trim().toLowerCase().split(/\s+/).filter(Boolean),all=quickActions(),byId=new Map(all.map(a=>[a.id,a]));
  list.textContent="";items=[];
  const add=a=>{const r=a.on?a.on():true,ok=r===true,d=mk("div","qi"+(ok?"":" dis")),it={a,d,ok,r};
   {const th=thFromId(a.id);if(th)d.dataset.th=th}   /* 縮圖懸停預覽（28-thumbs.js） */
    d.append(mk("span","",a.t),mk("span","qh",ok?(a.h||""):r));d.onclick=()=>pick(it);d.onmouseenter=()=>setAct(items.indexOf(it));list.append(d);items.push(it)};
  if(q.length){const hit=all.filter(a=>{const h=(a.t+" "+(a.g||"")+" "+(a.k||"")).toLowerCase();return q.every(w=>h.includes(w))});
   hit.forEach(add);if(!hit.length)list.append(mk("div","qe","找不到符合的功能"))}
  else{const rc=recent().map(id=>byId.get(id)).filter(Boolean);
   if(rc.length){list.append(mk("div","qg","最近使用"));rc.forEach(add)}
   QK_GROUPS.forEach(g=>{const xs=all.filter(a=>a.g===g);if(xs.length){list.append(mk("div","qg",g));xs.forEach(add)}});
   list.append(mk("div","qe","輸入關鍵字，可直接搜尋「預設組合」與「鎖定版型」"))}
  setAct(0)}
 const open=()=>{box.classList.add("on");inp.value="";draw();inp.focus()};
 btn.onclick=()=>isOn()?close():open();
 inp.oninput=draw;
 inp.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();setAct(act+1,1)}else if(e.key==="ArrowUp"){e.preventDefault();setAct(act-1,1)}else if(e.key==="Enter"){e.preventDefault();pick(items[act])}});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOn())close();else if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==="k"&&!recording){e.preventDefault();isOn()?close():open()}});
 document.addEventListener("pointerdown",e=>{if(isOn()&&!box.contains(e.target)&&!btn.contains(e.target))close()});
})();

