const fences = 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-fence-locations/';
const money = 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-how-to-make-money/';
const crab = 'https://www.gta-companion.com/guides/crab-lab';
const apollo = 'https://www.gtaboom.com/gta-6-apollo-aggregates-warehouse-stash-5820';
const boatworks = 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-brooks-boatworks-safe-code/';
const cars = 'https://www.pcgamer.com/games/grand-theft-auto/gta-6-how-to-steal-cars/';
const stages = 'https://gta6collectiblesmap.com/articles/gta-6-collectibles-by-chapter';

export const checked = '2026-11-24';

export const guides = {
  'safe-070': {
    name:'Laboratório do Caranguejo', region:'Pelican Valley', kind:'easter', chapter:1, requires:['boat'],
    intro:'Posto de pesquisa no pântano. O cofre e a cabana do cais fazem parte da mesma visita.',
    fields:{'Entrada':'Atracação do posto de pesquisa', 'Computador':'CLEAVES', 'Cofre':'0072 · dobro da amostra 0036', 'Cabana no cais':'0212',
      'Itens':'Crabshack VF5 SMG, notas marcadas e dinheiro no cofre', 'Valor relatado':'US$ 8.000 a 10.000 em notas marcadas conforme o relato, mais cerca de US$ 1.100 no cofre em uma fonte. Cotação de venda variável.',
      'Hostis':'Um caranguejo gigante embosca o jogador ao sair do computador.'},
    steps:['Ligue a energia no interruptor externo e acesse o PC.', 'Confira a prancheta no galpão dos tanques. Use o código no cofre.', 'Leia o código da cabana e siga pelo cais até a arma.'],
    refs:[crab,'https://www.youtube.com/watch?v=A-E1UTahD-A','https://games.gg/grand-theft-auto-vi/guides/gta-6-crabshack-vf5-location-how-to-get-smg-variant/']
  },
  L2453:{
    name:'Armazém Apollo Aggregates', region:'Leste de Hamlet · Peregrine Bay', kind:'gang', chapter:1, requires:['cargo'],
    intro:'Armazém vermelho perto dos três tanques retangulares, em South Vice-Dale County.',
    fields:{'Entrada':'Porta cinza ao lado do trailer Apollo', 'Cofre':'Sobre o arquivo do segundo escritório, perto dos armários',
      'Senha':'Use a abertura manual no cofre', 'Hostis':'Nenhum confronto no teste da fonte', 'Itens':'Notas marcadas, cocaína e carta prateada de Leroy Rook',
      'Reaparecimento':'Parcial. Tempo normal sem medição publicada na fonte.', 'Cotação observada':'US$ 12.720 com Brian ou US$ 14.400 com Donnie no teste, sem incluir a carta.'},
    steps:['Recolha as bolsas da mesa e procure nos escritórios e nas duas vans.', 'Arrombe o cofre do segundo escritório e confira as duas prateleiras.', 'Guarde as bolsas no veículo e compare compradores disponíveis no seu jogo.'],
    reward:[12720,14400], repeatable:true, noGunfire:true, refs:[apollo]
  },
  'liquor-store-002':{
    name:'Arara da Three Sheets Liquor', kind:'easter', chapter:1, requires:['shirley'],
    intro:'Evento Strange Noises no quintal da loja em Key Lento.',
    fields:{'Entrada':'Pule o muro lateral, perto da oficina', 'Itens':'Cerca de US$ 1.300 na ventilação, mais o cofre da loja como opcional',
      'Hostis':'Guardas no quintal. Há relatos de polícia após o confronto.'},
    steps:['Entregue o rum à Shirley e volte à loja quando o evento aparecer.', 'Passe pelo quintal e converse com a arara na gaiola.', 'Confira a abertura de ventilação ao lado do gerador.'],
    reward:[1300,1300], repeatable:false,
    refs:['https://www.youtube.com/watch?v=Ngzt099fH9M&t=125s','https://gta6data.com/gta-6-strange-noises-guide-find-three-sheets-and-check-the-rear-yard/']
  },
  'weapon-spawn-013':{
    name:'Kingfishers Laird 350', chapter:3, region:'Manatee Motel · Pelican Valley',
    intro:'Fuzil de precisão especial com acessórios no motel abandonado.',
    fields:{'Item':'Kingfishers Laird 350', 'Local exato':'Estojo no quarto seguinte ao do animal', 'Hostis':'Tigre relatado no local'},
    steps:['Localize o quarto do ataque.', 'Siga com a parede à direita até a porta aberta seguinte e procure o estojo.'],
    refs:['https://clutchbase.app/gta6/guides/gta-6-secrets-easter-eggs']
  },
  'safe-004':{
    name:'Cofre de Brooks Boatworks', chapter:2,
    intro:'Galpão ao norte de Port Gellhorn. Há dinheiro, medicamentos e uma carabina no complexo.',
    fields:{'Entrada':'Portão destrancado à direita, depois pela abertura na cerca', 'Cofre':'Galpão principal, sala com mesa de sinuca', 'Senha':'6823', 'Hostis':'Guardas armados', 'Equipamentos':'Arma recomendada no guia, furtividade possível'},
    steps:['Passe pelo prédio menor e examine o mapa na parede atrás da carabina Clunker.', 'Suba pelo elevador lateral do armazém e use a abertura no telhado.', 'Desça até a sala da mesa de sinuca e abra o cofre.'],
    refs:[boatworks]
  },
  'bank-001':{
    chapter:3, requires:['bank'], intro:'Agência na SW 4th Street, Vice Beach. Assalto ao caixa e ao cofre pequeno.',
    fields:{'Entrada':'Entrada da agência para acessar o caixa', 'Equipamentos':'Arma para a abordagem ao caixa', 'Valor bruto comunitário':'US$ 10.000 a 30.000. Venda de itens e custos podem alterar o resultado.'},
    reward:[10000,30000], refs:[stages,money]
  },
  'bank-006':{
    chapter:3, requires:['bank'], intro:'Agência Fleeca em Key Lento, modalidade de caixa.',
    fields:{'Valor bruto comunitário':'US$ 5.000 a 20.000. O total recebido pode variar.'},
    reward:[5000,20000], refs:[stages,'https://timesaver.gg/tools/gta-6/money']
  },
  'fence-005':{
    name:'Depósito do Brian', chapter:1, requires:['brian'], repeatable:true, noGunfire:true,
    intro:'Ponto de entrega em Key Lento para bolsas com contrabando, joias e notas marcadas.',
    fields:{'Desbloqueio':'Depois de Lab Fees', 'Pagamento':'Cotação variável por tipo de mercadoria'},
    steps:['Confira o valor no seu mapa do jogo e leve a bolsa ao depósito.'], refs:[fences,apollo]
  },
  'fence-006':{
    chapter:1, requires:['donnie'], repeatable:true, noGunfire:true,
    intro:'Ponto de entrega em Key Lento. Verifique se o comprador está ativo no seu save.',
    fields:{'Desbloqueio':'Depois de Clean Up After Donnie', 'Entrega':'Caixa de ferramentas junto ao trailer', 'Pagamento':'Aguarde a mensagem e confira a caixa de correio.'},
    refs:[fences,apollo]
  },
  'fence-007':{
    chapter:2, requires:['moses'], repeatable:true, noGunfire:true,
    intro:'Compra veículos discretos sem rastreador e presta serviços de oficina em Port Gellhorn.',
    fields:{'Desbloqueio':'Missão do Moses no capítulo 2', 'Reaparecimento':'Intervalo entre vendas relatado. Duração desconhecida.'},
    steps:['Confira o rastreador e leve o carro à oficina para cotação.'], refs:[fences,money,cars]
  },
  'fence-009':{
    chapter:3, requires:['randy'], repeatable:true, noGunfire:true,
    intro:'Receptador de carros de alto padrão em Balsero, Vice City.',
    fields:{'Desbloqueio':'Após a entrega do Zorrusso', 'Equipamento para carros compatíveis':'Clonador de chaves', 'Pagamento':'Varia com o modelo e o estado do veículo.'},
    refs:[fences,money,cars]
  },
  'vehicle-request-013':{
    name:'Granforma Zorrusso · entrega inicial', chapter:3, equipmentReward:'Clonador de chaves', repeatable:false,
    intro:'O carro da entrega inicial fica na garagem do Hathaway Apartments, Ocean Beach.',
    fields:{'Modelo':'Granforma Zorrusso', 'Aparecimento':'Durante a missão, no nível da rua, lado leste da garagem',
      'Receptador':'Randy', 'Clonador':'Obtido e instalado durante a própria missão', 'Rastreador':'Avançado',
      'Pagamento da missão':'US$ 21.250, com bônus de até US$ 10.000 pelo estado. Valor de revenda livre desconhecido.'},
    steps:['Instale o clonador pelo telefone seguindo o objetivo.', 'Encontre o Zorrusso e clone a chave.', 'Entregue a Randy e preserve o estado do carro.'],
    reward:[21250,31250], refs:['https://gtavitips.com/story/missions/steal-the-zorrusso-for-randy','https://www.youtube.com/watch?v=j2HmRXz7htA&t=153s',cars]
  },
  'pay-n-spray-002':{
    chapter:3, noGunfire:true, repeatable:true,
    intro:'Oficina em Key Lento, ao lado da Three Sheets Liquor.',
    fields:{'Serviços':'Reparo, pintura e registro', 'Veículos':'O catálogo relata compra de carros com rastreador padrão.'}, refs:[cars,'https://timesaver.gg/tools/gta-6/money']
  },
  'smash-n-grab-007':{
    chapter:3, requires:['jewelry'], intro:'Joalheria em Vice City. As vitrines e o cofre são alvos da atividade.',
    fields:{'Valor bruto comunitário':'US$ 14.000 a 25.000', 'Senha':'Atendente pode informar a combinação durante a abordagem.', 'Câmeras e alarmes':'Gravador na mesa e teclado na parede da sala marcada Office.', 'Equipamentos':'Máscara recomendada no teste da fonte.'},
    steps:['Peça o código no balcão.', 'Encontre a sala Office ao lado do quadro de veleiro e use o gravador e o teclado.', 'Recolha os itens das vitrines e confira o cofre.'], reward:[14000,25000],
    refs:['https://www.gtaboom.com/gta-6-donovan-banks-robbery-guide-e5bb',stages]
  }
};

