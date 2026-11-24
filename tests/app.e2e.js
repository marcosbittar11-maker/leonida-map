import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const map = page => page.locator('#map');
const detail = page => page.locator('#detail');
const tap = (page,name) => page.getByRole('button',{name,exact:true});
const query = page => page.getByRole('searchbox',{name:'Buscar em Leonida'});
async function ready(page) {
  await page.goto('/');
  await expect(map(page)).toHaveAttribute('data-points',/^\d+$/);
}
async function filters(page) {
  if(!await query(page).isVisible()) await tap(page,'Abrir filtros').click();
}
async function enableLayer(page,name) {
  await filters(page);
  await page.getByRole('checkbox',{name,exact:true}).check();
}
async function search(page,value) {
  await filters(page);
  await query(page).fill(value);
  await expect(page.getByRole('heading',{name:'Resultados'})).toBeVisible();
}
async function settings(page, fn) {
  await page.locator('.chapter').click();
  await fn(page.locator('#dialog'));
  await tap(page,'Salvar configurações').click();
}
async function pick(page,text,id) {
  await search(page,text);
  await page.locator('[data-point="'+id+'"]').first().click();
  await expect(detail(page).locator('h2')).toBeVisible();
}

test('navegação, zoom, filtros de grupo e individuais, busca e seleção',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page);
  await expect(map(page).locator('canvas.leaflet-tile-loaded').first()).toBeVisible();
  if(info.project.name==='desktop') {
    const position=await map(page).boundingBox();
    const pane=map(page).locator('.leaflet-map-pane');
    const beforePan=await pane.evaluate(el=>el.style.transform);
    await page.mouse.move(position.x+75,position.y+position.height/2);
    await page.mouse.down();
    await page.mouse.move(position.x+190,position.y+position.height/2+30,{steps:9});
    await page.mouse.up();
    await expect.poll(()=>pane.evaluate(el=>el.style.transform)).not.toBe(beforePan);
    await tap(page,'Centralizar mapa').click();
  }
  const before=Number(await map(page).getAttribute('data-zoom'));
  await tap(page,'Aproximar').click();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-zoom'))).toBeGreaterThan(before);
  await tap(page,'Centralizar mapa').click();
  await expect(map(page).locator('.map-cluster')).toHaveCount(0);
  await filters(page);
  await expect(map(page)).toHaveAttribute('data-points','0');
  await page.getByRole('checkbox',{name:'Operações',exact:true}).check();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeGreaterThan(300);
  const full=Number(await map(page).getAttribute('data-points'));
  await page.getByRole('checkbox',{name:/Bancos · caixa/}).uncheck();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeLessThan(full);
  await expect(page.getByRole('checkbox',{name:'Operações',exact:true})).toHaveJSProperty('indeterminate',true);
  await page.getByRole('checkbox',{name:/Bancos · caixa/}).check();
  await expect(page.getByRole('checkbox',{name:'Operações',exact:true})).toHaveJSProperty('indeterminate',false);
  await page.getByRole('checkbox',{name:'Operações',exact:true}).uncheck();
  await expect(map(page)).toHaveAttribute('data-points','0');
  await page.getByRole('checkbox',{name:'Operações',exact:true}).check();
  await enableLayer(page,'Exploração');
  await pick(page,'caranguejo pelican','safe-070');
  await tap(page,'Fechar detalhes').click();
  const pin=map(page).getByRole('button',{name:'Laboratório do Caranguejo',exact:true});
  if(info.project.name==='iphone') {
    await pin.tap();
    await expect.poll(async()=>{
      const pinBox=await pin.boundingBox(), sheet=await detail(page).boundingBox();
      return !!pinBox && !!sheet && pinBox.y+pinBox.height < sheet.y;
    }).toBe(true);
  } else await pin.click();
  await expect(detail(page)).toContainText('0072');
  await expect(detail(page)).toContainText('0212');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth',info.project.name==='desktop'?1440:393);
  expect(errors).toEqual([]);
});

