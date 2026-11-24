# Cobertura do Leonida Map · versão 1.3.0, com complementos da 1.5.0, 1.6.0 e 1.8.0

## Complemento de colecionáveis e pontos ausentes · versão 1.8.0 (24/11/2026)

Escopo: só as categorias abaixo. Nenhum ponto, ID, favorito ou conclusão existente foi apagado ou renumerado. O detalhe nominal (todos os novos IDs e todos os pontos em conflito) está em [audit/GAMETA.md](audit/GAMETA.md), gerado por `node scripts/import-gameta.mjs`.

**Resultado.** Entraram **147 pinos novos** (Gameta), **55 pinos reclassificados** (flamingos que já estavam no snapshot como "Drogas") e **14 pistas sem pino**. Nada foi inventado: cada pino novo vem de uma coordenada publicada, convertida e validada. Sobra muito por fazer (tabela abaixo).

### Por categoria

| Categoria | Antes | Candidatos | Correspondências / duplicatas | Pinos adicionados | Pistas sem pino | Depois | Referência de cobertura | Limitação |
|---|--:|--:|--:|--:|--:|--:|---|---|
| Tesouros do Kenton `kenton` | 0 | 41 | 0 (os 5 pinos `treasure` do snapshot marcam os naufrágios, não os itens) | **41** | 0 | 41 | 41 no jogo (Gameta, 7 locais de mergulho) | Fonte única; 4 dos 7 locais conferem com pinos independentes (0,4–3 unid.) |
| Flamingos de cocaína `flamingo` | 0 (55 em Drogas) | 55 no snapshot | 55 reclassificados, 0 importados | 0 | 0 | **55 pinos** | 125 no jogo; 22 flamingos em 20 pinos na GTA6Wiki; 30 descrições na ViceCityDB | 55 pinos cobrem mais de 55 flamingos, porque alguns pinos reúnem 2–3. GTA6Wiki e ViceCityDB não publicam coordenadas |
| Descobertas subaquáticas `underwater` | 0 | 6 naufrágios | 0 | **5 aproximados** | 1 (Nuestra Señora del Ocio) | 5 + 1 pista | 33 no jogo; Dexerto lista 5 e Game Checklists lista 6 | Posição = centro dos tesouros do Kenton no naufrágio (raio 0,5–1,0 unid.). Profundidade não documentada |
| Laboratórios de Kitty Litter `kitty` | 0 | 13 | 0 | 0 | **13** | 13 pistas | 14 declarados (a PowerPyx lista 13) | Só áreas de busca por distrito; o app não tem geometria de área |
| Alvos do Bret `bret` | 0 | — | — | 0 | 0 | 0 | 15 | **Bloqueado**: o PushSquare respondeu 403. GTABase proíbe extração |
| ATMs comuns `atm` | 160 | 193 | 158 pares, 14 em conflito | **21** | 0 | 181 | 193 Gameta · 190 GTA6GPS · 223 MapGenie | 14 candidatos a menos de 0,5 unid. de outro ponto não entraram |
| ATMs rebocáveis `towatm` | 94 | 98 | 92 pares, 4 em conflito | **2** | 0 | 96 | 99 Wiki · 100 GTABase · 104 GPS · 127 MapGenie | Fontes divergem entre 96 e 127; a falta não é só de dados |
| Carregadores elétricos `ev` | 88 | 125 | 87 pares, 2 em conflito | **36** | 0 | 124 | 126 (MapGenie e Gameta declarado) | Fonte única nos 36 |
| Pontos de ônibus (nome "Bus Stop") | 310 (276 com tipo + 34 sem tipo) | 301 | 266 pares, 3 em conflito | **32** | 0 | 342 | 287 MapGenie · 301 Gameta | Os 34 sem tipo vêm de `places`, com nome "Bus Stop" e tipo vazio |
| Contatos `contact` (nova) | 0 | 10 | 0 | **10** | 0 | 10 | 10 MapGenie e Gameta | Nome dos locais como publicado |
| Meditação `meditation` | 10 | 8 | 6 conferem | 0 | 0 | 10 | 8 no Gameta, 18 conclusões (Jason e Lucia) | 2 conflitos de posição, abaixo |
| Garagens | 14 | 17 | 12 pares nomeados | 0 | 0 | 14 | 17 + 4 MapGenie | Os 5 sem par vêm misturados com itens que não são garagens (ex.: "Collect your Dominator Buggy"); nada entrou |
| Drogas e contrabando `drug` | 71 | — | — | 0 | 0 | 16 | — | Efeito da reclassificação dos 55 flamingos |

