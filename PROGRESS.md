# Progresso da entrega

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
