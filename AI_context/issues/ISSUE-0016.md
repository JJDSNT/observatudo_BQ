---
id: ISSUE-0016
title: "Decidir destino de packages/ compartilhados entre frontend e API"
status: backlog
priority: low
type: research
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - monorepo
  - research
related_files:
  - pnpm-workspace.yaml
---

# Resumo

Se vier a existir código TypeScript compartilhado entre `apps/frontend` e
`apps/api` (tipos, contratos, utilitários), ainda não foi decidido se isso
vira um `packages/` no monorepo ou outra solução.

# Problema

Nenhuma decisão foi tomada porque ainda não surgiu necessidade real de
compartilhar código entre os dois apps — é um ponto aberto registrado
preventivamente, não um problema atual.

# Objetivo

Decidir só quando a necessidade real aparecer (ex.: um tipo de resposta
da API que o frontend também precisa tipar) — esta issue existe para não
"reinventar a decisão" do zero nesse momento.

# O que falta fazer

- [ ] Aguardar a primeira necessidade real de código compartilhado.
- [ ] Nesse momento, avaliar `packages/` (pnpm workspace) vs. duplicação
      deliberada vs. outra solução (ex.: gerar tipos a partir do schema
      do Cube.js).

# Observações

Nenhuma ação até que a necessidade real apareça — issue de registro, não
de trabalho pendente ativo.

# Log de execução

(sem necessidade real surgida ainda)