**Notas de leitura.**
- Ônibus: o "antes" de 276 do AUDIT conta só o tipo "Bus stop". O importador compara contra 310 pontos, porque 34 pontos de `places` chamados "Bus Stop" (categorias Transporte e Edifícios) têm tipo vazio. Antes 310, depois 342, e o AUDIT passa de 276 para 308 só pelo tipo.
- Nenhuma categoria é declarada completa. Os números de referência são contagens de outras fontes, e elas divergem entre si.
- Os pinos do Gameta são fonte única. Cada ficha diz isso ("Fonte única · posição calibrada") e mostra a conferência de calibração.

### Flamingos de cocaína: conferência entre fontes

A GTA6Wiki e a ViceCityDB não trazem coordenadas, então a conferência é **por descrição e área**, não espacial. Um pino é "corroborado" quando a descrição do snapshot bate com uma entrada de outra fonte. É julgamento editorial, e vale como indício, não como prova.

| Pino local | Descrição no snapshot | Entrada em outra fonte |
|---|---|---|
| `hidden-package-073` | Quintal da Halloween House | GTA6Wiki "Capri Halloween House" · ViceCityDB "Capri, casa do Halloween" (5 fontes) |
| `hidden-package-036` | Casa única de decoração estranha, Key Lento | GTA6Wiki "Key Lento eccentric house" · ViceCityDB "casa excêntrica" |
| `hidden-package-042` | Entre duas árvores, Key Lento | ViceCityDB "Key Lento, entre duas árvores" (1 fonte) |
| `hidden-package-044` | Montanha de lixo, Port Gellhorn | ViceCityDB "Port Gellhorn, montanha de lixo" (1 fonte) |
| `hidden-package-020` | Festa na praia | ViceCityDB "Watson Bay, festa na praia" |
| `hidden-package-024` | Entre velas, no mesmo prédio de outra cocaína | ViceCityDB "Watson Bay, sala cheia de velas" |
| `hidden-package-041` | Sobre a mesa de um prédio pequeno | ViceCityDB "Watson Bay, mesa num pequeno prédio" |
| `hidden-package-092` | Na casa, perto do radome de Riquezas Keys | GTA6Wiki "Riquezas Keys" · ViceCityDB "Riquezas Keys, ilha do radome" |
| `hidden-package-051` e `-121` | Cais de Belpoint (o primeiro reúne 3 flamingos) | GTA6Wiki "Belpoint docks" · ViceCityDB "Cais de Belpoint" |
| `hidden-package-071` | Contêineres junto à pilha em chamas | GTA6Wiki "Belpoint container" · ViceCityDB "contentor em chamas" |
| `hidden-package-143`, `-137`, `-155`, `-156`, `-110` | Arredores do naufrágio Meerwunder | GTA6Wiki: 3 em "Meerwunder beach" mais 3 em Featherstone · ViceCityDB: 3 do Meerwunder e 3 em Featherstone (o Gameta põe o naufrágio nesta área) |

**Resultado:** 16 pinos locais corroborados por descrição, de 55. Os outros 39 não têm entrada correspondente nas duas fontes, e muitos não têm descrição alguma no snapshot.

