# Desempenho, carregamento e fluidez

Versão 1.9.0 · 24/11/2026. Método, ferramentas e limitações em [docs/performance/METODO.md](docs/performance/METODO.md). Dados brutos em [docs/performance/raw/](docs/performance/raw/).

**Resumo.** O mapa agora abre antes do catálogo, o service worker só se instala depois do primeiro mapa útil e a camada de pinos deixou de ter custo quadrático. Cartografia, tiles, resolução, coordenadas e dados ficaram intactos (31.022 tiles com hash idêntico, mesmas URLs de tile e mesmas capturas em DPR 1, 2 e 3). Os ganhos são grandes onde a espera era de rede ou de ordem de carregamento. Em rede rápida e cache frio quase não há mudança. Há duas trocas, descritas abaixo: o catálogo fica interativo um pouco depois quando a rede é lenta no Chrome, e o "offline pronto" chega mais tarde.

## Antes e depois

Medianas de 5 execuções, faixa mín–máx entre parênteses nos arquivos brutos. "Antes" é a 1.8.0 (commit `2bc72042`) com as mesmas marcas de medição, "depois" é a 1.9.0. Rede lenta = 150 ms e 1,6 Mbps moldados no servidor local (vale para o service worker também), gzip como no GitHub Pages. WebKit = perfil iPhone 15 emulado (DPR 3), **não** um iPhone físico.

### Primeira visita (sem service worker nem cache)

| Cenário | Primeiro tile | **Mapa pronto** | Catálogo interativo | Offline pronto | Bytes até o mapa pronto |
|---|---|---|---|---|---|
| Chrome, rede lenta | 2,87 s → **1,35 s** (−53%) | 4,00 s → **2,89 s** (−28%) | 2,61 s → 3,11 s (**+19%**) | 10,7 s → 11,3 s (+6%) | 570 → 459 KB |
| WebKit, rede lenta | 4,93 s → **1,39 s** (−72%) | 9,93 s → **2,93 s** (−70%) | 3,59 s → 3,12 s (−13%) | 9,9 s → 10,9 s (+9%) | 1.603 → 507 KB (−68%) |
| Chrome, rede rápida | 254 → 255 ms (0%) | 256 → 255 ms (0%) | 243 → 247 ms (+2%) | 350 → 515 ms (+47%) | 971 → 461 KB (−53%) |
| WebKit, rede rápida | 262 → **120 ms** (−54%) | 262 → **120 ms** (−54%) | 229 → 238 ms (+4%) | 550 ms → 1,10 s | 896 → 459 KB (−49%) |
| Chrome, CPU 4×, rede rápida | 1,07 s → **0,38 s** (−64%) | 1,07 s → **0,38 s** (−64%) | 1,02 s → 1,02 s (0%) | – | – |
| Chrome, CPU 4×, rede lenta | 3,30 s → **1,42 s** (−57%) | 4,43 s → **2,96 s** (−33%) | 3,26 s → 3,90 s (**+20%**) | – | – |

### Recarga quente (service worker ativo, tudo em cache)

| Cenário | **Mapa pronto** | Catálogo interativo |
|---|---|---|
| Chrome, rede rápida | 149 → **26 ms** (−83%) | 145 → 144 ms |
| Chrome, rede lenta (sem efeito no cache) | 171 → **33 ms** (−81%) | 165 → 176 ms (+6%) |
| WebKit, rede rápida | 182 → **69 ms** (−62%) | 165 → 164 ms |
| WebKit, rede lenta | 231 → **93 ms** (−60%) | 213 → 214 ms |
| Chrome, CPU 4× | 679 → **183 ms** (−73%) | 640 → 727 ms (**+14%**) |
| Chrome, CPU 4×, rede lenta | 986 → **199 ms** (−80%) | 936 → 992 ms (+6%) |

A meta de primeiro mapa útil abaixo de 1 s com cache quente foi atingida em todos os cenários, inclusive com CPU 4× (183 ms).

### Recarga offline (depois de instalar e visitar uma região HD)

| | Mapa pronto | Catálogo interativo | HD visitado (tiles de detalhe) |
|---|---|---|---|
| Chrome | 187 → **48 ms** | 178 → 198 ms (+11%) | 8 → 9 ms, 0 falhas |
| WebKit | 218 → **121 ms** | 202 → 232 ms (+15%) | 43 → 53 ms, 0 falhas |

Uma região não visitada continua sem tiles de detalhe offline e mostra a visão geral por baixo, como antes.

### Interação com ≈ 5,8 mil pinos (rede rápida)

