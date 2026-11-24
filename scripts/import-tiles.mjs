// Copia a pirâmide "day" do GTADB (CC BY 4.0) para public/tiles/game/, na revisão fixada em src/tiles.js.
// O GTADB pede `git pull`/sparse checkout em vez de buscar mídia ao vivo no domínio; por isso o clone é parcial.
// Uso: node scripts/import-tiles.mjs [pasta-de-um-checkout-existente]
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tileSource, tileFile } from '../src/tiles.js';

const target = fileURLToPath(new URL('../public/tiles/game/', import.meta.url));
let checkout = process.argv[2];
const temporary = !checkout;
if (temporary) {
  checkout = await mkdtemp(join(tmpdir(), 'gtadb-'));
  const git = (...args) => execFileSync('git', args, { cwd: checkout, stdio: 'inherit' });
  git('clone', '--filter=blob:none', '--no-checkout', '--sparse', 'https://github.com/' + tileSource.repo + '.git', '.');
  git('sparse-checkout', 'set', tileSource.path);
  git('checkout', '-q', tileSource.revision);
}
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: checkout, encoding: 'utf8' }).trim();
if (head !== tileSource.revision) throw new Error('Checkout em ' + head + ', esperado ' + tileSource.revision);
const source = join(checkout, tileSource.path);
// Confere que cada nível tem exatamente o retângulo declarado antes de copiar.
for (const [z, [[x0, y0], [x1, y1]]] of Object.entries(tileSource.ranges)) {
  const names = new Set(await readdir(join(source, z)));
  const expected = (x1 - x0 + 1) * (y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++)
    if (!names.has(tileFile(z, y, x).split('/')[1])) throw new Error('Tile ausente: ' + tileFile(z, y, x));
  if (names.size !== expected) throw new Error('Nível ' + z + ': ' + names.size + ' arquivos, esperado ' + expected);
}
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
let files = 0, bytes = 0;
for (const z of await readdir(target)) for (const name of await readdir(join(target, z))) {
  files++; bytes += (await stat(join(target, z, name))).size;
}
console.log('Tiles GTADB ' + head.slice(0, 7) + ': ' + files + ' arquivos, ' + (bytes / 1048576).toFixed(1) + ' MB em public/tiles/game/');
if (temporary) await rm(checkout, { recursive: true, force: true });
