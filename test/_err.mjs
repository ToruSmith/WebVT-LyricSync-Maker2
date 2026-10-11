import { chromium } from 'playwright';import { pathToFileURL } from 'node:url';import { resolve } from 'node:path';
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',e.message,(e.stack||'').split('\n').slice(0,3).join('|')));
await p.goto(pathToFileURL(resolve('index.html')).href+(process.argv[2]||'?render=1&fps=5'));await p.waitForTimeout(800);await b.close();
