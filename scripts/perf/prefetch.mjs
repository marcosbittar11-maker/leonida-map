// Experimento (não faz parte do app): vale pré-carregar um anel de tiles ao redor da viewport quando o mapa está pronto?
// Mede o custo em bytes/tempo do anel e o ganho de um pan curto depois. Requer um build com src/perf.js (?perf).
//   node scripts/perf/prefetch.mjs --dir <dist> [--profile slow|fast] [--runs 3]
import { chromium } from '@playwright/test';
import { startServer } from './serve.mjs';

const flags = process.argv.slice(2);
const args = {};
flags.forEach((value, i) => { if (value.startsWith('--')) args[value.slice(2)] = flags[i + 1] && !flags[i + 1].startsWith('--') ? flags[i + 1] : 'true'; });
const shape = args.profile === 'fast' ? { latency: 0, kbps: 0 } : { latency: 150, kbps: 1600 };
const runs = Number(args.runs || 3);
const server = await startServer({ dir: args.dir, ...shape });
const browser = await chromium.launch({ channel: 'chrome' });

const tilesReady = page => page.evaluate(() => new Promise(resolve => {
  const t0 = performance.now();
  const step = () => {
    const box = document.getElementById('map').getBoundingClientRect();
    let loaded = 0, pending = 0;
    for (const img of document.querySelectorAll('#map img.leaflet-tile')) {
      const r = img.getBoundingClientRect();
      if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
      if (img.classList.contains('leaflet-tile-loaded') && img.naturalWidth > 0) loaded++; else if (img.style.visibility !== 'hidden') pending++;
    }
    return pending === 0 && loaded > 0 ? resolve(performance.now() - t0) : requestAnimationFrame(step);
  };
  step();
}));

const rows = [];
for (const mode of ['controle', 'prefetch']) {
  for (let run = 0; run < runs; run++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await context.newPage();
    await page.goto(server.url + '?perf');
    await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined);
    await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
    await page.evaluate(() => window.__leonida.map.setView([-489.7, 503.9], 5, { animate: false }));
    await tilesReady(page);
    server.reset();
    let prefetch = null;
    if (mode === 'prefetch') {
      const t0 = Date.now();
      const urls = await page.evaluate(() => {
        const map = window.__leonida.map;
        const layer = Object.values(map._layers).find(l => l.options?.className === 'tiles-detail');
        const range = layer._pxBoundsToTileRange(layer._getTiledPixelBounds(map.getCenter()));
        const out = [];
        for (let x = range.min.x - 1; x <= range.max.x + 1; x++) for (let y = range.min.y - 1; y <= range.max.y + 1; y++) {
          if (x >= range.min.x && x <= range.max.x && y >= range.min.y && y <= range.max.y) continue;
          const coords = range.min.clone(); coords.x = x; coords.y = y; coords.z = layer._tileZoom;
          if (layer._isValidTile(coords)) out.push(layer.getTileUrl(coords));
        }
        return out;
      });
      // duas requisições por vez, só depois da viewport pronta (o app real usaria ociosidade)
      for (let i = 0; i < urls.length; i += 2) await page.evaluate(list => Promise.all(list.map(url => fetch(url).then(r => r.arrayBuffer()))), urls.slice(i, i + 2));
      prefetch = { tiles: urls.length, ms: Date.now() - t0, bytes: server.stats.bytes, requests: server.stats.requests };
    }
    server.reset();
    await page.evaluate(() => window.__leonida.map.panBy([400, 0], { animate: false }));
    const ms = await tilesReady(page);
    rows.push({ mode, ms: Math.round(ms), panBytes: server.stats.bytes, panRequests: server.stats.requests, prefetch });
    await context.close();
  }
}
const median = list => { const s = [...list].sort((a, b) => a - b); return s[s.length >> 1]; };
for (const mode of ['controle', 'prefetch']) {
  const list = rows.filter(r => r.mode === mode);
  console.log(mode.padEnd(9), 'pan 400 px até tiles prontos: mediana', median(list.map(r => r.ms)), 'ms (', Math.min(...list.map(r => r.ms)), '–', Math.max(...list.map(r => r.ms)), ') | bytes no pan', median(list.map(r => r.panBytes)),
    '| requisições no pan', median(list.map(r => r.panRequests)), list[0].prefetch ? '| anel: ' + list[0].prefetch.tiles + ' tiles, ' + median(list.map(r => r.prefetch.bytes)) + ' B, ' + median(list.map(r => r.prefetch.ms)) + ' ms' : '');
}
await browser.close();
await server.close();
