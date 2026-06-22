# 📊 Observatudo – Indicadores Cívicos

Plataforma fullstack para ingestão, organização e visualização de indicadores cívicos (saúde, educação, governança, finanças municipais).

Monorepo **pnpm** orquestrado por **Turborepo**, combinando frontend em **Next.js**, pipelines de dados em **Python (uv)** sobre **BigQuery**, e infraestrutura como código em **Terraform**.

> Em refatoração ativa rumo a essa estrutura. Contexto completo da migração
> em [`AI_context/REFACTOR_CONTEXT.md`](./AI_context/REFACTOR_CONTEXT.md),
> arquitetura alvo em [`docs/architecture.md`](./docs/architecture.md) e
> árvore de pastas detalhada em
> [`docs/monorepo-structure.md`](./docs/monorepo-structure.md).

---

## 📁 Estrutura do projeto

```
observatudo-bq/
├── apps/
│   ├── frontend/                    # Next.js (App Router)
│   │   ├── src/
│   │   └── public/
│   ├── datawarehouse/                # Pipelines Python (uv) + SQL + DVC
│   │   ├── src/observatudo/          # Lib de ingestão/transformação
│   │   ├── src/observatudo/pipeline/ # Runner raw → silver → gold
│   │   ├── src/observatudo/api/      # API de metadados do `ops` (FastAPI)
│   │   ├── sql/{silver,gold}/        # Transformações SQL (sem dbt)
│   │   ├── scripts/                  # Entrypoints (preprocess, carga IBGE, etc.)
│   │   ├── tests/
│   │   └── data/                     # Datasets (cache local; versionamento via DVC)
│   └── api/                          # Cube.js — camada analítica sobre `gold`
│       ├── model/{cubes,views}/      # 1 cubo por dim_*/fact_*, views compostas
│       └── cube.js                   # Config de conexão BigQuery (IAM read-only em `gold`)
├── infra/                            # Infraestrutura Terraform (GCP)
│   ├── bigquery.tf                   # Datasets raw/silver/gold/ops + tabelas
│   ├── iam.tf                        # Service accounts e permissões
│   └── ...
├── docs/                              # Arquitetura e decisões técnicas
├── AI_context/                        # Contexto e plano da migração para a IA
├── pnpm-workspace.yaml
└── turbo.json
```

Cada app é um workspace pnpm. O `apps/datawarehouse` é Python (gerenciado
por [`uv`](https://docs.astral.sh/uv/)), mas expõe um `package.json` mínimo
com scripts que chamam `uv run ...` por baixo, para ser orquestrável pelo
Turborepo junto do frontend.

---

## 🏗️ Camadas de dados (BigQuery)

Quatro datasets, um por camada do pipeline:

| Dataset | Papel | Exemplos |
|---|---|---|
| `raw` | Landing zone — carga direta dos arquivos de origem, sem transformação | `raw_capag`, `raw_cidades_sustentaveis` |
| `silver` | Limpeza, cast de tipos, agregações intermediárias | `capag`, `cidades_sustentaveis`, `capag_agregado` |
| `gold` | Modelo dimensional final, consumido pelo frontend | `dim_indicadores`, `fact_indicadores`, `dim_localidades` |
| `ops` | Observabilidade do próprio pipeline (não é dado de produto) | `pipeline_runs` |

A transformação `raw → silver → gold` é feita por arquivos `.sql` simples
em `apps/datawarehouse/sql/{silver,gold}/` (sem dbt), executados em ordem
por um runner Python
(`apps/datawarehouse/src/observatudo/pipeline/`) que monta o DDL
(`CREATE OR REPLACE TABLE/VIEW ...`) e registra cada execução em
`ops.pipeline_runs`. Ver racional completo em
[`docs/architecture.md`](./docs/architecture.md).

---

## 🛠️ Requisitos

- Node.js 20+ e [pnpm](https://pnpm.io)
- Python 3.10+ e [uv](https://docs.astral.sh/uv/)
- Terraform 1.6+
- Conta Google Cloud autenticada via:
  ```bash
  gcloud auth application-default login
  ```

---

## 🚀 Comandos úteis

```bash
# Instalar tudo (frontend + datawarehouse) a partir da raiz
pnpm install

# Rodar o frontend localmente
pnpm dev:frontend

# Rodar a API de metadados do datawarehouse (ops)
pnpm dev:ops-api

# Rodar o Cube.js localmente (sobre o dataset gold, via ADC)
pnpm dev:api

# Build/lint/test de todos os workspaces (via Turborepo)
pnpm build
pnpm lint
pnpm test

# Rodar o pipeline de transformação (raw → silver → gold)
cd apps/datawarehouse
uv run python scripts/run_pipeline.py
uv run python scripts/run_pipeline.py --only silver   # só uma camada

# Rodar a ingestão de uma fonte específica
uv run python scripts/preprocess_cidades_sustentaveis.py

# Sincronizar datasets versionados via DVC (remote GCS)
cd apps/datawarehouse
uv run dvc pull
uv run dvc push

# Aplicar infraestrutura
cd infra
terraform init
terraform apply
```

---

## 🧠 Visão futura

- 🔄 Migrar o frontend (`src/app/api/indicadores/*`) para consumir o
  [Cube.js](https://cube.dev) (já deployado, ver `apps/api`) em vez de
  acessar o BigQuery direto — rota a rota, um indicador por vez.
- 📈 Mais visualizações e painéis no frontend a partir do modelo `gold`.

Ver roadmap detalhado em
[`AI_context/REFACTOR_CONTEXT.md`](./AI_context/REFACTOR_CONTEXT.md).

---

## 📄 Licença

Este projeto está sob licença MIT.

---

## 👨‍💻 Sobre mim

Este repositório faz parte do meu portfólio pessoal.
Sou Engenheiro de Software especialista em transformação digital, com foco em sistemas distribuídos e ênfase em plataformas e ecossistemas para a construção de organizações biônicas.

🌐 Acesse: [https://jdias.observatudo.com.br](https://observatudo.com.br)

---

## 📬 Contato

- GitHub: [@JJDSNT](https://github.com/JJDSNT)
- LinkedIn: [https://www.linkedin.com/in/jdiasneto/](https://www.linkedin.com/in/jdiasneto/)
