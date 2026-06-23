---
id: ISSUE-0021
title: "Gráfico animado tipo Gapminder na página /world"
status: review
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
  - apps/frontend/src/components/GapminderChart/GapminderChart.tsx
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

# O que foi feito

- [x] Lib de visualização: SVG custom + `d3-scale` (só funções de escala —
      log/linear/sqrt —, sem framework de gráfico). Nova dependência
      `d3-scale`/`@types/d3-scale` em `apps/frontend/package.json`.
- [x] Cor por região: `dim_localidades.regiao` direto (7 valores distintos
      hoje em produção — taxonomia do World Bank), sem reclassificar para
      os 6 continentes do vídeo do Hans Rosling.
- [x] `mundo.ts` ganhou `buscarSerieHistoricaMundial()`: série completa
      por país (todos os anos 1960–2024 em que os 3 indicadores têm valor
      simultaneamente), sem o filtro de "últimos N anos" de
      `buscarIndicadoresMundiais()`.
- [x] `components/GapminderChart/GapminderChart.tsx` (novo, `"use
      client"`): scatter SVG com bolha por país (raio ∝ √população, eixo
      X = PIB per capita em escala log, eixo Y = expectativa de vida),
      cor por região, play/pause (`setInterval` + cleanup em
      `useEffect`), slider de ano (`<input type="range">`), transição CSS
      entre anos (`transition: cx/cy/r`), legenda de regiões.
- [x] Integrado em `app/world/page.tsx`, entre o vídeo e a tabela
      existente (complementa, não substitui) — nota de "em construção"
      removida.

# O que falta fazer

- [ ] Cobertura temporal real (1960+, não 1800 como o texto da página
      promete) e tabela de eventos históricos — `ISSUE-0022`, fora de
      escopo aqui.
- [ ] Texto fixo "Período coberto: de 1800 até o presente" no `<aside>`
      da `/world` continua desatualizado em relação ao gráfico (que cobre
      1960+) — ajuste faz parte de `ISSUE-0022`.

# Decisões tomadas

- Domínios das escalas (PIB, expectativa de vida, população) calculados
  uma vez sobre toda a série histórica, não por ano — evita que os eixos
  "saltem" durante a animação.
- Raio proporcional à raiz quadrada da população (`scaleSqrt`), não à
  população direta — convenção padrão Gapminder de área proporcional, não
  raio proporcional (que exageraria visualmente países grandes).
- Tabela da `ISSUE-0019` mantida abaixo do gráfico, não removida — dado
  tabular ainda é útil para inspeção/acessibilidade.

# Critérios de aceite

- [x] Gráfico animado funcional na `/world`, com os 3 indicadores de
      `ISSUE-0019` (renda, expectativa de vida, população) e cor por
      região — validado com `npm run dev` (192 bolhas no ano mais
      recente, valores plausíveis: Índia $3k/72.2 anos, China
      $13k/78 anos, EUA $85k/78.9 anos; slider 1960–2024; 7 regiões na
      legenda).

# Observações

Ver `ISSUE-0019` para o pipeline de dados (já entregue) que esta issue
consome. Ver `ISSUE-0022` para 2 pendências que valem resolver antes
desta: cobertura temporal real dos dados (1960+, não 1800 como o texto
da página promete) e a tabela de eventos históricos para marcar a linha
do tempo do gráfico.

# Log de execução

2026-06-23 — Implementado gráfico animado completo (escalas, play/pause,
slider, legenda), série histórica em `mundo.ts`, integrado na `/world`.
Verificado com `tsc --noEmit`, `eslint` e `npm run dev` (inspeção do HTML
renderizado — sem navegador gráfico disponível no ambiente).
