import { chromium } from 'playwright';import { pathToFileURL } from 'node:url';import fs from 'node:fs';
const [kind,list]=[process.argv[2],process.argv[3].split(',')];const W=480,H=270,fps=5;
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});fs.mkdirSync('/tmp/sh',{recursive:true});
for(const n of list){const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage();await p.goto(pathToFileURL('index.html').href+'?render=1&fps=5');await p.evaluate(()=>window.__ready);
 const tag=kind==='scene'?`#center&${n}:80`:`#${n}`;await p.evaluate(s=>window.__loadProject({srt:s,config:{}}),`1\n00:00:00,200 --> 00:00:03,200\n${tag} 歌詞測試字\n`);
 for(let f=0;f<=8;f++)await p.evaluate(x=>window.__renderFrame(x),f/fps);await p.screenshot({path:`/tmp/sh/${n}.png`});await p.context().close()}
await b.close();
