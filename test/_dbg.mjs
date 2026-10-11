import { chromium } from 'playwright';import { pathToFileURL } from 'node:url';
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:480,height:270}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('C',m.text().slice(0,200)));
await p.goto(pathToFileURL('index.html').href+'?render=1&fps=5');await p.evaluate(()=>window.__ready);
console.log(await p.evaluate(()=>[LAYOUTS.includes('hero-text'),LAYOUTS.includes('scatter'),LAYOUTS.length,!!NL['hero-text']]));
await p.evaluate(s=>window.__loadProject({srt:s,config:{}}),`1\n00:00:00,200 --> 00:00:03,200\n#hero-text 歌詞測試字\n`);
for(let f=0;f<=8;f++)await p.evaluate(x=>window.__renderFrame(x),f/5);
console.log(await p.evaluate(()=>[subs[0].lay,subs[0].plain,cur,CONFIG.lock,L.innerHTML.length]));await b.close();
