import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { prepareCatalog } from '../scripts/normalize.mjs';
import { guides } from '../src/guides.js';
import { applyGuides, decodeProgress, mergeProgress, freshProgress, visible, matches, onMap, remaining, catalogAliases, availability, categoryCounts } from '../src/model.js';
import { duplicateAliases } from '../src/curation.js';
import { configurableKeys, requirementState } from '../src/requirements.js';
import { groups, categories, categoryByKey, symbolKey, inkFor } from '../src/registry.js';
import { glyphs, glyphNames, glyphSvg } from '../src/symbols.js';

const catalog=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url)));
const data=applyGuides(catalog);
const byId=new Map(data.map(p=>[p.id,p]));
const everything=freshProgress();
const kind=key=>data.filter(p=>p.kind===key);

test('snapshot público mantém coordenadas, categorias e guias referenciáveis',()=>{
  assert.ok(catalog.stats.total>5000);
  assert.equal(new Set(data.map(p=>p.id)).size,data.length);
  const dups=Object.keys(duplicateAliases).filter(id=>catalog.points.some(p=>p.id===id)).length;
  assert.equal(data.filter(p=>!['gameta','leonidalab'].includes(p.collection)&&Number.isFinite(p.x)&&Number.isFinite(p.y)).length,catalog.stats.positioned-dups);
  assert.ok(data.every(p=>p.category && p.category.group));
  for(const [id,guide] of Object.entries(guides)) {
    assert.ok(byId.get(id)?.guide,id);
    assert.ok(guide.refs.length);
  }
});
test('dedup conservador com aliases e proveniência',()=>{
  const result=prepareCatalog({locations:[{id:'a',kind:'shop',name:'Bár Azul',x:5,y:10,source_urls:['https://example.com']},
    {id:'b',kind:'bank',name:'Bar Azul',x:5,y:10}], places:[{id:'c',kind:'shop',name:'Bar Azul',x:5.1,y:10,source_urls:['https://other.example']},
    {id:'d',kind:'other',name:'Outro nome',x:5,y:10,same_as:'c'},{id:'e',kind:'shop',name:'Bar Azul',x:20,y:10}],
    categories:{kinds:[]},labels:[]},{});
  assert.deepEqual(result.aliases,{c:'a',d:'c'});
  assert.deepEqual(result.points[0].sources,['https://example.com','https://other.example']);
  assert.equal(result.points.length,3);
});

