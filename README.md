# Leonida Map

Aplicativo web em português brasileiro para consultar GTA VI no computador ou pelo celular enquanto joga no PS5. Na primeira abertura, o app pergunta em qual capítulo você está para aplicar a proteção contra spoilers. A resposta fica salva no aparelho e pode ser alterada pelo botão de capítulo.

[Abrir o Leonida Map no GitHub Pages](https://marcosbittar11-maker.github.io/leonida-map/)

## Executar

Requer Node.js 22.12 ou posterior compatível com Vite 8 e npm.

~~~sh
npm ci
npm run dev
~~~

Abra [http://localhost:5173](http://localhost:5173). A compilação que permite testar offline fica em `dist/`.

~~~sh
npm run build
npm run preview
~~~

O servidor de prévia abre em [http://localhost:4173](http://localhost:4173). O endereço de rede exibido pelo Vite pode ser usado no iPhone na mesma rede, se o firewall permitir. O service worker exige HTTPS ou `localhost`, então a instalação e o modo offline pelo celular usam a opção HTTPS abaixo.

## Hospedar grátis e instalar no iPhone

Publique o conteúdo de `dist/` em um host estático HTTPS. Para GitHub Pages, crie um repositório público, envie este projeto e escolha **Settings → Pages → GitHub Actions**. O fluxo **Publicar Leonida Map** pode ser disparado manualmente em **Actions**. O endereço HTTPS aparece na execução. [Documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Abra o endereço no Safari. Use **Compartilhar → Adicionar à Tela de Início**, ative **Abrir como App da Web** e toque em **Adicionar**. Abra o app instalado online uma vez para gravar os recursos locais. [Instruções da Apple](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios)

## Consultar

- Busque por nome, região ou categoria. Abra os grupos da legenda para combinar filtros.
- Use o botão de capítulo para informar equipamentos e desbloqueios. O filtro de acesso exige os requisitos documentados. O jogo ainda pode impor condições que a fonte não registrou.
- Pontos cartográficos de baixo risco editorial podem aparecer sem capítulo. Atividades sem capítulo documentado ficam ocultas por padrão. Também é possível exibi-las explicitamente e manter o bloqueio dos capítulos posteriores.
- Marque conclusões e favoritos na ficha. Adicione pontos a uma rota em ordem de visita. A linha tracejada usa distância em linha reta. A linha verde usa trechos conectados da malha comunitária, sem simulação de sentidos ou travessias. As distâncias estão em unidades da base, e as posições no jogo podem variar em precisão.
- Use **Progresso → Exportar** para levar um backup ao celular. A importação combina favoritos, datas e pontos e preserva as preferências de antisspoiler do aparelho de destino. O progresso permanece no navegador até que seja exportado ou removido pelo sistema.
- O mapa geral, o catálogo, os guias e as vias são armazenados após a instalação do service worker. O detalhe cartográfico online é armazenado conforme a navegação, até 72 blocos. Áreas ainda não vistas usam a visão geral offline. Os links externos precisam de conexão.

## Manutenção

| Caminho | Responsabilidade |
|---|---|
| `src/main.js`, `src/style.css` | Controles, fichas e interface responsiva |
| `src/map.js`, `src/routes.js` | CRS.Simple, pinos, agrupamento e malha viária |
| `public/data/catalog.json` | Catálogo, aliases, revisão e hashes SHA-256 |
| `src/guides.js` | Guias autorais, evidências, capítulos e requisitos |
| `src/model.js` | Filtros, progresso versionado, validação e consolidação |
| `scripts/import.mjs`, `scripts/normalize.mjs` | Aquisição e deduplicação |
| `scripts/offline.mjs`, `scripts/service-worker.js` | Empacotamento offline |

~~~sh
npm run data:sync -- SHA_COMPLETO_DA_REVISAO
npm test
npm run build
npx playwright install chrome
npx playwright install webkit
npm run test:e2e
~~~

O sincronizador mantém IDs e aliases observados. Para remover ou substituir um ID na fonte, preserve ou introduza um alias antes de publicar a mudança. O catálogo normalizado e os dados de navegação ficam no repositório e permitem desenvolvimento local sem rodar a importação. Consulte [FONTES.md](FONTES.md) para atribuições e [PROGRESS.md](PROGRESS.md) para cobertura e testes.

Projeto comunitário independente. A cartografia e os dados foram adaptados de [Open GTA 6 Map](https://github.com/fbritoferreira/gta6) sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ícones de interface são [Lucide](https://lucide.dev/license).

