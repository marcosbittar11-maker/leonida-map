import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../scripts/service-worker.js', import.meta.url), 'utf8');
const scope = 'https://exemplo.test/leonida-map/';
const tile = (z, name = '1,2,3') => scope + 'tiles/game/' + z + '/' + z + ',' + name + '.jpg';
const image = () => new Response(new Uint8Array([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg' } });

/** Executa o service worker de verdade em um contexto isolado, com Cache Storage e rede simulados. */
function boot({ fetchImpl, putFails = false } = {}) {
  const stores = new Map(), listeners = {}, calls = { fetch: [], match: [] };
  const cache = name => {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async match(key) { calls.match.push(name); const hit = entries.get(typeof key === 'string' ? key : key.url); return hit?.clone(); },
      async put(key, response) { if (putFails) throw new DOMException('cheio', 'QuotaExceededError'); entries.set(typeof key === 'string' ? key : key.url, response); },
      async keys() { return [...entries.keys()].map(url => ({ url })); },
      async delete(key) { return entries.delete(typeof key === 'string' ? key : key.url); },
      async addAll() {}
    };
  };
  const context = {
    self: { registration: { scope }, addEventListener: (type, fn) => { listeners[type] = fn; }, skipWaiting() {}, clients: { claim() {} } },
    caches: { open: async name => cache(name), keys: async () => [...stores.keys()], delete: async name => stores.delete(name) },
    fetch: async (url, options) => { calls.fetch.push([String(url), options]); return fetchImpl ? fetchImpl(String(url), options) : image(); },
    URL, Response, Request, Headers, DOMException, Promise, console
  };
  vm.runInNewContext('const VERSION="v1";const TILE_REVISION="rev1";const OVERVIEW_MAX=2;const FILES=[];' + source, context);
  async function request(url, extra = {}) {
    const waits = [];
    let responded;
    const event = { request: { url, method: 'GET', mode: 'no-cors', ...extra }, waitUntil: p => waits.push(p), respondWith: p => { responded = p; } };
    listeners.fetch(event);
    // A gravação em segundo plano precisa estar registrada durante o despacho, não depois.
    const registeredAtDispatch = waits.length;
    const response = await responded;
    await Promise.all(waits);
    return { response, registeredAtDispatch };
  }
  return { stores, calls, request, cache };
}

test('tile de detalhe: rede uma vez, resposta devolvida e gravação no cache de tiles da revisão', async () => {
  const sw = boot();
  const { response, registeredAtDispatch } = await sw.request(tile(4));
  assert.equal(response.status, 200);
  assert.equal(registeredAtDispatch, 1);
  assert.deepEqual([...sw.stores.keys()], ['leonida-tiles-rev1']);
  assert.ok(sw.stores.get('leonida-tiles-rev1').has(tile(4)));
  // Segunda requisição: acerto no cache, sem rede.
  await sw.request(tile(4));
  assert.equal(sw.calls.fetch.length, 1);
});

test('níveis de detalhe não consultam o shell; a visão geral sim', async () => {
  const sw = boot();
  await sw.cache('leonida-shell-v1').put(tile(1, '0,0'), image());
  const overview = await sw.request(tile(1, '0,0'));
  assert.equal(overview.response.status, 200);
  assert.equal(sw.calls.fetch.length, 0);
  sw.calls.match.length = 0;
  await sw.request(tile(5));
  assert.ok(!sw.calls.match.includes('leonida-shell-v1'));
});

test('erros e respostas que não são imagem nunca entram no cache', async () => {
  for (const make of [() => new Response('<html>erro</html>', { status: 200, headers: { 'content-type': 'text/html' } }),
    () => new Response('nao achei', { status: 404, headers: { 'content-type': 'text/plain' } }),
    () => new Response('falha', { status: 503, headers: { 'content-type': 'image/jpeg' } })]) {
    const sw = boot({ fetchImpl: make });
    const { response } = await sw.request(tile(4));
    assert.ok(response);
    assert.equal(sw.stores.get('leonida-tiles-rev1')?.size ?? 0, 0);
  }
});

test('nova tentativa ignora cache HTTP e cache do app, usa a URL sem ?retry e regrava', async () => {
  const sw = boot();
  const stale = new Response('corrompido', { status: 200, headers: { 'content-type': 'image/jpeg' } });
  await sw.cache('leonida-tiles-rev1').put(tile(4), stale);
  const { response } = await sw.request(tile(4) + '?retry=1');
  assert.equal(sw.calls.fetch.length, 1);
  assert.equal(sw.calls.fetch[0][0], tile(4));
  assert.equal(sw.calls.fetch[0][1].cache, 'reload');
  assert.equal(response.status, 200);
  const stored = sw.stores.get('leonida-tiles-rev1').get(tile(4));
  assert.notEqual(stored, stale);
});

test('falha de rede propaga erro, para a página tentar de novo, e nada é gravado', async () => {
  const sw = boot({ fetchImpl: () => { throw new TypeError('offline'); } });
  await assert.rejects(sw.request(tile(4)), /offline/);
  assert.equal(sw.stores.get('leonida-tiles-rev1')?.size ?? 0, 0);
});

test('cota esgotada não derruba a resposta', async () => {
  const sw = boot({ putFails: true });
  const { response } = await sw.request(tile(4));
  assert.equal(response.status, 200);
});

test('evicção em lote: passa de 3.000 e volta ao orçamento com folga, mantendo os mais recentes', async () => {
  const sw = boot();
  const store = sw.cache('leonida-tiles-rev1');
  for (let i = 0; i < 3000; i++) await store.put(tile(5, i + ',0'), image());
  // 50 novas gravações: a 50ª dispara a evicção em lote.
  for (let i = 0; i < 50; i++) await sw.request(tile(6, 'novo' + i));
  const entries = sw.stores.get('leonida-tiles-rev1');
  assert.ok(entries.size <= 3000 - 150 + 1 && entries.size >= 2800, 'tamanho ' + entries.size);
  assert.ok(!entries.has(tile(5, '0,0')), 'o mais antigo saiu');
  assert.ok(entries.has(tile(6, 'novo49')), 'o mais recente ficou');
});

test('fotos de veículos usam o shell e também gravam fora do caminho de resposta', async () => {
  const sw = boot({ fetchImpl: () => new Response(new Uint8Array([9]), { status: 200, headers: { 'content-type': 'image/webp' } }) });
  const url = scope + 'vehicles/exemplo.webp';
  const { registeredAtDispatch } = await sw.request(url);
  assert.equal(registeredAtDispatch, 1);
  assert.ok(sw.stores.get('leonida-shell-v1').has(url));
});
