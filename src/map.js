import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const base = import.meta.env.BASE_URL;
const bounds = L.latLngBounds([-1024,0],[0,1024]);
const domain = L.latLngBounds([-757,249],[-245,612]);
const xy = p => [-p.y,p.x];
const remote = 'https://cdn.jsdelivr.net/gh/fbritoferreira/gta6@';
const urlTile = (root,z,y,x) => root + 'tiles/night/' + z + '/' + [z,y,x].join(',') + '.webp';

const image = url => new Promise((resolve,reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  if (url.startsWith('https://')) img.crossOrigin = 'anonymous';
  img.src = url;
});
const ancestorCache = new Map();
function overviewTile(y,x) {
  const key = y + ',' + x;
  if (!ancestorCache.has(key)) ancestorCache.set(key,image(urlTile(base,0,y,x)));
  return ancestorCache.get(key);
}

export function createMap({ revision, labels, onSelect, onPlace, markerIcon }) {
  const map = L.map('map', { crs:L.CRS.Simple, zoomControl:false, attributionControl:false, minZoom:-1, maxZoom:7,
    zoomSnap:0.25, zoomDelta:0.75, maxBounds:bounds.pad(0.25), maxBoundsViscosity:0.85, preferCanvas:true });
  const tileLayer = L.gridLayer({ tileSize:256, minZoom:-1, maxZoom:7, minNativeZoom:0, maxNativeZoom:5, bounds, keepBuffer:2 });
  tileLayer.createTile = (coords, done) => {
    const {x,y,z} = coords;
    const tile = document.createElement('canvas');
    tile.width = tile.height = z === 0 ? 512 : Math.min(768,window.devicePixelRatio * 256);
    const context = tile.getContext('2d');
    const scale = 2 ** z;
    overviewTile(Math.floor(y/scale),Math.floor(x/scale)).then(img => {
      if (tile.dataset.hd) return;
      const crop = img.width/scale;
      context.drawImage(img,(x%scale)*crop,(y%scale)*crop,crop,crop,0,0,tile.width,tile.height);
    }).catch(() => {}).finally(() => done(null,tile));
    if (z > 0) {
      const onlyRemote = remote + revision + '/public/';
      image(urlTile(onlyRemote,z,y,x)).then(img => {
        tile.dataset.hd = 'true';
        context.drawImage(img,0,0,tile.width,tile.height);
      }).catch(() => {});
    }
    return tile;
  };
  tileLayer.addTo(map);
  const credits = L.control.attribution({ position:'bottomleft', prefix:false }).addTo(map);
  credits.addAttribution('<a href="https://github.com/fbritoferreira/gta6" target="_blank" rel="noopener noreferrer">Open GTA 6 Map</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>');
  const labelsLayer = L.layerGroup().addTo(map);
  for (const label of labels) {
    const text = document.createElement('span');
    text.textContent = label.name;
    if (!['Vice City','Port Gellhorn','Key Lento'].includes(label.name)) text.className='local-map-label';
    L.marker(xy(label), { interactive:false, keyboard:false, zIndexOffset:-100,
      icon:L.divIcon({ className:'map-label', html:text, iconSize:[128,22], iconAnchor:[64,11] }) }).addTo(labelsLayer);
  }
  const pins = L.layerGroup().addTo(map);
  const vehicleLayer = L.layerGroup().addTo(map);
  let points = [], currentProgress, selected, placing = false;
  const rendered = new Map();
  const container = map.getContainer();

  function draw() {
    if (!currentProgress) return;
    const view = map.getBounds().pad(0.16);
    const live = new Set();
    const favorites = new Set(currentProgress.favorites);
    for (const point of points) {
      if (!view.contains(xy(point))) continue;
      const key = point.id;
      const done = !!currentProgress.completed[key];
      const favorite = favorites.has(key);
      const active = key === selected;
      live.add(key);
      const old = rendered.get(key);
      const variant = [done,favorite,active,!!point.locked,point.name,point.kind,point.x,point.y].join('/');
      if (old?.variant === variant) continue;
      if (old) pins.removeLayer(old.marker);
      const html = document.createElement('span');
      html.setAttribute('aria-hidden','true');
      html.innerHTML = markerIcon(point,done);
      const type = 'map-pin' + (done?' done':'') + (favorite?' favorite':'') + (active?' active':'') + (point.locked&&!done?' locked':'');
      const marker = L.marker(xy(point), {
        title:point.name, alt:point.name, zIndexOffset:active ? 1500 : 100,
        icon:L.divIcon({html,className:type,iconSize:[29,29]})
      }).on('click', () => {
        if (placing) return place(marker.getLatLng());
        onSelect(key,false);
      }).addTo(pins);
      const element=marker.getElement();
      element?.setAttribute('aria-label',point.name+(point.locked&&!done?' (bloqueado)':''));
      if(point.category?.colour) element?.style.setProperty('--pin',point.category.colour);
      rendered.set(key,{marker,variant});
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
  map.on('moveend zoomend',draw);
  map.on('click',event => { if (placing) place(event.latlng); });
  function home() { map.fitBounds(domain, { padding:[16,18], animate:false, maxZoom:1.25 }); }
  home();
  new ResizeObserver(() => map.invalidateSize({pan:false})).observe(container);

  return {
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

