
import { normalize } from '../src/model.js';
import { additionalVariants, variantNotes, variantSeries } from '../src/standout.js';
import { classes } from '../src/vehicles.js';
import { areaNames, chapterSpawns, earlySpawns, makerNames, regions, sources } from './vehicle-facts.mjs';

const entities = {amp:'&', quot:'"', apos:"'", nbsp:' ', ndash:'–', mdash:'—', rsquo:'’', eacute:'é'};
export const htmlText = value => (value ?? '').replace(/<[^>]+>/g,'').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity,key)=>{
  if (!key.startsWith('#')) return entities[key] ?? entity;
  return String.fromCodePoint(key.startsWith('#x') ? Number.parseInt(key.slice(2),16) : Number(key.slice(1)));
}).replace(/\s+/g,' ').trim();
const capture = (text,pattern)=>pattern.exec(text)?.[1];
const cells = row => [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(match=>match[1]);
const rows = html => [...(html ?? '').matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)];
const href = value => htmlText(capture(value, /href="([^"]+)"/));
const resolve = (path,base)=>path.startsWith('/')?new URL(path,base).href:base;
const slug = name => normalize(name).replaceAll(' ','-');
const quote = value => [...htmlText(value).matchAll(/\d[\d, .\u00a0]*(?=\s*\$|\s*[-–—]|\s*$)/g)]
  .map(m=>Number(m[0].replace(/\D/g,''))).filter(n=>Number.isSafeInteger(n));
const price = value => {
  const values = quote(value);
  return values.length ? [Math.min(...values),Math.max(...values)] : undefined;
};

const classNames = {...Object.fromEntries(Object.keys(classes).map(key=>[key,key])),
  'sedan classic':'sedan','classic sedan':'sedan','sedans':'sedan','sedas':'sedan',
  'sports classic':'classic','sports classics':'classic','esportivo classico':'classic',
  'esportivos classicos':'classic','sport classic':'classic','sports car':'sports','esportivo':'sports','esportivos':'sports',
  'supercar':'super','supercarro':'super','supercars':'super','sports coupe':'coupe','coupe de ville':'coupe',
  'coupes':'coupe','pickup low rider':'pickup', 'classic muscle truck':'pickup',
  'muscle off road':'offroad','off road':'offroad','fora de estrada':'offroad','motocicleta':'bike','motorcycle':'bike',
  'motorcycles':'bike','moto':'bike','motos':'bike','bicycle':'cycle','bicycles':'cycle','bicicleta':'cycle',
  'barco':'boat','boat speedboat':'boat','speedboat':'boat','boats':'boat','kayak':'boat',
  'helicopters':'helicopter','helicoptero':'helicopter','airplane':'plane','planes':'plane','aviao':'plane',
  'suvs':'suv','vans':'van','utilitario':'utility','caminhao':'truck','comercial':'commercial',
  'servico':'service','emergencia':'emergency','militar':'military','compactos':'compact','compacts':'compact',
  'perua':'wagon','transporte':'transport','trem':'train','station wagon':'wagon','race car':'sports'
};
const classify = value => classNames[normalize(value)] ?? 'unknown';

