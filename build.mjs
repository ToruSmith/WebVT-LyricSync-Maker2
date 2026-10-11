// 組建：src/ → 根目錄 index.html（單檔、依檔名順序原樣串接，不改動程式內容）。勿直接編輯 index.html，請改 src/。
import fs from 'node:fs';
const T = fs.readFileSync('src/index.template.html','utf8');
const css = fs.readFileSync('src/style.css','utf8');
const js = fs.readdirSync('src').filter(f=>/^\d\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync('src/'+f,'utf8')).join('');
fs.writeFileSync('index.html', T.replace('@@STYLE@@',()=>css).replace('@@SCRIPT@@',()=>js));
