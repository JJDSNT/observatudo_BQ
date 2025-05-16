# Observatudo Data Pipeline – Documentação Técnica dos Módulos Analíticos, Observabilidade, Versionamento e Dashboard

## 1. Integração Analítica – dbt/BigQuery

### Objetivo
Padronizar e escalar a modelagem, transformação, testes e documentação dos dados processados pelo pipeline Python, facilitando o consumo analítico no BigQuery.

### Abordagem Técnica

- **Templates de Modelos dbt**
  - Para cada dataset, criar modelos `stg_*` (stage) no dbt para:
    - Cast seguro de tipos (integer, float, string)
    - Limpeza/padronização adicional
    - Filtros de registros inválidos
    - Inclusão de colunas técnicas (data processamento, fonte, etc.)
  - Criar modelos `dim_*` (dimensões) e `fact_*` (fatos) conforme necessário
  - Centralizar enums, eixos, categorias em seeds/tabelas auxiliares

- **Testes e Documentação**
  - Configurar testes dbt: `not_null`, `unique`, `accepted_values`, etc.
  - Adicionar documentação (`.yml`) para cada modelo, campo e categoria

- **Esteira de Deploy**
  - Automatizar execução: ingestão Python → upload bucket → load BigQuery → run dbt
  - Variáveis de ambiente/configs para schema, dataset e credenciais

- **Estatísticas e Auditoria**
  - Gerar relatórios via dbt docs (volumetria, atualização, falhas)
  - (Opcional) Extrair métricas customizadas para painéis/dashboards

- **Extensibilidade**
  - Garantir estrutura modular para onboarding rápido de novos datasets (template SQL/YAML + config + script de ingestão)

---

## 2. Dashboard/UI de Observabilidade

### Objetivo
Fornecer visibilidade operacional, facilitar diagnóstico e acompanhamento dos pipelines e dados.

### Abordagem Técnica

- **Primeiro Passo (mínimo viável)**
  - Notebook ou painel web simples apresentando:
    - Histórico de execuções dos pipelines (data/hora, status, duração, erro)
    - Volumetria de dados processados por dataset
    - Principais métricas de qualidade (taxa de sucesso, falha, convergência, etc.)

- **Evolução**
  - Dashboard web (ex: Dash, Streamlit, FastAPI+React) mostrando:
    - Estado atual e últimas execuções dos pipelines
    - Estatísticas e logs de atualização/incrementos
    - Status de integração com dbt/BigQuery
    - Resumo de divergências/convergências do LLM
    - Histórico e versão dos datasets e configurações

- **Fonte dos dados**
  - Utilizar arquivos de logs estruturados, metadados gerados pelo pipeline, outputs do dbt docs
  - (Opcional) API para consulta em tempo real

---

## 3. Monitoramento Operacional, Observabilidade e Auditoria/Versionamento de Datasets

### 3.1. Monitoramento e Observabilidade Operacional

#### Objetivo
Garantir rastreabilidade, performance, saúde e facilidade de diagnóstico dos pipelines em produção.

#### Abordagem Técnica

- **Métricas Automáticas**
  - Tempo de execução, uso de CPU/RAM (se possível), volumetria de dados por run
  - Taxa de sucesso/falha por dataset/fonte

- **Logs Estruturados**
  - Padronizar logs (JSON, CSV, etc.) para fácil parsing/consulta
  - Gravar logs de status por etapa (ingestão, classificação, update, upload, etc.)
  - Registrar detalhes de falhas, execuções incompletas, divergências de classificação

- **Alerta e Diagnóstico**
  - (Opcional) Gatilho para alerta automático em caso de erros críticos ou taxa de falha alta

---

### 3.2. Versionamento e Auditoria de Datasets/Configs

#### Objetivo
Manter histórico, rastreabilidade e capacidade de comparar versões de configs/resultados, permitindo auditoria e rollback.

#### Abordagem Técnica

- **Versionamento de Configurações**
  - Manter versões dos arquivos de configuração (usar git, snapshots, ou versionamento manual)
  - Registrar em logs e outputs qual versão de config/modelo foi usada em cada run

- **Versionamento dos Dados Resultantes**
  - Armazenar output/resultados versionados (com timestamp, batch_id, ou hash)
  - Guardar metadados de cada execução: data, parâmetros, quantidade processada, origem dos dados

- **Histórico de Execuções**
  - Criar log consolidado (CSV, banco, ou JSON) com o histórico das execuções: dataset, horário, config usada, volume, erros/sucessos

- **Comparação de Versões**
  - Ferramenta (notebook ou script) para comparar resultados e configs entre execuções (identificar mudanças, regressões, avanços)

---

## Estrutura Sugerida de Pastas/Arquivos

```
observatudo/
  dbt/
    models/
    seeds/
    macros/
    ...
  dashboard/
    app.py
    requirements.txt
    static/
    ...
  logs/
    pipeline_YYYYMMDD.jsonl
  audit/
    dataset_executions.csv
    config_snapshots/
      cidades_sustentaveis_v20240516.yaml
      ...
  scripts/
    compare_runs.py
```

---

## TODO Inicial

- [ ] Criar templates SQL/YAML para modelos dbt por dataset
- [ ] Automatizar trigger do dbt após ingestão de dados
- [ ] Desenvolver notebook ou dashboard web básico com histórico das execuções
- [ ] Padronizar e salvar logs estruturados para todas execuções
- [ ] Implementar rotina de versionamento para configs e outputs
- [ ] Criar registro de histórico de execuções e script de comparação
- [ ] Documentar fluxo analítico end-to-end e práticas de auditoria/versionamento

