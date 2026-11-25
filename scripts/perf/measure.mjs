// Harness de desempenho do Leonida Map. Mede o build de produção (dist) servido por scripts/perf/serve.mjs,
// ou um endereço remoto (--url). Método e limitações: docs/performance/METODO.md.
//   node scripts/perf/measure.mjs --dir dist --browser chromium --profile fast --scenario cold --runs 5 --out docs/performance/raw/x.json
import { chromium, webkit, devices } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { startServer } from './serve.mjs';

const flags = process.argv.slice(2);
const args = {};
flags.forEach((value, i) => {
  if (!value.startsWith('--')) return;
  const next = flags[i + 1];
  args[value.slice(2)] = next === undefined || next.startsWith('--') ? 'true' : next;
});
const browserName = args.browser || 'chromium';
const profile = args.profile || 'fast';
const profiles = { fast: { latency: 0, kbps: 0 }, slow: { latency: 150, kbps: 1600 } };
const runs = Number(args.runs || 5);
const scenarios = (args.scenario || 'cold,warm,region,interact,offline').split(',');
const dpr = Number(args.dpr || (browserName === 'webkit' ? 3 : 1));
const cpu = Number(args.cpu || 1);
const regions = { vicecity: [503.9, 489.7], hamlet: [421.4, 610.6], capri: [289.3, 506.8], gellhorn: [305.8, 379.8] };
const median = list => { const s = [...list].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Auxiliar dentro da página: mede cobertura de tiles dentro da área do mapa e marca primeira pintura útil.
const pageHelper = () => {
  const P = window.__perf = { firstTile: null, ready: null, dataPoints: null, swReady: null, swActive: null, long: [], fcp: null };
  const state = () => {
    const box = document.getElementById('map')?.getBoundingClientRect();
    const out = { loaded: 0, pending: 0, failed: 0, detail: 0, overview: 0 };
    if (!box || !box.width) return out;
    for (const img of document.querySelectorAll('#map img.leaflet-tile')) {
      const r = img.getBoundingClientRect();
      if (!r.width || r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
      const layer = img.closest('.tiles-detail') ? 'detail' : 'overview';
      if (img.classList.contains('leaflet-tile-loaded') && img.naturalWidth > 0) { out.loaded++; out[layer]++; }
      else if (img.style.visibility === 'hidden') out.failed++;
      else out.pending++;
    }
    return out;
  };
  P.state = state;
  P.waitTiles = (timeout = 90000) => new Promise(resolve => {
    const t0 = performance.now();
    const step = () => {
      const s = state();
      if (s.pending === 0 && s.loaded > 0) return resolve({ ...s, ok: true, at: performance.now() });
      if (performance.now() - t0 > timeout) return resolve({ ...s, ok: false, at: performance.now() });
      requestAnimationFrame(step);
    };
    step();
  });
  const loop = () => {
    const s = state();
    if (P.firstTile === null && s.loaded > 0) P.firstTile = performance.now();
    if (P.ready === null && s.pending === 0 && s.loaded > 0) P.ready = performance.now();
    if (P.dataPoints === null && document.getElementById('map')?.dataset.points !== undefined) P.dataPoints = performance.now();
    if (P.ready === null || P.dataPoints === null) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  try {
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (e.name === 'first-contentful-paint') P.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) P.long.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
  } catch { /* sem suporte */ }
  if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(reg => {
    P.swReady = performance.now();
    const done = () => { if (reg.active?.state === 'activated') P.swActive = performance.now(); };
    done(); reg.active?.addEventListener('statechange', done);
  });
  // tempo de ação até a próxima pintura (rAF + tarefa)
  P.frame = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
};

async function launch() {
  const type = browserName === 'webkit' ? webkit : chromium;
  const browser = await type.launch(browserName === 'webkit' ? {} : { channel: 'chrome' });
  const make = async () => {
    const opts = browserName === 'webkit' ? { ...devices['iPhone 15'] } : { viewport: { width: 1440, height: 960 }, deviceScaleFactor: dpr };
    if (browserName === 'webkit' && args.dpr) opts.deviceScaleFactor = dpr;
    const context = await browser.newContext(opts);
    await context.addInitScript(pageHelper);
    return context;
  };
  return { browser, make };
}

async function newPage(context) {
  const page = await context.newPage();
  if (browserName === 'chromium' && cpu > 1) await (await context.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: cpu });
  return page;
}

function watchNetwork(context) {
  const state = { requests: 0, bytes: 0, atReady: null };
  context.on('requestfinished', async request => {
    state.requests++;
    try { const z = await request.sizes(); state.bytes += z.responseBodySize + z.responseHeadersSize; } catch { /* sem tamanhos */ }
  });
  return { snapshot: () => ({ requests: state.requests, bytes: state.bytes }), reset() { state.requests = 0; state.bytes = 0; } };
}
const sum = entries => ({ requests: entries.length, bytes: entries.reduce((n, [, b]) => n + b, 0) });
const tileOf = p => /\/tiles\//.test(p);

async function readLoad(page, server, remote, net) {
  await page.waitForFunction(() => window.__perf.ready !== null && window.__perf.dataPoints !== null, null, { timeout: 120000, polling: 50 }).catch(() => {});
  const atReady = remote && net ? net.snapshot() : server && !remote ? sum(server.stats.byPath) : null;
  const atReadyTiles = server && !remote ? sum(server.stats.byPath.filter(([p]) => tileOf(p))) : null;
  const info = await page.evaluate(() => {
    const P = window.__perf, mark = n => performance.getEntriesByName(n)[0]?.startTime ?? null;
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    return { fcp: P.fcp, firstTile: P.firstTile, mapReady: P.ready, catalogHeaders: mark('catalog:headers'), catalogParsed: mark('catalog:parsed'),
      guides: mark('guides:applied'), mapCreated: mark('map:created'), interactive: mark('refresh:first') ?? P.dataPoints, dataPoints: P.dataPoints,
      tilesOverviewLoad: mark('tiles:overview:load'), tilesDetailLoad: mark('tiles:detail:load'), responseStart: nav?.responseStart, domContentLoaded: nav?.domContentLoadedEventEnd,
      longTasks: P.long.length, longTaskMs: Math.round(P.long.reduce((n, [, d]) => n + d, 0)), longMax: Math.round(Math.max(0, ...P.long.map(l => l[1]))),
      pageRequests: res.length, pageTileRequests: res.filter(e => /\/tiles\//.test(e.name)).length, heap: performance.memory?.usedJSHeapSize ?? null,
      waterfall: res.map(e => [e.name.replace(/^https?:\/\/[^/]+/, ''), Math.round(e.startTime), Math.round(e.responseEnd), e.transferSize, e.initiatorType]) };
  });
  return { ...info, atReady, atReadyTiles };
}
async function waitInstalled(page) {
  await page.waitForFunction(() => window.__perf.swActive !== null, null, { timeout: 120000, polling: 100 }).catch(() => {});
  return page.evaluate(() => ({ swReady: window.__perf.swReady, swActive: window.__perf.swActive }));
}
const go = (page, base) => page.goto(base + '?perf', { waitUntil: 'commit' });

async function visit(page, region, zoom) {
  const [x, y] = regions[region];
  return page.evaluate(async ([x, y, zoom]) => {
    const P = window.__perf, t0 = performance.now();
    window.__leonida.map.setView([-y, x], zoom, { animate: false });
    const s = await P.waitTiles();
    return { ms: Math.round(s.at - t0), tiles: s.loaded, detail: s.detail, overview: s.overview, failed: s.failed, ok: s.ok };
  }, [x, y, zoom]);
}
async function home(page) {
  await page.evaluate(() => { window.__leonida.map.setView([-512, 512], 1.25, { animate: false }); });
  await page.evaluate(() => window.__perf.waitTiles());
}

async function main() {
  const remote = !!args.url;
  const server = remote ? null : await startServer({ dir: args.dir || 'dist', ...profiles[profile] });
  const base = remote ? args.url : server.url;
  const { browser, make } = await launch();
  const results = { meta: { browser: browserName, profile, shape: remote ? 'rede real' : profiles[profile], dpr, cpu, runs, url: remote ? base : 'local:' + (args.dir || 'dist'),
    when: new Date().toISOString(), engine: browser.version(), node: process.version }, scenarios: {} };
  const push = (name, row) => (results.scenarios[name] ??= []).push(row);
  for (let run = 0; run < runs; run++) {
    const context = await make();
    const page = await newPage(context);
    const net = remote ? watchNetwork(context) : null;
    server?.reset();
    await go(page, base);
    const cold = await readLoad(page, server, remote, net);
    const installed = await waitInstalled(page);
    const total = remote ? net.snapshot() : sum(server.stats.byPath);
    if (scenarios.includes('cold')) push('cold', { ...cold, ...installed, total, catalogHits: server ? server.stats.byPath.filter(([p]) => p.endsWith('data/catalog.json')).length : null });

    if (scenarios.includes('region')) {
      for (const region of args.regions ? args.regions.split(',') : ['vicecity']) {
        server?.reset();
        const fresh = await visit(page, region, 5);
        const freshNet = server && sum(server.stats.byPath);
        await home(page);
        server?.reset();
        const again = await visit(page, region, 5);
        const againNet = server && sum(server.stats.byPath);
        await home(page);
        // depois de recarregar: tiles vêm do cache do SW / disco
        await page.reload({ waitUntil: 'commit' });
        await page.waitForFunction(() => window.__perf.ready !== null && window.__leonida, null, { timeout: 60000, polling: 50 });
        server?.reset();
        const afterReload = await visit(page, region, 5);
        const reloadNet = server && sum(server.stats.byPath);
        push('region:' + region, { fresh, freshNet, again, againNet, afterReload, reloadNet });
      }
      const [x, y] = regions.hamlet;
      const steps = [];
      for (const z of [2, 3, 4, 5]) {
        server?.reset();
        const step = await page.evaluate(async ([x, y, z]) => {
          const t0 = performance.now();
          window.__leonida.map.setView([-y, x], z, { animate: false });
          const s = await window.__perf.waitTiles();
          return { z, ms: Math.round(s.at - t0), tiles: s.loaded, detail: s.detail, failed: s.failed };
        }, [x, y, z]);
        steps.push({ ...step, net: server && sum(server.stats.byPath) });
      }
      push('zoomsteps', steps);
    }

    if (scenarios.includes('warm')) {
      server?.reset();
      const t0 = Date.now();
      net?.reset();
      await page.reload({ waitUntil: 'commit' });
      const warm = await readLoad(page, server, remote, net);
      const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
      push('warm', { ...warm, controlled, wall: Date.now() - t0, net: remote ? net.snapshot() : sum(server.stats.byPath) });
    }

    if (scenarios.includes('interact')) {
      await page.waitForFunction(() => performance.getEntriesByName('refresh:first').length > 0);
      const out = await page.evaluate(async () => {
        const P = window.__perf;
        const time = async fn => { const t0 = performance.now(); await fn(); const handler = performance.now() - t0; await P.frame(); return { handler: Math.round(handler * 10) / 10, paint: Math.round((performance.now() - t0) * 10) / 10 }; };
        const click = sel => document.querySelector(sel).click();
        const long0 = P.long.length;
        const r = {};
        r.hideAll = await time(() => click('[data-action="layers-none"]'));
        r.showAll = await time(() => click('[data-action="layers-all"]'));
        r.count = document.getElementById('map-count').textContent;
        r.showAllAgain = await time(() => click('[data-action="layers-all"]'));
        const map = window.__leonida.map;
        for (const z of [1.25, 2, 3]) {
          map.setView([-512, 512], z, { animate: false }); await P.frame();
          const times = [];
          for (let i = 0; i < 12; i++) { const t0 = performance.now(); map.panBy([140, 60], { animate: false }); await P.frame(); times.push(performance.now() - t0); }
          times.sort((a, b) => a - b);
          r['pan@' + z] = { median: Math.round(times[6] * 10) / 10, max: Math.round(times[11] * 10) / 10, drawn: document.getElementById('map').dataset.drawn };
        }
        map.setView([-512, 512], 1.25, { animate: false }); await P.frame();
        r.hideAll2 = await time(() => click('[data-action="layers-none"]'));
        const q = document.getElementById('query');
        const t0 = performance.now();
        q.value = 'bank'; q.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => { const poll = () => [...document.querySelectorAll('#panel-content h2')].some(h => h.textContent === 'Resultados') ? resolve() : requestAnimationFrame(poll); poll(); });
        await P.frame();
        r.search = { perceived: Math.round(performance.now() - t0), results: document.querySelector('#panel-content .section-title span')?.textContent };
        const c0 = performance.now(); q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => { const poll = () => [...document.querySelectorAll('#panel-content h2')].some(h => h.textContent === 'Resultados') ? requestAnimationFrame(poll) : resolve(); poll(); });
        await P.frame();
        r.clearSearch = { handler: 0, paint: Math.round((performance.now() - c0) * 10) / 10 };
        r.chip = await time(() => click('[data-filter="guides"]'));
        r.chipOff = await time(() => click('[data-filter="guides"]'));
        r.longTasks = P.long.length - long0;
        return r;
      });
      push('interact', out);
    }

    if (scenarios.includes('vehicles') || scenarios.includes('rank')) {
      const which = scenarios.includes('vehicles') ? 'vehicles' : 'rank';
      const out = await page.evaluate(async which => {
        const wait = fn => new Promise(resolve => { const t0 = performance.now(); const poll = () => fn() ? resolve(performance.now() - t0) : requestAnimationFrame(poll); poll(); });
        const r = {};
        if (which === 'vehicles') {
          document.querySelector('[data-panel="vehicles"]').click();
          r.finderOpen = Math.round(await wait(() => document.querySelector('.vf-card')));
          r.cards = document.querySelectorAll('.vf-card').length;
        } else {
          document.querySelector('[data-panel="rank"]').click();
          r.rankOpen = Math.round(await wait(() => document.querySelector('#vehicle-ranking button')));
        }
        return r;
      }, which);
      push(which, out);
    }

    if (scenarios.includes('offline')) {
      await visit(page, 'vicecity', 5);
      await home(page);
      await context.setOffline(true);
      await page.reload({ waitUntil: 'commit' });
      const off = await readLoad(page, server, true, net);
      const hd = await visit(page, 'vicecity', 5);
      const other = await visit(page, 'capri', 5);
      push('offline', { ready: off.mapReady, interactive: off.interactive, hd, notVisited: other });
      await context.setOffline(false);
    }
    await context.close();
  }
  await browser.close();
  await server?.close();
  const out = args.out || `docs/performance/raw/${browserName}-${profile}-${scenarios.join('+')}.json`;
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(results, null, 1));
  console.log('Gravado em ' + out);
  summarize(results);
}

