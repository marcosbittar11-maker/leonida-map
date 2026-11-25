// Perfil de CPU (Chromium/CDP) de uma ação do app, para atribuir gargalos por função.
//   node scripts/perf/profile.mjs --dir dist --action search|showAll|startup [--cpu 4]
import { chromium } from '@playwright/test';
import { startServer } from './serve.mjs';

const flags = process.argv.slice(2);
const args = {};
flags.forEach((value, i) => { if (value.startsWith('--')) args[value.slice(2)] = flags[i + 1] && !flags[i + 1].startsWith('--') ? flags[i + 1] : 'true'; });
const action = args.action || 'search';
const server = await startServer({ dir: args.dir || 'dist' });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (args.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(args.cpu) });
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
if (action === 'startup') { await cdp.send('Profiler.start'); await page.goto(server.url + '?perf'); await page.waitForFunction(() => performance.getEntriesByName('refresh:first').length || document.getElementById('map')?.dataset.points !== undefined); }
else {
  await page.goto(server.url + '?perf');
  await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined);
  if (action === 'sequence') {
    // reproduz o preparo do cenário "interact" do harness e perfila só a busca
    await page.evaluate(async () => {
      const frame = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
      document.querySelector('[data-action="layers-none"]').click(); await frame();
      document.querySelector('[data-action="layers-all"]').click(); await frame();
      document.querySelector('[data-action="layers-all"]').click(); await frame();
      const map = window.__leonida.map;
      for (const z of [1.25, 2.5]) { map.setView([-512, 512], z, { animate: false }); await frame(); for (let i = 0; i < 12; i++) { map.panBy([140, 60], { animate: false }); await frame(); } }
      map.setView([-512, 512], 1.25, { animate: false }); await frame();
      document.querySelector('[data-action="layers-none"]').click(); await frame();
    });
  }
  await cdp.send('Profiler.start');
  if (action === 'search' || action === 'sequence') {
    await page.evaluate(async () => {
      document.querySelector('[data-action="layers-none"]').click();
      const q = document.getElementById('query');
      q.value = 'bank'; q.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => { const poll = () => [...document.querySelectorAll('#panel-content h2')].some(h => h.textContent === 'Resultados') ? resolve() : requestAnimationFrame(poll); poll(); });
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)));
    });
  } else if (action === 'showAll') {
    await page.evaluate(async () => { document.querySelector('[data-action="layers-all"]').click(); await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve))); });
  }
}
const { profile } = await cdp.send('Profiler.stop');
const self = new Map(), byId = new Map(profile.nodes.map(n => [n.id, n]));
const dt = profile.timeDeltas; let total = 0;
profile.samples.forEach((id, i) => {
  const node = byId.get(id); const f = node.callFrame;
  const key = (f.functionName || '(anônima)') + ' ' + f.url.split('/').pop() + ':' + f.lineNumber;
  self.set(key, (self.get(key) || 0) + dt[i] / 1000); total += dt[i] / 1000;
});
console.log('Ação:', action, '| amostrado', Math.round(total), 'ms');
for (const [key, ms] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 18)) console.log(String(Math.round(ms * 10) / 10).padStart(8) + ' ms  ' + key);
await browser.close(); await server.close();
