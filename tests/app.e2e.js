import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const map = page => page.locator('#map');
const detail = page => page.locator('#detail');
const tap = (page,name) => page.getByRole('button',{name,exact:true});
const query = page => page.getByRole('searchbox',{name:'Buscar em Leonida'});
async function chooseChapter(page,chapter='3') {
  const gate=page.locator('#chapter-gate');
  await gate.getByLabel('Capítulo atual').selectOption(chapter);
  await gate.getByRole('button',{name:'Abrir mapa'}).click();
}
async function ready(page) {
  await page.goto('/');
  await chooseChapter(page);
  await expect(map(page)).toHaveAttribute('data-points',/^[1-9]\d+/);
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
async function prefs(page, fn) {
  await page.locator('.chapter').click();
  await fn(page.locator('#dialog'));
  await tap(page,'Salvar preferências').click();
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
  const full=Number(await map(page).getAttribute('data-points'));
  await page.getByRole('checkbox',{name:'Operações',exact:true}).uncheck();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeLessThan(full);
  await page.getByRole('checkbox',{name:'Operações',exact:true}).check();
  await page.getByRole('checkbox',{name:/Bancos e cofres/}).uncheck();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeLessThan(full);
  await page.getByRole('checkbox',{name:/Bancos e cofres/}).check();
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

test('antisspoiler cobre pesquisa, mapa e detalhes; requisito é opt-in',async({page})=>{
  await ready(page);
  await expect(page.locator('#chapter-label')).toHaveText('Capítulo 3');
  await search(page,'lombank downtown');
  await expect(page.locator('[data-point="bank-021"]')).toHaveCount(0);
  await prefs(page,d=>d.getByLabel('Capítulo atual').selectOption('4'));
  await expect(page.locator('[data-point="bank-021"]')).toBeVisible();
  await prefs(page,d=>d.getByLabel('Capítulo atual').selectOption('3'));
  await enableLayer(page,'Veículos');
  await pick(page,'Big Cat Furia','standout-vehicle-101');
  await prefs(page,d=>d.getByLabel('Capítulo atual').selectOption('2'));
  await expect(detail(page)).toBeHidden();
  await search(page,'Big Cat Furia');
  await expect(page.getByText('Nenhum ponto corresponde aos filtros atuais.')).toBeVisible();
  await prefs(page,async d=>{
    await d.getByLabel('Capítulo atual').selectOption('3');
    await d.getByLabel('Mostrar apenas pontos com requisitos atendidos').check();
  });
  await enableLayer(page,'Exploração');
  await search(page,'caranguejo');
  await expect(page.getByText('Nenhum ponto corresponde aos filtros atuais.')).toBeVisible();
  await prefs(page,d=>d.getByLabel('Barco',{exact:true}).check());
  await expect(page.locator('[data-point="safe-070"]')).toBeVisible();
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
  await chooseChapter(page);
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
  await prefs(page,d=>d.getByLabel('Proteger contra spoilers').uncheck());
  await filters(page);
  await tap(page,'Mostrar tudo').click();
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeGreaterThan(5000);
  expect(Number(await map(page).getAttribute('data-drawn'))).toBeGreaterThan(1000);
  await expect(map(page).locator('.map-cluster')).toHaveCount(0);
  await filters(page);
  const start=Date.now();
  await query(page).fill('vice city');
  await expect.poll(async()=>Number(await map(page).getAttribute('data-points'))).toBeLessThan(5665);
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
  await expect(map(page)).toHaveAttribute('data-points',/^[1-9]\d+/);
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


test('pergunta o capítulo antes de mostrar o mapa e lembra a resposta',async({page})=>{
  await page.goto('/');
  const gate=page.locator('#chapter-gate');
  await expect(gate.getByRole('heading')).toHaveText('Em qual capítulo você está?');
  await expect(gate.getByLabel('Capítulo atual')).toHaveValue('');
  await expect(map(page)).toBeHidden();
  await gate.getByRole('button',{name:'Abrir mapa'}).click();
  await expect(gate).toBeVisible();
  await chooseChapter(page,'2');
  await expect(page.locator('#chapter-label')).toHaveText('Capítulo 2');
  await expect(gate).toBeHidden();
  await search(page,'Zorrusso entrega inicial');
  await expect(page.locator('[data-point="vehicle-request-013"]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#chapter-label')).toHaveText('Capítulo 2');
  await expect(gate).toBeHidden();
});

test('dados anteriores recebem a seleção sem perder conclusões',async({page})=>{
  await page.addInitScript(()=>{
    const key='leonida-map:progress:v1';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({
      version:1,chapter:3,custom:[],favorites:['L2453'],completed:{L2453:'2026-11-24T12:00:00.000Z'},route:['L2453']
    }));
  });
  await page.goto('/');
  await expect(page.locator('#chapter-gate')).toBeVisible();
  await chooseChapter(page,'1');
  await tap(page,'Progresso').click();
  await expect(page.locator('#panel-content [data-point="L2453"]')).toBeVisible();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('leonida-map:progress:v1')));
  expect(progress.favorites).toEqual(['L2453']);
  expect(progress.vehicleFavorites).toEqual([]);
});

test('Locais fica oculto até ativação e guarda os dois estados',async({page})=>{
  await ready(page);
  const places=page.getByRole('checkbox',{name:'Locais',exact:true});
  const pin=page.locator('[data-point="city-town-008"]');
  await search(page,'Port Gellhorn');
  await expect(places).not.toBeChecked();
  await expect(pin).toHaveCount(0);
  await places.check();
  await expect(pin).toBeVisible();
  await page.reload();
  await search(page,'Port Gellhorn');
  await expect(places).toBeChecked();
  await expect(pin).toBeVisible();
  await tap(page,'Restaurar').click();
  await expect(places).toBeChecked();
  await places.uncheck();
  await page.reload();
  await search(page,'Port Gellhorn');
  await expect(places).not.toBeChecked();
  await expect(pin).toHaveCount(0);
});

test('pinos, resultados, legenda e ficha usam símbolos vetoriais',async({page})=>{
  await ready(page);
  await search(page,'fleeca washington beach');
  const result=page.locator('[data-point="bank-001"]');
  await expect(result.locator('.point-icon svg')).toBeVisible();
  await expect(page.getByRole('checkbox',{name:/Bancos e cofres/}).locator('..').locator('.category-symbol svg')).toBeVisible();
  await result.click();
  await expect(detail(page).locator('.point-icon svg')).toBeVisible();
  await expect(map(page).getByRole('button',{name:'Fleeca - Washington Beach',exact:true}).locator('svg')).toBeVisible();
});

test('apenas Operações no início, com versão e variantes filtráveis',async({page})=>{
  await ready(page);
  await expect(page.locator('#app-version')).toHaveText('v1.2.0');
  await filters(page);
  await expect(page.locator('[data-group]:checked')).toHaveCount(1);
  await expect(page.getByRole('checkbox',{name:'Operações',exact:true})).toBeChecked();
  await expect(map(page).locator('.map-cluster')).toHaveCount(0);
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
