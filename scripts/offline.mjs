import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tileSource } from '../src/tiles.js';

const dist = new URL('../dist/', import.meta.url);
async function filenames(dir) {
  const list = await readdir(new URL(dir,dist), {withFileTypes:true});
  const children = await Promise.all(list.map(entry => entry.isDirectory() ? filenames(dir + entry.name + '/') : dir + entry.name));
  return children.flat();
}
// Tiles de detalhe (z3–z6, ~31 mil arquivos) ficam fora do precache e do hash: são obtidos sob demanda
// e identificados pela revisão da fonte. A visão geral (z0–z2) entra no precache para o mapa abrir offline.
const tileLevel = name => /^\.\/tiles\/game\/(\d+)\//.exec(name)?.[1];
const detailTile = name => tileLevel(name) !== undefined && Number(tileLevel(name)) > tileSource.overviewMaxZoom;
const assets=(await filenames('./')).filter(name=>name!=='./sw.js'&&!detailTile(name)).sort();
const files=assets.filter(name=>!name.startsWith('./vehicles/'));
const hash=createHash('sha256').update(tileSource.revision);
for (const name of assets) hash.update(name).update(await readFile(new URL(name,dist)));
const sw = await readFile(new URL('./service-worker.js',import.meta.url),'utf8');
const version=hash.update(sw).digest('hex').slice(0,14);
await writeFile(new URL('sw.js',dist),'const VERSION = '+JSON.stringify(version)+';\nconst TILE_REVISION = '+JSON.stringify(tileSource.revision.slice(0,12))+
  ';\nconst FILES = '+JSON.stringify(files)+';\n'+sw);
const overview=files.filter(name=>tileLevel(name)!==undefined).length;
console.log('PWA offline: '+files.length+' recursos ('+overview+' tiles de visão geral), versão '+version);
