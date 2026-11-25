// Servidor estático para medir o build de produção de forma repetível. Imita o essencial do GitHub Pages:
// Cache-Control max-age=600, ETag/304 e compressão Brotli/gzip para texto. Opcionalmente molda a rede:
// latência fixa por resposta e banda total compartilhada (vale para o navegador e para o service worker, em qualquer engine).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const compressible = new Set(['.html','.js','.css','.json','.webmanifest','.svg']);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// O GitHub Pages serve só gzip (sem Brotli): por padrão o servidor local faz o mesmo. `brotli: true` liga Brotli para comparação.
export async function startServer({ dir, port = 0, latency = 0, kbps = 0, brotli = false } = {}) {
  let root = path.resolve(dir);
  const cache = new Map();
  const stats = { requests: 0, bytes: 0, byPath: [] };
  let nextFree = 0;
  async function throttle(bytes) {
    if (!kbps) return;
    const now = Date.now();
    nextFree = Math.max(nextFree, now) + bytes * 8 / (kbps * 1000) * 1000;
    const wait = nextFree - now;
    if (wait > 0) await sleep(wait);
  }
  async function load(file, ext, accept) {
    const stamp = file + '|' + root;
    let entry = cache.get(stamp);
    if (!entry) {
      const body = await readFile(file);
      const info = await stat(file);
      entry = { body, br: null, gz: null, etag: '"' + createHash('sha1').update(body).digest('hex').slice(0, 16) + '"', mtime: info.mtime };
      cache.set(stamp, entry);
    }
    if (compressible.has(ext)) {
      if (brotli && /\bbr\b/.test(accept)) return { ...entry, encoding: 'br', body: entry.br ??= brotliCompressSync(entry.body, { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } }) };
      if (/\bgzip\b/.test(accept)) return { ...entry, encoding: 'gzip', body: entry.gz ??= gzipSync(entry.body, { level: 6 }) };
    }
    return { ...entry, encoding: null };
  }
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(root, rel);
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      const ext = path.extname(file);
      let entry;
      try { entry = await load(file, ext, req.headers['accept-encoding'] || ''); }
      catch { await sleep(latency); res.writeHead(404, {'content-type':'text/plain'}).end('404'); stats.requests++; return; }
      await sleep(latency);
      const headers = { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'max-age=600', etag: entry.etag,
        'last-modified': entry.mtime.toUTCString(), vary: 'Accept-Encoding' };
      if (entry.encoding) headers['content-encoding'] = entry.encoding;
      stats.requests++;
      if (req.headers['if-none-match'] === entry.etag) { res.writeHead(304, headers).end(); stats.byPath.push([rel, 0]); return; }
      headers['content-length'] = entry.body.length;
      res.writeHead(200, headers);
      for (let i = 0; i < entry.body.length; i += 16384) {
        const chunk = entry.body.subarray(i, i + 16384);
        await throttle(chunk.length);
        if (!res.write(chunk)) await new Promise(resolve => res.once('drain', resolve));
      }
      stats.bytes += entry.body.length; stats.byPath.push([rel, entry.body.length]);
      res.end();
    } catch (error) { res.writeHead(500).end(String(error)); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return {
    url: 'http://127.0.0.1:' + server.address().port + '/',
    stats, reset() { stats.requests = 0; stats.bytes = 0; stats.byPath = []; nextFree = 0; },
    setDir(next) { root = path.resolve(next); },
    setShape(next) { latency = next.latency ?? latency; kbps = next.kbps ?? kbps; },
    close: () => new Promise(resolve => { server.closeAllConnections?.(); server.close(resolve); })
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : fallback; };
  const s = await startServer({ dir: arg('dir', 'dist'), port: Number(arg('port', 4180)), latency: Number(arg('latency', 0)), kbps: Number(arg('kbps', 0)) });
  console.log('Servindo em ' + s.url);
}
