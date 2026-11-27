
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { freshProgress } from '../src/model.js';
import { configurableKeys } from '../src/requirements.js';
import { compatible, exactMarkers, observed, selectVehicles, canListVehicle, randyPrice } from '../src/vehicles.js';
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

test('scans da mesma página coexistem, mas a reimportação da mesma tabela substitui o valor antigo',()=>{
  const lab={vehicles:Array.from({length:100},(_,i)=>({slug:'id-'+i,name:'Modelo '+i,status:'checked'})),vehicleDatabase:{prices:{}}};
  const page='https://exemplo.test/ficha';
  const scans=[1,2,3].map(n=>({id:'fonte:id-0:'+n,value:[1000*n,1000*n],source:page,kind:'waink-scan'}));
  const manual={overrides:{'id-0':{appendQuotes:scans}}};
  const first=consolidate({lab,pages:[],catalog:{points:[]},manual,previous:null,date:'2026-11-24'});
  const record=first.vehicles.find(v=>v.id==='id-0');
  assert.deepEqual(record.resale.observations.map(q=>q.value[0]),[1000,2000,3000]);
  assert.deepEqual(record.resale.value,[1000,3000]);
  // Reimportação sem os scans: o catálogo anterior preserva todos e reaplica a mesma correção sem duplicar.
  const again=consolidate({lab,pages:[],catalog:{points:[]},manual,previous:first,date:'2026-11-25'});
  assert.equal(again.vehicles.find(v=>v.id==='id-0').resale.observations.length,3);
  // Fonte importada por tabela (sem id) continua sendo substituída por fonte.
  const table='https://tabela.test/precos';
  const old={vehicles:[{id:'id-0',name:'Modelo 0',resale:{value:[500,500],observations:[{value:[500,500],source:table}]}}]};
  const labWithPrice={...lab,vehicles:lab.vehicles.map(v=>v.slug==='id-0'?{...v,game:{sell:700}}:v),vehicleDatabase:{prices:{url:table}}};
  const next=consolidate({lab:labWithPrice,pages:[],catalog:{points:[]},manual:{},previous:old,date:'2026-11-25'});
  assert.deepEqual(next.vehicles.find(v=>v.id==='id-0').resale.observations.map(q=>q.value[0]),[700]);
});

test('GTA+, encomenda do Randy, veículo destruído e valor descartado ficam fora da faixa principal',()=>{
  const lab={vehicles:Array.from({length:100},(_,i)=>({slug:'id-'+i,name:'Modelo '+i,status:'checked'})),vehicleDatabase:{prices:{}}};
  const src='https://exemplo.test/x';
  const quotes=[['a',1000,'waink-scan'],['b',1100,'gtaplus'],['c',2500,'randy'],['d',400,'destroyed'],['e',9000,'rejected']]
    .map(([n,v,kind])=>({id:'t:'+n,value:[v,v],source:src,kind}));
  const output=consolidate({lab,pages:[],catalog:{points:[]},manual:{overrides:{'id-0':{appendQuotes:quotes}}},previous:null,date:'2026-11-24'});
  const record=output.vehicles.find(v=>v.id==='id-0');
  assert.deepEqual(record.resale.value,[1000,1000]);
  assert.deepEqual(record.valueNotes.map(q=>q.kind).sort(),['destroyed','gtaplus','randy','rejected']);
  // Sem nenhuma cotação de escopo principal não existe revenda livre, e as demais evidências permanecem.
  const only=consolidate({lab,pages:[],catalog:{points:[]},manual:{overrides:{'id-1':{appendQuotes:quotes.slice(1)}}},previous:null,date:'2026-11-24'}).vehicles.find(v=>v.id==='id-1');
  assert.equal(only.resale,undefined);
  assert.equal(only.valueNotes.length,4);
});

test('revenda ampliada: valores com proveniência, escopos separados e filtro de valor conhecido',()=>{
  for (const v of snapshot.vehicles) {
    for (const q of [...v.resale?.observations ?? [],...v.valueNotes ?? []]) {
      assert.ok(Number.isFinite(q.value[0]) && q.value[0]<=q.value[1],v.id);
      if (q.id) assert.match(q.source,/^https:\/\//,v.id);
    }
    if (v.resale) assert.ok(v.resale.observations.length && v.resale.value[0]===Math.min(...v.resale.observations.map(q=>q.value[0])),v.id);
    assert.ok(!(v.resale?.observations ?? []).some(q=>['gtaplus','randy','destroyed','rejected','owned-card','info-card','map-card','unclassified-scan'].includes(q.kind)),v.id);
  }
  const niaDrank=byId.get('variant-progen-purple-drank-emerus').resale;
  assert.deepEqual(niaDrank.observations.map(q=>q.value[0]),[33000,32205,27620]);
  assert.ok(niaDrank.observations.every(q=>q.source==='https://meowdb.com/gta6/vehicles/progen-purple-drank-emerus'));
  // Comet S2 destruído do Jason não entra na faixa do exemplar em circulação.
  const comet=byId.get('pfister-comet-s2');
  assert.ok(comet.resale.observations.every(q=>q.value[0]!==9710));
  assert.equal(comet.valueNotes.find(q=>q.kind==='destroyed').value[0],9710);
  // Valor RK do Growler e o bônus GTA+ não definem a revenda livre.
  const growler=byId.get('pfister-growler');
  assert.deepEqual(growler.resale.value,[5700,5700]);
  assert.equal(growler.buyerPrices.find(o=>o.buyer==='randy').value[0],12100);
  // A variante não herda o valor do modelo base.
  assert.equal(byId.get('variant-pegassi-gold-rope-infernus').resale,undefined);
  const known=selectVehicles(snapshot.vehicles,{priced:true,sort:'name'},progress);
  assert.ok(known.length>120 && known.every(v=>v.resale));
});


test('Car Finder exclui veículos não pessoais sem apagar catálogo e distingue Randy de revenda',()=>{
  const filtered=selectVehicles(snapshot.vehicles,{},progress);
  assert.ok(filtered.length<snapshot.vehicles.length);
  assert.ok(filtered.every(canListVehicle));
  assert.equal(canListVehicle({name:'Pegassi Police Tempesta',class:'super'}),false);
  assert.equal(canListVehicle({name:'Vapid DriveShaft Marshall',class:'offroad'}),false);
  assert.equal(canListVehicle({name:'Civilian SUV',class:'suv'}),true);
  assert.ok(!filtered.some(v=>['boat','plane','helicopter','emergency'].includes(v.class)&&v.register==null));
  const z=byId.get('granforma-zorrusso');
  assert.deepEqual(z.resale.value,[10000,10000]);
  assert.equal(randyPrice(z),21250);
  const comet=byId.get('pfister-comet-s2');
  assert.deepEqual(comet.resale.value,[8850,15000]);
  assert.ok(comet.valueNotes.some(q=>q.kind==='gtaplus'&&q.value[0]===16500));
  assert.ok(byId.get('bravado-bison-1800').resale);
  assert.equal(randyPrice(byId.get('buckingham-jubilee')),15650);
});
