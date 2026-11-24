# Progresso da entrega

## Versão 1.8.0 · 24/11/2026 · colecionáveis e pontos ausentes

**Mudanças**
- **147 pinos novos** do Gameta: 41 Tesouros do Kenton, 21 ATMs, 2 ATMs rebocáveis, 36 carregadores, 32 pontos de ônibus, 10 contatos (categoria nova) e 5 naufrágios com posição aproximada. A leitura foi só textual, sem executar o JavaScript da página, e só de fatos. A calibração usou 873 pares e deu mediana de 0,075 unidade nos pares reservados. [COVERAGE.md](COVERAGE.md) · [audit/GAMETA.md](audit/GAMETA.md)
- **55 flamingos de cocaína** reclassificados. Já estavam no snapshot como "Hidden package" em Drogas. IDs, favoritos e conclusões preservados. Drogas e contrabando passou de 71 para 16.
- **14 pistas sem pino:** 13 laboratórios de Kitty Litter (áreas de busca, sem coordenadas) e o naufrágio Nuestra Señora del Ocio. Aparecem na busca global, e a categoria de Kitty Litter fica desabilitada nos filtros, com a nota "Só pistas por área, sem pino".
- **Fichas.** Selo "Fonte única · posição calibrada" para os pinos do Gameta, "Posição aproximada" nos naufrágios (com o campo "Precisão da posição") e "Pista sem posição" nas pistas. O botão de grupo ignora categorias só de pistas.
- **Categorias.** `kitty` e `contact` novas, com símbolos próprios. Kenton passou a se chamar "Tesouros do Kenton". Flamingos, Kenton e Subaquáticas deixaram de ser "pendentes".
- **Importador incremental.** `node scripts/import-gameta.mjs` gera `src/data/gameta.js` e `audit/GAMETA.md`. É idempotente (mesmo hash em duas execuções), calcula e valida a transformação a cada execução e não toca o snapshot. Aceita `--from <pasta>` para repetir sem rede.
- **Sem importação.** Alvos do Bret (PushSquare 403), tablets, garagens e os flamingos sem coordenadas da GTA6Wiki e da ViceCityDB.

**Testes**
- `npm test`: 28 de 28. Casos novos: transformação validada, deduplicação por tipo (nada novo a menos de 0,5 unidade de ponto existente nem de ATM sobre rebocável), IDs determinísticos e únicos, 41 tesouros em 7 locais, naufrágios aproximados, pistas sem pino, flamingos e IDs do snapshot preservados.
- E2E (`tests/app.e2e.js`, Chrome desktop e WebKit iPhone 15): 43 de 43. Cobrem filtro e contador do Kenton, conclusão com persistência após recarregar, busca global com tudo desligado, pistas, naufrágio aproximado, flamingos, ATMs, carregadores, contatos e o PWA offline já existente.
- Não repetidos: `tests/vehicles.e2e.js` e `vehicles.test.mjs` (veículos não mudaram). Não testado em iPhone físico.

**Limitações**
- Os 147 pinos têm fonte única. O Gameta não publica licença; ver [FONTES.md](FONTES.md).
- Não há geometria de área no app: áreas de busca viram pistas.
- Meditação tem 2 conflitos de posição com o Gameta (`meditation-009` a 4,3 unid. e `meditation-004` a 179 unid.). Nada foi alterado.

## Versão 1.7.0 · 24/11/2026 · cartografia, estradas e zoom

**Mudanças**
- **Base cartográfica nova.** O mapa agora usa a pirâmide "day" do GTADB, que é o mapa diurno do jogo, adicionado ao GTADB no dia do lançamento: z0–z6, 2 px/m no z6, CC BY 4.0, revisão `b6334a3`. Ela substitui os tiles noturnos do Open GTA 6 Map. Trevos, alças, pontes, faixas, quadras e prédios seguem o jogo. Diagnóstico, fontes, calibração e limitações estão em [CARTOGRAPHY.md](CARTOGRAPHY.md), e as capturas antes/depois, em `docs/cartografia/`.
- **O que era da fonte.** Pontas arredondadas soltas (inclusive nos acessos a pontes), ramais, cruzamentos confusos e traço largo já estavam nos tiles originais, desenhados a partir de linhas centrais vetorizadas, com uma largura por tipo e junções arredondadas.
- **O que era do renderizador.**
  - O canvas reduzia o tile de 1024 px.
  - O overzoom de 4× (z5 → z7) inflava o traço.
  - A conclusão do tile era sinalizada antes do HD.
  - O jsDelivr recusava parte dos tiles frios com 403 "Package size exceeded… 50 MB" (3 de 25 na amostra), e o tile ficava para sempre como recorte ampliado do z0, sem aviso.
