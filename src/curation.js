// Correções editoriais aplicadas sobre o snapshot importado do Open GTA 6 Map.
// Nada aqui sobrescreve o arquivo importado: o catálogo continua reproduzível pelo importador
// e cada correção cita a fonte que a justifica. Revisado em 24/11/2026.

export const curationChecked = '2026-11-24';

const ppx = {
  smash:'https://www.powerpyx.com/gta-6-all-smash-n-grabs-locations/',
  gang:'https://www.powerpyx.com/gta-6-all-illegal-gang-operations-locations/',
  bank:'https://www.powerpyx.com/gta-6-all-bank-jobs-locations-bank-vaults/',
  payday:'https://www.powerpyx.com/gta-6-all-payday-loans-jobs-locations/',
  fence:'https://www.powerpyx.com/gta-6-all-fence-locations-how-to-fence-stolen-goods/',
  checklist:'https://www.powerpyx.com/gta-6-100-completion-checklist-guide/',
  fastFood:'https://www.powerpyx.com/gta-6-all-fast-food-stores-locations/',
  liquor:'https://www.powerpyx.com/gta-6-all-liquor-stores-locations/',
  convenience:'https://www.powerpyx.com/gta-6-all-convenience-stores-locations/'
};
const wiki = {
  jewelry:'https://gta6wiki.eu/guides/gta-6-jewelry-store-robberies/',
  gang:'https://gta6wiki.eu/map/gang-operation/',
  payday:'https://gta6wiki.eu/map/payday-loan/'
};
export const curationSources = { ppx, wiki,
  snapGun:'https://www.pcgamer.com/games/grand-theft-auto/gta-6-snap-gun/',
  viceCodes:'https://vice-city.app/developers' };

// Duplicatas confirmadas por nome, função e distância (até 0,5 unidade). O primeiro ID é absorvido.
export const duplicateAliases = {
  L910:'fence-002',          // "Fence" a 0,00 de La Perle Pawn Shop
  L1117:'fence-004',         // "Fence" a 0,00 de Hamlet Pawn
  L1009:'fence-003',         // "Pawn Shop" a 0,10 de Salton Pawn Shop
  'gang-compound-001':'gang-operation-039' // PTT Youngin$ Compound = Illegal Goods Store, a 0,5 unidade
};

// Reclassificações. Chave: ID; valor: nova categoria.
export const reclassified = {
  'atm-194':'shop', 'atm-195':'shop', // caixas eletrônicos importados como banco
  L415:'workshop'                     // Pay 'n' Spray importado como receptador
};

// Nomes corrigidos. O nome importado continua pesquisável.
export const renames = {
  'gang-operation-008':{name:'Stash House', note:'Nome do menu do jogo. A fonte importada usa "Robbery Opportunity" e o cofre vizinho se chama Safe - Stash House.'},
  'gang-operation-009':{name:'M7 Compound · Nova Auto Junkyard'},
  'gang-operation-010':{name:'Weed Grow', note:'Identificado pelos cofres vizinhos Safe - Weed Grow e RV Safe - Weed Grow.'},
  'gang-operation-013':{name:'Biker Hideout', note:'Identificado pelo cofre vizinho Safe - Biker Hideout.'},
  'gang-operation-017':{name:'Illegal Sneaker Trade', note:'Identificado pelo cofre vizinho Safe - Illegal Sneaker Trade.'},
  'gang-operation-019':{name:'Parlor Apartments', note:'Identificado pelo cofre vizinho Safe - Parlor Apartments.'},
  'gang-operation-022':{name:'Saber Shipping · Guardia Brothers (1)', conflict:'A PowerPyx lista Saber Shipping Yard e Saber Shipping Facility. Os dois cofres vizinhos se chamam Saber Shipping Facility. Correspondência entre nome e pino não resolvida.'},
  'gang-operation-024':{name:'Saber Shipping · Guardia Brothers (2)', conflict:'A PowerPyx lista Saber Shipping Yard e Saber Shipping Facility. Os dois cofres vizinhos se chamam Saber Shipping Facility. Correspondência entre nome e pino não resolvida.'},
  'gang-operation-033':{name:'Walker Farm'}, 'gang-operation-034':{name:'Hog Stars Garage'},
  'gang-operation-036':{name:'Vespucci Mansion'}, 'gang-operation-037':{name:'Ocean Beach Lab'},
  'gang-operation-038':{name:'Industrial Weed Grow'}, 'gang-operation-041':{name:'Mill Station Radar Base'},
  'gang-operation-042':{name:'Watson Bay Safehouse'}, 'gang-operation-039':{name:'Illegal Goods Store · PTT Youngin$ Compound'},
  'gang-operation-016':{name:'La Perle Trap House'}, 'gang-operation-020':{name:'Kamar Devon Community Center'},
  'gang-operation-021':{name:'Southside Trap House'},
  'smash-n-grab-025':{name:'Akoya Jewelers', alias:'Ayoka Jewelers', conflict:'Open GTA 6 Map grafa "Ayoka". PowerPyx e GTA6Wiki usam "Akoya".'},
  'smash-n-grab-023':{alias:'Royal Jewelry', conflict:'PowerPyx e Open GTA 6 Map grafam "Roval". GTA6Wiki usa "Royal".'},
  'smash-n-grab-018':{name:'White Sands Jewelry Pawn', alias:'White Sand Jewelry Pawn'},
  L286:{name:'Receptador · Port Gellhorn (sem nome)', note:'Pino de receptador sem nome a 0,36 unidade da Buck’s Jewelry & Pawn. Função não confirmada.'},
  L1104:{name:'Compra de colecionáveis · Avery Pawn', note:'Pino de casa de penhores a 0,32 unidade da Avery Pawn. As casas de penhores compram cartas, dobrões e meteoritos.'}
};

