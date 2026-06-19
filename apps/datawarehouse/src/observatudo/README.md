# Observatudo Data Pipeline – Pipeline Modular, LLM, Logs, Versionamento

## 1. Ajustes Lógicos de Convergência no Resultado do LLM

### Problema
Ao classificar indicadores usando LLM, podem ocorrer divergências entre execuções: um mesmo registro pode receber classificações diferentes em execuções diferentes, especialmente conforme o prompt evolui ou o modelo é atualizado. Isso prejudica a confiabilidade e dificulta auditoria.

### Abordagem Técnica

- **Cache de Classificações (incluindo divergentes)**
  - Manter um cache persistente para cada `id_indicador` (ou PK relevante) com o resultado mais recente da classificação LLM.
  - Ao rodar o pipeline:
    - Sobrescrever o cache de categorias inválidas a cada execução.
    - Quando a classificação diverge da armazenada, registrar em um cache terciário de divergentes (mantendo histórico).
    - Quando a classificação converge entre atual, armazenada e divergente, remover do cache de divergentes e marcar como "estável" (não reprocessar futuramente).
    - Se não se enquadrar em nenhuma categoria, responder com `outros`, `indefinido` ou opção pré-definida.
  - Permitir marcar um registro como definitivo após N execuções consecutivas iguais (N parametrizável).
  - Exemplo de estrutura:
    ```json
    {
      "indicador_id": "12345",
      "classificacao_atual": "Educacao",
      "classificacoes_anteriores": ["Economia", "Educacao"],
      "convergente": true,
      "qtd_execucoes_iguais": 2
    }
    ```

- **Flags e Metainformações**
  - Cada registro deve indicar estado: convergente, divergente ou em transição (campo booleano ou enumerado).
  - Registrar quantidade de execuções consecutivas iguais.

- **Logs e Auditoria**
  - Gerar logs automáticos dos casos divergentes.
  - Gatilho de alerta se um registro oscilar por mais de X execuções.

---

## 2. Estratégias para Melhoria do Prompt do LLM

### Contexto
A qualidade da classificação automática feita pelo LLM depende da clareza e detalhamento do prompt. Prompts genéricos levam a respostas inconsistentes. Exemplos explícitos ajudam o modelo a aderir ao enum de categorias esperado.

### Abordagem Técnica

- **Prompt detalhado**
  - Listar explicitamente todas as categorias permitidas (enum).
  - Instruir o modelo a responder SOMENTE com o nome exato da categoria, sem explicações.
  - Adicionar exemplos explícitos cobrindo todo o espectro do enum.
  - Usar arquivos compartilhados (YAML, JSON, Python) para manter exemplos atualizados por fonte/dataset.

- **Exemplo de Prompt**
  ```
  Classifique o seguinte indicador em UMA das categorias abaixo (responda apenas com o nome exato da categoria):

  Categorias permitidas:
  - Saude
  - Educacao
  - Economia
  ...

  Exemplos de classificação:
  Indicador: "Taxa de mortalidade infantil"
  Categoria: Saude
  ...

  Agora, classifique:
  Indicador: "{texto_a_classificar}"
  Categoria:
  ```

- **Benefícios**
  - Reduz variação nas respostas ("Educação" vs "Educacao" etc.).
  - Evita respostas longas, explicativas ou múltiplas categorias.
  - Facilita mapeamento downstream no pipeline.

- **Futuro**
  - Gerar prompts dinamicamente, permitir configuração e atualização fácil dos exemplos.
  - Testar empiricamente (A/B) a assertividade com e sem exemplos.

---

## 3. Política de Prioridade para Categoria/Eixo

- Se existir campo explícito de categoria (`eixo`, `categoria`, etc.), **sempre usar esse valor**. Registrar como "categoria da fonte".
- Se o campo está ausente/nulo, acionar classificador automático (LLM, regra etc.), registrar como "categoria por LLM".
- No pipeline modularizado, essa lógica é universal: recebe parâmetro/config apontando para o campo prioritário de categoria.
- Para cada registro:
  - Se campo está preenchido: usar diretamente.
  - Se não: chamar classificador automático.
- No resultado, campo de categoria sempre preenchido e campo auxiliar `eixo_origem = fonte|llm|regra` para rastreabilidade.

---

## 4. Modularização para Múltiplas Fontes/Datasets

### Abordagem Técnica

