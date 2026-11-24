import { createMap } from './map.js';
import { tileSource } from './tiles.js';
import { installIcons, icon } from './icons.js';
import { glyph, installSprite } from './symbols.js';
import { groups, categories as registry, categoryByKey, symbolKey } from './registry.js';
import { registrationGuide } from './standout.js';
import { version } from '../package.json';
import { checked, leads } from './guides.js';
import { curationChecked } from './curation.js';
import { configurable, configurableKeys, availabilityLabels, requirementLabel, usesEquipment } from './requirements.js';
import { applyGuides, decodeProgress, mergeProgress, freshProgress, normalize, visible, availableOnMap, matches, onMap, remaining, rangeText, catalogAliases, availability, categoryCounts } from './model.js';
import { createCarFinder } from './car-finder.js';
import './style.css';
import './car-finder.css';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = new Intl.NumberFormat('pt-BR');
const base = import.meta.env.BASE_URL;
const storageKey = 'leonida-map:progress:v1';
const mobile = () => matchMedia('(max-width: 760px)').matches;
const freshFilters = () => ({status:'all',series:new Set(),words:[],repeat:false,peace:false,guides:false,availability:'all',equipment:new Set()});
/** `show`: categorias com pinos visíveis (vazio ao abrir). `favoritePins`: exibe favoritos de qualquer categoria. */
const filters = {...freshFilters(), show:new Set(), favoritePins:false};
const prefsKey = 'leonida-map:prefs:v1';
const pinSizes = {small:24, normal:30, large:38};
const prefs = {remember:false, pinSize:'normal'};
let temporary = new Set(), categoryQuery = '';
function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(prefsKey));
    if (!saved || typeof saved !== 'object') return;
    prefs.remember = saved.remember === true;
    if (pinSizes[saved.pinSize]) prefs.pinSize = saved.pinSize;
    if (prefs.remember) {
      filters.show = new Set((Array.isArray(saved.visible) ? saved.visible : []).filter(key => categoryByKey.has(key)));
      filters.favoritePins = saved.favorites === true;
    }
  } catch {}
}
function savePrefs() {
  try {
    localStorage.setItem(prefsKey, JSON.stringify({remember:prefs.remember, pinSize:prefs.pinSize,
      visible:prefs.remember ? [...filters.show] : [], favorites:prefs.remember && filters.favoritePins}));
  } catch {}
}
const pinGlyph = (point, completed = false) => glyph(completed ? 'check' : symbolKey(point));
const symbolChip = (category, point) => '<span class="category-symbol" style="--pin:'+esc(category.colour)+';--ink:'+esc(category.ink)+'">'+glyph(point ? symbolKey(point) : category.symbol)+'</span>';
let panel='map', selected=null, placeMode=false, progress, catalog, aliases, map, staticPoints, data, filtered, candidates, lookup;
let seriesOpen=false, flashTimer, listLimit=50, carFinder, previewVehicle;
const openGroups=new Set();
const badge = (text,tone='') => '<span class="badge '+tone+'">'+esc(text)+'</span>';
const button = (label, action, image, extra='') => '<button type="button" class="ui-button '+extra+'" data-action="'+action+'">'+(image?icon(image):'')+esc(label)+'</button>';
const auditDate = date => date?.split('-').reverse().join('/') ?? '';
const external = (url, title) => /^https?:\/\//i.test(url) ? '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+icon('arrow-up-right')+'</a>' : '';
const sourceURL = (c,rev) => 'https://github.com/fbritoferreira/gta6/blob/'+rev+'/public/data/'+(c || 'locations')+'.json';
function sourceName(url,index) {
  try {return /youtu/.test(new URL(url).hostname) ? 'Vídeo'+(url.includes('&t=')?' com momento marcado':'') : new URL(url).hostname.replace(/^www\./,'');}
  catch {return 'Fonte '+(index+1);}
}
function pointButton(p,value='') {
  return '<button class="point-row" data-point="'+esc(p.id)+'"><span class="point-icon" style="--pin:'+esc(p.category?.colour || '#be90ff')+';--ink:'+esc(p.category?.ink || '#10121d')+'">'+pinGlyph(p)+'</span><span class="point-copy"><strong>'+esc(p.name)+'</strong><small>'+esc(value || p.region || p.category?.name || 'Ponto personalizado')+'</small></span>'+(progress.completed[p.id]?'<span class="mint">✓</span>':'')+icon('chevron-right')+'</button>';
}
function toast(message) {
  clearTimeout(flashTimer);
  $('toast').textContent=message; $('toast').hidden=false;
  flashTimer=setTimeout(()=>{$('toast').hidden=true;},3500);
}
function save() {
  try {localStorage.setItem(storageKey,JSON.stringify(progress));}
  catch {toast('Armazenamento indisponível. Exporte seu progresso para guardá-lo.');}
}
function customPoints() {
  return progress.custom.map(p=>({...p,kind:'custom',category:categoryByKey.get('custom'),
    evidence:'personal',neutral:true,search:normalize([p.name,p.region,p.description,'personalizado'].join(' '))}));
}
function applyMap() {
  filtered=candidates.filter(p=>onMap(p,filters,progress,temporary));
  map.update(filtered,progress,selected);
  const pinCount=filtered.filter(p=>p.x!=null).length;
  $('map-count').textContent=fmt.format(pinCount)+(pinCount===1?' pino':' pinos');
}
function refresh() {
  data=[...staticPoints,...customPoints()];
  lookup=new Map(data.map(p=>[p.id,p]));
  for (const p of data) p.locked=availability(p,progress).state==='unmet';
  candidates=data.filter(p=>matches(p,filters,progress));
  if (selected && !candidates.some(p=>p.id===selected)) {selected=null;temporary=new Set();}
  applyMap();
  const owned=progress.equipment.length;
  $('settings-label').textContent=owned?'Equipamentos '+owned+'/'+configurableKeys.length:'Configurações';
  if (previewVehicle) clearVehicleMap();
  renderPanel(); renderDetail();
}
/** Visibilidade das categorias mudou: guarda a preferência (se ativada) e redesenha. */
const allKinds = () => registry.filter(c => c.key==='custom' || data.some(p => p.kind===c.key && visible(p) && p.x!=null)).map(c => c.key);
function changeVisibility() {savePrefs();refresh();}
function deselect() {
  selected=null;
  if (temporary.size) {temporary=new Set();applyMap();} else map.highlight(null);
  renderDetail();
}
const ratio = (shown,total) => '<small class="counter" title="Visíveis com os filtros atuais / total catalogado">'+fmt.format(shown)+'/'+fmt.format(total)+'</small>';
function filterRow(key, name, shown, total, {enabled=true, on=true, attribute='kind', marker='', note=''}={}) {
  return '<label class="category-row'+(on&&enabled?' on':' off')+(total?'':' empty')+'"><input type="checkbox" data-'+attribute+'="'+esc(key)+'" '+(on?'checked ':'')+
    (!enabled?'disabled ':'')+'>'+marker+'<span class="cat-name">'+esc(name)+(note?'<em>'+esc(note)+'</em>':'')+'</span>'+ratio(shown,total)+'</label>';
}
function activeFilters() {
  const list=[];
  if(filters.words.length)list.push(['Busca: '+$('query').value.trim(),'words']);
  if(filters.status!=='all')list.push([{pending:'Pendentes',done:'Concluídos',favorite:'Favoritos'}[filters.status],'status']);
  for(const key of ['guides','peace','repeat'])if(filters[key])list.push([{guides:'Com guia',peace:'Sem confronto',repeat:'Repetíveis'}[key],key]);
  if(filters.availability!=='all')list.push([availabilityLabels[filters.availability],'availability']);
  for(const key of filters.equipment)list.push(['Usa '+configurable[key].short,'equipment:'+key]);
  if(filters.series.size)list.push([filters.series.size+' coleções ocultas','series']);
  return list;
}
function availabilityMarkup() {
  const base=data.filter(p=>availableOnMap(p));
  const states={all:base.length,met:0,unmet:0,unknown:0};
  for(const p of base){const s=availability(p,progress).state;if(s in states)states[s]++;}
  const active=activeFilters();
  return '<div class="section-title"><h2>Disponibilidade</h2>'+(active.length?button('Limpar filtros','clear-filters','x','text-button'):'')+'</div>'+
    (active.length?'<div class="active-filters" aria-label="Filtros ativos">'+active.map(([label,key])=>'<button type="button" class="chip active" data-clear="'+esc(key)+'" aria-label="Remover filtro '+esc(label)+'">'+esc(label)+icon('x')+'</button>').join('')+'</div>':'')+
    '<label class="form-row compact">Mostrar<select id="availability-filter">'+Object.entries(availabilityLabels).map(([key,label])=>
      '<option value="'+key+'" '+(filters.availability===key?'selected':'')+'>'+esc(label)+' ('+fmt.format(states[key])+')</option>').join('')+'</select></label>'+
    '<div class="chips equipment-chips" role="group" aria-label="Filtrar por equipamento necessário">'+configurableKeys.map(key=>{
      const total=base.filter(p=>usesEquipment(p,key)).length, on=filters.equipment.has(key);
      return '<button type="button" class="chip '+(on?'active':'')+'" data-equipment-filter="'+key+'" aria-pressed="'+on+'">'+esc(configurable[key].short)+' <small>'+fmt.format(total)+'</small></button>';
    }).join('')+'</div>'+
    '<p class="muted small">'+icon('lock')+' Cadeado no pino: falta um equipamento ou desbloqueio marcado em Configurações.</p>';
}
const memberKinds = (group, counts) => registry.filter(c => c.group===group && (counts.get(c.key).total>0&&!c.cluesOnly || c.key==='custom')).map(c => c.key);
function groupMarkup(counts, allowed) {
  const series=new Map();
  for(const p of allowed) if(p.variant){
    const row=series.get(p.series)||{shown:0,total:0};row.total++;series.set(p.series,row);
  }
  for(const p of filtered) if(p.variant&&series.has(p.series))series.get(p.series).shown++;
  const query=normalize(categoryQuery);
  const sections=groups.map(({name:group,symbol})=>{
    const all=registry.filter(c=>c.group===group);
    const matching=query?(normalize(group).includes(query)?all:all.filter(c=>normalize(c.name).includes(query))):all;
    if(!matching.length) return '';
    const members=memberKinds(group,counts), active=members.filter(key=>filters.show.has(key)).length;
    const total=all.reduce((sum,c)=>sum+counts.get(c.key).total,0), shown=all.reduce((sum,c)=>sum+counts.get(c.key).shown,0);
    const partial=active>0&&active<members.length, expanded=openGroups.has(group)||!!query;
    const rows=matching.map(c=>{
      const row=counts.get(c.key), pending=!row.total&&c.key!=='custom';
      return filterRow(c.key,c.name,row.shown,row.total,{enabled:!pending&&!c.cluesOnly,on:filters.show.has(c.key),marker:symbolChip(c),
        note:pending?c.pending||'Sem pontos posicionados':c.cluesOnly?c.pending:''});
    });
    if(group==='Pessoal'&&(!query||normalize('favoritos').includes(query))) {
      const favorites=progress.favorites.length, shownFavorites=filtered.filter(p=>progress.favorites.includes(p.id)).length;
      rows.push(filterRow('favorites','Favoritos (de qualquer categoria)',shownFavorites,favorites,{attribute:'favorites',on:filters.favoritePins,enabled:true,
        marker:'<span class="category-symbol" style="--pin:#f4d077;--ink:#10121d">'+glyph('star')+'</span>'}));
    }
    const variants=group==='Veículos'&&series.size&&!query ? '<details class="series" '+(seriesOpen?'open':'')+'><summary>Coleções de variantes</summary>'+
      [...series].sort(([a],[b])=>a.localeCompare(b,'pt-BR')).map(([key,{shown,total}])=>filterRow(key,key,shown,total,{
        attribute:'series',enabled:filters.show.has('vehicle'),on:filters.show.has('vehicle')&&!filters.series.has(key)
      })).join('')+'</details>' : '';
    return '<section class="category-group'+(active?' has-active':'')+'"><div class="category-head"><input type="checkbox" aria-label="'+group+
      '" data-group="'+group+'" data-partial="'+partial+'" '+(members.length&&active===members.length?'checked':'')+'><button data-toggle-group="'+group+'" aria-expanded="'+expanded+'">'+
      '<span class="group-symbol">'+glyph(symbol)+'</span><strong>'+group+'</strong>'+ratio(shown,total)+icon('chevron-down')+'</button></div>'+
      (expanded?'<div class="group-actions"><button type="button" class="ui-button text-button" data-group-all="'+group+'">Mostrar todas</button><button type="button" class="ui-button text-button" data-group-none="'+group+'">Ocultar todas</button></div>'+
        '<div class="category-list">'+rows.join('')+'</div>'+variants:'')+'</section>';
  }).join('');
  return '<div class="section-title"><h2>Categorias</h2>'+(filters.show.size||filters.favoritePins?'<span>'+fmt.format(filters.show.size)+' ativas</span>':'<span>nenhuma ativa</span>')+'</div>'+
    (sections||'<p class="empty">Nenhuma categoria corresponde à busca.</p>');
}
function listMarkup(points) {
  if (!points.length) return '<p class="empty">Nenhum ponto corresponde aos filtros atuais.</p>';
  return points.slice(0,listLimit).map(p=>pointButton(p)).join('')+
    (points.length>listLimit?button('Carregar mais','list-more','plus','full'):'');
}
function renderPanel() {
  document.querySelectorAll('[data-panel]').forEach(b=>{
    b.classList.toggle('active',b.dataset.panel===panel);
    if (b.dataset.panel===panel) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-status]').forEach(b=>{const active=b.dataset.status===filters.status; b.classList.toggle('active',active); b.setAttribute('aria-pressed',active);});
  document.querySelectorAll('[data-filter]').forEach(b=>{const active=!!filters[b.dataset.filter]; b.classList.toggle('active',active); b.setAttribute('aria-pressed',active);});
  if (panel==='vehicles') {carFinder.render();return;}
  $('search-tools').hidden=panel!=='map';
  $('panel-title').textContent=({map:'Explorar Leonida',rank:'Rankings',progress:'Seu progresso'})[panel];
  $('panel-caption').textContent=({map:'Pontos de interesse e guias de GTA VI',rank:'Compare as recompensas disponíveis',progress:'Checklist e histórico de exploração'})[panel];
  const entitled=data.filter(p=>visible(p));
  const available=entitled, completed=available.filter(p=>progress.completed[p.id]);
  const pct=available.length?Math.round(completed.length/available.length*100):0;
  const scroll=$('panel-content').scrollTop;
  if (panel==='map') {
    const showingList=filters.words.length || filters.status!=='all' || filters.repeat || filters.peace || filters.guides || filters.availability!=='all' || filters.equipment.size;
    const list=candidates;
    const featured=['safe-070','L2453','liquor-store-002','standout-vehicle-101'].map(id=>lookup.get(id)).filter(p=>p && candidates.includes(p));
    $('panel-content').innerHTML=(showingList?
      '<div class="section-title"><h2>Resultados</h2><span>'+fmt.format(list.length)+'</span></div>'+listMarkup(list)
      : (featured.length?'<div class="section-title"><h2>Guias em destaque</h2></div>'+featured.map(p=>pointButton(p)).join(''):''))+availabilityMarkup()+groupMarkup(categoryCounts(entitled,filtered),entitled);
  }
  if (panel==='rank') renderRank();
  if (panel==='progress') renderProgress(available,completed);
  document.querySelectorAll('[data-group]').forEach(box=>{box.indeterminate=box.dataset.partial==='true';});
  $('panel-content').scrollTop=scroll;
  $('panel-footer').innerHTML='<div><strong>Progresso em Leonida</strong><b>'+pct+'%</b></div><progress value="'+completed.length+'" max="'+Math.max(available.length,1)+'"></progress><small>'+fmt.format(completed.length)+' / '+fmt.format(available.length)+' pontos visíveis</small>';
}
function renderRank() {
  const parentReward=p=>p.partOf&&lookup.get(p.partOf)?.reward;
  const ranking=field=>candidates.filter(p=>p[field]&&!(field==='reward'&&parentReward(p))).sort((a,b)=>(b[field][0]+b[field][1])-(a[field][0]+a[field][1]))
    .map(p=>pointButton(p,rangeText(p[field])+(p.related?.length?' · '+p.related.length+' itens vinculados no local':''))).join('');
  $('panel-content').innerHTML='<div class="section-title"><h2>Atividades lucrativas</h2></div><p class="muted">Faixas do cartão do jogo ou de guias. Itens já incluídos no valor de um complexo não são somados de novo.</p>'+
    (ranking('reward')||'<p class="empty">Sem atividade com valor conhecido nos filtros atuais.</p>')+
    '<div class="section-title"><h2>Revenda de veículos</h2></div>'+
    '<div id="vehicle-ranking"></div>'+button('Ver catálogo por revenda','vehicle-rank','car','full')+
    '<div class="section-title"><h2>Pistas sem pino</h2></div>'+leads.map(p=>
      '<details class="note"><summary>'+esc(p.name)+'</summary><p>'+esc(p.note)+'</p>'+p.refs.map((ref,i)=>external(ref,sourceName(ref,i))).join('')+'</details>').join('');
  const target=$('vehicle-ranking');
  carFinder.ranking().then(rows=>{
    if (!target.isConnected) return;
    target.innerHTML=rows.map(v=>'<button class="point-row" data-rank-vehicle="'+esc(v.id)+'">'+icon('car')+
      '<span class="point-copy"><strong>'+esc(v.name)+'</strong><small>'+esc(rangeText(v.resale.value))+'</small></span>'+icon('chevron-right')+'</button>').join('');
  });
}
function renderProgress(available,completed) {
  const [min,max,n]=remaining(available,progress.completed);
  completed.sort((a,b)=>progress.completed[b.id].localeCompare(progress.completed[a.id]));
  $('panel-content').innerHTML='<div class="metric"><small>Recompensas pendentes com estimativa</small><strong>'+esc(n?rangeText([min,max]):'Sem estimativas')+'</strong><p>'+n+' pontos visíveis · valores dependem do save</p></div>'+
    '<div class="chips">'+button('Exportar','export','download')+button('Importar','import','upload')+'</div>'+
    '<div class="section-title"><h2>Histórico</h2><span>'+completed.length+'</span></div>'+
    (completed.length?completed.map(p=>pointButton(p,new Date(progress.completed[p.id]).toLocaleString('pt-BR'))).join(''):'<p class="empty">Conclua um ponto para registrar sua primeira atividade.</p>')+
    '<div class="section-title"><h2>Seus pinos</h2></div>'+button('Novo ponto','place','map-pin-plus','full')+customPoints().map(p=>pointButton(p)).join('');
}

const unknown='Desconhecido';
function renderDetail() {
  const p=selected?lookup.get(selected):null, d=$('detail');
  if (!p || !visible(p)) {d.hidden=true;d.innerHTML='';return;}
  const complete=!!progress.completed[p.id], favorite=progress.favorites.includes(p.id);
  const level=p.official?'Local oficial · posição comunitária':p.guide&&!p.guide.summary?'Guia com fontes':({community:'Relato público',confirmed:'Confirmação da fonte',unknown:'Evidência incompleta',personal:'Seu ponto',single:'Fonte única · posição calibrada',approximate:'Posição aproximada',clue:'Pista sem posição'}[p.evidence]);
  const fields={...(p.fields || {})};
  if(p.variant){
    fields['Coleção']=p.series;
    fields['Registro']='Consulte a taxa e o rastreador no WAiNK. A oficina precisa aceitar o veículo.';
  }
  if (['bank','bigbank','jewelry','pawn','gang','payday','store','safe'].includes(p.kind)) {
    if(!fields['Alarme'])fields['Câmeras e alarmes']??=unknown;
    fields['Cofre']??=unknown;
    fields['Senha']??=unknown;
    if (!fields['Hostis']) fields['Guardas']??=unknown;
    fields['Repetição']??=p.repeatable===true?'Relatada':p.repeatable===false?'Atividade única':unknown;
  }
  if (p.guide) {
    if (p.kind==='vehicle') {
      fields['Revenda livre']??=p.resale?rangeText(p.resale):unknown;
      fields['Alarme']??=unknown;
      fields['NPCs e horários']??=unknown;
    }
    fields['Repetição']??=p.repeatable===true?'Relatada':p.repeatable===false?'Atividade única':unknown;
  }
  const coord=p.x!=null?'X '+fmt.format(p.x*32-16384)+' · Y '+fmt.format(16384-p.y*32):'Sem coordenadas';
  const req=availability(p,progress);
  const reqStatus={met:[req.required.length?'Requisitos configuráveis atendidos':'Nenhum equipamento obrigatório','check','ok'],unmet:['Falta '+req.missing.map(key=>configurable[key].short).join(' e '),'lock','missing'],
    unknown:[req.partial?'Requisitos parcialmente documentados':'Requisitos não documentados','circle-help','unknown']}[req.state];
  const reqBlock=reqStatus||req.info.length||req.optional.length?'<section class="requirement '+(reqStatus?.[2]||'')+'"><h3>'+icon(reqStatus?.[1]||'shield')+esc(reqStatus?.[0]||'Requisitos informativos')+'</h3><ul>'+
    req.required.map(key=>'<li class="'+(progress.equipment.includes(key)?'ok':'missing')+'">'+icon(progress.equipment.includes(key)?'check':'lock')+esc(configurable[key].label)+'</li>').join('')+
    req.optional.map(key=>'<li class="optional">'+icon(progress.equipment.includes(key)?'check':'circle-help')+esc(configurable[key].label)+' <small>opcional, recomendada</small></li>').join('')+
    req.info.map(key=>'<li class="info">'+icon('info')+esc(requirementLabel(key))+' <small>informativo, não verificado pelo app</small></li>').join('')+
    '</ul>'+(req.state==='unmet'?'<p class="muted small">Marque o item em Configurações quando tiver o equipamento ou desbloqueio.</p>':'')+'</section>':'';
  const parent=p.partOf?lookup.get(p.partOf):null;
  const related=(p.related||[]).map(id=>lookup.get(id)).filter(Boolean);
  const linked=parent||related.length?'<section class="related"><h3>'+(parent?'Faz parte de':'Outros itens no local')+'</h3>'+
    (parent?pointButton(parent,parent.reward?'Valor da operação: '+rangeText(parent.reward):parent.category?.name):'')+
    related.map(r=>pointButton(r,r.category?.name)).join('')+
    (related.length&&p.reward?'<p class="muted small">O valor da operação e os valores individuais são exibidos separadamente e não são somados nos rankings.</p>':'')+'</section>':'';
  const sourceLinks=[...new Set([...(p.refs||[]),...(p.sources||[])])];
  d.hidden=false;
  d.innerHTML='<div class="mobile-grip" aria-hidden="true"></div><div class="detail-head"><span class="point-icon large" style="--pin:'+esc(p.category?.colour||'#bd94ff')+';--ink:'+esc(p.category?.ink||'#10121d')+'">'+pinGlyph(p)+'</span><div><h2>'+esc(p.name)+'</h2><p>'+esc([p.category?.name,p.region].filter(Boolean).join(' · '))+'</p></div><button class="icon-button '+(favorite?'is-fave':'')+'" data-action="favorite" aria-label="Favoritar ponto" aria-pressed="'+favorite+'">'+icon('star')+'</button><button class="icon-button" data-action="close-detail" aria-label="Fechar detalhes">'+icon('x')+'</button></div>'+
    '<div class="detail-body"><div class="badges">'+badge(level,p.evidence==='community'?'purple':'')+(p.chapter?badge('Capítulo '+p.chapter+' · informativo'):'')+(p.gang?.edition==='ultimate'?badge('Ultimate Edition'):'')+(p.locked?badge('Bloqueado','locked'):'')+(complete?badge('Concluído','green'):'')+'</div>'+
    '<p class="coordinates" title="Sistema da base cartográfica. A origem pode ser aproximada">'+icon('locate-fixed')+esc(coord)+(p.x!=null?' <small>· '+(p.approx?'posição aproximada':'posição da fonte')+'</small>':'')+'</p>'+
    (p.intro||p.variantNote?'<p>'+esc(p.intro||p.variantNote)+'</p>':'')+
    (p.description && p.description!==p.intro && (p.evidence==='personal'||!p.guide||p.guide.summary)?'<p>'+esc(p.description)+'</p>':'')+
    reqBlock+
    (p.guide?.image?'<img class="location-photo" src="'+esc(base+p.guide.image.file)+'" alt="'+esc(p.guide.image.alt)+'" loading="lazy"><small>'+esc(p.guide.image.credit)+'</small>':'')+
    (Object.keys(fields).length?'<dl>'+Object.entries(fields).map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>':'')+
    (p.steps?.length?'<details class="note"><summary>Como fazer</summary><ol>'+p.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol></details>':'')+
    linked+
    (p.evidence==='personal'?'':'<details class="note"><summary>Fontes · '+auditDate(p.guide&&!p.guide.summary?checked:curationChecked)+'</summary>'+
      sourceLinks.map((ref,i)=>external(ref,sourceName(ref,i))).join('')+(['gameta','clue'].includes(p.collection)?'':external(sourceURL(p.collection,catalog.metadata.revision),'Open GTA 6 Map · coordenadas'))+
      (p.variant?external(registrationGuide,'Como guardar a variante na garagem'):'')+'</details>')+
    '</div><div class="detail-actions">'+button(complete?'Reabrir ponto':'Concluir ponto','done','check',complete?'':'primary')+
      (p.x!=null&&!filters.show.has(p.kind)?button('Mostrar categoria','enable-kind','eye'):'')+
      (p.evidence==='personal'?button('Editar','edit','settings-2'):'')+'</div>';
}
function selectPoint(id,focus=false) {
  const p=lookup.get(id);
  if (!p||!visible(p)) return;
  selected=id;
  // Resultado de busca de categoria oculta: o pino aparece só enquanto o ponto estiver selecionado.
  temporary=onMap(p,filters,progress,null)?new Set():new Set([id]);
  applyMap();
  const raised=mobile();
  if (raised) $('workspace').classList.remove('panel-open');
  if (focus || raised) map.focus(p,{raised,zoomIn:focus});
  renderDetail();
}
function openSettings() {
  const dialog=$('dialog');
  const group=(name,kind)=>'<fieldset><legend>'+name+'</legend>'+Object.entries(configurable).filter(([,item])=>item.group===kind).map(([id,item])=>
    '<label class="check"><input type="checkbox" name="equipment" value="'+id+'" '+(progress.equipment.includes(id)?'checked':'')+'><span>'+esc(item.label)+'<small>'+esc(item.unlock)+'</small></span></label>').join('')+'</fieldset>';
  dialog.className='settings-dialog';
  dialog.innerHTML='<form method="dialog"><div class="dialog-head"><h2>Configurações</h2><button class="icon-button" value="cancel" aria-label="Fechar configurações">'+icon('x')+'</button></div>'+
    '<div class="dialog-scroll"><p class="muted">Marque o que você já tem no seu jogo. Pontos que exigem um item desmarcado recebem um cadeado, mas continuam no mapa.</p>'+
    group('Equipamentos','equipment')+group('Desbloqueios','unlock')+
    '<fieldset><legend>Mapa</legend><label class="check"><input type="checkbox" name="remember" '+(prefs.remember?'checked':'')+'><span>Memorizar filtros ao reabrir o mapa<small>Restaura as categorias ativas na próxima visita. Desativado: o mapa abre limpo.</small></span></label>'+
    '<div class="pin-size" role="radiogroup" aria-label="Tamanho dos pinos">'+Object.entries({small:'Pequeno',normal:'Normal',large:'Grande'}).map(([key,label])=>
      '<label class="chip-radio"><input type="radio" name="pinsize" value="'+key+'" '+(prefs.pinSize===key?'checked':'')+'><span>'+label+'</span></label>').join('')+'</div></fieldset>'+
    '<p class="muted small">Contatos, edições e outros requisitos aparecem nas fichas como informação e não bloqueiam pontos.</p>'+
    '<fieldset class="credits"><legend>Créditos do mapa</legend>'+
    '<p class="muted small">Cartografia: GTA VI Map Tiles (CC BY 4.0), de GTADB.ORG e contribuidores, '+external('https://map.gtadb.org','map.gtadb.org')+'. Tiles “day” z0–6 da revisão '+tileSource.revision.slice(0,7)+', usados sem alteração e servidos por este site. A arte do mapa do jogo pertence à Rockstar Games.</p>'+
    '<p class="muted small">Locais e coordenadas adaptados de '+external('https://github.com/fbritoferreira/gta6','Open GTA 6 Map')+', de fbritoferreira e contribuidores (CC BY 4.0). Ícones: '+external('https://lucide.dev/license','Lucide')+'.</p>'+
    '<p class="muted small">'+external('https://creativecommons.org/licenses/by/4.0/','Licença CC BY 4.0')+'</p></fieldset></div>'+
    '<div class="dialog-actions"><button class="ui-button primary" value="save">Salvar configurações</button></div></form>';
  dialog.querySelector('form').onsubmit=event=>{
    if(event.submitter?.value!=='save') return;
    const form=new FormData(event.currentTarget);
    progress.equipment=form.getAll('equipment').filter(key=>configurableKeys.includes(key));
    prefs.remember=form.get('remember')==='on';
    prefs.pinSize=pinSizes[form.get('pinsize')]?form.get('pinsize'):'normal';
    map.setPinSize(pinSizes[prefs.pinSize]);savePrefs();
    save();refresh();
  };
  dialog.showModal();
}
function openCustom(point) {
  const dialog=$('dialog');
  dialog.className='';
  dialog.innerHTML='<form method="dialog"><div class="dialog-head"><h2>'+(point.id?'Editar ponto':'Novo ponto')+'</h2><button formnovalidate value="cancel" class="icon-button" aria-label="Fechar">'+icon('x')+'</button></div>'+
    '<label class="form-row">Nome<input name="name" required maxlength="90" value="'+esc(point.name)+'"></label>'+
    '<label class="form-row">Região<input name="region" maxlength="90" value="'+esc(point.region)+'"></label>'+
    '<label class="form-row">Anotações<textarea name="description" maxlength="500" rows="3">'+esc(point.description)+'</textarea></label>'+
    '<div class="coord-input"><label class="form-row">X do mapa<input name="x" type="number" min="0" max="1024" step="any" required value="'+point.x+'"></label>'+
    '<label class="form-row">Y do mapa<input name="y" type="number" min="0" max="1024" step="any" required value="'+point.y+'"></label></div>'+
    '<div class="dialog-actions">'+(point.id?'<button formnovalidate value="delete" class="ui-button danger">Excluir</button>':'')+'<button class="ui-button primary" value="save">Salvar ponto</button></div></form>';
  const form=dialog.querySelector('form');
  form.onsubmit=event=>{
    const action=event.submitter?.value;
    if(action==='cancel') return;
    const f=new FormData(form);
    const id=point.id||'custom-'+(globalThis.crypto.randomUUID?.() ?? ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16)));
    if(action==='delete') {
      if(!confirm('Excluir este ponto e as marcações associadas?')) {event.preventDefault();return;}
      progress.custom=progress.custom.filter(p=>p.id!==id);
      progress.favorites=progress.favorites.filter(key=>key!==id);
      delete progress.completed[id];
    } else {
      if(!f.get('name').trim()){event.preventDefault();toast('Informe um nome.');return;}
      const edited={id,name:f.get('name').trim(),region:f.get('region').trim(),description:f.get('description').trim(),x:Number(f.get('x')),y:Number(f.get('y'))};
      progress.custom=[...progress.custom.filter(p=>p.id!==id),edited];
    }
    if(action!=='delete'){filters.show.add('custom');savePrefs();}
    commit();if(action!=='delete')selectPoint(id,true);
  };
  dialog.showModal();
}
function placement(value) {
  if (value) clearVehicleMap();
  placeMode=value;map.placing(value);$('placement').hidden=!value;
  if(value){$('workspace').classList.remove('panel-open');deselect();}
}
function exportBackup() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='leonida-progresso.json';
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function commit() {save();refresh();}
function clearVehicleMap() {
  if (!previewVehicle) return;
  previewVehicle=null;
  map.previewVehicles([]);
  $('vehicle-map-bar').hidden=true;
  $('workspace').classList.remove('vehicle-preview');
}
function showVehicleMap(vehicle,spots) {
  openPanel('map');
  if (placeMode) placement(false);
  deselect();
  previewVehicle=vehicle.id;
  $('vehicle-map-model').textContent=vehicle.name;
  $('vehicle-map-model').parentElement.setAttribute('aria-label','Voltar à ficha de '+vehicle.name);
  $('vehicle-map-bar').hidden=false;
  $('workspace').classList.add('vehicle-preview');
  map.previewVehicles(spots,vehicle.name);
}
function openPanel(name,reopenVehicle) {
  clearVehicleMap();
  panel=name;$('panel-content').scrollTop=0;
  $('workspace').classList.toggle('panel-open',name!=='map');
  $('workspace').classList.toggle('panel-vehicles',name==='vehicles');
  $('workspace').classList.remove('panel-collapsed');
  if(name==='vehicles'||mobile()&&name!=='map'){deselect();}
  if(name!=='vehicles')carFinder.hide();
  renderPanel();
  if(reopenVehicle)carFinder.openDetail(reopenVehicle);
}
function handleClick(event) {
  const target=event.target.closest('button');
  if(!target||target.closest('dialog'))return;
  const d=target.dataset;
  if(d.rankVehicle)return openPanel('vehicles',d.rankVehicle);
  if(d.point)return selectPoint(d.point,true);
  if(d.panel)return openPanel(d.panel);
  if(d.status){filters.status=d.status;listLimit=50;refresh();return;}
  if(d.filter){filters[d.filter]=!filters[d.filter];listLimit=50;refresh();return;}
  if(d.equipmentFilter){if(filters.equipment.has(d.equipmentFilter))filters.equipment.delete(d.equipmentFilter);else filters.equipment.add(d.equipmentFilter);listLimit=50;refresh();return;}
  if(d.clear){clearFilter(d.clear);return;}
  if(d.groupAll||d.groupNone){
    const keys=memberKinds(d.groupAll||d.groupNone,categoryCounts(data.filter(visible),filtered));
    for(const key of keys)if(d.groupAll)filters.show.add(key);else filters.show.delete(key);
    changeVisibility();return;
  }
  if(d.toggleGroup){if(openGroups.has(d.toggleGroup))openGroups.delete(d.toggleGroup);else openGroups.add(d.toggleGroup);renderPanel();return;}
  switch(d.action) {
    case 'home':openPanel('map');map.home();break;
    case 'settings':openSettings();break;
    case 'sidebar':
      if(mobile()) {
        if($('workspace').classList.contains('panel-open'))$('workspace').classList.remove('panel-open');
        else {openPanel('map');$('workspace').classList.add('panel-open');deselect();}
      } else $('workspace').classList.toggle('panel-collapsed');
      break;
    case 'zoom-in':map.zoomIn();break;
    case 'zoom-out':map.zoomOut();break;
    case 'reset-map':map.home();break;
    case 'place':placement(!placeMode);break;
    case 'cancel-place':placement(false);break;
    case 'list-more':listLimit+=50;renderPanel();break;
    case 'close-detail':deselect();break;
    case 'layers-all':filters.show=new Set(allKinds());filters.favoritePins=true;changeVisibility();break;
    case 'layers-none':filters.show=new Set();filters.favoritePins=false;changeVisibility();break;
    case 'enable-kind':{const point=lookup.get(selected);if(point){filters.show.add(point.kind);temporary=new Set();changeVisibility();}break;}
    case 'clear-filters':Object.assign(filters,freshFilters());$('query').value='';listLimit=50;refresh();break;
    case 'done':if(selected){if(progress.completed[selected])delete progress.completed[selected];else progress.completed[selected]=new Date().toISOString();commit();}break;
    case 'favorite':if(selected){progress.favorites=progress.favorites.includes(selected)?progress.favorites.filter(id=>id!==selected):[...progress.favorites,selected];commit();}break;
    case 'vehicle-rank':carFinder.sortByPrice();openPanel('vehicles');break;
    case 'vehicle-map-back':openPanel('vehicles',previewVehicle);break;
    case 'vehicle-map-clear':clearVehicleMap();break;
    case 'export':exportBackup();break;
    case 'import':$('backup-input').click();break;
    case 'edit':if(lookup.get(selected)?.evidence==='personal')openCustom(lookup.get(selected));break;
  }
}

function clearFilter(key) {
  if(key==='words'){filters.words=[];$('query').value='';}
  else if(key==='status')filters.status='all';
  else if(key==='availability')filters.availability='all';
  else if(key==='series')filters.series=new Set();
  else if(key.startsWith('equipment:'))filters.equipment.delete(key.slice(10));
  else filters[key]=false;
  listLimit=50;refresh();
}

async function init() {
  if('serviceWorker' in navigator&&import.meta.env.PROD){
    const hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.register(base+'sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
    // Uma versão nova do catálogo assumiu o controle: avisa para recarregar em vez de manter dados antigos.
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!hadController)return;
      $('toast').innerHTML='Nova versão do catálogo disponível. <button type="button" class="toast-reload">Recarregar</button>';
      $('toast').hidden=false;$('toast').style.pointerEvents='auto';
      $('toast').querySelector('button').onclick=()=>location.reload();
    });
  }
  const response=await fetch(base+'data/catalog.json');
  if(!response.ok)throw new Error('Catálogo indisponível');
  catalog=await response.json();
  aliases=catalogAliases(catalog);
  progress=freshProgress();
  loadPrefs();
  try {
    const old=localStorage.getItem(storageKey);
    if(old){progress=decodeProgress(JSON.parse(old),aliases);save();}
  }
  catch {toast('O progresso salvo não pôde ser lido.');}
  $('topbar').hidden=false;
  $('workspace').hidden=false;
  staticPoints=applyGuides(catalog);
  let detailWarned=false;
  map=createMap({labels:catalog.labels,onSelect:selectPoint,
    onDetailError:()=>{
      if(detailWarned)return;detailWarned=true;
      toast(navigator.onLine===false?'Sem conexão: áreas fora do cache aparecem em resolução reduzida.':'Alguns detalhes do mapa não carregaram; mostrando a visão geral nessas áreas.');
    },
    onPlace:p=>{placement(false);openCustom(p);},
    markerIcon:(p,done)=>pinGlyph(p,done)+(p.locked&&!done?'<i class="pin-lock" aria-hidden="true">'+glyph('lock')+'</i>':'')});
  map.setPinSize(pinSizes[prefs.pinSize]);
  carFinder=createCarFinder({root:$('vehicle-finder'),dialog:$('vehicle-dialog'),base,getProgress:()=>progress,showMap:showVehicleMap,
    toggleFavorite:id=>{
      progress.vehicleFavorites=progress.vehicleFavorites.includes(id)?progress.vehicleFavorites.filter(key=>key!==id):[...progress.vehicleFavorites,id];
      save();
    }});
  document.addEventListener('click',handleClick);
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!$('dialog').open&&!$('vehicle-dialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
      e.preventDefault();if(panel==='vehicles'){carFinder.focusSearch();return;}openPanel('map');if(mobile())$('workspace').classList.add('panel-open');$('query').focus();
    }
    if(e.key==='Escape'&&!$('dialog').open&&!$('vehicle-dialog').open){if(previewVehicle)clearVehicleMap();else if(placeMode)placement(false);else if(selected){deselect();}}
  });
  document.addEventListener('change',e=>{
    const {group,kind,series}=e.target.dataset;
    if(e.target.id==='category-query')return;
    if(e.target.id==='availability-filter'){filters.availability=e.target.value;listLimit=50;refresh();return;}
    if(group){
      const keys=memberKinds(group,categoryCounts(data.filter(visible),filtered));
      for(const key of keys)if(e.target.checked)filters.show.add(key);else filters.show.delete(key);
      if(e.target.checked)openGroups.add(group);
      changeVisibility();
    } else if(e.target.dataset.favorites!==undefined) {
      filters.favoritePins=e.target.checked;changeVisibility();
    } else if(kind) {
      if(e.target.checked)filters.show.add(kind);else filters.show.delete(kind);
      changeVisibility();
    } else if(series) {
      if(e.target.checked)filters.series.delete(series);else filters.series.add(series);
      refresh();
    }
  });
  $('panel-content').addEventListener('toggle',event=>{
    if(event.target.matches('.series'))seriesOpen=event.target.open;
  },true);
  $('category-query').addEventListener('input',e=>{categoryQuery=e.target.value;renderPanel();});
  let searchTimer;
  $('query').addEventListener('input',e=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{
      filters.words=normalize(e.target.value).split(' ').filter(Boolean);listLimit=50;
      $('panel-content').scrollTop=0;refresh();
    },75);
  });
  $('backup-input').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try {
      if(f.size>4_000_000)throw new Error('O arquivo excede 4 MB.');
      progress=mergeProgress(progress,decodeProgress(JSON.parse(await f.text()),aliases));
      commit();toast('Progresso importado.');
    } catch {toast('Arquivo de progresso inválido ou incompatível.');}
    finally {e.target.value='';}
  });
  let gripStart;
  document.addEventListener('pointerdown',e=>{
    if(e.target.classList.contains('mobile-grip')){
      gripStart={y:e.clientY,parent:e.target.parentElement};e.target.setPointerCapture(e.pointerId);
    }
  });
  document.addEventListener('pointerup',e=>{
    if(gripStart&&e.clientY-gripStart.y>35) {
      if(gripStart.parent.id==='detail'){deselect();}
      else $('workspace').classList.remove('panel-open');
    }
    gripStart=null;
  });
  document.addEventListener('pointercancel',()=>{gripStart=null;});

  refresh();
}
$('app-version').textContent='v'+version;
installSprite();
installIcons();
init().catch(error=>{console.error(error);$('startup-error').hidden=false;});