// Regressão: a falta de capítulo nunca pode voltar a ocultar pontos.
test('pontos sem capítulo ficam visíveis e não existe filtragem por capítulo',()=>{
  const noChapter=data.filter(p=>p.chapter==null && !p.excludedVehicle);
  assert.ok(noChapter.length>4000);
  assert.ok(noChapter.every(p=>visible(p)));
  assert.ok(noChapter.every(p=>matches(p,{},everything)));
  const legacy={...everything,chapter:1,chapterSelected:true,spoilers:true,showUnknown:false,strictAccess:true};
  for(const p of data) assert.equal(matches(p,{},legacy),matches(p,{},everything),p.id);
  assert.equal('chapter' in freshProgress(),false);
});
test('as 20 joalherias, 15 penhores, 22 bancos, 7 financeiras e 39 operações estão consultáveis',()=>{
  const ops={...freshProgress()};
  assert.equal('enabledGroups' in ops,false);
  for(const [key,count] of [['jewelry',20],['pawn',15],['bank',14],['bigbank',8],['payday',7]]) {
    assert.equal(kind(key).length,count,key);
    assert.ok(kind(key).every(p=>matches(p,{},ops)),key);
  }
  assert.equal(kind('gang').filter(p=>p.gang?.checklist).length,39);
  assert.ok(!byId.has('atm-194') || byId.get('atm-194').kind!=='bank');
  assert.equal(byId.get('smash-n-grab-025').name,'Akoya Jewelers');
  assert.equal(matches(byId.get('smash-n-grab-025'),{words:['ayoka']},ops),true);
  assert.equal(byId.get('gang-operation-008').name,'Stash House');
});
test('preferências antigas não mantêm filtros removidos nem bloqueiam joalherias',()=>{
  const old={version:1,chapter:1,chapterSelected:true,spoilers:true,showUnknown:false,strictAccess:true,
    equipment:['jewelry','randy','boat','cloner','standardShop'],enabledGroups:['Operações'],completed:{},favorites:['L910'],custom:[]};
  const decoded=decodeProgress(old,catalogAliases(catalog));
  for(const key of ['chapter','chapterSelected','spoilers','showUnknown','strictAccess']) assert.equal(key in decoded,false,key);
  assert.equal('enabledGroups' in decoded,false);
  assert.deepEqual(decoded.equipment,['cloner']);
  assert.deepEqual(decoded.favorites,['fence-002']);
  const stores=[...kind('jewelry'),...kind('pawn')];
  assert.equal(stores.filter(p=>matches(p,{},decoded)).length,35);
  assert.ok(stores.every(p=>availability(p,decoded).state!=='unmet'));
});
test('cinco itens configuráveis, estados de requisito e filtros individuais',()=>{
  assert.deepEqual(configurableKeys,['slim','cloner','snapgun','bank','vault']);
  const bank=byId.get('bank-007'), vault=byId.get('bank-021'), loan=byId.get('payday-loan-004'), jewel=byId.get('smash-n-grab-007');
  assert.equal(availability(bank,everything).state,'unmet');
  assert.equal(availability(bank,{...everything,equipment:['bank']}).state,'met');
  assert.deepEqual(availability(vault,{...everything,equipment:['bank']}).missing,['vault']);
  assert.equal(availability(loan,{...everything,equipment:['bank']}).state,'met');
  assert.equal(availability(jewel,everything).state,'met');
  assert.deepEqual(availability(jewel,everything).optional,['snapgun']);
  assert.ok(availability(jewel,everything).info.includes('jewelry'));
  // Requisito não configurável é informativo: não bloqueia e não é dado como atendido.
  const crab=byId.get('safe-070');
  assert.equal(availability(crab,everything).state,'met');
  assert.deepEqual(availability(crab,everything).info,['boat']);
  assert.equal(requirementState({kind:'safe'},[]).state,'unknown');
  assert.equal(requirementState({kind:'food'},[]).state,'na');
  assert.equal(matches(bank,{availability:'unmet'},everything),true);
  assert.equal(matches(bank,{availability:'met'},everything),false);
  assert.equal(matches(jewel,{equipment:new Set(['snapgun'])},everything),true);
  assert.equal(matches(bank,{equipment:new Set(['snapgun'])},everything),false);
  assert.ok(kind('gang').some(p=>availability(p,everything).state==='unknown'));
});
test('contadores usam o total catalogado e os pontos filtrados',()=>{
  const shown=data.filter(p=>matches(p,{words:['vice']},everything));
  const counts=categoryCounts(data,shown);
  assert.equal(counts.get('jewelry').total,20);
  assert.ok(counts.get('jewelry').shown<20);
  assert.equal(categoryCounts(data,[]).get('payday').shown,0);
});
test('senhas importadas do Leonida Lab entram como fatos com proveniência',()=>{
  assert.match(byId.get('safe-015').fields['Senha'],/^0300/);
  assert.equal(byId.get('safe-009').fields['Confirmação'],'Senha corroborada por Leonida Lab e GTA6Wiki.');
  const dock=byId.get('leonidalab-sunrise-rv-park-dock');
  assert.equal(dock.partOf,'gang-operation-002');
  assert.ok(dock.refs.includes('https://leonidalab.com/safe-codes/'));
  assert.match(byId.get('safe-070').fields['Confirmação'],/0072/);
});
test('vínculos de complexo e ranking sem dupla contagem',()=>{
  const boat=byId.get('gang-operation-007');
  assert.ok(boat.related.includes('safe-004'));
  assert.equal(byId.get('safe-004').partOf,'gang-operation-007');
  const fake=[{id:'op',reward:[10,20]},{id:'item',reward:[5,5],partOf:'op'},{id:'solo',reward:[1,1]}];
  assert.deepEqual(remaining(fake,{}),[11,21,2]);
  assert.deepEqual(remaining([byId.get('L2453'),byId.get('safe-070')],{}),[12720,14400,1]);
});
test('backup resolve aliases e valida pontos customizados',()=>{
  const raw={...freshProgress(),favorites:['before'],completed:{before:'2026-11-24'},vehicleFavorites:['vehicle-vapid-stanier-98']};
  const imported=decodeProgress(raw,{before:'after'});
  assert.deepEqual(imported.favorites,['after']);
  assert.deepEqual(imported.completed,{after:'2026-11-24T00:00:00.000Z'});
  const merged=mergeProgress({...freshProgress(),equipment:['slim']},imported);
  assert.deepEqual(merged.equipment,['slim']);
  assert.deepEqual(merged.vehicleFavorites,['vehicle-vapid-stanier-98']);
  assert.throws(()=>decodeProgress({...raw,custom:[{id:'bad',name:'bad',x:5000,y:30}]}));
});
test('visibilidade: nada aparece sem categoria ativa, mas a busca e os dados continuam disponíveis',()=>{
  const place=byId.get('pay-n-spray-002');
  const progress=freshProgress();
  const filters={show:new Set()};
  assert.equal(place.kind,'spray');
  assert.equal(data.filter(p=>onMap(p,filters,progress)).length,0,'início limpo');
  assert.equal(matches(place,{words:['pay']},progress),true,'a busca ignora a visibilidade');
  filters.show.add('spray');
  assert.equal(onMap(place,filters,progress),true);
  assert.equal(onMap(byId.get('bank-001'),filters,progress),false);
  const hidden=byId.get('bank-001');
  assert.equal(onMap(hidden,filters,progress,new Set([hidden.id])),true,'exibição temporária do resultado');
  const fav={...progress,favorites:[hidden.id]};
  assert.equal(onMap(hidden,{...filters,favoritePins:true},fav),true,'favoritos independem da categoria');
  assert.equal(onMap(hidden,{...filters,favoritePins:true},progress),false);
  // O progresso preserva marcações mesmo com todas as categorias ocultas.
  const saved=decodeProgress({version:1,custom:[],favorites:[hidden.id],completed:{[hidden.id]:'2026-01-01T00:00:00.000Z'},enabledGroups:['inventado']});
  assert.deepEqual(saved.favorites,[hidden.id]);
  assert.ok(saved.completed[hidden.id]);
  assert.equal('enabledGroups' in saved,false);
});
test('todo ponto pertence a uma categoria do registro e cada categoria tem símbolo próprio',()=>{
  for(const p of data) assert.ok(categoryByKey.has(p.kind),p.id+' '+p.kind);
  assert.equal(new Set(categories.map(c=>c.key)).size,categories.length);
  assert.deepEqual([...new Set(categories.map(c=>c.group))].sort(),groups.map(g=>g.name).sort());
  const seen=new Map();
  for(const c of categories) {
    assert.ok(glyphs[c.symbol],c.key+' sem símbolo');
    assert.equal(seen.get(c.symbol),undefined,c.key+' repete o símbolo de '+seen.get(c.symbol));
    seen.set(c.symbol,c.key);
    assert.match(c.colour,/^#[0-9a-f]{6}$/i);
    assert.match(c.ink,/^#(10121d|ffffff)$/);
  }
  for(const g of groups) assert.ok(glyphs[g.symbol],g.name);
  for(const name of glyphNames) {
    assert.match(glyphSvg(name),/^<svg[^>]*>.+<\/svg>$/,name);
    assert.ok(glyphs[name].length>30,name+' é simples demais');
  }
  assert.equal(new Set(glyphNames.map(n=>glyphs[n])).size,glyphNames.length,'desenhos idênticos');
});
test('categorias sem pontos posicionados continuam listadas com contador zero',()=>{
  const counts=categoryCounts(data,[]);
  for(const key of ['flamingo','underwater','kenton','bret','tablet']) {
    assert.equal(counts.get(key).total,0,key);
    assert.ok(categoryByKey.get(key).pending,key);
  }
  assert.equal(counts.size,categories.length);
  assert.ok(kind('bank').length>0&&counts.get('bank').total===kind('bank').length);
});
test('subtipos de lugar têm símbolo específico e divisão em categorias',()=>{
  const sym=(kind,type)=>symbolKey({kind,type});
  assert.notEqual(sym('gas','Gas station'),sym('atm','ATM'));
  assert.equal(kind('gas').length,57);
  assert.equal(kind('atm').length,160);
  assert.ok(kind('spray').length>=19&&kind('workshop').every(p=>!/pay 'n' spray/i.test(p.type)));
  assert.ok(kind('bar').length>=143);
  assert.equal(symbolKey({kind:'other',type:'Yellow loot box'}),'crate');
  assert.equal(symbolKey({id:'liquor-store-002',kind:'easter'}),'flamingo');
  assert.equal(inkFor('#ffffff'),'#10121d');
  assert.equal(inkFor('#10121d'),'#ffffff');
});
test('Veículos inclui variantes terrestres e exclui pedidos para entrega',()=>{
  const progress=freshProgress();
  assert.equal(matches(byId.get('standout-vehicle-001'),{},progress),true);
  assert.equal(matches(byId.get('vehicle-request-013'),{},progress),false);
  assert.equal(matches(byId.get('standout-vehicle-286'),{},progress),false);
  assert.match(byId.get('standout-vehicle-101').name,/Big Cat Furia/);
  assert.equal(data.filter(p=>p.collection==='gameta'&&p.variant).length,2);
});