- **Calibração sem mover pinos.** O GTADB usa a mesma grade do CRS, e a transformação adotada é a identidade. A costa difere em até 6 m (7 regiões). A rede viária do Open GTA 6 Map comparada com a pista do GTADB dá resíduo mediano de 6 m e máximo de 11 m (9 regiões). IDs, coordenadas e progresso foram preservados.
- **Carregador.**
  - `L.TileLayer` nativo com `<img>` em duas camadas: visão geral z0–z2 em precache e detalhe z3–z6 sob demanda.
  - Nível +1 em telas com DPR ≥ 1,5 (tile CSS de 128 px com imagem de 256 px).
  - Até duas novas tentativas por tile. Se continuar falhando, o tile fica transparente sobre a visão geral e o app avisa uma única vez.
  - `maxNativeZoom` 6 e zoom máximo 7 (inalterado).
- **Hospedagem.** Os 31.022 tiles (82,2 MB) foram obtidos por sparse checkout, como pede o GTADB, e são servidos pelo próprio Pages, sem jsDelivr. `npm run tiles:sync` refaz a cópia e confere a completude por nível. O `data:sync` não baixa mais tiles.
- **PWA.**
  - O precache tem 155 recursos, incluindo os 141 tiles de visão geral (~0,7 MB).
  - Os detalhes vistos ficam em `leonida-tiles-<revisão>` (limite de 3.000 tiles, ~9 MB), que sobrevive a novas publicações do app.
  - O cache antigo `leonida-hd-*` é removido na ativação.
- **Atribuição.** A faixa sobre o canto inferior esquerdo do mapa foi removida, sem substituto. Os créditos (GTADB, Open GTA 6 Map, Lucide e licença) ficam em Configurações → Créditos do mapa.

**Medições (build local, carregamento frio, trevo de Vice City em zoom 5)**
- DPR 1, "4G lento":
  - antes: detalhe em 11,7 s, 1,7 MB, 6 erros;
  - depois: 1,3 s, 178 KB, 0 erros.
- DPR 3, "4G lento": 3,7 s antes, 1,9 s depois.
- Memória de tiles em DPR 3: ~28 MB antes, ~9 MB depois.
- Captura de 6 regiões × 4 zooms × 2 perfis:
  - antes: 49 de 819 requisições de tile com erro e 20,3 MB transferidos;
  - depois: 0 de 1.127 e 6,5 MB.

**Testes executados**
- `npm test`: 22 aprovados.
- `npm run build`: 155 recursos no precache (141 tiles de visão geral).
- Playwright, suíte completa em Chrome desktop e WebKit iPhone 15: 45 aprovados e 1 ignorado. O ignorado é anterior a esta versão.
- Novos testes E2E:
  - nível de tile por DPR, tamanho em CSS e ausência de falhas ao aproximar;
  - créditos nas Configurações;
  - ausência da faixa de atribuição e de qualquer controle no canto inferior esquerdo;
  - falha do fornecedor (tiles z3–z6 abortados): o tile fica transparente sobre a visão geral e o aviso aparece uma vez.
- O teste offline exige o tile de visão geral de 256 px vindo do precache.
- Inspeção visual de pinos no zoom 6: `docs/cartografia/pinos-zoom6.webp`.
- Nível de tile e nitidez conferidos em DPR 1, 2 e 3: até o zoom 5, a razão aparelho/fonte fica entre 0,5× e 1,8×. A tabela está em CARTOGRAPHY.md.
- A roda do mouse foi testada no E2E (desktop) e num script à parte (zoom de 1,25 a 6,5 e de volta), sem erros de tile.
- A pinça foi testada com toque sintético via CDP no Chromium móvel com DPR 3 (zoom de −0,25 a 4, nível 5 carregado). Não houve teste em iPhone físico.

