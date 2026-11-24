
import { icon, installIcons } from './icons.js';
import { rangeText, moneyText } from './model.js';
import { requirementLabel, configurable } from './requirements.js';
import { classes, buyers, trackers, rarity, availability, confidence, unknown, selectVehicles, vehicleSearch,
  exactMarkers, visibleSpawns, observed, buyerStatus, priceRange } from './vehicles.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = new Intl.NumberFormat('pt-BR');
const className = v => classes[v.class] || classes.unknown;
const evidence = v => confidence[v.level] || unknown;
const ternary = {true:'Sim',false:'Não',mixed:'Varia entre exemplares'};
const statsLabels = {speed:'Velocidade',acceleration:'Aceleração',asphalt:'Asfalto',offroad:'Fora de estrada',strength:'Resistência'};
const option = ([key,label]) => '<option value="'+esc(key)+'">'+esc(label)+'</option>';
const select = (label,key,options,empty='Todos') => '<label>'+label+'<select name="'+key+'">'+option(['',empty])+Object.entries(options).map(option).join('')+'</select></label>';
const entryLabels = {open:'Destrancado',slim:'Slim Jim',cloner:'Clonador de chaves'};
const conditional = {request:'Na lista de encomendas',conditional:'Compatível com o rastreador observado',no:'Incompatível com o rastreador observado',mixed:'Depende do exemplar',shop:'Confira a aceitação na oficina',observed:'Oferta documentada para um exemplar'};
const fields = entries => '<dl class="vf-fields">'+entries.map(([name,value])=>'<div><dt>'+esc(name)+'</dt><dd>'+esc(value??unknown)+'</dd></div>').join('')+'</dl>';
const source = (url,label) => {
  if (!/^https:\/\//i.test(url ?? '')) return '';
  return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label||new URL(url).hostname.replace(/^www\./,''))+icon('arrow-up-right')+'</a>';
};
const action = (label,attr,value='',glyph='',styles='') => '<button type="button" class="ui-button '+styles+'" data-'+attr+'="'+esc(value)+'">'+icon(glyph)+esc(label)+'</button>';
const favoritesButton = (vehicle,favorite) => '<button type="button" class="icon-button vf-star '+(favorite?'is-fave':'')+'" data-vehicle-favorite="'+esc(vehicle.id)+'" aria-label="Favoritar '+esc(vehicle.name)+'" aria-pressed="'+favorite+'">'+icon('star')+'</button>';
function photo(vehicle, base, large=false) {
  if (!vehicle.photo?.file) return '<div class="vf-photo vf-no-photo" role="img" aria-label="Sem foto confirmada">'+icon('car')+'</div>';
  const p=vehicle.photo;
  return '<img class="vf-photo" src="'+esc(base+p.file)+'" '+(p.small?'srcset="'+esc(base+p.small)+' 360w, '+esc(base+p.file)+' 800w" sizes="'+(large?'(max-width: 600px) 95vw, 550px':'(max-width: 760px) 50vw, 250px')+'"':'')+
    ' alt="'+esc(p.alt || vehicle.name)+'" width="800" height="450" loading="lazy" decoding="async">';
}

