/* ===== [STYLES] 風格包（pv-tool 16 個模板的自行詮釋，淨室、未對照其畫面）＋場景層挑選器＋面板「風格・場景層・後製」區段＋自動取主色。
   風格包＝一個 PRESETS 項目（舊預設不動）：調色盤＋字體＋全域底層場景 sceneAll＋建議版型池 layoutPool＋節拍後製＋氛圍參數；套用後 CONFIG.auto 開啟，
   沒有自己標記的句子依「句子索引」從版型池輪流取版型、套用全域底層（皆為句子索引的純函數）；有自己 # 標記或 & 的句子則以自己的為準，可逐句覆寫。
   「依段落切換整套風格」（原決策 D8）未獲使用者確認，不做。「赛博监控」只取靜態 HUD，不做動作偵測。 ===== */
const STYLE_PACKS=new Set();
function regPack(name,o){STYLE_PACKS.add(name);PRESETS[name]=Object.assign({auto:true},o)}
regPack("藍色衝擊",{font:"英文展示",weight:700,spacing:.05,color:"#ffffff",accent:"#1e6bff",dim:40,pulse:.1,bounce:18,flash:.12,trans:"flash",particles:40,grain:.06,
 sceneAll:"burst:60,glitch-bars:30",layoutPool:"slam,bounce,hero-text,poster,glow-cards",beatShake:1.2,beatZoom:3});
regPack("斬擊",{font:"英文展示",weight:800,spacing:.04,color:"#ffffff",accent:"#ff2a2a",dim:35,pulse:.08,flash:.15,trans:"wipe",particles:0,
 sceneAll:"diag-split:70,diag-structure:50",layoutPool:"slam,diagonal,wipe,split-screen,hero-text",beatTilt:1.5,beatShake:.8});
regPack("藍色構成",{font:"黑體",weight:500,spacing:.12,color:"#e8f0ff",accent:"#3a7bff",dim:45,pulse:.04,trans:"crossfade",particles:20,
 sceneAll:"blocks:55,squares:40,guides:35",layoutPool:"poster,split,lowerleft,strip,cards"});
regPack("城市文字雨",{font:"等寬",weight:400,spacing:.15,color:"#d8ffee",accent:"#3dffb0",dim:60,pulse:.05,pMode:"rain",particles:70,scan:.08,grain:.08,trans:"cut",
 sceneAll:"flow-lines:45,hud-corners:40",layoutPool:"falling,formula,typewriter,scatter,marquee"});
regPack("夜色",{font:"圓體",weight:300,spacing:.4,color:"#dfe6ff",accent:"#9aa7ff",dim:65,pulse:.03,bounce:6,speed:.85,trans:"crossfade",pMode:"stars",particles:90,vignette:.6,
 sceneAll:"gradient-fade:50,glow-ring:30",layoutPool:"center,blurfocus,lowerleft,pv-lyric"});
regPack("波普",{font:"英文展示",weight:700,spacing:.05,color:"#222222",accent:"#ff2fa0",bgMode:"solid",bgColor:"#fff6e0",ghostOn:true,ghostA:"#ffe600",ghostB:"#00c8ff",pulse:.08,bounce:20,flash:.1,trans:"flash",particles:0,grain:.04,
 sceneAll:"halftone:70,pink-stripes:50",layoutPool:"cute-outline,cards,layered,victim-outline,bounce",beatZoom:4});
regPack("青墨",{font:"楷體",weight:400,spacing:.35,color:"#e9f2ee",accent:"#4fb3a9",bgMode:"solid",bgColor:"#0c1614",pulse:.02,bounce:4,speed:.8,trans:"crossfade",particles:0,grain:.07,
 sceneAll:"texture-bg:35,organic-blob:40",layoutPool:"vertical,pv-vertical,handwrite,ink-bleed,hanko"});
regPack("電腦",{font:"等寬",weight:400,spacing:.1,color:"#c8ffd8",accent:"#38ff7a",bgMode:"solid",bgColor:"#020a04",pulse:.04,flash:0,trans:"cut",particles:0,scan:.1,crt:1,
 sceneAll:"pixel-bg:35,hud-info:50,pixel-window:55",layoutPool:"typewriter,hud-frame,split-flap,laser-scan,formula"});
