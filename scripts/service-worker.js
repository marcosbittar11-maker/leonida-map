const shell = 'leonida-shell-' + VERSION;
const tiles = 'leonida-hd-' + VERSION;
const scope = self.registration.scope;
const toURL = file => new URL(file,scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(shell).then(cache=>cache.addAll(FILES.map(toURL))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>/^leonida-(shell|hd)-/.test(k)&&k!==shell&&k!==tiles)
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.href.startsWith(scope)) {
    if(request.mode==='navigate')event.respondWith(caches.open(shell).then(cache=>cache.match(toURL(url.pathname.endsWith('/icons.html')?'./icons.html':'./index.html'))).then(found=>found||fetch(request)));
    else if(url.href.startsWith(toURL('./vehicles/')))event.respondWith((async()=>{
      const cache=await caches.open(shell);
      const hit=await cache.match(request);
      if(hit)return hit;
      const response=await fetch(request);
      if(response.ok)await cache.put(request,response.clone()).catch(()=>{});
      return response;
    })());
    else event.respondWith(caches.open(shell).then(cache=>cache.match(request,{ignoreVary:true})).then(found=>found||fetch(request)));
    return;
  }
  if(url.hostname!=='cdn.jsdelivr.net'||!url.pathname.includes('/public/tiles/night/'))return;
  event.respondWith((async()=>{
    const cache=await caches.open(tiles);
    const hit=await cache.match(request);
    if(hit)return hit;
    const response=await fetch(request);
    if(response.ok){
      try {
        await cache.put(request,response.clone());
        const keys=await cache.keys();
        await Promise.all(keys.slice(0,Math.max(0,keys.length-72)).map(key=>cache.delete(key)));
      } catch { /* Map remains usable without high-detail caching. */ }
    }
    return response;
  })());
});

