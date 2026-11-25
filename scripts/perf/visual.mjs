// Equivalência visual e de assets entre dois builds: mesmos tiles (hash), mesmas capturas (mesma coordenada, zoom, viewport e DPR).
//   node scripts/perf/visual.mjs --a <dist-antigo> --b <dist-novo>
import { chromium } from '@playwright/test';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { startServer } from './serve.mjs';

const flags = process.argv.slice(2);
const args = {};
flags.forEach((value, i) => { if (value.startsWith('--')) args[value.slice(2)] = flags[i + 1] && !flags[i + 1].startsWith('--') ? flags[i + 1] : 'true'; });
const sha = buffer => createHash('sha256').update(buffer).digest('hex');

async function tileHashes(dir) {
  const root = path.join(dir, 'tiles', 'game');
  const hash = createHash('sha256');
  let count = 0;
  for (const level of (await readdir(root)).sort()) {
    for (const file of (await readdir(path.join(root, level))).sort()) {
      hash.update(level + '/' + file).update(await readFile(path.join(root, level, file)));
      count++;
    }
  }
  return { count, digest: hash.digest('hex') };
}
const tilesA = await tileHashes(args.a), tilesB = await tileHashes(args.b);
console.log('Tiles:', tilesA.count, 'x', tilesB.count, tilesA.digest === tilesB.digest ? 'IDÊNTICOS (sha256 de nomes + bytes)' : 'DIFERENTES');

const views = [['home', -512, 512, 1.25], ['vicecity z5', -489.7, 503.9, 5], ['hamlet z3.5', -610.6, 421.4, 3.5], ['capri z6.5', -506.8, 289.3, 6.5]];
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const diffPage = await (await browser.newContext()).newPage();
/** Diferença por pixel entre dois PNG (canvas do próprio navegador): quantos pixels diferem e o maior delta de canal. */
async function diffPNG(a, b) {
  return diffPage.evaluate(async ([x, y]) => {
    const load = async base64 => { const img = new Image(); img.src = 'data:image/png;base64,' + base64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
    const [p, q] = await Promise.all([load(x), load(y)]);
    if (p.width !== q.width || p.height !== q.height) return { size: false };
    let diff = 0, max = 0;
    for (let i = 0; i < p.data.length; i += 4) { const d = Math.max(Math.abs(p.data[i] - q.data[i]), Math.abs(p.data[i + 1] - q.data[i + 1]), Math.abs(p.data[i + 2] - q.data[i + 2])); if (d) { diff++; if (d > max) max = d; } }
    return { size: true, diffPixels: diff, total: p.width * p.height, maxDelta: max };
  }, [a.toString('base64'), b.toString('base64')]);
}
await mkdir('test-results/visual', { recursive: true });
for (const dpr of [1, 2, 3]) {
  const shots = {};
  for (const [label, dir] of [['a', args.a], ['b', args.b]]) {
    const server = await startServer({ dir });
    const context = await browser.newContext({ viewport: { width: 900, height: 640 }, deviceScaleFactor: dpr, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(server.url + '?perf');
    await page.waitForFunction(() => document.getElementById('map')?.dataset.points !== undefined);
    for (const [name, lat, lng, zoom] of views) {
      await page.evaluate(([lat, lng, zoom]) => window.__leonida.map.setView([lat, lng], zoom, { animate: false }), [lat, lng, zoom]);
      await page.waitForFunction(() => {
        const box = document.getElementById('map').getBoundingClientRect();
        const imgs = [...document.querySelectorAll('#map img.leaflet-tile')].filter(img => { const r = img.getBoundingClientRect(); return r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom; });
        return imgs.length > 0 && imgs.every(img => img.classList.contains('leaflet-tile-loaded') || img.style.visibility === 'hidden');
      });
      await page.waitForTimeout(350); // deixa terminar o fade-in dos tiles do Leaflet (200 ms) antes da captura
      const png = await page.locator('#map').screenshot();
      (shots[name] ??= {})[label] = { png, hash: sha(png), size: png.length, urls: await page.evaluate(() => [...document.querySelectorAll('#map img.leaflet-tile')].map(img => new URL(img.src).pathname.split('/').slice(-2).join('/')).sort().join('|')) };
      if (label === 'a') await writeFile('test-results/visual/' + name.replace(/\W+/g, '-') + '-dpr' + dpr + '-a.png', png);
      else await writeFile('test-results/visual/' + name.replace(/\W+/g, '-') + '-dpr' + dpr + '-b.png', png);
    }
    await context.close();
    await server.close();
  }
  for (const [name] of views) {
    const { a, b } = shots[name];
    const d = a.hash === b.hash ? { diffPixels: 0, total: 0, maxDelta: 0 } : await diffPNG(a.png, b.png);
    results.push({ dpr, view: name, tilesSame: sha(Buffer.from(a.urls)) === sha(Buffer.from(b.urls)), pixelsSame: a.hash === b.hash, diffPixels: d.diffPixels, maxDelta: d.maxDelta, pct: d.total ? (100 * d.diffPixels / d.total).toFixed(3) + '%' : '0%' });
  }
}
await browser.close();
console.table(results);
if (results.some(r => !r.tilesSame || r.maxDelta > 1)) process.exitCode = 1;
