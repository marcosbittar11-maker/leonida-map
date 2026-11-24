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
| gang | 39 + 1 | 43 | 38 | Saber Shipping Yard | Saber Shipping Facility → safe-026 (safe) |
| fastfood | 21 | 106 | 21 | — | — |
| liquor | 14 | 106 | 13 | — | Three Sheets Liquor → liquor-store-002 (easter) |

### Pontos locais fora das listas

- **gang**: Saber Shipping · Guardia Brothers (1) (`gang-operation-022`), Saber Shipping · Guardia Brothers (2) (`gang-operation-024`), Drumboyz (`gang-compound-002`), Small Weed Farm (`gang-operation-046`), Armazém Apollo Aggregates (`L2453`)

## Categorias

| Categoria | Grupo | Antes (cap. 3) | Agora | Recuperados | Com valor | Requisitos conhecidos | Desconhecidos | Vinculados |
| --- | --- | --: | --: | --: | --: | --: | --: | --: |
| Armas especiais `weapon` | Armas | 2 | 87 | 86 | 0 | 0 | 87 | 28 |
| Armas no chão `pickup` | Armas | — | 86 | 85 | 0 | 0 | 0 | 13 |
| Ammu-Nation `ammushop` | Armas | 24 | 24 | 0 | 0 | 0 | 0 | 0 |
| Eventos aleatórios `event` | Atividades | 0 | 281 | 281 | 0 | 0 | 281 | 0 |
| Voos sob pontes `bridge` | Atividades | 0 | 202 | 202 | 0 | 0 | 0 | 0 |
| Saltos acrobáticos `stunt` | Atividades | 0 | 130 | 130 | 0 | 0 | 0 | 0 |
| Basquete `hoop` | Atividades | 0 | 100 | 100 | 0 | 0 | 0 | 0 |
| Corridas `race` | Atividades | 0 | 54 | 54 | 0 | 0 | 0 | 0 |
| Arcades e minigolfe `arcade` | Atividades | 0 | 51 | 51 | 0 | 0 | 0 | 0 |
| Corridas de drone `drone` | Atividades | 0 | 42 | 42 | 0 | 0 | 0 | 0 |
| Voos de faca `knife` | Atividades | 0 | 40 | 40 | 0 | 0 | 0 | 0 |
| Pesca `fishing` | Atividades | 0 | 36 | 36 | 0 | 0 | 0 | 0 |
| Paraquedismo `basejump` | Atividades | 0 | 32 | 32 | 0 | 0 | 0 | 0 |
| Estandes de tiro `range` | Atividades | 0 | 15 | 15 | 0 | 0 | 0 | 0 |
| Meditação `meditation` | Atividades | 0 | 10 | 10 | 0 | 0 | 0 | 0 |
| Academias `gym` | Atividades | 9 | 9 | 0 | 0 | 0 | 0 | 0 |
| Caça `hunting` | Atividades | 0 | 9 | 9 | 0 | 0 | 0 | 0 |
| Cartas `card` | Colecionáveis | 0 | 447 | 447 | 0 | 0 | 0 | 0 |
| Livros e revistas `magazine` | Colecionáveis | 0 | 92 | 92 | 0 | 0 | 0 | 0 |
| Meteoritos `meteorite` | Colecionáveis | 0 | 78 | 78 | 0 | 0 | 0 | 0 |
| Pacotes e contrabando `package` | Colecionáveis | 0 | 71 | 71 | 0 | 0 | 71 | 0 |
| Arte de rua `streetart` | Colecionáveis | 0 | 62 | 62 | 0 | 0 | 0 | 0 |
| Troca de livros `bookswap` | Colecionáveis | 0 | 8 | 8 | 0 | 0 | 0 | 0 |
| Playlists `playlist` | Colecionáveis | 0 | 7 | 7 | 0 | 0 | 0 | 0 |
| Mensagens na garrafa `bottle` | Colecionáveis | 0 | 6 | 6 | 0 | 0 | 0 | 0 |
| Tesouros `treasure` | Colecionáveis | 0 | 6 | 6 | 0 | 0 | 0 | 0 |
| Murais 1010 `mural` | Colecionáveis | 0 | 5 | 5 | 0 | 0 | 0 | 0 |
| Bares e restaurantes `food` | Comidas e bebidas | 462 | 439 | 0 | 0 | 0 | 0 | 0 |
| Lojas de roupas `clothes` | Estilo | 69 | 69 | 0 | 0 | 0 | 0 | 0 |
| Estilo e personalização `style` | Estilo | 46 | 46 | 0 | 0 | 0 | 0 | 0 |
| Outros locais `other` | Exploração | 0 | 317 | 317 | 0 | 0 | 0 | 0 |
| Escaneamentos WAiNK `waink` | Exploração | 0 | 101 | 101 | 0 | 0 | 0 | 0 |
| Paisagens naturais `nature` | Exploração | 52 | 52 | 0 | 0 | 0 | 0 | 0 |
| Easter eggs `easter` | Exploração | 2 | 23 | 21 | 1 | 2 | 0 | 0 |
| Edifícios e marcos `building` | Locais | 521 | 521 | 0 | 0 | 0 | 0 | 0 |
| Lojas e serviços `shop` | Locais | 432 | 433 | 2 | 0 | 0 | 0 | 0 |
| Serviços públicos `civic` | Locais | 123 | 123 | 0 | 0 | 0 | 0 | 0 |
| Esportes e lazer `leisure` | Locais | 55 | 55 | 0 | 0 | 0 | 0 | 0 |
| Hotéis `hotel` | Locais | 30 | 30 | 0 | 0 | 0 | 0 | 0 |
| Eletrônicos e tablets `electronics` | Locais | 15 | 15 | 0 | 0 | 0 | 0 | 0 |
| Lojas assaltáveis (Stick Ups) `store` | Operações | 0 | 106 | 85 | 29 | 0 | 106 | 0 |
| Cofres `safe` | Operações | 1 | 96 | 94 | 0 | 0 | 96 | 42 |
| Caixas eletrônicos rebocáveis `towatm` | Operações | 0 | 94 | 94 | 0 | 94 | 0 | 0 |
| Drogas e contrabando `drug` | Operações | 0 | 71 | 71 | 0 | 0 | 71 | 0 |
| Operações ilegais `gang` | Operações | 1 | 43 | 42 | 17 | 1 | 42 | 40 |
| Relógios de luxo `watch` | Operações | — | 23 | 23 | 0 | 0 | 0 | 5 |
| Joalherias `jewelry` | Operações | — | 20 | 19 | 20 | 20 | 0 | 0 |
| Receptadores `fence` | Operações | 4 | 16 | 12 | 0 | 4 | 12 | 6 |
| Casas de penhores `pawn` | Operações | — | 15 | 14 | 15 | 15 | 0 | 6 |
| Bancos · caixa e cofre pequeno `bank` | Operações | 14 | 14 | 0 | 14 | 14 | 0 | 0 |
| Grandes bancos · cofre `bigbank` | Operações | — | 8 | 8 | 8 | 8 | 0 | 0 |
| Financeiras `payday` | Operações | 0 | 7 | 7 | 7 | 7 | 0 | 0 |
| Esconderijos `safehouse` | Pessoal | 0 | 22 | 22 | 0 | 0 | 0 | 0 |
| Transporte `transport` | Transporte público | 488 | 488 | 0 | 0 | 0 | 0 | 0 |
| Veículos variantes `vehicle` | Veículos | 261 | 262 | 1 | 0 | 4 | 258 | 24 |
| Oficinas e preparação `workshop` | Veículos | 33 | 34 | 1 | 0 | 2 | 0 | 0 |

