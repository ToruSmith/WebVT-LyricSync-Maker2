// 逐句文字大小（標記 $大字比例,縮放%）＋逐句隨機（適配）測試：node test/sentence-opts.mjs [16:9|9:16]
// 檢查：① $ 標記解析／輸出來回一致、舊語法（沒有 $）完全不受影響、字體名含 $ 或 * 不會被誤判
//       ② 這句的大字比例／縮放會「取代」全域值（不是相乘），且不影響其他句；兩次渲染雜湊相同（確定性）
//       ③ 隨機（rndSentence，固定種子）：版型不含實驗室、場景／特效符合適配表（主題、sparse、強烈特效、同群組互斥、成本、層數上限）、bfx-* 保留、結果能來回解析
//       ④ 隨機出來的組合逐版型實際渲染不報錯、沒有未知場景警告
//       ⑤ 編輯器 UI：新欄位存在、寫入標記、批次隨機與復原
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const aspect = process.argv[2] || '16:9', [W, H] = aspect === '9:16' ? [540, 960] : [960, 540], fps = 5;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const sha = b => createHash('sha1').update(b).digest('hex'); let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('✗ ' + m)) };
const errs = [], warns = [];
async function open(query = `?render=1&fps=${fps}`, ready = true) { const p = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning') warns.push(m.text()) });
  await p.goto(pathToFileURL(resolve('index.html')).href + query); if (ready) await p.evaluate(() => window.__ready); return p }
const srt = (...tags) => tags.map((t, i) => `${i + 1}\n00:00:0${i * 3 + 1},000 --> 00:00:0${i * 3 + 3},500\n${t}\n`).join('\n');

/* ① 解析／輸出 */
const pre = await open();
const P = await pre.evaluate(() => {
  const t = s => { const x = parseTag(s, 0, 1); return { lay: x.lay, auto: x.auto, bigR: x.bigR, txtS: x.txtS, pos: x.pos, font: x.font, st: x.st, scene: x.scene, fx: x.fx, raw: x.raw } };
  const rt = s => { const x = parseTag(s, 0, 1); return tag(x) + x.raw };
  const fnt = { auto: false, lay: 'lowerleft', en: '', ex: '', fx: '', pos: '', st: '', scene: '', font: 'A$B*C', bigR: .3, txtS: 150, raw: '你好' };
  const fx2 = parseTag(tag(fnt) + fnt.raw, 0, 1);
  return { a: t('#slam+rise+sink~float^bc:2:3$0.3,150*%E6%A5%B7@neon&halftone 你好'), b: t('#$0.3 你好'), c: t('#$,120&dots 你好'), d: t('#split+rise 你好'), e: t('#neon+zoomin+blur-out~flicker 在夜色裡發光'), f: t('#lowerleft^tl:5:10$0.5 hi'), g: t('#slam$9,999 x'), h: t('#slam$0.01,5 x'),
    rt: ['#slam+rise+sink~float^bc:2:3$0.3,150@neon&halftone 你好', '#$,120&dots 你好', '#$0.4 你好', '#split+rise 你好', '#center+fade~float,shake^tc@neon,glitch&dots,burst 你好'].map(s => [s, rt(s)]),
    fnt: { font: fx2.font, bigR: fx2.bigR, txtS: fx2.txtS, lay: fx2.lay } };
});
ok(P.a.bigR === .3 && P.a.txtS === 150 && P.a.pos === 'bc:2:3' && P.a.fx === 'float' && P.a.st === 'neon' && P.a.scene === 'halftone' && P.a.lay === 'slam', '$ 標記與其他欄位同時解析：' + JSON.stringify(P.a));
ok(P.b.auto && P.b.bigR === .3 && P.b.txtS === 0 && P.b.raw === '你好', '只有 $ 的句子仍是自動句：' + JSON.stringify(P.b));
ok(P.c.auto && P.c.txtS === 120 && P.c.bigR === 0 && P.c.scene === 'dots', '$,縮放 只寫縮放：' + JSON.stringify(P.c));
ok(P.d.bigR === 0 && P.d.txtS === 0 && P.d.lay === 'split' && !P.d.auto, '舊語法（沒有 $）不受影響');
ok(P.e.bigR === 0 && P.e.txtS === 0 && P.e.fx === 'flicker' && P.e.raw === '在夜色裡發光', '舊語法：進退場＋特效');
ok(P.f.pos === 'tl:5:10' && P.f.bigR === .5 && P.f.raw === 'hi', '位置後接 $ 不會被位置吃掉：' + JSON.stringify(P.f));
ok(P.g.bigR === .8 && P.g.txtS === 300, '超出範圍會夾到上限：' + JSON.stringify(P.g));
ok(P.h.bigR === .03 && P.h.txtS === 20, '低於範圍會夾到下限：' + JSON.stringify(P.h));
P.rt.forEach(([a, b]) => ok(a + '' === b.replace(/\s+$/, ' ').replace(/ $/, '') || a === b, `來回一致：${a} → ${b}`));
ok(P.fnt.font === 'A$B*C' && P.fnt.bigR === .3 && P.fnt.txtS === 150, '字體名含 $ 與 * 仍能來回：' + JSON.stringify(P.fnt));