export function summarize(results) {
  const pick = (rows, f) => rows.map(f).filter(v => v != null && Number.isFinite(v));
  const line = (label, values, unit = 'ms') => {
    if (!values.length) return;
    const s = [...values].sort((a, b) => a - b);
    console.log(label.padEnd(30) + 'med ' + String(Math.round(median(values))).padStart(8) + unit + '  min ' + String(Math.round(s[0])).padStart(8) + '  max ' + String(Math.round(s.at(-1))).padStart(8) + '  n=' + values.length);
  };
  for (const [name, rows] of Object.entries(results.scenarios)) {
    console.log('\n== ' + name);
    if (name === 'cold' || name === 'warm') {
      for (const k of ['fcp', 'firstTile', 'mapReady', 'catalogHeaders', 'catalogParsed', 'guides', 'mapCreated', 'interactive', 'swActive', 'longTaskMs']) line(k, pick(rows, r => r[k]));
      line('bytes até mapa pronto', pick(rows, r => r.atReady?.bytes), 'B'); line('req até mapa pronto', pick(rows, r => r.atReady?.requests), '');
      line('GET catalog.json (servidor)', pick(rows, r => r.catalogHits), '');
      line('bytes total (c/ SW)', pick(rows, r => r.total?.bytes ?? r.net?.bytes), 'B'); line('req total', pick(rows, r => r.total?.requests ?? r.net?.requests), '');
    } else if (name.startsWith('region:')) {
      for (const k of ['fresh', 'again', 'afterReload']) { line(k + ' ms', pick(rows, r => r[k].ms)); line(k + ' tiles', pick(rows, r => r[k].tiles), ''); }
      line('bytes inédita', pick(rows, r => r.freshNet?.bytes), 'B'); line('req inédita', pick(rows, r => r.freshNet?.requests), '');
      line('req revisita', pick(rows, r => r.againNet?.requests), ''); line('req após reload', pick(rows, r => r.reloadNet?.requests), '');
    } else if (name === 'interact') {
      for (const k of ['hideAll', 'showAll', 'showAllAgain', 'hideAll2', 'clearSearch', 'chip', 'chipOff']) { line(k + ' handler', pick(rows, r => r[k].handler)); line(k + ' até pintura', pick(rows, r => r[k].paint)); }
      line('busca percebida', pick(rows, r => r.search.perceived)); for (const z of ['1.25', '2', '3']) line('pan@' + z + ' (panBy→pintura)', pick(rows, r => r['pan@' + z]?.median)); line('long tasks', pick(rows, r => r.longTasks), '');
    } else if (name === 'vehicles') line('Car Finder 1ª abertura até cards', pick(rows, r => r.finderOpen));
    else if (name === 'rank') line('Ranking 1ª abertura até lista', pick(rows, r => r.rankOpen));
    else if (name === 'offline') { line('offline mapa pronto', pick(rows, r => r.ready)); line('offline interativo', pick(rows, r => r.interactive)); line('HD visitado ms', pick(rows, r => r.hd.ms)); line('HD visitado falhas', pick(rows, r => r.hd.failed), ''); line('não visitado: tiles detalhe', pick(rows, r => r.notVisited.detail), ''); }
    else if (name === 'zoomsteps') for (const z of [2, 3, 4, 5]) { line('z' + z + ' ms', rows.map(r => r.find(s => s.z === z)?.ms)); line('z' + z + ' bytes', rows.map(r => r.find(s => s.z === z)?.net?.bytes), 'B'); }
  }
}
if (process.argv[1] && /measure\.mjs$/.test(process.argv[1])) main().catch(error => { console.error(error); process.exit(1); });
