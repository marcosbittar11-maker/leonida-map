const shell = 'leonida-shell-' + VERSION;
// Detalhes do mapa ficam num cache próprio, ligado à revisão dos tiles: publicar o app não apaga o que já foi visto.
const tiles = 'leonida-tiles-' + TILE_REVISION;
const TILE_BUDGET = 3000; // ~3 KB por tile JPEG de 256 px: cerca de 9 MB no pior caso.
const scope = self.registration.scope;
const toURL = file => new URL(file,scope).href;
const tilePrefix = toURL('./tiles/game/');
let puts = 0;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(shell).then(cache=>cache.addAll(FILES.map(toURL))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>/^leonida-(shell|hd|tiles)-/.test(k)&&k!==shell&&k!==tiles)
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

async function tile(request) {
  // Ignora o parâmetro de nova tentativa: o arquivo é o mesmo.
  const url = new URL(request.url); url.search = '';
  const key = url.href;
  const precached = await caches.open(shell).then(cache=>cache.match(key));
  if (precached) return precached;
  const cache = await caches.open(tiles);
  const hit = await cache.match(key);
  if (hit) return hit;
  const response = await fetch(key);
  if (response.ok) {
    try {
      await cache.put(key,response.clone());
      if (++puts % 50 === 0) {
        const keys = await cache.keys();
        await Promise.all(keys.slice(0,Math.max(0,keys.length-TILE_BUDGET)).map(old=>cache.delete(old)));
      }
    } catch { /* O mapa continua utilizável sem o cache de detalhes. */ }
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(!url.href.startsWith(scope))return;
  if(request.mode==='navigate')event.respondWith(caches.open(shell).then(cache=>cache.match(toURL(url.pathname.endsWith('/icons.html')?'./icons.html':'./index.html'))).then(found=>found||fetch(request)));
  else if(url.href.startsWith(tilePrefix))event.respondWith(tile(request));
  else if(url.href.startsWith(toURL('./vehicles/')))event.respondWith((async()=>{
    const cache=await caches.open(shell);
    const hit=await cache.match(request);
    if(hit)return hit;
    const response=await fetch(request);
    if(response.ok)await cache.put(request,response.clone()).catch(()=>{});
    return response;
  })());
  else event.respondWith(caches.open(shell).then(cache=>cache.match(request,{ignoreVary:true})).then(found=>found||fetch(request)));
});
