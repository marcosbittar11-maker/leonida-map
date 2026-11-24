
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { freshProgress } from '../src/model.js';
import { configurableKeys } from '../src/requirements.js';
import { compatible, exactMarkers, observed, selectVehicles } from '../src/vehicles.js';
import { consolidate, readFinderPrices } from '../scripts/vehicles-normalize.mjs';

const snapshot = JSON.parse(await readFile(new URL('../public/data/vehicles.json',import.meta.url),'utf8'));
const byId = new Map(snapshot.vehicles.map(v=>[v.id,v]));
const progress = freshProgress();

test('catálogo sem IDs duplicados mantém preços livres, compradores e pontos em campos próprios',async()=>{
  assert.ok(snapshot.vehicles.length>500);
  assert.equal(byId.size,snapshot.vehicles.length);
  assert.equal(new Set(snapshot.vehicles.map(v=>v.name)).size,snapshot.vehicles.length);
  assert.ok(snapshot.vehicles.filter(v=>v.resale).length>100);
  const schafter=byId.get('benefactor-schafter-s');
  assert.equal(schafter.resale,undefined);
  assert.equal(schafter.buyerPrices.find(v=>v.buyer==='randy').value[0],8357);
  for (const v of snapshot.vehicles) {
    if (v.photo) await readFile(new URL('../public/'+v.photo.file,import.meta.url));
    for (const s of v.spawns ?? []) {
      if (['street','story'].includes(s.type)) assert.equal(s.x,undefined);
      if (['fixed','reported'].includes(s.type)) assert.ok(s.x>0 && s.x<1024 && s.y>0 && s.y<1024);
    }
  }
});

test('busca parcial, faixa de revenda, comprador, filtros de segurança e acesso ao mapa',()=>{
  const models=snapshot.vehicles;
  const result=selectVehicles(models,{query:'öbey dra',sort:'speed'},progress);
  assert.equal(result[0].id,'obey-8f-drafter');
  const priced=selectVehicles(models,{min:10000,max:18000,sort:'price'},progress);
  assert.ok(priced.length>0);
  assert.ok(priced.every(v=>v.resale.value[0]<=18000 && v.resale.value[1]>=10000));
  assert.deepEqual(priced.map(v=>v.resale.value[1]),priced.map(v=>v.resale.value[1]).sort((a,b)=>b-a));
  const caracara=byId.get('vapid-caracara-4x4');
  assert.equal(observed(caracara,'alarm',progress),true);
  assert.equal(compatible(caracara,progress,'pay'),false);
  assert.equal(compatible(caracara,{...progress,equipment:['cloner']},'pay'),true);
  const stanier=byId.get('vapid-stanier-55');
  // Edições e pacotes não são configuráveis: não são presumidos como atendidos.
  assert.equal(compatible(stanier,{...progress,equipment:['vintage']}),false);
  assert.equal(compatible(stanier,{...progress,equipment:configurableKeys}),false);
  assert.ok(selectVehicles(models,{query:'caracara 4x4',tracker:'standard',cloner:'true',buyer:'pay'},progress).includes(caracara));
  const big=byId.get('variant-piccia-big-cat-furia');
  assert.equal(exactMarkers(big,progress)[0].id,'standout-vehicle-101');
  // Sem filtragem por capítulo: o ponto fixo continua disponível com qualquer configuração.
  assert.equal(exactMarkers(big,{...progress,chapter:1,spoilers:true}).length,1);
  const picador=byId.get('variant-declasse-battler-picador');
  assert.equal(exactMarkers(picador,progress).length,0);
  assert.equal(exactMarkers(picador,progress,{reported:true}).length,2);
});

test('atualização preserva correções manuais, observações ausentes e IDs existentes',()=>{
  const input='<tr><th><a class="gf-price-model" href="/vehicles/vapid-stanier-98"><span>Vapid Stanier &#x27;98<small>Sedan</small></span></a><small>Buyer figures in profile</small></th><td>$3,400</td><td>$550–$1,045</td></tr>';
  const [parsed]=readFinderPrices(input);
  assert.equal(parsed.name,"Vapid Stanier '98");
  assert.deepEqual(parsed.quotes[0].value,[550,1045]);
  const vehicles=Array.from({length:100},(_,i)=>({slug:'id-'+i,name:'Modelo '+i,status:'checked'}));
  const lab={vehicles,vehicleDatabase:{prices:{}}};
  const manual={overrides:{'id-0':{name:'Modelo corrigido'}}};
  const previous={vehicles:[{id:'id-old',name:'Registro anterior'},{id:'id-0',name:'Modelo antigo',register:10}]};
  const output=consolidate({lab,pages:[],catalog:{points:[]},manual,previous,date:'2026-11-24'});
  assert.equal(output.vehicles.find(v=>v.id==='id-old').name,'Registro anterior');
  assert.equal(output.vehicles.find(v=>v.id==='id-0').name,'Modelo corrigido');
  assert.equal(output.vehicles.find(v=>v.id==='id-0').register,10);
});
