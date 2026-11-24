
import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { consolidate, applyOverrides } from './vehicles-normalize.mjs';
import { sources } from './vehicle-facts.mjs';

const option = process.argv.indexOf('--inputs');
const overridesOnly = process.argv.includes('--overrides-only');
if (option!==-1 && !process.argv[option+1]) throw Error('Informe a pasta de insumos após --inputs.');
const cache = option===-1 ? null : process.argv[option+1];
const target = new URL('../public/data/vehicles.json',import.meta.url);
const json = file=>readFile(file,'utf8').then(JSON.parse);
async function read(name,url,required=false) {
  try {
    if (cache) return await readFile(join(cache,name),'utf8');
    const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
    if (!response.ok) throw Error('HTTP '+response.status);
    return await response.text();
  } catch (error) {
    if (required) throw error;
    console.warn('Fonte '+name+' indisponível. Os registros anteriores serão preservados.');
    return '';
  }
}

if (overridesOnly) {
  // Reaplica apenas scripts/vehicle-overrides.json sobre o catálogo atual, sem consultar fontes externas.
  const current = JSON.parse(await readFile(target,'utf8'));
  const byId = new Map(current.vehicles.map(v=>[v.id,v]));
  applyOverrides(byId,JSON.parse(await readFile(new URL('./vehicle-overrides.json',import.meta.url),'utf8')));
  const output = {...current,vehicles:[...byId.values()].sort((a,b)=>a.id.localeCompare(b.id,'en'))};
  await writeFile(new URL('vehicles.json.tmp',target),JSON.stringify(output)+'\n');
  await rename(new URL('vehicles.json.tmp',target),target);
  console.log(output.vehicles.length+' veículos, '+output.vehicles.filter(v=>v.resale).length+' com revenda (somente correções manuais).');
  process.exit(0);
}
const [labText,finder,pedia,my,catalog,manual,previous,first] = await Promise.all([
  read('lab',sources.lab,true), read('finder',sources.finder), read('pedia',sources.pedia), read('my',sources.my),
  json(new URL('../public/data/catalog.json',import.meta.url)), json(new URL('./vehicle-overrides.json',import.meta.url)),
  json(target).catch(error=>{if(error.code!=='ENOENT') throw error; return null;}),
  read('finder-1',sources.finderList),
]);
const nextPage = page=>Number(/class="btn" href="\/vehicles\?page=(\d+)"/.exec(page)?.[1]);
const pages=[];
for (let page=first, n=nextPage(first); page; n=nextPage(page)) {
  pages.push(page);
  if (!n || n<=pages.length || n>50) break;
  page=await read('finder-'+n,sources.finderList+'?page='+n);
}
const output=consolidate({lab:JSON.parse(labText),finder,pedia,my,pages,catalog,manual,previous,
  date:new Date().toISOString().slice(0,10)});
if (new Set(output.vehicles.map(v=>v.id)).size!==output.vehicles.length) throw Error('IDs de veículos duplicados.');
await writeFile(new URL('vehicles.json.tmp',target),JSON.stringify(output)+'\n');
await rename(new URL('vehicles.json.tmp',target),target);
console.log(output.vehicles.length+' veículos, '+output.vehicles.filter(v=>v.resale).length+' com revenda, '+pages.length+' páginas de catálogo.');