test('sem capítulo: joalherias, penhores e bancos consultáveis; cadeado e filtros de disponibilidade',async({page})=>{
  await ready(page);
  await enableLayer(page,'Operações');
  await expect(page.locator('#chapter-gate')).toHaveCount(0);
  await expect(page.locator('#settings-label')).toHaveText('Configurações');
  await search(page,'lombank downtown');
  await expect(page.locator('[data-point="bank-021"]')).toBeVisible();
  await search(page,'avery pawn');
  await expect(page.locator('[data-point="smash-n-grab-034"]')).toBeVisible();
  await query(page).fill('');
  const counters=page.locator('.category-row');
  await expect(counters.filter({hasText:'Joalherias'}).locator('.counter')).toHaveText('20/20');
  await expect(counters.filter({hasText:'Casas de penhores'}).locator('.counter')).toHaveText('15/15');
  await expect(counters.filter({hasText:'Financeiras'}).locator('.counter')).toHaveText('7/7');
  await page.locator('#availability-filter').selectOption('unmet');
  await expect(counters.filter({hasText:'Joalherias'}).locator('.counter')).toHaveText('0/20');
  await expect(counters.filter({hasText:'Grandes bancos'}).locator('.counter')).toHaveText('8/8');
  await expect(map(page).locator('.map-pin.locked .pin-lock').first()).toBeAttached();
  await settings(page,async d=>{
    await d.getByRole('checkbox',{name:/Assaltos a caixas de bancos/}).check();
    await d.getByRole('checkbox',{name:/Assaltos a cofres de bancos/}).check();
  });
  await expect(page.locator('#settings-label')).toHaveText('Equipamentos 2/5');
  await expect(counters.filter({hasText:'Grandes bancos'}).locator('.counter')).toHaveText('0/8');
  await page.getByRole('button',{name:'Limpar filtros'}).first().click();
  await page.locator('[data-equipment-filter="snapgun"]').click();
  await expect(counters.filter({hasText:'Joalherias'}).locator('.counter')).toHaveText('20/20');
  await expect(counters.filter({hasText:'Casas de penhores'}).locator('.counter')).toHaveText('0/15');
  await page.locator('[data-clear="equipment:snapgun"]').click();
  await expect(counters.filter({hasText:'Casas de penhores'}).locator('.counter')).toHaveText('15/15');
  await pick(page,'donovan banks','smash-n-grab-007');
  await expect(detail(page)).toContainText('0104');
  await expect(detail(page)).toContainText('Snap Gun');
  await expect(detail(page)).toContainText('informativo');
});

test('configurações cabem no celular com rolagem interna e áreas seguras',async({page},info)=>{
  test.skip(info.project.name!=='iphone','Somente no perfil móvel');
  await page.setViewportSize({width:375,height:520});
  await ready(page);
  await page.locator('.chapter').click();
  const dialog=page.locator('#dialog');
  await expect(dialog.getByRole('heading',{name:'Configurações'})).toBeVisible();
  const box=await dialog.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y+box.height).toBeLessThanOrEqual(520);
  const scroll=dialog.locator('.dialog-scroll');
  expect(await scroll.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  await expect(dialog.getByRole('button',{name:'Salvar configurações'})).toBeInViewport();
  await dialog.getByRole('checkbox',{name:/Assaltos a cofres de bancos/}).scrollIntoViewIfNeeded();
  await dialog.getByRole('checkbox',{name:/Assaltos a cofres de bancos/}).check();
  await dialog.getByRole('button',{name:'Salvar configurações'}).click();
  await expect(page.locator('#settings-label')).toHaveText('Equipamentos 1/5');
});