regPack("戰場",{font:"英文展示",weight:800,spacing:.04,color:"#f2e9dc",accent:"#ff7a1a",dim:45,pulse:.1,bounce:24,flash:.18,trans:"flash",particles:30,grain:.15,scratch:1,
 sceneAll:"hatch:40,crime-tape:60,blood-splatter:35",layoutPool:"slam,hero-text,shatter-text,glitch,poster",beatShake:2.5,beatZoom:4,beatTilt:1});
regPack("幾何",{font:"黑體",weight:700,spacing:.08,color:"#ffffff",accent:"#ffcf33",dim:45,pulse:.06,trans:"wipe",particles:0,
 sceneAll:"checker:45,triangle-grid:40,rings:45",layoutPool:"strip,cards,poster,center,split"});
regPack("全息",{font:"圓體",weight:300,spacing:.25,color:"#e8ffff",accent:"#6ff3ff",ghostOn:true,ghostA:"#ff4df0",ghostB:"#6ff3ff",dim:55,pulse:.05,trans:"crossfade",particles:70,
 sceneAll:"perspective-grid:50,glow-ring:50,hud-corners:45",layoutPool:"constellation,hud-frame,laser-scan,mirror-reflect,center",beatHue:20});
regPack("賽博監控",{font:"等寬",weight:500,spacing:.12,color:"#d8ffe8",accent:"#ff3b3b",bgMode:"solid",bgColor:"#040806",pulse:.03,flash:0,trans:"cut",particles:0,scan:.12,crt:1,vhs:1,
 sceneAll:"hud-corners:60,hud-info:55,hud-status:50",layoutPool:"hud-frame,typewriter,laser-scan,split-flap"});
regPack("情緒電影",{font:"明體",weight:300,spacing:.3,color:"#f2ede4",accent:"#d9a066",dim:55,pulse:.015,bounce:3,flash:0,speed:.8,trans:"crossfade",pMode:"dots",particles:20,vignette:.7,grain:.12,kb:true,textShadow:true,
 sceneAll:"gradient-fade:55,color-wash:30",layoutPool:"lowerleft,subtitle-box,center,blurfocus"});
regPack("剪影極簡",{font:"明體",weight:200,spacing:.7,color:"#ffffff",accent:"#ffffff",bgMode:"solid",bgColor:"#000000",pulse:.01,bounce:0,flash:0,speed:.8,trans:"crossfade",particles:0,grain:0,vignette:.2,
 sceneAll:"screen-border:50",layoutPool:"center,lowerleft,outline-big,pv-lyric"});
regPack("歇斯底里之夜",{font:"英文展示",weight:800,spacing:.04,color:"#ffffff",accent:"#ff1744",ghostOn:true,ghostA:"#ff1744",ghostB:"#00e5ff",dim:40,pulse:.12,bounce:28,flash:.2,speed:1.3,trans:"flash",particles:50,grain:.18,scratch:1,vhs:1,
 sceneAll:"glitch-bars:70,burst:45,smear-brush:40",layoutPool:"noise-text,glitch,shatter-text,crayon-shatter,flash-words",beatShake:3,beatTilt:2,beatHue:30,beatZoom:5});
regPack("戒尺",{font:"明體",weight:600,spacing:.15,color:"#f4efe6",accent:"#c8a24a",bgMode:"solid",bgColor:"#14110d",pulse:.02,bounce:4,flash:0,trans:"crossfade",particles:0,grain:.05,
 sceneAll:"ruler:55,dashed-lines:45,target:35",layoutPool:"poster,subtitle-box,annotate,strip,lowerleft"});
/* 離開風格包時要還原的欄位（只在「上一個套用的是風格包」時才還原，舊預設之間的行為完全不變） */
const PACK_KEEP=["color","bgMode","bgColor","ghostOn","ghostA","ghostB","sceneAll","layoutPool","beatShake","beatZoom","beatTilt","beatHue","dim","vignette","speed","flash","bounce","pulse","weight","spacing","accent","auto","textShadow","lock"];

