# Arquitetura — Observatudo (estado alvo pós-refatoração)

> Este documento descreve a arquitetura **alvo**, com as escolhas técnicas e o
> racional por trás delas. Para o plano de migração (o que ainda falta fazer),
> veja [`AI_context/REFACTOR_CONTEXT.md`](../AI_context/REFACTOR_CONTEXT.md).
> Para a árvore de pastas completa, veja
> [`docs/monorepo-structure.md`](./monorepo-structure.md). Para detalhes de
> ferramentas externas, veja [`docs/external/`](./external/).

## Visão geral

O Observatudo passa a ser um **monorepo pnpm** com três apps:

```
observatudo-bq/
├── apps/
│   ├── frontend/            # Next.js (atual src/, public/, etc.)
│   ├── datawarehouse/       # Pipelines Python (uv) + SQL + DVC
│   └── api/                 # Cube.js — camada analítica sobre o DW
├── infra/                   # Terraform (GCP) — multi-app, permanece na raiz
├── docs/                    # Este diretório
├── AI_context/              # Instruções para IA escrever issues de migração
├── pnpm-workspace.yaml
├── turbo.json
└── package.json             # root, scripts orquestradores
```

Hoje o repositório é um único app Next.js na raiz, com pastas auxiliares
(`observatudo/`, `scripts/`, `dbt/`, `dados/`) soltas ao lado dele. A
refatoração junta "produto" (frontend), "dados" (DW) e "API analítica"
(Cube.js) em `apps/`. pnpm só gerencia pacotes JS/TS nativamente; o app
Python (`datawarehouse`) entra no workspace com um `package.json` mínimo que
apenas expõe scripts (`dev`, `lint`, `test`) que chamam `uv run ...` por
baixo — o `uv` continua sendo a fonte de verdade da dependência Python.
Orquestração entre os três (`build`/`lint`/`test`) usa Turborepo, já que ele
só executa scripts de `package.json` e portanto é agnóstico de linguagem.
`packages/` compartilhado **não existe ainda** — só será criado se/quando
duplicação real de código TS aparecer entre `frontend` e `api`.

## Componentes

### 1. `apps/frontend` — Next.js

- Mantém a stack atual (Next.js 15, React 19, Zustand, Firebase Auth, Tailwind).
- Hoje consome o BigQuery **diretamente** via `src/lib/analytics/client.ts` +
  rotas `src/app/api/indicadores/*`. Esse acesso direto é o que a camada de
  API do DW (ver item 3) deve substituir gradualmente, para que o frontend
  pare de conhecer detalhes de BigQuery (dataset, schema, SQL) e passe a
  consumir uma API semântica.
- Migração de gerenciador de pacotes: `yarn`/`npm` → `pnpm`.

### 2. `apps/datawarehouse` — Dados e pipelines

Substitui o que hoje está espalhado em `observatudo/`, `scripts/`, `dados/` e
`dbt/`. Responsável por:

- **Ingestão/transformação em Python (uv)** (ex.: `transformers/capag.py`,
  `transformers/cidades_sustentaveis.py`) — mantido, é o que já funciona bem.
- **Versionamento de datasets com DVC** (ver
  [`docs/external/dvc.md`](./external/dvc.md)), escopado dentro deste app
  (`.dvc/` vive em `apps/datawarehouse`, não na raiz) — substitui os uploads
  manuais feitos hoje em `observatudo/io_utils.py::upload_to_bucket`.
- **Modelagem do BigQuery em dois datasets** (ver racional abaixo), com as
  tabelas que hoje são geradas por dbt escritas como SQL simples + script
  Python de apply, **sem dbt**.
- **API de metadados do DW** (`src/observatudo/api/`, FastAPI) — placeholder
  desde já, ver "Limites do Cube.js" abaixo.

#### Dois datasets BigQuery: `core` e `ops`

O dataset atual (`dados`, ver `infra/bigquery.tf`) é dividido em dois, porque
servem a propósitos diferentes:

- **`core`** (nome provisório) — dados analíticos de produto: `dim_indicadores`,
  `fact_indicadores`, `dim_localidades`. É o que o frontend mostra; é o que o
  Cube.js expõe como cubos/medidas/dimensões.
- **`ops`** — metadados *sobre o próprio DW*: execução de pipelines,
  freshness por fonte, linhagem, resultados de validação de qualidade. É
  observabilidade do pipeline, não dado de produto. Misturar os dois no
  mesmo dataset poluiria o catálogo semântico que o Cube.js expõe ao
  frontend (não se quer um cubo `pipeline_run_log` ao lado de
  `fact_indicadores`).

`ops` **não** é exposto via Cube.js — tem API própria (ver seção 3.1), para
não misturar "registro/status de pipeline" com o modelo dimensional do
Cube, pensado para medidas agregáveis.

### 3. Camada de API analítica — `apps/api` (Cube.js)

O objetivo é parar de expor BigQuery cru para o frontend e ter uma camada
semântica (medidas, dimensões, joins) reutilizável sobre o dataset `core`.
O candidato natural, já citado na visão futura do README original, é o
**Cube.js**, e ele já entra como app real no monorepo (schema dos cubos
versionado), não como placeholder — só a **decisão de deploy** (self-hosted
vs. Cube Cloud) é que continua aberta. Detalhes em
[`docs/external/cubejs.md`](./external/cubejs.md).

