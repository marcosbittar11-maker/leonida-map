const icons = import.meta.glob('/node_modules/lucide-static/icons/{navigation,map,trophy,chart-no-axes-column-increasing,shield-check,chevron-down,panel-left-close,search,star,sliders-horizontal,plus,minus,locate-fixed,map-pin-plus,map-pin,x,check,arrow-up-right,download,upload,compass,shield,chevron-right,settings-2,car,list,layout-grid,chevron-left,dumbbell,crosshair,shirt,utensils,bus,gem}.svg', { eager:true, query:'?raw', import:'default' });
export const icon = name => icons['/node_modules/lucide-static/icons/' + name + '.svg'] || '';
export function installIcons() {
  for (const element of document.querySelectorAll('[data-icon]')) {
    element.innerHTML = icon(element.dataset.icon);
    element.setAttribute('aria-hidden','true');
  }
}