export const leads = [
  { name:'Armazém abandonado · outra identificação', note:'O relato a norte de Hamlet difere do guia de Apollo, que aponta o leste. A equivalência continua em aberto. O armazém Apollo tem seu próprio pino.', chapter:1, refs:['https://clutchbase.app/gta6/guides/gta-6-secrets-easter-eggs'] }
];

const mosesGuide='https://www.pushsquare.com/guides/gta-6-moses-vehicle-drop-off-locations';
const mosesPayouts='https://asknpc.com/gta6/en/moses-randy-vehicle-lists';
const randyGuide='https://www.pushsquare.com/guides/gta-6-randys-wish-list-vehicle-locations';
const resaleSource='https://thebestmods.com/gta-6/best-cars-to-sell/';

function mosesVehicle(place,how,basePay,fields={},extra=[]) {
  return {
    chapter:2, requires:['moses','slim'], repeatable:false,
    intro:'Encomenda do Moses. Aguarde a mensagem correspondente antes de ir ao local.',
    fields:{'Aparecimento':place,'Receptador':'Moses','Clonador':'Dispensado nesta atividade',
      'Pagamento de entrega':'Cerca de US$ '+new Intl.NumberFormat('pt-BR').format(basePay)+' de base, conforme a fonte. O estado pode alterar a cotação.',...fields},
    steps:[how,'Leve o veículo à oficina do Moses em Port Gellhorn.'],
    reward:[basePay,basePay], refs:[mosesGuide,mosesPayouts,...extra]
  };
}
function randyVehicle(place,how,fields={},extra=[]) {
  return {
    chapter:3, requires:['randy','cloner','waink'], repeatable:false,
    intro:'Veículo da lista de Randy. Compare a posição comunitária com a dica ativa e a leitura do WAiNK.',
    fields:{'Aparecimento':place,'Receptador':'Randy em Balsero','Clonador':'Necessário conforme o guia',...fields},
    steps:[how,'Entregue a Randy e preserve a condição do carro.'], refs:[randyGuide,cars,...extra]
  };
}
Object.assign(guides,{
  'vehicle-request-001':mosesVehicle('Garagem isolada em Rockledge Rd, a leste de Grayson.',
    'Procure a pista no trailer e use o teclado da porta lateral. Abra a persiana por dentro e saia com o carro.',4200,
    {'Senha da garagem':'2727','NPCs':'Moradores armados na propriedade, segundo o relato.'},['https://www.pcgamer.com/games/grand-theft-auto/gta-6-declasse-vamos-code/']),
  'vehicle-request-003':mosesVehicle('Galpão Postal no sul das docas de Draper Island.',
    'Use a porta do escritório perto dos trilhos. Ligue o carro antes de levantar a persiana.',1500,{'NPCs':'Portão principal vigiado.'}),
  'vehicle-request-005':mosesVehicle('Sede do clube de motoqueiros em Birch St, Ambrosia.',
    'Procure a moto no piso térreo do galpão central e prepare a saída antes de pegá-la.',6310,{'NPCs':'Motoqueiros no complexo.'}),
  'vehicle-request-007':mosesVehicle('Sobre uma plataforma de reboque em Bastion St, Port Gellhorn.',
    'O motorista pode sair após a leitura do WAiNK. Libere a picape da plataforma para a entrega.',1850,{'NPCs':'Motorista do reboque.'}),
  'vehicle-request-009':mosesVehicle('Pátio de uma casa em Orchard Ave, ao sul da oficina.',
    'Use a bola para distrair o cão e abra o veículo com o Slim Jim.',1400,{'NPCs':'Cão de guarda.'}),
  'vehicle-request-010':mosesVehicle('Trilhas de terra no nordeste de Buckskin Swamp.',
    'Identifique o buggy em movimento com o WAiNK antes de abordar.',3350,{'NPCs':'Veículo conduzido por um NPC.'}),
  'vehicle-request-006':randyVehicle('Garagem da propriedade em Flamingo Pkwy, Waning Sands.',
    'Localize a garagem junto à casa e prepare uma saída antes de clonar a chave.'),
  'vehicle-request-011':{
    ...randyVehicle('Garagem da delegacia de Crosstown, NW 9th Street.',
      'Passe pelo portão do estacionamento e suba ao 7º nível. Clone a chave e verifique a rampa do terraço como saída.',
      {'Rastreador':'Avançado','NPCs':'Policiais no acesso','Revenda livre':'Cerca de US$ 17.000, valor comunitário de referência. Confirme comprador e cotação pelo WAiNK.'},[resaleSource]),
    resale:[17000,17000]
  },
  'vehicle-request-012':randyVehicle('Docas no oeste de Waxman Island, em depósito cercado.',
    'Procure o carro amarelo junto ao contêiner vermelho e confira se a encomenda está ativa.',{},[mosesPayouts]),
  'vehicle-request-015':randyVehicle('Garagem de mansão em Palladia Ln, Peacock Estates.',
    'Aproxime-se pelo caminho junto à água, clone a chave e abra a saída da garagem.',{},[mosesPayouts]),
  'vehicle-request-016':randyVehicle('Ferro-velho em Galerina St, Hamlet.',
    'Verifique o portão de saída e siga pela lateral direita do ferro-velho.',
    {'NPCs':'Área de operação de gangue.'},[mosesPayouts])
});

