// UI 功能對等：node test/ui-parity.mjs --gen 產生 test/ui-parity.json（動 UI 前先跑）；不帶參數＝檢查舊項目一個不少。環境同 regress-all.mjs（CHROME_PATH）
import { chromium } from 'playwright';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const gen = process.argv.includes('--gen'), file = process.argv.find(a => a.endsWith('.html')) || 'index.html';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {});
const p = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(resolve(file)).href); await p.waitForTimeout(500);
const cur = await p.evaluate(() => ({
  dataK: [...new Set([...document.querySelectorAll('#panel [data-k]')].map(e => e.dataset.k))].sort(),
  panelSecs: [...document.querySelectorAll('#panel [data-sec]')].map(e => e.dataset.sec),
  quickIds: quickActions().map(a => a.id).filter(i => !/^(scene-(cur|all):|lock:|preset:)/.test(i)),
  quickFamilies: ['preset:', 'lock:', 'scene-cur:', 'scene-all:'].map(f => [f, quickActions().filter(a => a.id.startsWith(f)).length]),
  barIds: [...document.querySelectorAll('#bar [id]')].map(e => e.id).sort(),
  panelInputs: document.querySelectorAll('#panel input[type=range]').length,
  sliderLabels: [...document.querySelectorAll('#panel label')].map(l => l.firstChild && l.firstChild.textContent).filter(Boolean)
}));
if (gen) { fs.writeFileSync('test/ui-parity.json', JSON.stringify(cur, null, 1)); console.log('已寫入 test/ui-parity.json', Object.fromEntries(Object.entries(cur).map(([k, v]) => [k, v.length]))); await browser.close(); process.exit(0) }
const old = JSON.parse(fs.readFileSync('test/ui-parity.json', 'utf8')); let fail = 0, pass = 0;
const need = (name, a, b) => { const s = new Set(b); a.forEach(x => { s.has(x) ? pass++ : (fail++, console.log('✗ 舊項目消失 ' + name + '：' + x)) }) };
need('data-k', old.dataK, cur.dataK); need('面板區段', old.panelSecs, cur.panelSecs); need('快捷表 id', old.quickIds, cur.quickIds); need('頂欄 id', old.barIds, cur.barIds); need('滑桿/標籤', old.sliderLabels, cur.sliderLabels);
old.quickFamilies.forEach(([f, n]) => { const c = cur.quickFamilies.find(x => x[0] === f)[1]; c >= n ? pass++ : (fail++, console.log('✗ 快捷表家族變少 ' + f + ' ' + n + '→' + c)) });
cur.panelInputs >= old.panelInputs ? pass++ : (fail++, console.log('✗ 面板滑桿變少'));
errs.length && (fail++, console.log('✗ 頁面錯誤 ' + errs[0]));
console.log(`UI 對等｜通過 ${pass}、失敗 ${fail}`); await browser.close(); process.exit(fail ? 1 : 0);
