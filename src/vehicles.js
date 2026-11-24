
import { normalize } from './model.js';

export const classes = {
  super:'Supercarros', sports:'Esportivos', classic:'Esportivos clássicos', muscle:'Muscle',
  sedan:'Sedãs', coupe:'Cupês', suv:'SUVs', pickup:'Picapes', offroad:'Fora de estrada',
  van:'Vans', compact:'Compactos', wagon:'Peruas', bike:'Motos', cycle:'Bicicletas',
  boat:'Embarcações', plane:'Aviões', helicopter:'Helicópteros', aircraft:'Aeronaves',
  military:'Militares', emergency:'Emergência', service:'Serviço', transport:'Transporte',
  commercial:'Comerciais', utility:'Utilitários', industrial:'Industriais', truck:'Caminhões',
  openwheel:'Monopostos', kart:'Karts', train:'Trens', unknown:'Classe não confirmada',
};
export const buyers = {moses:'Moses', pay:'Pay ’n’ Spray', randy:'Randy'};
export const trackers = {none:'Sem rastreador', standard:'Padrão', advanced:'Avançado', mixed:'Varia entre exemplares'};
export const rarity = {edition:'Edição especial', standout:'Variante especial'};
export const availability = {fixed:'Ponto fixo', reported:'Ponto relatado', street:'Aparecimento em região', edition:'Edição especial', story:'História / encomenda'};
export const confidence = {official:'Oficial', checked:'Verificado pela fonte', reported:'Relato documentado'};
export const unknown = 'Não confirmado';

export function revealVehicle(vehicle, progress) {
  return !progress.spoilers || (!vehicle.spoilerChapter || vehicle.spoilerChapter <= progress.chapter) &&
    (!vehicle.spoilerUnknown || progress.showUnknown);
}

export function visibleSpawns(vehicle, progress) {
  return (vehicle.spawns || []).filter(spawn => !progress.spoilers || !spawn.chapter || spawn.chapter <= progress.chapter);
}

const valueKey = values => {
  const keys = [...new Set(values.filter(value => value != null))];
  return keys.length > 1 ? 'mixed' : keys[0];
};

const samples = (vehicle,progress) => [...vehicle.scans ?? [], ...visibleSpawns(vehicle,progress)];
export const observed = (vehicle,field,progress) => valueKey(samples(vehicle,progress).map(scan=>scan[field]));

const someSell = (track, buyer) => buyer==='moses' ? track==='none' : track==='standard'||track==='advanced';
export function buyerStatus(vehicle, buyer, progress) {
  if (progress.spoilers && progress.chapter < (buyer==='moses'?2:3)) return null;
  if (vehicle.buyerPrices?.some(offer=>offer.buyer===buyer)) return 'observed';
  if (buyer==='randy') return vehicle.randy ? 'request' : null;
  const types = [...new Set(samples(vehicle,progress).map(s=>s.tracker).filter(Boolean))];
  if (!types.length) return null;
  if (types.every(type=>someSell(type,buyer))) return 'conditional';
  if (types.some(type=>someSell(type,buyer))) return 'mixed';
  return buyer==='pay' && types.includes('none') ? 'shop' : 'no';
}
const eligibleBuyer = (vehicle,buyer,progress) => ['request','conditional','mixed','observed'].includes(buyerStatus(vehicle,buyer,progress));

export function compatible(vehicle, progress, buyer) {
  const has = key => progress.equipment.includes(key);
  const enough = record => (record.chapter ?? 1)<=progress.chapter && (record.untilChapter ?? 5)>=progress.chapter &&
    (record.requires ?? []).every(has);
  const spawns = visibleSpawns(vehicle,progress).filter(s=>s.type==='fixed'||s.type==='reported'||s.type==='street');
  if (buyer==='randy') return progress.chapter>=3 && has('randy') && vehicle.randy===true && has('cloner');
  if (!buyer && vehicle.access && enough(vehicle.access)) return true;
  return [...(vehicle.scans ?? []), ...spawns].some(scan=>{
    if (!enough(scan) || !scan.tracker || !scan.entry) return false;
    if ((scan.entry==='cloner' && !has('cloner')) || (scan.entry==='slim' && !has('slim'))) return false;
    const sell = buyer || (scan.tracker==='none' ? 'moses' : 'pay');
    if (!someSell(scan.tracker,sell)) return false;
    if (sell==='moses') return progress.chapter>=2 && has('moses');
    return progress.chapter>=3 && has(scan.tracker==='advanced' ? 'advancedShop' : 'standardShop');
  });
}

export function vehicleSearch(vehicle) {
  return normalize([vehicle.name, vehicle.model, vehicle.maker, vehicle.parentName, ...(vehicle.aliases ?? [])].join(' '));
}

export function exactMarkers(vehicle,progress,{reported=false}={}) {
  return visibleSpawns(vehicle,progress).filter(s=>Number.isFinite(s.x) && Number.isFinite(s.y) &&
    (s.type==='fixed' || (reported && s.type==='reported')));
}

export function priceRange(vehicle) {
  return vehicle.resale?.value || null;
}
const collator = new Intl.Collator('pt-BR',{numeric:true,sensitivity:'base'});

export function selectVehicles(vehicles, filters, progress) {
  const words = normalize(filters.query).split(' ').filter(Boolean);
  const optional = (filter,value) => !filter || (filter==='unknown' ? value == null : filter===String(value));
  const chosen = vehicles.filter(v=>{
    if (!revealVehicle(v,progress) || !words.every(word=>(v.search ?? vehicleSearch(v)).includes(word))) return false;
    if (filters.favorites && !progress.vehicleFavorites.includes(v.id)) return false;
    if (filters.class && v.class!==filters.class) return false;
    if (filters.buyer && !eligibleBuyer(v,filters.buyer,progress)) return false;
    if (filters.compatible && !compatible(v,progress,filters.buyer)) return false;
    if (!optional(filters.rarity,v.rarity) || !optional(filters.tracker,observed(v,'tracker',progress)) ||
        !optional(filters.alarm,observed(v,'alarm',progress)) || !optional(filters.cloner,observed(v,'cloner',progress))) return false;
    if (filters.availability) {
      const known = [...new Set([v.availability,...visibleSpawns(v,progress).map(s=>s.type)].filter(Boolean))];
      if (filters.availability==='unknown' ? known.length : !known.includes(filters.availability)) return false;
    }
    const range = priceRange(v);
    const min = filters.min==='' || filters.min==null ? -Infinity : Number(filters.min);
    const max = filters.max==='' || filters.max==null ? Infinity : Number(filters.max);
    return min<=max && (min===-Infinity && max===Infinity || !!range && range[0]<=max && range[1]>=min);
  });
  const rank = v=>({price:priceRange(v)?.[1],speed:v.stats?.speed,rarity:{edition:2,standout:1}[v.rarity]})[filters.sort];
  return chosen.sort((a,b)=>(rank(b) ?? -Infinity) - (rank(a) ?? -Infinity) || collator.compare(a.name,b.name));
}