export function bankSummary(point) {
  if (point.kind !== 'bank') return undefined;
  const mode = /Robbery:\s*(Teller|Vault)/i.exec(point.description)?.[1];
  const value = /Take value:\s*\$([\d,]+)\s*[-–]\s*\$([\d,]+)/i.exec(point.description);
  if (!mode || !value) return undefined;
  const reward = value.slice(1).map(n=>Number(n.replaceAll(',','')));
  const vault = mode === 'Vault';
  const amount = new Intl.NumberFormat('pt-BR');
  return {
    summary:true, reward,
    intro:vault?'Grande banco: cofre grande, gaveta do caixa e cofre pequeno.':'Banco pequeno: gaveta do caixa e cofre pequeno.',
    fields:{'Modalidade':vault?'Cofre grande':'Caixa', 'Valor bruto comunitário':'US$ '+amount.format(reward[0])+' a '+amount.format(reward[1]),
      'Equipamentos':'Dye Pack Jammer para vender as notas marcadas', 'Segurança':({'low':'Baixa','medium':'Média','high':'Alta'})[/Security:\s*(\w+)/i.exec(point.description)?.[1]?.toLowerCase()]||'Desconhecida'},
    refs:[stages,'https://as.com/meristation/guia_pagina/como-ganar-dinero-rapido-en-gta-6-y-cuales-son-las-mejores-actividades-para-conseguirlo_n/']
  };
}