test('favorito, conclusão, checklist e round-trip de backup',async({page})=>{
  await ready(page);
  await pick(page,'apollo aggregates','L2453');
  await tap(page,'Favoritar ponto').click();
  await tap(page,'Concluir ponto').click();
  await expect(detail(page).getByText('Concluído',{exact:true})).toBeVisible();
  await page.reload();
  await tap(page,'Progresso').click();
  await expect(page.locator('#panel-content [data-point="L2453"]')).toBeVisible();
  const downloadPromise=page.waitForEvent('download');
  await tap(page,'Exportar').click();
  const download=await downloadPromise;
  const content=await readFile(await download.path());
  const backup=JSON.parse(content.toString());
  expect(backup.favorites).toContain('L2453');
  expect(backup.completed.L2453).toBeTruthy();
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await tap(page,'Progresso').click();
  await page.locator('#backup-input').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:content});
  await expect(page.getByRole('status')).toHaveText('Progresso importado.');
  await expect(page.locator('#panel-content [data-point="L2453"]')).toBeVisible();
});

test('criação e edição de ponto personalizado',async({page})=>{
  await ready(page);
  await tap(page,'Adicionar ponto personalizado').click();
  await map(page).click({position:{x:180,y:129}});
  await page.getByLabel('Nome',{exact:true}).fill('Meu teste');
  await tap(page,'Salvar ponto').click();
  await expect(detail(page).getByRole('heading',{name:'Meu teste'})).toBeVisible();
  await tap(page,'Editar').click();
  await page.getByLabel('Nome',{exact:true}).fill('Meu ponto editado');
  await tap(page,'Salvar ponto').click();
  await expect(detail(page).getByRole('heading',{name:'Meu ponto editado'})).toBeVisible();
});

test('catálogo completo de milhares, pinos independentes e busca responsiva',async({page},info)=>{
  await ready(page);
  await filters(page);
  await tap(page,'Mostrar tudo').click();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeGreaterThan(5000);
  expect(Number(await map(page).getAttribute('data-drawn'))).toBeGreaterThan(1000);
  await expect(map(page).locator('.map-cluster')).toHaveCount(0);
  await filters(page);
  const start=Date.now();
  await query(page).fill('vice city');
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeLessThan(5000);
  const elapsed=Date.now()-start;
  expect(elapsed).toBeLessThan(2500);
  await info.attach('medição de busca',{body:Buffer.from(elapsed+' ms para filtrar 5.665 pinos'),contentType:'text/plain'});
});

test('PWA carrega catálogo e mapa base com conexão bloqueada',async({page,context})=>{
  await ready(page);
  await enableLayer(page,'Exploração');
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await context.setOffline(true);
  await page.reload();
  await expect(map(page)).toHaveAttribute('data-points',/^\d+$/);
  await pick(page,'caranguejo','safe-070');
  await expect(detail(page)).toContainText('CLEAVES');
  const canvas=map(page).locator('canvas.leaflet-tile-loaded').first();
  await expect(canvas).toBeVisible();
});


test('ranking de revenda abre ficha do catálogo consolidado',async({page})=>{
  await ready(page);
  await tap(page,'Rankings').click();
  await expect(page.getByRole('heading',{name:'Revenda de veículos'})).toBeVisible();
  const entry=page.locator('#vehicle-ranking [data-rank-vehicle]').first();
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(page.locator('#vehicle-dialog')).toContainText('Revenda no modo livre');
});


test('preferências antigas migram sem capítulo nem filtros removidos e sem perder conclusões',async({page})=>{
  await page.addInitScript(()=>{
    const key='leonida-map:progress:v1';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({
      version:1,chapter:1,chapterSelected:true,spoilers:true,showUnknown:false,strictAccess:true,
      equipment:['jewelry','randy','cloner'],custom:[],favorites:['L2453'],completed:{L2453:'2026-11-24T12:00:00.000Z'},route:['L2453']
    }));
  });
  await page.goto('/');
  await expect(map(page)).toHaveAttribute('data-points',/^\d+$/);
  await expect(page.locator('#settings-label')).toHaveText('Equipamentos 1/5');
  await search(page,'richardson');
  await expect(page.locator('[data-point="smash-n-grab-011"]')).toBeVisible();
  await tap(page,'Progresso').click();
  await expect(page.locator('#panel-content [data-point="L2453"]')).toBeVisible();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('leonida-map:progress:v1')));
  expect(progress.favorites).toEqual(['L2453']);
  expect(progress.equipment).toEqual(['cloner']);
  for(const key of ['chapter','chapterSelected','spoilers','showUnknown','strictAccess']) expect(progress).not.toHaveProperty(key);
});

