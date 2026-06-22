---
id: ISSUE-0019
title: "Indicadores internacionais"
status: backlog
priority: high
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - localidades
  - dw
  - frontend
  - feature
related_files:
  - apps/datawarehouse/src/observatudo/localidades.py
  - apps/datawarehouse/data/ibge/localidades/pais.csv
  - apps/datawarehouse/sql/gold/fact_indicadores.sql
  - apps/api/model/cubes/dim_localidades.js
---

# Resumo

Adicionar suporte a indicadores de outros países, hoje inexistente —
greenfield total (confirmado em investigação anterior: zero scaffolding
para "internacional"/"country"/ISO 3166 em todo o repositório).

# Problema

Hoje `dim_localidades` só tem o Brasil (`pais.csv` com uma única linha) e
todo o pipeline de dados (`raw`/`silver`/`gold`) assume implicitamente
fonte brasileira (IBGE) em todo lugar que lida com localidade. Não existe
hoje nenhum dataset, transformer nem convenção para ingerir indicador de
outro país.

# Objetivo

Primeiro indicador internacional real (de uma fonte concreta a definir)
passando pelo pipeline `raw → silver → gold`, aparecendo no dashboard,
usando o mesmo padrão de resolução de `localidade_id` formalizado em
`ISSUE-0008`.

# O que falta fazer

- [ ] Escolher a primeira fonte de dado internacional real (não
      hipotética) para guiar o desenho — formato de indicador, frequência,
      nível de granularidade (país? subdivisão?).
- [ ] Estender `pais.csv`/`dim_localidades` com os países relevantes
      (código ISO 3166-1 alpha-2 como `codigo_iso`, mesmo padrão já usado
      para o Brasil).
- [ ] Implementar `resolver_pais_por_iso`/`resolver_subdivisao_por_iso`
      em `observatudo/localidades.py` (interface já preparada para isso
      em `ISSUE-0008` — convive com os resolvers IBGE existentes, não os
      substitui).
- [ ] Decidir se o indicador internacional entra como fonte nova em
      `fact_indicadores.sql` (`UNION ALL`) ou como dataset/tabela própria.
- [ ] Validar que o dashboard exibe o indicador no nível país (e
      subdivisão, se aplicável) sem quebrar a exibição de indicadores
      só-brasileiros.

# Decisões tomadas

Nenhuma ainda — esta issue é o ponto de partida da investigação/desenho,
não uma implementação já decidida.

# Critérios de aceite

- [ ] Pelo menos 1 indicador internacional real visível no dashboard,
      com fonte e localidade corretas.
- [ ] `localidade_id` do(s) país(es) novo(s) segue o mesmo padrão ISO já
      usado para o Brasil (`codigo_iso` populado, `codigo_ibge` nulo).

# Observações

Ver `ISSUE-0008` para o desenho do resolver de `localidade_id` que esta
issue deve estender, e a nota explícita ali de que o padrão Brasil/IBGE e
o padrão internacional/ISO coexistem na mesma interface.

# Log de execução

(ainda não iniciada)
