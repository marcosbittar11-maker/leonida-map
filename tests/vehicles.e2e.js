
import { test, expect } from '@playwright/test';

const catalog = page=>page.locator('#vehicle-finder');
const dialog = page=>page.locator('#vehicle-dialog');
const finderSearch = page=>page.getByRole('searchbox',{name:'Buscar veículos'});
const tab = (page,name)=>page.getByRole('navigation',{name:'Navegação principal'}).getByRole('button',{name,exact:true});
const card = (page,id)=>catalog(page).locator('[data-vehicle-detail="'+id+'"]');
async function enter(page,chapter='3') {
  await page.goto('/');
  await page.locator('#initial-chapter select').selectOption(chapter);
  await page.getByRole('button',{name:'Abrir mapa'}).click();
  await tab(page,'Veículos').click();
  await expect(catalog(page).locator('.vf-count')).toHaveText(/\d+ veículos/);
}

test('Car Finder pesquisa, filtra, alterna visualização e guarda favoritos',async({page},info)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await enter(page);
  await expect(tab(page,'Rotas')).toHaveCount(0);
  await expect(catalog(page).getByRole('heading',{name:/Supercarros/})).toBeVisible();
  await finderSearch(page).fill('Obéy dra');
  const drafter=card(page,'obey-8f-drafter');
  await expect(drafter).toBeVisible();
  await catalog(page).getByText('Filtros',{exact:true}).click();
  await catalog(page).getByLabel('Revenda mínima').fill('10000');
  await expect(drafter).toHaveCount(0);
  await catalog(page).getByRole('button',{name:'Limpar filtros'}).click();
  await catalog(page).getByText('Filtros',{exact:true}).click();
  await expect(drafter).toBeVisible();
  await catalog(page).getByLabel('Ordenar').selectOption('speed');
  await catalog(page).getByRole('button',{name:'Galeria'}).click();
  await expect(catalog(page).locator('.vf-cards.gallery')).toBeVisible();
  await drafter.click();
  await expect(dialog(page).getByRole('heading',{name:/8F Drafter/})).toBeVisible();
  await expect(dialog(page)).toContainText('Desempenho');
  await dialog(page).getByRole('button',{name:/Favoritar/}).click();
  await expect(dialog(page).getByRole('button',{name:/Favoritar/})).toHaveAttribute('aria-pressed','true');
  await dialog(page).getByRole('button',{name:'Fechar ficha'}).click();
  await page.reload();
  await tab(page,'Veículos').click();
  await catalog(page).getByRole('button',{name:'Favoritos',exact:true}).click();
  await expect(drafter).toBeVisible();
  await expect(catalog(page).locator('.vf-count')).toHaveText('1 veículo');
  expect(await page.locator('body').evaluate(e=>e.scrollWidth)).toBe(info.project.name==='iphone'?393:1440);
  expect(errors).toEqual([]);
});

test('ficha de variante fixa abre mapa temporário e ponto relatado é opcional',async({page})=>{
  await enter(page);
  await finderSearch(page).fill('Big Cat Furia');
  await card(page,'variant-piccia-big-cat-furia').click();
  await expect(dialog(page)).toContainText('Avançado');
  await dialog(page).getByRole('button',{name:'Mostrar no mapa',exact:true}).click();
  await expect(tab(page,'Mapa')).toHaveAttribute('aria-current','page');
  const fixed=page.locator('.car-finder-pin.fixed');
  await expect(fixed).toHaveCount(1);
  await expect(page.locator('#map')).toHaveAttribute('data-zoom','4');
  await fixed.click();
  await expect(page.locator('.vehicle-map-popup')).toContainText('Mansão');
  await page.locator('.vehicle-map-back').click();
  await expect(dialog(page)).toBeVisible();
  await expect(page.locator('.car-finder-pin')).toHaveCount(0);
  await dialog(page).getByRole('button',{name:'Fechar ficha'}).click();
  await finderSearch(page).fill('Battler Picador');
  await card(page,'variant-declasse-battler-picador').click();
  await expect(dialog(page).getByRole('button',{name:'Mostrar no mapa',exact:true})).toHaveCount(0);
  await dialog(page).getByRole('button',{name:'Ver locais conhecidos no mapa'}).click();
  await expect(page.locator('.car-finder-pin.reported')).toHaveCount(2);
  await page.getByRole('button',{name:'Ocultar locais do veículo'}).click();
  await expect(page.locator('.car-finder-pin')).toHaveCount(0);
});

test('capítulo restringe a ficha e os pontos, e o catálogo funciona offline',async({page,context})=>{
  await enter(page,'2');
  await finderSearch(page).fill('Big Cat Furia');
  await card(page,'variant-piccia-big-cat-furia').click();
  await expect(dialog(page).getByRole('button',{name:'Mostrar no mapa',exact:true})).toHaveCount(0);
  await expect(dialog(page)).not.toContainText('Starfish Island');
  await dialog(page).getByRole('button',{name:'Fechar ficha'}).click();
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await finderSearch(page).fill('Grotti Cheetah');
  await card(page,'grotti-cheetah-95').click();
  await expect.poll(()=>dialog(page).locator('img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await context.setOffline(true);
  await page.reload();
  await tab(page,'Veículos').click();
  await finderSearch(page).fill('Grotti Cheetah');
  await card(page,'grotti-cheetah-95').click();
  await expect.poll(()=>dialog(page).locator('img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
  await dialog(page).getByRole('button',{name:'Fechar ficha'}).click();
  await finderSearch(page).fill('Zorrusso');
  await card(page,'granforma-zorrusso').click();
  await expect(dialog(page)).toContainText('Revenda no modo livre');
  await expect(dialog(page)).not.toContainText('Hathaway Apartments');
});

test('compatibilidade combina comprador, segurança e desbloqueios informados',async({page})=>{
  await enter(page);
  await finderSearch(page).fill('vapid caracara 4x4');
  const car=card(page,'vapid-caracara-4x4');
  await expect(car).toBeVisible();
  await catalog(page).getByText('Filtros',{exact:true}).click();
  await catalog(page).getByRole('combobox',{name:'Comprador',exact:true}).selectOption('pay');
  await catalog(page).getByRole('combobox',{name:'Rastreador',exact:true}).selectOption('standard');
  await catalog(page).getByRole('combobox',{name:'Alarme',exact:true}).selectOption('true');
  await catalog(page).getByRole('combobox',{name:'Clonador de chaves',exact:true}).selectOption('true');
  await expect(car).toBeVisible();
  await catalog(page).getByLabel('Apenas compatíveis com meu progresso').check();
  await expect(car).toHaveCount(0);
  await page.locator('.chapter').click();
  const settings=page.locator('#dialog');
  await settings.getByLabel('Clonador de chaves',{exact:true}).check();
  await settings.getByRole('checkbox',{name:'Oficina que aceita rastreador padrão'}).check();
  await settings.getByRole('button',{name:'Salvar preferências'}).click();
  await expect(car).toBeVisible();
  await catalog(page).getByRole('combobox',{name:'Disponibilidade',exact:true}).selectOption('fixed');
  await expect(car).toHaveCount(0);
});
