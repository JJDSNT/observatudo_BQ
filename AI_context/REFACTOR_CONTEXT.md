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
- Dois datasets BigQuery: `core` (analítico, nome provisório) e `ops`
  (metadados/observabilidade do próprio DW), substituindo o atual `dados`.
- Datasets de dados versionados via DVC, escopado dentro de
  `apps/datawarehouse` (não na raiz), conteúdo em bucket GCS, ponteiros no
  Git.
- dbt removido; modelagem SQL feita direto (scripts Python + `.sql` simples
  em `apps/datawarehouse/sql/`).
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
- Cube.js é escopo **somente leitura/analítico** sobre o dataset `core`. O
  dataset `ops` (metadados do próprio DW) **não** é exposto via Cube.js —
  tem API própria, dedicada (FastAPI), dentro de
  `apps/datawarehouse/src/observatudo/api/`. Entra como placeholder real
  (esqueleto, escopo inicial só leitura) desde a Fase 2, não como ideia
  futura solta.
- Dois datasets BigQuery (`core` + `ops`), não um só — para não misturar
  dado de produto com metadado de observabilidade do pipeline no mesmo
  catálogo semântico.
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
- **Dataset `ops` separado**: reservar espaço para observabilidade do
  próprio DW (execução de pipeline, freshness, linhagem) sem acoplar isso ao
  modelo de dados que o frontend consome.

## Roadmap (fases — cada fase deve virar 1+ issues, não uma issue só)

1. **Setup do monorepo pnpm** — criar `pnpm-workspace.yaml` + `turbo.json` +
   `package.json` raiz, mover o app Next.js para `apps/frontend` sem mudar
   comportamento, garantir que `pnpm install` + `pnpm --filter frontend dev`
   funcionam.
2. **Criar `apps/datawarehouse`** — mover `observatudo/`, `scripts/`,
   `dados/` → `data/` para dentro do novo app; converter `requirements.txt`
   em `pyproject.toml`/`uv.lock` (uv); criar o `package.json` wrapper de
   scripts; criar o placeholder de `src/observatudo/api/` (FastAPI, só
   esqueleto + health-check, sem lógica do `ops` ainda).
3. **Remover dbt** — migrar a lógica de `dbt/observatudo/models/*` para
   `apps/datawarehouse/sql/{staging,intermediate,dims,facts}/*.sql`,
   depreciar e então apagar a pasta `dbt/`.
4. **Inicializar DVC dentro de `apps/datawarehouse`** — `dvc init` no app
   (não na raiz), configurar remote GCS (reaproveitando ou criando bucket,
   ver `docs/external/dvc.md`), `dvc add` nos datasets atuais, atualizar
   `.gitignore`.
5. **Reorganizar BigQuery em dois datasets** — criar `core` e `ops` no
   Terraform (`infra/bigquery.tf`), migrar tabelas existentes do dataset
   `dados` para `core`; `ops` começa vazio/mínimo (sem migração de dado
   legado).
6. **Scaffold de `apps/api` (Cube.js)** — criar o app com schema dos cubos
   mapeando o dataset `core`, mesmo sem a decisão de deploy fechada (issue
   separada para isso). Não inclui ainda migrar o frontend para consumi-lo.
7. **Decidir deploy do Cube.js e migrar o frontend rota a rota** — fechar
   self-hosted vs. Cube Cloud + autenticação (`docs/external/cubejs.md`),
   então substituir `src/app/api/indicadores/*` pelo consumo via Cube.js,
   um indicador por vez.
8. **Limpeza** — remover código/infra órfã do estado anterior (rotas de API
   substituídas, dataset `dados` antigo, etc.).

Dependência principal: 3 depende de 2; 6 depende de 5; 7 depende de 6.
4 pode rodar em paralelo a 2/3. O conteúdo real da API de metadados do `ops`
(além do placeholder criado na Fase 2 — ver `docs/architecture.md`, seção
3.1) **não é uma fase deste roadmap** — só entra quando o dataset `ops`
existir e houver endpoints concretos a implementar.

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

## Decisões abertas (bloqueiam issues downstream)

- Deploy do Cube.js: self-hosted vs. Cube Cloud, autenticação, protocolo de
  consumo no frontend — ver `docs/external/cubejs.md`.
- DVC: bucket dedicado vs. reaproveitar `data_bucket` existente — ver
  `docs/external/dvc.md`.
- Nome final do dataset `core` (provisório) e confirmação de que `ops` fica
  só com metadados de pipeline.
- Endpoints concretos da API de metadados do `ops` (o placeholder/esqueleto
  já está decidido; o conteúdo real depende do dataset `ops` existir).
- Destino de `packages/` compartilhados (se vier a existir) entre frontend e
  API.
