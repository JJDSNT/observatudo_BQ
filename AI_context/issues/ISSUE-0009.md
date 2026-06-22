---
id: ISSUE-0009
title: Fase 7 — Limpeza pós-migração
status: backlog
priority: low
type: refactor
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - monorepo
  - infra
  - refactor
related_files:
  -
---

# Resumo

Última fase do roadmap original de migração (`REFACTOR_CONTEXT.md`,
histórico em `consolidated/0000-historico.md`): remover código/infra
órfã do estado anterior à migração. Ainda não iniciada.

# Problema

Depois de 6 fases de migração (monorepo, `apps/datawarehouse`, camadas
BigQuery, DVC, Cube.js, migração do frontend), é esperado que tenha
sobrado código, configuração ou recursos de infra do estado anterior que
não foram explicitamente removidos por estarem fora do escopo de cada
fase individual.

# Objetivo

Levantar e remover: rotas de API já substituídas (verificar se sobrou
algo além do que já foi limpo em `ISSUE-0007`), o dataset BigQuery antigo
`dados` (se ainda existir), e qualquer outro resíduo identificado.

# O que foi feito

Nada ainda — issue não iniciada.

# O que falta fazer

- [ ] Confirmar se o dataset BigQuery `dados` (substituído por
      `raw`/`silver`/`gold`/`ops` na Fase 3, `ISSUE-0003`) ainda existe;
      se sim, decidir entre arquivar ou remover.
- [ ] Varrer o repositório por imports/referências mortas que sobraram de
      antes da migração (além do que já foi removido na Fase 6).
- [ ] Verificar IAM/service accounts não cobertas pelas limpezas já
      feitas em `ISSUE-0003` (SA `dbt`) e `ISSUE-0007` (IAM de BigQuery
      do frontend).
- [ ] Revisar `docs/` por referências desatualizadas ao estado anterior à
      migração.

# Decisões tomadas

Nenhuma ainda.

# Critérios de aceite

- [ ] Nenhuma referência viva (código, IAM, Terraform) ao estado anterior
      à migração permanece sem justificativa documentada.

# Observações

Depende de `ISSUE-0007` estar de fato concluída (sai de `review` para
`done`/`consolidated`) antes de assumir que toda limpeza de frontend já
foi feita.

# Log de execução

(ainda não iniciada)
