---
id: ISSUE-0021
title: "Gráfico animado tipo Gapminder na página /world"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - frontend
  - feature
related_files:
  - apps/frontend/src/app/world/page.tsx
  - apps/frontend/src/lib/analytics/mundo.ts
  - apps/frontend/package.json
---

# Resumo

A página `/world` promete (no texto e na inspiração declarada — a
apresentação de Hans Rosling) um gráfico animado de bolhas: renda ×
expectativa de vida, cor por continente, tamanho por população, linha do
tempo. `ISSUE-0019` entregou o pipeline de dados e os 3 indicadores
(PIB per capita, expectativa de vida, população) numa tabela simples; esta
issue é o gráfico animado em si.

# Problema

Hoje não existe nenhuma lib de visualização/gráficos no frontend (sem
recharts, d3, visx, etc. — confirmado em `apps/frontend/package.json`).
A animação (bolha por país, interpolação entre anos, slider de tempo) é
um esforço de UI substancial por si só, separado da modelagem de dados.

# Objetivo

Substituir a tabela de `/world` (ou complementá-la) por um scatter
animado no estilo Gapminder, usando os dados já disponíveis via
`lib/analytics/mundo.ts`/Cube.

# O que falta fazer

- [ ] Escolher a lib de visualização (ex.: visx+d3-scale vs. recharts vs.
      uma solução SVG/canvas customizada) — decisão de arquitetura aberta,
      não resolvida nesta issue.
- [ ] Decidir a fonte de "cor por continente": `dim_localidades.regiao`
      hoje carrega a taxonomia de região do World Bank (ex.: "Latin
      America & Caribbean"), não os 6 continentes do vídeo do Hans
      Rosling — pode precisar de uma reclassificação/mapeamento.
- [ ] Estender `mundo.ts` para trazer série histórica (não só o ano mais
      recente) — necessário para a linha do tempo animada.
- [ ] Implementar o scatter (eixo X = renda, eixo Y = expectativa de
      vida, raio = população, cor = região/continente) com transição
      entre anos.
- [ ] Decidir se o cobertura de anos fica limitada à disponibilidade real
      do World Bank (em geral 1960+) ou se mantém a promessa textual de
      "1800 → 2025" da página (que exigiria outra fonte de dados para o
      período pré-1960).

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Gráfico animado funcional na `/world`, com pelo menos os 3
      indicadores de `ISSUE-0019` (renda, expectativa de vida, população)
      e cor por região/continente.

# Observações

Ver `ISSUE-0019` para o pipeline de dados (já entregue) que esta issue
consome. Ver `ISSUE-0022` para 2 pendências que valem resolver antes
desta: cobertura temporal real dos dados (1960+, não 1800 como o texto
da página promete) e a tabela de eventos históricos para marcar a linha
do tempo do gráfico.

# Log de execução

(ainda não iniciada)
