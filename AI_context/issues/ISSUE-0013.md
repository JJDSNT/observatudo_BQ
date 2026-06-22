---
id: ISSUE-0013
title: "Endpoints adicionais da API de metadados do ops"
status: backlog
priority: low
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - dw
  - api
  - infra
related_files:
  - apps/datawarehouse/src/observatudo/api/routers/pipelines.py
  - apps/datawarehouse/src/observatudo/api/main.py
---

# Resumo

A API de metadados do `ops` (FastAPI, `apps/datawarehouse/src/
observatudo/api/`) hoje só tem `GET /pipelines/` (lendo
`ops.pipeline_runs`, implementado na Fase 3, `ISSUE-0003`). Ações/
mutações (ex.: "reprocessar esta fonte") ainda não existem.

# Problema

Não há necessidade real surgida ainda que justifique novos endpoints —
esta issue existe para não perder o registro de que isso foi avaliado e
adiado por falta de demanda, não por esquecimento.

# Objetivo

Implementar endpoints concretos quando houver necessidade real (ex.: uma
UI de operação do pipeline, ou um endpoint de reprocessamento sob
demanda).

# O que falta fazer

- [ ] Identificar a primeira necessidade real (provavelmente vai vir de
      uma UI operacional ou de um pedido específico, não de design
      especulativo).
- [ ] Desenhar o endpoint só nesse momento.

# Observações

Depende também de `ISSUE-0012` se o endpoint precisar expor
freshness/quality checks.

# Log de execução

(ainda não iniciada — registrada como decisão adiada, não esquecida)
