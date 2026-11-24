export const layers = [
  ['Operações','shield'], ['Veículos','car'], ['Atividades','dumbbell'],
  ['Armas','crosshair'], ['Estilo','shirt'], ['Comidas e bebidas','utensils'],
  ['Exploração','compass'], ['Transporte público','bus'], ['Colecionáveis','gem'],
  ['Locais','map-pin'], ['Pessoal','star']
];
export const defaultLayers = () => ['Operações'];

const layerByKind = {
  safehouse:'Pessoal', custom:'Pessoal',
  vehicle:'Veículos', workshop:'Veículos',
  weapon:'Armas', ammushop:'Armas',
  clothes:'Estilo', style:'Estilo',
  food:'Comidas e bebidas',
  transport:'Transporte público',
  easter:'Exploração', waink:'Exploração', underwater:'Exploração', nature:'Exploração',
  other:'Exploração'
};
export const specializedCategories = [
  {key:'ammushop',name:'Ammu-Nation',colour:'#ff9bba'},
  {key:'style',name:'Estilo e personalização',colour:'#e8a5ed'}
];

export function placeCategory(point) {
  if (point.kind!=='shop') return point.kind;
  const type=point.type?.toLowerCase();
  if (type==='ammu-nation') return 'ammushop';
  if (['hair salon','tattoo parlour','shoe shop'].includes(type)) return 'style';
  return point.kind;
}
export function pointLayer(category) {
  return layerByKind[category.key] || category.group;
}
export function decodeLayers(saved) {
  if (Array.isArray(saved.enabledGroups)) return layers.map(([name])=>name).filter(name=>saved.enabledGroups.includes(name));
  return saved.placesEnabled===true ? [...defaultLayers(),'Locais'] : defaultLayers();
}
