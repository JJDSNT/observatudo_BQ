# Contexto da refatoração — Observatudo

> Fonte de verdade sobre **o que está mudando, por quê, e em que ordem**.
> Para "como o sistema funciona" (estado alvo), veja
> [`docs/architecture.md`](../docs/architecture.md). Para a árvore de pastas
> exata, veja [`docs/monorepo-structure.md`](../docs/monorepo-structure.md).

## Objetivo

Transformar o repositório atual (um app Next.js na raiz + scripts Python e
dbt soltos ao lado) em um **monorepo pnpm** com três apps — frontend,
data warehouse e API analítica — abandonando o dbt e adotando DVC para
versionamento de datasets.

## Estado atual (antes da refatoração)

- Repositório single-app: Next.js na raiz (`src/`, `public/`, `package.json`
  usando yarn/npm).
- Pipelines de dados em Python soltos: `observatudo/` (lib),
  `scripts/` (entrypoints), `dados/` (datasets crus versionados direto no
  Git).
- `dbt/observatudo/` com modelos `staging` → `intermediate` → `dims`/`facts`
  para BigQuery.
- `infra/` com Terraform: dataset BigQuery `dados`, bucket GCS
  `*-www-data`, IAM, DNS, Firestore.
- Frontend acessa BigQuery diretamente via `src/lib/analytics/client.ts` e
  expõe isso em rotas próprias (`src/app/api/indicadores/*`).
- Sem DVC, sem Cube.js. Pastas `civ/` e `dw/` existiam vazias no
  repositório, mas eram só rascunho — **não** serão reaproveitadas como
  nomes finais (ver "Decisões já fechadas" abaixo).
- Branch de trabalho atual chama-se `dvc`, mas o DVC ainda **não** foi
  inicializado (sem `.dvc/`, sem `dvc.yaml`) — commits recentes nela são
  sobre suporte a dados da CAPAG (Tesouro Nacional), não sobre a migração.

## Estado alvo

Ver [`docs/architecture.md`](../docs/architecture.md) e
[`docs/monorepo-structure.md`](../docs/monorepo-structure.md) para a
descrição completa. Resumo:

- `apps/frontend` (Next.js, migrado para pnpm).
- `apps/datawarehouse` (Python via `uv`, embrulhado num `package.json`
  mínimo para ser orquestrável pelo workspace pnpm/Turborepo).
- `apps/api` (Cube.js) — app real desde já (schema versionado), só o deploy
  final (self-hosted vs. Cube Cloud) está em aberto.
- **Quatro datasets BigQuery, um por camada do medallion architecture**:
  `raw` (landing, sem transformação), `silver` (limpeza/cast/agregação),
  `gold` (modelo dimensional final — `dim_indicadores`, `fact_indicadores`,
  `dim_localidades`; único dataset que o Cube.js acessa) e `ops`
  (metadados/observabilidade do próprio pipeline e dos dados — ortogonal às
  camadas). Substituem o atual dataset único `dados`. Ver
  `docs/architecture.md` seção 2 para o racional completo.
- Datasets de dados versionados via DVC, escopado dentro de
  `apps/datawarehouse` (não na raiz), conteúdo em bucket GCS, ponteiros no
  Git.
- dbt removido; pipeline `raw → silver → gold` feito com SQL simples
  (`apps/datawarehouse/sql/{silver,gold}/`) + runner Python
  (`apps/datawarehouse/src/observatudo/pipeline/`), substituindo `dbt run`.
- Turborepo para orquestrar `build`/`lint`/`test` entre os 3 apps.

## Decisões já fechadas (não reabrir sem motivo novo)

- `civ/`/`dw/` (pastas vazias) **não** são reaproveitadas — usar
  `apps/frontend`, `apps/datawarehouse`, `apps/api`.
- Python gerenciado por `uv`, mas vivendo dentro de um workspace pnpm
  (`apps/datawarehouse/package.json` só expõe scripts que chamam `uv run`).
- Orquestração entre apps via **Turborepo** (não `pnpm -r` puro) — ver
  racional em `docs/architecture.md`.
- Cube.js já nasce como app real (`apps/api`, schema versionado), não como
  placeholder esperando decisão de deploy.