// Áreas ausentes no catálogo importado, conforme GTA6Wiki e PowerPyx.
export const regions = {
  'smash-n-grab-030':'Belville · Leonard County', 'bank-017':'Leonard County',
  'gang-operation-001':'Mariana County', 'gang-operation-002':'Pelican Valley', 'gang-operation-003':'Pelican Valley',
  'gang-operation-010':'East Lummox County', 'gang-operation-012':'Leonard County', 'gang-operation-030':'Emerald Springs',
  'gang-operation-032':'Bonanza', 'gang-operation-036':'Rialto Islands', 'gang-operation-038':'Bobcat Key', 'gang-operation-041':'Grassrivers'
};

// Operações ilegais na ordem do menu do jogo (PowerPyx). checklist: conta para os 39 do 100%.
const gangGroups = {
  Kingfishers:['gang-operation-001','gang-operation-002','gang-operation-003'],
  'Kolts & Associates':['gang-operation-004','gang-operation-005','gang-operation-006','gang-operation-007','gang-operation-008'],
  M7:['gang-operation-009','gang-operation-010'],
  'La Polilla Negra':['gang-operation-011','gang-operation-042'],
  'Final Chapter':['gang-operation-012','gang-operation-013','gang-operation-034','gang-operation-014'],
  San4San:['gang-operation-015','gang-operation-016','gang-operation-017','gang-operation-018','gang-operation-019'],
  'PTT Youngin$':['gang-operation-021','gang-operation-020'],
  'The Guardia Brothers':['gang-operation-022','gang-operation-023','gang-operation-024'],
  'Outros criminosos':['gang-operation-025','gang-operation-041','gang-operation-038','gang-operation-026','gang-operation-028','gang-operation-029',
    'gang-operation-027','gang-operation-037','gang-operation-036','gang-operation-030','gang-operation-033','gang-operation-031','gang-operation-032']
};
export const gangOperations = {};
for (const [gang, ids] of Object.entries(gangGroups)) for (const id of ids) gangOperations[id] = {gang, checklist:true};
gangOperations['gang-operation-039'] = {gang:'PTT Youngin$', checklist:false, edition:'ultimate',
  note:'Exclusiva da Ultimate Edition. Não conta para o 100% nem para o menu de gangues.'};
gangOperations['gang-compound-002'] = {gang:'Drumboyz', checklist:false, note:'Fora da lista de 39 operações da PowerPyx. Mantido como relato da fonte.'};
gangOperations['gang-operation-046'] = {gang:'Independente', checklist:false, note:'Fora da lista de 39 operações. Relato com evidência incompleta na fonte.'};
gangOperations.L2453 = {gang:'Sem gangue publicada', checklist:false,
  note:'Esconderijo relatado pela GTA BOOM. A GTA6Wiki cita "Final Chapter: Abandoned MC Warehouse" em South Vice-Dale County, sem correspondência local confirmada.'};

