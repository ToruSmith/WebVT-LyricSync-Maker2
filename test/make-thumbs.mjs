// 產生「版型／場景層／風格包／預設組合」的縮圖精靈圖：node test/make-thumbs.mjs [名稱,名稱…（只重拍指定項目，其餘沿用）]
// 輸出：thumbs/sheet.webp（單張精靈圖）＋ src/28-thumbs-idx.js（名稱→格子位置；之後要 node build.mjs）。
// 環境同其他測試：npm i playwright；CHROME_PATH 指向 Chromium。新增版型／場景／風格包後重跑一次即可（舊的格子會整張重拍，約 2～3 分鐘）。
// 不屬於 npm run check；縮圖只是 UI 輔助，缺了不影響功能（介面會自動略過沒有縮圖的項目）。
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import crypto from 'node:crypto';

const SRC_W = 480, SRC_H = 270, FPS = 5, SHOT_FRAME = 8;   // 拍第 8 格＝1.6 秒（句子 0.2～3.2 秒，此時進場動畫大多已到位）
const TW = 128, TH = 72, COLS = 12, QUALITY = 0.5;           // 縮圖尺寸／每列格數／webp 品質（要更小改這裡）
const PAGE = pathToFileURL('index.html').href + '?render=1&fps=' + FPS;
const launch = { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] };
const SAMPLE = '歌詞測試字', BRACE = '歌詞{測試}字';

const b = await chromium.launch(launch);

// 1) 從頁面取得所有項目名稱（以頁面實際登記的為準，不另外維護清單）
const probe = await (await b.newContext({ viewport: { width: SRC_W, height: SRC_H } })).newPage();
await probe.goto(PAGE); await probe.evaluate(() => window.__ready);
const lists = await probe.evaluate(() => ({
  lay: [...LAYOUTS], brace: [...BRACE_LAYOUTS],
  scene: [...SCENE_NAMES],
  pack: [...STYLE_PACKS],
  preset: Object.keys(PRESETS).filter(k => !STYLE_PACKS.has(k)),
}));
await probe.context().close();
const BR = new Set(lists.brace);
const items = [
  ...lists.lay.map(n => 'lay:' + n), ...lists.scene.map(n => 'scene:' + n),
  ...lists.pack.map(n => 'pack:' + n), ...lists.preset.map(n => 'preset:' + n),
];

// 2) 逐項拍照（每項一個全新頁面，避免設定互相污染）
async function shot(key) {
  const [kind, n] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
  const ctx = await b.newContext({ viewport: { width: SRC_W, height: SRC_H } }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE); await p.evaluate(() => window.__ready);
  if (kind === 'pack' || kind === 'preset') await p.evaluate(x => { applyPreset(x) }, n);
  const tag = kind === 'lay' ? '#' + n + ' ' : kind === 'scene' ? '#center&' + n + ':80 ' : '';
  const txt = (kind === 'lay' && BR.has(n)) ? BRACE : SAMPLE, sub = n === 'vertical-sub' ? '||Sub line' : '';
  await p.evaluate(s => window.__loadProject({ srt: s, config: {} }), `1\n00:00:00,200 --> 00:00:03,200\n${tag}${txt}${sub}\n\n2\n00:00:03,300 --> 00:00:05,000\n下一句\n`);
  for (let f = 0; f <= SHOT_FRAME; f++) await p.evaluate(x => window.__renderFrame(x), f / FPS);
  const png = await p.screenshot({ type: 'png' }); await ctx.close();
  if (errs.length) console.warn('  ⚠ ' + key + ' 頁面錯誤：' + errs[0]);
  return png.toString('base64');
}
const prev = fs.existsSync('thumbs/sheet.webp') && fs.existsSync('src/28-thumbs-idx.js');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;   // 只重拍：名稱可寫 neon 或 lay:neon
const shots = new Map(); let done = 0;
const todo = items.filter(k => !only || only.has(k) || only.has(k.slice(k.indexOf(':') + 1)));
const queue = [...todo];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let k; (k = queue.shift());) { shots.set(k, await shot(k)); if (++done % 20 === 0) console.log(`  ${done}/${todo.length}`); }
}));

// 3) 在頁面內用 canvas 拼成一張精靈圖（不需額外套件）；只重拍時，舊格子從現有 sheet 搬過來
const oldIdx = prev && only ? (fs.readFileSync('src/28-thumbs-idx.js', 'utf8').match(/idx:"([^"]*)"/) || [, ''])[1].split(',').filter(Boolean) : [];
const oldB64 = prev && only ? fs.readFileSync('thumbs/sheet.webp').toString('base64') : '';
const pg = await (await b.newContext()).newPage();
const out = await pg.evaluate(async ({ items, shots, TW, TH, COLS, Q, oldIdx, oldB64 }) => {
  const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src });
  const rows = Math.ceil(items.length / COLS), cv = document.createElement('canvas'); cv.width = COLS * TW; cv.height = rows * TH;
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  const old = oldB64 ? await load('data:image/webp;base64,' + oldB64) : null, oc = Math.round((old ? old.width : 0) / TW);
  const kept = [];
  for (let i = 0; i < items.length; i++) {
    const x = (i % COLS) * TW, y = Math.floor(i / COLS) * TH, k = items[i];
    if (shots[k]) {
      const im = await load('data:image/png;base64,' + shots[k]);
      const mid = document.createElement('canvas'); mid.width = im.width / 2; mid.height = im.height / 2;   // 兩段式縮小，邊緣較不鋸齒
      const mg = mid.getContext('2d'); mg.imageSmoothingQuality = 'high'; mg.drawImage(im, 0, 0, mid.width, mid.height);
      g.drawImage(mid, 0, 0, mid.width, mid.height, x, y, TW, TH); kept.push(k);
    } else { const j = oldIdx.indexOf(k); if (j >= 0 && old) { g.drawImage(old, (j % oc) * TW, Math.floor(j / oc) * TH, TW, TH, x, y, TW, TH); kept.push(k) } }
  }
  const url = cv.toDataURL('image/webp', Q);
  return { b64: url.split(',')[1], kept };
}, { items, shots: Object.fromEntries(shots), TW, TH, COLS, Q: QUALITY, oldIdx, oldB64 });
await b.close();

const missing = items.filter(k => !out.kept.includes(k));
if (missing.length) console.warn('沒有縮圖的項目（會被介面略過）：' + missing.join(' '));
const buf = Buffer.from(out.b64, 'base64'); fs.mkdirSync('thumbs', { recursive: true }); fs.writeFileSync('thumbs/sheet.webp', buf);
const ver = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
fs.writeFileSync('src/28-thumbs-idx.js', `/* ===== [THUMBS-IDX] 縮圖精靈圖索引（由 test/make-thumbs.mjs 產生，請勿手改；邏輯在 28-thumbs.js）===== */\nvar TH_DATA={w:${TW},h:${TH},cols:${COLS},v:"${ver}",idx:"${items.map(k => out.kept.includes(k) ? k : '-').join(',')}"};\n`);
console.log(`✓ thumbs/sheet.webp ${(buf.length / 1024).toFixed(0)} KB，${items.length} 格（${COLS} 欄 × ${Math.ceil(items.length / COLS)} 列）；請執行 node build.mjs`);