- Cube.js é escopo **somente leitura/analítico** sobre o dataset `gold`. O
  dataset `ops` (metadados do próprio DW) **não** é exposto via Cube.js —
  tem API própria, dedicada (FastAPI), dentro de
  `apps/datawarehouse/src/observatudo/api/`. Entra como placeholder real
  (esqueleto, escopo inicial só leitura) desde a Fase 2, não como ideia
  futura solta.
- **Datasets separados por camada (`raw`/`silver`/`gold`/`ops`), não
  prefixo de nome de tabela dentro de um dataset só** — para que a
  fronteira de acesso do Cube.js (só `gold`) seja garantida por IAM real,
  não por convenção. Isso funde o que antes eram "Fase 3 (remover dbt)" e
  "Fase 5 (reorganizar BigQuery)" numa fase só (ver roadmap).
- DVC inicializado dentro de `apps/datawarehouse` (não na raiz do monorepo).

## Por que essas mudanças (resumo — detalhes em `docs/architecture.md`)

- **pnpm monorepo**: já há (e vai continuar havendo) código TS/JS do
  frontend, API e Python do DW crescendo em paralelo; juntar num monorepo
  com workspaces dá um ponto único de instalação/CI sem forçar acoplamento.
- **Abandonar dbt**: avaliado como ferramenta desproporcional ao tamanho
  atual dos modelos (`stg_capag`, `stg_cidades_sustentaveis`,
  `int_capag`, `dim_indicadores`, `fact_indicadores` — poucos modelos,
  pouca complexidade de DAG) frente ao custo de manter mais uma ferramenta
  no pipeline.
- **DVC**: datasets crus (`dados/*.csv`) hoje vivem no Git sem relação
  rastreada com o que efetivamente está no bucket GCS. DVC formaliza isso.
- **Cube.js**: parar de expor BigQuery cru ao frontend, com um modelo
  semântico reutilizável — mas só para o que é, de fato, consulta analítica.
- **Datasets `raw`/`silver`/`gold`/`ops` separados**: cada camada do
  medallion architecture tem consumidor e ciclo de vida diferente; `ops`
  (observabilidade do pipeline) é ortogonal e não deve poluir o catálogo
  semântico que o Cube.js expõe. Separação física (não só convenção de
  nome) garante a fronteira de acesso do Cube.js via IAM.

## Roadmap (fases — cada fase deve virar 1+ issues, não uma issue só)

1. ✅ **Setup do monorepo pnpm** — `pnpm-workspace.yaml` + `turbo.json` +
   `package.json` raiz, Next.js movido para `apps/frontend`.
2. ✅ **Criar `apps/datawarehouse`** — `observatudo/`, `scripts/`, `dados/` →
   `data/` movidos; `requirements.txt` → `pyproject.toml`/`uv.lock` (uv);
   `package.json` wrapper; placeholder de `src/observatudo/api/` (FastAPI).
