import { guides, bankSummary, officialPlaces, rockstarPlaces } from './guides.js';
import { decodeLayers, defaultLayers, placeCategory, pointLayer, specializedCategories } from './layers.js';
import { additionalVariants, isPersonalVariant, variantNotes, variantSeries, standoutIndex } from './standout.js';

export const normalize = value => (value ?? '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const safeKinds = new Set(['shop','electronics','clothes','gym','food','hotel','transport','civic','leisure','nature','workshop','building']);
const spoilerName = /\b(mission|story|heist|chapter|finale|epilogue|death|destroyed|safehouse|request|abandoned)\b/i;
export const chapters = [1,2,3,4,5];
export const freshProgress = () => ({ version:1, chapter:null, chapterSelected:false, enabledGroups:defaultLayers(), showUnknown:false, spoilers:true, strictAccess:false, equipment:[], completed:{}, favorites:[], custom:[], route:[] });

export function resolveId(id, aliases) {
  const visited = new Set();
  while (Object.hasOwn(aliases, id) && !visited.has(id)) {
    visited.add(id);
    id = aliases[id];
  }
  return id;
}
export function applyGuides(catalog) {
  const categories = new Map([...catalog.categories,...specializedCategories].map(category=>{
    const name=category.key==='vehicle'?'Veículos variantes':category.name;
    return [category.key,{...category,name,group:pointLayer(category)}];
  }));
  return [...catalog.points,...additionalVariants].map(point => {
    const guide = guides[point.id] || bankSummary(point);
    const variant = isPersonalVariant(point);
    const excludedVehicle = point.kind==='vehicle' && !variant || /^vehicle-request-/.test(point.id);
    const notes = variantNotes[point.id];
    const series = variant ? variantSeries(point) : null;
    const official = officialPlaces.has(point.id);
    const references = [...[point.name,point.type,point.description].join(' ').matchAll(/\bchapters?\s*([1-5])\b/gi)];
    const latestReference = guide ? 0 : Math.max(0,...references.map(match=>Number(match[1])));
    const category = categories.get(guide?.kind || placeCategory(point));
    const neutral = !guide && (variant || safeKinds.has(point.kind)) && !spoilerName.test(point.name + ' ' + point.type);
    const name = notes?.name || guide?.name || point.name;
    const region = notes?.region || guide?.region || point.region;
    const refs = [...new Set([
      ...(official?[rockstarPlaces]:[]), ...(guide?.refs||[]), ...(notes?.refs||[]),
      ...(variant?[standoutIndex]:[]), ...(point.kind==='electronics'?['https://gamemaps.gg/game/grand-theft-auto-6/guides/electronics']:[])
    ])];
    return {...point, ...guide, guide, category, official, latestReference, variant, excludedVehicle, series, name, region, refs,
      variantDescription:variant && !spoilerName.test(point.description),
      chapter:notes?.chapter || guide?.chapter, requires:notes?.requirements || guide?.requires,
      variantNote:notes?.note || point.note,
      kind:category?.key || point.kind, neutral,
      search:normalize([name, point.name, region, category?.name, category?.group, point.type, series,
        variant?'variante colecionável veículo carro':'', normalize(point.name).includes('fleeca')?'banco assalto':'',
        point.id==='L2453'?'armazém abandonado contrabando':'',
        point.id==='safe-070'?'crabshack cofre armas caranguejo':''].join(' '))};
  });
}

export function visible(point, progress) {
  if (progress.chapter == null || point.excludedVehicle) return false;
  if (progress.spoilers) {
    if (Math.max(point.chapter ?? 0,point.latestReference ?? 0) > progress.chapter) return false;
    if (!point.neutral && point.chapter == null && !progress.showUnknown) return false;
  }
  return !progress.strictAccess || (point.chapter == null ? !!point.neutral && !point.variant : (point.requires || []).every(key => progress.equipment.includes(key)));
}
export function availableOnMap(point, progress) {
  return progress.enabledGroups.includes(point.category?.group) && visible(point, progress);
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
  return !filters.words?.length || filters.words.every(word => point.search.includes(word));
}
const idPattern = /^[a-z0-9][a-z0-9_-]{0,110}$/i;
const customPattern = /^custom-[0-9a-f-]{36}$/i;
const validCoord = v => Number.isFinite(v) && v >= 0 && v <= 1024;
const safeId = id => typeof id === 'string' && idPattern.test(id) && !['constructor','prototype'].includes(id.toLowerCase());
const cleanText = (text, max) => typeof text === 'string' ? text.trim().slice(0, max) : '';

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
  const chapterSelected = payload.chapterSelected === true && chapters.includes(payload.chapter);
  return {
    ...defaults, chapter:chapterSelected ? payload.chapter : null, chapterSelected,
    enabledGroups:decodeLayers(payload), showUnknown:payload.showUnknown === true, spoilers:payload.spoilers !== false, strictAccess:payload.strictAccess === true,
    equipment:Array.isArray(payload.equipment) ? ids(payload.equipment) : [],
    completed, favorites:ids(payload.favorites), custom:[...custom.values()],
    route:Array.isArray(payload.route) ? ids(payload.route).slice(0,25) : []
  };
}
export function mergeProgress(current, imported) {
  const completed = {...current.completed};
  for (const [id, value] of Object.entries(imported.completed)) if (!completed[id] || completed[id] < value) completed[id] = value;
  const custom = new Map([...current.custom, ...imported.custom].map(p => [p.id,p]));
  return {...current, completed, custom:[...custom.values()], favorites:[...new Set([...current.favorites,...imported.favorites])],
    route:current.route.length ? current.route : imported.route };
}
export function remaining(points, completed) {
  return points.filter(p => p.reward && !completed[p.id]).reduce(([lo,hi,n],{reward}) => [lo+reward[0],hi+reward[1],n+1],[0,0,0]);
}
export const gameDistance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y)*32;
export const moneyText = value => 'US$ ' + new Intl.NumberFormat('pt-BR', { maximumFractionDigits:0 }).format(value);
export const rangeText = ([min,max]) => min === max ? moneyText(min) : moneyText(min) + ' – ' + moneyText(max);

