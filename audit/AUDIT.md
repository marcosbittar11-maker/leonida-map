# Auditoria de cobertura · 2026-11-24

Gerado por `node scripts/audit.mjs`. Revisão do catálogo: `d8609016b8a883988d7abac4b6b1b1d98708ca70`. Linha de base: versão 1.2.0 (commit a5aef22), capítulo 3, todas as camadas.

## Listas nominais externas

| Lista | Esperado | Local | Encontrados | Ausentes | Em outra categoria |
| --- | --: | --: | --: | --- | --- |
| jewelry | 20 | 20 | 20 | — | — |
| pawn | 15 | 15 | 15 | — | — |
| bank | 14 | 14 | 14 | — | — |
| bigbank | 8 | 8 | 8 | — | — |
| payday | 7 | 7 | 7 | — | — |
| gang | 39 + 1 | 43 | 40 | — | — |
| fastfood | 21 | 106 | 21 | — | — |
| liquor | 14 | 106 | 13 | — | Three Sheets Liquor → liquor-store-002 (easter) |

### Pontos locais fora das listas

- **gang**: Drumboyz (`gang-compound-002`), Small Weed Farm (`gang-operation-046`), Armazém Apollo Aggregates (`L2453`)

## Categorias

| Categoria | Grupo | Antes (cap. 3) | Agora | Recuperados | Com valor | Requisitos conhecidos | Desconhecidos | Vinculados |
| --- | --- | --: | --: | --: | --: | --: | --: | --: |
| Voos sob pontes `bridge` | Atividades | 0 | 202 | 202 | 0 | 0 | 0 | 0 |
| Saltos acrobáticos `stunt` | Atividades | 0 | 130 | 130 | 0 | 0 | 0 | 0 |
| Basquete `hoop` | Atividades | 0 | 100 | 100 | 0 | 0 | 0 | 0 |
| Corridas `race` | Atividades | 0 | 54 | 54 | 0 | 0 | 0 | 0 |
| Minijogos · arcades e minigolfe `arcade` | Atividades | 0 | 51 | 51 | 0 | 0 | 0 | 0 |
| Corridas de drone `drone` | Atividades | 0 | 42 | 42 | 0 | 0 | 0 | 0 |
| Voos de faca `knife` | Atividades | 0 | 40 | 40 | 0 | 0 | 0 | 0 |
| Pesca `fishing` | Atividades | 0 | 36 | 36 | 0 | 0 | 0 | 0 |
| Paraquedismo `basejump` | Atividades | 0 | 25 | 25 | 0 | 0 | 0 | 0 |
| Estandes de tiro `range` | Atividades | 0 | 15 | 15 | 0 | 0 | 0 | 0 |
| Meditação `meditation` | Atividades | 0 | 10 | 10 | 0 | 0 | 0 | 0 |
| Academias `gym` | Atividades | 9 | 9 | 0 | 0 | 0 | 0 | 0 |
| Caça `hunting` | Atividades | 0 | 9 | 9 | 0 | 0 | 0 | 0 |
| Cartas colecionáveis `card` | Colecionáveis | 0 | 447 | 447 | 0 | 0 | 0 | 0 |
| Escaneamentos WAiNK `waink` | Colecionáveis | 0 | 101 | 101 | 0 | 0 | 0 | 0 |
| Livros e revistas `magazine` | Colecionáveis | 0 | 93 | 93 | 0 | 0 | 0 | 0 |
| Meteoritos `meteorite` | Colecionáveis | 0 | 78 | 78 | 0 | 0 | 0 | 0 |
| Arte de rua `streetart` | Colecionáveis | 0 | 62 | 62 | 0 | 0 | 0 | 0 |
| Flamingos de cocaína `flamingo` | Colecionáveis | — | 55 | 55 | 0 | 0 | 0 | 0 |
| Tesouros do Kenton `kenton` | Colecionáveis | — | 41 | 0 | 0 | 0 | 0 | 0 |
| Troca de livros `bookswap` | Colecionáveis | 0 | 7 | 7 | 0 | 0 | 0 | 0 |
| Playlists `playlist` | Colecionáveis | 0 | 7 | 7 | 0 | 0 | 0 | 0 |
| Mensagens na garrafa `bottle` | Colecionáveis | 0 | 6 | 6 | 0 | 0 | 0 | 0 |
| Murais 1010 `mural` | Colecionáveis | 0 | 5 | 5 | 0 | 0 | 0 | 0 |
| Pontos de interesse especiais `other` | Exploração | 0 | 388 | 388 | 0 | 0 | 0 | 0 |
| Eventos aleatórios `event` | Exploração | 0 | 281 | 281 | 0 | 0 | 281 | 0 |
| Paisagens naturais `nature` | Exploração | 52 | 52 | 0 | 0 | 0 | 0 | 0 |
| Easter eggs `easter` | Exploração | 2 | 23 | 21 | 1 | 2 | 0 | 0 |
| Descobertas subaquáticas `underwater` | Exploração | — | 6 | 0 | 0 | 0 | 0 | 0 |
| Cofres `safe` | Itens e recursos | 1 | 96 | 94 | 0 | 0 | 96 | 42 |
| Armas especiais `weapon` | Itens e recursos | 2 | 87 | 86 | 0 | 0 | 87 | 28 |
| Armas no chão `pickup` | Itens e recursos | — | 86 | 85 | 0 | 0 | 0 | 13 |
| Relógios de luxo `watch` | Itens e recursos | — | 23 | 23 | 0 | 0 | 0 | 5 |
| Drogas e contrabando `drug` | Itens e recursos | 0 | 16 | 16 | 0 | 0 | 16 | 0 |
| Caixas de paraquedas `parachute` | Itens e recursos | — | 7 | 7 | 0 | 0 | 0 | 0 |
| Tesouros `treasure` | Itens e recursos | 0 | 6 | 6 | 0 | 0 | 0 | 0 |
| Edifícios e marcos `building` | Locais e serviços | 521 | 521 | 0 | 0 | 0 | 0 | 0 |
| Transporte `transport` | Locais e serviços | 488 | 520 | 0 | 0 | 0 | 0 | 0 |
| Restaurantes e cafés `food` | Locais e serviços | 462 | 296 | 0 | 0 | 0 | 0 | 0 |
| Caixas eletrônicos (ATMs) `atm` | Locais e serviços | — | 181 | 2 | 0 | 0 | 0 | 0 |
| Bares e boates `bar` | Locais e serviços | — | 143 | 0 | 0 | 0 | 0 | 0 |
| Carregadores elétricos `ev` | Locais e serviços | — | 124 | 0 | 0 | 0 | 0 | 0 |
| Serviços públicos `civic` | Locais e serviços | 123 | 123 | 0 | 0 | 0 | 0 | 0 |
| Lojas e serviços `shop` | Locais e serviços | 432 | 118 | 0 | 0 | 0 | 0 | 0 |
| Lojas de roupas `clothes` | Locais e serviços | 69 | 69 | 0 | 0 | 0 | 0 | 0 |
| Postos de combustível `gas` | Locais e serviços | — | 57 | 0 | 0 | 0 | 0 | 0 |
| Esportes e lazer `leisure` | Locais e serviços | 55 | 55 | 0 | 0 | 0 | 0 | 0 |
| Estilo e personalização `style` | Locais e serviços | 46 | 46 | 0 | 0 | 0 | 0 | 0 |
| Hotéis `hotel` | Locais e serviços | 30 | 30 | 0 | 0 | 0 | 0 | 0 |
| Ammu-Nation `ammushop` | Locais e serviços | 24 | 24 | 0 | 0 | 0 | 0 | 0 |
| Eletrônicos `electronics` | Locais e serviços | 15 | 15 | 0 | 0 | 0 | 0 | 0 |
| Contatos `contact` | Locais e serviços | — | 10 | 0 | 0 | 0 | 0 | 0 |
| Lojas assaltáveis (Stick Ups) `store` | Operações | 0 | 106 | 85 | 29 | 0 | 106 | 0 |
| Caixas eletrônicos rebocáveis `towatm` | Operações | 0 | 96 | 94 | 0 | 96 | 0 | 0 |
| Operações ilegais `gang` | Operações | 1 | 43 | 42 | 17 | 1 | 42 | 40 |
| Joalherias `jewelry` | Operações | — | 20 | 19 | 20 | 20 | 0 | 0 |
| Receptadores `fence` | Operações | 4 | 16 | 12 | 0 | 4 | 12 | 6 |
| Casas de penhores `pawn` | Operações | — | 15 | 14 | 15 | 15 | 0 | 6 |
| Bancos · caixa e cofre pequeno `bank` | Operações | 14 | 14 | 0 | 14 | 14 | 0 | 0 |
| Laboratórios de Kitty Litter `kitty` | Operações | — | 13 | 0 | 0 | 0 | 0 | 0 |
| Grandes bancos · cofre `bigbank` | Operações | — | 8 | 8 | 8 | 8 | 0 | 0 |
| Financeiras `payday` | Operações | 0 | 7 | 7 | 7 | 7 | 0 | 0 |
| Esconderijos `safehouse` | Pessoal | 0 | 22 | 22 | 0 | 0 | 0 | 0 |
| Veículos variantes `vehicle` | Veículos | 261 | 262 | 1 | 0 | 4 | 258 | 24 |
| Pay 'n' Spray `spray` | Veículos | — | 20 | 1 | 0 | 0 | 0 | 0 |
| Oficinas e preparação `workshop` | Veículos | 33 | 14 | 0 | 0 | 2 | 0 | 0 |
| Outros serviços automotivos `carservice` | Veículos | — | 10 | 0 | 0 | 0 | 0 | 0 |

