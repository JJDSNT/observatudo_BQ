# 📊 Observatudo – Indicadores Cívicos

Plataforma fullstack para ingestão, organização e visualização de indicadores cívicos (como saúde, educação, governança).  
Monorepo **pnpm** combinando frontend em **Next.js**, backend analítico com **BigQuery** e pipelines em **Python (uv) + Terraform**.

> Em migração para essa estrutura de monorepo — contexto completo em
> [`AI_context/REFACTOR_CONTEXT.md`](./AI_context/REFACTOR_CONTEXT.md) e
> arquitetura alvo em [`docs/architecture.md`](./docs/architecture.md).

---

## 📁 Estrutura do Projeto

```
observatudo-bq/
├── apps/
│   ├── frontend/                  # Next.js (App Router)
│   │   ├── src/
│   │   └── public/
│   └── datawarehouse/              # Pipelines Python (uv) + dados + DVC
│       ├── src/observatudo/        # Lib de ingestão/transformação
│       ├── scripts/                # Entrypoints (preprocess, carga IBGE, etc.)
│       └── data/                   # Datasets (cache local; versionamento via DVC)
├── dbt/                             # Modelos de transformação (em remoção, ver AI_context)
├── infra/                           # Infraestrutura Terraform (GCP)
│   ├── bigquery.tf                  # Tabelas
│   ├── storage.tf                   # Buckets
│   ├── iam.tf                       # Permissões
│   └── ...
├── docs/                            # Arquitetura e decisões técnicas
├── AI_context/                      # Contexto e plano da migração para a IA
├── pnpm-workspace.yaml
└── turbo.json
```

---

## ✅ Pipeline Atual

### 🔧 Pré-processamento (`scripts/preprocess_cidades_sustentaveis.py`)
- Lê CSV bruto da fonte "Cidades Sustentáveis"
- Remove colunas irrelevantes
- Converte `valor` para float com sanitização de dados
- Gera CSV padronizado + envia ambos os arquivos para o GCS

### 🌎 Dados de Localidade (`scripts/carregar_localidades_ibge.py`)
- Lê dados do IBGE
- Popula tabela `dim_localidades` no BigQuery
- Gera arquivo `localidades_dropdown.json` usado no frontend

### 📦 Infraestrutura
- Buckets e tabelas criadas via Terraform
- Dataset particionado e clusterizado para performance

### 🧑‍💻 Frontend (Next.js)
- `ComboBoxLocalidades.tsx` com seleção UF → cidade
- Carregamento via `import` local (`localidades_dropdown.json`)
- UI baseada em Tailwind CSS

---

## 🧠 Visão futura

O Observatudo evoluirá para uma **plataforma analítica cívica** com:

- 🎯 Dados versionados, auditáveis e recategorizados por IA
- 📦 Modelo semântico padronizado com dbt
- 📈 Visualizações com Next.js + filtros e painéis
- 🔄 **Camada de acesso analítico inspirada na API do [Cube.js](https://cube.dev)**  
  Um "ORM para BigQuery", permitindo explorar medidas, dimensões e filtros com facilidade e reutilização via código
- ⚙️ GitOps com Terraform, dbt, GitHub Actions e CI/CD

---

## 🔁 Próximos Passos

- [x] Criar modelo `stg_indicadores__cidades_sustentaveis` no dbt  
- [x] Popular `dim_indicadores` com metadados enriquecidos  
- [x] Popular `fact_indicadores` com valores por município  
- [x] Estruturar camada de consulta analítica estilo Cube.js  
- [ ] Criar visualizações dinâmicas no frontend

---

## 🛠️ Requisitos

- Node.js 20+ e [pnpm](https://pnpm.io)
- Python 3.10+ e [uv](https://docs.astral.sh/uv/)
- Terraform 1.6+
- Conta Google Cloud autenticada via:
  ```
  gcloud auth application-default login
  ```

---

## 🚀 Comandos Úteis

```bash
# Instalar tudo (frontend + datawarehouse) a partir da raiz
pnpm install

# Rodar o frontend localmente
pnpm dev:frontend

# Build/lint de todos os workspaces (via Turborepo)
pnpm build
pnpm lint

# Rodar pré-processamento (Python, dentro de apps/datawarehouse)
cd apps/datawarehouse
uv run python scripts/preprocess_cidades_sustentaveis.py

# Aplicar Terraform
cd infra
terraform init
terraform apply
```

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