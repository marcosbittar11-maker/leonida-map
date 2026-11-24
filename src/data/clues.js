// Pistas sem pino, escritas à mão a partir de guias editoriais. Nenhuma coordenada foi inventada:
// as fontes só descrevem áreas de busca e prédios, e o app não tem geometria de área.
// Textos próprios e resumidos. Consulta de 24/11/2026.
const powerpyx = 'https://www.powerpyx.com/gta-6-all-kitty-litter-lab-locations/';
const precision = 'Pista sem pino. A fonte mostra só a área de busca roxa no mapa do jogo e não publica coordenadas.';
const reward = 'US$ 2.000 ou 2.500 do Tyrone, via BuckMe, ao destruir o laboratório';
const lab = (slug, name, region, how, access, pay) => ({
  id:'clue-kitty-' + slug, kind:'kitty', name:'Kitty Litter · ' + name, type:'Kitty Litter lab', region, x:null, y:null, evidence:'clue',
  description:'', sources:[powerpyx], collection:'clue',
  fields:{'Área de busca':region, 'Como reconhecer':how, ...(access ? {'Acesso':access} : {}), 'Recompensa':pay || reward, 'Precisão da posição':precision}
});

export default {
  checked:'2026-11-24',
  note:'A PowerPyx afirma 14 laboratórios e lista 13. Os 13 listados estão aqui, todos como pista sem pino.',
  created:[
    lab('historia', 'Laboratório da história', 'Sem área nomeada', 'Trailer no bloco central-sul da área de busca, com fumaça rosa saindo do teto e dois guardas do lado de fora.', null, 'US$ 2.000'),
    lab('balsero-1', 'Balsero 1', 'Balsero', 'Garagem de um prédio na borda norte da área de busca, com cerca de três inimigos.', null, 'US$ 2.000'),
    lab('balsero-2', 'Balsero 2', 'Balsero', 'Garagem do prédio no meio da área de busca.', 'Teclado com código 1999, mostrado num cartaz ao lado.', 'US$ 2.500'),
    lab('balsero-3', 'Balsero 3', 'Balsero', 'Segundo trailer mais ao sul, com um guarda e a van Spin on This na frente.', 'Snap Gun ou arrombar a porta.', 'US$ 2.500'),
    lab('central-rockridge-1', 'Central Rockridge 1', 'Central Rockridge', 'Garagem no centro da área de busca, mais escura que os prédios vizinhos.', 'Entrada pelo beco a oeste.', 'US$ 2.500'),
    lab('crosstown-1', 'Crosstown 1', 'Crosstown', 'Apartamento no segundo andar do prédio ao norte, com van Spin on This e contêineres rosa na porta.', 'Arrombar a porta.', 'US$ 2.000'),
    lab('crosstown-2', 'Crosstown 2', 'Crosstown', 'Garagem nos fundos do prédio da Cross My Heart Tattoos.', null, 'US$ 2.500'),
    lab('crosstown-3', 'Crosstown 3', 'Crosstown', 'Garagem no lado leste do prédio central da área de busca.', null, 'US$ 2.500'),
    lab('decor-district-1', 'Decor District 1', 'Decor District', 'Garagem de um prédio no canto noroeste da área de busca, ao lado da rodovia.', null, 'US$ 2.500'),
    lab('little-cuba-1', 'Little Cuba 1', 'Little Cuba', 'Prédio longo no centro da área de busca.', 'Snap Gun ou arrombar a porta.', 'US$ 2.500'),
    lab('salton-1', 'Salton 1', 'Salton', 'Prédio de apartamentos que ocupa toda a área de busca.', 'Janela aberta no lado leste leva ao apartamento trancado.', 'US$ 2.000'),
    lab('tequesta-1', 'Tequesta 1', 'Tequesta', 'Andar de cima do motel em C, no prédio leste.', 'Snap Gun ou arrombar a porta.', 'US$ 2.500'),
    lab('vice-dale-1', 'Vice-Dale 1', 'Vice-Dale', 'Trailer no centro exato da área de busca.', 'Portas externas trancadas. Entre pela janela do lado leste.', 'US$ 2.500'),
    {
      id:'clue-wreck-ocio', kind:'underwater', name:'Nuestra Señora del Ocio', type:'Shipwreck', region:'Key Lento', x:null, y:null, evidence:'clue', description:'',
      sources:['https://game-checklists.com/gta6/underwater-discoveries-checklist/', 'https://www.dexerto.com/wikis/gta-6/underwater-discovery-locations/'], collection:'clue',
      fields:{'Tipo':'Naufrágio', 'Pista':'A leste de Key Lento, depois da ilha pequena a nordeste da loja do Kenton.',
        'Profundidade':'Não documentada nas fontes consultadas.',
        'Precisão da posição':'Pista sem pino. Nenhuma fonte consultada publica coordenadas deste naufrágio, e ele não aparece entre os tesouros do Kenton.'}
    }
  ]
};
