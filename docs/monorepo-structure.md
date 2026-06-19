# Estrutura de arquivos alvo — monorepo pnpm

> Este documento é o desenho concreto de pastas/arquivos para a migração.
> Decisões aqui já estão fechadas (ver `AI_context/REFACTOR_CONTEXT.md` para
> o que ainda está aberto). Complementa
> [`docs/architecture.md`](./architecture.md), que explica o "porquê" em
> nível mais alto — aqui é o "onde fica cada arquivo".

## Árvore alvo

```
observatudo-bq/
├── apps/
│   ├── frontend/                      # Next.js — pnpm workspace member
│   │   ├── src/                       # = src/ atual, sem mudança de conteúdo
│   │   ├── public/                    # = public/ atual
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.mjs
│   │   └── eslint.config.mjs
│   │
│   ├── datawarehouse/                 # Python (uv) — pnpm workspace member
│   │   ├── package.json               # interface de scripts p/ pnpm/turbo chamarem uv
│   │   ├── pyproject.toml             # deps geridas por uv (substitui requirements.txt)
│   │   ├── uv.lock
│   │   ├── src/
│   │   │   └── observatudo/           # = observatudo/ atual (lib), sem dbt
│   │   │       ├── transformers/
│   │   │       ├── io_utils.py
│   │   │       ├── config.py
│   │   │       ├── llm.py
│   │   │       ├── api/               # ★ placeholder — API de metadados do `ops`
│   │   │       │   ├── __init__.py
│   │   │       │   ├── main.py        #   FastAPI app, importa direto as funções do pipeline
│   │   │       │   └── routers/
│   │   │       │       └── pipelines.py  # GET de status/freshness/linhagem (só leitura por ora)
│   │   │       └── ...
│   │   ├── scripts/                   # = scripts/ atual (entrypoints finos)
│   │   ├── sql/                       # substitui dbt/observatudo/models
│   │   │   ├── staging/               # stg_capag.sql, stg_cidades_sustentaveis.sql
│   │   │   ├── intermediate/          # int_capag.sql
│   │   │   ├── dims/                  # dim_indicadores.sql, dim_localidades.sql
│   │   │   └── facts/                 # fact_indicadores.sql
│   │   ├── data/                      # = dados/ atual — agora trackeado via DVC
│   │   │   ├── cidades-sustentaveis/
│   │   │   ├── ibge/
│   │   │   └── tesouro-nacional/
│   │   ├── .dvc/                      # DVC inicializado AQUI, não na raiz
│   │   ├── .dvcignore
│   │   └── tests/
│   │
│   └── api/                           # Cube.js — pnpm workspace member (scaffold real)
│       ├── package.json
│       ├── cube.js                    # config de conexão BigQuery
│       ├── model/
│       │   ├── cubes/                 # 1 cubo por fact/dim do dataset `core`
│       │   └── views/                 # views compostas p/ o frontend consumir
│       ├── Dockerfile                 # caminho self-hosted (deploy ainda em aberto)
│       └── .env.example
│
├── infra/                             # Terraform — inalterado, fora dos workspaces
├── docs/
├── AI_context/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                       # raiz, orquestrador
└── .gitignore
```

`packages/` **não é criado nesta fase** — não há ainda código TS duplicado
entre `frontend` e `api` que justifique extração. Se isso aparecer
(ex.: tipos compartilhados do schema do Cube.js), criar `packages/contracts`
como issue própria, não preventivamente.

## Por que cada peça é assim

### `apps/datawarehouse` é um workspace pnpm mesmo sendo Python

pnpm só entende pacotes com `package.json`. Para que o repo inteiro seja
orquestrável por um comando único (`pnpm -r run lint`, `turbo run test`),
`apps/datawarehouse` recebe um `package.json` mínimo cujos scripts apenas
chamam `uv run ...`. O `uv` continua sendo a fonte de verdade da dependência
Python (`pyproject.toml` + `uv.lock` ficam dentro dessa pasta, não na raiz do
monorepo) — o `package.json` aqui é só uma interface, não duplica gestão de
dependência:

```json
{
  "name": "datawarehouse",
  "private": true,
  "scripts": {
    "dev": "uv run python -m observatudo",
    "lint": "uv run ruff check .",
    "format": "uv run ruff format .",
    "test": "uv run pytest",
    "serve": "uv run fastapi run src/observatudo/api/main.py",
    "dvc:pull": "uv run dvc pull",
    "dvc:push": "uv run dvc push"
  }
}
```

`dvc` entra como dependência de dev do `uv` (`uv add --dev dvc dvc-gs`), para
não exigir mais uma instalação global. `fastapi`/`uvicorn` entram como
dependência normal quando o placeholder de `src/observatudo/api/` for além
de um esqueleto (ver seção abaixo).

### `src/observatudo/api/` — placeholder da API de metadados (`ops`)

