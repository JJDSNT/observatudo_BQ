---
id: ISSUE-0022
title: "Pendências dos dados internacionais: cobertura 1800-1960 e eventos históricos"
status: backlog
priority: medium
type: research
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - dw
  - frontend
  - feature
related_files:
  - apps/datawarehouse/src/observatudo/transformers/world_bank.py
  - apps/frontend/src/app/world/page.tsx
---

# Resumo

Duas pendências encontradas depois de fechar `ISSUE-0019` (indicadores
internacionais via World Bank), ambas em torno da mesma página
(`/world`) — agrupadas aqui em vez de 2 issues soltas porque nenhuma
delas, isolada, justifica uma issue própria. (Uma terceira pendência,
versionamento DVC de `data/world_bank`, foi resolvida diretamente, sem
precisar de issue — ver `ISSUE-0019`.)

# Problema

1. **Cobertura temporal**: a página `/world` promete (texto + inspiração
   declarada no vídeo do Hans Rosling) "Período coberto: de 1800 até o
   presente". Os dados entregues em `ISSUE-0019` (World Bank Open Data)
   só cobrem **1960–2024** (confirmado em produção:
   `min(ano)=1960, max(ano)=2024` em `gold.fact_indicadores` para
   `fonte = 'world_bank'`). Não existe hoje nenhuma fonte conectada que
   cubra 1800–1959.

2. **Tabela de eventos relevantes**: a `/world` também promete uma linha
   do tempo marcada com eventos ("1ª Guerra Mundial, 2ª Guerra Mundial,
   Pandemias (como Covid-19), Crises Econômicas") — não existe hoje
   nenhuma tabela, dataset ou dado para isso em todo o repositório
   (confirmado: zero menção a "eventos históricos" fora do texto da
   própria página).

# Objetivo

Resolver (ou decidir conscientemente postergar, com justificativa
registrada) cada uma das 2 pendências antes que `ISSUE-0021` (gráfico
animado) seja implementada — o gráfico depende diretamente da cobertura
temporal real e se beneficia da tabela de eventos para as marcações na
linha do tempo.

# O que falta fazer

- [ ] Decidir se vale buscar uma fonte alternativa/complementar para
      1800–1959 (candidatas a avaliar: Gapminder próprio — que já blenda
      múltiplas fontes históricas para preencher esse período —, Maddison
      Project Database para PIB histórico, Our World in Data). Se
      nenhuma fonte for boa o suficiente, decidir entre (a) ajustar o
      texto da `/world` para refletir a cobertura real (1960+) ou
      (b) manter a promessa e aceitar que fica pendente até achar fonte.
- [ ] Desenhar e popular uma tabela de eventos históricos relevantes
      (nome, data/intervalo, categoria — guerra/pandemia/crise
      econômica/outro, abrangência — global ou por país). Decidir se
      entra como CSV estático versionado (mesmo padrão do resto de
      `data/`) ou outra forma de armazenamento; decidir o conjunto
      inicial de eventos (a lista do texto da `/world` já dá um ponto de
      partida: 1ª e 2ª Guerra Mundial, Covid-19, crises econômicas — mas
      "crises econômicas" sozinho é vago demais para virar dado sem
      especificar quais).

# Decisões tomadas

Nenhuma ainda — issue de investigação/decisão, não implementação já
fechada.

# Critérios de aceite

- [ ] Para cobertura temporal: decisão registrada (fonte nova integrada
      OU texto da página ajustado para refletir 1960+), não deixada em
      aberto silenciosamente.
- [ ] Tabela de eventos históricos com pelo menos os eventos já citados
      no texto da `/world` (1ª Guerra, 2ª Guerra, Covid-19) populada e
      acessível para uso futuro pelo gráfico animado.

# Observações

`ISSUE-0019` entregou o pipeline World Bank (PIB per capita, expectativa
de vida, população, 1960–2024) e já registrava como decisão consciente
que a `regiao` gravada é a taxonomia do World Bank, não os 6 continentes
do vídeo — pendência relacionada mas distinta da cobertura temporal aqui.
`ISSUE-0021` (gráfico animado) é quem consome tanto a cobertura temporal
quanto a tabela de eventos desta issue — vale resolver esta antes.

# Log de execução

(ainda não iniciada)
