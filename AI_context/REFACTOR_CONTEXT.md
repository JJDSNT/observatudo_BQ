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
- `apps/api` (Cube.js) — app real (schema versionado), scaffold concluído e
  deployado (self-hosted via Cloud Run) na Fase 5, com CI/CD próprio.
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
3. ✅ **Camadas BigQuery (`raw`/`silver`/`gold`/`ops`) + remover dbt** — fase
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
4. ✅ **Inicializar DVC dentro de `apps/datawarehouse`** — `dvc init` no app
   (não na raiz), configurar remote GCS (reaproveitando ou criando bucket,
   ver `docs/external/dvc.md`), `dvc add` nos datasets atuais, atualizar
   `.gitignore`.
5. ✅ **Scaffold de `apps/api` (Cube.js)** — criar o app com schema dos cubos
   mapeando o dataset `gold`. Não inclui ainda migrar o frontend para
   consumi-lo. Depende da Fase 3 (precisa do `gold` materializado e
   estável).
6. 🔄 **Migrar o frontend rota a rota** — protocolo fechado (proxy
   server-side, ver Progresso); substituir `src/app/api/indicadores/*`
   pelo consumo via Cube.js, uma rota por vez, até não restar acesso
   direto ao BigQuery no frontend. Depende da Fase 5.
   - ✅ `/api/indicadores/search`
   - ✅ `/api/indicadores/nomeados`
   - `/api/indicadores/localidade/[municipio_id]` (dashboard principal)
   - Remover `lib/analytics/client.ts`/`query.ts` e a dependência
     `@google-cloud/bigquery` do frontend depois das 3 rotas migradas.
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
- **Design da Fase 3 fechado em 2026-06-19**: trocamos o desenho de "dois
  datasets" (`core`+`ops`) por **quatro datasets em camadas**
  (`raw`/`silver`/`gold`/`ops`), depois de mapear exatamente o que cada
  modelo dbt atual faz (`stg_capag`, `stg_cidades_sustentaveis` = silver;
  `int_capag` = silver agregado; `dim_indicadores`/`fact_indicadores` =
  gold). Renomeado `core` → `gold` em toda a documentação. Isso fundiu as
  antigas Fase 3 (remover dbt) e Fase 5 (reorganizar datasets) numa fase
  só, porque na prática eram a mesma mudança. Ver `docs/architecture.md`
  seção 2 e `docs/monorepo-structure.md` (seção "`sql/` + `pipeline/`").
- **Fase 3 concluída em 2026-06-19** (branch
  `refactor/03-bigquery-layers-remove-dbt`):
  - `infra/bigquery.tf` reescrito: datasets `raw`/`silver`/`gold`/`ops`
    criados; `dim_localidades` movida para `gold`; tabela `ops.pipeline_runs`
    criada com schema (run_id, pipeline_step, status, started_at,
    finished_at, rows_affected, error_message).
  - `infra/iam.tf` reescrito: `www_app` só lê `gold`; SA `dbt` substituída
    por SA `pipeline` (`sa-observatudo-pipeline`) com `dataEditor` nos
    quatro datasets + `bigquery.jobUser`. `infra/variables.tf`
    (`bigquery_dataset_id` default `"dados"` → `"gold"`) e
    `infra/outputs.tf` (`dbt_sa_email` → `pipeline_sa_email`) ajustados.
    `terraform validate` passa; `terraform plan`/`apply` na época
    bloqueados por credenciais do backend remoto expiradas — aplicado de
    fato só depois, junto da recuperação do state (ver entrada
    "Incidente" abaixo).
  - Modelos dbt migrados para SQL plano em
    `apps/datawarehouse/sql/{silver,gold}/*.sql` (sem Jinja/`ref()`/`config()`),
    lendo de `raw.*`/`silver.*` com nomes totalmente qualificados.
  - `apps/datawarehouse/src/observatudo/pipeline/` criado: `steps.py`
    (catálogo declarativo das etapas), `runner.py` (monta o DDL `CREATE OR
    REPLACE TABLE/VIEW ... AS (<sql>)`, executa via
    `bigquery.Client().query()`, registra cada execução), `ops_logger.py`
    (grava em `ops.pipeline_runs` via `insert_rows_json`).
    `scripts/run_pipeline.py` é o novo entrypoint (substitui `dbt run`),
    com `--only {silver,gold}`.
  - `GET /pipelines/` (antes 501) implementado de fato, lendo
    `ops.pipeline_runs`.
  - Tabelas `raw_capag`/`raw_cidades_sustentaveis` apontadas para o
    dataset `raw` (`transformers/capag.py`, `transformers/
    cidades_sustentaveis.py`); `dim_localidades` apontada para `gold`
    (`scripts/carregar_localidades_ibge.py`, `scripts/
    gerar_dropdown_json.py`).
  - `dbt/` (18 arquivos rastreados) e o `.venv` órfão da raiz removidos.
  - `.github/workflows/build-and-deploy.yml`: env var de deploy
    `BIGQUERY_DATASET_ID` atualizada de `dados` para `gold`.
  - Validado: `uv run pytest` (3 testes do runner, `build_ddl` para os
    casos table/view/partition+cluster), `uv run ruff check .` limpo,
    `terraform validate` ok. Achados:
    - O comentário em `sql/gold/fact_indicadores.sql` documenta que
      `PARTITION BY`/`CLUSTER BY` agora vivem no runner Python (via
      `Step.partition_by`/`cluster_by`), não no SQL — equivalente ao
      `config()` do dbt, mas explícito no catálogo de steps em vez de
      embutido no arquivo `.sql`.
    - `README.md` raiz estava desatualizado desde antes da Fase 1
      (mencionava dbt como "visão futura" e tinha checklist histórico
      incoerente com o estado real) — reescrito do zero para refletir a
      estrutura monorepo + camadas BigQuery atuais.
