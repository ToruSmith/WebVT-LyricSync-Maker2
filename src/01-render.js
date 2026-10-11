/* ===== [RENDER] 離線渲染模式（?render=1）：由 render/run.mjs 逐幀驅動；一般使用時完全不影響（介面端在檔尾 [RENDER-API]）===== */
const RENDER=/[?&]render=1(&|$)/.test(location.search);
if(RENDER){let _s=0x9e3779b9;Math.random=()=>{_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