| Ação | Chrome | WebKit |
|---|---|---|
| Mostrar tudo (handler) | 278 → **151 ms** (−46%) | 484 → **323 ms** (−33%) |
| Mostrar tudo (até a pintura) | 326 → 199 ms (−39%) | 619 → 461 ms (−26%) |
| Ocultar tudo depois de Mostrar tudo (handler) | 126 → 40 ms | 139 → 94 ms |
| Pan no zoom 1,25 com todos os pinos (`panBy` → pintura) | 37 → **20 ms** (−47%) | 17 → 17 ms |
| Filtro "Com guia" (até a pintura) | 12 → 11 ms | 46 → 45 ms |
| Busca "bank" com tudo oculto (percebida, com debounce de 75 ms) | 620 → 659 ms | 139 → 138 ms |

A busca no Chrome é dominada por rasterização do quadro (ver "Gargalos"), não por JavaScript: o trabalho de JS da busca é ≈ 15 ms. O número não mudou entre versões.

### Tiles e região nova (zoom 5, Vice City, DPR 1 Chrome / DPR 3 WebKit)

| | Chrome rápida | Chrome lenta | WebKit rápida | WebKit lenta |
|---|---|---|---|---|
| Região inédita | 27 → 25 ms | 1,02 → 1,02 s | 45 → 44 ms | 803 → 802 ms |
| Revisitada | 3 → 3 ms | 3 → 3 ms | 28 → 27 ms | 40 → 26 ms |
| Após recarregar (Cache Storage) | 6 → 6 ms | 13 → 12 ms | 46 → 45 ms | 46 → 43 ms |
| Bytes e requisições da região inédita | 151 KB, 24 req (igual) | igual | 94 KB, 20 req (igual) | igual |

A região nova é limitada por banda (151 KB a 200 KB/s ≈ 0,8 s mais a latência). Só menos bytes ajudariam, e os tiles não podem mudar. O service worker novo não alterou isso de forma mensurável. Dos 26 tiles visíveis no zoom 5, só 1 a 2 vêm da visão geral (z2, no precache, sem rede).

### Pages real (rede real desta máquina, CDN do GitHub)

Linha de base, antes do deploy, medida em 24/11/2026 contra a 1.8.0 publicada (5 execuções, contexto novo por execução):

| | Chrome | WebKit |
|---|---|---|
| Frio: mapa pronto | 325 ms (321 ms–2,22 s) | 261 ms |
| Frio: catálogo interativo | 305 ms | 248 ms |
| Quente: mapa pronto | 167 ms | 188 ms |

A rede desta máquina é rápida e o Pages serve por HTTP/2, então o cenário real é parecido com a "rede rápida" local. Veja abaixo os números depois do deploy.

<!-- PAGES-DEPOIS -->

## Gargalos confirmados (com a evidência)

1. **Mapa só depois do catálogo.** A cadeia era serial: JS → catálogo (1,44 MB, 197.515 B em gzip) → `JSON.parse` → `applyGuides` (≈ 110 ms, ≈ 450–550 ms com CPU 4×) → `createMap` → tiles. Com rede lenta o primeiro tile aparecia em 2,9 s (Chrome) e 4,9 s (WebKit).
2. **Instalação do service worker disputando banda no WebKit.** O precache (155 recursos, ≈ 1 MB) começava junto com o mapa: 1,6 MB baixados antes do mapa pronto e mapa pronto em 9,9 s. No Chrome não houve disputa mensurável (a ablação mostrou igual com e sem adiamento), no WebKit o adiamento sozinho levou o mapa pronto de 8,8 s para 2,8 s.
3. **Custo quadrático dos marcadores do Leaflet.** Em "Mostrar tudo", 131 ms de 408 ms amostrados estavam em `Evented._listens`: cada marcador registra três ouvintes (`zoom`, `viewreset`, `zoomanim`) e cada registro varre a lista inteira. A remoção tinha o mesmo custo.
4. **Raster do Chrome headless.** A busca percebida de ≈ 650 ms tem ≈ 15 ms de JS. O resto é rasterização por software (`RasterTask`, `GpuRasterBuffer::Playback`) do primeiro quadro com a lista. Não é problema do app e não foi alterado.

Não eram gargalos: a leitura/gravação de tiles no service worker (a diferença entre o fluxo antigo e o novo ficou em ≤ 5 ms por 26 tiles), a primeira abertura do Car Finder (≈ 20 ms no Chrome, 38 ms no WebKit) e do ranking (≈ 19 ms), o debounce da busca (75 ms) e o painel (≈ 15 ms por atualização).

## O que foi feito

