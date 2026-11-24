# Progresso da entrega

## Inventário de 24/11/2026

| Métrica | Total |
|---|---:|
| Registros de `locations.json` | 4.688 |
| Registros de `places.json` | 1.021 |
| Duplicatas ou aliases consolidados | 44 |
| Pontos importados com coordenadas da fonte | 5.665 |
| Evidência comunitária atribuída pela fonte | 4.075 |
| Grau de evidência incompleto no catálogo | 1.590 |
| Locais cuja existência aparece em material oficial, com posição comunitária | 6 |
| Guias editoriais com ficha e referências próprias | 32 |
| Resumos adicionais de bancos com modalidade e valor | 20 |
| Modelos com estimativa comunitária de revenda livre | 3 |
| Lojas de eletrônicos relacionadas à busca por tablets | 15 |
| Pontos visíveis no Capítulo 3 com Locais ativado | 2.399 |

Nenhum ponto recebeu confirmação de coordenadas por inspeção independente no PS5. A existência oficial de seis locais vem da Rockstar. Outros guias citam relatos de testes em jogo, inclusive Apollo Aggregates em PlayStation. Consulte [FONTES.md](FONTES.md).

## Recursos entregues

- Seleção inicial obrigatória de capítulo. Dados de progresso de versões anteriores são preservados.
- Grupo Locais desligado na primeira abertura, com a escolha salva no aparelho. Símbolos vetoriais de categoria e serviço nos pinos, na legenda e nas fichas.
- Cartografia noturna de alta resolução, clusters e legenda com grupos e categorias.
- Busca por nome, região e categoria. Filtros por conclusão, favorito, repetição, confronto, evidência de capítulo e requisitos selecionados.
- Guias com valores, campos desconhecidos explícitos e links para fontes e vídeos, inclusive momentos marcados da arara e da entrega inicial do Zorrusso.
- Checklist local, histórico, marcadores pessoais, backup por JSON e estimativa para atividades pendentes com recompensa publicada.
- Rota de até 25 paradas com linha reta e caminhos derivados de segmentos conectados. Tratamento explícito de trechos sem conexão.
- PWA estática com cache do catálogo, guias, visão geral offline e detalhe previamente percorrido. Workflow de publicação gratuita no GitHub Pages.

## Limites de cobertura

- Faltam capítulos, disponibilidade por missão, alarmes, pagamentos, pontos de controle, condições de aparecimento e tempos de reposição para a maioria dos pontos. Os sete pontos de financeiras permanecem catalogados com capítulo desconhecido.
- O valor do laboratório difere por relato. O armazém que outra fonte situa ao norte de Hamlet permanece como pista sem pino próprio. Apollo Aggregates tem ficha, pino e evidência de reposição parcial.
- As 15 lojas de eletrônicos são consultáveis. Posições de tablets coletáveis e estoque individual não tiveram evidência suficiente. As fotos de gameplay ficaram em links para as fontes por falta de autorização verificável para redistribuição da coleção.
- As faixas de revenda são estimativas de modelo. Recompensas por encomenda ou missão aparecem no ranking de atividade. A malha comunitária de ruas serve para planejamento aproximado e pode omitir acessos ou restrições do jogo.
- O mapa foi publicado no GitHub Pages. O teste móvel do endereço público verificou mapa, ficha e recarga offline em WebKit com perfil de iPhone 15 emulado no Windows. [Abrir o Leonida Map](https://marcosbittar11-maker.github.io/leonida-map/)

## Validação

- `npm run data:sync`, `npm ci`, `npm test` e `npm run build`.
- Suíte de modelo com sete casos. Cobre catálogo, deduplicação e aliases, bloqueio por capítulo, requisitos, backup e roteamento.
- Playwright passou os 22 testes, 11 em Chrome desktop e 11 em WebKit com perfil iPhone 15. Cobre arrasto em desktop, zoom, agrupamento, seleção por clique e toque, busca, filtros, proteção contra capítulo posterior, requisitos, favoritos, histórico, backup, ficha, edição de ponto, rotas, ranking e reabertura offline.
- O teste de carga usa os 5.665 marcadores importados, com menos de 500 elementos de mapa simultâneos no zoom de visão geral. A medição final, com debounce e espera do teste, foi de 139 ms em Chrome e 214 ms em WebKit.
- A versão estática foi recarregada offline no Chrome em um subdiretório `/leonida-map/`, como o caminho padrão de um repositório no GitHub Pages.
- Inspeção visual do Chrome a 1487 × 1058 e do perfil iPhone 15, incluindo ficha. A referência de design local foi comparada com o cabeçalho, a tipografia, a densidade da legenda, os controles de zoom e a posição da ficha. A implementação usa a cartografia pública com enquadramento estadual, guias em destaque e reorganização da navegação e da ficha no celular.


## Versão 1.1.0

- Cabeçalho com a versão do pacote. Filtros em 11 grupos, com Operações ativa em uma configuração nova, e controle de coleção para variantes.
- Remoção dos agrupamentos numéricos. O mapa mantém pinos independentes na área visível e preserva o agrupamento por categoria na legenda.
- 262 pontos de variantes terrestres na seleção editorial, incluindo dois aparecimentos adicionais do Gameta. Pedidos de entregas e aparecimentos genéricos ficaram fora da camada. Os IDs antigos continuam no catálogo para preservar o progresso.
- A comparação de fontes e a transformação das duas coordenadas estão documentadas em [FONTES.md](FONTES.md).
- Validação desta versão com oito testes unitários e 24 testes Playwright. A carga em navegador usou mais de 5.000 pontos sem agrupar.