guides['smash-n-grab-034'] = {
  chapter:2,
  intro:'Uma das opções de assalto do começo do capítulo 2, em Port Gellhorn.',
  fields:{'Entrada':'Entrada principal da Avery Pawn', 'Senha':'Variável conforme a partida. Fale com o atendente indicado pelo jogo.',
    'Cofre':'Escritório à direita na sala atrás do caixa', 'Equipamentos':'Arma para abordagem e máscara recomendada no relato',
    'Hostis':'Há um funcionário nos fundos.', 'Valor bruto comunitário':'US$ 1.000 a 10.000'},
  steps:['Procure a opção de perguntar pelo código no balcão.', 'Passe atrás do caixa, entre no escritório e use o código informado.'],
  reward:[1000,10000],refs:['https://www.pcgamer.com/games/grand-theft-auto/gta-6-pawn-shop-safe-code/']
};
guides['unique-weapon-036'] = {
  chapter:1, kind:'weapon', region:'Pântano a sudoeste de Hamlet',
  intro:'Fuzil gratuito próximo à cabana de um caçador. O vídeo o inclui na rota de início de jogo.',
  fields:{'Item':"Cruel Huntsman's SM-69", 'Local exato':'Passarela entre as duas construções, junto aos jacarés mortos.'},
  steps:['Localize a cabana isolada no pântano e procure o fuzil no deque.'],
  refs:['https://www.youtube.com/watch?v=WdBiy0xsf6o','https://www.gta6heists.com/money/free-guns']
};

