// Importa FATOS posicionais do mapa do Gameta (https://gameta.gg/gta6/map/) para o Leonida Map.
//
// Condições (registradas em FONTES.md): o Gameta não publica licença nem termos. O robots.txt permite /
// e bloqueia só /api/. O script lê o JavaScript público da página COMO TEXTO, sem executá-lo, e guarda
// apenas coordenadas convertidas e nomes de itens. Nenhum texto editorial, imagem ou código é copiado.
// A origem fica identificada em cada ponto (collection:'gameta') e pelo hash do arquivo lido.
//
// Uso: node scripts/import-gameta.mjs [--from <pasta com kenton.html e js/>]
// Saída: src/data/gameta.js (separado do snapshot: sobrevive a `npm run data:sync`).
// Idempotente: sem mudança na fonte, a saída é idêntica e os IDs são determinísticos.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { duplicateAliases } from '../src/curation.js';

const origin = 'https://gameta.gg';
const pageUrl = origin + '/gta6/map/kentons-treasures/';
const fromIndex = process.argv.indexOf('--from');
const from = fromIndex > 0 ? process.argv[fromIndex + 1] : null;
const get = async (path, url) => from ? readFile(from + '/' + path, 'utf8')
  : (await fetch(url, {headers:{'user-agent':'LeonidaMap-research/1.8'}, signal:AbortSignal.timeout(30000)})).text();

const html = await get('kenton.html', pageUrl);
const bundleNames = [...new Set(html.match(/\/_nuxt\/[A-Za-z0-9_.-]+\.js/g) || [])];
let bundle = null, bundleName = null;
for (const name of bundleNames) {
  const text = await get('js/' + name.split('/').pop(), origin + name);
  if (/id:`kenton-s-treasures`/.test(text) && /count:41/.test(text)) { bundle = text; bundleName = name; break; }
}
if (!bundle) throw new Error('Pacote de pinos do Gameta não encontrado.');

// ---- leitura textual (sem eval) ----
const cats = [...bundle.matchAll(/\{id:`([^`]+)`,label:`([^`]+)`,group:`([^`]+)`,icon:`[^`]*`,count:(\d+)/g)]
  .map(m => ({id:m[1], label:m[2], group:m[3], count:+m[4]}));
