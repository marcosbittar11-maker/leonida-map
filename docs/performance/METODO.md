# Método de medição de desempenho

Documento de apoio do [PERFORMANCE.md](../../PERFORMANCE.md). Descreve como os números foram obtidos, o que cada um significa e o que **não** foi medido.

## Ferramentas

| Arquivo | Função |
|---|---|
| `scripts/perf/serve.mjs` | Servidor estático do build de produção (`dist/`). Imita o essencial do GitHub Pages: `Cache-Control: max-age=600`, `ETag`/304 e **gzip** para texto (o Pages não serve Brotli: `curl -H "Accept-Encoding: br"` devolve o catálogo de 1,44 MB sem compressão, e com gzip 197.515 B). Opcionalmente molda a rede (latência por resposta e banda total compartilhada). Conta requisições e bytes realmente enviados. |
| `scripts/perf/measure.mjs` | Harness Playwright: cenários, marcas e resumo (mediana, mínimo, máximo). |
| `scripts/perf/suite.sh`, `ablation.sh` | Bateria completa (Chrome e WebKit, rede rápida e lenta) e ablação por variantes cumulativas. JSON brutos em `docs/performance/raw/`. |
| `scripts/perf/compare.mjs`, `table.mjs` | Tabelas de comparação (mediana e faixa) a partir dos JSON. |
| `scripts/perf/profile.mjs` | Perfil de CPU (CDP) por função para startup, Mostrar tudo e busca. |
| `scripts/perf/upgrade.mjs` | Atualização de versão: cache de tiles, progresso e HD offline sobrevivem. |
| `scripts/perf/visual.mjs` | Equivalência de assets (hash dos 31.022 tiles) e de capturas (mesma coordenada, zoom, viewport e DPR 1/2/3). |
| `scripts/perf/prefetch.mjs` | Experimento de pré-carga de vizinhança (descartado, ver PERFORMANCE.md). |
| `src/perf.js` | `performance.mark` no app e, com `?perf` na URL, `window.__leonida.map` para o harness dirigir o mapa. Sem `?perf` nada é exposto. |

Reprodução:

```powershell
npm run build
node scripts/perf/measure.mjs --dir dist --browser chromium --profile slow --scenario cold,warm,region,interact,offline --runs 5
```

## Condições

- **Build de produção** (`vite build` + `scripts/offline.mjs`), nunca o servidor de desenvolvimento.
- **Rede rápida (`fast`)**: loopback sem moldagem, gzip.
- **Rede lenta (`slow`)**: latência de 150 ms por resposta e banda total de 1,6 Mbps (≈ 200 KB/s) compartilhada por todas as conexões, aplicada **no servidor**. Por isso vale igualmente para o Chrome, para o WebKit e para as requisições do service worker. Não é o throttling do DevTools (que não alcança o service worker). CPU sem limitação (`--cpu 1`).
- **Chrome desktop**: Chrome estável instalado, 1440 × 960, DPR 1.
- **WebKit**: build do Playwright com o perfil *iPhone 15* (393 × 659 efetivos, DPR 3, toque). É emulação no Windows, não um iPhone.
- Cada execução usa um **contexto novo** (sem service worker, cache HTTP, Cache Storage nem localStorage). Cenários quentes só rodam depois de a instalação do service worker terminar.
- 5 repetições por cenário (3 no experimento de pré-carga). Reportamos **mediana** e **faixa** (mín–máx). Com 5 amostras não calculamos p90/p95.

## Cenários e definições

| Métrica | Definição |
|---|---|
| FCP | `first-contentful-paint` do navegador. |
| Primeiro tile | Primeiro `<img class="leaflet-tile-loaded">` dentro da área visível do mapa (laço `requestAnimationFrame`, resolução de um quadro). |
| **Mapa pronto** | Todos os tiles que cruzam a área visível do mapa carregados (sem pendentes e sem erros) e ao menos um. Tiles fora da viewport não contam. Sem esperas fixas. |
| Catálogo interativo | Marca `refresh:first`: catálogo baixado, `applyGuides` concluído e painel/mapa renderizados. |
| SW ativo | Instante em que o service worker ficou `activated` (precache do shell e da visão geral concluído). É o marco de "offline pronto". |
| Bytes / requisições | Contados **no servidor** (corpo já comprimido, inclui as requisições do service worker). |
| Região inédita / revisitada | `map.setView` para o zoom 5 em Vice City (503,9; 489,7), sem animação, medindo até todos os tiles visíveis carregarem. "Revisitada" volta ao mesmo ponto depois de passar pela visão geral. "Após recarregar" repete depois de `reload()` (tiles vêm do Cache Storage). |
| Filtros | `click()` no botão e espera da próxima pintura (`rAF` + tarefa). "Handler" é só o tempo síncrono. |
| Busca | `input` no campo, incluindo o debounce de 75 ms, até o título "Resultados" aparecer e o quadro seguinte ser pintado. Com todas as categorias ocultas. |
| Pan | Média de 12 `panBy` sem animação, no zoom 1,25 e 2,5 com todas as categorias ligadas (≈ 5,8 mil pinos). Mede o `draw` do mapa. |
| Car Finder / ranking | Primeiro clique na aba (com fetch frio do `vehicles.json`) até haver cartões ou lista. Cada um num contexto limpo. |
| Offline | Contexto offline, `reload()` e leitura dos mesmos indicadores. |

Esperas fixas de captura **não** entram em nenhum tempo.

## Limitações

- O servidor local usa HTTP/1.1 (6 conexões por origem). O GitHub Pages usa HTTP/2 com CDN. Por isso as medições com rede moldada servem para **comparar versões**, não para prever o tempo absoluto na rede real. Os números na rede real do Pages estão em seção própria e usam Playwright, que enxerga as requisições do service worker apenas no Chromium.
- WebKit não tem throttling de CPU nem de rede nativos. Nenhum número de WebKit foi obtido com throttling do navegador.
- `performance.memory` e *long tasks* existem só no Chromium.
- Não houve teste em iPhone físico. Safari real tem política própria de cache, cota e suspensão do service worker.
- Variação entre execuções vem de agendamento do sistema e de GC. Diferenças menores que a faixa observada não foram tratadas como ganho.

- A ablação das variantes A–D (`docs/performance/raw/brotli/`) foi feita **antes** de o servidor passar a gzip e usa Brotli. Vale como comparação relativa entre variantes, não como número absoluto. Todas as tabelas antes/depois do PERFORMANCE.md foram refeitas com gzip.
- Os números de "bytes" da rede real (Pages) vêm de `request.sizes()` do Playwright. No WebKit o Playwright não enxerga as requisições do service worker e conta respostas servidas por ele, então esses bytes não são comparáveis com os do Chromium.
