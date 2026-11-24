// Cartografia base: pirâmide "day" do GTADB (mapa diurno do jogo, modo --official do tiles.py), CC BY 4.0.
// Mesma grade do CRS atual: z0 = 1024 px para 32.768 m, tiles de 256 px; z6 = 2 px/m.
// Os arquivos ficam em public/tiles/game/ (scripts/import-tiles.mjs) e são servidos pelo próprio site.
export const tileSource = {
  repo: 'rolux/gtadb.org',
  revision: 'b6334a3e3386d028e8ffb4eab35b584bf588e59d',
  path: 'maps/tiles/6/day',
  maxZoom: 6,
  overviewMaxZoom: 2,
  // Faixas de tiles publicadas por nível: [[xMin, yMin], [xMax, yMax]] (inclusivas).
  ranges: {
    0: [[0, 0], [2, 3]], 1: [[1, 1], [5, 6]], 2: [[2, 2], [10, 12]], 3: [[4, 4], [20, 25]],
    4: [[8, 8], [41, 51]], 5: [[17, 17], [83, 103]], 6: [[34, 34], [167, 206]]
  }
};
// Cobertura do nível 6 em unidades do mapa (x 136–672, y 136–828).
export const tileCover = (() => {
  const [[x0, y0], [x1, y1]] = tileSource.ranges[tileSource.maxZoom];
  const unit = 256 / 2 ** tileSource.maxZoom;
  return { x0: x0 * unit, y0: y0 * unit, x1: (x1 + 1) * unit, y1: (y1 + 1) * unit };
})();
export const tileFile = (z, y, x) => z + '/' + z + ',' + y + ',' + x + '.jpg';
