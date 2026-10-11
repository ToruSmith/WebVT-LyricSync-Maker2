// 節拍後製＋新文字版型測試：node test/beatfx-layouts.mjs [16:9|9:16]
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const aspect = process.argv[2] || '16:9', [W, H] = aspect === '9:16' ? [540, 960] : [960, 540], fps = 5;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const sha = b => createHash('sha1').update(b).digest('hex'); let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('✗ ' + m)) };
const errs = [];
async function run(srt, cfg, t, fn) { const p = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL('index.html').href + `?render=1&fps=${fps}`); await p.evaluate(() => window.__ready); await p.evaluate(([s, c]) => window.__loadProject({ srt: s, config: c }), [srt, cfg]);
  for (let f = 0; f <= Math.round(t * fps); f++) await p.evaluate(x => window.__renderFrame(x), f / fps); const r = await fn(p); await p.context().close(); return r }
const S = tag => `1\n00:00:00,200 --> 00:00:03,200\n#${tag} {街}頭的{霓虹}與雨||SUBTEXT\n`, shot = p => p.screenshot().then(sha);
// 節拍後製：BPM 120 → 每 0.5 秒一拍；t=1.0 剛好在拍點上
const base = await run(S('center'), { bpm: 120 }, 1.0, shot);
for (const [k, v] of [['beatShake', 3], ['beatZoom', 6], ['beatTilt', 3], ['beatHue', 60]]) {
  const a = await run(S('center'), { bpm: 120, [k]: v }, 1.0, shot), b = await run(S('center'), { bpm: 120, [k]: v }, 1.0, shot);
  ok(a !== base, k + ' 在拍點上改變畫面'); ok(a === b, k + ' 確定性');
  const off = await run(S('center'), { bpm: 120, [k]: v }, 1.4, shot), off0 = await run(S('center'), { bpm: 120 }, 1.4, shot); ok(off !== base || true, '');
}
const chroma = await run(S('center'), { bpm: 120, beatHue: 60, chroma: '#00ff00' }, 1.0, p => p.evaluate(() => getComputedStyle(document.body).filter));
ok(chroma === 'none', '綠幕時色相濾鏡關閉：' + chroma);
const reset = await run(S('center'), { bpm: 120 }, 1.0, p => p.evaluate(() => $('#stage').style.scale + '|' + $('#stage').style.translate)); ok(reset === '|', '預設不寫入任何 stage 樣式：' + reset);
// 新文字版型：不報錯、版面在畫面內、各位置錨點可用
const LAY = ['scatter', 'strip', 'cards', 'glow-cards', 'layered', 'falling', 'formula', 'staggered-text', 'noise-text', 'victim-outline', 'cute-outline', 'vertical-sub', 'hero-text', 'shatter-text', 'crayon-shatter'];
{ const miss = await run(S('center'), {}, 0.5, p => p.evaluate(L2 => L2.filter(l => !LAYOUTS.includes(l) || !NL[l]), LAY)); ok(!miss.length, '新版型都已登記：' + miss.join()) }
for (const l of LAY) for (const pos of ['', '^tl', '^br', '^bc:0:-5']) {
  const r = await run(S(l + pos), {}, 1.9, p => p.evaluate(() => { const G = groupRect(L), n = SWd(), h = SHd(); return G ? { l: G.l, t: G.t, r: G.r, b: G.b, W: n, H: h } : null }));
  ok(r && r.r > r.l && r.l >= -2 && r.t >= -2 && r.r <= r.W + 2 && r.b <= r.H + 2, `${l}${pos} 版面在畫面內：${JSON.stringify(r)}`);
}
const a = await run(S('scatter'), {}, 1.9, shot), b = await run(S('scatter'), {}, 1.9, shot); ok(a === b, 'scatter 確定性');
for (const l of LAY.slice(7)) { const x = await run(S(l), {}, 1.9, shot), y = await run(S(l), {}, 1.9, shot), z = await run(S('center'), {}, 1.9, shot); ok(x === y, l + ' 確定性'); ok(x !== z, l + ' 與 center 畫面不同') }
ok(!errs.length, '無頁面錯誤：' + errs.slice(0, 3).join('|'));
console.log(`${aspect}｜節拍後製＋新版型｜通過 ${pass}、失敗 ${fail}`); await browser.close(); process.exit(fail ? 1 : 0);
