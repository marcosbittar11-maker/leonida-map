# Cartografia, estradas e zoom

Versão 1.7.0 · 24/11/2026. Este documento registra o diagnóstico da base cartográfica, a fonte adotada, a calibração, o carregador de tiles e as limitações.

## Resumo

- **Nova base:** a pirâmide **"day" do GTADB**, que é o mapa do jogo capturado, nos níveis z0 a z6 (2 px/m no z6). Ela substitui os tiles noturnos do Open GTA 6 Map. Ruas, rodovias, trevos, pontes, rampas, quadras e prédios vêm do mapa do jogo, não de uma reconstrução.
- **Sem transformação de coordenadas.** O GTADB usa a mesma grade do nosso CRS. Pinos, IDs e progresso não mudaram.
- **Hospedagem própria.** Os 31.022 tiles (82,2 MB) são servidos pelo GitHub Pages do Leonida Map, na revisão fixa `b6334a3e3386d028e8ffb4eab35b584bf588e59d`, e foram obtidos por sparse checkout. O jsDelivr foi descartado porque recusa arquivos de repositórios grandes, como mostra a seção de diagnóstico.
- **Carregador novo:**
  - `L.TileLayer` nativo com `<img>`, no lugar do canvas.
  - Visão geral z0–z2 em precache por baixo e detalhe z3–z6 por cima.
  - Nível +1 em telas com DPR ≥ 1,5.
  - Até duas novas tentativas por tile. Se ainda falhar, o tile fica transparente sobre a visão geral e o app avisa uma única vez.
- **Atribuição.** A faixa sobre o mapa foi removida. Os créditos ficam em Configurações → Créditos do mapa.

## Diagnóstico (v1.6.0)

Foram examinadas separadamente a geometria da fonte, o estilo, a resolução e o carregamento.

| Sintoma relatado | Causa | Onde estava |
|---|---|---|
| Vias com pontas arredondadas que parecem soltas, inclusive acessos a pontes | O Open GTA 6 Map desenha `roads.json` com uma largura fixa por tipo e `round joins`. As linhas centrais foram traçadas de tiles comunitários, e `roadsvec.py`/`prune.py` descartam tocos e ligações. Onde o traço termina sem junção, sobra uma ponta arredondada. | **Fonte** (tile original z5 inspecionado: as pontas já existem no arquivo de 1024 px) |
| Ramais estranhos e cruzamentos pouco claros | Pistas paralelas de rodovias, alças e trevos viram faixas largas sobrepostas, sem hierarquia de viadutos. | **Fonte** |
| Traços enormes no zoom alto | No z5 nativo, a rodovia tem ~50 px em 1024 (~12 px CSS). O app fazia overzoom de z5 até z7 (4×), o que levava a ~48 px CSS. | Fonte + **renderizador** (overzoom de 4×) |
| Pouco detalhe | A base é uma reconstrução: não tem faixas, quadras, prédios nem marinas do mapa do jogo. Além disso, o canvas reduzia o tile de 1024 px para 256 px (DPR 1), 512 px (DPR 2) ou 768 px (DPR 3) antes do overzoom. | Fonte + **renderizador** |
| Quadrados borrados que nunca melhoram | O jsDelivr responde **403 "Package size exceeded the configured limit of 50 MB"** em parte dos tiles frios de repositórios grandes: 3 de 25 tiles z5 aleatórios do Open GTA 6 Map. O `createTile` sinalizava pronto depois do recorte do z0 e ignorava o erro do tile HD, sem nova tentativa e sem ancestral mais próximo. O tile ficava para sempre como recorte ampliado 32× do z0. | **Renderizador** + CDN |

O tile `5,61,61` ficou preso no recorte z0 na captura "antes" do iPhone em Vice City. Depois, o mesmo arquivo respondeu 200 no jsDelivr e no raw do GitHub, o que confirma uma falha transitória sem recuperação. As medições completas estão em `docs/cartografia/medicoes-antes.json` e `medicoes-depois.json`.

