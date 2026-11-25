// Atualização de versão: o cache de tiles de detalhe e o progresso sobrevivem e o HD visitado funciona offline.
//   node scripts/perf/upgrade.mjs --from <dist-antigo> --to <dist-novo> --browser chromium|webkit
// O "antigo" precisa expor window.__leonida com ?perf (qualquer build com src/perf.js).
import { chromium, webkit, devices } from '@playwright/test';
import { startServer } from './serve.mjs';

const flags = process.argv.slice(2);
const args = {};
flags.forEach((value, i) => { if (value.startsWith('--')) args[value.slice(2)] = flags[i + 1] && !flags[i + 1].startsWith('--') ? flags[i + 1] : 'true'; });
const browserName = args.browser || 'chromium';
const progressKey = 'leonida-map:progress:v1';
const saved = { version: 1, equipment: ['slim'], completed: { 'safe-070': '2026-01-01T00:00:00.000Z' }, favorites: ['L2453'], vehicleFavorites: [], custom: [] };

const server = await startServer({ dir: args.from });
const browser = await (browserName === 'webkit' ? webkit : chromium).launch(browserName === 'webkit' ? {} : { channel: 'chrome' });
const context = await browser.newContext(browserName === 'webkit' ? { ...devices['iPhone 15'] } : { viewport: { width: 1440, height: 960 } });
const page = await context.newPage();
const out = { browser: browserName, from: args.from, to: args.to };

const tilesReady = () => page.evaluate(() => new Promise(resolve => {
  const step = () => {
    const box = document.getElementById('map').getBoundingClientRect();
    let loaded = 0, pending = 0;
    for (const img of document.querySelectorAll('#map img.leaflet-tile')) {
      const r = img.getBoundingClientRect();
      if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
      if (img.classList.contains('leaflet-tile-loaded') && img.naturalWidth > 0) loaded++; else if (img.style.visibility !== 'hidden') pending++;
    }
    return pending === 0 && loaded > 0 ? resolve(loaded) : requestAnimationFrame(step);
  };
  step();
}));
const visitHD = async () => {
  await page.evaluate(() => window.__leonida.map.setView([-489.7, 503.9], 5, { animate: false }));
  return tilesReady();
};
const cacheState = () => page.evaluate(async () => {
  const state = {};
  for (const name of await caches.keys()) state[name] = (await (await caches.open(name)).keys()).length;
  return state;
});

await page.goto(server.url + '?perf');
await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined);
await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated', null, { timeout: 60000 });
await page.evaluate(() => window.__leonida && 0);
out.hdTilesBefore = await visitHD();
await page.evaluate(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [progressKey, saved]);
await page.waitForFunction(() => !!navigator.serviceWorker.controller).catch(async () => { await page.reload({ waitUntil: 'commit' }); });
out.cachesBefore = await cacheState();

// Publica a versão nova e recarrega: o app antigo (controlado pelo SW antigo) descobre o SW novo.
server.setDir(args.to);
server.reset();
await page.reload({ waitUntil: 'commit' });
await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined);
await page.locator('.toast-reload').waitFor({ timeout: 90000 });
out.toastShown = true;
await page.locator('.toast-reload').click();
await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined && window.__leonida);
await tilesReady();
out.cachesAfter = await cacheState();
out.progressPreserved = await page.evaluate(key => localStorage.getItem(key), progressKey).then(text => JSON.stringify(JSON.parse(text).completed) === JSON.stringify(saved.completed) && JSON.parse(text).favorites[0] === 'L2453');
out.newVersionServed = await page.evaluate(() => performance.getEntriesByName('refresh:first').length > 0 || document.getElementById('map').dataset.points !== undefined);

// O HD visitado antes da atualização deve vir do cache: nenhuma requisição de tile ao servidor.
server.reset();
out.hdTilesAfter = await visitHD();
out.tileRequestsOnRevisit = server.stats.byPath.filter(([p]) => /\/tiles\/game\/[3-6]\//.test(p)).length;

// Offline com o HD da região visitada.
await context.setOffline(true);
await page.reload({ waitUntil: 'commit' });
await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined && window.__leonida);
out.offlineHdTiles = await visitHD();
out.offlineDetailFailed = await page.evaluate(() => [...document.querySelectorAll('#map .tiles-detail img')].filter(img => img.style.visibility === 'hidden').length);
console.log(JSON.stringify(out, null, 1));
await browser.close();
await server.close();
