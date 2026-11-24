# Plano do Leonida Map

1. Avaliar a licença, os dados, as categorias, as imagens e as coordenadas das fontes. Fixar uma revisão importável e documentar divergências.
2. Usar Vite e módulos JS com Leaflet CRS.Simple. O sistema cartesiano corresponde à base Open GTA 6 Map. Agrupar pontos em índice espacial no navegador e materializar apenas os símbolos da área visível. Os tiles cartográficos usam canvas. Essa combinação preserva zoom e toque com milhares de registros e permite publicação estática. Mapas geográficos e serviços de rotas externos não representam a rede viária do jogo.
3. Normalizar dados públicos, preservar IDs e aliases, acrescentar guias autorais em arquivo separado e exigir evidência de capítulo para conteúdos sensíveis. Trabalhar com capítulo 3 como padrão.
4. Implementar painel de exploração, mapa, ficha enxuta, gestão de progresso, rotas, rankings e PWA. Guardar progresso local com esquema versionado.
5. Verificar importação, dados, desktop, iPhone simulado, mais de mil registros, cenários de spoiler e recarga offline. Documentar os resultados e publicação gratuita.


## Versão 1.2.0

1. Consolidar os veículos em JSON local usando o Leonida Lab como base. Cruzar identidade, classes, scans, preços e posições com as fontes complementares.
2. Guardar dados do modelo, observações de compra e aparecimentos em campos separados, com correções versionadas. Preservar IDs no atualizador incremental.
3. Substituir Rotas por Veículos. Integrar favoritos ao backup, mostrar grupos por classe e conectar as fichas à visualização temporária do mapa.
4. Validar integração, navegação responsiva e modo offline. Publicar no GitHub Pages.