### Fontes avaliadas

| Fonte | O que oferece | Decisão |
|---|---|---|
| Open GTA 6 Map (`fbritoferreira/gta6@d860901`) | Tiles noturnos z0–5 de 1024 px (6.720 no z5, esparsos), vetorizados de tiles comunitários e do pôster da Rockstar. Também `roads.json`, com 9.075 linhas (highway, main, street, minor). | Mantido para **dados** (locais e coordenadas). A base visual foi substituída, porque o próprio traçado é o problema. |
| GTADB (`rolux/gtadb.org@b6334a3`) | `maps/tiles/6/day`: mapa do jogo, z0–6, tiles JPEG de 256 px, retângulo completo por nível (12, 30, 99, 374, 1.496, 5.829 e 23.182 arquivos). | **Adotado como base padrão.** |
| GTAMap.io | Declara In-Game Day de 34.304 × 44.544 px a 2 px/m, z0–7. | Só comparação. O retângulo z6 do GTADB tem 134 × 173 tiles = 34.304 × 44.288 px, o que bate com a largura declarada. Não verificamos a origem do GTAMap.io e não usamos o serviço. |
| State of Leonida GIS (`wpenistone/leonida_gis`) | Rede viária GeoJSON em desenvolvimento. | Não usado. Com a imagem do jogo disponível, uma rede vetorial a mais exigiria fundo sem estradas e não traria melhoria demonstrável. |
| Mapa imprimível oficial (Rockstar) e MapGenie | Referência visual. | Não reutilizados: direitos não concedidos e termos que vedam extração. |

Não foi necessário redesenhar estradas nem criar camada vetorial. Nenhuma rua ou conexão foi inventada.

## Termos e atribuição do GTADB

O `readme.md` do repositório, na revisão usada, autoriza usar dados, fotos e tiles e pede para não buscar dados ou mídia ao vivo de gtadb.org. Para atualizar, a orientação é usar `git pull` ou `git sparse-checkout set ... maps/tiles/6`. `LICENSE-DATA` declara CC BY 4.0 para os tiles e sugere a atribuição "GTA VI Map Tiles (CC BY 4.0) — https://map.gtadb.org".

`scripts/import-tiles.mjs` faz exatamente isto: clone parcial (`--filter=blob:none --sparse`) da revisão fixa, conferência de que cada nível tem o retângulo completo e cópia para `public/tiles/game/`. Os arquivos **não foram alterados**: sem reamostragem nem recompressão. A arte do mapa pertence à Rockstar Games. O GTADB licencia a captura, e o Leonida Map é um projeto comunitário sem fins comerciais.

A CC BY 4.0 (seção 3(a)(2)) aceita atribuição "de qualquer forma razoável conforme o meio". Por isso a faixa sobre o mapa foi trocada por uma seção em **Configurações → Créditos do mapa**, que tem:
- o texto preferido pelo GTADB;
- o link map.gtadb.org;
- a revisão usada e a indicação de que os tiles não foram alterados;
- a nota sobre a Rockstar;
- o crédito do Open GTA 6 Map pelos dados;
- o Lucide;
- o link da licença.

O README e o FONTES.md repetem os créditos.

## Geometria e calibração

**Transformação.** As duas fontes usam `x = (gx + 16384) / 32` e `y = (16384 − gy) / 32`, onde `gx` e `gy` são metros do jogo. No GTADB, o z0 tem 1024 px para 32.768 m em tiles de 256 px, então o tile `(z, y, x)` coincide com o tile Leaflet `CRS.Simple`, `tileSize 256`, do mesmo `z`. A transformação adotada é a **identidade**.

**Validação independente.** Os 620 POIs com nome igual a um landmark do GTADB coincidem com resíduo mediano de 0,03 unidade. Esse valor não conta como validação, porque os dados têm origem comum. Foram usadas duas medições independentes:

1. **Costa** (máscaras de água no z4, 1 px = 2 m). Foi medido o deslocamento entre os tiles do Open GTA 6 Map, onde os pinos foram conferidos até agora, e os do GTADB:

| Região | Deslocamento (un.) | Metros |
|---|---|---|
| Vice City | (−0,12, −0,12) | 4, 4 |
| Capri | (0,00, −0,06) | 0, 2 |
| Port Gellhorn | (0,00, 0,00) | 0 |
| Keys | (0,00, −0,12) | 0, 4 |
| Ambrosia | (−0,06, 0,06) | 2, 2 |
| Norte (Kalaga) | (−0,06, 0,12) | 2, 4 |
| Hamlet | (−0,06, −0,19) | 2, 6 |

2. **Rede viária.** Vértices de highway, main e street do `roads.json` do Open GTA 6 Map foram comparados com os pixels de pista do GTADB no z5 (1 px = 1 m). Para cada região, foi buscado o deslocamento com mais vértices sobre a pista:

| Região | Vértices | Na pista, sem ajuste | Melhor deslocamento |
|---|---|---|---|
| Vice City centro | 339 | 78% | 6,0 m (0,19 un.) |
| Vice Beach | 81 | 85% | 7,1 m |
| Capri | 97 | 90% | 4,1 m |
| Port Gellhorn | 89 | 78% | 4,1 m |
| Hamlet | 108 | 70% | 6,4 m |
| Key Lento | 102 | 70% | 11,0 m (0,34 un.) |
| Ambrosia | 101 | 86% | 5,0 m |
| Watson Bay | 90 | 74% | 3,2 m |
| Gloriana Key | 190 | 53% | 8,2 m |

O resíduo mediano é de **6 m (0,19 unidade)** e o máximo, de **11 m (0,34 unidade)**, em Key Lento. Os deslocamentos variam de direção entre regiões, sem viés comum, e ficam dentro do erro de traçado de uma reconstrução cujas vias têm 12 m ou mais de largura. Por isso não há transformação a aplicar, e **nenhum pino foi deslocado**.

**Conferência visual.** `docs/cartografia/pinos-zoom6.webp` mostra 8 POIs no zoom 6: delegacias, hotel, marina, hospital, autódromo, base aérea e posto. Os pinos caem sobre os prédios correspondentes. As duas delegacias ficam cerca de 0,45 unidade (~15 m) ao sul do escudo desenhado no mapa do jogo, dentro do resíduo acima. Isso foi registrado, sem correção.

## Carregador de tiles (`src/map.js`, `src/tiles.js`)

- **Duas camadas `L.TileLayer`** com classe `GameTiles`, ambas lendo `tiles/game/{z}/{z},{y},{x}.jpg` do próprio site e limitadas à cobertura do z6 (x 136–672, y 136–828 unidades). Todos os 5.665 pinos ficam dentro dela.
  - `tiles-overview`: z0–z2, em precache. Fica sempre por baixo, mostra algo de imediato e cobre falhas e áreas offline.
  - `tiles-detail`: z3–z6, sob demanda. Só fica ativa a partir do nível em que o detalhe existe.
- **Política de DPR.** Com DPR ≥ 1,5, cada tile ocupa 128 px CSS e recebe a imagem de 256 px do nível seguinte (`zoomOffset 1`, limites nativos −1). Isso dá nitidez de Retina sem reamostrar no cliente. Com DPR 1, o tile é de 256 px no nível do zoom. O `maxNativeZoom` é o 6 da fonte, e o zoom 7 é overzoom de 2× (DPR 1) ou 4× (DPR ≥ 1,5), mantido para precisão dos pinos. O limite de zoom não foi aumentado.
- **Falhas.** Um tile que falha tem até duas novas tentativas (0,7 s e 1,4 s, com `?retry=` que o service worker ignora). A tentativa só acontece se o tile ainda estiver na grade, para não repetir em tiles descartados. Depois disso, o tile fica transparente e a visão geral aparece por baixo. `#map[data-detail-failures]` conta as falhas, e um aviso discreto aparece **uma vez** por sessão ("Sem conexão: …" ou "Alguns detalhes do mapa não carregaram…"). Não há promises em cache, e o próprio Leaflet aborta tiles descartados.
- **Sem defeito escondido.** O fundo do contêiner usa a cor do mar do mapa do jogo (`#2f90b0`), e o zoom mínimo e o máximo continuam −1 e 7.