// Receptadores conforme a PowerPyx. type: stolen (bolsas), vehicles, collectibles.
export const fences = {
  'fence-005':{type:'stolen', unlock:'Após "Lab Fees", capítulo 1. Indisponível depois do capítulo 1.', rates:'Narcóticos, joias e notas: muito baixo'},
  'fence-006':{type:'stolen', unlock:'Capítulo 1. Indisponível depois de "Swamped".', rates:'Narcóticos: baixo · joias e notas: muito baixo'},
  'fence-007':{type:'vehicles', unlock:'Após "Moses (Take A Vehicle to Moses)", capítulo 2. Continua após a história.', rates:'Somente veículos sem rastreador'},
  'fence-008':{type:'stolen', unlock:'Após "Slam Dunk (Find Painkillers)", capítulo 2. Fica temporariamente indisponível na história.', rates:'Narcóticos e joias: baixo · notas: muito baixo'},
  'fence-009':{type:'vehicles', unlock:'Após "Clonin’ Keys, Makin’ GS", capítulo 3. Continua após a história.', rates:'Carros de alto padrão com rastreador avançado'},
  'fence-012':{type:'stolen', unlock:'Capítulo 3, La Perle. Continua após a história.', rates:'Narcóticos: alto · joias e notas: médio'},
  'fence-013':{type:'stolen', unlock:'Capítulo 3, Little Cuba. Continua após a história.', rates:'Narcóticos: médio · joias e notas: alto'},
  'fence-001':{type:'collectibles', note:'Mesmo prédio da Vice City Pawn (Smash ’n’ Grab).'},
  'fence-002':{type:'collectibles', note:'A 0,14 unidade da Pawn Stash (Smash ’n’ Grab).'},
  'fence-003':{type:'collectibles', note:'A 0,20 unidade da Pawn City (Smash ’n’ Grab).'},
  'fence-004':{type:'collectibles', note:'Mesmo prédio da Hamlet Pawn (Smash ’n’ Grab).'},
  L1104:{type:'collectibles'}
};
export const fenceTypes = {stolen:'Bolsas: narcóticos, joias e notas marcadas', vehicles:'Veículos', collectibles:'Cartas, dobrões e meteoritos'};

// Restaurantes de fast food que a PowerPyx lista como Stick Ups (lojas assaltáveis).
export const fastFoodStickUps = new Set(['food-and-drink-011','food-and-drink-013','food-and-drink-017','food-and-drink-018','food-and-drink-019',
  'food-and-drink-020','food-and-drink-021','food-and-drink-022','food-and-drink-023','food-and-drink-024','food-and-drink-025',
  'food-and-drink-026','food-and-drink-027','food-and-drink-028','food-and-drink-029','food-and-drink-030','food-and-drink-031',
  'food-and-drink-032','food-and-drink-033']);

// Fatos de joalherias e penhores (GTA6Wiki, PowerPyx, PC Gamer).
export const storeFacts = {
  'smash-n-grab-027':{'Senha':'1680 durante o trabalho do Yasmani (corrente com crânio de búfalo). Fora dele, código aleatório: pergunte ao atendente.',
    'Cofre':'Pequeno escritório dos fundos. A caixa de gravação fica à esquerda do cofre.', 'Entrada':'Sem porta dos fundos segundo a GTA6Wiki.'},
  'smash-n-grab-011':{'Senha':'6815 durante o trabalho do Yasmani (anel de diamante). Fora dele, código aleatório: pergunte ao atendente.',
    'Cofre':'Canto nordeste da sala central.', 'Entrada':'Porta dos fundos. A Snap Gun abre sem barulho.'},
  'smash-n-grab-007':{'Senha':'0104 durante o trabalho do Yasmani (colar de ametista). Fora dele, o atendente informa a combinação.',
    'Cofre':'Meio do corredor longo dos fundos.', 'Entrada':'Porta dos fundos. A Snap Gun abre sem barulho.'},
  'smash-n-grab-034':{'Senha':'Aleatória por jogo. Relatos citam 5683 (PC Gamer) e 6499 (PowerPyx), o que confirma a variação.'}
};
// Faixas divergentes entre fontes. O valor do catálogo continua como principal.
export const valueConflicts = {
  'smash-n-grab-022':'GTA6Wiki (via GAMES.GG): US$ 14.000 – 35.000. PowerPyx e Open GTA 6 Map: US$ 14.000 – 25.000.',
  'smash-n-grab-023':'GTA6Wiki (via GAMES.GG): US$ 14.000 – 35.000. PowerPyx e Open GTA 6 Map: US$ 14.000 – 25.000.',
  'smash-n-grab-024':'GTA6Wiki (via GAMES.GG): US$ 14.000 – 35.000. PowerPyx e Open GTA 6 Map: US$ 14.000 – 25.000.'
};