A coluna "Antes" usa a categoria da versão anterior quando o nome coincide; joalherias, penhores, grandes bancos, relógios e armas no chão eram partes de outras categorias.

## Informações práticas nas categorias prioritárias

| Categoria | Total | Valor | Senha | Cofre | Alarme | Desbloqueio | Guia | Requisitos conhecidos |
| --- | --: | --: | --: | --: | --: | --: | --: | --: |
| jewelry | 20 | 20 | 20 | 2 | 21 | 20 | 1 | 20 |
| pawn | 15 | 15 | 15 | 2 | 0 | 15 | 1 | 15 |
| bank | 14 | 14 | 14 | 0 | 0 | 14 | 2 | 14 |
| bigbank | 8 | 8 | 8 | 0 | 0 | 8 | 0 | 8 |
| payday | 7 | 7 | 7 | 0 | 0 | 7 | 0 | 7 |
| gang | 43 | 17 | 10 | 3 | 0 | 0 | 1 | 1 |
| safe | 96 | 0 | 25 | 1 | 0 | 0 | 1 | 0 |
| fence | 16 | 0 | 0 | 0 | 0 | 7 | 4 | 4 |
| weapon | 87 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| store | 106 | 29 | 0 | 0 | 0 | 0 | 0 | 0 |
| towatm | 94 | 0 | 0 | 0 | 0 | 0 | 0 | 94 |
| drug | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| watch | 23 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Duplicatas prováveis restantes

- America's Next Top Hooker card: Kalvyn (Standard) (card): `card-americas-next-top-hooker-009` e `card-americas-next-top-hooker-025`, 0.47 unidade
- Prison Building (civic): `L2718` e `L2719`, 0.41 unidade
- Prison Building (civic): `L2717` e `L2720`, 0.5 unidade
- Prison Building (civic): `L2719` e `L2720`, 0.41 unidade

## Coordenadas inválidas ou ausentes

Nenhuma.

## Nomes que sugerem roubo fora das categorias de roubo

- `ammu-nation-002` Pawn & Gun - Port Gellhorn (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-003` Vice City Gun & Pawn (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-016` Pawn & Gun - Crosstown (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `ammu-nation-019` Zenon’s Pawn Shop (ammushop): nome sugere, sem evidência de atividade; não contabilizado
- `hidden-package-015` Jewellery Lockbox ($300) (package): nome sugere, sem evidência de atividade; não contabilizado
- `random-event-061` Payday Loan Crashout (event): próximo de um alvo catalogado · payday-loan-007 (Cash Flow)
- `L298` Pawn & Gun (shop): nome sugere, sem evidência de atividade; não contabilizado
- `L2747` Little Gems Jewellery (building): nome sugere, sem evidência de atividade; não contabilizado