**Limitações mantidas.** O zoom 7 é ampliação do z6. O mapa do jogo não tem nomes de ruas. O mapa escuro antigo não ficou como alternativa (motivo em CARTOGRAPHY.md).

## Versão 1.6.0 · 24/11/2026 · preços de revenda dos veículos

**Mudanças**
- **Revenda ampliada: 112 → 127 fichas com cotação** (17 novas, 2 removidas por escopo demonstrado). Modelos 111 → 120 de 366; variantes 1 → 7 de 263. Entre as classes terrestres comercializáveis: modelos 110 → 119 de 239 e variantes 1 → 7 de 230. O denominador 629 inclui barcos, aeronaves, serviços e emergência, então não mede carros comercializáveis.
- **Fontes usadas.** NiaDB (14 fichas individuais, com crédito e link exato), Leonida Racing (6 fichas com valor e condição) e Clutchbase (tabela de scans, 22 linhas). GTA6Wiki confere com a base atual em 44 de 44 valores comparáveis e não trouxe preço novo utilizável.
- **Escopo por observação.** Cada cotação nova tem `id` estável, `kind`, `context`, crédito e data da consulta. A faixa `resale.value` só soma scans WAiNK e valores agregados sem contexto. GTA+, encomenda do Randy, cartão de veículo próprio ou destruído, cartão de menu e valores descartados ficam em `valueNotes`. Compradores específicos continuam em `buyerPrices`.
- **Merge de observações.** `scripts/vehicles-normalize.mjs` usa `id ?? source` como chave. Três scans da mesma página convivem, e uma tabela importada sem `id` continua substituindo o valor antigo da mesma fonte. Novas chaves de override: `retagQuotes` e `appendBuyerPrices`. `node scripts/update-vehicles.mjs --overrides-only` reaplica só as correções manuais, sem rede.
- **Correções demonstradas.** Growler: 13.310 era o valor RK do Randy (12.100) com GTA+; o scan sem selo é 5.700. Zorrusso: 21.250 e 23.375 eram RK e RK com GTA+, então ficou sem revenda livre. Coquette: 7.205 = 6.550 × 1,10 e 12.320 era do Coquette '64. Mais cinco valores do GTAPedia com razão exata de 1,10 sobre outra fonte (Schafter V12, Greta, Dorado, Furia, Montagne XL). Os outros valores só do GTAPedia continuam, sem prova de escopo.
- **Interface.** Contexto e crédito em cada cotação. Seção "Outras cotações (fora da faixa de revenda livre)". Variante sem preço próprio mostra "Referência do modelo base", rotulada e fora de filtros e ranking. Filtro "Apenas com valor de revenda conhecido".
- **Não alterado.** IDs, favoritos, mapa e as demais categorias. O Riata do Moses (`vehicle-vapid-riata-celle-de-moses`) tem a mesma taxa de registro de `vapid-riata` e 1.980 = 1.800 × 1,10, mas continua separado para não perder favoritos.

**Atenção.** O workflow de publicação roda `npm test` e `npm run build`, sem Playwright e sem `data:vehicles`. Um refresh completo por rede passa pelo `consolidate` completo, coberto pelos testes de merge. O ranking de revenda agora tem as variantes do Emerus (33.000) no topo; o teste de ranking passou em desktop e iPhone. Scans novos com exemplar destrancado fazem esses veículos passarem em "Apenas compatíveis" sem equipamento marcado (detalhes no COVERAGE).

**Lacunas mantidas.** 108 modelos terrestres sem cotação e 105 variantes sem cotação própria cujo modelo base tem preço. Devil's Rope Gauntlet respondeu 404 no NiaDB e não foi tentado por palpite de endereço. Não há pedido enviado ao NiaDB: o rascunho está em `data/reference/niadb-pedido-acesso.md`.

