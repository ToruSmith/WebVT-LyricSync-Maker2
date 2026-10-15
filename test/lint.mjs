// 全域作用域 lint：node test/lint.mjs（不需要瀏覽器，只需 npm install）
// src/*.js 共用同一個全域作用域、沒有 import；逐檔 lint 會把跨檔引用全當成未定義。
// 所以這裡照 build.mjs 的順序把檔案串接成一份，交給 ESLint 的 Linter，再把行號對映回原始檔案。
// 規則刻意只選「高訊號」的：重複宣告（後面的檔案默默覆蓋前面的函式）、未定義名稱（打錯字／漏登記）、
// 頂層「先用後宣告」（CLAUDE.md 鐵則 4：前面檔案不能在頂層碰後面檔案的東西）。不檢查排版與未使用變數（程式風格偏密集）。
import fs from 'node:fs';
import { Linter } from 'eslint';
import globals from 'globals';

const files = fs.readdirSync('src').filter(f => /^\d\d-.*\.js$/.test(f)).sort();   // 與 build.mjs 相同的挑選與排序
const parts = files.map(f => ({ f, text: fs.readFileSync('src/' + f, 'utf8') }));
const code = parts.map(p => p.text).join('');                                        // build.mjs 也是以空字串串接
// 每個檔案的起始行（串接後）；檔案結尾沒換行時，下一個檔案的第一行會接在同一行，對映時以「較晚開始的檔案」為準
const starts = []; let line = 1;
for (const p of parts) { starts.push({ f: p.f, line }); line += (p.text.match(/\n/g) || []).length; }
const where = n => { let s = starts[0]; for (const x of starts) { if (x.line <= n) s = x; else break; } return `src/${s.f}:${n - s.line + 1}`; };

// 瀏覽器全域 + 這個專案在執行時才有的（離線渲染介面、?render=1 旗標等不需另列，它們都是 src 內的宣告）
const G = { ...globals.browser, ...globals.es2021 };
const config = [{
  files: ['**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: G },
  linterOptions: { reportUnusedDisableDirectives: false },
  rules: {
    'no-redeclare': 'error',
    'no-undef': 'error',
    'no-const-assign': 'error',
    'no-func-assign': 'error',
    'no-dupe-keys': 'error',
    'no-dupe-args': 'error',
    'no-duplicate-case': 'error',
    'no-dupe-else-if': 'error',
    'no-global-assign': 'error',
    'no-self-assign': 'error',
    'no-unsafe-negation': 'error',
    'no-unreachable': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    // 頂層先用後宣告（會在載入時 TDZ 爆掉）；函式內的引用不算（執行時才碰到）
    'no-use-before-define': ['error', { functions: false, classes: true, variables: false }],
  },
}];

const msgs = new Linter().verify(code, config, 'bundle.js');
const bad = msgs.filter(m => m.severity === 2 || m.fatal);
for (const m of bad) console.log(`${where(m.line)}:${m.column}  ${m.ruleId || 'parse'}  ${m.message}`);
console.log(bad.length ? `\n✗ lint：${bad.length} 個問題（${files.length} 個檔案，已對映回 src/）` : `✓ lint：${files.length} 個檔案，沒有問題`);
process.exit(bad.length ? 1 : 0);