- **Configuração Declarativa por Fonte/Dataset**
  - Cada fonte possui um diretório de configuração (ex: `configs/ibge/`, `configs/cidades_sustentaveis/`).
  - Dentro de cada fonte, um ou mais arquivos de configuração para cada dataset.
    - Exemplo: `configs/ibge/demografia_2020.yaml`, `configs/ibge/demografia_2021.yaml`
  - Cada config define: caminho dos dados, schema, campos de categoria, exemplos de prompt, regras de update, etc.

- **Pipeline Central Genérico**
  - Recebe como parâmetro o caminho para a configuração do dataset (CLI ou agendador).
  - Reuso máximo de funções utilitárias (leitura, validação, classificação, cache, logging).
  - Hooks opcionais para pré/pós-processamento específico por fonte/dataset.

- **Estrutura Sugerida**
  ```
  observatudo/
    pipeline/
      base.py
      stats_utils.py
      cache_utils.py
      config_templates/
      ...
    configs/
      ibge/
        demografia_2020.yaml
        demografia_2021.yaml
      cidades_sustentaveis/
        ...
    transformers/
      run_dataset.py  # CLI: run_dataset.py --config configs/ibge/demografia_2020.yaml
    dataset_runner.py
    ...
  ```

---

## 5. Abordagem de Manutenção para Update (Atualização de Dados)

- **Configuração de Modo de Update por Dataset**
  - Campo `update_mode` em cada config: `full` ou `incremental`
    - **full:** processa tudo do zero (útil para cargas pequenas ou reconstrução)
    - **incremental:** processa apenas registros novos/alterados (identificação via timestamp, hash, etc.)

- **Controle de Histórico**
  - Para `incremental`, manter registro de última execução/processamento (timestamp, batch_id, etc.)
  - Marcar no cache/resultados a origem da atualização (`full`/`incremental`, data/hora)

- **Reprocessamento e Limpeza**
  - Em update incremental, prever lógica para reprocessar seletivamente registros alterados (não só adicionar)
  - Estratégia para lidar com exclusões/correções (ex: flag `ativo`, soft delete, etc.)

- **Exemplo de Campos em Config**
  ```yaml
  dataset:
    name: demografia_2020
    source: ibge
    update_mode: incremental
    unique_key: id_indicador
    last_update: "2024-05-01T00:00:00"
    ...
  ```

- **Logs de Atualização**
  - Registrar cada execução de update (full ou incremental): quantidade de registros processados, tempo, erros.

---

## 6. Pilares de Modularização, Reuso e Plugabilidade

- Funções utilitárias para estatísticas, logging, cache, classificação, upload etc.
- Nada de lógica “hardcoded” por dataset – tudo orientado a configuração.
- Pipeline genérico (“DatasetPipeline”): leitura, pré-processamento, classificação (LLM/regra), caches, estatísticas, upload, hooks para extensão.
- Suporte fácil a outros classificadores (regra, LLM, API), outputs (CSV, JSON, Parquet, banco), uploads (GCS, S3, etc).

---

## 7. Logs e Estatísticas Padronizados

- Função/classe central para receber DataFrame + paths de cache, calcular e logar todas as métricas (total, únicos, classificados, inválidos, etc.)
- Salvar/exportar estatísticas e logs estruturados, facilitando auditoria e evolução.

---

## 8. Monitoramento Operacional, Observabilidade e Auditoria/Versionamento

### 8.1. Monitoramento e Observabilidade Operacional

- **Métricas Automáticas:** tempo de execução, uso de CPU/RAM, volumetria de dados, taxa de sucesso/falha
- **Logs Estruturados:** status por etapa, detalhes de falhas, divergências
- **Alertas:** (opcional) trigger para erros críticos ou taxa de falha alta

### 8.2. Versionamento e Auditoria

- **Versionamento de Configs:** git/snapshots, registrar versão usada por run
- **Versionamento de Dados:** output versionado, metadados por execução (data, batch_id, parâmetros)
- **Histórico de Execuções:** log CSV/JSON consolidado com dataset, horário, config, volume, erros/sucesso
- **Comparação de Versões:** notebook/script para comparação entre runs

---

## Resumo Visual

```
1. Convergência LLM: cache + comparação automática + regras/flags de estabilidade/divergência + log/auditoria
2. Estratégia de prompt: enums claros, exemplos explícitos, resposta padronizada
3. Política de prioridade: sempre campo explícito de categoria se houver, senão LLM
4. Modularização: configs por fonte/dataset, pipeline genérico, máxima reutilização/extensão
5. Update: modo full/incremental configurável, controle de histórico, logs detalhados
6. Logs/estatísticas padronizados, rastreabilidade completa
7. Monitoramento e versionamento: rastreabilidade, rollback, comparação de runs