A coluna "Antes" usa a categoria da versão anterior quando o nome coincide; joalherias, penhores, grandes bancos, relógios e armas no chão eram partes de outras categorias.

## Informações práticas nas categorias prioritárias

| Categoria | Total | Valor | Senha | Cofre | Alarme | Desbloqueio | Guia | Requisitos conhecidos |
| --- | --: | --: | --: | --: | --: | --: | --: | --: |
| jewelry | 20 | 20 | 20 | 2 | 21 | 20 | 1 | 20 |
| pawn | 15 | 15 | 15 | 2 | 0 | 15 | 1 | 15 |
| bank | 14 | 14 | 14 | 0 | 0 | 14 | 2 | 14 |
| bigbank | 8 | 8 | 8 | 0 | 0 | 8 | 0 | 8 |
| payday | 7 | 7 | 7 | 0 | 0 | 7 | 0 | 7 |
| gang | 43 | 17 | 11 | 3 | 0 | 0 | 1 | 1 |
| safe | 96 | 0 | 26 | 1 | 0 | 0 | 1 | 0 |
| fence | 16 | 0 | 0 | 0 | 0 | 7 | 4 | 4 |
| weapon | 87 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| store | 106 | 29 | 0 | 0 | 0 | 0 | 0 | 0 |
| towatm | 96 | 0 | 0 | 0 | 0 | 0 | 0 | 96 |
| drug | 16 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| watch | 23 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Duplicatas prováveis restantes