// Regras por categoria. Os capítulos são apenas informativos.
export const categoryRules = {
  jewelry:{reqStatus:'known', infoRequires:['jewelry'], optional:['snapgun'], chapter:3,
    unlock:'Após “Yasmani’s Jewelry Jobs”, metade do capítulo 3.',
    fields:{'Alarme':'Desative o painel branco da sala dos fundos e destrua a gravação na caixa de CFTV.',
      'Senha':'Aleatória a cada assalto. Ameace o atendente e escolha “Safe Code?”, leia anotações ou use o Foco. Uma bomba adesiva abre o cofre com barulho.',
      'Conclusão':'Abra o cofre dos fundos. Apenas quebrar vitrines pode não contar.'},
    refs:[ppx.smash, wiki.jewelry, curationSources.snapGun]},
  pawn:{reqStatus:'known', infoRequires:['pawn'], chapter:2,
    unlock:'Após “Coffee Break”, metade do capítulo 2.',
    fields:{'Senha':'Aleatória a cada assalto. Ameace o atendente e escolha “Safe Code?”.',
      'Conclusão':'Abra o cofre dos fundos. Apenas quebrar vitrines pode não contar.',
      'Venda':'Casas de penhores também compram cartas, dobrões e meteoritos.'},
    refs:[ppx.smash, wiki.jewelry]},
  bank:{reqStatus:'known', requires:['bank'], infoRequires:['dyePack'], chapter:3,
    unlock:'Após “Credit Check (Meet Raul’s Crew)”, capítulo 3.',
    fields:{'Conclusão':'Gaveta do caixa e cofre pequeno.'}, refs:[ppx.bank]},
  bigbank:{reqStatus:'known', requires:['bank','vault'], infoRequires:['dyePack'], chapter:4,
    unlock:'Caixa e cofre pequeno após “Credit Check”. Cofre grande após “That’s Where The Money Is…”, fim do capítulo 4.',
    fields:{'Conclusão':'Cofre grande, gaveta do caixa e cofre pequeno.',
      'Cofre grande':'Siga um carro-forte até a agência. O cofre abre enquanto o segurança leva a maleta. O Yasmani vende dicas de carros-fortes por US$ 10.000.',
      'Procurado':'Quatro estrelas imediatas ao roubar o cofre grande.'}, refs:[ppx.bank]},
  payday:{reqStatus:'known', requires:['bank'], infoRequires:['dyePack'], chapter:3,
    unlock:'Após “Credit Check (Meet Raul’s Crew)”, o mesmo desbloqueio dos caixas de bancos.',
    fields:{'Conclusão':'Ameace o atendente, recolha o dinheiro do balcão e abra o cofre dos fundos.'}, refs:[ppx.payday, wiki.payday]},
  towatm:{reqStatus:'known', infoRequires:['winch','yasmaniJobs'],
    fields:{'Como fazer':'Arranque o caixa da parede com um veículo com guincho e atire nos estojos para pegar as notas marcadas.'}, refs:[ppx.fence]},
  gang:{fields:{'Conclusão':'Recolha todos os itens-chave indicados no ícone do mapa.',
    'Reaparecimento':'Volta a ficar disponível depois de um tempo longo, sem duração publicada.'}, refs:[ppx.gang, wiki.gang]},
  store:{fields:{'Conclusão':'O 100% pede 50 de 91 Stick Ups.'}, refs:[ppx.checklist]}
};