3. **Camadas BigQuery (`raw`/`silver`/`gold`/`ops`) + remover dbt** — fase
   única (funde o que antes eram fases 3 e 5 separadas, ver "Decisões já
   fechadas"). Inclui:
   - Criar os datasets `raw`, `silver`, `gold`, `ops` no Terraform
     (`infra/bigquery.tf`), com IAM: Cube.js (futuro) só lê `gold`; a
     service account do pipeline lê/escreve nos quatro.
   - Migrar `raw_capag`/`raw_cidades_sustentaveis` para o dataset `raw`
     (mesmas tabelas, sem mudança de schema).
   - Migrar a lógica de `dbt/observatudo/models/staging/*` e
     `intermediate/*` para `apps/datawarehouse/sql/silver/*.sql` (sem
     Jinja/`ref()`), materializando no dataset `silver`.
   - Migrar `dbt/observatudo/models/dims/*` e `facts/*` para
     `apps/datawarehouse/sql/gold/*.sql`, materializando no dataset `gold`.
     `dim_localidades` (hoje carregada direto pelo Python, sem dbt) passa a
     ser carregada direto em `gold.dim_localidades`.
   - Criar `apps/datawarehouse/src/observatudo/pipeline/` (`steps.py`,
     `runner.py`, `ops_logger.py`) e `scripts/run_pipeline.py` — o
     substituto do `dbt run`. Cada execução grava em `ops.pipeline_runs`.
   - Depreciar e então apagar a pasta `dbt/` e o `.venv` órfão da raiz.
4. **Inicializar DVC dentro de `apps/datawarehouse`** — `dvc init` no app
   (não na raiz), configurar remote GCS (reaproveitando ou criando bucket,
   ver `docs/external/dvc.md`), `dvc add` nos datasets atuais, atualizar
   `.gitignore`. Pode rodar em paralelo à Fase 3.
5. **Scaffold de `apps/api` (Cube.js)** — criar o app com schema dos cubos
   mapeando o dataset `gold`, mesmo sem a decisão de deploy fechada (issue
   separada). Não inclui ainda migrar o frontend para consumi-lo. Depende
   da Fase 3 (precisa do `gold` materializado e estável).
6. **Decidir deploy do Cube.js e migrar o frontend rota a rota** — fechar
   self-hosted vs. Cube Cloud + autenticação (`docs/external/cubejs.md`),
   então substituir `src/app/api/indicadores/*` pelo consumo via Cube.js,
   um indicador por vez. Depende da Fase 5.
7. **Limpeza** — remover código/infra órfã do estado anterior (rotas de API
   substituídas, dataset `dados` antigo, etc.).

O conteúdo real da API de metadados do `ops` (além do placeholder criado na
Fase 2 — ver `docs/architecture.md`, seção 3.1) **não é uma fase deste
roadmap** — só entra quando houver endpoints concretos a implementar
(ela já vai ter dado real pra expor a partir da Fase 3, via
`ops.pipeline_runs`).

## Progresso

<!-- Atualize esta seção conforme fases avançam. Formato: Fase N — status — data — observação. -->

- Plano de estrutura de pastas e decisões de arquitetura fechados em
  2026-06-19 (ver `docs/monorepo-structure.md`).
- **Fase 1 concluída em 2026-06-19** (branch `refactor/01-pnpm-monorepo-setup`):
  `pnpm-workspace.yaml` + `turbo.json` + `package.json` raiz criados; Next.js
  movido para `apps/frontend` (`git mv`, histórico preservado); `yarn.lock`
  removido, substituído por `pnpm-lock.yaml`. Validado de ponta a ponta:
  `pnpm install`, `pnpm --filter frontend build`, `pnpm --filter frontend
  dev` (HTTP 200) e build/run via Docker (HTTP 200). Achados durante a
  migração:
  - `next.config.ts` ganhou `output: "standalone"` — necessário pro Docker
    funcionar bem dentro do monorepo pnpm (evita lidar com symlinks do
    pnpm store na imagem final).
  - `Dockerfile` movido para `apps/frontend/Dockerfile`, reescrito para
    pnpm + build context na raiz (`docker build -f apps/frontend/Dockerfile .`);
    `.github/workflows/build-and-deploy.yml` atualizado de acordo.
  - `@dnd-kit/utilities` era uma dependência fantasma (usada no código,
    nunca declarada no `package.json` — funcionava por hoisting frouxo do
    yarn). O pnpm não permite isso; adicionada como dependência direta.
  - `.gitignore` generalizado para padrões de monorepo (`node_modules`,
    `.next/`, etc. sem âncora `/` na raiz) e novo padrão `fallback-*.js`
    (artefato do `next-pwa` que ainda não estava coberto).
- **Fase 2 concluída em 2026-06-19** (branch `refactor/02-datawarehouse-app`):
  `observatudo/` → `apps/datawarehouse/src/observatudo`, `scripts/` →
  `apps/datawarehouse/scripts`, `dados/` → `apps/datawarehouse/data` (`git
  mv`, histórico preservado). `requirements.txt` convertido para
  `pyproject.toml` + `uv.lock` (dependências diretas inferidas dos imports
  reais do código, não do freeze completo — o freeze incluía toda a árvore
  de deps do dbt). Placeholder de `src/observatudo/api/` (FastAPI) criado
  conforme decidido em `docs/architecture.md` §3.1: `GET /health` (200) e
  `GET /pipelines/` (501, TODO até o dataset `ops` existir). Pastas vazias
  `civ/`/`dw/` (rascunho pré-migração, nunca rastreadas pelo git) removidas.
  Validado: `uv sync`, leitura real dos arquivos de dados movidos (capag
  estados/municípios, indicadores cidades-sustentáveis) com os novos paths,
  `ruff check` limpo, API placeholder respondendo via `uvicorn`,
  `pnpm --filter datawarehouse lint` e `pnpm lint`/`pnpm build` (turbo)
  rodando frontend + datawarehouse juntos. Achados:
  - Caminhos relativos hardcoded (`"dados/..."` em `config.py`, `capag.py`,
    `carregar_localidades_ibge.py`) atualizados para `"data/..."`. Cuidado:
    `DATASET = "dados"` nesses mesmos arquivos é o **nome do dataset
    BigQuery**, não um path — não foi tocado (isso é escopo da Fase 5).
  - `scripts/gerar_dropdown_json.py` escrevia em `src/data/...` assumindo
    CWD na raiz antiga; path do output corrigido para
    `../frontend/src/data/localidades_dropdown.json` (escopo cruzado
    dw→frontend pré-existente, só ajustado o path, não redesenhado).
  - `sys.path.append` manual nos scripts de entrypoint era um workaround
    para achar o pacote `observatudo` sem instalação — ficou redundante
    com `uv` (instala o pacote em modo editável) e foi removido.
  - `.env.example` tinha variáveis do Python (Ollama, log level) misturadas
    com as do frontend desde a Fase 1 — separado em
    `apps/frontend/.env.example` (BigQuery/Firebase) e
    `apps/datawarehouse/.env.example` (Ollama/log/bucket).
  - `package.json` do `datawarehouse` não tem script `dev` (não há um
    "servidor de dev" equivalente para um pipeline batch) nem `test`
    (ainda não há testes — `uv run pytest` falha com exit 5 sem testes
    coletados, o que quebraria `turbo run test`; reintroduzir quando
    houver testes reais).
  - Raiz precisou do campo `"packageManager"` no `package.json` para o
    Turborepo resolver os workspaces pnpm.
  - `dbt/` e o `.venv` antigo da raiz ficaram intocados (escopo da Fase 3) —
    o `.venv` da raiz está órfão (sem `requirements.txt` pra regenerá-lo)
    mas funcional até a Fase 3 remover o dbt de fato.
- **Design da Fase 3 fechado em 2026-06-19** (ainda não implementado):
  trocamos o desenho de "dois datasets" (`core`+`ops`) por **quatro
  datasets em camadas** (`raw`/`silver`/`gold`/`ops`), depois de mapear
  exatamente o que cada modelo dbt atual faz (`stg_capag`,
  `stg_cidades_sustentaveis` = silver; `int_capag` = silver agregado;
  `dim_indicadores`/`fact_indicadores` = gold). Renomeado `core` → `gold`
  em toda a documentação. Isso fundiu as antigas Fase 3 (remover dbt) e
  Fase 5 (reorganizar datasets) numa fase só, porque na prática eram a
  mesma mudança. Ver `docs/architecture.md` seção 2 e
  `docs/monorepo-structure.md` (seção "`sql/` + `pipeline/`").

## Decisões abertas (bloqueiam issues downstream)

- Deploy do Cube.js: self-hosted vs. Cube Cloud, autenticação, protocolo de
  consumo no frontend — ver `docs/external/cubejs.md`.
- DVC: bucket dedicado vs. reaproveitar `data_bucket` existente — ver
  `docs/external/dvc.md`.
- Nomes finais exatos das tabelas em `silver`/`gold` (provisoriamente sem
  prefixo `stg_`/`int_`, só convenção — ver tabela de mapeamento em
  `docs/monorepo-structure.md`).
- Schema exato de `ops.pipeline_runs`/`ops.dataset_freshness`/
  `ops.data_quality_checks` (colunas, granularidade) — a existência dessas
  tabelas está decidida, o schema fino não.
- Endpoints concretos da API de metadados do `ops` (o placeholder/esqueleto
  já está decidido; o conteúdo real depende das tabelas de `ops` existirem).
- Bucket do remote do DVC reaproveitado vs. dedicado — dado que agora
  `raw` é um dataset BigQuery próprio, vale reavaliar se o remote do DVC
  deveria ser um bucket dedicado a "fonte bruta versionada", separado do
  que os pipelines escrevem como output.
- Destino de `packages/` compartilhados (se vier a existir) entre frontend e
  API.
