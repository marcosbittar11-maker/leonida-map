// Tabela comparativa de execuções gravadas pelo harness: node scripts/perf/compare.mjs <rótulo=arquivo.json>... --cenario cold --campos a,b,c
import { readFileSync } from 'node:fs';
const argv = process.argv.slice(2);
const flag = name => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const scenario = flag('cenario') || 'cold';
const fields = (flag('campos') || 'firstTile,mapReady,interactive,swActive').split(',');
const median = list => { const s = list.filter(Number.isFinite).sort((a, b) => a - b); if (!s.length) return NaN; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const get = (row, path) => path.split('.').reduce((v, k) => v?.[k], row);
const rows = argv.filter(a => a.includes('=') && !a.startsWith('--'));
console.log(['variante', ...fields].join(' | '));
for (const item of rows) {
  const [label, file] = item.split('=');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const list = data.scenarios[scenario] ?? [];
  const cells = fields.map(f => { const values = list.map(r => get(r, f)); const m = median(values); const s = values.filter(Number.isFinite).sort((a, b) => a - b); return Number.isFinite(m) ? Math.round(m) + ' (' + Math.round(s[0]) + '–' + Math.round(s.at(-1)) + ')' : '–'; });
  console.log([label, ...cells].join(' | '));
}
