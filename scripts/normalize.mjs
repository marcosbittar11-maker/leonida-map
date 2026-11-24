const translations = {
  flamingo:'Flamingos de cocaína', card:'Cartas', waink:'Escaneamentos WAiNK', magazine:'Livros e revistas', meditation:'Meditação',
  underwater:'Descobertas subaquáticas', kenton:'Coleções de Kenton', playlist:'Playlists', hoop:'Basquete', bret:'Alvos do Bret',
  stunt:'Saltos acrobáticos', race:'Corridas', drone:'Corridas de drone', range:'Estandes de tiro', arcade:'Arcades e minigolfe',
  gang:'Operações de gangues', bank:'Bancos e cofres de banco', smash:'Joalherias e vitrines', store:'Lojas assaltáveis',
  fence:'Receptadores', other:'Outros locais', package:'Pacotes e contrabando', meteorite:'Meteoritos', treasure:'Tesouros',
  bottle:'Mensagens na garrafa', bookswap:'Troca de livros', mural:'Murais 1010', streetart:'Arte de rua', vehicle:'Veículos',
  bridge:'Voos sob pontes', knife:'Voos de faca', basejump:'Paraquedismo', fishing:'Pesca', hunting:'Caça', event:'Eventos aleatórios',
  safe:'Cofres', towatm:'Caixas eletrônicos rebocáveis', payday:'Financeiras', weapon:'Armas e equipamentos', safehouse:'Esconderijos',
  shop:'Lojas e serviços', food:'Bares e restaurantes', hotel:'Hotéis', transport:'Transporte', civic:'Serviços públicos',
  leisure:'Esportes e lazer', nature:'Paisagens naturais', building:'Edifícios e marcos', workshop:'Oficinas e preparação',
  clothes:'Lojas de roupas', gym:'Academias', easter:'Easter eggs', electronics:'Eletrônicos e tablets', tablet:'Tablets', drug:'Drogas e contrabando'
};
const groups = { Collectibles:'Colecionáveis', Activities:'Atividades', Crime:'Operações', Places:'Locais', Other:'Outros' };
const extra = [
  ['workshop','Places','#72dcdf','🔧'], ['clothes','Places','#c6a7ff','👕'], ['gym','Activities','#99db72','🏋️'],
  ['easter','Activities','#ed9cf1','🥚'], ['electronics','Places','#86d8e0','🎧'], ['tablet','Crime','#92afff','📱'], ['drug','Crime','#abde8c','📦']
];

export function normalizeText(value) {
  return (value ?? '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

import { duplicateAliases } from '../src/curation.js';

// Duplicatas revisadas manualmente. As de src/curation.js também são aplicadas pelo app.
const reviewedAliases = { L2375:'vehicle-mod-shop-001', 'marina-004':'landmark-002', ...duplicateAliases };

function category(record) {
  const type = normalizeText(record.type);
  const name = normalizeText(record.name);
  if (record.id.startsWith('unique-weapon-')) return 'weapon';
  if (record.kind === 'package' && /\b(cocaine|narcotics|drug stash|bag of weed|meth stash)\b/.test(name)) return 'drug';
  if (/mod shop|pay n spray|auto shop|repair shop/.test(type)) return 'workshop';
  if (/clothes shop|clothing store/.test(type)) return 'clothes';
  if (/\bgym\b|fitness center/.test(type)) return 'gym';
  if (/easter egg/.test(type)) return 'easter';
  if (type === 'electronics') return 'electronics';
  if (/\btablet\b/.test(type)) return 'tablet';
  if (/drug pickup|narcotics stash/.test(type)) return 'drug';
  return record.kind;
}

function toPoint(record, collection) {
  const valid = Number.isFinite(record.x) && Number.isFinite(record.y) && record.x >= 0 && record.y >= 0 && record.x <= 1024 && record.y <= 1024;
  const kind = category(record);
  return {
    id: record.id, kind, name: record.name?.trim() || translations[kind] || 'Local sem nome',
    type: record.type || '', region: record.area || '', areaCode: record.region || '',
    x: valid ? record.x : null, y: valid ? record.y : null,
    evidence: record.confidence === 'confirmed' ? 'confirmed' : record.confidence === 'community' ? 'community' : 'unknown',
    description: record.description || '', sources: (record.source_urls || []).filter(url => /^https?:\/\//i.test(url)),
    collection
  };
}

export function prepareCatalog({ locations, places, categories, labels }, metadata, oldAliases = {}) {
  const records = new Map();
  const seen = new Set();
  const aliases = { ...oldAliases };
  const names = new Map();
  const pending = [];
  for (const [collection, list] of Object.entries({ locations, places })) {
    for (const raw of list) {
      if (typeof raw.id !== 'string' || !raw.id || seen.has(raw.id)) {
        throw new Error('ID inválido ou repetido na fonte: ' + raw.id);
      }
      seen.add(raw.id);
      const point = toPoint(raw, collection);
      const equivalent = raw.same_as || reviewedAliases[raw.id];
      if (equivalent) {
        pending.push([point, equivalent]);
        continue;
      }
      const key = normalizeText(raw.name);
      const matches = names.get(key) ?? [];
      const match = key && point.x !== null && matches.find(other => other.kind === point.kind &&
        other.x !== null && Math.hypot(point.x - other.x, point.y - other.y) <= 0.4);
      if (match) {
        aliases[point.id] = match.id;
        match.sources = [...new Set([...match.sources, ...point.sources])];
        match.region ||= point.region;
        continue;
      }
      records.set(point.id, point);
      delete aliases[point.id];
      matches.push(point);
      names.set(key, matches);
    }
  }
  for (const [point, target] of pending) {
    if (records.has(target) || aliases[target]) aliases[point.id] = target;
    else records.set(point.id, point);
  }
  const points = [...records.values()];
  const positioned = points.filter(p => p.x !== null).length;
  const kinds = [...categories.kinds, ...extra.map(([key, group, colour, icon]) => ({key,group,colour,icon}))];
  return {
    metadata, points, aliases, labels,
    categories: kinds.map(({key, group, colour, icon}) => ({key,group:groups[group],colour,icon,name:translations[key] || key})),
    stats: { inputs: locations.length + places.length, locations: locations.length, places: places.length,
      total: points.length, positioned, unpositioned: points.length - positioned, merged: locations.length + places.length - points.length,
      confirmed: points.filter(p => p.evidence === 'confirmed').length,
      community: points.filter(p => p.evidence === 'community').length }
  };
}