test('busca com categorias ocultas: exibe o pino temporariamente e permite ativar a categoria',async({page})=>{
  await ready(page);
  await filters(page);
  await expect(page.getByRole('checkbox',{name:'Locais e serviços',exact:true})).not.toBeChecked();
  await search(page,'Port Gellhorn city town');
  const result=page.locator('[data-point="city-town-008"]');
  await expect(result).toBeVisible();
  await expect(map(page)).toHaveAttribute('data-points','0');
  await result.click();
  await expect(detail(page).locator('h2')).toBeVisible();
  await expect(map(page)).toHaveAttribute('data-points','1');
  await expect(map(page).locator('.map-pin.active')).toHaveCount(1);
  await tap(page,'Fechar detalhes').click();
  await expect(map(page)).toHaveAttribute('data-points','0');
  await filters(page);
  await result.click();
  await tap(page,'Mostrar categoria').click();
  await expect(tap(page,'Mostrar categoria')).toHaveCount(0);
  await expect(map(page)).toHaveAttribute('data-points','1');
  await page.waitForTimeout(400); // fim da animação do painel no celular
  await filters(page);
  await page.locator('[data-toggle-group="Locais e serviços"]').click();
  await expect(page.getByRole('checkbox',{name:/Edifícios e marcos/})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Locais e serviços',exact:true})).toHaveJSProperty('indeterminate',true);
});

test('pinos, resultados, legenda e ficha usam os mesmos símbolos',async({page})=>{
  await ready(page);
  await search(page,'fleeca washington beach');
  const result=page.locator('[data-point="bank-001"]');
  const use=locator=>locator.locator('svg use').first().getAttribute('href');
  expect(await use(result.locator('.point-icon'))).toBe('#g-bank');
  await expect(page.getByRole('checkbox',{name:/Bancos · caixa/})).toHaveCount(0);
  await page.locator('[data-toggle-group="Operações"]').click();
  const row=page.getByRole('checkbox',{name:/Bancos · caixa/}).locator('..');
  expect(await use(row.locator('.category-symbol'))).toBe('#g-bank');
  await result.click();
  expect(await use(detail(page).locator('.point-icon'))).toBe('#g-bank');
  const pin=map(page).getByRole('button',{name:'Fleeca - Washington Beach (bloqueado)',exact:true});
  expect(await use(pin)).toBe('#g-bank');
  const colours=await pin.evaluate(el=>{const css=getComputedStyle(el);return [css.backgroundColor,css.color];});
  expect(colours[0]).not.toBe(colours[1]);
});

test('início limpo, Mostrar tudo, Ocultar tudo e contadores dinâmicos',async({page})=>{
  await ready(page);
  await expect(page.locator('#app-version')).toHaveText('v1.4.0');
  await filters(page);
  await expect(page.locator('[data-group]:checked')).toHaveCount(0);
  await expect(map(page)).toHaveAttribute('data-points','0');
  await expect(page.locator('#map-count')).toHaveText('0 pinos');
  await tap(page,'Mostrar tudo').click();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeGreaterThan(5000);
  await expect(page.locator('[data-group]:checked')).toHaveCount(8);
  await tap(page,'Ocultar tudo').click();
  await expect(map(page)).toHaveAttribute('data-points','0');
  await expect(page.locator('[data-group]:checked')).toHaveCount(0);
  await page.getByRole('button',{name:/^Colecionáveis/}).click();
  await expect(page.locator('.category-row').filter({hasText:'Flamingos de cocaína'}).locator('.counter')).toHaveText('0/0');
  await expect(page.locator('.category-row').filter({hasText:'Flamingos de cocaína'}).getByRole('checkbox')).toBeDisabled();
  await page.locator('.category-row').filter({hasText:'Cartas colecionáveis'}).getByRole('checkbox').check();
  await expect(page.locator('.category-row').filter({hasText:'Cartas colecionáveis'}).locator('.counter')).toHaveText(/^\d+\/447$/);
  await expect(page.locator('.category-row').filter({hasText:'Cartas colecionáveis'}).locator('.counter')).not.toHaveText('0/447');
  await page.getByRole('searchbox',{name:'Buscar categoria'}).fill('flamingo');
  await expect(page.locator('.category-row')).toHaveCount(1);
});

test('filtros preservam a navegação interna e só são memorizados quando a preferência está ativa',async({page})=>{
  await ready(page);
  await enableLayer(page,'Colecionáveis');
  const cards=Number(await map(page).getAttribute('data-points'));
  expect(cards).toBeGreaterThan(100);
  await tap(page,'Rankings').click();
  await tap(page,'Veículos').click();
  await tap(page,'Mapa').click();
  await expect(map(page)).toHaveAttribute('data-points',String(cards));
  await page.reload();
  await expect(map(page)).toHaveAttribute('data-points','0');
  await settings(page,async d=>{await d.getByRole('checkbox',{name:/Memorizar filtros/}).check();});
  await enableLayer(page,'Colecionáveis');
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBe(cards);
  await page.reload();
  await expect(map(page)).toHaveAttribute('data-points',String(cards));
  await settings(page,async d=>{await d.getByRole('checkbox',{name:/Memorizar filtros/}).uncheck();});
  await page.reload();
  await expect(map(page)).toHaveAttribute('data-points','0');
});

test('tamanho dos pinos: Pequeno, Normal e Grande',async({page})=>{
  await ready(page);
  await enableLayer(page,'Atividades');
  const pin=map(page).locator('.map-pin:not(.dot)').first();
  const size=async()=>(await pin.boundingBox()).width;
  await expect(pin).toBeVisible();
  const normal=await size();
  await settings(page,async d=>{await d.getByText('Grande',{exact:true}).click();});
  await expect.poll(size).toBeGreaterThan(normal);
  await settings(page,async d=>{await d.getByText('Pequeno',{exact:true}).click();});
  await expect.poll(size).toBeLessThan(normal);
  await page.reload();
  await enableLayer(page,'Atividades');
  await expect.poll(size).toBeLessThan(normal);
});

test('galeria de símbolos sem categorias ausentes ou repetidas, também offline',async({page,context})=>{
  await page.goto('/icons.html');
  await expect(page.getByRole('heading',{name:'Símbolos do Leonida Map'})).toBeVisible();
  await expect(page.locator('.gallery-check')).toContainText('Categorias sem símbolo: nenhuma');
  await expect(page.locator('.gallery-check')).toContainText('Símbolo repetido entre categorias: nenhum');
  expect(await page.locator('.gallery-card').count()).toBeGreaterThan(150);
  await page.goto('/');
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await context.setOffline(true);
  await page.goto('/icons.html');
  await expect(page.locator('.gallery-check')).toBeVisible();
});

test('variantes de veículos continuam filtráveis por coleção',async({page})=>{
  await ready(page);
  await enableLayer(page,'Veículos');
  await page.getByText('Coleções de variantes',{exact:true}).click();
  await expect(page.getByRole('checkbox',{name:/Stock Car/})).toBeChecked();
  await search(page,'Battler Picador');
  await expect(page.locator('[data-point="gameta-standout-1105"]')).toBeVisible();
  await page.getByRole('checkbox',{name:/Stock Car/}).uncheck();
  await expect(page.locator('[data-point="gameta-standout-1105"]')).toHaveCount(0);
  await search(page,'Zorrusso entrega inicial');
  await expect(page.locator('[data-point="vehicle-request-013"]')).toHaveCount(0);
});
