---
id: ISSUE-0002
title: Fase 2 — Criar apps/datawarehouse
status: consolidated
priority: high
type: refactor
owner: agent
created_at: 2026-06-19
updated_at: 2026-06-19
tags:
  - monorepo
  - dw
  - refactor
related_files:
  - apps/datawarehouse/pyproject.toml
  - apps/datawarehouse/package.json
  - apps/datawarehouse/src/observatudo/api/main.py
  - apps/datawarehouse/src/observatudo/config.py
---

# Resumo

`observatudo/` (lib Python), `scripts/` (entrypoints) e `dados/`
(datasets) movidos para `apps/datawarehouse`, com `requirements.txt`
convertido para `pyproject.toml`/`uv.lock` (gerenciado por `uv`) e um
placeholder de API (FastAPI) para metadados do pipeline.

# Problema

Pipeline de dados em Python vivia solto na raiz do repositório
(`observatudo/`, `scripts/`, `dados/`), sem integração com o workspace
pnpm nem padronização de dependências (`requirements.txt` sem lock real).

# Objetivo

Python como app de primeira classe do monorepo (`apps/datawarehouse`),
orquestrável via Turborepo, com dependências geridas por `uv` e um
placeholder de API própria para o futuro dataset `ops`.

# O que foi feito

- `observatudo/` → `apps/datawarehouse/src/observatudo`, `scripts/` →
  `apps/datawarehouse/scripts`, `dados/` → `apps/datawarehouse/data`
  (`git mv`, histórico preservado).
- `requirements.txt` convertido para `pyproject.toml` + `uv.lock`
  (dependências diretas inferidas dos imports reais do código, não do
  freeze completo — o freeze antigo incluía toda a árvore de deps do dbt).
- Placeholder de `src/observatudo/api/` (FastAPI) criado: `GET /health`
  (200) e `GET /pipelines/` (501, TODO até o dataset `ops` existir).
- Pastas vazias `civ/`/`dw/` (rascunho pré-migração, nunca rastreadas pelo
  git) removidas.
- Caminhos relativos hardcoded (`"dados/..."` em `config.py`, `capag.py`,
  `carregar_localidades_ibge.py`) atualizados para `"data/..."`.
- `scripts/gerar_dropdown_json.py`: path do output corrigido para
  `../frontend/src/data/localidades_dropdown.json` (escopo cruzado
  dw→frontend pré-existente, só ajustado o path, não redesenhado).
- `sys.path.append` manual nos scripts de entrypoint (workaround para
  achar o pacote `observatudo` sem instalação) removido — redundante com
  `uv`, que instala o pacote em modo editável.
- `.env.example` separado em `apps/frontend/.env.example`
  (BigQuery/Firebase) e `apps/datawarehouse/.env.example`
  (Ollama/log/bucket) — antes misturava as duas.
- `package.json` raiz ganhou `"packageManager"` para o Turborepo resolver
  os workspaces pnpm.

# Decisões tomadas

- `DATASET = "dados"` em `config.py`/`capag.py`/`carregar_localidades_ibge.py`
  é o **nome do dataset BigQuery**, não um path — não foi tocado nesta
  fase (mudou só na Fase 3, ver `ISSUE-0003`).
- `package.json` do `datawarehouse` não ganhou script `dev` (não há
  "servidor de dev" equivalente para um pipeline batch) nem `test` (ainda
  não havia testes reais — `uv run pytest` falha com exit 5 sem testes
  coletados, quebraria `turbo run test`; reintroduzir quando houvesse
  testes reais, o que aconteceu na Fase 3).

# Critérios de aceite

- [x] `uv sync` funciona.
- [x] Leitura real dos arquivos de dados movidos (capag estados/municípios,
      indicadores cidades-sustentáveis) com os novos paths.
- [x] `ruff check` limpo.
- [x] API placeholder responde via `uvicorn`.
- [x] `pnpm --filter datawarehouse lint` e `pnpm lint`/`pnpm build`
      (turbo) rodam frontend + datawarehouse juntos.

# Observações

Branch de trabalho: `refactor/02-datawarehouse-app`.
`dbt/` e o `.venv` antigo da raiz ficaram intocados nesta fase (escopo da
Fase 3) — o `.venv` da raiz ficou órfão (sem `requirements.txt` pra
regenerá-lo), mas funcional até a Fase 3 remover o dbt de fato.

# Log de execução

- 2026-06-19: `apps/datawarehouse` criado, dependências convertidas pra
  `uv`, placeholder de API criado, validado de ponta a ponta.