Decisão: metadados do DW (status de pipeline, freshness, linhagem) ganham
uma API **dedicada dentro do `datawarehouse`**, em vez de virar mais cubos no
Cube.js. Dois motivos: (1) esse tipo de dado é mais "registro/status
estruturado" do que "medida agregável" — não é o ponto forte do modelo
dimensional do Cube; (2) já se sabe que essa API deve crescer para suportar
ações/mutações no futuro (ex.: disparar reprocessamento), então é melhor ter
uma única superfície (leitura hoje, ação depois) do que fragmentar
metadados do DW entre dois sistemas.

Por viver dentro do mesmo projeto `uv`, a API chama as funções do pipeline
**direto em processo** (sem contrato de rede entre "API" e "pipeline" — é o
mesmo código Python, só com uma porta HTTP na frente). Por isso não é um
app/workspace novo, é só mais um módulo em `src/observatudo/`.

Estado inicial (placeholder): só esqueleto, sem lógica real ainda —
`main.py` cria a app FastAPI com um endpoint de health-check; o router de
`pipelines.py` fica vazio/com um TODO até o dataset `ops` existir de fato.
Não há mutação implementada — escopo inicial é **somente leitura**.

### `apps/api` (Cube.js) é scaffold real, não placeholder

Como você apontou: Cube.js é JS e o DW é Python — não há import de código
entre eles, só um **contrato de dados** (as tabelas que `apps/datawarehouse`
materializa no dataset `ops` do BigQuery). Por isso `apps/api` já nasce como
um projeto Cube.js funcional (schema dos cubos mapeando as tabelas
`dim_*`/`fact_*`), mesmo com a decisão de **deploy** (self-host vs. Cube
Cloud) ainda aberta — o schema em si não depende dessa decisão. Isso evita
reabrir a estrutura de pastas quando o deploy for decidido.

### DVC escopado em `apps/datawarehouse`, não na raiz

Mesmo princípio do Python: o DVC trackeia `data/`, que só existe dentro de
`apps/datawarehouse`. Inicializar o DVC ali (`cd apps/datawarehouse && dvc
init`) mantém a fronteira clara — o restante do monorepo (frontend, api) não
tem nenhuma relação com DVC. DVC suporta normalmente ser inicializado num
subdiretório de um repo Git maior.

### Turborepo na orquestração raiz

Com 3 apps poliglotas (TS, Python via wrapper, TS) compartilhando os mesmos
nomes de script (`dev`, `build`, `lint`, `test`), Turborepo dá cache e grafo
de tarefas "de graça" — ele só executa scripts de `package.json`, então é
agnóstico de linguagem (chamar `uv run pytest` via Turbo funciona igual a
chamar `next build`). Para 2-3 apps isso ainda seria dispensável com `pnpm
-r`, mas como `lint`/`test` do Python e `build` do Next são as tarefas mais
lentas do repo, cache de turbo já paga a complexidade extra de manter um
`turbo.json`.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

## `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
```

## `package.json` raiz (orquestrador)

```json
{
  "name": "observatudo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:api": "pnpm --filter api dev",
    "dev:dw": "pnpm --filter datawarehouse dev",
    "dev:ops-api": "pnpm --filter datawarehouse serve",
    "lint": "turbo run lint",
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

## Mapeamento: estado atual → destino

| Hoje | Destino |
|---|---|
| `src/`, `public/`, `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts` | `apps/frontend/` |
| `observatudo/` | `apps/datawarehouse/src/observatudo/` |
| `scripts/` | `apps/datawarehouse/scripts/` |
| `dados/` | `apps/datawarehouse/data/` (passa a ser trackeado por DVC) |
| `requirements.txt` | convertido para `apps/datawarehouse/pyproject.toml` + `uv.lock` |
| `dbt/observatudo/models/staging/*` | `apps/datawarehouse/sql/staging/*.sql` (sem Jinja/config dbt) |
| `dbt/observatudo/models/intermediate/*` | `apps/datawarehouse/sql/intermediate/*.sql` |
| `dbt/observatudo/models/dims/*` | `apps/datawarehouse/sql/dims/*.sql` |
| `dbt/observatudo/models/facts/*` | `apps/datawarehouse/sql/facts/*.sql` |
| `dbt/` (restante: `macros/`, `snapshots/`, `tests/`, `target/`, configs) | removido |
| `civ/`, `dw/` (pastas vazias na raiz) | removidas — eram rascunho, substituídas por `apps/frontend`/`apps/datawarehouse` |
| `infra/` | inalterado, permanece na raiz |
| `docs/`, `AI_context/` | inalterado, permanecem na raiz |
| — | `apps/api/` — novo, Cube.js |

## Coisas que este desenho deliberadamente não resolve agora

- Deploy do `apps/api` (self-host/Cloud Run vs. Cube Cloud) — ver
  `docs/external/cubejs.md`.
- Remote do DVC (bucket reaproveitado vs. dedicado) — ver
  `docs/external/dvc.md`.
- Conteúdo real dos cubos em `apps/api/model/` — depende do dataset `core`
  estar materializado primeiro.
- Conteúdo real de `src/observatudo/api/` — fica só esqueleto até o dataset
  `ops` existir; quando crescer para mutações, vira issue própria.
- `packages/` compartilhados — só se/quando a duplicação aparecer.