- **Mapa antes do catálogo** ([src/main.js](src/main.js), [src/map.js](src/map.js)). O download do catálogo começa no início do `init`, em paralelo com a criação do mapa. Rótulos entram quando o catálogo chega (`setLabels`). Painel, navegação, configurações, botão Filtros e "Novo ponto" ficam `inert` (e `aria-busy`) até `ready`; os controles de zoom e centralização funcionam desde o início. Falha do catálogo não esconde o mapa: aparece um aviso com "Tentar novamente", sem recriar o mapa nem duplicar ouvintes.
- **Service worker registrado depois do primeiro mapa útil**, do catálogo e de um instante ocioso (limite de 10 s). O aviso de nova versão e a atualização atômica do shell continuam como antes.
- **Service worker** ([scripts/service-worker.js](scripts/service-worker.js)). Uma promessa de abertura por cache; `shell` só é consultado para z0–z2 (a visão geral); a resposta de rede segue para a página sem esperar `cache.put`, que roda em `waitUntil` registrado durante o despacho; evicção em lote (a cada 50 gravações, com folga de 150 tiles) fora do caminho de resposta; só imagens `ok` entram no cache; cota cheia não derruba a resposta. **Nova tentativa real:** `?retry=N` agora ignora o cache HTTP (`cache: 'reload'`), não lê o cache do app e regrava a cópia. Antes o parâmetro era descartado e o mesmo arquivo podia ser reaproveitado. O ganho de velocidade é desprezível; a mudança é de robustez.
- **Pinos** ([src/map.js](src/map.js)). Marcador próprio (`Pin`) sem os três ouvintes por marcador, com um único ouvinte no mapa para `zoom`, `viewreset` e `zoomanim`. Comparação de estado do pino sem montar uma chave de texto por ponto. `zoomend` e `moveend` agrupados num único desenho, em microtarefa (sem esperar `requestAnimationFrame`). `availability()` calculada uma vez por atualização e reaproveitada pelo painel.
- **Marcas de desempenho** (`src/perf.js`, User Timing). Com `?perf` o mapa também é exposto em `window.__leonida` para o harness.
- **Harness e documentação** em `scripts/perf/` e `docs/performance/`.

## O que foi testado e descartado

| Ideia | Resultado | Decisão |
|---|---|---|
| `<link rel="preload">` do catálogo | Chrome: primeiro tile **+33%** (1,31 → 1,74 s) e mapa pronto igual; no WebKit o catálogo foi baixado **3 vezes** (2 sem preload), mapa pronto +21% e catálogo interativo +21%. | Removido. |
| Ceder a thread ao mapa antes do `applyGuides` | Primeiro tile no Chrome rápido 255 → 109 ms, mas mapa pronto e catálogo interativo sem ganho e cache quente pior (+19 ms). | Descartado. |
| `requestAnimationFrame` para agrupar `moveend`/`zoomend` | WebKit: `panBy`→pintura 16 → **62 ms** (o desenho passa a competir com o orçamento do quadro). | Trocado por microtarefa (16 ms). |
| Pré-carga de vizinhança (anel de 1 tile, 24 tiles) | Custa **161 KB** (7× os 23 KB que um pan de 400 px exige) e 2,8 s de banda na rede lenta, para economizar 0,27 s num pan curto. | Descartado. |
| Code splitting do Car Finder | A primeira abertura leva ≈ 20 ms no Chrome (38 ms no WebKit), com o precache concluído; `car-finder.js` + `vehicles.js` somam ≈ 25 KB de fonte dentro de um chunk de 94 KB em gzip (estimativa, não medido isoladamente). O ganho de carga seria de poucos KB. | Não vale. |
| LRU no cache de tiles | Não houve evidência de benefício; a política FIFO por ordem de gravação continua suficiente (≤ 3.000 tiles, evicção em lote). | Mantido FIFO. |
| Empacotamento alternativo de tiles (512 px, PMTiles/Range), CDN, recompressão | O waterfall não mostra sobrecarga HTTP relevante: a região nova é limitada por banda. | Não tentado, conforme o escopo. |

## Equivalência e integridade

- `scripts/perf/visual.mjs`: os 31.022 arquivos de `dist/tiles/game` têm o mesmo hash (nomes + bytes) nas duas versões. Em 4 vistas × DPR 1, 2 e 3 as URLs de tile são as mesmas, e as capturas diferem no máximo 1 nível de canal em ≤ 0,1% dos pixels, o mesmo ruído de rasterização de duas capturas da própria 1.8.0 entre si ([docs/performance/raw/visual.txt](docs/performance/raw/visual.txt)).
- `scripts/perf/upgrade.mjs`: atualização 1.8.0 → 1.9.0 com o app aberto. O cache de tiles de detalhe da revisão (`leonida-tiles-b6334a3e3386`) foi mantido (Chrome 24 → 24 entradas, WebKit 20 → 20); só o shell foi trocado (`leonida-shell-…`). Progresso e favoritos preservados, aviso de nova versão exibido, **0 requisições de tile** ao revisitar o HD e HD offline com 0 falhas.
- Posições, zoom máximo, política de DPR, créditos e dados não foram tocados.

