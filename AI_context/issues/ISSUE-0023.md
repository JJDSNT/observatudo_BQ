---
id: ISSUE-0023
title: "Avaliar snapshot estático vs renderização dinâmica para /world"
status: backlog
priority: low
type: research
owner: agent
created_at: 2026-06-23
updated_at: 2026-06-23
tags:
  - frontend
  - infra
related_files:
  - apps/frontend/src/app/world/page.tsx
  - apps/frontend/src/lib/cubejs/client.ts
  - apps/api/model/cubes/fact_indicadores.js
  - .github/workflows/build-and-deploy.yml
  - apps/frontend/Dockerfile
---

# Resumo

`/world` (`ISSUE-0019`/`ISSUE-0021`) ficou marcada como
`export const dynamic = "force-dynamic"` pra destravar o build (Next
tentava pré-renderizar a página no build, quando `CUBEJS_API_SECRET`
ainda não existe — só é injetado no deploy, nunca no build, de propósito,
ver `.github/workflows/build-and-deploy.yml`). Essa correção resolve o
build, mas força toda visita à `/world` a refazer a query completa contra
o Cube.js/BigQuery — vale avaliar se um snapshot (estático com
revalidação periódica) seria melhor, dado que os dados internacionais só
mudam quando o pipeline do World Bank roda de novo (não a cada request).

# Problema

Hoje (force-dynamic): cada request HTTP pra `/world` chama
`buscarIndicadoresMundiais()` + `buscarSerieHistoricaMundial()`, que por
sua vez fazem 2 queries Cube.js (~40k linhas na série histórica) contra o
BigQuery via Cloud Run. Sem pré-agregação nem `refreshKey` customizado em
nenhum cubo (`apps/api/model/cubes/*.js`) — confirmado, nada configurado
além do schema básico —, então cada visita paga o custo cheio de query no
BigQuery (mais o cold start do serviço Cube.js no Cloud Run, se estiver
parado).

Os dados em si (World Bank: PIB per capita, expectativa de vida,
população) são atualizados pelo pipeline manualmente/esporadicamente
(não há cron ainda — ver pendência separada se houver), então não há
necessidade real de dado "ao segundo" — um snapshot com revalidação de
algumas horas (ISR do Next, `export const revalidate = N`) entregaria a
mesma informação prática com muito menos custo de query.

# Objetivo

Decidir conscientemente entre:
(a) manter `force-dynamic` (sempre fresco, custo de query a cada visita);
(b) trocar por ISR (`revalidate = N segundos/horas`, ou revalidação
on-demand disparada ao final do pipeline) — mais barato, com staleness
limitada e configurável;
(c) outra estratégia (ex.: cache na própria função `mundo.ts` com TTL,
independente do mecanismo de cache do Next).

# O que falta fazer

- [ ] Medir o custo real de uma chamada a `buscarSerieHistoricaMundial()`
      (latência, bytes processados no BigQuery) pra ter números concretos
      na decisão, não só intuição.
- [ ] Avaliar se `export const revalidate = N` funciona de fato sem cair
      no mesmo problema de pré-renderização-no-build que motivou o
      `force-dynamic` (ISR ainda pode tentar gerar a página no build
      dependendo da config — testar antes de assumir que resolve).
- [ ] Se for pra ISR, decidir o N (ex.: revalidar a cada 6h? 24h?) ou se
      vale revalidação on-demand disparada pelo pipeline
      (`scripts/run_pipeline.py`) via `revalidatePath`/webhook ao
      terminar uma carga nova de `world_bank`.
- [ ] Decidir se a resposta vale só para `/world` ou se aplica ao padrão
      geral de páginas que consultam Cube.js direto num Server Component
      (hoje `/world` é a única; o resto do dashboard usa rotas
      `/api/indicadores/*` + SWR no client, um padrão de cache diferente
      que não foi tocado aqui).

# Decisões tomadas

Nenhuma ainda — `force-dynamic` foi a correção mínima pra destravar o
build, não uma decisão deliberada de arquitetura de cache.

# Critérios de aceite

- [ ] Decisão registrada (manter force-dynamic, adotar ISR, ou outra
      estratégia) com a justificativa de custo/freshness por trás.

# Observações

Ver `ISSUE-0019`/`ISSUE-0021` para o contexto de onde `/world` e suas
queries vieram. O Cube.js já tem suporte nativo a pré-agregações
(`preAggregations` no schema do cubo) que reduziria o custo por query
independente da escolha entre estático/dinâmico no Next — vale considerar
junto, não como alternativa excludente.

# Log de execução

(ainda não iniciada)