**Entradas de outras fontes sem pino local identificável:** Belpoint (casa branca grande, junto à fogueira, casa branca pequena, contêiner amarelo), Capri (cais perto de um corpo, La Costa, a oeste da Volcano Coffee, perto do navio afundado), ilha de areia a sul de Cottonmouth Lake, Key Lento a sul, La Perle (prédio em C), Mile Zero Air Station (costa de Goose Key), Watson Bay (motel, extremo norte) e Abismo Key. **Decisão: nenhuma virou pista.** Sem coordenadas não dá para saber se são pinos novos ou os mesmos 41 pinos sem descrição, e criar pistas poderia inflar a contagem de flamingos. Elas ficam listadas aqui como lacuna.

**Pinos que reúnem vários flamingos.** `hidden-package-051` (3), `-142` (2) e `-110` (2) só podem ser concluídos uma vez, como pino. As fichas dizem quantos flamingos o pino reúne.

### Transformação e qualidade espacial
- Pares por nome único nos dois lados: **873**. Ajuste em metade (437 pares, 389 inliers) e validação nos outros **436**.
- Resíduo mediano: **0,075 unidade (≈2 m)** nos pares reservados; 387 de 436 a até 0,5 unid. P90 de 0,77 inclui nomes iguais com numeração diferente (cestas, trocas de livros).
- A transformação antiga (÷32 e dois deslocamentos) dá mediana de 0,149 nos mesmos pares. Passou-se a usar a afim ajustada, que é praticamente ÷32 sem rotação. Nenhum pino já existente foi movido.
- Nas quatro categorias comparadas ponto a ponto, os pares casam com mediana de 0,05–0,07 e P90 até 0,15. Daí o corte: um ponto a menos de 0,3 unid. é o mesmo objeto, e entre 0,3 e 0,5 é conflito. Só entra quem estiver a 0,5 unid. ou mais de qualquer ponto existente do mesmo tipo e de outros candidatos novos.
- Correspondência um a um, gulosa por distância, com segunda passada até 1,0 apenas contra pontos locais ainda livres.
- **ATM comum × rebocável.** Há 5 ATMs comuns do catálogo a 0,3 unid. ou menos de um rebocável (um deles a menos de 0,1). A coincidência já existia e não foi alterada: pode ser um mesmo objeto listado em duas categorias. Dois candidatos novos de ATM comum caíram sobre rebocáveis e ficaram em conflito, sem importação.

### Pontos em conflito e conferência
- **Meditação.** `meditation-009` (Seaside) está a 4,3 unid. do Gameta. `meditation-004` (Worn Stone) está a 179 unid.: o Gameta o põe perto de Watson Bay (390, 626) e o catálogo no norte (378, 448). Nada foi alterado.
- **Naufrágio Nuestra Señora de la Noche.** O pino `treasure-001` do snapshot fica a 8,4 unid. do centro dos 7 itens do Gameta. A ficha registra a divergência.
- **Tesouros do Kenton × `treasure`.** `treasure-002…005` coincidem com os naufrágios a 0,4–3,0 unid. e continuam como pinos de naufrágio. `treasure-006` (Gold Doubloon) está a 17 unid. do Bobcat Dive Site e não foi vinculado.
- A lista nominal dos candidatos de ATM, rebocável, carregador e ônibus em conflito está em [audit/GAMETA.md](audit/GAMETA.md).

### O que ficou sem pino e por quê
- **Kitty Litter.** A PowerPyx descreve prédios e áreas de busca, sem coordenadas, e o Gameta não tem essa categoria. As 13 pistas estão na busca global, em "Laboratórios de Kitty Litter". O app ainda não tem geometria de área, e criar um pino pelo distrito seria uma posição fictícia.
- **Nuestra Señora del Ocio.** Texto: a leste de Key Lento, depois da ilha a nordeste da loja do Kenton. Não está entre os tesouros do Kenton, então não há ponto de apoio.
- **Flamingos além dos 55.** GTA6Wiki (20 pinos, "cada pino fica em seu distrito até o ponto exato ser verificado") e ViceCityDB (30 entradas, todas "sem marcador no mapa") não têm coordenadas. Não foram criadas pistas para elas, para não duplicar pinos que o snapshot já localiza.
- **Alvos do Bret.** PushSquare bloqueou (403); uma busca por fonte aberta alternativa não achou lista dos 15 alvos com região.
- **Tablets.** Sem mudança: nenhuma fonte consultada publica posições.

