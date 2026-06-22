---
id: ISSUE-0014
title: "Definir unidade por indicador do Cidades Sustentáveis (~500 indicadores)"
status: backlog
priority: low
type: research
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - dw
  - cidades-sustentaveis
  - research
related_files:
  - apps/datawarehouse/sql/gold/dim_indicadores.sql
---

# Resumo

`gold.dim_indicadores.unidade` fica `null` para os ~500 indicadores do
Cidades Sustentáveis — não existe essa informação em nenhuma fonte
original (nem a planilha, nem um catálogo derivado conhecido).

# Problema

Sem unidade, o frontend não consegue exibir "12.3%" ou "12.3 mil
habitantes" — só o número cru, o que é ambíguo para o usuário final em
vários indicadores.

# Objetivo

Encontrar ou construir uma referência confiável de unidade por
indicador, ou decidir formalmente que isso não será preenchido por ora.

# O que falta fazer

- [ ] Pesquisar se o Cidades Sustentáveis publica algum catálogo/glossário
      de indicadores com unidade (fora da planilha de dados em si).
- [ ] Se não existir fonte externa, avaliar custo de curadoria manual
      (~500 indicadores) e se vale o esforço frente ao uso real.
- [ ] Se a decisão for "não preencher por ora", documentar isso para não
      ser revisitado sem necessidade nova.

# Observações

`unidade: '%'` já existe corretamente só para o índice CAPAG agregado
(decisão fechada na Fase 5/`ISSUE-0006`, depois corrigida para `null` na
correção da nota CAPAG em `ISSUE-0007` — o CAPAG é categórico, A/B/C/D,
não percentual).

# Log de execução

(ainda não iniciada)