#### 3.1. Limites do Cube.js — e a API de metadados do `ops`

Cube.js é uma camada **analítica e somente-leitura**: ele converte
medidas/dimensões em SQL e devolve resultados agregados. Ele não faz
mutações nem dispara ações (ex.: "reprocessar esta fonte", "marcar este job
como revisado"), e metadado de pipeline (status, freshness, linhagem) é mais
"registro estruturado" do que "medida agregável" — não é o ponto forte do
modelo dimensional do Cube.

Por isso o dataset `ops` é exposto por uma API **própria**, dedicada, em vez
de virar mais cubos no Cube.js: `src/observatudo/api/` (FastAPI), dentro de
`apps/datawarehouse` — não um app/workspace novo, só um módulo do mesmo
projeto Python, chamando as funções do pipeline direto em processo, sem
contrato de rede entre "API" e "pipeline" (ver árvore em
[`docs/monorepo-structure.md`](./monorepo-structure.md)). Ela já entra como
**placeholder real** (esqueleto com health-check, sem lógica de negócio
ainda) — escopo inicial é só leitura; quando crescer para suportar ações,
isso reaproveita a mesma API em vez de exigir redesenho.

### 4. Infraestrutura (Terraform)

Permanece em `infra/` na raiz (não é um "app", é infraestrutura compartilhada
entre frontend, DW e API: bucket GCS, datasets BigQuery, IAM, DNS). Passa a
provisionar também o que for necessário para o remote do DVC (mesmo bucket
ou um bucket dedicado — decisão em issue) e, se o Cube.js for self-hosted,
o serviço correspondente (ex.: Cloud Run).

## Decisões técnicas e racional

| Decisão | Racional |
|---|---|
| pnpm workspaces em vez de yarn/npm | Padronizar monorepo com instalação rápida, hoisting controlado e suporte nativo a múltiplos `apps/*` com dependências independentes. |
| Python (uv) embrulhado em `package.json` dentro do workspace pnpm | pnpm só entende pacotes JS/TS; o `package.json` do `apps/datawarehouse` existe só como interface de scripts (`dev`/`lint`/`test` chamando `uv run ...`), para que o app Python seja orquestrável junto dos demais sem duplicar gestão de dependência — `uv` continua sendo a fonte de verdade. |
| Turborepo para orquestração | Com 3 apps poliglotas compartilhando os mesmos nomes de script, Turborepo dá cache e grafo de tarefas executando os próprios scripts de `package.json` (agnóstico de linguagem), o que paga a complexidade extra dado que lint/test do Python e build do Next são as tarefas mais lentas do repo. |
| Abandonar dbt | Hoje o dbt só materializa alguns `dim_*`/`fact_*` simples; a camada de transformação real já vive em Python (`observatudo/transformers`). Manter dbt em paralelo é overhead de ferramenta sem ganho proporcional no estágio atual do projeto. |
| Adotar DVC para datasets, escopado em `apps/datawarehouse` | Os arquivos de dados (`dados/*.csv`, exports intermediários) precisam ser versionados e auditáveis sem inchar o Git. DVC trackeia os ponteiros no Git e mantém o conteúdo em um bucket GCS (remote). Escopar `.dvc/` dentro do app (não na raiz) mantém a mesma fronteira de contenção usada para o Python. |
| Dois datasets BigQuery: `core` (analítico) e `ops` (metadados do DW) | Dados de produto (indicadores) e observabilidade do pipeline têm consumidores e ciclos de vida diferentes; misturá-los no mesmo dataset poluiria o catálogo semântico exposto pelo Cube.js. |
| Cube.js como `apps/api`, scaffold real (não placeholder) | Evita reimplementar manualmente SQL/agregações em cada rota Next.js; dá um modelo semântico (medidas/dimensões) reutilizável. Como Cube.js (JS) e o DW (Python) só se relacionam via contrato de dados (tabelas do dataset `core`), o schema dos cubos não depende da decisão de deploy ainda aberta — por isso já pode existir como app real. |
| `ops` ganha API própria (FastAPI, dentro do `datawarehouse`) em vez de cubos no Cube.js | Cube.js é somente-leitura e dimensional por design; metadado de pipeline é mais registro/status do que medida agregável. Manter leitura (hoje) e ação (futuro) numa única superfície evita fragmentar metadados do DW entre dois sistemas. Entra já como placeholder real, não só ideia. |

## O que este documento **não** decide

- Nome final do dataset `core` (e confirmação de que `ops` fica só com
  metadados do pipeline).
- Se o Cube.js será self-hosted (Cloud Run/Docker) ou Cube Cloud.
- Conteúdo real da API de metadados do `ops` (seção 3.1) além do
  placeholder — e quando ela ganha endpoints de ação/mutação.
- Estrutura exata de `packages/` compartilhados entre frontend e API, se um
  dia for necessária.
- Se o domínio dos dados de IBGE/localidades entra no DW ou continua como
  asset estático do frontend (`src/data/localidades_dropdown.json`).

Essas lacunas devem ser resolvidas via issues — ver
[`AI_context/REFACTOR_CONTEXT.md`](../AI_context/REFACTOR_CONTEXT.md) e
[`AI_context/ISSUE_GUIDELINES.md`](../AI_context/ISSUE_GUIDELINES.md).