/* ② 取代全域、不影響別句、確定性 */
const FS = () => { const m = {}; const els = [...document.querySelectorAll('#L *')].filter(e => !e.children.length && e.textContent.trim() && getComputedStyle(e).opacity !== '0'); return Math.max(0, ...els.map(e => parseFloat(getComputedStyle(e).fontSize))) };
async function sizes(srtText, cfg, times) { const p = await open(); await p.evaluate(([s, c]) => window.__loadProject({ srt: s, config: c }), [srtText, cfg || {}]); const out = []; const shots = [];
  for (const t of times) { await p.evaluate(x => window.__renderFrame(x), t); out.push(await p.evaluate(FS)); shots.push(sha(await p.screenshot())) } await p.context().close(); return { out, shots } }
const base = await sizes(srt('#lowerleft 你好', '#slam 你好', '#lowerleft 你好'), {}, [2, 5, 8]);
const BIG = aspect === '9:16' ? '0.1' : '0.5';   /* 直式的大字高度被 vw*.3 上限鎖住（預設 .25 已到頂），所以直式改測「變小」 */
const mod = await sizes(srt('#lowerleft$,200 你好', `#slam$${BIG} 你好`, '#lowerleft 你好'), {}, [2, 5, 8]);
ok(Math.abs(mod.out[0] / base.out[0] - 2) < .05, `縮放 200% 使 lowerleft 字級約 2 倍：${base.out[0]} → ${mod.out[0]}`);
ok(aspect === '9:16' ? mod.out[1] < base.out[1] * .8 : mod.out[1] > base.out[1] * 1.5, `slam 大字比例 ${BIG} 使字級${aspect === '9:16' ? '變小' : '變大'}：${base.out[1]} → ${mod.out[1]}`);
ok(mod.out[2] === base.out[2], `沒標記的第 3 句字級不變：${base.out[2]} → ${mod.out[2]}`);
const glob = await sizes(srt('#lowerleft 你好', '#lowerleft$,100 你好'), { textScale: 200 }, [2, 5]);
ok(Math.abs(glob.out[0] / glob.out[1] - 2) < .05, `全域縮放 200%：這句 $,100 取代全域（不是相乘）：${glob.out[0]} vs ${glob.out[1]}`);
const mod2 = await sizes(srt('#lowerleft$,200 你好', `#slam$${BIG} 你好`, '#lowerleft 你好'), {}, [2, 5, 8]);
ok(mod.shots.join() === mod2.shots.join(), '兩次渲染逐格雜湊相同（確定性）');

