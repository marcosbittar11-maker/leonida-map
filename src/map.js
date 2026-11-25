import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tileCover, tileSource } from './tiles.js';
import { mark, perfDebug } from './perf.js';

const base = import.meta.env.BASE_URL;
const bounds = L.latLngBounds([-1024,0],[0,1024]);
const domain = L.latLngBounds([-757,249],[-245,612]);
const cover = L.latLngBounds([-tileCover.y1,tileCover.x0],[-tileCover.y0,tileCover.x1]);
const xy = p => [-p.y,p.x];

// Tiles nativos (<img>) com nova tentativa limitada. Um tile que continua falhando fica transparente
// e deixa ver a camada de visão geral por baixo, em vez de um recorte ampliado silencioso.
const GameTiles = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = L.TileLayer.prototype.createTile.call(this, coords, done);
    tile.dataset.key = this._tileCoordsToKey(coords);
    return tile;
  },
  _tileOnError(done, tile, error) {
    const tries = Number(tile.dataset.tries || 0);
    const url = tile.dataset.src || tile.src;
    if (tries < 2 && navigator.onLine !== false) {
      tile.dataset.tries = tries + 1;
      tile.dataset.src = url;
      setTimeout(() => {
        if (this._tiles[tile.dataset.key]?.el === tile) tile.src = url + '?retry=' + (tries + 1);
      }, 700 * (tries + 1));
      return;
    }
    tile.style.visibility = 'hidden';
    done(error, tile);
  }
});

// Marcador dos pinos. O Leaflet registra três ouvintes por marcador (zoom, viewreset e zoomanim) e, a cada registro ou
// remoção, varre a lista inteira em busca de duplicatas: com milhares de pinos o custo é quadrático. Aqui o mapa tem um
// único ouvinte para cada evento, que atualiza todos os pinos exibidos (ver createMap).
const Pin = L.Marker.extend({
  getEvents: () => ({}),
  onAdd(map) {
    this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
    this._initIcon();
    this.update();
  },
  onRemove() {
    this._removeIcon();
    this._removeShadow();
  }
});

function gameLayers(onDetailError) {
  // Em telas de alta densidade, cada tile CSS de 128 px recebe a imagem de 256 px do nível seguinte.
  const retina = window.devicePixelRatio >= 1.5 ? 1 : 0;
  const url = base + 'tiles/game/{z}/{z},{y},{x}.jpg';
  const common = { tileSize:256 >> retina, zoomOffset:retina, bounds:cover, maxZoom:7, updateWhenZooming:false };
  const overview = new GameTiles(url, { ...common, className:'tiles-overview', minZoom:-1,
    minNativeZoom:-retina, maxNativeZoom:tileSource.overviewMaxZoom - retina, keepBuffer:1 });
  const firstDetail = tileSource.overviewMaxZoom + 1 - retina;
  const detail = new GameTiles(url, { ...common, className:'tiles-detail', minZoom:firstDetail,
    minNativeZoom:firstDetail, maxNativeZoom:tileSource.maxZoom - retina, keepBuffer:2 });
  detail.on('tileerror', onDetailError);
  return [overview, detail];
}