**Testes executados**
- `npm test`: 22 testes aprovados. Três novos cobrem merge por `id`, escopos fora da faixa e invariantes dos dados.
- `npm run build`: 30 recursos no cache PWA, versão do service worker regenerada.
- Playwright (`tests/vehicles.e2e.js`) em Chrome desktop e WebKit iPhone 15: 5 testes em cada, incluindo o novo de revenda, e o teste de versão em `tests/app.e2e.js` (desktop).

## Versão 1.5.0 · 24/11/2026 · complemento MapGenie

**Mudanças**
- **Nenhum ponto foi importado do MapGenie.** Os termos da Ziff Davis vedam extração e reuso, e o IGN usa a mesma base. Foram usadas só as contagens públicas, para comparação, e uma consulta pontual pela busca da interface. Detalhes em [COVERAGE.md](COVERAGE.md).
- **Saber Shipping resolvida.** `gang-operation-022` é a Yard, em Little Cuba, e `gang-operation-024` é a Facility, em Balsero. A senha 8046 do Leonida Lab foi associada ao cofre `safe-029`. A lista nominal de operações passou de 37/39 + 1 UE para 39/39 + 1 UE. O 39/39 da versão 1.3.0 não se reproduzia por nome.
- **Nova categoria "Caixas de paraquedas".** Fica em Itens e recursos, tem símbolo próprio e reúne 7 pontos. Ela separa as caixas dos BASE jumps, que agora são 25, como no checklist e no MapGenie. "Book: Killer Prom" foi para Livros e revistas, e as trocas de livros agora são 7.
- **Auditoria.** `scripts/audit.mjs` ganhou a comparação com as contagens do MapGenie: 51 linhas, 27 iguais, 17 com mais pontos locais e 7 com mais pontos no MapGenie (rebocáveis, ATMs, carregadores, ônibus, garagens, contatos e lojas).
- IDs, favoritos, progresso e marcadores pessoais não mudaram. As reclassificações só alteram a categoria, e os nomes antigos continuam pesquisáveis.

**Lacunas mantidas.** Flamingos, descobertas subaquáticas, Kenton, Kitty Litter, tablets, alvos do Bret e os rebocáveis faltantes (94 locais, 99 na GTA6Wiki e 127 no MapGenie) continuam sem fonte aberta com posições.

**Testes executados**
- `npm test` e `node scripts/audit.mjs`: 19 testes aprovados. Na tabela de informação prática, as operações com senha passaram de 10 para 11 e os cofres, de 25 para 26. Um teste novo cobre a Saber, os paraquedas, a troca de livros e a senha do `safe-029`.
- `npm run build`: 30 recursos no cache PWA, com a versão do service worker regenerada pelo hash.
- Playwright em Chrome desktop e WebKit iPhone 15, só nos cenários afetados: filtros, contadores, busca, símbolos e galeria, favoritos e backup, preferências antigas e PWA offline. Foram 22 testes distintos. Na primeira passada, 20 passaram e 2 falharam, os dois só pela versão fixa v1.4.0. Depois de atualizar a versão e incluir a checagem da nova categoria, os 2 passaram: 22/22. Os cenários de veículos, rotas e pontos personalizados não foram afetados e não foram repetidos.

## Versão 1.4.0 · 24/11/2026