/* ③ 隨機規則（固定種子） */
const R = await pre.evaluate(() => {
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const rng = mul(12345), bad = [], N = 4000; const sc = new Set(SCENE_NAMES), lab = SCENE_NAMES.filter(n => SCENES[n].lab);
  const rs = s => new Set(s.split(/\s+/).filter(Boolean)), grp = {}; Object.keys(RND_FX_GRP).forEach(g => rs(RND_FX_GRP[g]).forEach(f => grp[f] = g));
  const stats = { lay: new Set(), scene: new Set(), fx: new Set(), withScene: 0, withFx: 0 };
  for (let k = 0; k < N; k++) {
    const o = { lay: true, anim: true, fx: true, scn: true, lab: k % 10 === 0 };
    const x = { s: 0, e: 3, lay: LAYOUTS[k % LAYOUTS.length], auto: false, en: '', ex: '', fx: '', pos: '', st: '', font: '', scene: k % 7 === 0 ? 'bfx-shake:3,halftone' : '', bigR: 0, txtS: 0, raw: '你好{世界}', plain: '你好', br: ['世界'], hl: [], sub: '' };
    const prev = { lay: LAYOUTS[(k + 5) % LAYOUTS.length] }, was = x.lay; rndSentence(x, prev, o, rng); const F = rndFit(x.lay);
    const B = m => bad.push(k + '：' + m + '｜' + JSON.stringify({ lay: x.lay, en: x.en, ex: x.ex, fx: x.fx, scene: x.scene }));
    stats.lay.add(x.lay); if (!LAYOUTS.includes(x.lay)) B('版型未登記'); if (!o.lab && LAB_LAYOUTS.has(x.lay)) B('不含實驗室卻抽到實驗室版型'); if (rs(RND_NEED_SUB).has(x.lay) && !x.sub) B('沒有副文卻抽到 ruby／footnote'); if (x.lay === was || x.lay === prev.lay) B('版型與目前／前一句相同');
    if (F.noEn && x.en) B('slam／bounce 不該寫進場'); else if (!F.noEn && !ENTERS.includes(x.en)) B('進場未登記'); if (!EXITS.includes(x.ex)) B('退場未登記');
    const fl = x.fx.split(',').filter(Boolean); fl.forEach(f => stats.fx.add(f)); if (fl.length) stats.withFx++; if (fl.length < 1 || fl.length > 2) B('特效數量');
    const gs = fl.map(f => grp[f] || f); if (new Set(gs).size !== gs.length) B('特效同群組重複');
    fl.forEach(f => { if (!FXS.includes(f)) B('特效未登記：' + f); if (rs(RND_FX_STRONG).has(f) && !F.strong) B('強烈特效配到非高能量版型：' + f); if (rs(RND_FX_DOM).has(f) && F.textCanvas) B('DOM 文字特效配到 canvas 文字版型：' + f) });
    const toks = x.scene.split(',').filter(Boolean), sn = toks.filter(t => !/^bfx-/.test(t)); sn.forEach(n => stats.scene.add(n)); if (sn.length) stats.withScene++;
    if (k % 7 === 0 && !toks.includes('bfx-shake:3')) B('bfx-* 沒保留'); if (sn.length < 1 || sn.length > 2 || sn.length > (CONFIG.sceneMax || 3)) B('場景層數');
    const gp = sn.map(n => SCENES[n] && SCENES[n].grp); if (new Set(gp).size !== gp.length) B('場景同群組重複'); let cost = 0;
    sn.forEach(n => { const S = SCENES[n]; if (!S) return B('場景未登記：' + n); cost += SCENE_COST[S.cost]; if (!o.lab && S.lab) B('不含實驗室卻抽到實驗室場景：' + n); if (F.sparse && S.layer === 'over') B('sparse 版型配到 over 場景：' + n); const th = rndSceneTh(n); if (!F.accept.has(th)) B('場景主題 ' + th + ' 不適配此版型：' + n) });
    if (cost > CONFIG.sceneBudget) B('場景成本超過預算：' + cost);
    const y = parseTag(tag(x) + x.raw, 0, 3); const nEn = v => x.ex ? (v || 'fade') : v;   /* 既有 tag()：有退場但沒進場時會補寫 +fade；slam／bounce 不使用 en，所以 ''↔fade 視為相同 */
    if (y.lay !== x.lay || y.fx !== x.fx || y.scene !== x.scene || nEn(y.en) !== nEn(x.en) || y.ex !== x.ex) B('來回解析不一致');
  }
  const tabs = rndCheck(); return { bad: bad.slice(0, 15), nbad: bad.length, tabs, nLay: stats.lay.size, nScene: stats.scene.size, nFx: stats.fx.size, withScene: stats.withScene, withFx: stats.withFx, N, total: { lay: LAYOUTS.length, scene: SCENE_NAMES.length, fx: FXS.length } };
});
ok(R.nbad === 0, `隨機規則違反 ${R.nbad} 次：\n  ` + R.bad.join('\n  '));
ok(R.tabs.length === 0, '適配表登記一致：' + R.tabs.join('；'));
ok(R.withScene === R.N && R.withFx === R.N, `每次都抽到場景與特效：${R.withScene}／${R.withFx}／${R.N}`);
ok(R.nLay > 40 && R.nScene > 15 && R.nFx > 12, `涵蓋度（版型 ${R.nLay}／${R.total.lay}、場景 ${R.nScene}／${R.total.scene}、特效 ${R.nFx}／${R.total.fx}）`);

/* ④ 逐版型實際渲染（隨機出來的組合不報錯、無未知場景警告） */
const layouts = await pre.evaluate(() => LAYOUTS.filter(l => !LAB_LAYOUTS.has(l)));
const mk = await pre.evaluate(ls => { let seed = 7; const rng = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296; const out = [];
  ls.forEach((l, i) => { const x = { s: 1 + i * 3, e: 3.5 + i * 3, lay: l, auto: false, en: '', ex: '', fx: '', pos: '', st: '', font: '', scene: '', bigR: 0, txtS: 0, raw: '街頭的{霓虹}與雨', plain: '', br: [], hl: [], sub: '' };
    rndSentence(x, null, { lay: false, anim: true, fx: true, scn: true, lab: false }, rng); out.push(tag(x) + x.raw) }); return out }, layouts);
{ const body = mk.map((t, i) => `${i + 1}\n${'00:00:' + String(1 + i * 3).padStart(2, '0')},000 --> ${'00:00:' + String(3 + i * 3).padStart(2, '0')},500\n${t}\n`); const slice = []; for (let i = 0; i < mk.length; i += 18) slice.push(mk.slice(i, i + 18));
  let nFrames = 0; const e0 = errs.length, w0 = warns.length;
  for (const part of slice) { const p = await open(); const s = part.map((t, i) => { const a = 1 + i * 3, z = a + 2.5, f = n => `00:${String(Math.floor(n / 60)).padStart(2, '0')}:${String(Math.floor(n % 60)).padStart(2, '0')},${n % 1 ? '500' : '000'}`; return `${i + 1}\n${f(a)} --> ${f(z)}\n${t}\n` }).join('\n');
    await p.evaluate(x => window.__loadProject({ srt: x, config: {} }), s); for (let i = 0; i < part.length; i++) for (const dt of [.6, 1.8]) { await p.evaluate(x => window.__renderFrame(x), 1 + i * 3 + dt); nFrames++ } await p.context().close() }
  ok(errs.length === e0, `隨機組合逐版型渲染 ${nFrames} 格：頁面錯誤 ${errs.slice(e0).join('；')}`); ok(!warns.slice(w0).some(w => /未知場景/.test(w)), '渲染沒有未知場景警告'); }

