// 組建：src/ → 根目錄 index.html（單檔、依檔名順序原樣串接，不改動程式內容）。勿直接編輯 index.html，請改 src/。
// 加 --check：不寫檔，只檢查現有 index.html 是否與 src/ 同步（不同步時結束碼 1；CI 與 npm run build:check 使用）。
import fs from 'node:fs';
const T = fs.readFileSync('src/index.template.html','utf8');
const css = fs.readFileSync('src/style.css','utf8');
const js = fs.readdirSync('src').filter(f=>/^\d\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync('src/'+f,'utf8')).join('');
const out = T.replace('@@STYLE@@',()=>css).replace('@@SCRIPT@@',()=>js);
if (process.argv.includes('--check')) {
  const cur = fs.existsSync('index.html') ? fs.readFileSync('index.html','utf8') : '';
  if (cur !== out) { console.error('✗ index.html 與 src/ 不同步：請執行 node build.mjs，並把更新後的 index.html 一起提交。'); process.exit(1); }
  console.log('✓ index.html 與 src/ 同步'); process.exit(0);
}
fs.writeFileSync('index.html', out);
