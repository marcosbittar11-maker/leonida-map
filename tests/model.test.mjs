import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { prepareCatalog } from '../scripts/normalize.mjs';
import { guides } from '../src/guides.js';
import { applyGuides, decodeProgress, mergeProgress, freshProgress, visible, matches, remaining } from '../src/model.js';
import { graphFromRoads, routeLeg } from '../src/routes.js';

const catalog=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url)));
const data=applyGuides(catalog);
const byId=new Map(data.map(p=>[p.id,p]));

test('snapshot público mantém coordenadas, categorias e guias referenciáveis',()=>{
  assert.ok(catalog.stats.total>5000);
  assert.equal(new Set(data.map(p=>p.id)).size,data.length);
  assert.equal(data.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).length,catalog.stats.positioned);
  assert.ok(data.every(p=>p.category));
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
test('capítulo, requisitos, busca normalizada e flags positivas',()=>{
  const p=byId.get('safe-070');
  assert.equal(freshProgress().chapter,null);
  assert.equal(visible(p,freshProgress()),false);
  assert.equal(visible(p,{...freshProgress(),spoilers:false}),false);
  const progress={...freshProgress(),chapter:3,chapterSelected:true};
  assert.equal(visible(p,progress),true);
  assert.equal(visible(byId.get('vehicle-request-013'),{...progress,chapter:2}),false);
  assert.equal(visible(byId.get('vehicle-request-013'),{...progress,chapter:2,showUnknown:true}),false);
  assert.equal(visible(byId.get('safehouse-005'),{...progress,showUnknown:true}),false);
  assert.equal(visible(byId.get('safehouse-005'),{...progress,chapter:4,showUnknown:true}),true);
  assert.equal(visible(p,{...progress,strictAccess:true}),false);
  assert.equal(visible(p,{...progress,strictAccess:true,equipment:['boat']}),true);
  assert.equal(matches(p,{words:['caranguejo','pelican']},progress),true);
  assert.equal(matches(p,{peace:true},progress),false);
  assert.deepEqual(remaining([byId.get('L2453'),p],{}),[12720,14400,1]);
});
test('backup resolve aliases, preserva capítulo atual e valida pontos customizados',()=>{
  const raw={...freshProgress(),chapter:1,favorites:['before'],completed:{before:'2026-11-24'},route:['before']};
  const imported=decodeProgress(raw,{before:'after'});
  assert.deepEqual(imported.favorites,['after']);
  assert.deepEqual(imported.completed,{after:'2026-11-24T00:00:00.000Z'});
  assert.equal(imported.chapter,null);
  const merged=mergeProgress({...freshProgress(),chapter:4,chapterSelected:true},imported);
  assert.equal(merged.chapter,4);
  assert.equal(decodeProgress(merged).chapter,4);
  assert.deepEqual(merged.route,['after']);
  assert.throws(()=>decodeProgress({...raw,custom:[{id:'bad',name:'bad',x:5000,y:30}]}));
});
test('trajeto viário usa segmentos conectados e separa lacunas',()=>{
  const graph=graphFromRoads({features:[{geometry:{type:'LineString',coordinates:[[0,0],[0,5],[5,5]]}}]});
  const a={x:0,y:0}, b={x:5,y:5};
  const known=routeLeg(a,b,graph);
  assert.equal(known.known,true);
  assert.equal(known.length,320);
  assert.ok(known.straight<known.length);
  assert.equal(routeLeg(a,{x:50,y:50},graph).known,false);
});

