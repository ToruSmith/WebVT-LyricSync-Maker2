// 場景層測試：node test/scene.mjs [16:9|9:16]；環境同 regress-all.mjs（CHROME_PATH）
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const aspect = process.argv[2] || '16:9', [W, H] = aspect === '9:16' ? [540, 960] : [960, 540], fps = 5;
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] } : { args: ['--enable-unsafe-swiftshader'] });
const sha = b => createHash('sha1').update(b).digest('hex');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('✗ ' + m)) };
async function open() { const p = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); const warns = []; p.on('console', m => m.type() === 'warning' && warns.push(m.text()));
  await p.goto(pathToFileURL(resolve('index.html')).href + `?render=1&fps=${fps}`); await p.evaluate(() => window.__ready); return { p, errs, warns } }
const { p, errs, warns } = await open();
const mk = tag => `1\n00:00:00,200 --> 00:00:03,200\n#center${tag} 場景測試\n`;
// 每張截圖用全新分頁：離線模式的種子亂數狀態不會跨 __loadProject 重置，同頁重複載入不可比
const shot = async (srt, t, mode, cfg = {}) => { const o = await open(); const q = o.p; await q.evaluate(([s, c]) => window.__loadProject({ srt: s, config: c }), [srt, cfg]); for (let f = 0; f <= Math.round(t * fps); f++) await q.evaluate(x => window.__renderFrame(x), f / fps); if (mode) await q.evaluate(m => window.__layer(m), mode); const b = await q.screenshot({ omitBackground: true }); errs.push(...o.errs); await q.context().close(); return b };
// 1 解析
const parsed = await p.evaluate(() => { const r = parseTag('#center+fade+sink~float^bc:1:2*%E9%BB%91%E9%AB%94@neon,outline&halftone:60,burst 字', 0, 1); const a = parseTag('#&dots 字', 0, 1); const o = parseTag('#neon+fade 舊', 0, 1); return { r, a, o } });
ok(parsed.r.scene === 'halftone:60,burst' && parsed.r.st === 'neon,outline' && parsed.r.pos === 'bc:1:2' && parsed.r.font === '黑體' && parsed.r.fx === 'float', '& 與其他段並用解析：' + JSON.stringify(parsed.r));
ok(parsed.a.scene === 'dots' && parsed.a.auto === true, '#&dots 解析');
ok(parsed.o.scene === '' && parsed.o.st === '' && parsed.o.lay === 'neon', '舊語法不受影響');
// 2 清單：未知、互斥、上限、強度
const lst = await p.evaluate(() => { const f = s => sceneList({ scene: s }).map(o => o.n + ':' + o.amt).join(','); return [f('nope,halftone'), f('halftone,dots'), f('halftone,burst,guides,target'), f('burst:150,rings:-5,glow-ring:x')] });
ok(lst[0] === 'halftone:60', '未知名稱忽略：' + lst[0]); ok(lst[1] === 'dots:50', '同類互斥後者取代：' + lst[1]); ok(lst[2].split(',').length === 3, '上限 3 層：' + lst[2]); ok(lst[3] === 'burst:100,glow-ring:60', '強度夾限、非數字回預設、同類互斥：' + lst[3]);
ok(warns.some(w => /未知場景/.test(w)), '未知名稱有 console.warn');
// 3 匯出標記往返
const rt = await p.evaluate(() => { subs = parseSRT('1\n00:00:00,000 --> 00:00:02,000\n#center+fade&halftone:60 字\n\n2\n00:00:02,000 --> 00:00:03,000\n#&dots 字\n'); return srtText() });
ok(/#center\+fade&halftone:60 字/.test(rt) && /#&dots 字/.test(rt), '帶標記 SRT 往返：' + rt.replace(/\n/g, '|'));
// 4 每個場景：渲染不報錯、有畫面差異、同時間兩次雜湊相同
const base = sha(await shot(mk(''), 1.5));
const names = await p.evaluate(() => SCENE_NAMES.slice()); const layers = await p.evaluate(() => Object.fromEntries(SCENE_NAMES.map(n => [n, SCENES[n].layer])));
for (const n of names) {
  const a = sha(await shot(mk('&' + n + ':100'), 1.5)), b = sha(await shot(mk('&' + n + ':100'), 1.5));
  ok(a !== base, n + ' 有改變畫面'); ok(a === b, n + ' 逐幀確定性');
  // 5 輸出模式
  const txt = sha(await shot(mk('&' + n + ':100'), 1.5, 'text')), txt0 = sha(await shot(mk(''), 1.5, 'text')); ok(txt === txt0, n + ' 文字層不含場景層');
  const amb = sha(await shot(mk('&' + n + ':100'), 1.5, 'amb')), amb0 = sha(await shot(mk(''), 1.5, 'amb')); ok(amb !== amb0, n + ' 氛圍層含場景層');
}
// 綠幕
await p.evaluate(() => window.__loadProject({ srt: '1\n00:00:00,200 --> 00:00:03,200\n#center&halftone 字\n', config: { chroma: '#00ff00' } })); for (let f = 0; f <= 8; f++) await p.evaluate(x => window.__renderFrame(x), f / fps);
ok(await p.evaluate(() => getComputedStyle(document.querySelector('#cv')).display === 'none' && getComputedStyle(document.querySelector('#cv2')).display === 'none'), '綠幕隱藏畫布');
ok(!errs.length, '無頁面錯誤：' + errs.slice(0, 3).join('|'));
console.log(`${aspect}｜場景層 ${names.length} 個｜通過 ${pass}、失敗 ${fail}`); await browser.close(); process.exit(fail ? 1 : 0);
