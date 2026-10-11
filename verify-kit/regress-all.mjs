// 回歸（只需 index.html，不需 render/ 資料夾）：
// 用法：node regress-all.mjs 舊.html 新.html [16:9|9:16]
// 比對內容（舊版與新版逐項截圖雜湊，應全部相同）：
//   A. @demo 每句中段的畫面，含「一般／只有文字(__layer text)／只有氛圍(__layer amb)」三種輸出模式
//   B. 舊版 LAYOUTS 裡「每一種版型」各一句（涵蓋 @demo 沒用到的版型）
// 新版多出來的版型不會被比對（只比對舊版已有的）。有差異時退出碼為 1。
// 環境：npm i playwright；PLAYWRIGHT_BROWSERS_PATH 或 CHROME_PATH 指向 Chromium。
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [oldF, newF, aspect = '16:9'] = process.argv.slice(2);
if (!oldF || !newF) { console.log('用法：node regress-all.mjs 舊.html 新.html [16:9|9:16]'); process.exit(2) }
const [W, H] = aspect === '9:16' ? [540, 960] : [960, 540], fps = 5;
const TXT = '{街}頭的{霓虹}與雨||SUBTEXT';
const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] } : { args: ['--enable-unsafe-swiftshader'] };
const browser = await chromium.launch(launch);
const sha = b => createHash('sha1').update(b).digest('hex');
const tc = t => { const ms = Math.round(t * 1000), z = (n, l = 2) => String(n).padStart(l, '0'); return `${z(Math.floor(ms / 3600000))}:${z(Math.floor(ms / 60000) % 60)}:${z(Math.floor(ms / 1000) % 60)},${z(ms % 1000, 3)}` };

async function open(file) {
  const p = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(resolve(file)).href + `?render=1&fps=${fps}`); await p.evaluate(() => window.__ready);
  return { p, errs };
}
// 依序渲染到最後一個目標格；在目標格截圖。modes=true 時另截「文字層／氛圍層」。
async function sweep(p, targets, modes) {
  const want = new Map(targets.map((t, i) => [Math.round(t * fps), i])), out = {};
  for (let f = 0; f <= Math.max(...want.keys()); f++) {
    await p.evaluate(t => window.__renderFrame(t), f / fps);
    if (!want.has(f)) continue;
    const i = want.get(f), h = [sha(await p.screenshot())];
    if (modes) {
      await p.evaluate(() => window.__layer('text')); h.push(sha(await p.screenshot({ omitBackground: true })));
      await p.evaluate(() => window.__layer('amb')); h.push(sha(await p.screenshot()));
      await p.evaluate(() => window.__layer(''));
    }
    out[i] = h.join('|');
  }
  return out;
}
async function run(file, layouts) {
  const { p, errs } = await open(file);
  // A. @demo
  await p.evaluate(() => window.__loadProject({ srt: '@demo', config: {} }));
  const mids = await p.evaluate(() => subs.map(x => (x.s + x.e) / 2));
  const demo = await sweep(p, mids, true);
  // B. 每種版型一句
  const lays = layouts || await p.evaluate(() => [...new Set(LAYOUTS)]);
  const srt = lays.map((l, i) => `${i + 1}\n${tc(.2 + 3.2 * i)} --> ${tc(3.2 + 3.2 * i)}\n#${l} ${TXT}\n`).join('\n');
  await p.evaluate(s => window.__loadProject({ srt: s, config: {} }), srt);
  const all = await sweep(p, lays.map((_, i) => .2 + 3.2 * i + 1.9), false);
  await p.context().close(); return { demo, all, lays, errs };
}
const a = await run(oldF), b = await run(newF, a.lays);
const bad = (x, y, names) => Object.keys(x).filter(i => x[i] !== y[i]).map(i => names ? names[i] : +i + 1);
const dDemo = bad(a.demo, b.demo), dAll = bad(a.all, b.all, a.lays);
console.log(`${aspect}｜@demo ${mids(a.demo)} 句（含三種輸出模式）不同 ${dDemo.length}${dDemo.length ? '（第 ' + dDemo.join(',') + ' 句）' : ''}`);
console.log(`${aspect}｜全版型 ${a.lays.length} 種 不同 ${dAll.length}${dAll.length ? '：' + dAll.join(',') : ''}`);
const errs = [...a.errs, ...b.errs]; if (errs.length) console.log('頁面錯誤：', errs.slice(0, 5).join(' | '));
function mids(o) { return Object.keys(o).length }
await browser.close(); process.exit(dDemo.length || dAll.length || errs.length ? 1 : 0);