## PWA e cache

- **Precache.** O precache tem 155 recursos: o shell e os **141 tiles de visão geral (~0,7 MB)**. Os tiles z3–z6 ficam fora do precache e do hash de versão (`scripts/offline.mjs`).
- **Cache sob demanda.** Detalhes visitados ficam em `leonida-tiles-<revisão>`, com limite de 3.000 tiles (~9 MB no pior caso, ~3 KB por tile) e remoção dos mais antigos a cada 50 gravações. O cache é ligado à revisão dos tiles: uma nova publicação do app não o apaga. O cache antigo `leonida-hd-*` (jsDelivr) é removido na ativação.
- **Offline.** O mapa abre com a visão geral completa. As áreas já visitadas mantêm o detalhe, e as outras aparecem com a visão geral ampliada, com o aviso de resolução reduzida.
- **Tamanho publicado.** São +82,2 MB no site (31.022 arquivos), servidos pelo GitHub Pages. O limite do Pages é de 1 GB.

## Medições antes/depois

As medições foram feitas com o build local (`vite preview`), Chrome desktop 1440 × 960 (DPR 1) e um perfil de 393 × 852 (DPR 3), com carregamento frio e cache desativado, no trevo de Vice City em zoom 5.

| Cenário | Antes (v1.6.0) | Depois |
|---|---|---|
| DPR 1, rede "4G lento" (150 ms, 1,6 Mbps) | 11,7 s até o detalhe, 1,7 MB, 6 respostas de erro | **1,3 s**, 178 KB, 0 erros |
| DPR 1, rede rápida | 0,3 s, 637 KB, 3 erros | 0,1 s, 178 KB, 0 erros |
| DPR 3, "4G lento" | 3,7 s, 525 KB | **1,9 s**, 243 KB |
| DPR 3, memória de tiles | 12 canvases de 768² ≈ 28 MB | 36 imagens de 256² ≈ 9 MB |

Na captura das 6 regiões × 4 zooms em desktop e iPhone (`docs/cartografia/medicoes-*.json`), a v1.6.0 teve 49 de 819 requisições de tile com erro e transferiu 20,3 MB. Depois foram 0 de 1.127 requisições com erro e 6,5 MB transferidos. Há mais requisições porque são tiles menores, de 256 px.

As capturas antes/depois estão em `docs/cartografia/`:
- trevo de Vice City em zoom 5 e 7 (iPhone);
- Vice Beach em zoom 3,5;
- Capri em zoom 5 (mostra também o recorte borrado do z0 na versão antiga);
- Port Gellhorn em zoom 3,5;
- Hamlet rural em zoom 5 (iPhone);
- Ponte Bocamar em zoom 5;
- visão geral em zoom 1,5.

## Limitações

- O GTADB é uma captura comunitária do mapa do jogo, não um arquivo da Rockstar. Áreas que o jogo não mostra no mapa também não aparecem aqui. Interiores e túneis seguem a representação do jogo.
- O mapa do jogo não tem nomes de ruas. Os rótulos de região continuam vindo do catálogo.
- O detalhe máximo é o z6 (2 px/m). O zoom 7 é ampliação, não mais detalhe.
- A aparência agora é a do mapa diurno do jogo, que é clara. O mapa escuro antigo não foi mantido como alternativa, porque era justamente a base imprecisa e um seletor serviria só para esconder o problema.
- Os testes usaram Chrome desktop e WebKit com perfil iPhone 15 no Playwright, não um iPhone físico. A pinça foi coberta só pelo zoom do Leaflet, sem gesto físico.