export function createMap({ labels, onSelect, onPlace, markerIcon, onDetailError = () => {} }) {
  const map = L.map('map', { crs:L.CRS.Simple, zoomControl:false, attributionControl:false, minZoom:-1, maxZoom:7,
    zoomSnap:0.25, zoomDelta:0.75, maxBounds:bounds.pad(0.25), maxBoundsViscosity:0.85, preferCanvas:true });
  let detailFailures = 0;
  const [overviewLayer, detailLayer] = gameLayers(() => {
    map.getContainer().dataset.detailFailures = ++detailFailures;
    onDetailError();
  });
  // Resolve quando a visão geral termina de carregar pela primeira vez (o mapa já tem algo útil na tela).
  const tilesReady = new Promise(resolve => overviewLayer.once('load', resolve));
  for (const layer of [overviewLayer, detailLayer]) {
    const name = layer.options.className.replace('tiles-','');
    layer.on('loading', () => mark('tiles:' + name + ':loading')).on('load', () => mark('tiles:' + name + ':load'));
    layer.addTo(map);
  }
  if (perfDebug) window.__leonida = { map };
  const labelsLayer = L.layerGroup().addTo(map);
  function setLabels(list) {
    labelsLayer.clearLayers();
    for (const label of list) {
      const text = document.createElement('span');
      text.textContent = label.name;
      if (!['Vice City','Port Gellhorn','Key Lento'].includes(label.name)) text.className='local-map-label';
      L.marker(xy(label), { interactive:false, keyboard:false, zIndexOffset:-100,
        icon:L.divIcon({ className:'map-label', html:text, iconSize:[128,22], iconAnchor:[64,11] }) }).addTo(labelsLayer);
    }
  }
  setLabels(labels);
  const pins = L.layerGroup().addTo(map);
  const vehicleLayer = L.layerGroup().addTo(map);
  let points = [], currentProgress, selected, placing = false;
  const rendered = new Map();
  const container = map.getContainer();
  const eachPin = fn => { for (const item of rendered.values()) if (item.marker._map) fn(item.marker); };
  map.on('zoom viewreset', () => eachPin(marker => marker.update()));
  map.on('zoomanim', event => eachPin(marker => { if (marker._zoomAnimated) marker._animateZoom(event); }));

  let pinSize = 30;
  const dotThreshold = 900;
  let drawQueued = false;
  function draw() {
    drawQueued = false;
    if (!currentProgress) return;
    const view = map.getBounds().pad(0.16);
    const live = new Set();
    const favorites = new Set(currentProgress.favorites);
    const inView = points.filter(point => view.contains(xy(point)));
    // Com milhares de pinos na tela e pouco zoom, pontos coloridos substituem os símbolos para manter a fluidez.
    const dots = inView.length > dotThreshold && map.getZoom() < 2.25;
    for (const point of inView) {
      const key = point.id;
      const done = !!currentProgress.completed[key];
      const favorite = favorites.has(key);
      const active = key === selected;
      live.add(key);
      const old = rendered.get(key);
      const size = dots && !active && !favorite ? Math.round(pinSize * 0.42) : pinSize;
      const dot = size !== pinSize;
      const locked = !!point.locked;
      // Mesmo objeto de ponto e mesmo estado visual: o pino já está certo (sem montar chave de texto por ponto).
      if (old && old.point === point && old.done === done && old.favorite === favorite && old.active === active && old.locked === locked && old.size === size && old.dot === dot) continue;
      if (old) pins.removeLayer(old.marker);
      const html = document.createElement('span');
      html.setAttribute('aria-hidden','true');
      if (!dot) html.innerHTML = markerIcon(point,done);
      const type = 'map-pin' + (done?' done':'') + (favorite?' favorite':'') + (active?' active':'') + (point.locked&&!done?' locked':'') + (dot?' dot':'');
      const marker = new Pin(xy(point), {
        title:point.name, alt:point.name, zIndexOffset:active ? 1500 : 100,
        icon:L.divIcon({html,className:type,iconSize:[size,size]})
      }).on('click', () => {
        if (placing) return place(marker.getLatLng());
        onSelect(key,false);
      }).addTo(pins);
      const element=marker.getElement();
      element?.setAttribute('aria-label',point.name+(point.locked&&!done?' (bloqueado)':''));
      if(point.category?.colour) {
        element?.style.setProperty('--pin',point.category.colour);
        element?.style.setProperty('--ink',point.category.ink || '#10121d');
      }
      rendered.set(key,{marker,point,done,favorite,active,locked,size,dot});
    }
    for (const [key,item] of rendered) if (!live.has(key)) {
      pins.removeLayer(item.marker); rendered.delete(key);
    }
    container.dataset.points = points.length;
    container.dataset.drawn = live.size;
    container.dataset.zoom = map.getZoom();
  }

  function place(latlng) {
    const snap = value => Math.max(0,Math.min(1024,Math.round(value*10000)/10000));
    onPlace({x:snap(latlng.lng),y:snap(-latlng.lat)});
  }
  // zoomend e moveend chegam juntos na mesma tarefa: um único desenho, ainda antes do próximo quadro (sem esperar rAF).
  map.on('moveend zoomend',() => { if (!drawQueued) { drawQueued = true; queueMicrotask(() => { if (drawQueued) draw(); }); } });
  map.on('click',event => { if (placing) place(event.latlng); });
  function home() { map.fitBounds(domain, { padding:[16,18], animate:false, maxZoom:1.25 }); }
  home();
  new ResizeObserver(() => map.invalidateSize({pan:false})).observe(container);

  return {
    setLabels, tilesReady,
    update(visiblePoints, progress, active) {
      currentProgress = progress; selected = active;
      points = visiblePoints.filter(p=>p.x!=null);
      draw();
    },
    focus(point, {raised=false, zoomIn=true}={}) {
      if(point.x==null)return;
      const zoom=zoomIn?Math.max(map.getZoom(),3.25):map.getZoom();
      const projected=map.project(xy(point),zoom);
      if(raised)projected.y+=map.getSize().y*0.25;
      map.setView(map.unproject(projected,zoom),zoom,{animate:false});
    },
    highlight(id) { selected=id; draw(); },
    setPinSize(size) {
      if (size === pinSize) return;
      pinSize = size;
      container.style.setProperty('--pin-size', size + 'px');
      pins.clearLayers(); rendered.clear(); draw();
    },
    home, zoomIn:() => map.zoomIn(), zoomOut:() => map.zoomOut(),
    placing(value) { placing=value; container.classList.toggle('placing',value); },
    previewVehicles(spots, name) {
      vehicleLayer.clearLayers();
      if (!spots.length) {pins.addTo(map);return;}
      pins.remove();
      for (const spot of spots) {
        const title=spot.label+' · '+(spot.type==='fixed'?'ponto fixo':'ponto relatado');
        const content=document.createElement('div');
        const model=document.createElement('strong');
        model.textContent=name;
        const location=document.createElement('p');
        location.textContent=title;
        content.append(model,location);
        L.marker(xy(spot),{title,zIndexOffset:1600,icon:L.divIcon({
          html:markerIcon({kind:'vehicle'}),className:'map-pin car-finder-pin '+spot.type,
          iconSize:[36,36]
        })}).bindPopup(content,{className:'vehicle-map-popup'}).addTo(vehicleLayer)
          .getElement()?.setAttribute('aria-label',title);
      }
      if (spots.length===1) map.setView(xy(spots[0]),4,{animate:false});
      else map.fitBounds(L.latLngBounds(spots.map(xy)),{padding:[38,75],maxZoom:4,animate:false});
    }
  };
}