export function createCarFinder({root,dialog,base,getProgress,toggleFavorite,showMap}) {
  let catalog, loading, loadError=false, detailId, listLimit=60, view='list';
  let dialogReturn;
  const makeFilters = () => ({query:'',sort:'name',min:'',max:''});
  let filters=makeFilters();
  root.innerHTML='<div class="vf-shell"><header class="vf-header"><div class="vf-title"><h1>Veículos</h1><p>Car Finder</p></div>'+
    '<div class="vf-toolbar"><label class="searchbox">'+icon('search')+'<input name="query" type="search" aria-label="Buscar veículos" placeholder="Modelo ou fabricante…" autocomplete="off"></label>'+
    '<div class="vf-layout" aria-label="Visualização"><button type="button" data-vehicle-view="list" class="icon-button" aria-label="Lista compacta" aria-pressed="true">'+icon('list')+'</button>'+
    '<button type="button" data-vehicle-view="gallery" class="icon-button" aria-label="Galeria" aria-pressed="false">'+icon('layout-grid')+'</button></div></div>'+
    '<div class="vf-actions"><button type="button" class="ui-button" data-vehicle-favorites aria-pressed="false">'+icon('star')+'Favoritos</button>'+
    select('Ordenar','sort',{name:'Nome',price:'Revenda',speed:'Velocidade',rarity:'Raridade'},'').replace('<option value=""></option>','')+'</div>'+
    '<details class="vf-filter"><summary>'+icon('sliders-horizontal')+'Filtros <span id="vf-filter-count"></span>'+icon('chevron-down')+'</summary>'+
    '<form class="vf-filter-fields">'+select('Classe','class',classes,'Todas')+select('Comprador','buyer',buyers)+
    '<label>Revenda mínima<input name="min" type="number" inputmode="numeric" min="0" placeholder="US$"></label>'+
    '<label>Revenda máxima<input name="max" type="number" inputmode="numeric" min="0" placeholder="US$"></label>'+
    select('Rastreador','tracker',{...trackers,unknown})+select('Alarme','alarm',{...ternary,unknown})+
    select('Clonador de chaves','cloner',{...ternary,unknown})+select('Raridade','rarity',{...rarity,unknown})+
    select('Disponibilidade','availability',{...availability,unknown},'Todas')+
    '<label class="check vf-compatible"><input name="compatible" type="checkbox"> Apenas compatíveis com meus equipamentos</label>'+
    '<small class="vf-help">Usa o Slim Jim e o clonador de chaves marcados em Configurações e o rastreador observado nos scans. Compradores precisam estar liberados no seu jogo. A raridade indica variantes e edições especiais.</small>'+
    action('Limpar filtros','vehicle-reset')+'</form></details></header>'+
    '<div class="vf-content"><p class="vf-count" role="status"></p><div class="vf-results"></div></div></div>';
  const result=root.querySelector('.vf-results');
  const count=root.querySelector('.vf-count');
  const filterCount=root.querySelector('#vf-filter-count');
  const form=root.querySelector('form');
  const content=root.querySelector('.vf-content');
  const favoritesControl=root.querySelector('[data-vehicle-favorites]');

  function applyFilters() {
    const previousPosition=content.scrollTop;
    const progress=getProgress();
    filterCount.textContent=String(Object.keys(filters).filter(key=>!['query','sort','favorites'].includes(key)&&filters[key]).length || '');
    favoritesControl.setAttribute('aria-pressed',!!filters.favorites);
    root.querySelectorAll('[data-vehicle-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.vehicleView===view));
    if (!catalog) {
      count.textContent=loadError?'Catálogo indisponível.':'Carregando catálogo…';
      result.innerHTML=loadError?action('Tentar novamente','vehicle-retry','','','primary'):'';
      return;
    }
    const matches=selectVehicles(catalog.vehicles,filters,progress);
    count.textContent=fmt.format(matches.length)+(matches.length===1?' veículo':' veículos');
    if (!matches.length) {
      const inverted=filters.min!==''&&filters.max!==''&&Number(filters.min)>Number(filters.max);
      result.innerHTML='<p class="empty">'+(inverted?'O preço mínimo precisa ser menor ou igual ao máximo.':'Nenhum veículo encontrado com esses filtros.')+'</p>';
      return;
    }
    const favoriteIds=new Set(progress.vehicleFavorites);
    const card = v=>{
      const value=priceRange(v);
      return '<article class="vf-card"><button type="button" class="vf-open" data-vehicle-detail="'+esc(v.id)+'">'+
        (view==='gallery'?photo(v,base):'<span class="vf-car-icon">'+icon('car')+'</span>')+
        '<span class="vf-card-copy"><strong>'+esc(v.name)+'</strong><small>'+esc(className(v)+(v.variant?' · Variante':''))+'</small>'+
        '<span class="vf-price">'+esc(value?rangeText(value):unknown)+'</span></span></button>'+favoritesButton(v,favoriteIds.has(v.id))+'</article>';
    };
    const container=rows=>'<div class="vf-cards '+view+'">'+rows.map(card).join('')+'</div>';
    if (filters.sort==='name' && !filters.class && !filters.query && !filters.favorites) {
      const groups=Object.entries(classes).flatMap(([key,label])=>{
        const members=matches.filter(v=>v.class===key);
        return members.length?[{label,members}]:[];
      });
      let left=listLimit;
      result.innerHTML=groups.map(({label,members})=>{
        const shown=members.slice(0,left);
        left-=shown.length;
        return shown.length?'<section class="vf-group"><h2>'+esc(label)+' <small>'+members.length+'</small></h2>'+container(shown)+'</section>':'';
      }).join('');
    } else result.innerHTML=container(matches.slice(0,listLimit));
    if (matches.length>listLimit) result.insertAdjacentHTML('beforeend',action('Carregar mais veículos','vehicle-more','','plus','full vf-more'));
    content.scrollTop=previousPosition;
  }

  function load() {
    if (catalog || loading) return;
    loadError=false;
    loading=fetch(base+'data/vehicles.json').then(response=>{
      if (!response.ok) throw Error('Catálogo indisponível');
      return response.json();
    }).then(data=>{
      if (data.schema!==1 || !Array.isArray(data.vehicles)) throw Error('Estrutura de catálogo incompatível');
      data.vehicles.forEach(v=>v.search=vehicleSearch(v));
      catalog=data;
    }).catch(()=>{loadError=true;}).finally(()=>{loading=null;applyFilters();});
  }
  function render() {
    root.hidden=false;
    load();
    applyFilters();
  }
  function setFilter(input) {
    filters[input.name]=input.type==='checkbox'?input.checked:input.value;
    listLimit=60;content.scrollTop=0;applyFilters();
  }
  const vehicle = id => catalog?.vehicles.find(v=>v.id===id);
  function openDetail(id,origin) {
    const v=vehicle(id), progress=getProgress();
    if (!v) return;
    detailId=id;
    dialogReturn=origin || root.querySelector('[name="query"]');
    renderDetail(v,progress);
    if (!dialog.open) dialog.showModal();
  }
  function renderDetail(v,progress) {
    const spawns=visibleSpawns(v);
    const fixed=exactMarkers(v,progress);
    const all=exactMarkers(v,progress,{reported:true});
    const value=priceRange(v);
    const favored=progress.vehicleFavorites.includes(v.id);
    const globalSources=[...new Set(v.refs ?? [])];
    const specs=Object.entries(statsLabels).filter(([key])=>v.stats?.[key]!=null)
      .map(([key,label])=>[label,fmt.format(v.stats[key])+' / 10']);
    if (v.ratings?.road!=null) specs.push(['Índice em pista',fmt.format(v.ratings.road)]);
    if (v.ratings?.offroad!=null) specs.push(['Índice fora de estrada',fmt.format(v.ratings.offroad)]);
    const buyerRows = Object.entries(buyers).map(([key,label])=>{
      const status=buyerStatus(v,key);
      return [label,conditional[status] ?? unknown];
    });
    const documentedOffers=v.buyerPrices ?? [];
    const requires=items=>items?.map(requirementLabel).filter(Boolean).join(' · ');
    const favoriteActive=dialog.querySelector('[data-vehicle-favorite]')===document.activeElement;
    const section = (name,body) => '<section class="vf-detail-section"><h3>'+esc(name)+'</h3>'+body+'</section>';
    dialog.innerHTML='<div class="dialog-head"><div><h2 id="vehicle-heading">'+esc(v.name)+'</h2><p>'+esc((v.maker || unknown)+' · '+className(v))+'</p></div>'+
      favoritesButton(v,favored)+'<form method="dialog"><button class="icon-button" aria-label="Fechar ficha">'+icon('x')+'</button></form></div>'+
      '<div class="vf-sheet-content">'+(v.photo?'<figure>'+photo(v,base,true)+'<figcaption>'+esc(v.photo.alt || v.name)+' · © Rockstar Games</figcaption></figure>':
      '<p class="vf-photo-missing">'+icon('car')+' Foto não confirmada</p>')+
      '<div class="vf-sheet-info"><span class="badge purple">'+esc(evidence(v))+'</span>'+
      (v.rarity?'<span class="badge">'+esc(rarity[v.rarity])+'</span>':'')+'</div>'+
      (v.variant || v.parentName || v.collection?fields([...(v.parentName?[['Modelo base',v.parentName]]:[]),...(v.collection?[['Coleção',v.collection]]:[])]):'')+
      section('Revenda no modo livre','<strong class="vf-value">'+esc(value?rangeText(value):unknown)+'</strong>'+
        (value?'<p class="muted">Estimativa do WAiNK. O estado do veículo e o exemplar podem alterar a oferta.</p>':'')+
        (v.register!=null?fields([['Taxa de registro',moneyText(v.register)]]):'')+
        (value?'<details class="note"><summary>Scans e fontes de preço</summary>'+v.resale.observations.map(q=>'<div>'+esc(rangeText(q.value))+' · '+source(q.source)+'</div>').join('')+'</details>':''))+
      section('Compradores',fields(buyerRows)+
        documentedOffers.map(o=>'<p>'+esc(buyers[o.buyer]+' · '+rangeText(o.value)+' · '+o.note)+' '+source(o.source,'Ver registro')+'</p>').join('')+
        '<p class="muted">Consulte o WAiNK e a oficina para o exemplar encontrado.</p>')+
      section('Segurança observada',fields([
        ['Rastreador',trackers[observed(v,'tracker')]],
        ['Alarme',ternary[observed(v,'alarm')]],
        ['Clonador de chaves',ternary[observed(v,'cloner')]]])+
        (v.scans?.length?'<details class="note"><summary>Exemplares escaneados</summary>'+v.scans.map(s=>'<div>'+esc([s.label,trackers[s.tracker],s.entry?entryLabels[s.entry]:null,s.alarm!=null?'Alarme: '+ternary[s.alarm]:null].filter(Boolean).join(' · '))+' '+source(s.source)+'</div>').join('')+'</details>':''))+
      section('Onde encontrar',(v.condition?'<p>'+esc(v.condition)+'</p>':'')+
        (spawns.length?spawns.map(s=>'<div class="vf-spawn"><strong>'+esc(s.label)+'</strong><small>'+esc(availability[s.type]+(s.chapter?' · capítulo '+s.chapter+' (informativo)':''))+'</small>'+
          (s.note?'<p>'+esc(s.note)+'</p>':'')+fields([['Segurança no local',s.hostile],...(requires(s.requires)?[['Requisitos',requires(s.requires)]]:[]),...(s.tracker?[['Rastreador do exemplar',trackers[s.tracker]]]:[]),
            ...(s.alarm!=null?[['Alarme do exemplar',ternary[s.alarm]]]:[]),...(s.entry?[['Acesso',entryLabels[s.entry]]]:[])])+
          (fixed.includes(s)?action('Mostrar no mapa','vehicle-map',s.id,'map-pin','primary'):'')+'</div>').join(''):'<p class="muted">'+unknown+'</p>')+
        (all.length>0&&(all.length>1||fixed.length===0)?action('Ver locais conhecidos no mapa','vehicle-map','all','map','full'):'')+
        (all.some(s=>s.type==='reported')?'<p class="muted">Pontos relatados podem variar conforme o save.</p>':''))+
      section('Desempenho', specs.length?fields(specs):'<p class="muted">'+unknown+'</p>')+
      '<details class="note"><summary>Fontes · '+esc(catalog.updated.split('-').reverse().join('/'))+'</summary><p>'+esc(evidence(v))+'</p>'+
        [...new Set([...globalSources,...v.statsRefs ?? [],...spawns.flatMap(s=>s.refs ?? []),...(v.photo?[v.photo.source]:[])])].map(url=>source(url)).join('')+'</details></div>';
    if (favoriteActive) dialog.querySelector('[data-vehicle-favorite]').focus({preventScroll:true});
  }

  function onClick(event) {
    const button=event.target.closest('button');
    if (!button) return;
    const d=button.dataset;
    if (d.vehicleDetail) return openDetail(d.vehicleDetail,button);
    if (d.vehicleFavorite) {
      const active=button===document.activeElement;
      toggleFavorite(d.vehicleFavorite);
      applyFilters();
      if (dialog.open) {
        renderDetail(vehicle(detailId),getProgress());
      } else if (active) {
        (root.querySelector('[data-vehicle-favorite="'+CSS.escape(d.vehicleFavorite)+'"]') || favoritesControl).focus({preventScroll:true});
      }
      return;
    }
    if (d.vehicleView) {view=d.vehicleView;applyFilters();return;}
    if ('vehicleFavorites' in d) {
      filters.favorites=!filters.favorites;listLimit=60;content.scrollTop=0;applyFilters();return;
    }
    if ('vehicleReset' in d) {
      form.reset();
      filters={...makeFilters(),query:filters.query,sort:filters.sort,favorites:filters.favorites};
      listLimit=60;content.scrollTop=0;applyFilters();return;
    }
    if ('vehicleMore' in d) {listLimit+=60;applyFilters();return;}
    if ('vehicleRetry' in d) {load();applyFilters();return;}
    if (d.vehicleMap) {
      const v=vehicle(detailId);
      const markers=exactMarkers(v,getProgress(),{reported:d.vehicleMap==='all'});
      const spots=d.vehicleMap==='all'?markers:markers.filter(s=>s.id===d.vehicleMap);
      if (spots.length) {dialog.close();showMap(v,spots);}
    }
  }
  root.addEventListener('click',onClick);
  dialog.addEventListener('click',onClick);
  dialog.addEventListener('close',()=>{
    if (dialog.open) return;
    detailId=null;
    if (!root.hidden) (dialogReturn?.isConnected ? dialogReturn : root.querySelector('[name="query"]')).focus({preventScroll:true});
  });
  root.addEventListener('input',event=>{
    const input=event.target;
    if (input.matches('[name="query"],[type="number"]')) setFilter(input);
  });
  root.addEventListener('change',event=>{
    const input=event.target;
    if (input.matches('select,[type="checkbox"]')) setFilter(input);
  });
  form.addEventListener('submit',event=>event.preventDefault());

  return {
    render, openDetail,
    hide(){root.hidden=true;if(dialog.open)dialog.close();},
    focusSearch(){root.querySelector('[name="query"]').focus();},
    async ranking(){
      load();
      await loading;
      if (!catalog) return [];
      return selectVehicles(catalog.vehicles,{sort:'price'},getProgress()).filter(priceRange).slice(0,12);
    },
    sortByPrice(){
      filters.sort='price';
      root.querySelector('[name="sort"]').value='price';
      listLimit=60;content.scrollTop=0;applyFilters();
    },
  };
}
