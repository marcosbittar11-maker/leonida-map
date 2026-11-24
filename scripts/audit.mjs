// Auditoria reutilizável de cobertura do Leonida Map.
// Uso: node scripts/audit.mjs [arquivo-de-referência]
// Gera audit/latest.json e audit/AUDIT.md. Não altera dados.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { applyGuides, normalize, visible, availability, freshProgress } from '../src/model.js';
import { duplicateAliases, reclassified, renames } from '../src/curation.js';
import { groups } from '../src/registry.js';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const catalog = await read('public/data/catalog.json');
const reference = await read(process.argv[2] || 'data/reference/external-2026-11-24.json');
const baseline = await read('audit/baseline-2026-11-24.json');
const points = applyGuides(catalog).filter(visible);
const byId = new Map(points.map(p => [p.id, p]));
const progress = {...freshProgress(), enabledGroups:groups.map(g => g.name)};

const key = name => normalize(name).replace(/\b(the|co)\b/g, '').replace(/\s+/g, ' ').trim()
  .replace('sound4sond', 'sound4sound').replace('royal', 'roval').replace('ayoka', 'akoya').replace('white sand ', 'white sands ');
const names = p => [p.name, p.sourceName, renames[p.id]?.alias].filter(Boolean).map(key);

// 1. Listas nominais externas comparadas com o catálogo local.
const lists = {};
for (const [list, spec] of Object.entries(reference.lists)) {
  const pool = points.filter(p => p.kind === spec.kind);
  const used = new Set();
  const matched = [], missing = [], misclassified = [];
  for (const name of [...spec.names, ...(spec.extra || [])]) {
    const k = key(name);
    const hit = pool.find(p => !used.has(p.id) && names(p).some(n => n === k || n.startsWith(k + ' ') || n.endsWith(' ' + k) || n.includes(k)));
    if (hit) {used.add(hit.id); matched.push({name, id:hit.id}); continue;}
    const elsewhere = points.find(p => names(p).some(n => n === k || n.includes(k)));
    if (elsewhere) misclassified.push({name, id:elsewhere.id, kind:elsewhere.kind});
    else missing.push(name);
  }
  lists[list] = {source:reference.sources[spec.source], expected:spec.names.length, extra:spec.extra?.length || 0,
    localKind:spec.kind, localTotal:pool.length, matched:matched.length, missing, misclassified,
    localNotInList:spec.kind === 'store' ? undefined : pool.filter(p => !used.has(p.id)).map(p => ({id:p.id, name:p.name}))};
}

// 2. Contagens por categoria, antes (linha de base) e depois.
const before = baseline.profiles.capitulo3.byKind, beforeAll = baseline.profiles.capitulo5.byKind;
const rawKinds = {};
for (const p of catalog.points) rawKinds[p.kind] = (rawKinds[p.kind] || 0) + 1;
const categories = {};
for (const p of points) {
  const row = categories[p.kind] ??= {name:p.category?.name, group:p.category?.group, total:0, withReward:0, withGuide:0,
    states:{met:0, unmet:0, unknown:0, na:0}, unknownSafeCode:0, linked:0};
  row.total++;
  if (p.reward) row.withReward++;
  if (p.guide && !p.guide.summary) row.withGuide++;
  row.states[availability(p, progress).state]++;
  if (p.partOf || p.related?.length) row.linked++;
}
// Pontos recuperados: ocultos no capítulo 3 e no capítulo 5 da versão anterior e visíveis agora.
const hidden3 = new Set(Object.entries(baseline.profiles.capitulo3.hidden).filter(([r]) => r !== 'excludedVehicle').flatMap(([, ids]) => ids));
const hidden5 = new Set(Object.entries(baseline.profiles.capitulo5.hidden).filter(([r]) => r !== 'excludedVehicle').flatMap(([, ids]) => ids));
const recovered = {};
for (const p of points) {
  if (!hidden3.has(p.id)) continue;
  const row = recovered[p.kind] ??= {capitulo3:0, mesmoNoCapitulo5:0};
  row.capitulo3++;
  if (hidden5.has(p.id)) row.mesmoNoCapitulo5++;
}

// 3. Duplicatas prováveis ainda presentes (mesmo nome e categoria a até 0,5 unidade).
const duplicates = [];
const grouped = new Map();
for (const p of points) {
  if (p.x == null) continue;
  const k = p.kind + '|' + key(p.name);
  const list = grouped.get(k) ?? [];
  for (const other of list) {
    const d = Math.hypot(p.x - other.x, p.y - other.y);
    if (d <= 0.5) duplicates.push({a:other.id, b:p.id, name:p.name, kind:p.kind, distance:+d.toFixed(2)});
  }
  list.push(p);
  grouped.set(k, list);
}

// 4. Coordenadas inválidas ou ausentes.
const invalid = points.filter(p => p.evidence !== 'personal' && (p.x == null || p.y == null || p.x < 0 || p.y < 0 || p.x > 1024 || p.y > 1024))
  .map(p => ({id:p.id, name:p.name, kind:p.kind}));

// 5. Nomes que sugerem joalheria, penhor ou financeira fora dessas categorias.
const robberyKinds = new Set(['jewelry','pawn','payday','bank','bigbank','fence','gang','store','safe']);
const suspicious = points.filter(p => !robberyKinds.has(p.kind) && /\b(jewel|jewell?ery|pawn|empeno|payday|loan|quick buck)\b/i.test(p.sourceName))
  .map(p => {
    const near = points.filter(o => ['jewelry','pawn','payday'].includes(o.kind) && o.x != null && Math.hypot(o.x - p.x, o.y - p.y) < 0.6)
      .map(o => o.id + ' (' + o.name + ')');
    return {id:p.id, name:p.sourceName, kind:p.kind, near, verdict:near.length ? 'próximo de um alvo catalogado' : 'nome sugere, sem evidência de atividade; não contabilizado'};
  });