- **Fase 4 concluída em 2026-06-19** (branch `refactor/04-dvc-init`):
  `dvc init --subdir` dentro de `apps/datawarehouse`; remote `gcs`
  configurado em `gs://observatudo-infra-www-data/dvc-store` — **bucket
  único reaproveitado** (decisão fechada: simplicidade operacional para o
  tamanho atual do projeto, prefixo de path `dvc-store/` já separa
  logicamente do que os transformers escrevem hoje em `indicadores/...`).
  `git rm -r --cached` + `dvc add` nos três domínios de dados
  (`data/cidades-sustentaveis`, `data/ibge`, `data/tesouro-nacional` — ~98MB,
  25 arquivos), gerando `.dvc` + `data/.gitignore`. `package.json` ganhou
  `dvc:status`/`dvc:pull`/`dvc:push`. Validado: `dvc status` ("up to date"),
  `dvc doctor` (remote `gs` reconhecido), e **`dvc push` real executado em
  2026-06-19** após reautenticação (`gcloud auth application-default
  login`) — 28 arquivos enviados a `gs://observatudo-infra-www-data/
  dvc-store`, confirmado via `dvc status -c` ("in sync") e listagem direta
  do bucket via `google.cloud.storage`. Fora do escopo desta fase (não
  decidido, ver `docs/external/dvc.md`): migrar `transformers/*.py` para
  parar de chamar
  `upload_to_bucket` manualmente e passar a depender de `dvc add`/`dvc
  push`; isso fica como ponto aberto, não como TODO da fase.
