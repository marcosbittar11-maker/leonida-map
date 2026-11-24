// Importa as senhas de cofres e teclados publicadas pelo Leonida Lab (https://leonidalab.com/safe-codes/).
// Licença da fonte: "Facts are facts; attribution appreciated." Apenas fatos (código, tipo, local, conteúdo) são copiados.
// Uso: node scripts/import-safe-codes.mjs [arquivo-local-data.json]
// Saída: src/data/safe-codes.js, com a validação de coordenadas e as pendências de localização.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const url = 'https://leonidalab.com/api/data.json';
const text = process.argv[2] ? await readFile(process.argv[2], 'utf8') : await (await fetch(url, {signal:AbortSignal.timeout(30000)})).text();
const lab = JSON.parse(text);
const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));
const byId = new Map(catalog.points.map(p => [p.id, p]));

// Correspondência revisada manualmente entre o slug da fonte e o ID local.
const local = {
  'janjaks-garage':'safe-022', 'illegal-sneaker-trade':'safe-018', 'casa-guardia':'safe-027',
  'black-eagle-warehouse-safe':'weapon-spawn-050', 'marbelle-hotel':'easter-egg-010',
  'pelican-valley-password':'safe-070', 'pelican-valley-safe':'safe-070', 'pelican-valley-dock':'safe-070',
  'sunrise-rv-park-office':'safe-038', 'manatee-motel':'safe-037', 'kingpin-bowling':'safe-015',
  'brooks-boatworks':'safe-004', 'la-cascara-motel':'safe-009', 'brooks-boatworks-second-safe':'safe-006',
  'june-warehouse':'safe-013', 'stash-house':'safe-005', 'backroom-weed-front':'safe-014', 'hog-stars-garage':'safe-008',
  'chatfield-storage':'safe-028', 'slum-house':'safe-058', 'stormy':'safe-053', 'belpoint-shipwreck':'safe-045',
  'nova-auto-junkyard':'safe-036', 'industrial-weed-grow':'safe-030', 'farm-fix-meth-lab':'safe-012', 'biker-hideout':'safe-011',
  'palmer-fishing-warehouse':'safe-035', 'watson-bay-safehouse':'safe-034', 'father-scrumpys-orchard':'waink-landmark-010',
  'sound4sound-studio':'safe-017', 'declasse-vamos-garage':'vehicle-request-001'
};
// Regras gerais da fonte aplicadas a categorias inteiras.
const rules = {'store-safes':['jewelry','pawn','store'], 'bank-safes':['bank','bigbank','payday'], 'bank-vaults':['bigbank']};
// Itens com posição exata e sem ponto local: viram pontos novos, com coordenada convertida e validada.
const createWhenExact = new Set(['sunrise-rv-park-dock']);

const toMap = pos => ({x:+((pos.x + 16384) / 32).toFixed(3), y:+((16384 - pos.y) / 32).toFixed(3)});
const residuals = [];
const records = {}, created = [], pending = [], categoryRules = {};
for (const item of lab.safes.items) {
  if (item.spoiler) {pending.push({slug:item.slug, reason:'Omitido pela fonte como spoiler; sem código publicado.'}); continue;}
  const fact = {slug:item.slug, name:item.name, lock:item.lock, kind:item.kind, code:item.code, where:item.where, inside:item.inside,
    how:item.how, clue:item.clue, status:item.status, source:lab.safes.url};
  if (rules[item.slug]) {for (const kind of rules[item.slug]) (categoryRules[kind] ??= []).push(fact); continue;}
  const id = local[item.slug];
  if (id && byId.has(id)) {
    const p = byId.get(id);
    if (item.pos) {
      const m = toMap(item.pos);
      residuals.push({slug:item.slug, id, units:+Math.hypot(m.x - p.x, m.y - p.y).toFixed(2)});
    }
    (records[id] ??= []).push(fact);
  } else if (item.pos?.exact && createWhenExact.has(item.slug)) {
    created.push({id:'leonidalab-' + item.slug, kind:'safe', name:'Safe - ' + item.name, type:'Safe', region:'', ...toMap(item.pos),
      evidence:'community', description:'', sources:[lab.safes.url], collection:'leonidalab', facts:[fact]});
  } else pending.push({slug:item.slug, name:item.name, code:item.code ?? null, reason:item.pos ? 'Posição aproximada na fonte; sem ponto local equivalente.' : 'Sem posição na fonte e sem ponto local equivalente.'});
}
const sorted = residuals.map(r => r.units).sort((a, b) => a - b);
const validation = {pairs:residuals.length, median:sorted[Math.floor(sorted.length / 2)] ?? null, max:sorted.at(-1) ?? null, residuals,
  method:'Metros do jogo (x leste, y norte) → mapa: x = (X + 16384) / 32, y = (16384 − Y) / 32. Mesma convenção das coordenadas exibidas nas fichas.'};
if (validation.median > 1) throw Error('Resíduo mediano acima de 1 unidade: transformação não validada.');
const output = {source:lab.safes.url, license:lab.meta?.license, updated:lab.safes.updated, sha256:createHash('sha256').update(text).digest('hex'),
  validation, records, created, categoryRules, pending};
await mkdir(new URL('../src/data/', import.meta.url), {recursive:true});
await writeFile(new URL('../src/data/safe-codes.js', import.meta.url),
  '// Gerado por scripts/import-safe-codes.mjs. Não edite à mão.\nexport default ' + JSON.stringify(output, null, 1) + ';\n');
console.log(JSON.stringify({records:Object.keys(records).length, created:created.length, pending:pending.length, median:validation.median, max:validation.max}));