/* ---- 場景層挑選器：chips 切換「名稱」是否在字串中（保留其他 token 的參數與 bfx-*／none）---- */
const tokName=t=>t.split(":")[0];
function scToggle(str,name){const a=(str||"").split(",").filter(Boolean),i=a.findIndex(t=>tokName(t)===name);if(i>=0)a.splice(i,1);else a.push(name);return a.join(",")}
function chipBox(names,getStr,setStr,title,after){
 const box=document.createElement("div");box.className="chips";
 names.forEach(n=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=n;b.title=title(n);
  const sync=()=>b.classList.toggle("on",(getStr()||"").split(",").some(t=>tokName(t)===n));sync();
  b.onclick=()=>{setStr(scToggle(getStr(),n));box.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",(getStr()||"").split(",").some(t=>tokName(t)===x.textContent)));after&&after()};box.append(b)});
 return box}
const sceneTitle=n=>{const s=SCENES[n];return n+"｜"+(s.layer==="under"?"文字之下":"文字之上")+"｜成本："+s.cost+(s.lab?"｜實驗室（自行詮釋）":"")};
function scenePicker(getStr,setStr,after){
 const w=document.createElement("div"),main=SCENE_NAMES.filter(n=>!SCENES[n].lab),lab=SCENE_NAMES.filter(n=>SCENES[n].lab);
 w.append(chipBox(main,getStr,setStr,sceneTitle,after));
 const d=document.createElement("details"),s=document.createElement("summary");s.textContent="實驗室（P2／P3，自行詮釋）";d.append(s,chipBox(lab,getStr,setStr,sceneTitle,after));w.append(d);return w}
/* 句子編輯器用：浮動挑選窗（單例；錄製／離線時由 CSS 隱藏） */
let scPop=null;
function openScenePop(anchor,getStr,setStr){
 if(scPop){const same=scPop.anchor===anchor;scPop.remove();scPop=null;if(same)return}
 const d=document.createElement("div");d.className="scpop";d.anchor=anchor;
 const h=document.createElement("div");h.textContent="場景層（點選切換，最多 "+(CONFIG.sceneMax||3)+" 層；同類互斥）";h.style.cssText="opacity:.8;margin-bottom:4px";
 d.append(h,scenePicker(getStr,setStr,()=>{cur=-2}));
 const r=anchor.getBoundingClientRect();d.style.left=Math.max(4,Math.min(innerWidth-364,r.left))+"px";d.style.top=Math.min(innerHeight-260,r.bottom+4)+"px";
 document.body.append(d);scPop=d}
document.addEventListener("pointerdown",e=>{if(scPop&&!scPop.contains(e.target)&&e.target!==scPop.anchor){scPop.remove();scPop=null}});

/* ---- 自動取主色：載入影片／選一張圖片時，取畫面最鮮明的色相寫入強調色（一次性寫入 CONFIG.accent，隨設定匯出，不影響離線確定性）---- */
function pickAccent(src,w,h){
 try{const c=document.createElement("canvas");c.width=c.height=48;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0,w,h,0,0,48,48);const d=x.getImageData(0,0,48,48).data,B=Array.from({length:24},()=>[0,0,0,0]);
  for(let i=0;i<d.length;i+=4){const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),v=mx,s=mx?(mx-mn)/mx:0;if(s<.25||v<.25)continue;
   let hu=mx===r?((g-b)/(mx-mn))%6:mx===g?(b-r)/(mx-mn)+2:(r-g)/(mx-mn)+4;hu=(hu*60+360)%360;const k=Math.floor(hu/15)%24,wt=s*v;B[k][0]+=wt;B[k][1]+=r*wt;B[k][2]+=g*wt;B[k][3]+=b*wt}
  const t=B.reduce((a,b)=>b[0]>a[0]?b:a,[0,0,0,0]);if(t[0]<=0)return null;
  const r0=t[1]/t[0],g0=t[2]/t[0],b0=t[3]/t[0],mx=Math.max(r0,g0,b0),mn=Math.min(r0,g0,b0);let hu=mx===r0?((g0-b0)/(mx-mn))%6:mx===g0?(b0-r0)/(mx-mn)+2:(r0-g0)/(mx-mn)+4;hu=(hu+6)%6;
  const S1=Math.max(.65,(mx-mn)/mx),V1=.95,C=V1*S1,X=C*(1-Math.abs(hu%2-1)),M=V1-C,q=[[C,X,0],[X,C,0],[0,C,X],[0,X,C],[X,0,C],[C,0,X]][Math.floor(hu)%6];   /* 保留色相，飽和度≥.65、明度 .95：好讀的強調色 */
  const r=q[0]+M,g=q[1]+M,b=q[2]+M;
  return"#"+[r,g,b].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join("")}catch(e){return null}}