- **Incidente: state do Terraform apagado, recuperado em 2026-06-19**
  (branch `fix/terraform-state-recovery`). Ao tentar aplicar de fato o
  Terraform da Fase 3 (bloqueado desde então por credenciais expiradas),
  descobrimos que `gs://tfstate-observatudo/apps/observatudo-www-app/
  default.tfstate` estava vazio (`serial: 1`, `resources: []`), apesar de
  toda a infra real (Cloud Run, DNS, Firestore, bucket, SA `www_app`)
  existir de fato no GCP. Causa raiz: o bucket `tfstate-observatudo`
  (criado pelo repo `manage-dns`, `infra-base/bucket.tf`) tinha uma
  `lifecycle_rule { action { type = "Delete" } condition { age = 365 } }`
  e versionamento desligado — apagou silenciosamente, sem rastro em
  Cloud Audit Logs (Data Access logging não habilitado), o state de
  **três** prefixes diferentes que compartilhavam o mesmo bucket:
  `infra-base`, `zones/observatudo.com.br` (ambos do `manage-dns`) e
  `apps/observatudo-www-app` (este repo). Resolução:
  1. Removida a `lifecycle_rule` do bucket (sem versioning — decisão:
     custo de reter versões antigas não compensa) — corrigido em
     [manage-dns#1](https://github.com/JJDSNT/manage-dns/pull/1).
  2. Os três states foram reconstruídos via `terraform import` de cada
     recurso confirmado como existente de verdade via API do GCP
     (BigQuery, Cloud Run, DNS, IAM, Firestore, Storage) antes de
     importar — nenhum recurso real foi tocado nesse processo.
  3. Descoberto de quebra: o provider `google` injeta por padrão a label
     `goog-terraform-provisioned`, e `google_cloud_run_domain_mapping`
     não aceita atualizar isso in-place — forçaria destroy+recreate dos
     domain mappings (e do certificado SSL). Corrigido com
     `add_terraform_attribution_label = false` no provider
     (`infra/main.tf`).
  4. Com o state correto, a Fase 3 finalmente foi aplicada de verdade:
     `terraform apply` criou os 4 datasets BigQuery + 2 tabelas + SA
     `pipeline` + 5 IAM bindings (13 add / 4 change cosmético / 0
     destroy).
  - Achado relevante: o Cloud Run já estava servindo a revisão mais
    recente (deploy via `github-actions-deploy`) com
    `BIGQUERY_DATASET_ID=gold` configurado, mas o dataset `gold` não
    existia ainda — o site em produção provavelmente estava com erro
    nas páginas dependentes de BigQuery até este apply.
  - Pendência: os datasets novos (`raw`/`silver`/`gold`/`ops`) existem
    mas estão **vazios** — falta rodar a ingestão (`preprocess_*.py`) e
    o pipeline (`scripts/run_pipeline.py`) para popular dados reais.
  - SA antiga `sa-observatudo-dbt` ficou órfã no GCP (não está em
    nenhum `.tf` mais, desde que a Fase 3 renomeou para `pipeline`) —
    não foi tocada/destruída automaticamente; limpeza manual futura.
- **`gold.dim_indicadores` ganhou `unidade`/`fonte`/`periodicidade` em
  2026-06-22** (branch `fix/dim-indicadores-unidade-fonte-periodicidade`):
  colunas pedidas pelo frontend (`listarIndicadores()`) que nunca tinham
  sido populadas no modelo dimensional. `fonte` e `periodicidade` vêm de
  dado real: `fonte` já existia em `silver.cidades_sustentaveis`/
  `silver.capag_agregado`, só não era propagada; `periodicidade` é
  `'anual'` para as duas fontes — verificado estruturalmente (não
  suposto) que `(indicador_id, localidade, ano)` é sempre único em
  `cidades-sustentaveis/indicadores_padronizados.csv` (38495 linhas, 0
  duplicatas), ou seja, no máximo 1 observação/ano por indicador mesmo
  quando a fórmula calcula uma média mensal a partir do total anual
  (ex.: "consumo per capita /12" — isso é só a fórmula, não a cadência de
  amostragem). `unidade` ficou `null` para os ~500 indicadores do Cidades
  Sustentáveis (sem essa informação em nenhuma fonte original) e `'%'`
  só para o índice CAPAG agregado (médias de razões percentuais segundo a
  metodologia do Tesouro Nacional). Pipeline gold reexecutado e validado
  via query real no BigQuery.
- **SA órfã `sa-observatudo-dbt` excluída em 2026-06-22**: verificado via
  API do GCP que não tinha referência em nenhum dataset BigQuery
  (`raw`/`silver`/`gold`/`ops`) nem no bucket `*-www-data`; só restava o
  binding de projeto `roles/bigquery.jobUser` e 2 chaves de acesso ainda
  válidas (uma sem expiração, de 2025-05-17) — risco de credencial órfã
  ainda funcional. Excluída a service account e removido o binding da
  política IAM do projeto.
- **Fase 5 concluída em 2026-06-22** (branch `feat/cubejs-api-scaffold`):
  `apps/api` criado como app real — `package.json` (`@cubejs-backend/
  server` + `@cubejs-backend/bigquery-driver`), `cube.js`, `model/cubes/
  {dim_indicadores,dim_localidades,fact_indicadores}.js` (joins
  `fact_indicadores` → `dim_indicadores`/`dim_localidades`), `model/views/
  indicadores.js` (view denormalizada candidata a substituir
  `src/app/api/indicadores/*`), `Dockerfile`, `.env.example`. Validado de
  ponta a ponta: `cubejs-dev-server` local, `/cubejs-api/v1/meta` compila
  os 3 cubos + view, query real (`count`/`valor_medio` por `nome`/
  `unidade`) retorna dados reais do BigQuery via ADC. Decisão de deploy
  tomada na mesma data: **self-hosted via Cloud Run**, com possibilidade de
  usar o bucket GCS existente como apoio (export/pre-agregação) — ver
  `docs/external/cubejs.md`. Achado durante a validação (pré-existente, não
  introduzido aqui): os 4 componentes individuais do CAPAG existem em
  `fact_indicadores` mas não têm linha em `dim_indicadores` (só o índice
  agregado `capag` tem) — aparecem como join órfão.

- **Terraform do Cube.js aplicado em 2026-06-22** (`infra/cubejs.tf`):
  SA `sa-observatudo-cubejs` (IAM `dataViewer` só em `gold` +
  `bigquery.jobUser` + `storage.objectAdmin` no bucket `*-www-data` para o
  `CUBEJS_DB_EXPORT_BUCKET`), serviço Cloud Run `cubejs-observatudo`
  (`https://cubejs-observatudo-s34t5vpv5a-ue.a.run.app`, ainda com a imagem
  placeholder pública `cubejs/cube:latest` — falta CI publicar a imagem
  real com `model/` embutido), IAM `run.invoker` para `allUsers` (mesmo
  padrão do frontend). `terraform plan` mostrou só os 6 recursos novos + 1
  mudança cosmética pré-existente (label `nonce` do serviço do frontend);
  `apply` rodou sem destruir nada.
- **CI/CD do Cube.js criado em 2026-06-22**
  (`.github/workflows/build-and-deploy-cubejs.yml`, espelha o do
  frontend): build de `apps/api/Dockerfile`, push para `gcr.io/
  observatudo-infra/observatudo-cubejs`, `gcloud run deploy` no serviço
  `cubejs-observatudo` substituindo o placeholder `cubejs/cube:latest`
  pela imagem real (com `model/` embutido) a cada push em `main` que
  toque `apps/api/**`. `CUBEJS_API_SECRET` configurado como secret do
  GitHub Actions (mesmo valor já usado no Terraform local) e passado via
  `--set-env-vars` no deploy — não usa Secret Manager do GCP, esse
  recurso não foi criado.

- **Fase 6 iniciada em 2026-06-22**: protocolo de consumo do Cube.js no
  frontend fechado — proxy server-side. As rotas Next.js
  (`src/app/api/indicadores/*`) continuam com o mesmo contrato pro
  browser, mas por dentro passam a chamar o Cube.js via
  `@cubejs-client/core` (`apps/frontend/src/lib/cubejs/client.ts`),
  autenticando com um JWT assinado a partir de `CUBEJS_API_SECRET` no
  servidor — o browser nunca vê esse secret nem fala com o Cube.js
  direto. Evita reabrir a questão de autenticação de usuário (Firebase)
  no Cube.js por agora. Antes de migrar, removido código morto sem
  consumidor real (`/api/indicadores` bare, `/api/indicadores/list`,
  `hooks/useIndicadores.ts`, `hooks/olduseIndicadoresDashboard.ts`,
  exports não usados em `lib/analytics/dimensions/`+`measures/`) —
  investigado via histórico do git antes de apagar, confirmado que cada
  um foi criado para uma feature que não vingou.
  - `/api/indicadores/search` migrado: `buscarIndicadores()` agora
    consulta o cubo `dim_indicadores` via Cube.js (filtro `contains`
    case-insensitive em nome/descrição + `equals` em indicador_id).
  - `/api/indicadores/nomeados` migrado: `nomesIndicadores()` consulta
    `dim_indicadores` via Cube.js (`equals` com múltiplos valores =
    semântica de IN). Validado contra produção.
  - Achado real durante a migração: `primary_key: true` deixa o membro
    `public: false` por padrão no Cube — `indicador_id`/`localidade_id`
    precisaram de `public: true` explícito em `apps/api/model/cubes/
    {dim_indicadores,dim_localidades}.js` pro frontend conseguir
    filtrar/selecionar por eles diretamente (não só usar como chave de
    join interna).
  - `infra/main.tf`: serviço Cloud Run do frontend ganhou `CUBEJS_API_URL`
    (referência dinâmica ao serviço do Cube.js, não hardcoded) e
    `CUBEJS_API_SECRET`; `.github/workflows/build-and-deploy.yml`
    resolve a URL real via `gcloud run services describe` no deploy.
  - **Cuidado registrado**: `var.cubejs_image_url` tinha um default
    público (`cubejs/cube:latest`) que, se aplicado depois do CI já ter
    publicado a imagem real, reverteria o deploy — default removido
    (var agora obrigatória, mesmo padrão de `var.image_url`).

## Decisões abertas (bloqueiam issues downstream)

- **`run.invoker` do Cube.js está `allUsers`** (mesmo padrão do frontend,
  decisão consciente de manter assim por ora em 2026-06-22) — qualquer
  requisição chega no container (mesmo que rejeitada depois pelo
  `CUBEJS_API_SECRET`), o que tem custo marginal de CPU/requisição por
  tentativa não autenticada e expõe superfície a scraping/abuso. Considerar
  restringir o invoker (ex.: só uma SA do frontend) quando a autenticação
  service-to-service for desenhada.
- Os 4 componentes individuais do CAPAG (`CAPAG - Endividamento`/`Poupança
  Corrente`/`Liquidez`/`Nota Final`) existem em `fact_indicadores` sem
  linha correspondente em `dim_indicadores` — decisão de como tratar isso
  ainda não tomada.
- Schema de `ops.dataset_freshness`/`ops.data_quality_checks` (colunas,
  granularidade) — `ops.pipeline_runs` já está implementada e em uso desde
  a Fase 3; essas duas ainda não existem.
- Endpoints concretos da API de metadados do `ops` além de `GET
  /pipelines/` (já implementado na Fase 3) — ações/mutações (ex.:
  "reprocessar esta fonte") dependem de necessidade real ainda não
  surgida.
- `unidade` por indicador do Cidades Sustentáveis (~500 indicadores) —
  fica `null` até existir uma referência real de unidade por indicador
  (não existe em nenhuma fonte hoje); preencher exigiria curadoria manual
  ou um catálogo externo ainda não disponível.
- Migrar `transformers/*.py` para o fluxo `dvc add`/`dvc push` em vez de
  `upload_to_bucket` manual — reaberto em 2026-06-22: uma tentativa de
  implementação (chamar `dvc add`/`dvc push` via `subprocess` de dentro do
  transformer, a cada execução, num diretório inteiro) foi revertida por
  parecer um fluxo estranho. Causa raiz identificada: cada pasta de dados
  hoje mistura três tipos de conteúdo com ciclos de vida bem diferentes,
  e `dvc add <dir>` trata tudo como uma coisa só (um hash por diretório):
  - **raw** (entrada estável): `data/cidades-sustentaveis/indicadores.csv`;
    `data/tesouro-nacional/capag/{estados,municipios}/*.xlsx` (várias
    versões históricas 2018-2023, mas `capag.py` só lê 2 arquivos fixos —
    o resto é histórico parado, sem uso no código).
  - **cache/estado incremental do pipeline** (não é "dataset", é memória
    de execuções anteriores): `data/cidades-sustentaveis/cache/
    eixos_llm.json` (cresce run a run), `cache/classificacoes_invalidas.csv`
    (sobrescrito a cada run), `cache/direcionalidade_capag.json` — esse
    último é estado do pipeline do **CAPAG**, fisicamente dentro da pasta
    do Cidades Sustentáveis só porque os dois transformers compartilham o
    mesmo `CACHE_DIR` em `config.py`.
  - **output processado** (regenerado a cada run, é o que alimenta o
    BigQuery): `data/cidades-sustentaveis/indicadores_padronizados.csv`,
    `data/tesouro-nacional/capag/preprocessed/indicadores_capag_2022.csv`.
  - Lixo encontrado de passagem: `data/cidades-sustentaveis/
    indicadores_utf16.csv` (38MB) não é lido por nenhum código.
  Antes de tentar de novo, decidir: separar essas três categorias em
  unidades DVC distintas (raw vs. cache vs. output, cada uma com seu
  próprio ciclo de versionamento) e/ou mover `direcionalidade_capag.json`
  para um cache do próprio domínio CAPAG; só então faz sentido desenhar
  o fluxo de `dvc add`/`dvc push` automático.
- Destino de `packages/` compartilhados (se vier a existir) entre frontend e
  API.