**Mudanças**
- **Símbolos próprios.** 90 desenhos vetoriais originais (`src/symbols.js`), um por categoria e por subtipo de lugar (posto, ATM, delegacia, marina, cinema…), em sprite SVG. Pino = círculo colorido com símbolo de contraste calculado. Os mesmos símbolos aparecem em pinos, filtros, resultados, fichas, rankings, favoritos e progresso.
- **Registro único** (`src/registry.js`): 8 grupos e 67 categorias com nome em português, cor e símbolo. Substitui `layers.js`, `point-icons.js` e as listas duplicadas. Novas divisões: postos, ATMs, carregadores, bares, Pay 'n' Spray e outros serviços automotivos.
- **Filtros por grupo.** Operações, Colecionáveis, Itens e recursos, Veículos, Atividades, Exploração, Locais e serviços e Pessoal. Cada grupo expande/recolhe, mostra seleção parcial, contador visível/total e Mostrar/Ocultar todas. Categorias sem pontos posicionados (flamingos, subaquáticas, Kenton, Bret, tablets) continuam listadas, desativadas e com a pendência indicada. Favoritos são um filtro de status independente, dentro de Pessoal.
- **Início limpo.** Nenhuma categoria ativa ao abrir. A preferência opcional memoriza as categorias; a navegação entre Mapa, Veículos, Rankings e Progresso não as reinicia. Rankings e progresso consideram todos os pontos, não só os visíveis.
- **Busca independente.** Funciona com tudo oculto; o ponto selecionado aparece temporariamente e pode ter a categoria ativada.
- **Tamanho dos pinos** (24/30/38 px) e modo compacto (pontos coloridos) quando há mais de 900 pinos na tela com pouco zoom.
- **Galeria** `icons.html`: todos os símbolos lado a lado, com verificação de ausentes e repetidos. Funciona offline.
- O progresso deixou de guardar `enabledGroups` (ignorado ao importar). Coordenadas, IDs, favoritos, conclusões, Car Finder e equipamentos ficam como estavam.

**Referência visual.** A inspeção do MapGenie no navegador não foi feita (a abertura foi interrompida) e nenhum recurso dele foi usado; a organização dos grupos segue a estrutura sugerida no pedido e o catálogo consolidado. Não houve comparação visual com o MapGenie.

**Origem e licença dos símbolos.** Desenhos próprios, feitos para este projeto (mesma licença do repositório). Os ícones de navegação da interface continuam do Lucide (ISC, `public/icons/LICENSE-LUCIDE.txt`).

**Testes executados**
- `npm test`: 18 aprovados (visibilidade, registro, símbolos únicos, categorias sem pontos, subtipos).
- Playwright em Chrome desktop e WebKit iPhone 15: suíte completa, inclusive Car Finder, com início limpo, Mostrar/Ocultar tudo, seleção parcial, busca com categorias ocultas, persistência opcional, navegação interna, tamanho dos pinos, galeria offline e PWA offline.
- Inspeção visual por capturas desktop e celular; `npm run build`.

## Versão 1.3.0 · 24/11/2026

**Mudanças**
- **Antisspoiler removido.** Não há mais seleção de capítulo ao iniciar, seletor no cabeçalho, proteção contra spoilers nem ocultação por capítulo em mapa, busca, rankings, fichas ou Car Finder. Na 1.2.0, 2.882 pontos sem capítulo ficavam ocultos no capítulo 3.
- **Configurações com cinco itens.** São eles Slim Jim, clonador de chaves, Snap Gun e assaltos a caixas e a cofres de bancos. Os demais requisitos são informativos.
- **Disponibilidade.** Há filtro por estado (atendidos, pendentes, desconhecidos), filtro por equipamento e cadeado discreto no pino. A janela de configurações tem altura responsiva, rolagem interna e áreas seguras no iPhone.
- **Contadores e filtros ativos.** Cada categoria mostra visíveis/catalogados, e os filtros ativos aparecem como etiquetas removíveis.
- **Classificação.** Joalherias e penhores ficaram separados, assim como bancos e grandes bancos. Fast food foi para Lojas assaltáveis, e relógios e armas no chão viraram subcategorias. Houve 3 reclassificações e 7 duplicatas consolidadas com aliases.
- **Fichas.** Receberam senhas (GTA6Wiki e Leonida Lab), itens-chave, entradas, desbloqueios, receptadores por tipo e 117 itens vinculados ao seu complexo.
- **PWA.** Avisa quando uma versão nova do catálogo é instalada.

**Auditoria** (`scripts/audit.mjs`, detalhes em [COVERAGE.md](COVERAGE.md))
- Os pontos conferem por nome com as listas externas: 20/20 joalherias, 15/15 casas de penhores, 22/22 bancos (14 + 8), 7/7 financeiras, 39/39 operações do checklist e 21/21 fast foods.
- Há 5.533 pontos consultáveis, dos quais 2.889 foram recuperados em relação ao capítulo 3 da 1.2.0.
- Nenhuma coordenada inválida.

