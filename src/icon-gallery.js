import { groups, categories, symbolKey } from './registry.js';
import { glyphs, glyphNames, glyph, installSprite } from './symbols.js';
import './style.css';

const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
installSprite();

const used = new Map();
for (const category of categories) used.set(category.symbol, [...(used.get(category.symbol) || []), category.key]);
const missing = categories.filter(category => !glyphs[category.symbol]);
const duplicates = [...used].filter(([, keys]) => keys.length > 1);
const placeTypes = ['Ammu-Nation','Gas station','Police station','Fire station','Hospital','Hair salon','Tattoo parlour','Shoe shop','Marina','Airport','Ferry',
  'Station','Bus stop','EV charger','Car wash','ATM','Vehicle rental','Liquor store','Bar','Cinema','Golf','Nightclub','Café and takeout','Street food','Comics',
  'Yellow loot box','Helipad','Scoop container'];
const card = (colour, ink, symbol, title, sub = '') => '<figure class="gallery-card"><span class="point-icon large" style="--pin:'+esc(colour)+';--ink:'+esc(ink)+'">'+glyph(symbol)+'</span>'+
  '<span class="pin-preview"><span class="map-pin" style="--pin:'+esc(colour)+';--ink:'+esc(ink)+';width:30px;height:30px"><span>'+glyph(symbol)+'</span></span>'+
  '<span class="map-pin dot" style="--pin:'+esc(colour)+';width:12px;height:12px"><span></span></span></span><figcaption><strong>'+esc(title)+'</strong><small>'+esc(sub)+'</small></figcaption></figure>';

document.getElementById('gallery').innerHTML =
  '<h1>Símbolos do Leonida Map</h1><p class="muted">'+categories.length+' categorias · '+glyphNames.length+' símbolos próprios. Cada cartão mostra o ícone da legenda/ficha, o pino a 30 px e o ponto compacto usado com muitos pinos.</p>'+
  '<section class="gallery-check '+(missing.length||duplicates.length?'warn':'ok')+'"><h2>Verificação</h2><ul>'+
    '<li>Categorias sem símbolo: <b>'+(missing.map(c => c.key).join(', ') || 'nenhuma')+'</b></li>'+
    '<li>Símbolo repetido entre categorias: <b>'+(duplicates.map(([symbol, keys]) => symbol+' ('+keys.join(', ')+')').join('; ') || 'nenhum')+'</b></li>'+
    '<li>Símbolos sem uso em categoria: <b>'+(glyphNames.filter(name => !used.has(name)).join(', ') || 'nenhum')+'</b> (subtipos de lugar, estados e interface)</li></ul></section>'+
  groups.map(group => '<h2>'+glyph(group.symbol,'glyph inline')+' '+esc(group.name)+'</h2><div class="gallery-grid">'+
    categories.filter(c => c.group === group.name).map(c => card(c.colour, c.ink, c.symbol, c.name, c.key+(c.pending?' · '+c.pending:''))).join('')+'</div>').join('')+
  '<h2>Subtipos de lugar</h2><div class="gallery-grid">'+placeTypes.map(type => {
    const kind = ['Ammu-Nation','Gas station','ATM','EV charger'].includes(type) ? 'gas' : 'shop';
    const symbol = symbolKey({kind, type});
    return card('#80ed99', '#10121d', symbol, type, symbol);
  }).join('')+'</div>'+
  '<h2>Todos os desenhos</h2><div class="gallery-grid dense">'+glyphNames.map(name => card('#c69afd', '#10121d', name, name)).join('')+'</div>';
