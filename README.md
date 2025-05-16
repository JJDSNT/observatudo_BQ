# 📊 Observatudo – Indicadores Cívicos

Plataforma fullstack para ingestão, organização e visualização de indicadores cívicos (como saúde, educação, governança).  
Combina frontend em **Next.js**, backend analítico com **BigQuery** e pipelines com **Python + dbt + Terraform**.

---

## 📁 Estrutura do Projeto

```
observatudo-bq/
├── dados/
│   ├── cidades-sustentaveis/
│   │   ├── indicadores.csv                 # Fonte bruta
│   │   ├── indicadores_padronizados.csv    # Após pré-processamento
│   │   └── indicadores_utf16.csv           # Original
│   └── ibge/localidades/                   # Base de localidades (IBGE)
├── dbt/                                     # Modelos de transformação
├── infra/                                   # Infraestrutura Terraform (GCP)
│   ├── bigquery.tf                          # Tabelas
│   ├── storage.tf                           # Buckets
│   ├── iam.tf                               # Permissões
│   └── ...
├── scripts/
│   ├── carregar_localidades_ibge.py         # Tabela + JSON
│   ├── gerar_dropdown_json.py               # Dropdown de estados/cidades
│   └── preprocess_cidades_sustentaveis.py   # Pré-processamento + upload
├── src/
│   ├── app/                                  # App Router (Next.js)
│   ├── components/                           # Componentes reutilizáveis
│   ├── data/                                 # Dados locais (ex: dropdown)
│   ├── features/                             # Domínios do frontend
│   ├── lib/                                  # Integrações (ex: BigQuery)
│   ├── types/                                # Tipagens TS
│   └── utils/                                # Funções auxiliares
└── README.md
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

- [ ] Criar modelo `stg_indicadores__cidades_sustentaveis` no dbt  
- [ ] Popular `dim_indicadores` com metadados enriquecidos  
- [ ] Popular `fact_indicadores` com valores por município  
- [ ] Estruturar camada de consulta analítica estilo Cube.js  
- [ ] Criar visualizações dinâmicas no frontend

---

## 🛠️ Requisitos

- Node.js 18+
- Python 3.10+
- Terraform 1.6+
- Conta Google Cloud autenticada via:
  ```
  gcloud auth application-default login
  ```

---

## 🚀 Comandos Úteis

```bash
# Ativar ambiente virtual Python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Rodar pré-processamento
python scripts/preprocess_cidades_sustentaveis.py

# Rodar app Next.js localmente
npm install
npm run dev

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

🌐 Acesse: [https://observatudo.com.br](https://observatudo.com.br)

---

## 📬 Contato

- GitHub: [@JJDSNT](https://github.com/JJDSNT)  
- LinkedIn: [https://www.linkedin.com/in/jdiasneto/](https://www.linkedin.com/in/jdiasneto/)