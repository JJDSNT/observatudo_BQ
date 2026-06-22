---
id: ISSUE-0012
title: "Definir schema de ops.dataset_freshness e ops.data_quality_checks"
status: backlog
priority: low
type: infra
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - dw
  - bigquery
  - infra
related_files:
  - infra/bigquery.tf
  - apps/datawarehouse/src/observatudo/pipeline/ops_logger.py
---

# Resumo

O dataset `ops` (observabilidade do pipeline, ver `ISSUE-0003`) já tem
`ops.pipeline_runs` implementada e em uso desde a Fase 3. Duas tabelas
adicionais planejadas na visão original (`docs/architecture.md`) ainda
não existem: `ops.dataset_freshness` e `ops.data_quality_checks`.

# Problema

Sem essas tabelas, não há registro estruturado de "há quanto tempo cada
dataset foi atualizado" nem de checagens de qualidade de dado
(duplicidade, nulos inesperados, etc.) — hoje essas verificações, quando
feitas, são manuais e ad-hoc (ex.: a verificação de unicidade
`(indicador_id, localidade, ano)` feita manualmente na Fase 5).

# Objetivo

Definir o schema (colunas, granularidade) de cada tabela antes de
implementar — esta issue é só a definição, não a implementação.

# O que falta fazer

- [ ] Definir colunas/granularidade de `ops.dataset_freshness` (por
      tabela? por step do pipeline?).
- [ ] Definir colunas/granularidade de `ops.data_quality_checks` (que
      tipos de check, como registrar pass/fail).
- [ ] Decidir se essas tabelas são escritas pelo mesmo `ops_logger.py` ou
      por um módulo novo.

# Observações

Nenhum endpoint da API de metadados do `ops` depende disso ainda — ver
`ISSUE-0013`.

# Log de execução

(ainda não iniciada)
