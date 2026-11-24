// Congela a visibilidade do modelo antisspoiler (versão 1.2.0, commit a5aef22) antes da remoção.
// Executado uma única vez. O resultado fica em audit/baseline-2026-11-24.json.
import { readFile, writeFile } from 'node:fs/promises';
import { applyGuides, visible, freshProgress } from '../src/model.js';
import { layers } from '../src/layers.js';

const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url)));
const data = applyGuides(catalog);
const allGroups = layers.map(([name]) => name);
function reason(p, progress) {
  if (p.excludedVehicle) return 'excludedVehicle';
  if (progress.chapter == null) return 'semCapitulo';
  if (progress.spoilers) {
    if (Math.max(p.chapter ?? 0, p.latestReference ?? 0) > progress.chapter) return 'capituloPosterior';
    if (!p.neutral && p.chapter == null && !progress.showUnknown) return 'capituloDesconhecido';
  }
  if (progress.strictAccess && !visible(p, progress)) return 'requisitos';
  return visible(p, progress) ? null : 'outro';
}
const profiles = Object.fromEntries([1, 2, 3, 4, 5].map(ch => [
  'capitulo' + ch, { ...freshProgress(), chapter: ch, chapterSelected: true, enabledGroups: allGroups }
]));
profiles.capitulo3Estrito = { ...profiles.capitulo3, strictAccess: true, equipment: [] };
const result = { generated: '2026-11-24', commit: 'a5aef22', note: 'Todas as camadas ativas; spoilers ligados; showUnknown desligado.', profiles: {} };
for (const [name, progress] of Object.entries(profiles)) {
  const hidden = {};
  const byKind = {};
  for (const p of data) {
    const r = reason(p, progress);
    byKind[p.kind] ??= { total: 0, visible: 0 };
    byKind[p.kind].total++;
    if (!r) { byKind[p.kind].visible++; continue; }
    (hidden[r] ??= []).push(p.id);
  }
  result.profiles[name] = { counts: Object.fromEntries(Object.entries(hidden).map(([k, v]) => [k, v.length])), byKind, hidden };
}
result.points = Object.fromEntries(data.map(p => [p.id, { kind: p.kind, name: p.name, chapter: p.chapter ?? null, neutral: !!p.neutral, excluded: !!p.excludedVehicle }]));
await writeFile(new URL('./baseline-2026-11-24.json', import.meta.url), JSON.stringify(result, null, 1));
for (const [n, p] of Object.entries(result.profiles)) console.log(n, JSON.stringify(p.counts), 'smash', JSON.stringify(p.byKind.smash), 'bank', JSON.stringify(p.byKind.bank), 'gang', JSON.stringify(p.byKind.gang), 'payday', JSON.stringify(p.byKind.payday));
