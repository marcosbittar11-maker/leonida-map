# Importação do Gameta · relatório nominal

Gerado por `node scripts/import-gameta.mjs`. Fonte: https://gameta.gg/gta6/map/ (arquivo `/_nuxt/Dd5U7Uv6.js`, sha256 `b835db451127f788…`).

## Calibração

- Pares por nome único nos dois lados: **873**. Ajuste em 437 pares (389 inliers) e validação em **436 pares reservados**.
- Resíduo mediano nos reservados: **0,075 unidade** (≈2 m). P90 0,774. 387 de 436 a até 0,5 e 398 a até 1,0. O restante são nomes iguais com numeração diferente (cestas, trocas de livro) e dois pontos de meditação em conflito.
- Transformação antiga (÷32 com deslocamentos 118,684375 e 24,9375): mediana de 0,149 nos mesmos pares. A afim ajustada é a usada: `x = 0.031290276 | -4.30199057e-7 | -119.340737 ; y = 8.49911784e-7 | 0.0312631113 | -25.173969 (coeficientes de X, Y e constante)`.

## Contagens por categoria

| Categoria | Fonte | Local antes | Pares | Mediana dos pares | Novos | Conflitos (não importados) | Locais sem par |
|---|--:|--:|--:|--:|--:|--:|--:|
| Caixa eletrônico | 193 (declarado 193) | 160 | 158 | 0,045 | 21 | 14 | 2 |
| Caixa eletrônico rebocável | 98 (declarado 99) | 94 | 92 | 0,049 | 2 | 4 | 2 |
| Carregador elétrico | 125 (declarado 126) | 88 | 87 | 0,066 | 36 | 2 | 1 |
| Ponto de ônibus | 301 (declarado 301) | 310 | 266 | 0,065 | 32 | 3 | 44 |

## Novos IDs

**ATMs (21)**

`gameta-atm-13814-13619`, `gameta-atm-13859-13904`, `gameta-atm-19995-14116`, `gameta-atm-20044-14134`, `gameta-atm-20083-14151`, `gameta-atm-19786-15921`, `gameta-atm-19525-15974`, `gameta-atm-19544-15995`, `gameta-atm-14859-16103`, `gameta-atm-19426-16707`, `gameta-atm-19508-16716`, `gameta-atm-19387-16724`, `gameta-atm-19286-17081`, `gameta-atm-19271-17097`, `gameta-atm-19600-17489`, `gameta-atm-17870-17912`, `gameta-atm-17866-17934`, `gameta-atm-17708-17962`, `gameta-atm-17855-17963`, `gameta-atm-17973-17971`, `gameta-atm-18941-18898`

**ATMs rebocáveis (2)**

`gameta-towatm-21698-15375`, `gameta-towatm-19330-18173`

**Carregadores elétricos (36)**

`gameta-ev-18100-9854`, `gameta-ev-15986-10021`, `gameta-ev-18898-10885`, `gameta-ev-19403-10961`, `gameta-ev-17557-11112`, `gameta-ev-19097-11859`, `gameta-ev-14323-11879`, `gameta-ev-19604-12253`, `gameta-ev-19676-12393`, `gameta-ev-17399-12578`, `gameta-ev-17298-12631`, `gameta-ev-17186-12743`, `gameta-ev-17234-12799`, `gameta-ev-17259-12847`, `gameta-ev-17020-12894`, `gameta-ev-17521-13012`, `gameta-ev-20034-13046`, `gameta-ev-17954-13415`, `gameta-ev-20488-13630`, `gameta-ev-18878-14300`, `gameta-ev-18394-14463`, `gameta-ev-18892-14576`, `gameta-ev-18740-14659`, `gameta-ev-18780-16071`, `gameta-ev-16184-16470`, `gameta-ev-13350-16753`, `gameta-ev-13846-16916`, `gameta-ev-13173-16935`, `gameta-ev-13014-16961`, `gameta-ev-13082-17012`, `gameta-ev-13680-17022`, `gameta-ev-13006-17100`, `gameta-ev-13165-17149`, `gameta-ev-13177-17207`, `gameta-ev-13624-17353`, `gameta-ev-15162-20624`

**Pontos de ônibus (32)**

`gameta-bus-15994-9977`, `gameta-bus-16020-10040`, `gameta-bus-14724-10363`, `gameta-bus-18716-10824`, `gameta-bus-17402-13022`, `gameta-bus-19735-13285`, `gameta-bus-19735-13304`, `gameta-bus-18763-14337`, `gameta-bus-21690-15086`, `gameta-bus-19261-15783`, `gameta-bus-22060-15902`, `gameta-bus-19123-15929`, `gameta-bus-19573-16157`, `gameta-bus-22103-16201`, `gameta-bus-19439-16280`, `gameta-bus-19635-16437`, `gameta-bus-19444-16447`, `gameta-bus-19610-16605`, `gameta-bus-13685-16666`, `gameta-bus-19489-16703`, `gameta-bus-22024-16764`, `gameta-bus-18927-16788`, `gameta-bus-19010-16995`, `gameta-bus-18603-17205`, `gameta-bus-18567-17341`, `gameta-bus-19224-17368`, `gameta-bus-18520-17659`, `gameta-bus-17888-17950`, `gameta-bus-19264-18060`, `gameta-bus-19034-18636`, `gameta-bus-15054-20496`, `gameta-bus-15066-20510`

