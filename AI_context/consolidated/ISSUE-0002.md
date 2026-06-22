# Fase 2 — Criar apps/datawarehouse

Pipeline Python (`observatudo/`, `scripts/`, `dados/`) movido para
`apps/datawarehouse`, com dependências migradas de `requirements.txt`
para `pyproject.toml`/`uv.lock`. Issue promovida — log de execução
completo recuperável via `git log -p -- AI_context/issues/ISSUE-0002.md`.

# Motivação

O pipeline de dados vivia solto na raiz do repositório, sem integração
com o workspace pnpm nem dependências travadas de forma confiável.

# Solução adotada

`git mv` preservando histórico; `requirements.txt` → `pyproject.toml` +
`uv.lock` (dependências diretas inferidas dos imports reais, não do
freeze completo, que incluía a árvore do dbt); placeholder de API
(FastAPI) criado para o futuro dataset `ops`; caminhos relativos
hardcoded corrigidos para o novo layout.

# Arquivos alterados

`apps/datawarehouse/{src,scripts,data}/*` (movidos),
`apps/datawarehouse/pyproject.toml`, `apps/datawarehouse/package.json`,
`apps/datawarehouse/src/observatudo/api/main.py`,
`apps/datawarehouse/.env.example`, `apps/frontend/.env.example`.

# Impacto arquitetural

`apps/datawarehouse` passa a ser um app de primeira classe do monorepo,
orquestrável por Turborepo, mesmo sendo Python — padrão que as fases
seguintes (BigQuery, DVC) constroem em cima.

# Documentações atualizadas

`docs/monorepo-structure.md`.

# Próximos passos

Nenhum — fase concluída e validada (`uv sync`, leitura real dos dados
movidos, `ruff check`, API placeholder respondendo, build/lint do
monorepo). `dbt/` e o `.venv` antigo ficaram intocados de propósito —
removidos na Fase 3 (`ISSUE-0003`).
