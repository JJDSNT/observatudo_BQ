# Fase 1 — Setup do monorepo pnpm

Repositório single-app (Next.js na raiz) migrado para monorepo pnpm com
workspaces, abrindo espaço para os apps `datawarehouse` e `api` das fases
seguintes. Esta issue foi promovida (ver `README.md`) — o log de
execução dia a dia e os critérios de aceite originais ficam recuperáveis
no histórico do git (`git log -p -- AI_context/issues/ISSUE-0001.md`),
não neste arquivo.

# Motivação

Código TS/JS do frontend e Python do data warehouse cresceriam em
paralelo; um monorepo com workspaces dá um ponto único de instalação/CI
sem forçar acoplamento entre eles.

# Solução adotada

`pnpm-workspace.yaml` + `turbo.json` + `package.json` raiz criados;
Next.js movido para `apps/frontend` via `git mv` (histórico preservado);
`yarn.lock` substituído por `pnpm-lock.yaml`; Dockerfile e CI ajustados
para o novo layout.

# Arquivos alterados

`pnpm-workspace.yaml`, `turbo.json`, `package.json` (raiz),
`apps/frontend/*` (movido), `apps/frontend/next.config.ts`,
`apps/frontend/Dockerfile`, `.github/workflows/build-and-deploy.yml`,
`.gitignore`.

# Impacto arquitetural

Estabelece o padrão `apps/<nome>` para todo o resto da migração — as
fases seguintes (`ISSUE-0002` em diante) constroem sobre essa estrutura.

# Documentações atualizadas

`docs/monorepo-structure.md` (decisões de pasta fechadas nesta época).

# Próximos passos

Nenhum — fase concluída e validada de ponta a ponta (`pnpm install`,
build, dev, Docker).
