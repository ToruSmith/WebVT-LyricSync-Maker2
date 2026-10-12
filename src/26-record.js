/* ===== [RECORD] 全螢幕錄製：同一次點擊內先全螢幕再 getDisplayMedia（倒數 → MediaRecorder → 下載）===== */
let rec=null,chunks=[],stream=null,finishing=false,counting=false;
$("#rec").onclick=async()=>{
 if(!navigator.mediaDevices?.getDisplayMedia||typeof MediaRecorder==="undefined")return alert("此瀏覽器不支援螢幕錄製，請使用最新版 Chrome 或 Edge。");
 if(!subs.length)return alert("請先載入 SRT 或載入範例。");
 let fsP=document.documentElement.requestFullscreen?.().catch(()=>{});
 try{stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:Number(CONFIG.recFps)||60},audio:true,preferCurrentTab:true,selfBrowserSurface:"include",systemAudio:"include"})}
 catch(e){document.fullscreenElement&&document.exitFullscreen();return alert("未取得錄製授權（"+(e.name||"錯誤")+"）。請在授權視窗選「此分頁」。")}
 await fsP;recording=true;counting=true;edLayout();chunks=[];finishing=false;rec=null;stream.getVideoTracks()[0].onended=()=>stopRec();pause();
 if(CONFIG.aspect!=="fill"&&window.CropTarget){try{await stream.getVideoTracks()[0].cropTo(await CropTarget.fromElement($("#stage")))}catch(e){note("無法裁切成指定比例，將錄製整個視窗："+e.message)}}
 if(!stream.getAudioTracks().length)note("警告：沒有音訊軌。請勾選「分享分頁音訊」；示範模式本來就是靜音。");
 await document.fonts.ready;if(!counting)return;
 const cd=$("#cd");cd.style.display="flex";document.body.classList.add("rec");
 for(let i=3;i>0&&counting;i--){cd.textContent=i;await new Promise(r=>setTimeout(r,1000))}  // 倒數為 UI 用途，非動畫計時
 if(!counting)return;counting=false;cd.style.display="none";if(CONFIG.recLite){perfLite=true;sizeCv()}
 const types=["video/mp4;codecs=avc1,mp4a.40.2","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];
 const mt=types.find(t=>MediaRecorder.isTypeSupported(t))||"";
 chunks=[];finishing=false;
 rec=new MediaRecorder(stream,{mimeType:mt,videoBitsPerSecond:(Number(CONFIG.recFps)||60)<=30?8e6:12e6,audioBitsPerSecond:192e3});
 rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 rec.onstop=()=>finish(rec.mimeType||mt);
 stream.getVideoTracks()[0].onended=()=>stopRec();   // 使用者按「停止共用」
 rec.start(1000);
 vt=0;cur=-2;if(hasMedia)m.currentTime=0;play();
};
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&recording)stopRec()});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&recording)note("請保持此分頁在前景")});
function stopRec(){if(counting){counting=false;recording=false;stream&&stream.getTracks().forEach(t=>t.stop());$("#cd").style.display="none";document.body.classList.remove("rec");document.fullscreenElement&&document.exitFullscreen();note("已取消錄製");return}
 if(rec&&rec.state!=="inactive")rec.stop();else if(recording)finish("")}
function done(){if(recording)setTimeout(stopRec,hasMedia?300:0)}
function finish(mt){perfLite=false;perfPart=null;sizeCv();
 if(finishing)return;finishing=true;recording=false;pause();
 stream&&stream.getTracks().forEach(t=>t.stop());
 document.body.classList.remove("rec");document.fullscreenElement&&document.exitFullscreen();
 if(!chunks.length)return alert("沒有錄到任何資料。");
 const ext=/mp4/.test(mt)?"mp4":"webm",d=new Date(),z=n=>String(n).padStart(2,"0");
 const name=`lyrics_${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}.${ext}`;
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(chunks,{type:mt||"video/webm"}));a.download=name;document.body.appendChild(a);a.click();a.remove();
 note("已下載 "+name);
}
/* 登記一致性自我檢查：網址加 ?check=1 開啟，結果印在瀏覽器主控台（F12）；平常不執行、不影響使用。
   新增版型／設定後若漏登記（LAYOUTS、BRACE_LAYOUTS、FULLBLEED、CFG_DEFAULTS），這裡會列出來。 */
function selfCheck(){
 const L=new Set(LAYOUTS),inline=new Set(["split","lowerleft","bounce","slam","neon","karaoke"]),out=[];
 Object.keys(NL).filter(k=>!L.has(k)).forEach(k=>out.push("NL 有、LAYOUTS 沒有："+k));
 [...L].filter(k=>!NL[k]&&!inline.has(k)).forEach(k=>out.push("LAYOUTS 有、NL 沒有："+k));
 [...BRACE_LAYOUTS].filter(k=>!L.has(k)).forEach(k=>out.push("BRACE_LAYOUTS 不在 LAYOUTS："+k));
 [...FULLBLEED].filter(k=>!L.has(k)).forEach(k=>out.push("FULLBLEED 不在 LAYOUTS："+k));
 LAYOUTS.filter((k,i)=>LAYOUTS.indexOf(k)!==i).forEach(k=>out.push("LAYOUTS 重複："+k));
 Object.keys(CONFIG).filter(k=>!(k in CFG_DEFAULTS)).forEach(k=>out.push("CONFIG 有、CFG_DEFAULTS 沒有（匯入設定時舊值會殘留）："+k));
 {Object.keys(SCENES).filter(n=>!SCENE_NAMES.includes(n)||!/^(under|over)$/.test(SCENES[n].layer)||typeof SCENES[n].draw!=="function").forEach(n=>out.push("場景層登記不一致："+n));SCENE_NAMES.filter((k,i)=>SCENE_NAMES.indexOf(k)!==i).forEach(k=>out.push("SCENE_NAMES 重複："+k))}
 {const ids=new Set();quickActions().forEach(a=>{ids.has(a.id)&&out.push("快捷表 id 重複："+a.id);ids.add(a.id);a.g===null||QK_GROUPS.includes(a.g)||out.push("快捷表群組未登記："+a.id+"／"+a.g);typeof a.run==="function"||out.push("快捷表缺 run："+a.id)});
  ["#fs","#fm","#demo","#rec","#ed","#rnd","#unlock","#tg","#play","#qkb","#qk","#cfgImport"].forEach(q=>$(q)||out.push("缺少元素："+q));
  QK_SECS.forEach(id=>$('#panel [data-sec="'+id+'"]')||out.push("面板缺少區段錨點："+id))}
 {const m=thMissing();m.length&&console.info("[selfCheck] 這些項目沒有縮圖（不影響功能；node test/make-thumbs.mjs 重拍）："+m.join(" "))}
 out.length?console.warn("[selfCheck] 發現 "+out.length+" 項：\n"+out.join("\n")):console.info("[selfCheck] 登記一致");return out}
if(/[?&]check=1(&|$)/.test(location.search))window.addEventListener("load",selfCheck);
window.__selfCheck=selfCheck;