## Testes

- `npm test`: 36 de 36 (28 anteriores + 8 novos em `tests/service-worker.test.mjs`, que executam o service worker real num contexto isolado: acerto e erro de cache, `waitUntil` registrado no despacho, retry que ignora cache e regrava, HTML e erros fora do cache, cota esgotada, evicção em lote, visão geral vs. detalhe).
- E2E (`npx playwright test`, Chrome desktop e WebKit iPhone 15): todos os existentes mais 2 novos por navegador: tiles com o catálogo retido e controles inertes que depois liberam; falha do catálogo com mapa preservado, nova tentativa e um único ouvinte/um único mapa. Cobrem também offline com overview e HD visitado, atualização do PWA, falha de tile e Car Finder/ranking. Resultado: **57 passaram e 1 foi ignorado** ("configurações cabem no celular…", que só roda no perfil móvel e já era ignorado no desktop antes desta versão). `npm run build` ok.
- A atualização foi testada partindo do build da 1.8.0 **com as marcas de medição** (mesma lógica de service worker, `VERSION` diferente), porque o harness precisa de `window.__leonida`.
- Não executado: teste em **iPhone físico**, Safari real e PWA instalado na tela inicial.

## Riscos remanescentes

- **Catálogo interativo mais tarde em rede lenta no Chrome (+19%):** o catálogo disputa a banda com os primeiros tiles. É a troca pedida (mapa útil antes). Em CPU 4× com cache quente, +87 ms. Isso foi medido num servidor local cujo limitador de banda é FIFO entre conexões HTTP/1.1 e **ignora a prioridade do navegador**. No Pages (HTTP/2) a requisição do catálogo (`fetch`) tem prioridade maior que a das imagens de tile, então a divisão entre primeiro tile e catálogo interativo pode ser diferente num enlace lento real. Não foi verificado numa rede lenta real.
- **"Offline pronto" mais tarde** (Chrome rápido +165 ms, WebKit +0,55 s; rede lenta +0,65 s a +0,9 s): é o efeito direto do adiamento do service worker. Quem abrir o app e perder a rede nos primeiros segundos pode não ter o shell offline ainda. O app não anuncia "offline pronto" em nenhum momento.
- **WebKit baixa duas vezes** o catálogo e a visão geral na primeira visita (SW precache + página, ≈ 0,45 MB extra; 2 requisições de `catalog.json` contra 1 no Chrome). Não foi corrigido.
- **`applyGuides` (≈ 110 ms no desktop, ≈ 0,5 s com CPU 4×)** é agora o maior bloqueio até o catálogo ficar interativo. Pré-computar o resultado no build exigiria mexer em `scripts/import*`/audit e foi deixado de fora por risco.
- A primeira renderização da lista de resultados no Chrome headless custa ≈ 190 ms de raster; num Chrome com GPU deve ser menor (não medido).
- O harness usa HTTP/1.1; o Pages usa HTTP/2. Os números moldados comparam versões, não predizem o tempo absoluto.

## O que verificar num iPhone físico

1. Primeira visita pelo Safari em 4G: tempo até o primeiro tile e até o catálogo interativo, a olho e com o Web Inspector remoto (aba Timelines/Network).
2. Instalar na Tela de Início, fechar, ativar o modo avião e reabrir: o mapa-base e a região HD visitada devem abrir; a região nunca vista mostra a visão geral.
3. Atualizar a versão com o app instalado: toast de nova versão, progresso e favoritos mantidos, HD visitado sem nova baixa.
4. "Mostrar tudo" no zoom inicial e um pan logo depois (o Safari é mais lento que o Chrome do harness em pinos).
5. Memória e suspensão do service worker em uso longo (3.000 tiles ≈ 9 MB de cache); cota do Safari.
6. Rotação e pinça com a camada de detalhe carregando.

## Como reproduzir

```powershell
npm run build
node scripts/perf/measure.mjs --dir dist --browser webkit --profile slow --scenario cold,warm,region,interact,offline --runs 5
node scripts/perf/profile.mjs --dir dist --action showAll
node scripts/perf/upgrade.mjs --from <dist-antigo> --to dist --browser chromium
node scripts/perf/visual.mjs --a <dist-antigo> --b dist
```
