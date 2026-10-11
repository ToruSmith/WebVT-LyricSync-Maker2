// 規格書同步檢查：node test/spec-sync.mjs　比對「功能手冊」與 LAYOUTS／SCENE_NAMES／風格包／CONFIG 鍵（實驗室項目除外，且不得被規格書當正式項目列出）。
import { chromium } from 'playwright';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const md = fs.readFileSync(fs.readdirSync('.').find(f => f.endsWith('.md') && f.includes('功能手冊')), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] });
const p = await browser.newPage(); await p.goto(pathToFileURL(resolve('index.html')).href + '?render=1'); await p.evaluate(() => window.__ready);
const I = await p.evaluate(() => ({ L: LAYOUTS.filter(l => !LAB_LAYOUTS.has(l)), LAB: [...LAB_LAYOUTS], S: SCENE_NAMES.filter(n => !SCENES[n].lab), SL: SCENE_NAMES.filter(n => SCENES[n].lab), P: [...STYLE_PACKS], EN: ENTERS, EX: EXITS, FX: FXS, K: ['sceneAll', 'layoutPool', 'sceneMax', 'sceneBudget', 'beatShake', 'beatZoom', 'beatTilt', 'beatHue', 'autoAccent'] }));
let fail = 0, pass = 0; const has = n => md.includes('`' + n + '`'), t = (c, m) => { c ? pass++ : (fail++, console.log('✗ ' + m)) };
I.L.forEach(n => t(has(n), '規格書缺版型 ' + n)); I.S.forEach(n => t(has(n), '規格書缺場景 ' + n)); I.EN.forEach(n => t(has(n), '規格書缺進場 ' + n)); I.EX.forEach(n => t(has(n), '規格書缺退場 ' + n)); I.FX.forEach(n => t(has(n), '規格書缺特效 ' + n));
I.K.forEach(n => t(has(n), '規格書缺設定鍵 ' + n)); I.P.forEach(n => t(md.includes('`' + n + '`'), '規格書缺風格包 ' + n));
const m = md.match(/共 \*\*(\d+) 種版型\*\*/); t(m && +m[1] === I.L.length, `規格書版型數 ${m && m[1]} ≠ ${I.L.length}`);
const m2 = md.match(/(\d+) 種場景層/); t(m2 && +m2[1] === I.S.length, `規格書場景數 ${m2 && m2[1]} ≠ ${I.S.length}`);
const labSec = md.slice(md.indexOf('### 3.1 實驗室版型'), md.indexOf('### 3.1 實驗室版型') + 400); I.LAB.forEach(n => t(labSec.includes('`' + n + '`'), '實驗室版型應列在 3.1：' + n));
const tbl = md.slice(0, md.indexOf('### 3.1 實驗室版型')); I.LAB.forEach(n => t(!tbl.includes('`' + n + '`'), '實驗室版型不得出現在正式清單：' + n));
const sc = md.slice(md.indexOf('### 7.6'), md.indexOf('## 8. 全域設定')); I.SL.forEach(n => t(!sc.includes('| `' + n + '` |'), '實驗室場景不得列入 7.6 表：' + n));
console.log(`規格書同步｜通過 ${pass}、失敗 ${fail}`); await browser.close(); process.exit(fail ? 1 : 0);
