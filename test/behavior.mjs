// 行為測試：node test/behavior.mjs [index.html]　環境同 ui-parity.mjs（CHROME_PATH 可指定 Chromium）
// 渲染回歸（verify-kit）只看畫面雜湊、ui-parity 只看「舊項目不消失」；這支補的是「使用者操作的結果」：
//   載入字幕（SRT／WebVTT／LRC／Big5／UTF-16／壞檔）、帶標記 SRT 匯入再匯出逐字相同、設定匯入把關、
//   面板「目前這句」摘要、複製指令按鈕、匯出精靈與選單的焦點與 ARIA。
// 檔案一律用合成內容，不放真實歌詞。函式與 let 變數都在頁面的全域作用域，所以可直接用 page.evaluate 讀寫（subs、CONFIG、jumpTo…）。
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const file = process.argv.find(a => a.endsWith('.html')) || 'index.html';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('dialog', d => d.dismiss());
await page.goto(pathToFileURL(resolve(file)).href);
await page.waitForTimeout(500);

let pass = 0, fail = 0;
const t = (ok, msg) => { ok ? pass++ : (fail++, console.log('✗ ' + msg)) };
const eq = (a, b, msg) => t(JSON.stringify(a) === JSON.stringify(b), `${msg}\n    實際：${JSON.stringify(a)}\n    預期：${JSON.stringify(b)}`);

// 透過「載入字幕」的檔案輸入載入；等提示列出現新訊息後回傳提示與目前的句子
const load = async (name, content) => {
  await page.evaluate(() => { document.querySelector('#note').textContent = '' });
  await page.setInputFiles('#fs', { name, mimeType: 'application/octet-stream', buffer: Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8') });
  await page.waitForFunction(() => document.querySelector('#note').textContent !== '');
  return page.evaluate(() => ({ note: document.querySelector('#note').textContent, subs: subs.map(x => ({ s: x.s, e: x.e, plain: x.plain, sub: x.sub })) }));
};
const blk = (n, a, b, body) => `${n}\n${a} --> ${b}\n${body}\n`;

// ---------- 1. SRT 基本與容錯 ----------
let r = await load('a.srt', [blk(1, '00:00:01,000', '00:00:03,500', '你好'), blk(2, '00:00:04,000', '00:00:05,000', '再見')].join('\n'));
eq(r.subs.map(x => [x.s, x.e, x.plain]), [[1, 3.5, '你好'], [4, 5, '再見']], '標準 SRT 讀取');
t(/2 句已載入（SRT，UTF-8/.test(r.note), '提示列應寫出格式與編碼：' + r.note);

r = await load('a.srt', blk(1, '00:01,000', '00:03,500', '沒有小時'));
eq(r.subs.map(x => [x.s, x.e]), [[1, 3.5]], 'MM:SS.mmm（沒有小時）應可讀取');

r = await load('a.srt', [blk(1, '00:00:xx,000', '00:00:03,500', '壞'), blk(2, '00:00:05,000', '00:00:04,000', '反'), blk(3, '00:00:06,000', '00:00:07,000', '好')].join('\n'));
eq(r.subs.map(x => x.plain), ['好'], '時間壞掉、結束早於開始的句子應略過');
t(r.note.includes('略過 2 句時間格式異常'), '應提示略過幾句：' + r.note);

r = await load('a.srt', [blk(1, '00:00:05,000', '00:00:06,000', '後'), blk(2, '00:00:01,000', '00:00:02,000', '前')].join('\n'));
eq(r.subs.map(x => x.plain), ['前', '後'], '亂序應依開始時間排序');
t(r.note.includes('已依時間排序'), '應提示已排序：' + r.note);

// ---------- 2. WebVTT ----------
r = await load('a.vtt', 'WEBVTT\n\nintro\n00:00:01.000 --> 00:00:03.000 align:start\n<v Bob>你好</v>\n');
eq(r.subs.map(x => [x.s, x.e, x.plain]), [[1, 3, '你好']], 'WebVTT：cue 設定與 <v> 標籤應去掉');
t(r.note.includes('WebVTT'), '應判斷為 WebVTT：' + r.note);

// ---------- 3. LRC ----------
const LRC = '[ti:歌名]\n[offset:500]\n[00:01.00]第一句\n[00:03.50]第二句\n[00:06.00]\n[00:10.00][00:20.00]疊句\n[00:30.00]英文\n[00:30.00]中文翻譯\n[00:40.00]<00:40.10>逐字<00:40.50>標記\n';
r = await load('a.lrc', LRC);
eq(r.subs.map(x => [x.s, x.e, x.plain, x.sub]), [[0.5, 3, '第一句', ''], [3, 5.5, '第二句', ''], [9.5, 19.5, '疊句', ''], [19.5, 29.5, '疊句', ''], [29.5, 39.5, '英文', '中文翻譯'], [39.5, 43.5, '逐字標記', '']], 'LRC：offset、空歌詞結尾、多時間、翻譯成副文、逐字標記去除');
t(r.note.includes('LRC'), '應判斷為 LRC：' + r.note);
r = await load('a.txt', '[00:01.00]你好\n[00:03.00]再見\n');
t(r.note.includes('LRC') && r.subs.length === 2, '副檔名不是 .lrc 時也應靠內容判斷：' + r.note);

// ---------- 4. 編碼 ----------
const head = Buffer.from('1\n00:00:01,000 --> 00:00:03,000\n');
r = await load('big5.srt', Buffer.concat([head, Buffer.from([0xA7, 0x41, 0xA6, 0x6E]), Buffer.from('\n')]));
eq(r.subs.map(x => x.plain), ['你好'], 'Big5 檔案應自動判斷並解碼');
t(r.note.includes('Big5'), '提示列應標出 Big5：' + r.note);
r = await load('u16.srt', Buffer.concat([Buffer.from([0xFF, 0xFE]), Buffer.from('1\n00:00:01,000 --> 00:00:03,000\n你好\n', 'utf16le')]));
eq(r.subs.map(x => x.plain), ['你好'], 'UTF-16（有 BOM）');
t(r.note.includes('UTF-16'), '提示列應標出 UTF-16：' + r.note);
r = await load('bom.srt', Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), head, Buffer.from('好\n')]));
eq(r.subs.map(x => x.plain), ['好'], 'UTF-8 BOM');