function setAccentFrom(src,w,h){const c=pickAccent(src,w,h);if(!c)return false;CONFIG.accent=c;css();cur=-2;save();panel();note("已自動取主色當強調色："+c);return true}
if(!RENDER)m.addEventListener("loadeddata",()=>{if(CONFIG.autoAccent&&m.videoWidth)setAccentFrom(m,m.videoWidth,m.videoHeight)});

/* ---- 面板區段「風格・場景層・後製」---- */
function extra4(p){secAnchor(p,"layers");
 const lab=t=>{const l=document.createElement("label");l.textContent=t;return l},note2=t=>{const l=document.createElement("div");l.style.cssText="opacity:.65;font-size:11px;margin:2px 0 6px";l.textContent=t;return l};
 const ps=document.createElement("select");ps.style.width="100%";ps.add(new Option("選擇風格包…",""));[...STYLE_PACKS].forEach(k=>ps.add(new Option(k,k)));ps.value=STYLE_PACKS.has(CONFIG.presetName)?CONFIG.presetName:"";ps.onchange=()=>ps.value&&applyPreset(ps.value);
 p.append(lab("風格包（調色盤＋字體＋全域底層＋版型池＋後製；之後仍可逐句覆寫）"),ps,note2("套用後會開啟「自動變化版型」；有自己標記的句子不受影響。再套用其他組合時，風格包動過的欄位會還原。"));
 const si=document.createElement("input");si.style.width="100%";si.placeholder="全域底層場景，例：halftone:60,burst";si.value=CONFIG.sceneAll||"";si.dataset.k2="sceneAll";
 const setS=v=>{CONFIG.sceneAll=v.replace(/\s/g,"");si.value=CONFIG.sceneAll;cur=-2;save()};si.onchange=()=>setS(si.value);
 p.append(lab("全域底層場景（句子沒有自己的 & 時套用；語法同 &：名稱:強度:速度:節拍連動:X:Y）"),si,scenePicker(()=>CONFIG.sceneAll,setS),note2("單句覆寫：在句子編輯器的「場景層」欄寫 &…；寫 none＝這句不要全域底層。bfx-shake／zoom／tilt／hue:數值＝這句的節拍後製強度，bfx-off＝這句關閉節拍後製。"));
 const lp=document.createElement("input");lp.style.width="100%";lp.placeholder="版型池，逗號分隔；空＝全部（需開「自動變化版型」）";lp.value=CONFIG.layoutPool||"";
 const setP=v=>{CONFIG.layoutPool=v.replace(/\s/g,"");lp.value=CONFIG.layoutPool;cur=-2;save()};lp.onchange=()=>setP(lp.value);
 const d=document.createElement("details"),s=document.createElement("summary");s.textContent="挑選版型池（"+LAYOUTS.length+" 種）";d.append(s,chipBox(LAYOUTS,()=>CONFIG.layoutPool,setP,n=>n));
 p.append(lab("自動變化版型的候選池"),lp,d);
 const cb=document.createElement("label"),ci=document.createElement("input");ci.type="checkbox";ci.checked=!!CONFIG.autoAccent;ci.onchange=()=>{CONFIG.autoAccent=ci.checked;save()};cb.append(ci," 載入影片時自動取主色當強調色");p.append(cb);
 const fi=document.createElement("input");fi.type="file";fi.accept="image/*";fi.onchange=()=>{const f=fi.files[0];fi.value="";if(!f)return;const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{setAccentFrom(im,im.naturalWidth,im.naturalHeight)||note("這張圖找不到鮮明的顏色");URL.revokeObjectURL(u)};im.src=u};
 p.append(lab("從圖片取主色（寫入強調色，圖片不會載入）"),fi);
 const rg=(k,n,a,b,st)=>{const l=document.createElement("label"),i=document.createElement("input"),v=document.createElement("b");l.textContent=n+"：";v.textContent=CONFIG[k];l.append(v);Object.assign(i,{type:"range",min:a,max:b,step:st,value:CONFIG[k]});i.oninput=()=>{CONFIG[k]=+i.value;v.textContent=i.value;cur=-2;save()};p.append(l,i)};
 rg("sceneBudget","場景成本預算（0＝不降級）",0,12,1);
 p.append(note2("同一句場景成本（輕1／中2／重4）超過預算時，這句的場景自動以輕量模式繪製。節拍震動／縮放／傾斜／色相滑桿在最上方「節奏」區。"))}
