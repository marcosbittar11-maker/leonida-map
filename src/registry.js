/**
 * Fonte única de grupos, categorias, cores e símbolos. Filtros, pinos, legendas, fichas,
 * rankings, busca e a página de ícones derivam daqui. Os desenhos ficam em symbols.js.
 */
export const groups = [
  {id:'ops', name:'Operações', symbol:'bigbank'},
  {id:'collect', name:'Colecionáveis', symbol:'card'},
  {id:'items', name:'Itens e recursos', symbol:'treasure'},
  {id:'vehicles', name:'Veículos', symbol:'vehicle'},
  {id:'activities', name:'Atividades', symbol:'race'},
  {id:'explore', name:'Exploração', symbol:'waink'},
  {id:'places', name:'Locais e serviços', symbol:'shop'},
  {id:'personal', name:'Pessoal', symbol:'star'}
];

// pending: categoria da base sem pontos posicionados; continua listada, sem pinos inventados.
const c = (key, name, group, colour, extra = {}) => ({key, name, group, colour, ink:inkFor(colour), symbol:extra.symbol || key, ...extra});
export const categories = [
  c('jewelry','Joalherias','Operações','#f77f00'),
  c('pawn','Casas de penhores','Operações','#e09f3e'),
  c('bank','Bancos · caixa e cofre pequeno','Operações','#e9c46a'),
  c('bigbank','Grandes bancos · cofre','Operações','#d4a017'),
  c('payday','Financeiras','Operações','#bc6c25'),
  c('gang','Operações ilegais','Operações','#d62828'),
  c('store','Lojas assaltáveis (Stick Ups)','Operações','#8ecae6'),
  c('towatm','Caixas eletrônicos rebocáveis','Operações','#2ec4b6'),
  c('fence','Receptadores','Operações','#9a8c98'),

  c('card','Cartas colecionáveis','Colecionáveis','#ffd166'),
  c('flamingo','Flamingos de cocaína','Colecionáveis','#ff6fae',{pending:'Sem coordenadas publicadas'}),
  c('waink','Escaneamentos WAiNK','Colecionáveis','#7ae582'),
  c('magazine','Livros e revistas','Colecionáveis','#c77dff'),
  c('playlist','Playlists','Colecionáveis','#e76f51'),
  c('mural','Murais 1010','Colecionáveis','#ff5d8f'),
  c('streetart','Arte de rua','Colecionáveis','#06d6a0'),
  c('meteorite','Meteoritos','Colecionáveis','#b5179e'),
  c('bottle','Mensagens na garrafa','Colecionáveis','#48cae4'),
  c('bookswap','Troca de livros','Colecionáveis','#9d4edd'),
  c('kenton','Coleções de Kenton','Colecionáveis','#f4a261',{pending:'Sem coordenadas publicadas'}),

  c('weapon','Armas especiais','Itens e recursos','#8d99ae'),
  c('pickup','Armas no chão','Itens e recursos','#adb5c7'),
  c('safe','Cofres','Itens e recursos','#c9a227'),
  c('drug','Drogas e contrabando','Itens e recursos','#abde8c'),
  c('watch','Relógios de luxo','Itens e recursos','#f4d077'),
  c('treasure','Tesouros','Itens e recursos','#e0a100'),
  c('tablet','Tablets','Itens e recursos','#92afff',{pending:'Sem pontos posicionados'}),

  c('vehicle','Veículos variantes','Veículos','#f72585'),
  c('workshop','Oficinas e preparação','Veículos','#72dcdf'),
  c('spray',"Pay 'n' Spray",'Veículos','#4cc9f0'),
  c('carservice','Outros serviços automotivos','Veículos','#5fa8d3'),

  c('gym','Academias','Atividades','#99db72'),
  c('race','Corridas','Atividades','#06d6a0'),
  c('fishing','Pesca','Atividades','#00b4d8'),
  c('hunting','Caça','Atividades','#6a994e'),
  c('range','Estandes de tiro','Atividades','#adb5bd'),
  c('arcade','Minijogos · arcades e minigolfe','Atividades','#b8c0ff'),
  c('hoop','Basquete','Atividades','#fb8500'),
  c('stunt','Saltos acrobáticos','Atividades','#ef476f'),
  c('drone','Corridas de drone','Atividades','#90e0ef'),
  c('basejump','Paraquedismo','Atividades','#3a86ff'),
  c('knife','Voos de faca','Atividades','#4895ef'),
  c('bridge','Voos sob pontes','Atividades','#4361ee'),
  c('meditation','Meditação','Atividades','#4cc9f0'),
  c('bret','Alvos do Bret','Atividades','#a3b18a',{pending:'Sem coordenadas publicadas'}),

  c('easter','Easter eggs','Exploração','#ed9cf1'),
  c('event','Eventos aleatórios','Exploração','#ff006e'),
  c('underwater','Descobertas subaquáticas','Exploração','#2a9df4',{pending:'Sem coordenadas publicadas'}),
  c('nature','Paisagens naturais','Exploração','#52b788'),
  c('other','Pontos de interesse especiais','Exploração','#e9ecef'),

  c('clothes','Lojas de roupas','Locais e serviços','#c6a7ff'),
  c('style','Estilo e personalização','Locais e serviços','#e8a5ed',{symbol:'style'}),
  c('food','Restaurantes e cafés','Locais e serviços','#ff9f1c'),
  c('bar','Bares e boates','Locais e serviços','#f15bb5'),
  c('hotel','Hotéis','Locais e serviços','#d77fa1'),
  c('gas','Postos de combustível','Locais e serviços','#f4845f'),
  c('atm','Caixas eletrônicos (ATMs)','Locais e serviços','#2a9d8f'),
  c('ev','Carregadores elétricos','Locais e serviços','#b7e4c7'),
  c('ammushop','Ammu-Nation','Locais e serviços','#ff9bba'),
  c('electronics','Eletrônicos','Locais e serviços','#86d8e0'),
  c('shop','Lojas e serviços','Locais e serviços','#80ed99'),
  c('transport','Transporte','Locais e serviços','#00bbf9'),
  c('civic','Serviços públicos','Locais e serviços','#7aa0c4'),
  c('leisure','Esportes e lazer','Locais e serviços','#9b5de5'),
  c('building','Edifícios e marcos','Locais e serviços','#ced4da'),

  c('safehouse','Esconderijos','Pessoal','#ffd60a'),
  c('custom','Marcadores personalizados','Pessoal','#eeb994')
];
// Os nomes de grupo nas categorias usam o rótulo; ids ficam disponíveis para a interface.
export const groupNames = groups.map(g => g.name);
export const categoryByKey = new Map(categories.map(category => [category.key, category]));
export const groupOf = name => groups.find(g => g.name === name);
export const fallbackCategory = categoryByKey.get('other');