- America's Next Top Hooker card: Kalvyn (Standard) (card): `card-americas-next-top-hooker-009` e `card-americas-next-top-hooker-025`, 0.47 unidade
- Prison Building (civic): `L2718` e `L2719`, 0.41 unidade
- Prison Building (civic): `L2717` e `L2720`, 0.5 unidade
- Prison Building (civic): `L2719` e `L2720`, 0.41 unidade

## Coordenadas inválidas ou ausentes

- `clue-kitty-historia` Kitty Litter · Laboratório da história
- `clue-kitty-balsero-1` Kitty Litter · Balsero 1
- `clue-kitty-balsero-2` Kitty Litter · Balsero 2
- `clue-kitty-balsero-3` Kitty Litter · Balsero 3
- `clue-kitty-central-rockridge-1` Kitty Litter · Central Rockridge 1
- `clue-kitty-crosstown-1` Kitty Litter · Crosstown 1
- `clue-kitty-crosstown-2` Kitty Litter · Crosstown 2
- `clue-kitty-crosstown-3` Kitty Litter · Crosstown 3
- `clue-kitty-decor-district-1` Kitty Litter · Decor District 1
- `clue-kitty-little-cuba-1` Kitty Litter · Little Cuba 1
- `clue-kitty-salton-1` Kitty Litter · Salton 1
- `clue-kitty-tequesta-1` Kitty Litter · Tequesta 1
- `clue-kitty-vice-dale-1` Kitty Litter · Vice-Dale 1
- `clue-wreck-ocio` Nuestra Señora del Ocio