**Testes executados antes da publicação**
- `npm test`: 16 testes unitários. Incluem regressão para pontos sem capítulo, migração de preferências antigas, estados de requisito, contadores, vínculos sem dupla contagem e senhas importadas.
- Playwright: 31 aprovados e 1 ignorado de propósito (teste só para celular no projeto desktop), em Chrome desktop e WebKit com perfil iPhone 15 emulado. Não houve teste em aparelho físico.

**Pendências.** Saber Shipping Yard/Facility, 5 caixas eletrônicos rebocáveis, 14 laboratórios Kitty Litter sem coordenadas, colecionáveis sem pinos (flamingos, descobertas subaquáticas, tesouros do Kenton) e preços de revenda para 517 dos 629 modelos. Lista completa em [COVERAGE.md](COVERAGE.md).

## Histórico · inventário de 24/11/2026 (versão 1.2.0)

| Métrica | Total |
|---|---:|
| Registros de `locations.json` | 4.688 |
| Registros de `places.json` | 1.021 |
| Duplicatas ou aliases consolidados | 44 |
| Pontos importados com coordenadas da fonte | 5.665 |
| Evidência comunitária atribuída pela fonte | 4.075 |
| Grau de evidência incompleto no catálogo | 1.590 |
| Locais cuja existência aparece em material oficial, com posição comunitária | 6 |
| Guias editoriais com ficha e referências próprias | 32 |
| Resumos adicionais de bancos com modalidade e valor | 20 |
| Modelos com estimativa comunitária de revenda livre | 3 |
| Lojas de eletrônicos relacionadas à busca por tablets | 15 |
| Pontos visíveis no Capítulo 3 com Locais ativado | 2.399 |

Nenhum ponto recebeu confirmação de coordenadas por inspeção independente no PS5. A existência oficial de seis locais vem da Rockstar. Outros guias citam relatos de testes em jogo, inclusive Apollo Aggregates em PlayStation. Consulte [FONTES.md](FONTES.md).

## Recursos entregues até a 1.2.0

Itens sobre capítulo e Rotas descrevem a versão 1.2.0. O antisspoiler foi removido na 1.3.0, e Rotas deu lugar a Veículos na 1.2.0.

- Seleção inicial obrigatória de capítulo. Dados de progresso de versões anteriores são preservados.
- Grupo Locais desligado na primeira abertura, com a escolha salva no aparelho. Símbolos vetoriais de categoria e serviço nos pinos, na legenda e nas fichas.
- Cartografia noturna de alta resolução, clusters e legenda com grupos e categorias.
- Busca por nome, região e categoria. Filtros por conclusão, favorito, repetição, confronto, evidência de capítulo e requisitos selecionados.
- Guias com valores, campos desconhecidos explícitos e links para fontes e vídeos, inclusive momentos marcados da arara e da entrega inicial do Zorrusso.
- Checklist local, histórico, marcadores pessoais, backup por JSON e estimativa para atividades pendentes com recompensa publicada.
- Rota de até 25 paradas com linha reta e caminhos derivados de segmentos conectados. Tratamento explícito de trechos sem conexão.
- PWA estática com cache do catálogo, guias, visão geral offline e detalhe previamente percorrido. Workflow de publicação gratuita no GitHub Pages.

## Limites de cobertura

