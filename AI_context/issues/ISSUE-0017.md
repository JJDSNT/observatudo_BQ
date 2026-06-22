---
id: ISSUE-0017
title: "Evoluir MetricCard para gráfico de linha (série histórica completa)"
status: backlog
priority: low
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - frontend
  - feature
related_files:
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
---

# Resumo

Desde a Fase 6 (`ISSUE-0007`), a série histórica chega completa e correta
via Cube.js, mas `MetricCard` só mostra as 3 últimas medidas em texto
(`showHistory`/`serieRecentes`). Dá para evoluir para um gráfico de linha
de verdade exibindo a série completa.

# Problema

Antes da migração para Cube.js, a série histórica vinha incompleta/menos
confiável, então um gráfico de linha não se justificava tanto. Isso
mudou — o dado já suporta uma visualização melhor, só o componente não
foi atualizado.

# Objetivo

`MetricCard` (ou um componente novo) exibindo a série histórica completa
como gráfico de linha, não só as 3 últimas medidas em texto.

# O que falta fazer

- [ ] Escolher biblioteca de gráficos (se nenhuma já estiver no
      `package.json` do frontend, avaliar custo de bundle).
- [ ] Decidir se substitui `showHistory`/`serieRecentes` ou convive com
      eles (ex.: texto compacto + gráfico expansível).

# Observações

Ideia registrada, sem desenho de UI ainda.

# Log de execução

(ainda não iniciada)
