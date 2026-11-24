import { guides, bankSummary, officialPlaces, rockstarPlaces } from './guides.js';
import { decodeLayers, defaultLayers, placeCategory, pointLayer, specializedCategories } from './layers.js';
import { additionalVariants, isPersonalVariant, variantNotes, variantSeries, standoutIndex } from './standout.js';
import { duplicateAliases, reclassified, renames, regions, gangOperations, fences, fenceTypes, fastFoodStickUps,
  storeFacts, valueConflicts, categoryRules } from './curation.js';
import { configurableKeys, requirementState, usesEquipment } from './requirements.js';

export const normalize = value => (value ?? '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const freshProgress = () => ({ version:1, enabledGroups:defaultLayers(), equipment:[], completed:{}, favorites:[], vehicleFavorites:[], custom:[] });

export function resolveId(id, aliases) {
  const visited = new Set();
  while (Object.hasOwn(aliases, id) && !visited.has(id)) {
    visited.add(id);
    id = aliases[id];
  }
  return id;
}
/** Aliases do importador somados às duplicatas revisadas manualmente. */
export function catalogAliases(catalog) {
  return {...(catalog.aliases || {}), ...duplicateAliases};
}

const money = /Take value:\s*\$([\d,]+)\s*[-–]\s*\$([\d,]+)/i;
const securityText = {low:'Baixa', medium:'Média', high:'Alta'};
const metaPart = /^\s*(Security|Take value|Gang|Robbery|Unlocked|Set):/i;
function parseReward(description) {
  const value = money.exec(description || '');
  return value ? value.slice(1).map(n => Number(n.replaceAll(',',''))) : undefined;
}
/** Remove os metadados estruturados ("Security: …; Take value: …") da descrição exibida. */
export function cleanDescription(description) {
  return (description || '').split(';').filter(part => part.trim() && !metaPart.test(part)).join(';').trim();
}

export function curatedKind(point) {
  if (reclassified[point.id]) return reclassified[point.id];
  if (point.kind === 'smash') return /pawn shop/i.test(point.description) ? 'pawn' : 'jewelry';
  if (point.kind === 'bank') return /Robbery:\s*Vault/i.test(point.description) ? 'bigbank' : 'bank';
  if (point.kind === 'food' && fastFoodStickUps.has(point.id)) return 'store';
  if (point.kind === 'other' && /luxury watch/i.test(point.type)) return 'watch';
  if (point.kind === 'weapon' && /weapon pickup/i.test(point.type)) return 'pickup';
  return placeCategory(point);
}

const anchorKinds = new Set(['gang','jewelry','pawn','bank','bigbank','payday']);
const complexItems = new Set(['safe','weapon','pickup','watch','drug','package','vehicle','tablet']);
const shopItems = new Set(['safe','fence']);

export function applyGuides(catalog) {
  const merged = new Map(catalog.categories.map(category => [category.key, category]));
  for (const special of specializedCategories) merged.set(special.key, {group:'Operações', ...merged.get(special.key), ...special});
  const categories = new Map([...merged.values()].map(category=>{
    const name=category.key==='vehicle'?'Veículos variantes':category.name;
    return [category.key,{...category,name,group:pointLayer(category)}];
  }));
  const points = [...catalog.points,...additionalVariants].filter(point => !duplicateAliases[point.id]).map(point => {
    const kindKey = curatedKind(point);
    const rule = categoryRules[kindKey] || {};
    const guide = guides[point.id] || bankSummary(point);
    const variant = isPersonalVariant(point);
    const excludedVehicle = point.kind==='vehicle' && !variant || /^vehicle-request-/.test(point.id);
    const notes = variantNotes[point.id];
    const series = variant ? variantSeries(point) : null;
    const official = officialPlaces.has(point.id);
    const category = categories.get(guide?.kind || kindKey);
    const rename = renames[point.id];
    const gang = gangOperations[point.id] || (category?.key === 'gang' ? {gang:/Gang:\s*([^;]+)/i.exec(point.description)?.[1]?.trim(), checklist:false} : null);
    const fence = fences[point.id];
    const name = notes?.name || guide?.name || rename?.name || point.name;
    const region = notes?.region || guide?.region || point.region || regions[point.id] || '';
    const reward = guide?.reward || parseReward(point.description);
    const security = /Security:\s*(\w+)/i.exec(point.description)?.[1]?.toLowerCase();
    const description = cleanDescription(point.description);
    const toolText = variant ? point.description : '';
    const guideRequires = notes?.requirements || guide?.requires || [];
    const requires = [...new Set([...(rule.requires || []), ...guideRequires,
      ...(/key cloner|cloner/i.test(toolText) ? ['cloner'] : []), ...(/slim jim/i.test(toolText) ? ['slim'] : [])])];
    const reqStatus = guide?.reqStatus || rule.reqStatus || (guide?.requires || notes?.requirements ? 'known' : requires.length ? 'partial' : undefined);
    const fields = {
      ...(rule.unlock ? {'Desbloqueio':rule.unlock} : {}),
      ...(fence?.unlock ? {'Desbloqueio':fence.unlock} : {}),
      ...(fence ? {'Compra':fenceTypes[fence.type], ...(fence.rates ? {'Pagamento por tipo':fence.rates} : {})} : {}),
      ...(gang?.gang ? {'Gangue':gang.gang} : {}),
      ...(gang && category?.key === 'gang' ? {'100%':gang.checklist ? 'Conta para as 39 operações do checklist' : gang.note || 'Não contabilizada no checklist de 39'} : {}),
      ...(security && !guide?.fields?.['Segurança'] ? {'Segurança':securityText[security] || security} : {}),
      ...(reward && !guide?.reward ? {'Valor da fonte':rangeText(reward)+' · faixa do cartão do jogo publicada pelo Open GTA 6 Map'} : {}),
      ...(rule.fields || {}), ...(storeFacts[point.id] || {}), ...(guide?.fields || {}),
      ...(valueConflicts[point.id] ? {'Divergência de valor':valueConflicts[point.id]} : {}),
      ...(rename?.conflict ? {'Divergência':rename.conflict} : {}),
      ...(fence?.note ? {'Local':fence.note} : {})
    };
    const refs = [...new Set([
      ...(official?[rockstarPlaces]:[]), ...(guide?.refs||[]), ...(notes?.refs||[]), ...(rule.refs||[]),
      ...(variant?[standoutIndex]:[]), ...(point.kind==='electronics'?['https://gamemaps.gg/game/grand-theft-auto-6/guides/electronics']:[])
    ])];
    return {...point, ...guide, guide, category, official, variant, excludedVehicle, series, name, region, refs, reward,
      sourceName:point.name, description, fields, gang, fenceType:fence?.type,
      chapter:notes?.chapter || guide?.chapter || rule.chapter,
      requires, optional:[...new Set([...(rule.optional || []), ...(guide?.optional || [])])],
      infoRequires:[...new Set([...(rule.infoRequires || [])])], reqStatus,
      intro:guide?.intro || rename?.note || gang?.note,
      variantNote:notes?.note || point.note,
      kind:category?.key || kindKey,
      search:normalize([name, point.name, rename?.alias, region, category?.name, category?.group, point.type, series, gang?.gang,
        variant?'variante colecionável veículo carro':'', normalize(point.name).includes('fleeca')?'banco assalto':'',
        point.id==='L2453'?'armazém abandonado contrabando':'',
        point.id==='safe-070'?'crabshack cofre armas caranguejo':''].join(' '))};
  });
  linkComplexes(points);
  return points;
}

/** Associa cofres, armas, relógios, drogas e variantes ao complexo mais próximo. */
function linkComplexes(points) {
  const anchors = points.filter(p => anchorKinds.has(p.kind) && p.x != null);
  for (const item of points) {
    if (item.x == null || anchorKinds.has(item.kind)) continue;
    let best, bestDistance = Infinity;
    for (const anchor of anchors) {
      const items = anchor.kind === 'gang' ? complexItems : shopItems;
      if (!items.has(item.kind) || item.kind === 'vehicle' && !item.variant) continue;
      const radius = anchor.kind === 'gang' ? 1.6 : 0.45;
      const distance = Math.hypot(item.x - anchor.x, item.y - anchor.y);
      const named = anchor.kind === 'gang' && normalize(item.sourceName).includes(normalize(anchor.name.split(' · ')[0]));
      if ((distance <= radius || named && distance <= 4) && distance < bestDistance) {best = anchor; bestDistance = distance;}
    }
    if (best) {
      item.partOf = best.id;
      (best.related ??= []).push(item.id);
    }
  }
}

export function visible(point) {
  return !point.excludedVehicle;
}
export function availableOnMap(point, progress) {
  return progress.enabledGroups.includes(point.category?.group) && visible(point);
}
export function availability(point, progress) {
  return requirementState(point, progress.equipment);
}
export function matches(point, filters, progress) {
  if (!availableOnMap(point, progress)) return false;
  if (filters.kinds?.has(point.kind) || (point.variant && filters.series?.has(point.series))) return false;
  if (filters.status === 'done' && !progress.completed[point.id]) return false;
  if (filters.status === 'pending' && progress.completed[point.id]) return false;
  if (filters.status === 'favorite' && !progress.favorites.includes(point.id)) return false;
  if (filters.repeat && point.repeatable !== true) return false;
  if (filters.peace && point.noGunfire !== true) return false;
  if (filters.guides && !point.guide) return false;
  if (filters.availability && filters.availability !== 'all' && availability(point, progress).state !== filters.availability) return false;
  if (filters.equipment?.size && ![...filters.equipment].every(key => usesEquipment(point, key))) return false;
  return !filters.words?.length || filters.words.every(word => point.search.includes(word));
}
const idPattern = /^[a-z0-9][a-z0-9_-]{0,110}$/i;
const customPattern = /^custom-[0-9a-f-]{36}$/i;
const validCoord = v => Number.isFinite(v) && v >= 0 && v <= 1024;
const safeId = id => typeof id === 'string' && idPattern.test(id) && !['constructor','prototype'].includes(id.toLowerCase());
const cleanText = (text, max) => typeof text === 'string' ? text.trim().slice(0, max) : '';

/**
 * Lê progresso salvo ou importado. Campos do antigo antisspoiler (chapter, spoilers, showUnknown,
 * strictAccess) e requisitos que deixaram de ser configuráveis são descartados.
 */
export function decodeProgress(payload, aliases = {}) {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.custom) || !Array.isArray(payload.favorites) ||
      !payload.completed || typeof payload.completed !== 'object' || Array.isArray(payload.completed)) throw new Error('Formato de progresso inválido.');
  const defaults = freshProgress();
  const ids = values => [...new Set(values.filter(safeId).map(id => resolveId(id, aliases)))];
  const custom = new Map();
  for (const p of payload.custom) {
    if (!p || !customPattern.test(p.id) || !validCoord(p.x) || !validCoord(p.y) || !cleanText(p.name, 90)) {
      throw new Error('O arquivo contém um ponto personalizado inválido.');
    }
    custom.set(p.id, { id:p.id, name:cleanText(p.name, 90), region:cleanText(p.region, 90), description:cleanText(p.description, 500), x:p.x, y:p.y });
  }
  const completed = {};
  for (const [id, date] of Object.entries(payload.completed)) {
    if (!safeId(id) || typeof date !== 'string' || !Number.isFinite(Date.parse(date))) continue;
    const canonical = resolveId(id, aliases);
    const iso = new Date(date).toISOString();
    if (!completed[canonical] || completed[canonical] < iso) completed[canonical] = iso;
  }
  return {
    ...defaults,
    enabledGroups:decodeLayers(payload),
    equipment:Array.isArray(payload.equipment) ? [...new Set(payload.equipment.filter(key => configurableKeys.includes(key)))] : [],
    completed, favorites:ids(payload.favorites), custom:[...custom.values()],
    vehicleFavorites:Array.isArray(payload.vehicleFavorites) ? [...new Set(payload.vehicleFavorites.filter(safeId))] : []
  };
}
export function mergeProgress(current, imported) {
  const completed = {...current.completed};
  for (const [id, value] of Object.entries(imported.completed)) if (!completed[id] || completed[id] < value) completed[id] = value;
  const custom = new Map([...current.custom, ...imported.custom].map(p => [p.id,p]));
  return {...current, completed, custom:[...custom.values()], favorites:[...new Set([...current.favorites,...imported.favorites])],
    vehicleFavorites:[...new Set([...current.vehicleFavorites,...imported.vehicleFavorites])] };
}
/** Soma recompensas pendentes sem contar itens já incluídos no valor de um complexo. */
export function remaining(points, completed) {
  const byId = new Map(points.map(p => [p.id, p]));
  return points.filter(p => p.reward && !completed[p.id] && !(p.partOf && byId.get(p.partOf)?.reward))
    .reduce(([lo,hi,n],{reward}) => [lo+reward[0],hi+reward[1],n+1],[0,0,0]);
}
export const moneyText = value => 'US$ ' + new Intl.NumberFormat('pt-BR', { maximumFractionDigits:0 }).format(value);
export const rangeText = ([min,max]) => min === max ? moneyText(min) : moneyText(min) + ' – ' + moneyText(max);

/** Contagem por categoria: pontos que passam nos filtros / total catalogado. */
export function categoryCounts(all, shown) {
  const counts = new Map();
  for (const p of all) {
    if (!visible(p)) continue;
    const row = counts.get(p.kind) ?? {shown:0, total:0, category:p.category};
    row.total++;
    counts.set(p.kind, row);
  }
  for (const p of shown) if (counts.has(p.kind)) counts.get(p.kind).shown++;
  return counts;
}