// 6. Informações práticas ausentes nas categorias prioritárias.
const priority = ['jewelry','pawn','bank','bigbank','payday','gang','safe','fence','weapon','store','towatm','drug','watch'];
const practical = Object.fromEntries(priority.map(kind => {
  const list = points.filter(p => p.kind === kind);
  const has = field => list.filter(p => p.fields?.[field] && !/desconhecid/i.test(p.fields[field])).length;
  return [kind, {total:list.length, valor:list.filter(p => p.reward).length, senha:has('Senha'), cofre:has('Cofre'),
    desbloqueio:has('Desbloqueio'), alarme:has('Alarme') + has('Câmeras e alarmes'), guia:list.filter(p => p.guide && !p.guide.summary).length,
    requisitosConhecidos:list.filter(p => ['met','unmet'].includes(availability(p, progress).state)).length}];
}));

const report = {
  generated:new Date().toISOString().slice(0, 10), catalogRevision:catalog.metadata.revision,
  totals:{imported:catalog.stats.inputs, catalog:catalog.points.length, consultable:points.length,
    curatedAliases:Object.keys(duplicateAliases).length, reclassified:Object.keys(reclassified).length,
    hiddenBeforeChapter3:baseline.profiles.capitulo3.counts, hiddenBeforeChapter5:baseline.profiles.capitulo5.counts},
  lists, categories, rawKinds, before, beforeAll, recovered, duplicates, invalid, suspicious, practical,
  externalCounts:reference.counts
};
await mkdir(new URL('audit/', root), {recursive:true});
await writeFile(new URL('audit/latest.json', root), JSON.stringify(report, null, 1));

const md = [];
const line = (...cells) => '| ' + cells.join(' | ') + ' |';
md.push('# Auditoria de cobertura · ' + report.generated, '',
  'Gerado por `node scripts/audit.mjs`. Revisão do catálogo: `' + report.catalogRevision + '`. Linha de base: versão 1.2.0 (commit a5aef22), capítulo 3, todas as camadas.', '',
  '## Listas nominais externas', '', line('Lista', 'Esperado', 'Local', 'Encontrados', 'Ausentes', 'Em outra categoria'), line('---','--:','--:','--:','---','---'));
for (const [name, l] of Object.entries(lists)) md.push(line(name, l.expected + (l.extra ? ' + ' + l.extra : ''), l.localTotal, l.matched,
  l.missing.join(', ') || '—', l.misclassified.map(m => m.name + ' → ' + m.id + ' (' + m.kind + ')').join(', ') || '—'));
md.push('', '### Pontos locais fora das listas', '');
for (const [name, l] of Object.entries(lists)) if (l.localNotInList?.length) md.push('- **' + name + '**: ' + l.localNotInList.map(p => p.name + ' (`' + p.id + '`)').join(', '));
md.push('', '## Categorias', '', line('Categoria', 'Grupo', 'Antes (cap. 3)', 'Agora', 'Recuperados', 'Com valor', 'Requisitos conhecidos', 'Desconhecidos', 'Vinculados'),
  line('---','---','--:','--:','--:','--:','--:','--:','--:'));
for (const [kind, c] of Object.entries(categories).sort((a, b) => a[1].group.localeCompare(b[1].group) || b[1].total - a[1].total)) {
  md.push(line(c.name + ' `' + kind + '`', c.group, before[kind]?.visible ?? '—', c.total, recovered[kind]?.capitulo3 ?? 0, c.withReward,
    c.states.met + c.states.unmet, c.states.unknown, c.linked));
}
md.push('', 'A coluna "Antes" usa a categoria da versão anterior quando o nome coincide; joalherias, penhores, grandes bancos, relógios e armas no chão eram partes de outras categorias.', '',
  '## Informações práticas nas categorias prioritárias', '', line('Categoria', 'Total', 'Valor', 'Senha', 'Cofre', 'Alarme', 'Desbloqueio', 'Guia', 'Requisitos conhecidos'),
  line('---','--:','--:','--:','--:','--:','--:','--:','--:'));
for (const [kind, r] of Object.entries(practical)) md.push(line(kind, r.total, r.valor, r.senha, r.cofre, r.alarme, r.desbloqueio, r.guia, r.requisitosConhecidos));
md.push('', '## Duplicatas prováveis restantes', '', duplicates.length ? duplicates.map(d => '- ' + d.name + ' (' + d.kind + '): `' + d.a + '` e `' + d.b + '`, ' + d.distance + ' unidade').join('\n') : 'Nenhuma.',
  '', '## Coordenadas inválidas ou ausentes', '', invalid.length ? invalid.map(p => '- `' + p.id + '` ' + p.name).join('\n') : 'Nenhuma.',
  '', '## Nomes que sugerem roubo fora das categorias de roubo', '', suspicious.map(s => '- `' + s.id + '` ' + s.name + ' (' + s.kind + '): ' + s.verdict + (s.near.length ? ' · ' + s.near.join(', ') : '')).join('\n') || 'Nenhum.', '');
await writeFile(new URL('audit/AUDIT.md', root), md.join('\n'));
console.log(JSON.stringify({lists:Object.fromEntries(Object.entries(lists).map(([k, l]) => [k, l.matched + '/' + l.expected + (l.missing.length ? ' faltam ' + l.missing.join('; ') : '')])),
  duplicates:duplicates.length, invalid:invalid.length, suspicious:suspicious.length}, null, 1));
