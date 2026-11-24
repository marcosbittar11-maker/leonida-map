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
  'gang-compound-001':'gang-operation-039', // PTT Youngin$ Compound = Illegal Goods Store, a 0,5 unidade
  L190:'nightclub-001', L629:'nightclub-002', L308:'gas-station-001' // mesmo nome, 0,5 unidade, snapshot de lugares
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
  'gang-operation-022':{name:'Saber Shipping · Guardia Brothers (1)', conflict:'A PowerPyx lista Saber Shipping Yard e Saber Shipping Facility. Os dois cofres vizinhos se chamam Saber Shipping Facility. Correspondência entre nome e pino não resolvida. O Leonida Lab publica a senha 8046 para o cofre do Saber Shipping Yard, sem posição.'},
  'gang-operation-024':{name:'Saber Shipping · Guardia Brothers (2)', conflict:'A PowerPyx lista Saber Shipping Yard e Saber Shipping Facility. Os dois cofres vizinhos se chamam Saber Shipping Facility. Correspondência entre nome e pino não resolvida. O Leonida Lab publica a senha 8046 para o cofre do Saber Shipping Yard, sem posição.'},
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
export const fastFoodStickUps = new Set(['food-and-drink-001','food-and-drink-014','food-and-drink-011','food-and-drink-013','food-and-drink-017','food-and-drink-018','food-and-drink-019',
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
// Operações ilegais e cofres com fatos publicados. Resumo da GTA6Wiki, que cita PC Gamer, GAMES.GG e XboxPlay.
const gw = slug => 'https://gta6wiki.eu/map/gang-operation/' + slug + '/';
export const operationFacts = {
  'gang-operation-007':{refs:[gw('brooks-boatworks'),'https://www.pcgamer.com/games/grand-theft-auto/gta-6-brooks-boatworks-safe-code/'], fields:{
    'Senha':'6823. O mapa na parede do prédio cinza também mostra as senhas da La Cascara (6969) e da Kingpin Bowling (0300).',
    'Entrada':'Evite o portão vigiado. Use o portão destrancado à direita e a abertura na cerca. Suba ao telhado do galpão pelo elevador lateral.',
    'Itens-chave':'Dois cofres, comprimidos e o caminhão Smuggler Caracara no pátio. Lança-foguetes, bombas adesivas e granadas no andar de cima.',
    'Comprador':'Dunk'}},
  'gang-operation-027':{refs:[gw('chatfield-storage-logistics')], fields:{
    'Senha':'5800, no laptop dentro de um contêiner aberto.', 'Entrada':'Botão fora da cabine de segurança abre o portão.',
    'Itens-chave':'Cofre do escritório, pistola Quarter Mile ES9 e o Progen Purple Drank Emerus em outro contêiner.',
    'Veículo':'Emerus destrancado, sem alarme e sem rastreador. O cartão do jogo indica revenda de US$ 32.945 e registro de US$ 29.900.'}},
  'gang-operation-041':{refs:[gw('criminals-mill-station-radar-base')], fields:{'Itens-chave':'Drogas e um item experimental que aumenta a saúde de Jason ou Lucia permanentemente.'}},
  'gang-operation-033':{refs:[gw('criminals-walker-farm')], fields:{'Tipo':'Fazenda de cogumelos', 'Hostis':'Fortemente vigiada'}},
  'gang-operation-012':{refs:[gw('farm-fix-meth-lab')], fields:{
    'Senha':'2121, em uma anotação na bancada da sala de embalagem.', 'Cofre':'Escritório no fim do andar de cima.',
    'Entrada':'Evite o portão principal. Entre pela cerca quebrada no canto sudeste e siga até a porta dos fundos.',
    'Itens-chave':'Escopeta Throttler Verro no armário da sala de TV (dois guardas), cofre e moto Western Searing Zombie Bobber abaixo do escritório.'}},
  'gang-operation-018':{refs:[gw('janjaks-garage')], fields:{
    'Senha':'4444, na anotação da geladeira. Cerca de US$ 2.200 no cofre do escritório.',
    'Entrada':'Pelo telhado: pilha de pneus e toldo azul ao lado da porta principal.',
    'Itens-chave':'Fuzil KZ-59 no estojo ao lado da TV, cofre e o Declasse Pink Gin Tulip na oficina.', 'Procurado':'Um assalto barulhento sobe o nível de procurado rapidamente.'}},
  'gang-operation-004':{refs:[gw('kingpin-bowling'),'https://www.powerpyx.com/gta-6-all-illegal-gang-operations-locations/'], fields:{
    'Senha':'0300. Cerca de US$ 3.400 no cofre do escritório nordeste.',
    'Itens-chave':'Cofre, escopeta Gutterball Moreland 850 na mesa de sinuca (canto nordeste) e relógio Crowex Octane ‘Orca’ na sala sudeste.',
    'Procurado':'Duas estrelas ao terminar.', 'Missão':'Também é a missão opcional “Hit Kingpin Bowling”, depois de “Coffee Break”.'}},
  'gang-operation-006':{refs:[gw('la-cascara-motel'),'https://www.pcgamer.com/games/grand-theft-auto/gta-6-brooks-boatworks-safe-code/'], fields:{
    'Senha':'6969. Cofre no 4º andar, na sala seguinte à da submetralhadora.',
    'Itens-chave':'Submetralhadora Scrapper VF5C (4º andar, primeiro quarto, dois guardas), cofre e o Vapid Firebug Dominator na frente.',
    'Outros itens':'Maconha, comprimidos, dinheiro e bombas adesivas no 1º, 3º e 4º andares. Leve o parceiro: o saque passa de duas bolsas.',
    'Comprador':'Dunk'}},
  'gang-operation-009':{refs:[gw('m7-nova-auto-junkyard')], fields:{
    'Senha':'7777, pintada na parede atrás do cofre.', 'Cofre':'Escritório de persiana branca, perto do ônibus escolar amarelo no canto sudeste.'}},
  'gang-operation-015':{refs:[gw('sound4sond-studio')], fields:{
    'Senha':'Sem código publicado. Use bomba adesiva no cofre da cabine de gravação.',
    'Itens-chave':'Buckingham Bourbon Windsor no estúdio de fotos, dinheiro perto do fundo verde, Purple Drank no lounge e fuzil San4San K17 no depósito.',
    'Veículo':'Windsor destrancado, sem alarme e sem rastreador.'}},
  'gang-operation-002':{refs:[gw('sunrise-rv-park')], fields:{
    'Senha':'6769 no cofre do prédio do cais (bloco de notas no local). O cofre do escritório não tem código publicado.',
    'Comprador':'Brian no capítulo 1 ou Dunk depois.'}}
};
// Senhas repassadas aos cofres individuais do mesmo complexo.
export const safeFacts = {
  'safe-009':{'Senha':'6969', 'Local exato':'4º andar da La Cascara Motel'},
  'safe-015':{'Senha':'0300', 'Local exato':'Escritório nordeste da Kingpin Bowling'},
  'safe-036':{'Senha':'7777, pintada na parede atrás do cofre'},
  'safe-022':{'Senha':'4444, anotação na geladeira'},
  'safe-012':{'Senha':'2121, anotação na bancada da sala de embalagem'},
  'safe-028':{'Senha':'5800, laptop no contêiner aberto'},
  'safe-038':{'Senha':'Sem código publicado'},
  'safe-017':{'Senha':'Sem código publicado. Bomba adesiva.'}
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
    fields:{'Conclusão':'Gaveta do caixa e cofre pequeno.', 'Senha':'Aleatória. Ameace os funcionários até um deles entregar o código do cofre pequeno.'}, refs:[ppx.bank, 'https://leonidalab.com/safe-codes/']},
  bigbank:{reqStatus:'known', requires:['bank','vault'], infoRequires:['dyePack'], chapter:4,
    unlock:'Caixa e cofre pequeno após “Credit Check”. Cofre grande após “That’s Where The Money Is…”, fim do capítulo 4.',
    fields:{'Conclusão':'Cofre grande, gaveta do caixa e cofre pequeno.',
      'Cofre grande':'Siga um carro-forte até a agência. O cofre abre enquanto o segurança leva a maleta. O Yasmani vende dicas de carros-fortes por US$ 10.000.',
      'Senha':'Cofre pequeno: aleatória, obtida ameaçando os funcionários. Cofre grande: sem código; não pode ser arrombado nem explodido.',
      'Procurado':'Quatro estrelas imediatas ao roubar o cofre grande.'}, refs:[ppx.bank, 'https://leonidalab.com/safe-codes/']},
  payday:{reqStatus:'known', requires:['bank'], infoRequires:['dyePack'], chapter:3,
    unlock:'Após “Credit Check (Meet Raul’s Crew)”, o mesmo desbloqueio dos caixas de bancos.',
    fields:{'Conclusão':'Ameace o atendente, recolha o dinheiro do balcão e abra o cofre dos fundos.', 'Senha':'Aleatória. Ameace o atendente até ele entregar o código.'}, refs:[ppx.payday, wiki.payday, 'https://leonidalab.com/safe-codes/']},
  towatm:{reqStatus:'known', infoRequires:['winch','yasmaniJobs'],
    fields:{'Como fazer':'Arranque o caixa da parede com um veículo com guincho e atire nos estojos para pegar as notas marcadas.'}, refs:[ppx.fence]},
  gang:{fields:{'Conclusão':'Recolha todos os itens-chave indicados no ícone do mapa.',
    'Reaparecimento':'Volta a ficar disponível depois de um tempo longo, sem duração publicada.'}, refs:[ppx.gang, wiki.gang]},
  store:{fields:{'Conclusão':'O 100% pede 50 de 91 Stick Ups.'}, refs:[ppx.checklist]}
};
