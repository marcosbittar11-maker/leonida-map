import { createMap } from './map.js';
import { installIcons, icon } from './icons.js';
import { checked, equipment, leads } from './guides.js';
import { applyGuides, decodeProgress, mergeProgress, freshProgress, chapters, normalize, visible, matches, remaining, rangeText } from './model.js';
import { graphFromRoads, routeLeg } from './routes.js';
import './style.css';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = new Intl.NumberFormat('pt-BR');
const base = import.meta.env.BASE_URL;
const storageKey = 'leonida-map:progress:v1';
const mobile = () => matchMedia('(max-width: 760px)').matches;
const filters = {status:'all',groups:new Set(),kinds:new Set(),words:[]};
let panel='map', selected=null, placeMode=false, groupList=null, progress, catalog, map, staticPoints, data, filtered, lookup;
let roadsPromise, graph=null, routeRevision=0, flashTimer, listLimit=50;
const openGroups=new Set(['Operações']);
const badge = (text,tone='') => '<span class="badge '+tone+'">'+esc(text)+'</span>';
const button = (label, action, image, extra='') => '<button type="button" class="ui-button '+extra+'" data-action="'+action+'">'+(image?icon(image):'')+esc(label)+'</button>';
const auditDate = date => date?.split('-').reverse().join('/') ?? '';
const routeDistance = units => fmt.format(Math.round(units))+' u';
const categoryIcon = p => p.symbol || p.category?.icon || '📍';
const external = (url, title) => /^https?:\/\//i.test(url) ? '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+icon('arrow-up-right')+'</a>' : '';
const sourceURL = (c,rev) => 'https://github.com/fbritoferreira/gta6/blob/'+rev+'/public/data/'+(c || 'locations')+'.json';
function sourceName(url,index) {
  try {return /youtu/.test(new URL(url).hostname) ? 'Vídeo'+(url.includes('&t=')?' com momento marcado':'') : new URL(url).hostname.replace(/^www\./,'');}
  catch {return 'Fonte '+(index+1);}
}
function pointButton(p,value='') {
  return '<button class="point-row" data-point="'+esc(p.id)+'"><span class="point-icon" style="--pin:'+esc(p.category?.colour || '#be90ff')+'">'+esc(categoryIcon(p))+'</span><span class="point-copy"><strong>'+esc(p.name)+'</strong><small>'+esc(value || p.region || p.category?.name || 'Ponto personalizado')+'</small></span>'+(progress.completed[p.id]?'<span class="mint">✓</span>':'')+icon('chevron-right')+'</button>';
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
  return progress.custom.map(p=>({...p,kind:'custom',category:{key:'custom',name:'Personalizado',group:'Outros',colour:'#eeb994',icon:'📍'},
    evidence:'personal',neutral:true,search:normalize([p.name,p.region,p.description,'personalizado'].join(' '))}));
}
function refresh() {
  data=[...staticPoints,...customPoints()];
  lookup=new Map(data.map(p=>[p.id,p]));
  filtered=data.filter(p=>matches(p,filters,progress));
  if (selected && !filtered.some(p=>p.id===selected)) selected=null;
  map.update(filtered,progress,selected);
  $('map-count').textContent=fmt.format(filtered.filter(p=>p.x!=null).length)+' pinos';
  $('chapter-label').textContent='Capítulo '+progress.chapter;
  renderPanel(); renderDetail(); drawRoute();
}
function groupMarkup(allowed) {
  const counted=new Map();
  for (const p of allowed) counted.set(p.kind,(counted.get(p.kind)||0)+1);
  const groups=new Map();
  for (const c of [...catalog.categories,{key:'custom',name:'Personalizados',group:'Outros',colour:'#eeb994',icon:'📍'}]) {
    if (!counted.has(c.key)) continue;
    const list=groups.get(c.group) || [];
    list.push(c); groups.set(c.group,list);
  }
  return '<div class="section-title"><h2>Categorias</h2>'+button('Restaurar','reset-filters','','text-button')+'</div>'+
    ['Operações','Colecionáveis','Atividades','Locais','Outros'].filter(g=>groups.has(g)).map(group=>{
      const list=groups.get(group), total=list.reduce((sum,c)=>sum+counted.get(c.key),0), on=!filters.groups.has(group);
      return '<section class="category-group"><div class="category-head"><input type="checkbox" aria-label="'+group+'" data-group="'+group+'" '+(on?'checked':'')+'><button data-toggle-group="'+group+'" aria-expanded="'+openGroups.has(group)+'"><strong>'+group+'</strong><small>'+fmt.format(total)+'</small>'+icon('chevron-down')+'</button></div>'+
        (openGroups.has(group)?list.map(c=>'<label class="category-row" style="--pin:'+esc(c.colour)+'"><input type="checkbox" data-kind="'+esc(c.key)+'" '+(!filters.kinds.has(c.key)&&on?'checked ':'')+(!on?'disabled ':'')+'><span class="category-symbol">'+esc(c.icon)+'</span><span>'+esc(c.name)+'</span><small>'+fmt.format(counted.get(c.key))+'</small></label>').join(''):'')+'</section>';
    }).join('');
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
  $('search-tools').hidden=panel!=='map';
  $('panel-title').textContent=({map:'Explorar Leonida',rank:'Rankings',route:'Planejar rotas',progress:'Seu progresso'})[panel];
  $('panel-caption').textContent=({map:'Pontos de interesse e guias de GTA VI',rank:'Compare as recompensas disponíveis',route:'Monte um trajeto com pinos do mapa',progress:'Checklist e histórico de exploração'})[panel];
  const available=data.filter(p=>visible(p,progress)), completed=available.filter(p=>progress.completed[p.id]);
  const pct=available.length?Math.round(completed.length/available.length*100):0;
  const scroll=$('panel-content').scrollTop;
  if (panel==='map') {
    const showingList=filters.words.length || filters.status!=='all' || filters.repeat || filters.peace || filters.guides || groupList;
    const list=groupList ? filtered.filter(p=>groupList.includes(p.id)) : filtered;
    const featured=['safe-070','L2453','liquor-store-002','vehicle-request-013'].map(id=>lookup.get(id)).filter(p=>p && filtered.includes(p));
    $('panel-content').innerHTML=(showingList?
      '<div class="section-title"><h2>'+(groupList?'Pinos próximos':'Resultados')+'</h2><span>'+fmt.format(list.length)+'</span></div>'+listMarkup(list)
      : (featured.length?'<div class="section-title"><h2>Guias em destaque</h2></div>'+featured.map(p=>pointButton(p)).join(''):'')+groupMarkup(available));
  }
  if (panel==='rank') renderRank();
  if (panel==='progress') renderProgress(available,completed);
  if (panel==='route') renderRoutePanel();
  $('panel-content').scrollTop=scroll;
  $('panel-footer').innerHTML='<div><strong>Progresso em Leonida</strong><b>'+pct+'%</b></div><progress value="'+completed.length+'" max="'+Math.max(available.length,1)+'"></progress><small>'+fmt.format(completed.length)+' / '+fmt.format(available.length)+' pontos visíveis</small>';
}
function renderRank() {
  const ranking=field=>filtered.filter(p=>p[field]).sort((a,b)=>(b[field][0]+b[field][1])-(a[field][0]+a[field][1])).map(p=>pointButton(p,rangeText(p[field]))).join('');
  $('panel-content').innerHTML='<div class="section-title"><h2>Atividades lucrativas</h2></div><p class="muted">Faixas podem incluir loot bruto ou bônus.</p>'+
    (ranking('reward')||'<p class="empty">Sem atividade com valor conhecido nos filtros atuais.</p>')+
    '<div class="section-title"><h2>Revenda de veículos</h2></div>'+(ranking('resale')||
      '<p class="empty">Ainda não há preços individuais de revenda livre suficientemente documentados.</p>')+
    '<div class="section-title"><h2>Pistas sem pino</h2></div>'+leads.filter(p=>!progress.spoilers||p.chapter<=progress.chapter).map(p=>
      '<details class="note"><summary>'+esc(p.name)+'</summary><p>'+esc(p.note)+'</p>'+p.refs.map((ref,i)=>external(ref,sourceName(ref,i))).join('')+'</details>').join('');
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
  if (!p || !visible(p,progress)) {d.hidden=true;d.innerHTML='';return;}
  const complete=!!progress.completed[p.id], favorite=progress.favorites.includes(p.id);
  const level=p.official?'Local oficial · posição comunitária':p.guide&&!p.guide.summary?'Guia com fontes':({community:'Relato público',confirmed:'Confirmação da fonte',unknown:'Evidência incompleta',personal:'Seu ponto'}[p.evidence]);
  const fields={...(p.guide?.fields || {})};
  if (p.guide) {
    if (['bank','smash','gang','payday','store','safe'].includes(p.kind)) {
      fields['Câmeras e alarmes']??=unknown;
      fields['Cofre']??=unknown;
      fields['Senha']??=unknown;
      if (!fields['Hostis']) fields['Guardas']??=unknown;
    }
    if (p.kind==='vehicle') {
      fields['Revenda livre']??=p.resale?rangeText(p.resale):unknown;
      fields['Alarme']??=unknown;
      fields['NPCs e horários']??=unknown;
    }
    fields['Repetição']=p.repeatable===true?'Relatada':p.repeatable===false?'Atividade única':unknown;
  }
  const coord=p.x!=null?'X '+fmt.format(p.x*32-16384)+' · Y '+fmt.format(16384-p.y*32):'Sem coordenadas';
  const gate=(p.requires||[]).map(key=>equipment[key]).join(' · ');
  const sourceLinks=[...new Set([...(p.refs||[]),...(!p.neutral?p.sources||[]:[])])];
  d.hidden=false;
  d.innerHTML='<div class="mobile-grip" aria-hidden="true"></div><div class="detail-head"><span class="point-icon large" style="--pin:'+esc(p.category?.colour||'#bd94ff')+'">'+esc(categoryIcon(p))+'</span><div><h2>'+esc(p.name)+'</h2><p>'+esc([p.category?.name,p.region].filter(Boolean).join(' · '))+'</p></div><button class="icon-button '+(favorite?'is-fave':'')+'" data-action="favorite" aria-label="Favoritar ponto" aria-pressed="'+favorite+'">'+icon('star')+'</button><button class="icon-button" data-action="close-detail" aria-label="Fechar detalhes">'+icon('x')+'</button></div>'+
    '<div class="detail-body"><div class="badges">'+badge(level,p.evidence==='community'?'purple':'')+(p.chapter?badge('Capítulo '+p.chapter):'')+(complete?badge('Concluído','green'):'')+'</div>'+
    '<p class="coordinates" title="Sistema da base cartográfica. A origem pode ser aproximada">'+icon('locate-fixed')+esc(coord)+(p.x!=null?' <small>· posição da fonte</small>':'')+'</p>'+
    (p.intro?'<p>'+esc(p.intro)+'</p>':'')+
    (p.description && (p.evidence==='personal'||(!p.guide && (!progress.spoilers||progress.showUnknown)))?'<p>'+esc(p.description)+'</p>':'')+
    (gate?'<div class="requirement">'+icon('shield')+'<span>'+esc(gate)+'</span></div>':'')+
    (p.guide?.image?'<img class="location-photo" src="'+esc(base+p.guide.image.file)+'" alt="'+esc(p.guide.image.alt)+'" loading="lazy"><small>'+esc(p.guide.image.credit)+'</small>':'')+
    (Object.keys(fields).length?'<dl>'+Object.entries(fields).map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>':'')+
    (p.steps?.length?'<details class="note"><summary>Como fazer</summary><ol>'+p.steps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol></details>':'')+
    (p.evidence==='personal'?'':'<details class="note"><summary>Fontes · '+auditDate(p.guide?checked:catalog.metadata.verified)+'</summary>'+
      sourceLinks.map((ref,i)=>external(ref,sourceName(ref,i))).join('')+external(sourceURL(p.collection,catalog.metadata.revision),'Open GTA 6 Map · coordenadas')+'</details>')+
    '</div><div class="detail-actions">'+button(complete?'Reabrir ponto':'Concluir ponto','done','check',complete?'':'primary')+
      (p.x!=null?button('Rota','route-add','route'):'')+(p.evidence==='personal'?button('Editar','edit','settings-2'):'')+'</div>';
}
function selectPoint(id,focus=false,nearby=null) {
  if (nearby) {
    groupList=nearby;panel='map';listLimit=50;$('workspace').classList.add('panel-open');renderPanel();return;
  }
  const p=lookup.get(id);
  if (!p||!visible(p,progress)) return;
  selected=id;
  const raised=mobile();
  if (raised) $('workspace').classList.remove('panel-open');
  if (focus || raised) map.focus(p,{raised,zoomIn:focus});
  map.highlight(id); renderDetail();
}
function routePoints() {
  return progress.route.map(id=>lookup.get(id)).filter(p=>p?.x!=null&&visible(p,progress));
}
let legs=[];
function renderRoutePanel() {
  const list=routePoints();
  const drawn=legs.length===Math.max(0,list.length-1) && legs.every((leg,i)=>leg.a.id===list[i].id&&leg.b.id===list[i+1].id);
  $('panel-content').innerHTML=(list.length?list.map((p,i)=>
    '<div class="route-row"><span class="step-number">'+(i+1)+'</span><button data-point="'+esc(p.id)+'">'+esc(p.name)+'</button>'+
    '<button class="icon-button" data-route-up="'+esc(p.id)+'" aria-label="Subir parada" '+(i?'':'disabled')+'>'+icon('move-up')+'</button>'+
    '<button class="icon-button" data-route-down="'+esc(p.id)+'" aria-label="Descer parada" '+(i<list.length-1?'':'disabled')+'>'+icon('move-down')+'</button>'+
    '<button class="icon-button" data-route-remove="'+esc(p.id)+'" aria-label="Remover parada">'+icon('x')+'</button></div>'
  ).join(''):'<p class="empty">Selecione um pino e toque em Rota para acrescentar uma parada.</p>')+
    (list.length>1?button('Enquadrar rota','fit-route','locate-fixed','full'):'')+
    (drawn&&legs.length?'<div class="section-title"><h2>Trechos</h2></div>'+legs.map((leg,i)=>
      '<div class="metric segment"><strong>'+(i+1)+' → '+(i+2)+'</strong><p>Linha reta · '+routeDistance(leg.straight)+'</p>'+
      '<p>'+(leg.known?'Vias mapeadas · '+routeDistance(leg.length)+' · acessos fora do cálculo ('+routeDistance(leg.access)+')':'Nenhuma conexão viária encontrada')+'</p></div>').join(''):'')+
    '<p class="muted">Linha roxa tracejada indica linha reta. Linha verde segue a malha viária comunitária, sujeita a acessos, mão de direção e barreiras do jogo.</p>';
}
async function drawRoute(fit=false) {
  const list=routePoints(), ticket=++routeRevision;
  const display=() => {
    legs=list.slice(1).map((p,i)=>routeLeg(list[i],p,graph));
    map.route(list,legs,fit);
    if (panel==='route') renderRoutePanel();
  };
  display();
  if (list.length<2||graph) return;
  roadsPromise ||= fetch(base+'data/roads.json').then(r=>{if(!r.ok) throw new Error('Mapa viário indisponível'); return r.json();}).then(graphFromRoads);
  try {graph=await roadsPromise;if(ticket===routeRevision)display();}
  catch {roadsPromise=null;}
}

function openSettings() {
  const dialog=$('dialog');
  dialog.innerHTML='<form method="dialog"><div class="dialog-head"><h2>Capítulo e acesso</h2><button class="icon-button" value="cancel" aria-label="Fechar preferências">'+icon('x')+'</button></div>'+
    '<label class="form-row">Capítulo atual<select name="chapter">'+chapters.map(n=>'<option '+(progress.chapter===n?'selected':'')+' value="'+n+'">Capítulo '+n+'</option>').join('')+'</select></label>'+
    '<label class="check"><input type="checkbox" name="spoilers" '+(progress.spoilers?'checked':'')+'> Proteger contra spoilers</label>'+
    '<label class="check"><input type="checkbox" name="showUnknown" '+(progress.showUnknown?'checked':'')+'> Mostrar atividades sem capítulo verificado</label>'+
    '<p class="muted">Atividades sem capítulo conhecido e links externos podem conter spoilers.</p>'+
    '<label class="check"><input type="checkbox" name="strictAccess" '+(progress.strictAccess?'checked':'')+'> Mostrar apenas pontos com requisitos atendidos</label>'+
    '<fieldset><legend>Equipamentos e desbloqueios</legend>'+Object.entries(equipment).map(([id,name])=>
      '<label class="check"><input type="checkbox" name="equipment" value="'+id+'" '+(progress.equipment.includes(id)?'checked':'')+'> '+esc(name)+'</label>').join('')+
    '</fieldset><div class="dialog-actions"><button class="ui-button primary" value="save">Salvar preferências</button></div></form>';
  dialog.querySelector('form').onsubmit=event=>{
    if(event.submitter?.value!=='save') return;
    const form=new FormData(event.currentTarget);
    Object.assign(progress,{chapter:Number(form.get('chapter')),spoilers:form.has('spoilers'),showUnknown:form.has('showUnknown'),
      strictAccess:form.has('strictAccess'),equipment:form.getAll('equipment')});
    save();refresh();
  };
  dialog.showModal();
}
function openCustom(point) {
  const dialog=$('dialog');
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
      progress.favorites=progress.favorites.filter(key=>key!==id);progress.route=progress.route.filter(key=>key!==id);
      delete progress.completed[id];
    } else {
      if(!f.get('name').trim()){event.preventDefault();toast('Informe um nome.');return;}
      const edited={id,name:f.get('name').trim(),region:f.get('region').trim(),description:f.get('description').trim(),x:Number(f.get('x')),y:Number(f.get('y'))};
      progress.custom=[...progress.custom.filter(p=>p.id!==id),edited];
    }
    commit();if(action!=='delete')selectPoint(id,true);
  };
  dialog.showModal();
}
function placement(value) {
  placeMode=value;map.placing(value);$('placement').hidden=!value;
  if(value){$('workspace').classList.remove('panel-open');selected=null;map.highlight(null);renderDetail();}
}
function exportBackup() {
  const url=URL.createObjectURL(new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='leonida-progresso.json';
  a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function commit() {save();refresh();}
function changeRoute(id,direction) {
  if(direction===0)progress.route=progress.route.filter(key=>key!==id);
  else {
    const visibleIds=routePoints().map(p=>p.id);
    const i=progress.route.indexOf(id), j=progress.route.indexOf(visibleIds[visibleIds.indexOf(id)+direction]);
    if(i>=0&&j>=0)[progress.route[i],progress.route[j]]=[progress.route[j],progress.route[i]];
  }
  commit();
}
function openPanel(name) {
  panel=name;groupList=null;$('panel-content').scrollTop=0;
  $('workspace').classList.toggle('panel-open',name!=='map');
  $('workspace').classList.remove('panel-collapsed');
  if(mobile()&&name!=='map'){selected=null;map.highlight(null);renderDetail();}
  renderPanel();
}
function handleClick(event) {
  const target=event.target.closest('button');
  if(!target||target.closest('dialog'))return;
  const d=target.dataset;
  if(d.point)return selectPoint(d.point,true);
  if(d.panel)return openPanel(d.panel);
  if(d.status){filters.status=d.status;groupList=null;listLimit=50;refresh();return;}
  if(d.filter){filters[d.filter]=!filters[d.filter];groupList=null;listLimit=50;refresh();return;}
  if(d.toggleGroup){if(openGroups.has(d.toggleGroup))openGroups.delete(d.toggleGroup);else openGroups.add(d.toggleGroup);renderPanel();return;}
  if(d.routeRemove)return changeRoute(d.routeRemove,0);
  if(d.routeUp)return changeRoute(d.routeUp,-1);
  if(d.routeDown)return changeRoute(d.routeDown,1);
  switch(d.action) {
    case 'home':openPanel('map');map.home();break;
    case 'settings':openSettings();break;
    case 'sidebar':
      if(mobile()) {
        if($('workspace').classList.contains('panel-open'))$('workspace').classList.remove('panel-open');
        else {openPanel('map');$('workspace').classList.add('panel-open');selected=null;map.highlight(null);renderDetail();}
      } else $('workspace').classList.toggle('panel-collapsed');
      break;
    case 'zoom-in':map.zoomIn();break;
    case 'zoom-out':map.zoomOut();break;
    case 'reset-map':map.home();break;
    case 'place':placement(!placeMode);break;
    case 'cancel-place':placement(false);break;
    case 'list-more':listLimit+=50;renderPanel();break;
    case 'close-detail':selected=null;map.highlight(null);renderDetail();break;
    case 'reset-filters':Object.assign(filters,{status:'all',groups:new Set(),kinds:new Set(),words:[],repeat:false,peace:false,guides:false});$('query').value='';groupList=null;refresh();break;
    case 'done':if(selected){if(progress.completed[selected])delete progress.completed[selected];else progress.completed[selected]=new Date().toISOString();commit();}break;
    case 'favorite':if(selected){progress.favorites=progress.favorites.includes(selected)?progress.favorites.filter(id=>id!==selected):[...progress.favorites,selected];commit();}break;
    case 'route-add':
      if(selected&&!progress.route.includes(selected)&&progress.route.length<25){progress.route.push(selected);commit();toast('Parada adicionada à rota.');}
      else toast('Ponto já incluído ou limite de 25 paradas.');
      break;
    case 'fit-route':drawRoute(true);if(mobile())$('workspace').classList.remove('panel-open');break;
    case 'export':exportBackup();break;
    case 'import':$('backup-input').click();break;
    case 'edit':if(lookup.get(selected)?.evidence==='personal')openCustom(lookup.get(selected));break;
  }
}

function selectInitialChapter() {
  const gate=$('chapter-gate'), form=$('initial-chapter');
  const select=form.elements.chapter;
  for (const chapter of chapters) select.add(new Option('Capítulo '+chapter,chapter));
  gate.hidden=false;
  return new Promise(resolve=>{
    form.addEventListener('submit',event=>{
      event.preventDefault();
      progress.chapter=Number(select.value);
      progress.chapterSelected=true;
      save();
      gate.hidden=true;
      resolve();
    },{once:true});
  });
}

async function init() {
  if('serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(base+'sw.js').catch(()=>{});
  const response=await fetch(base+'data/catalog.json');
  if(!response.ok)throw new Error('Catálogo indisponível');
  catalog=await response.json();
  progress=freshProgress();
  try {const old=localStorage.getItem(storageKey);if(old)progress=decodeProgress(JSON.parse(old),catalog.aliases);}
  catch {toast('O progresso salvo não pôde ser lido.');}
  if(progress.chapter===null)await selectInitialChapter();
  $('topbar').hidden=false;
  $('workspace').hidden=false;
  staticPoints=applyGuides(catalog);
  map=createMap({revision:catalog.metadata.revision,labels:catalog.labels,onSelect:selectPoint,
    onPlace:p=>{placement(false);openCustom(p);},markerText:categoryIcon});
  document.addEventListener('click',handleClick);
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!$('dialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
      e.preventDefault();openPanel('map');if(mobile())$('workspace').classList.add('panel-open');$('query').focus();
    }
    if(e.key==='Escape'&&!$('dialog').open){if(placeMode)placement(false);else if(selected){selected=null;map.highlight(null);renderDetail();}}
  });
  document.addEventListener('change',e=>{
    for(const [attr,set] of [['group',filters.groups],['kind',filters.kinds]])if(e.target.dataset[attr]){
      if(e.target.checked)set.delete(e.target.dataset[attr]);else set.add(e.target.dataset[attr]);
      refresh();
    }
  });
  let searchTimer;
  $('query').addEventListener('input',e=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{
      filters.words=normalize(e.target.value).split(' ').filter(Boolean);groupList=null;listLimit=50;
      $('panel-content').scrollTop=0;refresh();
    },75);
  });
  $('backup-input').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try {
      if(f.size>4_000_000)throw new Error('O arquivo excede 4 MB.');
      progress=mergeProgress(progress,decodeProgress(JSON.parse(await f.text()),catalog.aliases));
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
      if(gripStart.parent.id==='detail'){selected=null;map.highlight(null);renderDetail();}
      else $('workspace').classList.remove('panel-open');
    }
    gripStart=null;
  });
  document.addEventListener('pointercancel',()=>{gripStart=null;});
  if(!mobile()&&!progress.completed['safe-070'])selected='safe-070';
  refresh();
}
installIcons();
init().catch(error=>{console.error(error);$('startup-error').hidden=false;});

