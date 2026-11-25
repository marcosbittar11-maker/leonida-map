const shell = 'leonida-shell-' + VERSION;
// Detalhes do mapa ficam num cache próprio, ligado à revisão dos tiles: publicar o app não apaga o que já foi visto.
const tiles = 'leonida-tiles-' + TILE_REVISION;
const TILE_BUDGET = 3000; // ~3 KB por tile JPEG de 256 px: cerca de 9 MB no pior caso.
const TILE_SLACK = 150;   // a evicção em lote deixa folga para não rodar a cada gravação.
const scope = self.registration.scope;
const toURL = file => new URL(file,scope).href;
const tilePrefix = toURL('./tiles/game/');
const vehiclePrefix = toURL('./vehicles/');
const overviewTile = new RegExp('/tiles/game/[0-' + OVERVIEW_MAX + ']/');
let puts = 0, trimming = null;

// Uma promessa de abertura por cache: evita repetir caches.open() em cada tile.
const handles = new Map();
const open = name => {
  if (!handles.has(name)) handles.set(name,caches.open(name).catch(error=>{handles.delete(name);throw error;}));
  return handles.get(name);
};

self.addEventListener('install', event => {
  event.waitUntil(open(shell).then(cache=>cache.addAll(FILES.map(toURL))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>/^leonida-(shell|hd|tiles)-/.test(k)&&k!==shell&&k!==tiles)
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

/** Evicção em lote, fora do caminho de resposta: remove os mais antigos (ordem de gravação) acima do orçamento. */
function trim(cache) {
  return trimming ??= (async()=>{
    try {
      const keys = await cache.keys();
      const extra = keys.length - (TILE_BUDGET - TILE_SLACK);
      if (keys.length > TILE_BUDGET) await Promise.all(keys.slice(0,extra).map(old=>cache.delete(old)));
    } catch { /* sem evicção desta vez */ }
    finally { trimming = null; }
  })();
}
/** Só guarda imagens bem-sucedidas: nunca erros nem HTML. A falha de cache não afeta a resposta. */
async function store(name, key, response) {
  try {
    const cache = await open(name);
    await cache.put(key,response);
    if (name === tiles && ++puts % 50 === 0) await trim(cache);
  } catch { handles.delete(name); /* quota cheia ou cache removido: o mapa segue funcionando sem o cache */ }
}
const isImage = response => response.ok && /^image\//i.test(response.headers.get('content-type') || '');

async function tile(request, background) {
  const url = new URL(request.url);
  // Nova tentativa (?retry=N): o arquivo é o mesmo, mas ignora o cache HTTP e o cache do app e regrava, porque
  // o erro pode vir de uma cópia corrompida ou obsoleta.
  const retry = url.searchParams.has('retry');
  url.search = '';
  const key = url.href;
  if (!retry) {
    // A visão geral (z0–z2) está no precache; os níveis de detalhe nunca estão: não vale consultar o shell por eles.
    if (overviewTile.test(key)) {
      const precached = await open(shell).then(cache=>cache.match(key));
      if (precached) return precached;
    }
    const hit = await open(tiles).then(cache=>cache.match(key)).catch(()=>undefined);
    if (hit) return hit;
  }
  const response = await fetch(key,retry ? {cache:'reload'} : undefined);
  // A resposta de rede segue para a página sem esperar a gravação; o service worker fica vivo até ela terminar.
  if (isImage(response)) background(store(tiles,key,response.clone()));
  return response;
}

async function vehicleAsset(request, background) {
  const cache = await open(shell);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) background(store(shell,request,response.clone()));
  return response;
}

/** Responde já e mantém o service worker vivo até as gravações em segundo plano terminarem (registrado durante o despacho). */
function respond(event, work) {
  const tasks = [];
  const result = work(task => tasks.push(task));
  event.waitUntil(result.then(()=>Promise.allSettled(tasks),()=>Promise.allSettled(tasks)));
  event.respondWith(result);
}

self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(!url.href.startsWith(scope))return;
  if(request.mode==='navigate')event.respondWith(open(shell).then(cache=>cache.match(toURL(url.pathname.endsWith('/icons.html')?'./icons.html':'./index.html'))).then(found=>found||fetch(request)));
  else if(url.href.startsWith(tilePrefix))respond(event,background=>tile(request,background));
  else if(url.href.startsWith(vehiclePrefix))respond(event,background=>vehicleAsset(request,background));
  else event.respondWith(open(shell).then(cache=>cache.match(request,{ignoreVary:true})).then(found=>found||fetch(request)));
});