const raw = [...bundle.matchAll(/\[(\d+),(-?\d+),(-?\d+),`((?:[^`\\]|\\.)*)`(?:,(\d+))?\]/g)]
  .map(m => ({c:+m[1], X:+m[2], Y:+m[3], name:m[4]}));
const catIndex = id => cats.findIndex(c => c.id === id);
const ofCat = id => raw.filter(p => p.c === catIndex(id));

// ---- catálogo local (snapshot) ----
const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));
const local = catalog.points.filter(p => p.x != null && !duplicateAliases[p.id]);
const norm = s => (s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// ---- calibração: pares por nome único nos dois lados; ajuste afim por mínimos quadrados ----
const skipNames = new Set(['', 'bus stop', 'electric vehicle charger', 'atm', 'towable atm']);
const gByName = new Map(), lByName = new Map();
for (const p of raw) { const k = norm(p.name); if (!skipNames.has(k)) (gByName.get(k) ?? gByName.set(k, []).get(k)).push(p); }
for (const p of local) { const k = norm(p.name); if (!skipNames.has(k)) (lByName.get(k) ?? lByName.set(k, []).get(k)).push(p); }
const pairs = [];
for (const [k, a] of gByName) { const b = lByName.get(k); if (a.length === 1 && b?.length === 1) pairs.push({k, id:b[0].id, cat:cats[a[0].c].id, X:a[0].X, Y:a[0].Y, x:b[0].x, y:b[0].y}); }
pairs.sort((a, b) => a.id.localeCompare(b.id));
const det3 = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
function fit(ps) {
  const axis = u => {
    let sXX = 0, sXY = 0, sYY = 0, sX = 0, sY = 0, tX = 0, tY = 0, t1 = 0;
    for (const p of ps) { sXX += p.X * p.X; sXY += p.X * p.Y; sYY += p.Y * p.Y; sX += p.X; sY += p.Y; tX += p.X * p[u]; tY += p.Y * p[u]; t1 += p[u]; }
    const M = [[sXX, sXY, sX], [sXY, sYY, sY], [sX, sY, ps.length]], v = [tX, tY, t1], D = det3(M);
    return [0, 1, 2].map(i => det3(M.map((r, ri) => r.map((c, ci) => ci === i ? v[ri] : c))) / D);
  };
  return {x:axis('x'), y:axis('y')};
}
const apply = (T, p) => [T.x[0] * p.X + T.x[1] * p.Y + T.x[2], T.y[0] * p.X + T.y[1] * p.Y + T.y[2]];
const resid = (T, p) => { const [a, b] = apply(T, p); return Math.hypot(a - p.x, b - p.y); };
const median = a => [...a].sort((u, v) => u - v)[Math.floor(a.length / 2)];
const quant = (a, f) => [...a].sort((u, v) => u - v)[Math.min(a.length - 1, Math.floor(a.length * f))];
function robustFit(ps) {
  let use = ps, T;
  for (let i = 0; i < 6; i++) { T = fit(use); const e = ps.map(p => resid(T, p)); const m = median(e); use = ps.filter((_, j) => e[j] <= Math.max(0.5, 3 * m)); }
  return {T, used:use.length};
}
const train = pairs.filter((_, i) => i % 2 === 0), test = pairs.filter((_, i) => i % 2 === 1);
const holdout = robustFit(train);
const eTest = test.map(p => resid(holdout.T, p));
const fitted = robustFit(pairs);
const T = fitted.T;
const validation = {
  pairs:pairs.length, fittedOn:train.length, inliersFit:holdout.used, heldOut:test.length,
  heldOutMedian:+median(eTest).toFixed(3), heldOutP90:+quant(eTest, .9).toFixed(3),
  heldOutWithin05:eTest.filter(d => d <= .5).length, heldOutWithin1:eTest.filter(d => d <= 1).length,
  finalInliers:fitted.used, finalMedian:+median(pairs.map(p => resid(T, p))).toFixed(3),
  categories:Object.fromEntries([...new Set(pairs.map(p => p.cat))].map(c => [c, pairs.filter(p => p.cat === c).length])),
  oldTransformMedianOnHeldOut:+median(test.map(p => Math.hypot(p.X / 32 - 118.684375 - p.x, p.Y / 32 - 24.9375 - p.y))).toFixed(3),
  transform:'x = ' + T.x.map(v => +v.toPrecision(9)).join(' | ') + ' ; y = ' + T.y.map(v => +v.toPrecision(9)).join(' | ') + ' (coeficientes de X, Y e constante)'
};
if (pairs.length < 300 || validation.heldOutMedian > 0.2) throw new Error('Calibração não validada: ' + JSON.stringify(validation));
const toMap = p => { const [x, y] = apply(T, p); return {x:+x.toFixed(3), y:+y.toFixed(3)}; };
const withMap = list => list.map(p => ({...p, ...toMap(p)}));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const regionNear = p => local.filter(q => q.region && dist(p, q) <= 6).sort((a, b) => dist(p, a) - dist(p, b))[0]?.region || '';

// ---- correspondência espacial um a um ----
const MATCH = 0.3, LOOSE = 1.0, DISTINCT = 0.5;
const lower = p => (p.type || '').toLowerCase();
const nameMatches = (p, re) => re.test(p.name || '');
const localSets = {
  atm:local.filter(p => lower(p) === 'atm' || /^atm-/.test(p.id) || nameMatches(p, /^atm/i)),
  towatm:local.filter(p => p.kind === 'towatm'),
  ev:local.filter(p => lower(p) === 'ev charger' || nameMatches(p, /electric vehicle charger|^ev charger/i)),
  bus:local.filter(p => lower(p) === 'bus stop' || nameMatches(p, /^bus stop/i))
};
function classify(gs, ls) {
  const used = new Set(), usedL = new Set(), match = [];
  const edges = [];
  gs.forEach((g, i) => ls.forEach((l, j) => { const d = dist(g, l); if (d <= LOOSE) edges.push([d, i, j]); }));
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  for (const [d, i, j] of edges) if (!used.has(i) && !usedL.has(j)) { used.add(i); usedL.add(j); match.push({i, j, d}); }
  // acima de MATCH só vale a correspondência com um local ainda livre; acima de LOOSE nada vale
  const fresh = [], conflicts = [];
  gs.forEach((g, i) => {
    if (used.has(i)) return;
    const nearest = Math.min(Infinity, ...ls.map(l => dist(g, l)));
    (nearest < DISTINCT ? conflicts : fresh).push({...g, nearest:+nearest.toFixed(2)});
  });
  // duplicatas dentro da própria fonte
  const kept = [];
  const adjacent = [];
  for (const g of fresh) (kept.some(k => dist(k, g) < DISTINCT) ? adjacent : kept).push(g);
  const ds = match.map(m => m.d);
  return {matched:match.length, median:+median(ds).toFixed(3), p90:+quant(ds, .9).toFixed(3), fresh:kept, conflicts, localsWithoutPair:ls.length - match.length,
    sourceDuplicates:adjacent.length, adjacent};
}
const idOf = (prefix, p) => 'gameta-' + prefix + '-' + p.X + '-' + p.Y;
const src = pageUrl.replace('kentons-treasures/', '');
const created = [], stats = {}, conflicts = {};
const sameRef = {atm:'https://gameta.gg/gta6/map/atms/', towatm:'https://gameta.gg/gta6/map/atms-towable/', ev:'https://gameta.gg/gta6/map/electric-chargers/', bus:'https://gameta.gg/gta6/map/bus-stops/'};
const spec = {
  atm:{cat:'atms', prefix:'atm', kind:'shop', type:'ATM', name:'ATM', label:'Caixa eletrônico'},
  towatm:{cat:'atms-towable', prefix:'towatm', kind:'towatm', type:'Towable ATM', name:'Towable ATM', label:'Caixa eletrônico rebocável'},
  ev:{cat:'electric-chargers', prefix:'ev', kind:'shop', type:'EV charger', name:'Electric Vehicle Charger', label:'Carregador elétrico'},
  bus:{cat:'bus-stops', prefix:'bus', kind:'transport', type:'Bus stop', name:'Bus Stop', label:'Ponto de ônibus'}
};
for (const [key, s] of Object.entries(spec)) {
  const gs = withMap(ofCat(s.cat));
  const r = classify(gs, localSets[key]);
  // ATM comum e rebocável no mesmo ponto (≤0,3): provavelmente o mesmo objeto. Não importa nem une.
  const other = key === 'atm' ? localSets.towatm : key === 'towatm' ? localSets.atm : [];
  const sameObject = r.fresh.filter(g => other.some(o => dist(g, o) <= MATCH));
  r.fresh = r.fresh.filter(g => !sameObject.includes(g));
  r.conflicts.push(...r.adjacent.map(g => ({...g, nearest:0, note:'a menos de ' + DISTINCT + ' unidade de outro candidato novo'})), ...sameObject.map(g => ({...g, nearest:+Math.min(...other.map(o => dist(g, o))).toFixed(2), crossType:true})));
  stats[key] = {source:gs.length, local:localSets[key].length, matched:r.matched, matchMedian:r.median, matchP90:r.p90, added:r.fresh.length,
    conflicts:r.conflicts.length, localsWithoutPair:r.localsWithoutPair, sourceDuplicates:r.sourceDuplicates, declared:cats[catIndex(s.cat)].count};
  conflicts[key] = r.conflicts.map(c => ({id:idOf(s.prefix, c), x:c.x, y:c.y, nearestUnits:c.nearest, ...(c.crossType ? {note:'coincide com objeto de outro tipo (ATM comum × rebocável)'} : {})}));
  for (const g of r.fresh) created.push({
    id:idOf(s.prefix, g), kind:s.kind, name:s.name, type:s.type, region:regionNear(g), x:g.x, y:g.y, evidence:'single', description:'', sources:[src],
    collection:'gameta',
    fields:{'Posição':'Fonte única (Gameta). Nenhum ' + s.label.toLowerCase() + ' do catálogo a menos de ' + DISTINCT + ' unidade.',
      'Conferência':'Calibração por ' + validation.pairs + ' pares independentes: mediana de ' + validation.heldOutMedian + ' unidade (≈' + Math.round(validation.heldOutMedian * 32) + ' m) em pares reservados.'}
  });
}

// ---- Tesouros do Kenton: 41 itens individuais ----
const kentonPage = [];
for (const section of html.split(/<h3 id="/).slice(1)) {
  const wreck = /^[^"]*"[^>]*>([^<]*?)\s*\(\d+\)/.exec(section)?.[1];
  for (const item of section.matchAll(/<b class="mk-name"[^>]*>([^<]+)<\/b>[\s\S]*?pin=pl-(\d+)/g)) kentonPage.push({wreck:wreck.replace(/&#39;|&amp;/g, m => m === '&amp;' ? '&' : "'"), name:item[1].replace(/&#39;/g, "'"), pin:+item[2]});
}
const kenton = withMap(ofCat('kenton-s-treasures'));
if (kenton.length !== 41 || kentonPage.length !== 41) throw new Error('Esperava 41 tesouros do Kenton; recebi ' + kenton.length + '/' + kentonPage.length);
const kentonItems = kenton.map(k => {
  const page = kentonPage.find(p => p.name === k.name);
  if (!page) throw new Error('Item sem correspondência: ' + k.name);
  return {...k, wreck:page.wreck, pin:page.pin};
});
const wrecks = [...new Set(kentonItems.map(k => k.wreck))];
const counts = Object.fromEntries(wrecks.map(w => [w, kentonItems.filter(k => k.wreck === w).length]));
for (const k of kentonItems) created.push({
  id:'gameta-kenton-' + k.pin, kind:'kenton', name:k.name + ' · ' + k.wreck, type:"Kenton's Treasure", region:regionNear(k), x:k.x, y:k.y, evidence:'single', description:'', sources:[pageUrl + '?pin=pl-' + k.pin],
  collection:'gameta',
  fields:{'Local de mergulho':k.wreck + ' (' + counts[k.wreck] + ' itens)', 'Item':k.name, 'Destino':'Itens que o Kenton Rees compra.',
    'Posição':'Fonte única (Gameta). Os itens de um mesmo local ficam a poucos metros uns dos outros.'}
});

// ---- Descobertas subaquáticas: pino aproximado no centro dos tesouros de cada naufrágio nomeado ----
const named = {'Nuestra Señora de la Noche':'noche', 'Nuestra Señora de la Ética Laxa':'etica-laxa', 'Nuestra Señora Lujuriosa':'lujuriosa', 'Urca de Cinco Torres':'cinco-torres', 'Urca de Santa Sierra':'santa-sierra'};
const wreckCentres = {};
for (const [wreck, slug] of Object.entries(named)) {
  const items = kentonItems.filter(k => k.wreck === wreck);
  if (!items.length) throw new Error('Naufrágio sem itens: ' + wreck);
  const c = {x:+(items.reduce((s, k) => s + k.x, 0) / items.length).toFixed(2), y:+(items.reduce((s, k) => s + k.y, 0) / items.length).toFixed(2)};
  const spread = Math.max(...items.map(k => dist(k, c)));
  wreckCentres[slug] = {wreck, ...c, spread:+spread.toFixed(2)};
  created.push({
    id:'gameta-wreck-' + slug, kind:'underwater', name:wreck, type:'Shipwreck', region:regionNear(c), x:c.x, y:c.y, evidence:'approximate', approx:true, description:'', sources:[pageUrl, 'https://www.dexerto.com/wikis/gta-6/underwater-discovery-locations/', 'https://game-checklists.com/gta6/underwater-discoveries-checklist/'],
    collection:'gameta',
    fields:{'Tipo':'Naufrágio', 'Precisão da posição':'Aproximada: centro dos ' + items.length + ' tesouros do Kenton neste naufrágio (raio de ' + spread.toFixed(1).replace('.', ',') + ' unidade). O casco pode ficar a algumas dezenas de metros.',
      'Área':'Arredores de Key Lento (Dexerto e Game Checklists)', 'Profundidade':'Não documentada nas fontes consultadas.'}
  });
}

// ---- Contatos ----
for (const c of withMap(ofCat('contacts'))) created.push({
  id:'gameta-contact-' + c.X + '-' + c.Y, kind:'contact', name:c.name, type:'Contact', region:regionNear(c), x:c.x, y:c.y, evidence:'single', description:'', sources:[src],
  collection:'gameta', fields:{'Posição':'Fonte única (Gameta). Local onde o contato é encontrado.'}
});

// ---- Meditação: conferência apenas (nada é importado) ----
const meditation = withMap(ofCat('meditation')).map(g => {
  const l = local.filter(p => p.kind === 'meditation').find(p => norm(p.name) === norm(g.name));
  return {name:g.name, gameta:{x:g.x, y:g.y}, local:l ? {id:l.id, x:l.x, y:l.y} : null, units:l ? +dist(g, l).toFixed(2) : null};
});

const ids = created.map(p => p.id);
if (new Set(ids).size !== ids.length) throw new Error('IDs repetidos na saída.');
const output = {
  source:src, bundle:{path:bundleName, sha256:createHash('sha256').update(bundle).digest('hex'), bytes:bundle.length},
  license:'Sem licença ou termos publicados. robots.txt: Allow /, Disallow /api/. Só fatos posicionais e nomes de itens.',
  validation, stats, conflicts, meditation, wreckCentres,
  created
};
await mkdir(new URL('../src/data/', import.meta.url), {recursive:true});
await writeFile(new URL('../src/data/gameta.js', import.meta.url),
  '// Gerado por scripts/import-gameta.mjs. Não edite à mão.\nexport default ' + JSON.stringify(output, null, 1) + ';\n');
console.log(JSON.stringify({created:created.length, validation:{pairs:validation.pairs, median:validation.heldOutMedian, p90:validation.heldOutP90}, stats}));

// ---- relatório nominal (audit/GAMETA.md) ----
const fmt = v => String(v).replace('.', ',');
const lines = ['# Importação do Gameta · relatório nominal', '',
  'Gerado por `node scripts/import-gameta.mjs`. Fonte: ' + src + ' (arquivo `' + bundleName + '`, sha256 `' + output.bundle.sha256.slice(0, 16) + '…`).', '',
  '## Calibração', '',
  '- Pares por nome único nos dois lados: **' + validation.pairs + '**. Ajuste em ' + validation.fittedOn + ' pares (' + validation.inliersFit + ' inliers) e validação em **' + validation.heldOut + ' pares reservados**.',
  '- Resíduo mediano nos reservados: **' + fmt(validation.heldOutMedian) + ' unidade** (≈' + Math.round(validation.heldOutMedian * 32) + ' m). P90 ' + fmt(validation.heldOutP90) + '. ' + validation.heldOutWithin05 + ' de ' + validation.heldOut + ' a até 0,5 e ' + validation.heldOutWithin1 + ' a até 1,0. O restante são nomes iguais com numeração diferente (cestas, trocas de livro) e dois pontos de meditação em conflito.',
  '- Transformação antiga (÷32 com deslocamentos 118,684375 e 24,9375): mediana de ' + fmt(validation.oldTransformMedianOnHeldOut) + ' nos mesmos pares. A afim ajustada é a usada: `' + validation.transform + '`.', '',
  '## Contagens por categoria', '',
  '| Categoria | Fonte | Local antes | Pares | Mediana dos pares | Novos | Conflitos (não importados) | Locais sem par |', '|---|--:|--:|--:|--:|--:|--:|--:|',
  ...Object.entries(stats).map(([k, s]) => `| ${spec[k].label} | ${s.source} (declarado ${s.declared}) | ${s.local} | ${s.matched} | ${fmt(s.matchMedian)} | ${s.added} | ${s.conflicts} | ${s.localsWithoutPair} |`), '',
  '## Novos IDs', ''];
const group = prefix => created.filter(p => p.id.startsWith(prefix)).map(p => p.id);
for (const [title, prefix] of [['ATMs', 'gameta-atm-'], ['ATMs rebocáveis', 'gameta-towatm-'], ['Carregadores elétricos', 'gameta-ev-'], ['Pontos de ônibus', 'gameta-bus-'],
  ['Tesouros do Kenton', 'gameta-kenton-'], ['Naufrágios (posição aproximada)', 'gameta-wreck-'], ['Contatos', 'gameta-contact-']]) {
  const ids = group(prefix);
  lines.push('**' + title + ' (' + ids.length + ')**', '', ids.map(i => '`' + i + '`').join(', '), '');
}
lines.push('## Pontos em conflito (nada foi importado)', '');
for (const [k, list] of Object.entries(conflicts)) {
  lines.push('**' + spec[k].label + ' (' + list.length + ')**', '', ...list.map(c => `- \`${c.id}\` a ${fmt(c.nearestUnits)} unidade de um ponto local${c.note ? ' · ' + c.note : ''}`), '');
}
lines.push('**Meditação (conferência, sem importação)**', '', ...meditation.filter(m => !m.local || m.units > 1).map(m => `- ${m.name}: ${m.local ? m.local.id + ' a ' + fmt(m.units) + ' unidades do Gameta' : 'sem par local'}`), '');
await writeFile(new URL('../audit/GAMETA.md', import.meta.url), lines.join('\n'));