// ---------- 5. 讀不到內容時不得清掉目前的字幕 ----------
const FIX = [
  blk(1, '00:00:00,700', '00:00:03,800', '#laser-scan+stagger+fade^bc:0:-6 範例一 第一句||WIND AND FROST'),
  blk(2, '00:00:03,800', '00:00:06,200', '#scroll+ripple+dissolve^bc:0:-6 覆雪{茫茫}'),
  blk(3, '00:00:06,500', '00:00:09,800', '#slam+flip+slide-out~shake^bc:0:-6$0.4,130*851tegaki_zatsu_normal_0883@neon,glow-soft&pink-stripes 第三句'),
  blk(4, '00:00:10,000', '00:00:12,000', '未標記的句子'),
].join('\n');
r = await load('tagged.srt', FIX);
t(r.subs.length === 4, '帶標記 SRT 應讀到 4 句：' + r.subs.length);
r = await load('garbage.srt', 'hello world');
t(r.subs.length === 4 && r.note.includes('沒有讀到可用的字幕'), '無法讀取的檔案不應清掉目前字幕：' + r.note + ' / ' + r.subs.length);
r = await load('allbad.srt', blk(1, '00:00:xx,000', '00:00:03,000', '壞'));
t(r.subs.length === 4 && r.note.includes('1 句時間格式異常'), '全部時間異常時也不應清掉字幕：' + r.note);

// ---------- 6. 舊歌詞（帶標記 SRT）匯入再匯出必須逐字相同 ----------
await load('tagged.srt', FIX);
const out = await page.evaluate(() => srtText());
t(out === FIX, '帶標記 SRT 匯入再匯出應逐字相同\n--- 匯出 ---\n' + out + '--- 原檔 ---\n' + FIX);
eq(await page.evaluate(() => { const x = subs[2]; return [x.lay, x.en, x.ex, x.fx, x.pos, x.bigR, x.txtS, x.font, x.st, x.scene] }),
  ['slam', 'flip', 'slide-out', 'shake', 'bc:0:-6', 0.4, 130, '851tegaki_zatsu_normal_0883', 'neon,glow-soft', 'pink-stripes'], '第 3 句標記各欄位');

// ---------- 7. 面板最上方的「目前這句」摘要 ----------
t(await page.evaluate(() => document.querySelectorAll('#panel #curinfo').length) === 1, '面板應有唯讀摘要 #curinfo');
const info = async i => { await page.evaluate(i => jumpTo(i), i); await page.waitForFunction(i => document.querySelector('#curinfo').textContent.startsWith(`第 ${i + 1} 句`), i); return page.evaluate(() => document.querySelector('#curinfo').textContent) };
let s = await info(2);
t(/版型 slam｜大字 40%｜縮放 130%｜字體 851tegaki_zatsu_normal_0883（未載入，改用全域）｜場景 pink-stripes/.test(s), '單句設定應顯示且不標（全域）：' + s);
s = await info(0);
t(/版型 laser-scan｜大字 25%（全域）｜縮放 100%（全域）｜字體 明體（全域）｜場景 —/.test(s), '沒有單句設定時應標（全域）：' + s);