export function names(name,maker) {
  const display = name.trim().replace(/[‘’]/g,"'");
  const key = normalize(display);
  const brand = maker ?? [...makerNames].sort((a,b)=>b.length-a.length).find(candidate=>
    (' '+key+' ').includes(' '+normalize(candidate)+' ') && (key.startsWith(normalize(candidate)+' ') ||
    /^\d{2} /.test(key) && key.slice(3).startsWith(normalize(candidate)+' ')));
  const clean = brand ? display.replace(new RegExp('(^|\\s)'+brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=\\s|$)','i'),' ').trim() : display;
  const tokens = normalize(clean).split(' ');
  const years = tokens.filter(token => /^(?:\d{2}|19\d{2}|20\d{2})$/.test(token)).map(token=>token.slice(-2));
  const core = tokens.filter(token => !/^(?:\d{2}|19\d{2}|20\d{2})$/.test(token)).join(' ');
  return {name:display,maker:brand,model:clean,baseKey:normalize(brand)+':'+core,year:years.join('-'),key:normalize(brand)+':'+core+':'+years.join('-')};
}
const importedRefs = items => (items ?? []).flatMap(ref=>ref?.url?.startsWith('https://')?[ref.url]:[]);
const confirmedDates = value => Number.isInteger(value) && value>=1 && value<=5;
const findChapter = value => {
  const chapter=Number(capture(value ?? '',/cap[ií]tulo\s+([1-5])\b/i));
  return confirmedDates(chapter)?chapter:undefined;
};

export function readLab(lab) {
  if (!Array.isArray(lab.vehicles) || lab.vehicles.length<100) throw Error('Formato inesperado no JSON do Leonida Lab.');
  return lab.vehicles.map(v=>{
    const g = v.game ?? {}, find = v.find ?? {};
    const story = chapterSpawns[v.slug], early = earlySpawns[v.slug];
    const refs = [sources.labWeb, ...importedRefs(g.sources), ...(find.status==='pending'?[]:importedRefs(find.sources))];
    const region = regions[v.slug];
    const spawns = [
      ...(region ? [{type:'street', label:region.join(' · '), note:'Aparecimento recorrente relatado. Pode variar no seu save.', refs:importedRefs(find.sources)}] : []),
      ...(story ? [{type:'story',label:story[0],note:story[1],hostile:story[2],chapter:3,requires:['randy'],refs:importedRefs(find.sources)}] : []),
      ...(early ? [{type:'story',label:'Exemplar da história',note:early[1],chapter:early[0],refs:importedRefs(find.sources)}] : []),
    ];
    const edition = find.how==='edition';
    const isVariant = ['grotti-cheetah-95','vapid-dominator-buggy-67','vapid-stanier-55'].includes(v.slug);
    const modelName = g.name || v.name;
    const display = g.brand && !normalize(modelName).split(' ').includes(normalize(g.brand)) && !normalize(modelName).includes(normalize(g.brand)+' ') ? g.brand+' '+modelName : modelName;
    const key = names(display,g.brand);
    return {id:v.slug,...key, aliases:[v.name],class:classify(g.type||v.class),level:v.status,
      ...(g.stats?{stats:g.stats, ratings:g.rating, statsRefs:importedRefs(g.sources)}:{}), refs,
      ...(typeof g.sell==='number'?{quotes:[{value:[g.sell,g.sell],source:lab.vehicleDatabase.prices?.url ?? sources.lab}]}:{}),
      ...(typeof g.register==='number'?{register:g.register}:{}),
      ...(edition ? {availability:'edition', rarity:'edition', condition:find.line?.includes('pre-order')?'Bônus do pacote Vintage Vice City na pré-venda.':'Vinculado à Ultimate Edition.'} : {}),
      ...(v.slug==='vapid-ganado'?{access:{chapter:1,requires:[]},availability:'story',condition:'Veículo inicial do Jason.'}:{}),
      ...(story || region ? {randy:true} : {}), ...(isVariant?{variant:true}:{}), spawns,
    };
  });
}

export function readFinderPrices(html) {
  return rows(html).flatMap(([,attrs,row])=>{
    if (!row.includes('gf-price-model')) return [];
    const [cell,fee,sale] = cells(row);
    const anchor=capture(cell,/(<a\b[\s\S]*?<\/a>)/) ?? '';
    const type = htmlText(capture(anchor,/<small>(.*?)<\/small>/));
    const name = htmlText(anchor.replace(/<small>[\s\S]*?<\/small>/g,''));
    const value = price(sale);
    return [{...names(name),class:classify(type),register:price(fee)?.[0],
      refs:[resolve(href(cell),sources.finder)], quotes:value?[{value,source:sources.finder}]:[]}];
  });
}

export function readFinderCatalog(html) {
  return [...(html ?? '').matchAll(/<a class="item-card" href="(\/vehicles\/[^"]+)">([\s\S]*?)<\/a>/g)].flatMap(([,path,card])=>{
    const name = htmlText(capture(card,/<h3>([\s\S]*?)<\/h3>/));
    const type = htmlText(capture(card,/<div class="item-meta">\s*<span>(.*?)<\/span>/s)).split(' · ')[0];
    if (!name || /^unnamed\b|^unidentified\b/i.test(name)) return [];
    return [{...names(name), finderId:path.split('/').at(-1), class:classify(type), refs:[resolve(path,sources.finderList)]}];
  });
}

export function readPedia(html) {
  return rows(html).flatMap(([,attrs,row])=>{
    if (!/<th scope="row"/.test(row)) return [];
    const [name,tracker,fee,sale,scans] = cells(row).map(htmlText);
    const track = {'avance':'advanced','standard':'standard','aucun':'none','sans':'none','sans traceur':'none','pas de traceur':'none'}[normalize(tracker)];
    const value = price(sale);
    if (!value || !/^\d+$/.test(scans)) return [];
    return [{...names(name),register:price(fee)?.[0],refs:[sources.pedia],
      quotes:[{value,source:sources.pedia}],scans:track?[{tracker:track,source:sources.pedia}]:[]}];
  });
}

