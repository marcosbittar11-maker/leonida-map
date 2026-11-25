// Marcas de desempenho (User Timing). Custam microssegundos e não alteram o comportamento do app.
// Com ?perf na URL, o mapa também é exposto em window.__leonida para o harness de scripts/perf.
export const mark = name => { try { performance.mark(name); } catch { /* sem User Timing */ } };
export const perfDebug = (() => { try { return new URLSearchParams(location.search).has('perf'); } catch { return false; } })();
