---
id: ISSUE-0001
title: Fase 1 — Setup do monorepo pnpm
status: consolidated
priority: high
type: refactor
owner: agent
created_at: 2026-06-19
updated_at: 2026-06-19
tags:
  - monorepo
  - frontend
  - refactor
related_files:
  - pnpm-workspace.yaml
  - turbo.json
  - package.json
  - apps/frontend/next.config.ts
  - apps/frontend/Dockerfile
  - .github/workflows/build-and-deploy.yml
---

# Resumo

Primeira fase da migração do repositório single-app (Next.js na raiz) para
um monorepo pnpm com workspaces. Next.js movido para `apps/frontend`,
preparando o terreno para os apps `datawarehouse` e `api` que viriam nas
fases seguintes.

# Problema

Repositório era um único app Next.js na raiz, usando yarn/npm, sem
estrutura para acomodar o pipeline de dados (Python) e a futura API
analítica (Cube.js) como apps de primeira classe no mesmo repositório.

# Objetivo

`pnpm-workspace.yaml` + `turbo.json` + `package.json` raiz criados;
Next.js movido para `apps/frontend` sem perder histórico de commits.

# O que foi feito

- `pnpm-workspace.yaml`, `turbo.json` e `package.json` raiz criados.
- Next.js movido para `apps/frontend` via `git mv` (histórico preservado).
- `yarn.lock` removido, substituído por `pnpm-lock.yaml`.
- `next.config.ts` ganhou `output: "standalone"` — necessário pro Docker
  funcionar bem dentro do monorepo pnpm (evita lidar com symlinks do pnpm
  store na imagem final).
- `Dockerfile` movido para `apps/frontend/Dockerfile`, reescrito para pnpm
  + build context na raiz (`docker build -f apps/frontend/Dockerfile .`).
- `.github/workflows/build-and-deploy.yml` atualizado de acordo.
- `@dnd-kit/utilities` (dependência fantasma, usada no código mas nunca
  declarada — funcionava por hoisting frouxo do yarn) adicionada como
  dependência direta — pnpm não permite hoisting implícito.
- `.gitignore` generalizado para padrões de monorepo (`node_modules`,
  `.next/` etc. sem âncora `/` na raiz) e novo padrão `fallback-*.js`
  (artefato do `next-pwa` que ainda não estava coberto).

# Decisões tomadas

- `civ/`/`dw/` (pastas vazias, rascunho pré-migração) não foram
  reaproveitadas como nomes finais de app.

# Critérios de aceite

- [x] `pnpm install` resolve dependências dos workspaces.
- [x] `pnpm --filter frontend build` passa.
- [x] `pnpm --filter frontend dev` responde HTTP 200.
- [x] Build/run via Docker responde HTTP 200.
- [x] Histórico de commits do Next.js preservado (`git mv`, não copy).

# Observações

Branch de trabalho: `refactor/01-pnpm-monorepo-setup`.

# Log de execução

- 2026-06-19: monorepo pnpm criado, Next.js movido para `apps/frontend`,
  validado de ponta a ponta (`pnpm install`, build, dev, Docker).
