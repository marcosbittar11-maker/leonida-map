# Cobertura do Leonida Map · versão 1.3.0, com complemento da 1.5.0

## Complemento MapGenie · versão 1.5.0 (24/11/2026)

**Resultado: 0 pinos importados do MapGenie.** O MapGenie carrega no navegador os 2.690 marcadores com coordenadas e descrições. Os [termos da Ziff Davis](https://www.ziffdavis.com/terms-of-use), dona do MapGenie e do IGN, proíbem copiar, extrair, raspar e criar conjuntos de dados a partir do serviço. Por isso nada foi gravado: nem coordenadas, nem descrições, nem ícones. A validação de CRS e de resíduos não se aplicou, porque nenhum pino dessa fonte foi publicado. Não existe API ou exportação pública oficial.

**IGN não é fonte independente.** O [mapa do IGN](https://www.ign.com/maps/gta-6/leonida) mostra a mesma base: 2.690 marcadores, as mesmas categorias e os mesmos números. As categorias do MapGenie também trazem campos `ign_enabled` e `ign_page_id`.

**O que foi usado.** Em primeiro lugar, as contagens da barra lateral pública, como foi feito com Gameta e GTABase, em [data/reference/external-2026-11-24.json](data/reference/external-2026-11-24.json). Em segundo, uma consulta pontual pela busca da interface, para resolver a Saber Shipping. As fichas citam o MapGenie como referência, e nenhuma coordenada foi copiada.

**Delta da versão 1.5.0**

| Mudança | Antes | Depois | Evidência |
|---|--:|--:|---|
| Operações do checklist identificadas por nome | 38/39 | 39/39 + 1 UE | Saber Shipping Yard (`gang-operation-022`) e Facility (`-024`), identificadas pelos itens-chave da busca do MapGenie e confirmadas pela vizinhança local (Chino, cofre e pistola no 022; cofre, relógio e VF5 no 024) |
| Senha 8046 do Leonida Lab com ponto local | pendente | `safe-029` | O cofre do escritório é o cofre da Yard, apesar do nome importado "Office Safe - Saber Shipping Facility" |
| BASE jumps | 32 | 25 | Sete caixas de paraquedas (`parachuting-001…007`) foram para a nova categoria **Caixas de paraquedas**. Agora o número confere com PowerPyx e MapGenie |
| Trocas de livros | 8 | 7 | "Book: Killer Prom" (`book-swap-010`), a 0,19 unidade da Book Swap 1, é o livro, não uma troca. Passou para Livros e revistas |
| Fichas enriquecidas | — | 3 | Saber Yard, Saber Facility e `safe-029`: itens-chave, acesso e local exato, em frases próprias |
| Duplicatas evitadas | — | 0 novas | Nenhum ponto novo entrou. Os IDs foram preservados, e os nomes antigos continuam pesquisáveis como alias |

**Cobertura comparada.** A tabela completa sai de `node scripts/audit.mjs`, na seção "Comparação com as contagens do MapGenie" de [audit/AUDIT.md](audit/AUDIT.md). Das 51 linhas comparáveis, 27 conferem exatamente: joalherias 12+8, penhores 15, bancos 14+8, financeiras 7, academias, Ammu-Nation, oficinas, postos, estilo, eletrônicos, playlists, murais, cartas Jack of Hearts, basquete, sinuca, arcades, estandes, saltos, BASE jumps, voos de faca, pontes, drones, trocas de livros e outras. Em 17 linhas o catálogo local tem mais pontos, por exemplo cofres 96×40, revistas 93×29, cartas Delights 37×18 e WAiNK 101×89.

**Onde o MapGenie tem mais pontos.** Não há fonte aberta com posições para nenhum destes casos. Eles ficaram sem pino:
- **Caixas eletrônicos rebocáveis.** São 127 no MapGenie, 99 na GTA6Wiki e 94 no catálogo local. As três fontes divergem, então a falta não é de 5. Sem nomes, não há como saber quais pontos faltam.
- **ATMs comuns.** 223 contra 160.
- **Carregadores elétricos.** 126 contra 88.
- **Pontos de ônibus.** 287 contra 276.
- **Garagens compráveis.** 17 + 4 contra 14.
- **Contatos.** 10 contra nenhuma categoria local.
- **Lojas assaltáveis.** 107 contra 106. A Three Sheets fica no guia da arara.

**Prioridades que o MapGenie não cobre.** O MapGenie não tem categoria para flamingos de cocaína, descobertas subaquáticas, tesouros do Kenton, laboratórios de Kitty Litter, tablets, meditação, alvos do Bret, meteoritos, mensagens na garrafa, armas, drogas nem eventos. Mesmo com permissão, ele não preencheria essas lacunas. As fontes abertas também foram conferidas:
- O Open GTA 6 Map não tem revisão posterior à `d8609016` nem PRs abertos.
- O GTADB (dados em CC BY 4.0) tem só marcos geográficos.
- O Leonida Lab tem só 12 posições, todas de cofres e já usadas.

As lacunas continuam registradas abaixo.

Auditoria de 24/11/2026. Os números vêm de `node scripts/audit.mjs`, que grava o detalhe nominal em [audit/AUDIT.md](audit/AUDIT.md) e [audit/latest.json](audit/latest.json). A linha de base é a versão 1.2.0 (commit `a5aef22`). Ela foi congelada antes das mudanças em [audit/baseline-2026-11-24.json](audit/baseline-2026-11-24.json) com o script [audit/legacy-baseline.mjs](audit/legacy-baseline.mjs).

## Resumo

- **Causa do sumiço das joalherias.** Na 1.2.0, 2.882 pontos ficavam ocultos no capítulo 3 por não terem capítulo cadastrado. O número era 2.885 no capítulo 5. Todos os dados já estavam no snapshot importado.
- **Antisspoiler removido.** Com ele, a falta de capítulo deixou de ocultar pontos. Há 2.889 pontos recuperados em relação ao capítulo 3, e 2.881 deles continuavam ocultos mesmo no capítulo 5.
- **Totais.** Agora há 5.533 pontos consultáveis. Saem dessa conta 128 pedidos de entrega e veículos fora da camada de variantes, como antes. Também saem 7 duplicatas consolidadas.
- **Joalherias e penhores.** As 20 joalherias e as 15 casas de penhores, 35 Smash ’n’ Grab no total, conferem nominalmente com a PowerPyx. Antes só 2 apareciam no capítulo 3.

## Categorias prioritárias: antes e depois

"Antes" é o que aparecia no capítulo 3 da 1.2.0, com todas as camadas ligadas. "Recuperados" são pontos que estavam ocultos e agora aparecem. A referência externa é contagem, não verdade absoluta. A coluna de situação explica as diferenças.

| Categoria | Snapshot original | Antes (cap. 3) | Atual | Recuperados | Referência externa | Situação |
|---|--:|--:|--:|--:|---|---|
| Joalherias | 20 dentro de `smash` (35) | 1 | 20 | 19 | 20 PowerPyx | Completo, 20/20 por nome |
| Casas de penhores | 15 dentro de `smash` | 1 | 15 | 14 | 15 PowerPyx | Completo, 15/15 por nome |
| Bancos (caixa e cofre pequeno) | 14 dentro de `bank` (24) | 14 | 14 | 0 | 14 PowerPyx | Completo |
| Grandes bancos (cofre) | 8 dentro de `bank` | 0 (8 no cap. 5) | 8 | 8 | 8 PowerPyx | Completo |
| Financeiras | 7 | 0 | 7 | 7 | 7 PowerPyx, GTA6Wiki | Completo |
| Operações ilegais | 43 + 1 guia | 1 | 43 | 42 | 39 + 1 UE PowerPyx · 40 MapGenie · 44 GTA6Wiki · 43 Gameta | 39/39 do checklist identificadas, com a Saber resolvida na 1.5.0 |
| Cofres | 96 | 1 | 96 | 94 | 42 GTA6Wiki · 40 Gameta | O snapshot também tem cofres de casas e lojas. Um cofre novo foi importado |
| Receptadores | 20 | 4 | 16 | 12 | 7 receptadores PowerPyx · 14 GTA6Wiki | 3 duplicatas e 1 oficina reclassificada |
| Armas especiais (únicas) | 87 dentro de `weapon` (173) | 2 | 87 | 86 | — | Separadas das armas no chão |
| Armas no chão | 86 dentro de `weapon` | — | 86 | 85 | — | Nova subcategoria |
| Relógios de luxo | 23 dentro de `other` | 0 | 23 | 23 | — | Nova subcategoria |
| Drogas e contrabando | 71 | 0 | 71 | 71 | — | — |
| Tablets | 0 | 0 | 0 | 0 | — | Sem posições publicadas. As 15 lojas de eletrônicos continuam como pista |
| Lojas assaltáveis (Stick Ups) | 86 | 0 | 106 | 85 | 72 + 21 + 14 = 107 PowerPyx, 91 contam para o 100% | Os 21 fast food foram reclassificados. A Three Sheets fica no guia da arara |
| Caixas eletrônicos rebocáveis | 94 | 0 | 94 | 94 | 99 GTA6Wiki · 127 MapGenie | Fontes divergem; sem posições abertas para os faltantes |
| Eventos aleatórios | 281 | 0 | 281 | 281 | — | — |
| Veículos variantes | 262 na camada | 261 | 262 | 1 | 281 IDs GTABase · 231 Gameta | Pedidos e veículos de serviço fora da camada, como antes |
| Oficinas e Pay ’n’ Spray | 33 | 33 | 34 | 1 | 19 Pay ’n’ Spray + 15–16 oficinas | +1 por reclassificação |

Demais categorias: cartas (447), saltos (130), pontes (202), voos de faca (40), cestas (100), corridas de drone (42), meteoritos (78), revistas (92), WAiNK (101) e outras. Todas voltaram a aparecer. Estavam 100% ocultas no capítulo 3 porque não tinham capítulo. Contagens por categoria em [audit/AUDIT.md](audit/AUDIT.md).

## Correções aplicadas

Todas ficam em [src/curation.js](src/curation.js), separadas do snapshot importado. Cada correção cita a fonte. As duplicatas também foram levadas ao importador, em `scripts/normalize.mjs`.

**Reclassificações**
- `atm-194` e `atm-195`: de banco para caixa eletrônico. Por isso o snapshot mostrava 24 bancos, e não 22.
- `L415`: Pay ’n’ Spray importado como receptador. Passou para oficina.
- 21 restaurantes de fast food da lista de Stick Ups da PowerPyx passaram para Lojas assaltáveis.
- `smash` foi dividido em Joalherias e Casas de penhores, pela descrição do cartão do jogo.
- `bank` foi dividido em Bancos e Grandes bancos, pelo campo `Robbery: Teller|Vault`, que confere com a lista 14 + 8.
- Relógios de luxo e armas no chão viraram subcategorias próprias.

**Duplicatas consolidadas (7)**
- `L910` → `fence-002`, `L1117` → `fence-004` e `L1009` → `fence-003`: mesmo receptador, a no máximo 0,1 unidade.
- `gang-compound-001` → `gang-operation-039`: PTT Youngin$ Compound e Illegal Goods Store, da Ultimate Edition, a 0,5 unidade.
- `L190` → `nightclub-001`, `L629` → `nightclub-002` e `L308` → `gas-station-001`: mesmo nome, a 0,5 unidade.
- Os IDs absorvidos continuam como aliases. Favoritos e conclusões antigos são convertidos.

**Nomes corrigidos**
- Os pinos "Robbery Opportunity" foram identificados pelos cofres vizinhos e pelo menu do jogo: Stash House, Weed Grow, Biker Hideout, Illegal Sneaker Trade e Parlor Apartments.
- Os prefixos "Criminals:" e "Final Chapter:" foram retirados.
- Akoya Jewelers (o snapshot grafava Ayoka) e White Sands Jewelry Pawn foram corrigidos.
- O nome antigo continua pesquisável.

**Coordenadas**
- Nenhuma coordenada inválida ou ausente.
- Entrou um ponto novo, o cofre do cais do Sunrise RV Park, com posição exata do Leonida Lab.
- A conversão de metros do jogo para o mapa foi validada em 10 pares distribuídos: resíduo mediano de 0,45 unidade (cerca de 14 m) e máximo de 1,92.

**Vínculos entre pontos**
- 117 itens foram associados ao complexo mais próximo: cofres, armas, relógios, drogas e variantes.
- O raio é de 1,6 unidade em operações e de 0,45 em lojas.
- O ranking não soma de novo o item já incluído no valor da operação. As fichas mostram os outros itens do local e a operação a que o item pertence.

## Fichas com informação prática

| Categoria | Total | Valor | Senha ou método | Cofre localizado | Alarme | Desbloqueio | Requisitos documentados |
|---|--:|--:|--:|--:|--:|--:|--:|
| Joalherias | 20 | 20 | 20 | 2 | 20 | 20 | 20 |
| Penhores | 15 | 15 | 15 | 2 | 0 | 15 | 15 |
| Bancos | 14 | 14 | 14 | 0 | 0 | 14 | 14 |
| Grandes bancos | 8 | 8 | 8 | 0 | 0 | 8 | 8 |
| Financeiras | 7 | 7 | 7 | 0 | 0 | 7 | 7 |
| Operações ilegais | 43 | 17 | 10 | 3 | 0 | 0 | 1 |
| Cofres | 96 | 0 | 25 | 24 | 0 | 0 | 0 |
| Receptadores | 16 | 0 | — | — | — | 7 | 4 |
| Caixas eletrônicos rebocáveis | 94 | 0 | — | — | — | 94 | 94 |

- **Senhas fixas.** Três joalherias têm senha durante o trabalho do Yasmani: Casa De Empeno 1680, Richardson 6815 e Donovan Banks 0104.
- **Operações.** Dez operações têm senha ou método: Brooks 6823, La Cascara 6969, Kingpin 0300, Nova Auto 7777, JanJak’s 4444, Farm Fix 2121, Chatfield 5800, Sunrise RV 6769 e Sound4Sound sem código. Fontes: GTA6Wiki e Leonida Lab.
- **Cofres avulsos.** São 25 cofres com senha ou condição importada do Leonida Lab. As senhas que conferem entre fontes aparecem como corroboradas.
- **Requisitos desconhecidos.** São exibidos como tais. Nenhuma operação ou loja é tratada como acessível por falta de informação.

## Pendências de pesquisa e localização

**Operações**
- **Saber Shipping Yard × Saber Shipping Facility.** Resolvido na 1.5.0. `gang-operation-022` é a Yard, em Little Cuba, e o cofre `safe-029` usa a senha 8046. `gang-operation-024` é a Facility, em Balsero. Detalhes no complemento MapGenie, no início deste arquivo.
- **Final Chapter: Abandoned MC Warehouse.** A GTA6Wiki o lista em South Vice-Dale County. Não há ponto local equivalente confirmado. Pode corresponder ao Armazém Apollo Aggregates (`L2453`).
- **Fora do checklist.** Drumboyz (`gang-compound-002`), Small Weed Farm (`gang-operation-046`) e Apollo Aggregates ficam fora das 39 operações. Estão marcados e não foram excluídos.

**Senhas sem ponto local** (Leonida Lab)
- Party House Garage 092319
- Trailer do Cottonmouth Lake 44017 (posição aproximada)
- Lavanderia abandonada de Belville 62412
- Porta do Black Eagle Warehouse 789987
- RV do Sunrise RV Park, sem código
- Oito itens omitidos pela fonte como spoiler

**Outras categorias**
- **Caixas eletrônicos rebocáveis.** São 94 pontos locais, 99 na GTA6Wiki e 127 no MapGenie e no IGN. Os nomes são numéricos nas três fontes, então não dá para saber quais faltam. Nenhuma fonte aberta publica as posições restantes.
- **Laboratórios de Kitty Litter.** São 14 segundo a PowerPyx e não há nenhum pino local. A fonte descreve áreas de busca, sem coordenadas. O MapGenie também não tem essa categoria.
- **Categorias do checklist sem pinos no snapshot.** Flamingos de cocaína (125), descobertas subaquáticas (33), tesouros do Kenton (41 no Gameta) e alvos do Bret (15).
- **Meditação.** Há 10 locais contra 18 no checklist.
- **BASE jumps.** Resolvido na 1.5.0. Os 7 pontos a mais eram caixas de paraquedas, que agora têm categoria própria. O total é 25, igual ao checklist e ao MapGenie.
- **Revisão manual.** Duas cartas Kalvyn (Standard) estão a 0,47 unidade. Prédios "Prison Building" têm o mesmo nome mas são estruturas diferentes e foram mantidos.
- **Nomes sem atividade comprovada.** Little Gems Jewellery (`L2747`), Pawn & Gun e Gun & Pawn são Ammu-Nation. A Jewellery Lockbox é um pacote. Não entram nas contagens de Smash ’n’ Grab.

## Divergências registradas

- **Faixa de valor.** Blanc & Giroux, Roval/Royal e Covgari aparecem com US$ 14.000–35.000 na GTA6Wiki (via GAMES.GG). PowerPyx e Open GTA 6 Map dão US$ 14.000–25.000. O app mantém a faixa do cartão e mostra a alternativa na ficha.
- **Grafia.** Ayoka × Akoya, Roval × Royal e Sound4Sond × Sound4Sound.
- **Cofres de bancos.** A PowerPyx diz que os grandes cofres abrem no fim do capítulo 4. O guia de receptadores da mesma fonte menciona o capítulo 5. O app usa o capítulo 4, que vem da página específica, apenas como informação.
- **Posições.** A posição da La Cascara e a da Kingpin diferem cerca de 1 unidade entre o Open GTA 6 Map e o Leonida Lab. Prevalece o ponto do Open GTA 6 Map.

## Veículos (Car Finder)

| Métrica | Modelos |
|---|--:|
| Total no catálogo | 629 |
| Variantes ou edições especiais | 263 |
| Com classe confirmada | 561 |
| Com preço de revenda normal (estimativa WAiNK) | 112 |
| Com taxa de registro | 106 |
| Com rastreador observado | 62 |
| Com alarme observado | 6 |
| Com acesso observado (Slim Jim, clonador, destrancado) | 9 |
| Com aparecimento conhecido (qualquer tipo) | 321 |
| Ponto fixo confirmado, com "Mostrar no mapa" | 5 |
| Pontos relatados com coordenadas | 278 |
| Aparecimento por região, sem pino | 22 |
| Com pagamento específico por comprador | 6 |
| Com desempenho | 136 |
| Com foto oficial | 7 |

O atualizador foi executado em 24/11/2026 e não encontrou mudanças em relação ao snapshot anterior. Todas as 78 linhas com preço do GTAFinder já estavam associadas. Nenhuma lista pública mais completa de revenda foi encontrada. O IGN e o GTAFinder continuam como fontes de preço. O Car Finder deixou de usar capítulo. A compatibilidade considera somente Slim Jim e clonador de chaves. Edições, contatos e oficinas não são presumidos como liberados.

## Vice City API

Documentação consultada em 24/11/2026: [vice-city.app/developers](https://vice-city.app/developers), API v1.15.0.

**O que existe**
- A camada `/map/pins` tem 6.624 pinos em GeoJSON, em unidades do jogo.
- Também há `/codes` (27 códigos), `/secrets` (41), `/changes` e `/export` em NDJSON.

**Condições**
- O mapa, `/changes` e `/export` exigem o plano Developer: 4,99 € por mês ou 39 € por ano.
- O plano gratuito dá 5 requisições por dia, sem mapa, e exige uma conta MadamNazar.io.
- A chave de demonstração `vc_demo` devolve só os 5 primeiros resultados.
- Os termos proíbem revender ou republicar as exportações "as they are". No plano gratuito, o uso não comercial exige crédito visível.

**Avaliação**
- Nada foi contratado nem cadastrado.
- A demonstração de `/codes` confirmou o 0212 do laboratório do caranguejo, que já constava.
- As categorias prioritárias já conferem 1:1 com as listas nominais pelos dados abertos. O Leonida Lab cobre as senhas com licença de atribuição.
- A assinatura só valeria se o objetivo fosse cobrir colecionáveis sem pinos no snapshot: flamingos, descobertas subaquáticas e tesouros. Mesmo assim, a republicação direta é vedada, e os pinos teriam de servir como referência para curadoria, não para cópia.
- Recomendação: não contratar agora.

## Fontes

[FONTES.md](FONTES.md) traz atribuições, licenças e os métodos de cada fonte. As listas nominais usadas na auditoria estão em [data/reference/external-2026-11-24.json](data/reference/external-2026-11-24.json).
