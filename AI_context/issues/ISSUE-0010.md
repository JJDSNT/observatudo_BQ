---
id: ISSUE-0010
title: "Restringir run.invoker do Cube.js (hoje allUsers)"
status: backlog
priority: medium
type: infra
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - infra
  - cubejs
  - segurança
related_files:
  - infra/cubejs.tf
---

# Resumo

O serviço Cloud Run do Cube.js (`ISSUE-0006`) tem `run.invoker` configurado
para `allUsers` — mesmo padrão do frontend, decisão consciente de manter
assim por ora em 2026-06-22.

# Problema

Qualquer requisição chega no container (mesmo que rejeitada depois pelo
`CUBEJS_API_SECRET`), o que tem custo marginal de CPU/requisição por
tentativa não autenticada e expõe superfície a scraping/abuso.

# Objetivo

Restringir o invoker (ex.: só a SA do frontend) quando a autenticação
service-to-service for desenhada de forma mais granular.

# O que falta fazer

- [ ] Desenhar autenticação service-to-service entre frontend e Cube.js
      via IAM (em vez de `allUsers` + secret na aplicação).
- [ ] Avaliar impacto em outros consumidores legítimos do Cube.js, se
      houver algum além do frontend.

# Observações

Não é urgente — é um endurecimento de superfície, não uma vulnerabilidade
ativa conhecida (o `CUBEJS_API_SECRET` já bloqueia uso indevido depois que
a requisição chega).

# Log de execução

(ainda não iniciada)