export function readMy(html) {
  return rows(html).flatMap(([,attrs,row])=>{
    if (!attrs.includes('data-cat') || !row.includes('vs-')) return [];
    const raw = cells(row);
    const [name,classText,fee,sale,region,how,status] = (raw.length===7 ? raw : [raw[1],'',raw[2],raw[3],'','',raw[4]]).map(htmlText);
    const category = classify(classText || capture(attrs,/data-cat="([^"]+)"/));
    if (!name || /^n[ãa]o identificado|^sem nome/i.test(name) || !status) return [];
    const value = price(sale);
    const chapter = findChapter(region);
    const ref = resolve(href(raw[raw.length===7?0:1]),sources.my);
    return [{...names(name),class:category,level:status.includes('2+ fontes')?'checked':'reported',register:price(fee)?.[0],
      refs:[ref], quotes:value?[{value,source:sources.my}]:[],
      spawns: chapter ? [{type:'story',label:'Exemplar da história',chapter,refs:[ref]}] :
        region && region!=='—' && !/cap[ií]tulo|miss[ãa]o|hist[oó]ria|entrega|ep[ií]logo|personagem/i.test(region)
          ? [{type:'street',label:region,note:'Local de aparecimento citado pela fonte, sem coordenada fixa verificada.',refs:[ref]}] : []}];
  });
}

const best = {official:3,checked:2,reported:1};
const unique = items => [...new Set(items)];
const combineList = (old,next,key) => [...new Map([...old ?? [],...next ?? []].map(v=>[key(v),v])).values()];
function merge(old, next) {
  const hasVariant = old.variant || next.variant;
  const result = {...old, ...Object.fromEntries(Object.entries(next).filter(([k,v])=>old[k]==null&&v!=null))};
  result.name = old.name;
  if (old.class==='unknown' && next.class && next.class!=='unknown') result.class=next.class;
  if (best[next.level] > (best[old.level] ?? 0)) result.level=next.level;
  result.aliases=unique([...old.aliases ?? [], ...next.aliases ?? [],next.name]).filter(n=>n!==result.name);
  result.refs=unique([...old.refs ?? [], ...next.refs ?? []]);
  result.spawns=combineList(old.spawns,next.spawns,s=>s.id ?? s.type+':'+s.label+':'+(s.chapter??''));
  result.scans=combineList(old.scans,next.scans,s=>JSON.stringify(s));
  result.quotes=combineList(old.quotes,next.quotes,q=>q.source);
  if (hasVariant) result.variant=true;
  return result;
}

function addVehicle(index,item) {
  const direct=index.find(v=>v.key===item.key || normalize(v.name)===normalize(item.name) ||
    (item.finderId && item.finderId===v.finderId) || v.id===item.id);
  const possible=index.filter(v=>{
    if (v.variant && !item.variant && v.year!==item.year) return false;
    if ((v.year && item.year && v.year!==item.year) || !v.baseKey || !item.baseKey) return false;
    const [maker,model]=v.baseKey.split(':'), [otherMaker,otherModel]=item.baseKey.split(':');
    return model===otherModel && (!maker||!otherMaker||maker===otherMaker);
  });
  const match=direct || (possible.length===1?possible[0]:null);
  if (!match) {
    const id=item.id || 'vehicle-'+(item.finderId || slug(item.name));
    index.push({...item,id,class:item.class||'unknown',level:item.level||'reported'});
  } else {
    index[index.indexOf(match)] = merge(match,item);
  }
}

function variantRows(catalog, models) {
  return [...catalog.points,...additionalVariants].filter(p=>/^(?:standout-vehicle-|gameta-standout-)/.test(p.id)).map(p=>{
    const correction=variantNotes[p.id] ?? {};
    const display=correction.name || p.name;
    const row=names(display);
    const series=variantSeries(p);
    const core=row.baseKey.split(':')[1];
    const inferred = models
      .filter(v=>v.maker && normalize(v.maker)===normalize(row.maker) && v.class!=='unknown' && (!v.year || !row.year || v.year===row.year) &&
        (' '+core+' ').includes(' '+v.baseKey.split(':')[1]+' '))
      .sort((a,b)=>b.baseKey.length-a.baseKey.length);
    const match = inferred[0] && (inferred[0].baseKey!==inferred[1]?.baseKey) ? inferred[0] : undefined;
    const refs=unique([sources.maps,...correction.refs ?? [],...p.sources ?? []]);
    const chapter=correction.chapter ?? (Number(capture(p.description??'',/\bchapter\s*([1-5])\b/i)) || undefined);
    const region=correction.region || p.region || areaNames[p.areaCode];
    return {...row, id:'variant-'+slug(display), collection:series==='Sem coleção informada'?undefined:series,
      parentName:match?.name!==display?match?.name:undefined,class:match?.class ?? 'unknown',level:'reported',
      variant:true,rarity:'standout', refs,
      spawns:p.x!=null?[{id:p.id,type:'reported',label:region??'Ponto da comunidade',x:p.x,y:p.y,chapter,
        requires:correction.requirements, note:correction.note || p.note, refs}]:[]};
  });
}

