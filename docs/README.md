# Docs

Documentação de arquitetura do Observatudo, mantida como fonte de verdade
sobre **como o sistema é** e **por que** as escolhas técnicas foram feitas.

- [`architecture.md`](./architecture.md) — visão geral da arquitetura alvo
  (monorepo pnpm, frontend, data warehouse, API analítica, infra) e o
  racional de cada decisão técnica.
- [`monorepo-structure.md`](./monorepo-structure.md) — árvore de pastas alvo
  completa, mapeamento do estado atual para o destino, e sketches de
  `pnpm-workspace.yaml`/`turbo.json`/`package.json` de cada app.
- [`external/`](./external/) — aprofundamento em ferramentas externas cuja
  integração com o projeto ainda não é trivial/óbvia:
  - [`external/cubejs.md`](./external/cubejs.md) — proposta de uso do Cube.js
    como camada de API do data warehouse.
  - [`external/dvc.md`](./external/dvc.md) — uso do DVC para versionar
    datasets mantendo o conteúdo em bucket GCS.

Para o plano de migração (o que falta fazer, em que ordem) veja
[`../AI_context/REFACTOR_CONTEXT.md`](../AI_context/REFACTOR_CONTEXT.md).
