import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { prepareCatalog } from './normalize.mjs';

const repo = 'fbritoferreira/gta6';
const revision = process.argv[2] ?? 'd8609016b8a883988d7abac4b6b1b1d98708ca70';
if (!/^[a-f0-9]{40}$/i.test(revision)) throw new Error('Use o SHA completo da revisão.');
const base = 'https://raw.githubusercontent.com/' + repo + '/' + revision + '/public/';
const dir = new URL('../public/data/', import.meta.url);
await mkdir(dir, { recursive: true });
const hashes = {};
const previous = await readFile(new URL('catalog.json', dir), 'utf8').then(JSON.parse).catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return { aliases: {} };
});
const names = ['locations', 'places', 'categories', 'labels'];
const inputs = Object.fromEntries(await Promise.all(names.map(async name => {
  const content = await fetchBytes('data/' + name + '.json');
  hashes[name] = createHash('sha256').update(content).digest('hex');
  return [name, JSON.parse(content)];
})));
const metadata = { revision, verified: new Date().toISOString().slice(0, 10), hashes };
const catalog = prepareCatalog(inputs, metadata, previous.aliases);
// A cartografia base vem do GTADB: scripts/import-tiles.mjs.
await save('catalog.json', catalog);
console.log(JSON.stringify(catalog.stats));

async function save(name, data) {
  await writeFile(new URL(name + '.tmp', dir), JSON.stringify(data));
  await rename(new URL(name + '.tmp', dir), new URL(name, dir));
}

async function fetchBytes(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(path + ' → ' + response.status);
  return Buffer.from(await response.arrayBuffer());
}