## Complemento de preços de revenda · versão 1.6.0 (24/11/2026)

Escopo: só `public/data/vehicles.json`. Mapa, antisspoiler e as demais categorias não foram reauditados.

| Grupo | Antes | Depois |
| --- | --- | --- |
| Fichas com revenda (todas) | 112 de 629 | 127 de 629 |
| Modelos (todas as classes) | 111 de 366 | 120 de 366 |
| Variantes (todas as classes) | 1 de 263 | 7 de 263 |
| Modelos terrestres comercializáveis | 110 de 239 | 119 de 239 |
| Variantes terrestres | 1 de 230 | 7 de 230 |

Por classe (modelos / variantes). Muscle 20 → 21 / 0. SUV 14 → 16 / 0 → 1. Sedã 20 → 22 / 0. Cupê 12 → 13 / 0 → 1. Esportivo 9 → 10 / 0. Picape 11 → 12 / 0. Moto 3 → 5 / 0. Off-road 7 / 0 → 1. Supercarro 6 / 1 → 3. Sem classe 3 → 2 / 0 → 1. Barcos, aeronaves, emergência e serviços seguem em zero, sem fonte de revenda de carro.

**Cotação WAiNK × pagamento recorrente.** Nenhum valor novo é pagamento recorrente garantido. Scans de telefone (NiaDB, Leonida Racing, Clutchbase) são estimativas de um exemplar e mudam com a condição da carroceria. Valores com selo RK (Growler 12.100, Zorrusso 21.250, '96 Infernus 15.600) ficam em Compradores, como oferta do Randy. A oferta do Pay 'n' Spray - Balsero para o Gauntlet Hellfire (9.775) também fica em Compradores.

**Exclusões justificadas.** Comet S2 destruído do Jason (9.710), cartões de menu de carros próprios (Carbonizzare 14.150, SFB 1000 5.250, Tulip M-100 3.370, Rebel 3.330, Buffalo '07 2.150, Cavalcade XL 7.800) e valores descartados (12.320 atribuído ao Coquette atual, que é do '64). Todos seguem visíveis em "Outras cotações". O Ganado do Jason (1.980 na GTA6Wiki) não entrou: o valor é idêntico ao do Riata do Moses com GTA+ e o escopo é incerto.

**GTA+ no GTAPedia.** Em 33 fichas com GTAPedia e outra fonte, 6 têm razão exata de 1,10 sobre a outra fonte. Growler, Coquette e o Riata do Moses mostram a mesma razão contra scans do Clutchbase e do NiaDB. Esses casos foram reclassificados. As demais diferenças variam de 0,34 a 1,86, o que aponta para condição e exemplar, não para uma regra. Por isso não houve conversão universal.

**Suspeitas não corrigidas (padrão ×1,10).** Quase todos os valores da tabela do IGN e do GTAFinder são múltiplos de 55, enquanto os scans independentes (NiaDB, Clutchbase, Leonida Racing) são múltiplos de 25 ou 50. Isso combina com GTA+ aplicado a boa parte da tabela agregada, mas não está provado por veículo, então não houve conversão. Exemplos: '96 Infernus 17.160 = 15.600 × 1,10 (o 15.600 tem selo RK); Bobcat 500 com 4.400 no agregador contra 4.000 no Leonida Racing, que exclui GTA+; Charred Toros 23.045 do NiaDB = 20.950 × 1,10. As faixas de revenda do catálogo podem ficar até 10% acima de um scan sem GTA+. Para fechar a dúvida, basta um scan por veículo com a conta indicada.

**Filtro de compatibilidade.** Os scans novos trazem acesso por exemplar. Como `compatible()` aceita um exemplar compatível por modelo, sem equipamento marcado agora passam em "Apenas compatíveis" Tempesta, as duas variantes do Emerus, Charred Toros, Truth & Justice Caracara, Cavalcade XL, Rebla GTS e Gauntlet Hellfire, todos com um exemplar destrancado observado.

**Variantes.** 105 variantes sem preço próprio têm modelo base cotado. Nenhum valor foi copiado: `parentName` não prova identidade de preço. A ficha mostra o valor do modelo base como referência rotulada.

## Complemento MapGenie · versão 1.5.0 (24/11/2026)

**Resultado: 0 pinos importados do MapGenie.** O MapGenie carrega no navegador os 2.690 marcadores com coordenadas e descrições. Os [termos da Ziff Davis](https://www.ziffdavis.com/terms-of-use), dona do MapGenie e do IGN, proíbem copiar, extrair, raspar e criar conjuntos de dados a partir do serviço. Por isso nada foi gravado: nem coordenadas, nem descrições, nem ícones. A validação de CRS e de resíduos não se aplicou, porque nenhum pino dessa fonte foi publicado. Não encontramos API ou exportação oficial documentada.

**IGN não é fonte independente.** O [mapa do IGN](https://www.ign.com/maps/gta-6/leonida) mostra a mesma base: 2.690 marcadores, as mesmas categorias e os mesmos números. As categorias do MapGenie também trazem campos `ign_enabled` e `ign_page_id`.

**O que foi usado.** Em primeiro lugar, as contagens da barra lateral pública, como foi feito com Gameta e GTABase, em [data/reference/external-2026-11-24.json](data/reference/external-2026-11-24.json). Em segundo, uma consulta pontual pela busca da interface, para resolver a Saber Shipping. As fichas citam o MapGenie como referência, e nenhuma coordenada foi copiada.

**Delta da versão 1.5.0**

| Mudança | Antes | Depois | Evidência |
|---|--:|--:|---|
| Operações do checklist identificadas por nome | 37/39 + 1 UE | 39/39 + 1 UE | Saber Shipping Yard (`gang-operation-022`) e Facility (`-024`), identificadas pelos itens-chave da busca do MapGenie e confirmadas pela vizinhança local (Chino, cofre e pistola no 022; cofre, relógio e VF5 no 024) |
| Senha 8046 do Leonida Lab com ponto local | pendente | `safe-029` | O cofre do escritório é o cofre da Yard, apesar do nome importado "Office Safe - Saber Shipping Facility" |
| BASE jumps | 32 | 25 | Sete caixas de paraquedas (`parachuting-001…007`) foram para a nova categoria **Caixas de paraquedas**. Agora o número confere com PowerPyx e MapGenie |
| Trocas de livros | 8 | 7 | "Book: Killer Prom" (`book-swap-010`), a 0,19 unidade da Book Swap 1, é o livro, não uma troca. Passou para Livros e revistas |
| Fichas enriquecidas | — | 3 || Saber Yard, Saber Facility e `safe-029`: itens-chave, acesso e local exato, em frases próprias |
| Duplicatas evitadas | — | 0 novas | Nenhum ponto novo entrou. Os IDs foram preservados, e os nomes antigos continuam pesquisáveis como alias |

**Conferência da 1.3.0.** A contagem automatizada por nome não reproduzia o "39/39" da versão 1.3.0. Dava 37/39 + 1 UE, porque a Saber Shipping Yard não tinha correspondência e o nome da Facility caía em um cofre. O 39/39 anterior contava os dois pinos da Guardia sem saber qual era qual. As demais listas conferem: 20/20 joalherias, 15/15 penhores, 14 + 8 bancos, 7/7 financeiras e 21/21 fast food. Das lojas de bebidas, 13/14 têm pino, e a Three Sheets fica no guia da arara.

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
| Operações ilegais | 43 | 17 | 11 | 3 | 0 | 0 | 1 |
| Cofres | 96 | 0 | 26 | 24 | 0 | 0 | 0 |
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
