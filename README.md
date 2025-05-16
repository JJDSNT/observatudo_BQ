# 📊 Observatudo – Indicadores Cívicos

Projeto de ingestão, organização e exploração de indicadores cívicos (como saúde, educação, governança) com dados abertos provenientes de múltiplas fontes. Utiliza BigQuery como base analítica, Python para pré-processamento e dbt para modelagem e governança de dados.

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
│   └── data/
│       └── localidades_dropdown.json       # Dados para uso no frontend
├── terraform/
│   └── bigquery.tf                         # Infraestrutura no GCP (buckets, tabelas)
├── .gcloudignore
├── .gitignore
└── README.md
```

---

## ✅ Pipeline Atual

### 1. Pré-processamento (`scripts/preprocess_cidades_sustentaveis.py`)
- Lê a fonte bruta `indicadores.csv`
- Padroniza colunas, sanitiza valores, converte `valor` para `FLOAT`
- Gera CSV limpo `indicadores_padronizados.csv`
- Realiza upload dos arquivos para o bucket GCS

### 2. Upload para GCS
- `indicadores/brutos/cidades-sustentaveis/indicadores.csv`
- `indicadores/processados/cidades-sustentaveis/indicadores.csv`

### 3. Tabelas BigQuery (via Terraform)
- `dim_localidades`: localidades IBGE hierarquizadas
- `dim_indicadores`: metadados dos indicadores (em construção)
- `fact_indicadores`: valores associados a local/data/indicador (em construção)

---

## 🔁 Próximos Passos

- [ ] Criar modelo `stg_indicadores__cidades_sustentaveis` no dbt  
- [ ] Implementar testes de qualidade de dados (dbt)  
- [ ] Normalizar categorias com IA ou mapeamento manual  
- [ ] Popular `dim_indicadores` e `fact_indicadores`  
- [ ] Habilitar views e dashboards exploratórios  

---

## 💡 Estratégia de Modelagem

- Star Schema (dimensões + fatos)  
- Particionamento por data  
- Clustering por `indicador_id` e `localidade_id`  
- Recategorização por IA (eixo temático → enum `Eixos`)  

---

## 🛠️ Requisitos

- Python 3.10+
- Ambiente virtual:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- Acesso ao GCP via:

```bash
gcloud auth application-default login
```

---

## 🚀 Execução local

```bash
# Ativar o ambiente
source .venv/bin/activate

# Executar o pré-processamento
python scripts/preprocess_cidades_sustentaveis.py
```

---

## 🧠 Visão futura

Este projeto visa evoluir para uma plataforma analítica cívica interoperável, com:
- Dados versionados e auditáveis  
- Modelo semântico flexível (recategorização por IA)  
- Visualização integrada (Next.js + API)  
- Pipeline unificado com GitOps + Terraform + dbt



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
