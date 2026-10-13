// 風格包＋全域底層＋版型池＋自動取主色測試：node test/styles.mjs [16:9|9:16] [截圖輸出資料夾]
// 檢查：16 包都已登記且欄位合法；套用後逐格渲染不報錯、畫面非空白、兩次渲染雜湊相同（確定性）；
//       版型池／全域底層是句子索引的純函數；離開風格包能還原；pickAccent 取到對的色相。每包存一張截圖供人工檢視。
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const aspect = process.argv[2] || '16:9', outDir = process.argv[3], [W, H] = aspect === '9:16' ? [540, 960] : [960, 540], fps = 5;
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const sha = b => createHash('sha1').update(b).digest('hex'); let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('✗ ' + m)) };
const errs = [], warns = [];
const SRT = [0, 1, 2, 3].map(i => `${i + 1}\n00:00:0${i * 2},000 --> 00:00:0${i * 2 + 1},800\n{街}頭的{霓虹}與雨${i}||SUBTEXT\n`).join('\n');
async function open(file) { const p = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning') warns.push(m.text()) });
  await p.goto(pathToFileURL(resolve(file)).href + `?render=1&fps=${fps}`); await p.evaluate(() => window.__ready); return p }
async function shots(cfg, times) { const p = await open('index.html'); await p.evaluate(([s, c]) => window.__loadProject({ srt: s, config: c }), [SRT, cfg]); const out = [];
  for (let f = 0, k = 0; k < times.length; f++) { await p.evaluate(x => window.__renderFrame(x), f / fps); if (f === Math.round(times[k] * fps)) { out.push(await p.screenshot()); k++ } } await p.context().close(); return out }
const pre = await open('index.html');
const info = await pre.evaluate(() => ({ packs: [...STYLE_PACKS], cfg: Object.fromEntries([...STYLE_PACKS].map(n => [n, PRESETS[n]])), L: LAYOUTS, S: SCENE_NAMES, D: Object.keys(CFG_DEFAULTS) }));
ok(info.packs.length === 19, '風格包數量 19：' + info.packs.length);
for (const n of info.packs) { const c = info.cfg[n];
  for (const k of Object.keys(c)) ok(info.D.includes(k), `${n}：未知 CONFIG 鍵 ${k}`);
  ok(c.layoutPool && c.layoutPool.split(',').every(l => info.L.includes(l)), `${n}：版型池含未登記版型 ${c.layoutPool}`);
  const toks = (c.sceneAll || '').split(',').filter(Boolean).map(t => t.split(':')[0]); ok(toks.length && toks.every(t => info.S.includes(t)), `${n}：全域底層含未登記場景 ${c.sceneAll}`);
  ok(toks.filter(t => !/^bfx-/.test(t)).length <= 3, `${n}：全域底層超過 3 層`) }
// 純函數：版型池與全域底層只由句子索引決定
const pure = await pre.evaluate(() => { CONFIG.layoutPool = 'center,poster,strip'; const a = [0, 1, 2, 3, 4].map(poolLay), b = [0, 1, 2, 3, 4].map(poolLay); CONFIG.layoutPool = ''; const c = poolLay(3);
  CONFIG.sceneAll = 'halftone:60,burst'; const s = parseSRT(DEMO), x = sceneList(s[0]).map(o => o.n).join(), y = sceneList(s[0]).map(o => o.n).join(); CONFIG.sceneAll = ''; return { a, b, c, x, y, g: LAYOUTS[3] } });
ok(JSON.stringify(pure.a) === JSON.stringify(['center', 'poster', 'strip', 'center', 'poster']) && JSON.stringify(pure.a) === JSON.stringify(pure.b), '版型池循環且穩定：' + pure.a);
ok(pure.c === pure.g, '空池＝舊行為（LAYOUTS[i%n]）'); ok(pure.x === 'halftone,burst' && pure.x === pure.y, '全域底層套用到沒有 & 的句子：' + pure.x);
const own = await pre.evaluate(() => { CONFIG.sceneAll = 'halftone'; const s = parseSRT('1\n00:00:00,000 --> 00:00:01,000\n#center&dots 字\n\n2\n00:00:01,000 --> 00:00:02,000\n#center&none 字\n'); const r = [sceneList(s[0]).map(o => o.n).join(), sceneList(s[1]).map(o => o.n).join()]; CONFIG.sceneAll = ''; return r });
ok(own[0] === 'dots', '句子自己的 & 優先於全域底層：' + own[0]); ok(own[1] === '', '&none 不套全域底層：' + own[1]);
// 套用／離開風格包
const rev = await pre.evaluate(() => { const r = {}; localStorage.clear(); applyPreset('歇斯底里之夜'); r.on = [CONFIG.sceneAll, CONFIG.beatShake, CONFIG.auto, CONFIG.ghostOn].join('|'); applyPreset('動畫PV'); r.off = ['sceneAll', 'layoutPool', 'beatShake', 'beatTilt', 'beatHue', 'ghostOn', 'bgMode', 'color', 'auto', 'dim', 'speed'].map(k => CONFIG[k] === CFG_DEFAULTS[k] ? 1 : k + '=' + CONFIG[k]).join(); return r });
ok(/glitch-bars/.test(rev.on) && /true$/.test(rev.on), '套用風格包：' + rev.on); ok(!/[a-zA-Z]=/.test(rev.off), '離開風格包後欄位還原：' + rev.off);
const old = await pre.evaluate(() => { localStorage.clear(); applyPreset('賽博龐克'); CONFIG.sceneAll = 'halftone'; applyPreset('霓虹夜'); return CONFIG.sceneAll }); ok(old === 'halftone', '舊預設之間不動 sceneAll（行為不變）：' + old);
// 自動取主色
const ac = await pre.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 40; const x = c.getContext('2d'); x.fillStyle = '#202020'; x.fillRect(0, 0, 40, 40); x.fillStyle = '#e06010'; x.fillRect(5, 5, 25, 25); return pickAccent(c, 40, 40) });
ok(/^#[0-9a-f]{6}$/.test(ac), '取色格式：' + ac); { const [r, g, b] = [1, 3, 5].map(i => parseInt(ac.slice(i, i + 2), 16)); ok(r > g && g > b && r > 200, '橘色主色：' + ac) }
ok(await pre.evaluate(() => pickAccent((() => { const c = document.createElement('canvas'); c.width = c.height = 8; return c })(), 8, 8)) === null, '無鮮明色時回傳 null');
await pre.context().close();
// 渲染：每包一張截圖；非空白、確定性、與無風格不同
const times = [.9, 2.9, 4.9, 6.9], base = await shots({ auto: false }, [.9]), baseH = sha(base[0]);
for (const n of info.packs) { const cfg = info.cfg[n], a = await shots(cfg, times), b = await shots(cfg, times); const ha = a.map(sha), hb = b.map(sha);
  ok(ha.join() === hb.join(), n + '：逐格確定性'); ok(ha[0] !== baseH, n + '：與無風格畫面不同'); ok(new Set(ha).size >= 3, n + '：各句畫面不同（版型池／場景有作用）');
  if (outDir) fs.writeFileSync(`${outDir}/${aspect.replace(':', 'x')}-${n}.png`, a[1]) }
ok(errs.length === 0, '頁面錯誤：' + errs.slice(0, 2)); const bad = warns.filter(w => /\[scene\]/.test(w)); ok(!bad.length, '場景警告：' + bad.slice(0, 2));
console.log(`${aspect}｜風格包測試｜通過 ${pass}、失敗 ${fail}`); await browser.close(); process.exit(fail ? 1 : 0);
