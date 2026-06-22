---
id: ISSUE-0011
title: "Componentes individuais do CAPAG sem linha em dim_indicadores"
status: backlog
priority: low
type: bug
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - capag
  - bigquery
  - bug
related_files:
  - apps/datawarehouse/sql/gold/dim_indicadores.sql
  - apps/datawarehouse/sql/gold/fact_indicadores.sql
---

# Resumo

Os 4 indicadores individuais do CAPAG (`CAPAG - Endividamento`,
`CAPAG - Poupança Corrente`, `CAPAG - Liquidez`, `CAPAG - Nota Final`)
existem em `fact_indicadores`, mas não têm linha correspondente em
`dim_indicadores` — só o índice agregado (`capag`) tem.

# Problema

Achado durante a validação da Fase 5 (`ISSUE-0006`): qualquer consulta que
junte `fact_indicadores` a `dim_indicadores` filtrando por esses 4
indicadores individuais retorna um join órfão (sem nome/descrição/eixo).

# Objetivo

Decidir e implementar: incluir os 4 componentes em `dim_indicadores` (com
nome/descrição própria) ou documentar explicitamente que só o agregado é
"navegável" via dimensão, e os componentes são dado de suporte interno.

# O que falta fazer

- [ ] Decidir se os 4 componentes devem ser navegáveis/exibidos
      individualmente no frontend ou se são só insumo do agregado.
- [ ] Se sim: adicionar as 4 linhas em `sql/gold/dim_indicadores.sql`
      (nome, descrição, eixo, fonte).
- [ ] Se não: documentar a decisão para não ser "redescoberta" como bug a
      cada nova validação.

# Observações

Nenhuma decisão tomada ainda — issue puramente de levantamento até este
ponto.

# Log de execução

- 2026-06-22: achado durante a validação da Fase 5 (`ISSUE-0006`),
  registrado como decisão aberta, ainda não endereçado.
