// Requisitos de acesso. Apenas cinco itens são configuráveis pelo jogador.
// Os demais requisitos são exibidos como informação e nunca bloqueiam pontos.

export const configurable = {
  slim:{label:'Slim Jim', group:'equipment', short:'Slim Jim',
    unlock:'Moses · missão "Moses", capítulo 2', source:'https://www.pcgamer.com/games/grand-theft-auto/gta-6-slim-jim/'},
  cloner:{label:'Clonador de chaves', group:'equipment', short:'Clonador',
    unlock:'Randy · missão "Steal the Zorrusso for Randy", capítulo 3', source:'https://www.pcgamer.com/games/grand-theft-auto/gta-6-clone-keys/'},
  snapgun:{label:'Ferramenta de arrombamento (Snap Gun)', group:'equipment', short:'Snap Gun',
    unlock:'Yasmani · primeira entrega de "Yasmani’s Jewelry Jobs", capítulo 3', source:'https://www.pcgamer.com/games/grand-theft-auto/gta-6-snap-gun/'},
  bank:{label:'Assaltos a caixas de bancos', group:'unlock', short:'Caixas de bancos',
    unlock:'Missão "Credit Check (Meet Raul’s Crew)", capítulo 3 · libera o Dye Pack Jammer', source:'https://www.powerpyx.com/gta-6-all-bank-jobs-locations-bank-vaults/'},
  vault:{label:'Assaltos a cofres de bancos', group:'unlock', short:'Cofres de bancos',
    unlock:'Missão opcional "That’s Where The Money Is…", fim do capítulo 4', source:'https://www.powerpyx.com/gta-6-all-bank-jobs-locations-bank-vaults/'}
};
export const configurableKeys = Object.keys(configurable);

// Requisitos documentados que não são configuráveis. Ficam nas fichas como informação.
export const informational = {
  randy:'Contato do Randy', moses:'Contato do Moses', brian:'Depósito do Brian', donnie:'Contato do Donnie',
  boat:'Barco para chegar ao local', cargo:'Veículo com espaço para bolsas', shirley:'Entrega do rum à Shirley',
  jewelry:'Joalherias liberadas pela história', pawn:'Casas de penhores liberadas pela história',
  waink:'Aplicativo WAiNK', standardShop:'Oficina que aceita rastreador padrão', advancedShop:'Oficina que aceita rastreador avançado',
  ultimate:'Ultimate Edition', vintage:'Pacote Vintage Vice City', mudClub:'Corrida do Mud Club concluída',
  winch:'Veículo com guincho', yasmaniJobs:'Trabalhos do Yasmani', dyePack:'Dye Pack Jammer'
};
export const requirementLabel = key => configurable[key]?.label || informational[key] || key;

// Categorias em que faz sentido falar de requisitos de acesso.
const activityKinds = new Set(['gang','bank','bigbank','jewelry','pawn','payday','store','safe','towatm','fence','weapon','drug','package','tablet','vehicle','event']);
export const isActivity = point => activityKinds.has(point.kind);

export const availabilityLabels = {
  all:'Todas as atividades',
  met:'Requisitos configuráveis atendidos',
  unmet:'Equipamentos ou desbloqueios pendentes',
  unknown:'Requisitos desconhecidos ou parciais'
};

/**
 * Estado de disponibilidade de um ponto para os itens configurados.
 * met: requisitos documentados e todos os configuráveis atendidos.
 * unmet: falta ao menos um requisito configurável obrigatório. Único estado com cadeado.
 * unknown: atividade sem requisitos documentados ou com documentação parcial.
 * na: locais e colecionáveis sem conceito de requisito.
 */
export function requirementState(point, owned = []) {
  const has = new Set(owned);
  const required = (point.requires || []).filter(key => configurable[key]);
  const missing = required.filter(key => !has.has(key));
  const info = [...new Set([...(point.requires || []).filter(key => !configurable[key]), ...(point.infoRequires || [])])];
  const optional = (point.optional || []).filter(key => configurable[key]);
  let state;
  if (missing.length) state = 'unmet';
  else if (!isActivity(point) && !required.length && !info.length && !point.reqStatus) state = 'na';
  else if (point.reqStatus === 'known' || (point.reqStatus !== 'partial' && (required.length || info.length))) state = 'met';
  else state = 'unknown';
  return { state, required, missing, info, optional, partial: point.reqStatus === 'partial' };
}

export function usesEquipment(point, key) {
  return (point.requires || []).includes(key) || (point.optional || []).includes(key);
}
