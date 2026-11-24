import L from 'leaflet';
import Supercluster from 'supercluster';
import 'leaflet/dist/leaflet.css';

const base = import.meta.env.BASE_URL;
const bounds = L.latLngBounds([-1024,0],[0,1024]);
const domain = L.latLngBounds([-757,249],[-245,612]);
const xy = p => [-p.y,p.x];
const geoX = x => x * 360 / 1024 - 180;
const geoY = y => Math.atan(Math.sinh(Math.PI*(1-2*y/1024))) * 180 / Math.PI;
const mapY = lat => (1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)*512;
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
  const line = L.layerGroup().addTo(map);
  let index, pointMap = new Map(), currentProgress, selected, placing = false;
  const rendered = new Map();
  const container = map.getContainer();

  function draw() {
    if (!index) return;
    const view = map.getBounds().pad(0.16);
    const box = [Math.max(-180,geoX(view.getWest())),geoY(-view.getSouth()),Math.min(180,geoX(view.getEast())),geoY(-view.getNorth())];
    const z = Math.max(0,Math.min(11,Math.floor(map.getZoom()+2)));
    const features = index.getClusters(box,z);
    const live = new Set();
    for (const feature of features) {
      const props = feature.properties, [x,y] = feature.geometry.coordinates;
      const point = pointMap.get(props.id);
      const cluster = props.cluster;
      const done = point && !!currentProgress.completed[point.id];
      const favorite = point && currentProgress.favorites.includes(point.id);
      const active = point?.id === selected;
      const key = cluster ? 'c-' + props.cluster_id : point.id;
      live.add(key);
      const old = rendered.get(key);
      const variant = [done,favorite,active].join('/');
      if (old && old.variant === variant) continue;
      if (old) pins.removeLayer(old.marker);
      const html = document.createElement('span');
      if (cluster) html.textContent = props.point_count;
      else {
        html.setAttribute('aria-hidden','true');
        html.innerHTML = markerIcon(point,done);
      }
      if (point?.category?.colour) html.style.setProperty('--pin',point.category.colour);
      const type = cluster ? 'map-cluster' : 'map-pin' + (done?' done':'') + (favorite?' favorite':'') + (active?' active':'');
      const name = cluster ? props.point_count + ' pontos · aproximar' : point.name;
      const marker = L.marker([ -mapY(y),(x+180)*1024/360 ], {
        title:name, alt:name, zIndexOffset:active ? 1500 : 100,
        icon:L.divIcon({html,className:type,iconSize:cluster ? [38,38] : [29,29]})
      }).on('click', () => {
        if (placing) return place(marker.getLatLng());
        if (point) onSelect(point.id,false);
        else {
          const target = Math.min(7, Math.max(map.getZoom()+1,index.getClusterExpansionZoom(props.cluster_id)-2));
          if (map.getZoom() >= 7) {
            const nearby = index.getLeaves(props.cluster_id,Infinity).map(item => item.properties.id);
            onSelect(null,false,nearby);
          } else map.setView(marker.getLatLng(),target);
        }
      }).addTo(pins);
      const element=marker.getElement();
      element?.setAttribute('aria-label',name);
      if(point?.category?.colour) element?.style.setProperty('--pin',point.category.colour);
      rendered.set(key,{marker,variant});
    }
    for (const [key,item] of rendered) if (!live.has(key)) {
      pins.removeLayer(item.marker); rendered.delete(key);
    }
    container.dataset.points = pointMap.size;
    container.dataset.drawn = features.length;
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
    update(points, progress, active) {
      currentProgress = progress; selected = active;
      pointMap = new Map(points.filter(p=>p.x!=null).map(p=>[p.id,p]));
      index = new Supercluster({radius:70, extent:512, maxZoom:9}).load([...pointMap.values()].map(p=>({
        type:'Feature', geometry:{type:'Point',coordinates:[geoX(p.x),geoY(p.y)]}, properties:{id:p.id}
      })));
      pins.clearLayers(); rendered.clear(); draw();
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
    route(points, legs, fit = true) {
      line.clearLayers();
      const all = points.filter(p=>p.x!=null);
      all.forEach((p,i) => L.circleMarker(xy(p),{radius:10,weight:2,color:'#7fe9ce',fillColor:'#192b39',fillOpacity:0.9,interactive:false})
        .bindTooltip(String(i+1),{permanent:true,direction:'center',className:'route-stop'}).addTo(line));
      legs.forEach(leg => {
        L.polyline(leg.points.map(xy),{color:leg.known?'#7fe9ce':'#ce8dff',weight:3,dashArray:leg.known?null:'6 8',interactive:false}).addTo(line);
      });
      if (fit && all.length>1) map.fitBounds(L.latLngBounds(all.map(xy)),{padding:[50,60],maxZoom:4,animate:false});
    }
  };
}

