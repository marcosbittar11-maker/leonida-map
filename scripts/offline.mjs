import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
async function filenames(dir) {
  const list = await readdir(new URL(dir,dist), {withFileTypes:true});
  const children = await Promise.all(list.map(entry => entry.isDirectory() ? filenames(dir + entry.name + '/') : dir + entry.name));
  return children.flat();
}
const files=(await filenames('./')).filter(name=>name!=='./sw.js').sort();
const hash=createHash('sha256');
for (const name of files) hash.update(name).update(await readFile(new URL(name,dist)));
const sw = await readFile(new URL('./service-worker.js',import.meta.url),'utf8');
const version=hash.update(sw).digest('hex').slice(0,14);
await writeFile(new URL('sw.js',dist),'const VERSION = '+JSON.stringify(version)+';\nconst FILES = '+JSON.stringify(files)+';\n'+sw);
console.log('PWA offline: '+files.length+' recursos, versão '+version);