**Tesouros do Kenton (41)**

`gameta-kenton-2695`, `gameta-kenton-2696`, `gameta-kenton-2697`, `gameta-kenton-2698`, `gameta-kenton-2699`, `gameta-kenton-2700`, `gameta-kenton-2701`, `gameta-kenton-2702`, `gameta-kenton-2703`, `gameta-kenton-2704`, `gameta-kenton-2705`, `gameta-kenton-2706`, `gameta-kenton-2707`, `gameta-kenton-2708`, `gameta-kenton-2709`, `gameta-kenton-2710`, `gameta-kenton-2711`, `gameta-kenton-2712`, `gameta-kenton-2713`, `gameta-kenton-2714`, `gameta-kenton-2715`, `gameta-kenton-2716`, `gameta-kenton-2717`, `gameta-kenton-2718`, `gameta-kenton-2719`, `gameta-kenton-2720`, `gameta-kenton-2721`, `gameta-kenton-2722`, `gameta-kenton-2723`, `gameta-kenton-2724`, `gameta-kenton-2725`, `gameta-kenton-2726`, `gameta-kenton-2727`, `gameta-kenton-2728`, `gameta-kenton-2729`, `gameta-kenton-2730`, `gameta-kenton-2731`, `gameta-kenton-2732`, `gameta-kenton-2733`, `gameta-kenton-2734`, `gameta-kenton-2735`

**Naufrágios (posição aproximada) (5)**

`gameta-wreck-noche`, `gameta-wreck-etica-laxa`, `gameta-wreck-lujuriosa`, `gameta-wreck-cinco-torres`, `gameta-wreck-santa-sierra`

**Contatos (10)**

`gameta-contact-17389-9809`, `gameta-contact-13752-13487`, `gameta-contact-12991-13680`, `gameta-contact-13741-13899`, `gameta-contact-19370-15763`, `gameta-contact-17545-16328`, `gameta-contact-18970-17098`, `gameta-contact-18178-22892`, `gameta-contact-17500-23234`, `gameta-contact-16930-23734`

## Pontos em conflito (nada foi importado)

**Caixa eletrônico (14)**

- `gameta-atm-21959-16040` a 0,47 unidade de um ponto local
- `gameta-atm-19413-16701` a 0,49 unidade de um ponto local
- `gameta-atm-19397-16713` a 0,44 unidade de um ponto local
- `gameta-atm-19342-17118` a 0,41 unidade de um ponto local
- `gameta-atm-19599-17481` a 0,37 unidade de um ponto local
- `gameta-atm-19373-17627` a 0,44 unidade de um ponto local
- `gameta-atm-17854-18013` a 0,3 unidade de um ponto local
- `gameta-atm-18913-18881` a 0,23 unidade de um ponto local
- `gameta-atm-19589-17496` a 0 unidade de um ponto local
- `gameta-atm-17866-17940` a 0 unidade de um ponto local
- `gameta-atm-17854-17944` a 0 unidade de um ponto local
- `gameta-atm-17863-17969` a 0 unidade de um ponto local
- `gameta-atm-20112-15264` a 0,16 unidade de um ponto local · coincide com objeto de outro tipo (ATM comum × rebocável)
- `gameta-atm-21787-16979` a 0,13 unidade de um ponto local · coincide com objeto de outro tipo (ATM comum × rebocável)

**Caixa eletrônico rebocável (4)**

- `gameta-towatm-19835-15573` a 0,32 unidade de um ponto local
- `gameta-towatm-21587-16832` a 0,39 unidade de um ponto local
- `gameta-towatm-21904-17131` a 0,48 unidade de um ponto local
- `gameta-towatm-19118-18666` a 0,33 unidade de um ponto local

**Carregador elétrico (2)**

- `gameta-ev-21804-16743` a 0,02 unidade de um ponto local
- `gameta-ev-18069-17867` a 0,34 unidade de um ponto local

**Ponto de ônibus (3)**

- `gameta-bus-19265-16098` a 0,5 unidade de um ponto local
- `gameta-bus-19378-17639` a 0,42 unidade de um ponto local
- `gameta-bus-18954-18812` a 0,44 unidade de um ponto local

**Meditação (conferência, sem importação)**

- Seaside Meditation: meditation-009 a 4,34 unidades do Gameta
- Worn Stone Meditation: meditation-004 a 179,3 unidades do Gameta