export const officialPlaces = new Set(['city-town-001','city-town-008','city-town-009','landmark-008','landmark-019','landmark-020']);
export const rockstarPlaces = 'https://www.rockstargames.com/VI';


function trackedResale(place,price,advanced) {
  return {
    chapter:3, requires:['waink',advanced?'advancedShop':'standardShop',...(advanced?['cloner']:[])],
    intro:'Ponto de aparecimento comunitário. A cotação é uma referência do modelo e depende do estado, do comprador e do save.',
    fields:{
      'Aparecimento':place, 'Rastreador relatado':advanced?'Avançado':'Padrão',
      'Comprador':'Pay ’n’ Spray habilitada para o tipo de rastreador',
      'Valor aproximado':'US$ '+new Intl.NumberFormat('pt-BR').format(price)
    },
    steps:['Use o WAiNK para conferir o rastreador e a cotação do carro encontrado.'],
    resale:[price,price],refs:[resaleSource,cars]
  };
}
guides['standout-vehicle-087']=trackedResale('Exemplar vermelho na marcação comunitária do catálogo.',12000,false);
guides['standout-vehicle-123']=trackedResale('Garagem em um beco de Ocean Beach, segundo a fonte das coordenadas.',17000,true);

const ultimateURL='https://www.rockstargames.com/VI/add-ons/ultimate-edition';
const modsURL='https://www.gamesradar.com/games/grand-theft-auto/gta-6-ultimate-edition-pre-order-bonuses/';
Object.assign(guides,{
  'vehicle-mod-shop-001':{
    chapter:1, requires:['ultimate'], noGunfire:true, region:'Crosstown · Vice City',
    intro:'Oficina de personalização para donks.',
    fields:{'Especialidade':'Interior, rodas e acabamento','Acesso':'Ultimate Edition'},
    steps:['Na seção de veículos do mapa do jogo, abra a lista de oficinas para definir o destino.'], refs:[ultimateURL,modsURL]
  },
  'vehicle-mod-shop-015':{
    chapter:1, requires:['ultimate'], noGunfire:true, region:'Norte do lago Leonida',
    intro:'Oficina de preparação para veículos fora de estrada.',
    fields:{'Especialidade':'Pintura artesanal e personalização off-road','Acesso':'Ultimate Edition'},
    refs:[ultimateURL,modsURL]
  },
  'vehicle-mod-shop-006':{
    chapter:1, noGunfire:true,
    intro:'Oficina em Key Lento usada para reparos e personalização no início do jogo.',
    fields:{'Especialidade':'Peças e estética retrô','Pacote Ganado Retro Build':'Disponível com Ultimate Edition conforme a fonte.'},
    refs:['https://www.gamesradar.com/games/grand-theft-auto/gta-6-chapter-1-walkthrough/6/',modsURL]
  }
});

