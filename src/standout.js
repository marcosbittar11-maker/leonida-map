const gameta = 'https://gameta.gg/pt-br/gta6/map/standout-vehicles/';
export const standoutIndex = 'https://www.gtabase.com/gta-6/map/?feature=standout-vehicle';
export const registrationGuide = 'https://thegameswiki.com/gta6/wiki/standout-vehicles';
const gametaPin = id => gameta+'?pin=pl-'+id;

export const variantNotes = {
  'standout-vehicle-101': {
    name:'Piccia Big Cat Furia', region:'Starfish Island', series:'Leonida Man', chapter:3,
    note:'Estacionado na entrada da mansão na ponta nordeste da ilha. Procure a pintura de leopardo e a placa POUNCE. Tem alarme e rastreador avançado.',
    requirements:['waink','cloner','advancedShop'],
    refs:[gametaPin(1103),'https://gta6info.app/vehicles/piccia-big-cat-furia','https://gta6wiki.eu/vehicles/big-cat-furia/']
  },
  'standout-vehicle-126': {name:"BF '77 Beer Buggy Bandito", series:'Patriot', refs:[gametaPin(1037)]},
  'standout-vehicle-116': {name:'Annis Drifter Elegy', region:'Gellhorn International Raceway', series:'Street Racer', refs:[gametaPin(1049)]},
  'standout-vehicle-119': {name:'Gallivanter Pink Sunset Baller', region:'Belville', series:'Blinged Up', refs:[gametaPin(1047)]},
  'standout-vehicle-113': {name:'Vapid DriveShaft Marshall', region:'Port Gellhorn', series:'DriveShaft Famous', refs:[gametaPin(1001)]},
  'standout-vehicle-050': {name:'Benefactor Nightlight Schafter', region:'Little Cuba', note:'Nos fundos de Casa Guardia.', refs:[gametaPin(1112),'https://gta6.house/library/vehicles/nightlight-schafter']},
  'standout-vehicle-110': {name:'MER-CAN Love Buggy Outlaw', region:'Port Gellhorn', note:'Procure na garagem indicada no ponto.', refs:[gametaPin(993)]},
  'standout-vehicle-229': {region:'Belville', note:'Procurar em uma garagem residencial na área de Belville.', refs:[gametaPin(1039),'https://gtatown.com/garage/vehicles/pink-licorice-astron']},
  'standout-vehicle-170': {refs:[gametaPin(987)],note:'Picape reforçada de corrida. A referência descreve um galpão em South Kelly County.'}
};

// Gameta usa escala 32 e uma origem diferente. Mediana de 207 correspondências únicas.
const additionalSpots = [
  {id:'gameta-standout-1105', name:"Declasse Battler Picador", raw:[15073,16703], series:'Stock Car', region:'South Kelly County',
    refs:[gametaPin(1105)], note:'Segundo ponto publicado pelo Gameta. Confirme o aparecimento no seu jogo.'},
  {id:'gameta-standout-1085', name:'Pfister Pink Licorice Astron', raw:[20217,14000], series:'Girlypop', region:'',
    refs:[gametaPin(1085),'https://gtatown.com/garage/girlypop'],note:'Segundo ponto publicado pelo Gameta. A referência descreve uma garagem em Belville para o outro aparecimento.'}
];
export const additionalVariants = additionalSpots.map(({raw,refs,series,note,...record})=>({
  ...record, x:raw[0]/32-118.684375, y:raw[1]/32-24.9375,
  kind:'vehicle', type:'Standout vehicle', evidence:'community', collection:'gameta',
  description:'', sources:refs, series, note
}));

const nonGarage = /\b(?:airgator|airboat|mammatus|mallard|bmx|lectro|squalo|seashark|predator|l20s|l35p|sea sparrow|shamal|maverick|duster|seaplane|helicopter|boat|speedboat|cruiser bicycle|scorcher|cruiser bike|cb69|cruiser bike|kayak|dinghy|tugboat)\b/i;
const service = /\b(?:police|sheriff|ambulance|fire truck|law & order)\b/i;
export function isPersonalVariant(point) {
  return /^standout-vehicle-|^gameta-standout-/.test(point.id) &&
    !nonGarage.test(point.name) && !service.test(point.name) && !/^Set: Pedal Power\b/i.test(point.description);
}
export function variantSeries(point) {
  return variantNotes[point.id]?.series || point.series || /^Set:\s*([^;]+)/i.exec(point.description)?.[1] || 'Sem coleção informada';
}