- Faltam capítulos, disponibilidade por missão, alarmes, pagamentos, pontos de controle, condições de aparecimento e tempos de reposição para a maioria dos pontos. Os sete pontos de financeiras permanecem catalogados com capítulo desconhecido.
- O valor do laboratório difere por relato. O armazém que outra fonte situa ao norte de Hamlet permanece como pista sem pino próprio. Apollo Aggregates tem ficha, pino e evidência de reposição parcial.
- As 15 lojas de eletrônicos são consultáveis. Posições de tablets coletáveis e estoque individual não tiveram evidência suficiente. As fotos de gameplay ficaram em links para as fontes por falta de autorização verificável para redistribuição da coleção.
- As faixas de revenda são estimativas de modelo. Recompensas por encomenda ou missão aparecem no ranking de atividade. A malha comunitária de ruas serve para planejamento aproximado e pode omitir acessos ou restrições do jogo.
- O mapa foi publicado no GitHub Pages. O teste móvel do endereço público verificou mapa, ficha e recarga offline em WebKit com perfil de iPhone 15 emulado no Windows. [Abrir o Leonida Map](https://marcosbittar11-maker.github.io/leonida-map/)

## Validação

- `npm run data:sync`, `npm ci`, `npm test` e `npm run build`.
- Suíte de modelo com sete casos. Cobre catálogo, deduplicação e aliases, bloqueio por capítulo, requisitos, backup e roteamento.
- Playwright passou os 22 testes, 11 em Chrome desktop e 11 em WebKit com perfil iPhone 15. Cobre arrasto em desktop, zoom, agrupamento, seleção por clique e toque, busca, filtros, proteção contra capítulo posterior, requisitos, favoritos, histórico, backup, ficha, edição de ponto, rotas, ranking e reabertura offline.
- O teste de carga usa os 5.665 marcadores importados, com menos de 500 elementos de mapa simultâneos no zoom de visão geral. A medição final, com debounce e espera do teste, foi de 139 ms em Chrome e 214 ms em WebKit.
- A versão estática foi recarregada offline no Chrome em um subdiretório `/leonida-map/`, como o caminho padrão de um repositório no GitHub Pages.
- Inspeção visual do Chrome a 1487 × 1058 e do perfil iPhone 15, incluindo ficha. A referência de design local foi comparada com o cabeçalho, a tipografia, a densidade da legenda, os controles de zoom e a posição da ficha. A implementação usa a cartografia pública com enquadramento estadual, guias em destaque e reorganização da navegação e da ficha no celular.


## Versão 1.1.0

- Cabeçalho com a versão do pacote. Filtros em 11 grupos, com Operações ativa em uma configuração nova, e controle de coleção para variantes.
- Remoção dos agrupamentos numéricos. O mapa mantém pinos independentes na área visível e preserva o agrupamento por categoria na legenda.
- 262 pontos de variantes terrestres na seleção editorial, incluindo dois aparecimentos adicionais do Gameta. Pedidos de entregas e aparecimentos genéricos ficaram fora da camada. Os IDs antigos continuam no catálogo para preservar o progresso.
- A comparação de fontes e a transformação das duas coordenadas estão documentadas em [FONTES.md](FONTES.md).
- Validação desta versão com oito testes unitários e 24 testes Playwright. A carga em navegador usou mais de 5.000 pontos sem agrupar.

## Versão 1.2.0

- A aba Veículos substituiu Rotas. O catálogo tem busca instantânea, lista e galeria, filtros, fichas e favoritos incluídos no backup. Ranking de revenda e visualização temporária de aparecimentos usam a mesma base.
- A base local reúne 629 fichas, 263 marcadas como variante ou edição especial, 112 com estimativa normal de revenda, 136 com desempenho, 62 com rastreador observado e sete com foto oficial. Há cinco pontos fixos documentados. Coordenadas comunitárias adicionais aparecem na visualização temporária como relatos.
- As vendas ou ofertas observadas para compradores específicos estão em seis fichas e têm o escopo do exemplar. Preços, classe, raridade por frequência, segurança, fotos e condições de aparecimento seguem incompletos quando as fontes não informam.
- Atualização incremental validada com download direto e repetição do mesmo snapshot. Correções de identidade, regras, preços de comprador e fotos têm fonte no arquivo de overrides.
- Testes de navegador cobrem catálogo, tamanhos móvel e desktop, filtros de compatibilidade, navegação entre ficha e mapa, persistência, catálogo e fotos previamente visualizadas offline. A verificação foi feita em Chrome desktop e WebKit com perfil iPhone 15, sem teste em aparelho físico.
- Resultado final local de 10 testes unitários e 32 testes Playwright, com 16 execuções por navegador. O empacotamento estático e o cache offline também passaram.
