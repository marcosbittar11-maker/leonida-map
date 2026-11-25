# Plano do Leonida Map

1. Avaliar a licença, os dados, as categorias, as imagens e as coordenadas das fontes. Fixar uma revisão importável e documentar divergências.
2. Usar Vite e módulos JS com Leaflet CRS.Simple. O sistema cartesiano corresponde à base Open GTA 6 Map. Agrupar pontos em índice espacial no navegador e materializar apenas os símbolos da área visível. Os tiles cartográficos usam `L.TileLayer` nativo sobre a base GTADB desde a 1.7.0. Essa combinação preserva zoom e toque com milhares de registros e permite publicação estática. Mapas geográficos e serviços de rotas externos não representam a rede viária do jogo.
3. Normalizar dados públicos, preservar IDs e aliases e acrescentar guias autorais em arquivo separado. A versão 1.3.0 removeu a filtragem por capítulo.
4. Implementar painel de exploração, mapa, ficha enxuta, gestão de progresso, rankings e PWA. Guardar progresso local com esquema versionado.
5. Verificar importação, dados, desktop, iPhone simulado, mais de mil registros e recarga offline. Documentar os resultados e publicação gratuita.


## Versão 1.2.0

1. Consolidar os veículos em JSON local usando o Leonida Lab como base. Cruzar identidade, classes, scans, preços e posições com as fontes complementares.
2. Guardar dados do modelo, observações de compra e aparecimentos em campos separados, com correções versionadas. Preservar IDs no atualizador incremental.
3. Substituir Rotas por Veículos. Integrar favoritos ao backup, mostrar grupos por classe e conectar as fichas à visualização temporária do mapa.
4. Validar integração, navegação responsiva e modo offline. Publicar no GitHub Pages.


## Versão 1.3.0

1. Congelar a visibilidade da 1.2.0 como linha de base e remover o antisspoiler: sem seleção de capítulo e sem ocultação por capítulo. O capítulo fica só como informação.
2. Reduzir a configuração a cinco itens: Slim Jim, clonador, Snap Gun, caixas e cofres de bancos. Os demais requisitos passam a ser informativos. Criar o filtro de disponibilidade, o filtro por equipamento, o cadeado no pino e os contadores por categoria.
3. Auditar a cobertura contra listas nominais externas com `scripts/audit.mjs`. Aplicar correções em `src/curation.js`, separadas do snapshot importado.
4. Enriquecer fichas com senhas e fatos verificáveis, validar coordenadas antes de importar e associar itens do mesmo complexo.
5. Rodar testes unitários e E2E em desktop e iPhone emulado, publicar no GitHub Pages a cada push em `main` e conferir o endereço público.


## Versão 1.7.0 · cartografia, estradas e zoom

1. [x] Diagnosticar separadamente fonte, estilo, resolução e carregamento: pontas soltas e traço largo vinham da vetorização do Open GTA 6 Map; tiles presos no recorte z0 vinham do 403 do jsDelivr sem nova tentativa.
2. [x] Comparar fontes em Vice City, Vice Beach, Capri, Port Gellhorn, Hamlet e Ponte Bocamar, com o mesmo centro e zoom. Adotar a pirâmide "day" do GTADB (mapa do jogo), com transformação identidade validada pela costa e pela rede viária, sem mover pinos.
3. [x] Hospedar os tiles no próprio Pages (sparse checkout da revisão fixa), com visão geral em precache, detalhe sob demanda com orçamento de cache, política de DPR e falhas visíveis.
4. [x] Remover a faixa de atribuição do mapa e levar os créditos para Configurações.
5. [x] Validar com testes unitários, build e E2E direcionados em desktop e iPhone emulado; registrar medições e capturas.
6. [x] Desempenho e carregamento (1.9.0): mapa antes do catálogo, service worker depois do primeiro mapa útil, pinos sem custo quadrático; medições antes/depois em PERFORMANCE.md.
7. [ ] Pendente: conferir em iPhone físico (pinça, memória) e acompanhar novas revisões do GTADB com `npm run tiles:sync` após atualizar `src/tiles.js`.

