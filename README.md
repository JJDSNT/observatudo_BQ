# 📊 Observatudo – Indicadores Cívicos

Plataforma fullstack para ingestão, organização e visualização de indicadores cívicos como saúde, educação e governança.  
Combina frontend em **Next.js**, backend analítico com **BigQuery** e pipelines com **Python + dbt**.

---

## 📁 Estrutura do Projeto

```
observatudo-bq/
├── dados/
│   └── cidades-sustentaveis/
│       ├── indicadores.csv                 # Fonte bruta
│       └── indicadores_padronizados.csv    # Após pré-processamento
├── scripts/
│   ├── preprocess_cidades_sustentaveis.py  # ETL leve e upload para GCS
│   └── carregar_localidades_ibge.py        # Geração da tabela de localidades
├── src/
│   ├── app/                                 # Next.js App Router
│   │   └── page.tsx                         # Página principal
│   ├── components/
│   │   └── ComboBoxLocalidades.tsx         # Componente dinâmico
│   ├── types/
│   │   └── localidadesDropdown.types.ts    # Tipagens compartilhadas
│   └── data/
│       └── localidades_dropdown.json       # Dados carregados via import no frontend
├── terraform/
│   └── bigquery.tf                         # Infraestrutura no GCP (buckets, tabelas)
├── .gcloudignore
├── .gitignore
└── README.md
```

---

## ✅ Pipeline Atual

### Frontend (Next.js 15+)
- Carregamento de `localidades_dropdown.json` via `import`
- Componente `ComboBoxLocalidades` com seleção UF + cidade
- Interface tipada com TypeScript (`EstadoDropdown`, `CidadeDropdown`)

### Pré-processamento (`scripts/preprocess_cidades_sustentaveis.py`)
- Leitura da fonte original
- Limpeza e padronização
- Conversão do campo `valor` para float
- Estatísticas de cobertura
- Upload para GCS (bruto + processado)

### Tabelas no BigQuery (via Terraform)
- `dim_localidades` ✔️
- `dim_indicadores` ⚙️
- `fact_indicadores` ⚙️

---

## 🔁 Próximos Passos

- [ ] Criar modelo `stg_indicadores__cidades_sustentaveis` no dbt  
- [ ] Popular `dim_indicadores` com metadados enriquecidos  
- [ ] Popular `fact_indicadores` com valores por município  
- [ ] Criar página de indicadores com filtros por local/categoria  
- [ ] Recategorizar eixos com IA supervisionada  

---

## 💡 Estratégia de Modelagem (Dados)

- Star Schema (dimensões + fatos)  
- Tabelas `dim_` e `fact_` com particionamento/clustering  
- Qualidade de dados via dbt (`tests`, `docs`, `sources`)  
- JSONs para metadados flexíveis (`metadados`, `flags`, `formula_calculo`)  

---

## 🛠️ Requisitos

- **Node.js 18+**
- **Python 3.10+**
- **Terraform 1.6+**
- Conta Google Cloud com permissão no projeto

---

## ⚙️ Setup

```bash
# 1. Instalar dependências do frontend
npm install

# 2. Criar ambiente virtual Python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Autenticar na GCP (dev)
gcloud auth application-default login
```

---

## 🚀 Comandos Úteis

```bash
# Executar pré-processamento de dados
python scripts/preprocess_cidades_sustentaveis.py

# Rodar frontend localmente (Next.js)
npm run dev

# Aplicar infraestrutura no GCP
terraform init && terraform apply
```

---

## 🧠 Visão futura

Este projeto visa evoluir para uma **plataforma analítica cívica interoperável**, com:

- Dados versionados e auditáveis
- Normalização assistida por IA
- Visualização Next.js com filtros e gráficos
- Backend analítico via BigQuery + dbt
- CI/CD via GitHub Actions + Terraform + dbt Cloud

---
