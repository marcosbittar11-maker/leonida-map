// Gera as tabelas antes/depois (Markdown) a partir dos JSON do harness.
//   node scripts/perf/table.mjs <antes.json> <depois.json> cold|warm|interact|offline|region:vicecity
import { readFileSync } from 'node:fs';

const [before, after, scenario] = process.argv.slice(2);
const median = list => { const s = list.filter(Number.isFinite).sort((a, b) => a - b); if (!s.length) return NaN; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const get = (row, path) => path.split('.').reduce((v, k) => v?.[k], row);
const load = file => JSON.parse(readFileSync(file, 'utf8')).scenarios[scenario] ?? [];
const A = load(before), B = load(after);
const metrics = {
  cold: [['Primeiro tile visível', 'firstTile', 'ms'], ['**Mapa pronto** (tiles da viewport)', 'mapReady', 'ms'], ['Catálogo interativo', 'interactive', 'ms'], ['Offline pronto (SW ativo)', 'swActive', 'ms'],
    ['Bytes até o mapa pronto', 'atReady.bytes', 'B'], ['Bytes totais da 1ª visita (com SW)', 'total.bytes', 'B'], ['Requisições totais', 'total.requests', ''], ['Tarefas longas (soma)', 'longTaskMs', 'ms']],
  warm: [['Primeiro tile visível', 'firstTile', 'ms'], ['**Mapa pronto**', 'mapReady', 'ms'], ['Catálogo interativo', 'interactive', 'ms'], ['Tarefas longas (soma)', 'longTaskMs', 'ms']],
  interact: [['Mostrar tudo (handler)', 'showAll.handler', 'ms'], ['Mostrar tudo (até pintura)', 'showAll.paint', 'ms'], ['Ocultar tudo após Mostrar tudo (handler)', 'hideAll2.handler', 'ms'],
    ['Pan com ≈ 5,8 mil pinos, zoom 1,25 (panBy→pintura)', 'pan@1.25.median', 'ms'], ['Filtro "Com guia" (até pintura)', 'chip.paint', 'ms'], ['Busca "bank" (percebida, com debounce)', 'search.perceived', 'ms']],
  offline: [['Mapa pronto offline', 'ready', 'ms'], ['Catálogo interativo offline', 'interactive', 'ms'], ['HD visitado offline (setView→tiles)', 'hd.ms', 'ms'], ['Tiles de detalhe com falha', 'hd.failed', '']],
  'region:vicecity': [['Região inédita, zoom 5 (até tiles prontos)', 'fresh.ms', 'ms'], ['Revisitada', 'again.ms', 'ms'], ['Após recarregar (Cache Storage)', 'afterReload.ms', 'ms'], ['Bytes da região inédita', 'freshNet.bytes', 'B']]
}[scenario];
const fmt = (v, unit) => !Number.isFinite(v) ? '–' : unit === 'B' ? (v / 1024).toFixed(0) + ' KB' : unit === 'ms' ? (v >= 1000 ? (v / 1000).toFixed(2) + ' s' : Math.round(v) + ' ms') : String(Math.round(v));
const range = (rows, path, unit) => { const v = rows.map(r => get(r, path)).filter(Number.isFinite).sort((a, b) => a - b); return v.length ? fmt(median(v), unit) + ' (' + fmt(v[0], unit) + '–' + fmt(v.at(-1), unit) + ')' : '–'; };
console.log('| Métrica | Antes (1.8.0) | Depois (1.9.0) | Δ mediana |\n|---|---|---|---|');
for (const [label, path, unit] of metrics) {
  const a = median(A.map(r => get(r, path))), b = median(B.map(r => get(r, path)));
  const delta = Number.isFinite(a) && Number.isFinite(b) && a !== 0 ? (b - a) / a * 100 : NaN;
  console.log('| ' + label + ' | ' + range(A, path, unit) + ' | ' + range(B, path, unit) + ' | ' + (Number.isFinite(delta) ? (delta > 0 ? '+' : '') + delta.toFixed(0) + '%' : '–') + ' |');
}