// ---------- 8. 「複製指令」按鈕：剪貼簿失敗時不得假顯示已複製 ----------
const copyBtn = async clip => {
  await page.evaluate(c => {
    projInfo = { subs: 1, mb: .01, fonts: [], cmd: 'node render/run.mjs --x', media: null }; projFill();
    Object.defineProperty(navigator, 'clipboard', { value: c === 'ok' ? { writeText: () => Promise.resolve() } : c === 'reject' ? { writeText: () => Promise.reject(new Error('denied')) } : undefined, configurable: true });
    document.querySelector('#projbox button').click();
  }, clip);
  await page.waitForTimeout(150);
  return page.evaluate(() => document.querySelector('#projbox button').textContent);
};
t((await copyBtn('ok')) === '已複製', '剪貼簿成功時應顯示已複製');
t((await copyBtn('reject')).startsWith('複製失敗'), '剪貼簿被拒絕時應顯示複製失敗');
t((await copyBtn('none')).startsWith('複製失敗'), '沒有剪貼簿 API 時應顯示複製失敗');

// ---------- 9. 匯出精靈與選單：焦點與 ARIA ----------
eq(await page.evaluate(() => [document.querySelector('#note').getAttribute('role'), document.querySelector('#qk').getAttribute('role'), document.querySelector('#seek').getAttribute('aria-label')]), ['status', 'dialog', '播放進度'], '#note／#qk／#seek 的 ARIA');
await page.click('button.mb[data-menu=mload]');
t(await page.evaluate(() => document.querySelector('button.mb[data-menu=mload]').getAttribute('aria-expanded')) === 'true', '開啟選單後 aria-expanded 應為 true');
await page.keyboard.press('Escape');
t(await page.evaluate(() => document.querySelector('button.mb[data-menu=mload]').getAttribute('aria-expanded')) === 'false', 'Esc 關閉選單後 aria-expanded 應為 false');
t(await page.evaluate(() => /\.lrc/.test(document.querySelector('#fs').accept) && /\.vtt/.test(document.querySelector('#fs').accept)), '載入字幕的 accept 應含 .lrc 與 .vtt');
await page.click('#exw');
eq(await page.evaluate(() => [document.querySelector('#exwiz').getAttribute('role'), document.querySelector('#exwiz').getAttribute('aria-modal'), document.activeElement.id]), ['dialog', 'true', 'exwx'], '匯出精靈開啟：role／aria-modal，焦點移到關閉鈕');
await page.keyboard.press('Escape');
t(await page.evaluate(() => !document.querySelector('#exwiz').classList.contains('on') && document.activeElement.id === 'exw'), '關閉精靈後焦點應回到「匯出…」按鈕');

// ---------- 10. 設定匯入把關（放最後：會改動 CONFIG 並存進 localStorage）----------
const importCfg = async obj => { await page.setInputFiles('#cfgImport', { name: 'cfg.json', mimeType: 'application/json', buffer: Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj)) }); await page.waitForTimeout(400); return page.evaluate(() => ({ note: document.querySelector('#note').textContent, bpm: CONFIG.bpm, accent: CONFIG.accent, bigRatio: CONFIG.bigRatio, polluted: [({}).polluted, CONFIG.polluted] })) };
r = await importCfg({ bpm: 'abc', accent: '#112233', bigRatio: 0.4 });
t(r.bpm === 120 && r.accent === '#112233' && r.bigRatio === 0.4, '設定匯入：型別錯誤的欄位用預設，其餘照套用：' + JSON.stringify(r));
t(r.note.includes('1 個格式不符的設定') && r.note.includes('bpm'), '設定匯入應提示被丟掉的欄位：' + r.note);
r = await importCfg('{"__proto__":{"polluted":1},"bpm":100}');
t(r.polluted[0] === undefined && r.polluted[1] === undefined && r.bpm === 100, '設定匯入不得汙染原型：' + JSON.stringify(r));
await page.evaluate(() => { document.querySelector('#note').textContent = '' });
await page.setInputFiles('#cfgImport', { name: 'project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ srt: FIX, config: { bpm: 'x', textScale: 150 } })) });
await page.waitForTimeout(500);
r = await page.evaluate(() => ({ n: subs.length, bpm: CONFIG.bpm, ts: CONFIG.textScale, note: document.querySelector('#note').textContent }));
t(r.n === 4 && r.bpm === 120 && r.ts === 150 && r.note.includes('專案已還原') && r.note.includes('1 個格式不符'), '匯入渲染專案（project.json）應還原字幕與設定並提示：' + JSON.stringify(r));

errs.length && (fail++, console.log('✗ 頁面錯誤 ' + errs.join(' | ')));
console.log(`行為測試｜通過 ${pass}、失敗 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