export function consolidate({lab,finder,pedia,my,pages,catalog,manual,previous,date}) {
  const index=readLab(lab);
  const aliases=manual.aliases ?? {};
  const add = item=>{
    const target=aliases[slug(item.name)];
    if (target && index.some(v=>v.id===target)) mergeAlias(index,item,target);
    else addVehicle(index,item);
  };
  for (const item of [...readFinderPrices(finder),...readPedia(pedia),...readMy(my),...pages.flatMap(readFinderCatalog)]) add(item);
  const variants=[];
  for (const item of variantRows(catalog,index)) addVehicle(variants,item);
  for (const item of variants) {
    const baseMatch=index.find(model=>model.key===item.key || normalize(model.name)===normalize(item.name));
    if (baseMatch) {
      const {variant,rarity,...spawnData}=item;
      const sameVariant=baseMatch.variant || (!baseMatch.quotes?.length && !baseMatch.stats && !baseMatch.availability && item.parentName);
      index[index.indexOf(baseMatch)]=merge(baseMatch,sameVariant?item:spawnData);
    } else index.push(item);
  }
  const byId=new Map((previous?.vehicles ?? []).map(record=>[record.id,record]));
  for (const item of index) {
    const {key,baseKey,year,finderId,quotes,...record}=item;
    const offers=quotes?.filter(q=>q.value?.every(n=>Number.isFinite(n)&&n>=0)) ?? [];
    if (offers.length) record.resale={value:[Math.min(...offers.map(q=>q.value[0])),Math.max(...offers.map(q=>q.value[1]))],observations:offers};
    const old=byId.get(record.id);
    if (old) {
      const augmented=merge(old,record);
      // New facts replace the prior observation from the same source. Other sources survive partial refreshes.
      const observations=combineList(old.resale?.observations,record.resale?.observations,q=>q.source);
      if (observations.length) augmented.resale={value:[Math.min(...observations.map(q=>q.value[0])),Math.max(...observations.map(q=>q.value[1]))],observations};
      for(const field of ['stats','statsRefs','ratings','register']) if(record[field]!=null) augmented[field]=record[field];
      delete augmented.quotes;
      byId.set(record.id,augmented);
    } else byId.set(record.id,record);
  }
  for (const record of manual.additions ?? []) {
    byId.set(record.id,{...byId.get(record.id),...record});
  }
  for (const [id,patch] of Object.entries(manual.overrides ?? {})) {
    if (!byId.has(id)) throw Error('Correção de veículo sem ID correspondente: '+id);
    const record=byId.get(id);
    const {appendScans,appendSpawns,appendQuotes,addRefs,...fields}=patch;
    const observations=combineList(record.resale?.observations,appendQuotes,q=>q.source);
    const resale=observations.length ? {value:[Math.min(...observations.map(q=>q.value[0])),Math.max(...observations.map(q=>q.value[1]))],observations} : undefined;
    byId.set(id,{...record,...fields,refs:unique([...record.refs??[],...addRefs??[]]),
      resale,
      scans:combineList(record.scans,appendScans,s=>JSON.stringify(s)),spawns:combineList(record.spawns,appendSpawns?.map(spawn=>{
        const existing=record.spawns?.find(s=>s.id===spawn.id);
        return {...existing,...spawn};
      }),s=>s.id??s.label)});
  }
  for (const id of manual.remove ?? []) byId.delete(id);
  return {schema:1,updated:date,labUpdated:lab.vehicleDatabase?.checkedAgainst?.date ?? lab.meta?.updated,
    sources, vehicles:[...byId.values()].sort((a,b)=>a.id.localeCompare(b.id,'en'))};
}

function mergeAlias(index,item,id) {
  const i=index.findIndex(v=>v.id===id);
  index[i]=merge(index[i],item);
}