## Nomes que sugerem roubo fora das categorias de roubo

- `ammu-nation-002` Pawn & Gun - Port Gellhorn (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-003` Vice City Gun & Pawn (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-016` Pawn & Gun - Crosstown (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-019` Zenon’s Pawn Shop (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `hidden-package-015` Jewellery Lockbox ($300) (other): nome sugere, sem evidência de atividade; não contabilizado
- `random-event-061` Payday Loan Crashout (event): próximo de um alvo catalogado · payday-loan-007 (Cash Flow)
- `L298` Pawn & Gun (shop): nome sugere, sem evidência de atividade; não contabilizado
- `L2747` Little Gems Jewellery (building): nome sugere, sem evidência de atividade; não contabilizado

## Comparação com as contagens do MapGenie

Contagens da barra lateral pública de https://mapgenie.io/grand-theft-auto-6/maps/leonida (a mesma base aparece no IGN). Só números: nenhuma posição ou descrição foi importada.

| Categoria | MapGenie | Local | Diferença |
| --- | --: | --: | --: |
| Joalherias | 20 | 20 | 0 |
| Casas de penhores | 15 | 15 | 0 |
| Bancos | 14 | 14 | 0 |
| Grandes bancos | 8 | 8 | 0 |
| Financeiras | 7 | 7 | 0 |
| Lojas assaltáveis | 107 | 106 | -1 |
| Caixas eletrônicos rebocáveis | 127 | 96 | -31 |
| Operações ilegais | 40 | 43 | +3 |
| Cofres | 40 | 96 | +56 |
| Contatos | 10 | 0 | -10 |
| ATMs | 223 | 181 | -42 |
| Academias | 9 | 9 | 0 |
| Boates | 5 | 5 | 0 |
| Ammu-Nation | 24 | 24 | 0 |
| Pay 'n' Spray | 19 | 20 | +1 |
| Oficinas | 14 | 14 | 0 |
| Postos | 57 | 57 | 0 |
| Lava-rápidos e aluguel | 9 | 10 | +1 |
| Carregadores elétricos | 126 | 124 | -2 |
| Pontos de ônibus | 287 | 308 | +21 |
| Estações | 25 | 31 | +6 |
| Balsas | 2 | 2 | 0 |
| Garagens | 21 | 14 | -7 |
| Veículos variantes | 85 | 262 | +177 |
| Lojas de roupas | 67 | 69 | +2 |
| Estilo | 46 | 46 | 0 |
| Eletrônicos | 15 | 15 | 0 |
| Cafés e lanches | 89 | 103 | +14 |
| Bares | 122 | 138 | +16 |
| Comida de rua | 119 | 154 | +35 |
| WAiNK | 89 | 101 | +12 |
| Troca de livros | 7 | 7 | 0 |
| Livros e revistas | 29 | 93 | +64 |
| Playlists | 7 | 7 | 0 |
| Murais 1010 | 5 | 5 | 0 |
| Cartas Jack of Hearts | 36 | 36 | 0 |
| Cartas Delights | 18 | 37 | +19 |
| Cartas Nine1Nine | 36 | 37 | +1 |
| Basquete | 100 | 100 | 0 |
| Golfe | 2 | 3 | +1 |
| Minigolfe | 3 | 3 | 0 |
| Sinuca | 17 | 17 | 0 |
| Arcades | 31 | 31 | 0 |
| Estandes de tiro | 15 | 15 | 0 |
| Pesca | 35 | 36 | +1 |
| Saltos acrobáticos | 130 | 130 | 0 |
| BASE jumps | 25 | 25 | 0 |
| Voos de faca | 40 | 40 | 0 |
| Voos sob pontes | 202 | 202 | 0 |
| Corridas | 53 | 54 | +1 |
| Corridas de drone | 42 | 42 | 0 |

Categorias do checklist ausentes no MapGenie: Flamingos de cocaína, Descobertas subaquáticas, Tesouros/coleções de Kenton, Laboratórios de Kitty Litter, Tablets, Meditação, Alvos do Bret, Meteoritos, Mensagens na garrafa, Armas, Drogas, Eventos aleatórios.