/** Cor do desenho sobre o fundo colorido do pino (contraste mínimo ~4,5:1). */
export function inkFor(colour) {
  const [r,g,b] = [1,3,5].map(i => parseInt(colour.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.3 ? '#10121d' : '#ffffff';
}

// Subtipos de lugar (tipo do catálogo, minúsculo) com símbolo próprio.
const typeSymbols = {
  'ammu-nation':'ammushop','gas station':'gas','police station':'police','fire station':'fire',hospital:'hospital',
  'hair salon':'haircut','tattoo parlour':'tattoo','shoe shop':'sneaker',marina:'marina',airport:'airport',ferry:'ferry',
  station:'station','bus stop':'busstop','ev charger':'ev','car wash':'carservice',atm:'atm','vehicle rental':'rental',
  'liquor store':'bar',bar:'bar',cinema:'cinema',golf:'golf',nightclub:'nightclub','café and takeout':'cafe',
  'cafe takeout':'cafe','street food':'streetfood','food and drink':'food',comics:'magazine',
  'yellow loot box':'crate',helipad:'helipad','scoop container':'container','car meet':'vehicle'
};
const typedKinds = new Set(['shop','civic','transport','leisure','food','bar','gas','atm','ev','carservice','style','ammushop','other']);
const pointSymbols = {'safe-070':'drug','liquor-store-002':'flamingo'};

/** Nome do símbolo de um ponto: exceções por ID, subtipo de lugar e, por fim, a categoria. */
export function symbolKey(point) {
  if (pointSymbols[point.id]) return pointSymbols[point.id];
  const type = typedKinds.has(point.kind) ? point.type?.toLowerCase() : null;
  if (type && Object.hasOwn(typeSymbols, type)) return typeSymbols[type];
  return categoryByKey.get(point.kind)?.symbol || 'other';
}

/** Categorias derivadas de tipos de lugar. Mantém `kind` original quando não há divisão. */
export function placeCategory(point) {
  const type = point.type?.toLowerCase() || '';
  if (point.kind === 'shop') {
    if (type === 'ammu-nation') return 'ammushop';
    if (['hair salon','tattoo parlour','shoe shop'].includes(type)) return 'style';
    if (type === 'gas station') return 'gas';
    if (type === 'atm') return 'atm';
    if (type === 'ev charger') return 'ev';
    if (['car wash','vehicle rental'].includes(type)) return 'carservice';
  }
  if (point.kind === 'food' && ['bar','nightclub','liquor store'].includes(type)) return 'bar';
  if (point.kind === 'workshop' && /pay 'n' spray/i.test(type)) return 'spray';
  return point.kind;
}