/* ⑤ 編輯器 UI */
const ui = await open('', false); await ui.waitForTimeout(600);
const U = await ui.evaluate(async () => {
  subs = parseSRT(DEMO); subsReplaced(); editor(); await new Promise(r => setTimeout(r, 200)); edPick(0); await new Promise(r => setTimeout(r, 100));
  const q = s => document.querySelector('#edm ' + s), out = {};
  const det = [...document.querySelectorAll('#edm .edside details')]; det.forEach(d => d.open = true);
  const nums = [...document.querySelectorAll('#edm .edside input[type=number]')].filter(e => /大字高度比例|整體縮放/.test(e.title)); out.nSz = nums.length;
  const [bi, ti] = nums; bi.value = '.4'; bi.dispatchEvent(new Event('change')); ti.value = '130'; ti.dispatchEvent(new Event('change'));
  out.x0 = { bigR: subs[0].bigR, txtS: subs[0].txtS, tag: tag(subs[0]) }; out.exp = srtText().split('\n').find(l => /\$0\.4,130/.test(l)) || '';
  out.tagChip = EDR[0].g.textContent;
  const rb = [...document.querySelectorAll('#edm .edside button')].find(b => /隨機這一句/.test(b.textContent)); out.hasRand = !!rb;
  const before = tag(subs[0]) + '|' + tag(subs[1]); rb.click(); const after0 = tag(subs[0]); out.changed = after0 !== before.split('|')[0]; out.keepSize = subs[0].bigR === .4 && subs[0].txtS === 130; out.same1 = tag(subs[1]) === before.split('|')[1];
  undo(); out.undone = tag(subs[0]) === before.split('|')[0];
  EDSEL.clear(); [2, 3, 4].forEach(i => EDSEL.add(i)); const b0 = [2, 3, 4].map(i => tag(subs[i])).join('|'), bb = [...document.querySelectorAll('#edm button')].find(b => /隨機勾選的句子/.test(b.textContent)); out.hasBatch = !!bb; bb.click();
  out.batchChanged = [2, 3, 4].map(i => tag(subs[i])).join('|') !== b0; out.others = tag(subs[5]) === tag(parseTag('#' + subs[5].lay + ' x', 0, 1)) || true; undo(); out.batchUndone = [2, 3, 4].map(i => tag(subs[i])).join('|') === b0;
  document.querySelectorAll('#edm .edside button').forEach(b => { if (/回到自動/.test(b.textContent)) b.click() }); out.cleared = subs[0].bigR === 0 && subs[0].txtS === 0;
  EDSEL.clear(); const z = [...document.querySelectorAll('#edm button')].find(b => /隨機勾選的句子/.test(b.textContent)); z.click(); out.emptyOk = true; return out });
ok(U.nSz === 2, '詳細欄有兩個文字大小欄位：' + U.nSz); ok(U.x0.bigR === .4 && U.x0.txtS === 130, '欄位寫入該句：' + JSON.stringify(U.x0)); ok(U.exp !== '', '匯出 SRT 帶 $0.4,130');
ok(/字級/.test(U.tagChip), '列表出現字級標籤：' + U.tagChip); ok(U.hasRand && U.changed && U.keepSize && U.same1, '單句隨機：有變動、不動文字大小與其他句：' + JSON.stringify(U)); ok(U.undone, '單句隨機可復原');
ok(U.hasBatch && U.batchChanged && U.batchUndone, '批次隨機有變動且可一次復原'); ok(U.cleared, '「回到自動」會清掉文字大小');
await browser.close();
console.log(`逐句文字大小＋隨機｜${aspect}｜通過 ${pass}、失敗 ${fail}${errs.length ? `（頁面錯誤 ${errs.length}：${errs.slice(0, 3).join('；')}）` : ''}`);
process.exit(fail || errs.length ? 1 : 0);
