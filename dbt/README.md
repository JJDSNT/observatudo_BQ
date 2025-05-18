# Observatudo Data Pipeline – Módulo Analítico (dbt/BigQuery)

## 1. Integração Analítica – dbt/BigQuery

### Objetivo
Padronizar e escalar a modelagem, transformação, testes e documentação dos dados processados pelo pipeline Python, facilitando o consumo analítico no BigQuery.

### Abordagem Técnica

- **Templates de Modelos dbt**
  - Para cada dataset, criar modelos `stg_*` (stage) no dbt para:
    - Cast seguro de tipos (`integer`, `float`, `string`)
    - Limpeza/padronização adicional
    - Filtros de registros inválidos
    - Inclusão de colunas técnicas (data de processamento, fonte, etc.)
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

### Estrutura de Diretórios/Arquivos Sugerida

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

### TODO Inicial

- [ ] Criar templates SQL/YAML para modelos dbt por dataset
- [ ] Automatizar trigger do dbt após ingestão de dados
- [ ] Padronizar e salvar logs estruturados para todas execuções do dbt
- [ ] Implementar rotina de versionamento para configs e outputs
- [ ] Documentar fluxo analítico end-to-end e práticas de auditoria/versionamento

### Testes de qualidade de dados no dbt

Para garantir a confiabilidade e integridade das tabelas geradas pelo pipeline analítico, é fundamental implementar testes automáticos no dbt que validem os dados a cada execução. 

Um teste essencial a ser configurado é o `not_null` na coluna `data_referencia` da tabela fato (`fact_indicadores`). Esse teste garante que todos os registros possuam uma data de referência válida, evitando a inserção de dados com datas faltantes ou inválidas, o que comprometeria análises temporais e relatórios.

Além disso, recomenda-se combinar esse teste com filtros na transformação para excluir registros sem `data_referencia`, mantendo a consistência do banco de dados.

A adoção desses testes automatizados deve fazer parte do fluxo de deploy do Observatudo, fortalecendo a governança dos dados, facilitando auditorias e permitindo a detecção rápida de inconsistências para intervenções eficazes.

---
