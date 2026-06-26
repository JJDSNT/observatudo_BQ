---
id: ISSUE-0026
title: "Direcionalidade de indicadores: inferência LLM + propagação + override do usuário"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-26
updated_at: 2026-06-26
tags:
  - frontend
  - datawarehouse
  - pipeline
  - ux
related_files:
  - apps/datawarehouse/src/observatudo/llm.py
  - apps/datawarehouse/sql/gold/fact_indicadores.sql
  - apps/api/model/cubes/fact_indicadores.js
  - apps/api/model/views/indicadores.js
  - apps/frontend/src/lib/analytics/models/indicadorCivico.ts
  - apps/frontend/src/services/indicadores.ts
  - apps/frontend/src/types/indicadores-model.ts
  - apps/frontend/src/store/preferencesStore.ts
  - apps/frontend/src/app/indicadores/page.tsx
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
---

# Resumo

A direcionalidade ("quanto maior, melhor" / "quanto menor, melhor" / "indiferente"
/ "a > b > c") é necessária para que o semáforo verde/amarelo/vermelho do
`MetricCard` (`ISSUE-0024`) funcione corretamente — sem ela não é possível saber
se uma variação positiva é boa ou ruim.

A infraestrutura está parcialmente construída: a coluna `direcionalidade` existe
na tabela gold no BigQuery e o Cube.js a expõe, mas está nula para a fonte
principal (`cidades_sustentaveis`). A função `inferir_direcionalidade()` no
`llm.py` (Ollama local) já consegue inferir o valor a partir da descrição textual
do indicador, mas nunca foi integrada ao pipeline de ingestão. Toda a camada
frontend (modelo Cube.js query, service, tipo TypeScript) não carrega o campo.

# Problema

**Pipeline (datawarehouse):**  
`fact_indicadores.sql` linha 28: `null as direcionalidade` para
`cidades_sustentaveis`. As outras fontes (CAPAG, World Bank, etc.) propagam
o campo vindo das tabelas silver, mas também parecem nunca ter sido preenchidas.
A `inferir_direcionalidade()` em `llm.py` existe e funciona (requer Ollama
local rodando), mas não é chamada em nenhum passo do pipeline.

**Frontend — cadeia parcialmente resolvida:**  
O tipo `Indicador` já tem `direcionalidade?: Direcionalidade | null` e o
`MetricCard` já usa o campo no `calcularSemaforo()`. Porém a propagação via
API ainda está incompleta:
1. `direcionalidade` não está incluído nas `dimensions` da query Cube.js em
   `serieHistoricaBatch()` nem no tipo `PontoSerieIndicador`.
2. A view `indicadores.js` não expõe `direcionalidade` (está em
   `fact_indicadores` por linha de fato, não em `dim_indicadores`).
3. O service `indicadores.ts` não mapeia o campo.

**Sem UX de correção:**  
A inferência por LLM erra — ex.: "Homicídios" pode ser classificado como
"quanto maior, melhor" dependendo do wording. Precisa de uma forma de o
usuário corrigir e confirmar, retroalimentando o banco.

# Objetivo

- `MetricCard` recebe `direcionalidade` no objeto `Indicador` e usa o valor
  para determinar se a variação do último período é boa (verde), ruim
  (vermelho) ou neutra/desconhecida (cinza).
- O usuário pode ver e corrigir a direcionalidade de qualquer indicador a partir
  da própria interface.
- Correções do usuário retroalimentam o BigQuery (ou uma camada de override
  local persistida até que sincronize com o BQ).

# O que falta fazer

**Datawarehouse / pipeline:**
- [ ] Integrar `inferir_direcionalidade()` (`llm.py`) no pipeline de ingestão
      do `cidades_sustentaveis` — rodar durante o pré-processamento (ETL) e
      persistir o resultado na coluna `direcionalidade` da tabela silver, para
      que o `fact_indicadores.sql` a herde (não precisa de `null as` para essa
      fonte).
- [ ] Decidir se a inferência LLM roda uma vez (seed manual) ou a cada run
      do pipeline quando o campo estiver null.

**Frontend — propagação da API:**
- [ ] Expor `direcionalidade` na view `indicadores.js` — campo está em
      `fact_indicadores` (não em `dim_indicadores`); opção: adicionar ao bloco
      `fact_indicadores` do `join_path` na view, ou criar dimensão derivada
      em `dim_indicadores` via `any_value`.
- [ ] Adicionar `direcionalidade` às `dimensions` em `serieHistoricaBatch()`
      (`indicadorCivico.ts`) e ao tipo `PontoSerieIndicador`.
- [ ] Mapear em `indicadores.ts`: campo constante por indicador, pegar de
      `primeiro?.direcionalidade`.

**UX de override — decisão tomada (2026-06-26):**
- **Onde:** página `/indicadores` (já tem `IndicadorSearch`, está pela metade).
  O usuário busca o indicador, vê todos os metadados e escolhe a direcionalidade
  num seletor de 4 opções.
- **Como persistir:** `preferencesStore` (Zustand persist, LocalStorage) com
  uma nova chave `direcionalidadeOverrides: Record<string, Direcionalidade>`.
  Simples, não requer backend; tradeoff: local por dispositivo.
- **Como aplicar:** em `calcularSemaforo()` no `MetricCard` ou no hook de
  dados, com lógica `overrides[id] ?? indicador.direcionalidade ?? null`.
- [ ] Implementar: novo campo no store → seletor na página `/indicadores` →
      aplicar override no `MetricCard`.

**MetricCard (`ISSUE-0024`):**
- [ ] Usar `indicador.direcionalidade` no cálculo do semáforo:
      - `"quanto maior, melhor"` → aumento = verde, queda = vermelho
      - `"quanto menor, melhor"` → queda = verde, aumento = vermelho
      - `"indiferente"` → sempre amarelo (variação existe mas não tem juízo)
      - `null` / `undefined` → cinza (desconhecido; mostrar prompt de
        configuração)
      - `"a > b > c"` → comparação categórica (tratamento especial, ver
        observações)

# Decisões tomadas

- `inferir_direcionalidade()` usa Ollama local — disponível só na máquina de
  desenvolvimento, não no CI/CD. A inferência deve ser um passo manual ou
  opcional no pipeline, não bloqueante.
- Os 4 valores possíveis definidos em `llm.py`: `"quanto maior, melhor"`,
  `"quanto menor, melhor"`, `"indiferente"`, `"a > b > c"`.

# Critérios de aceite

- [ ] `Indicador.direcionalidade` chega preenchido no frontend para ao menos
      os indicadores do `cidades_sustentaveis` que passaram pela inferência LLM.
- [ ] `MetricCard` exibe semáforo verde/vermelho/cinza com base em
      `direcionalidade`.
- [ ] O usuário consegue alterar a direcionalidade de um indicador pela UI e
      a mudança persiste entre sessões.

# Observações

`"a > b > c"` é o caso de indicadores categóricos com ordem (ex.: CAPAG
A > B > C > D). O semáforo para esses casos precisa de lógica diferente —
comparar `nota` em vez de `valor`, usando a ordem definida. Pode ser tratado
numa sub-issue ou na mesma, mas não é o caminho crítico para o lançamento
inicial do semáforo.

A issue `ISSUE-0024` (MetricCard) depende desta para a lógica de semáforo
funcionar. O `MetricCard` pode ser lançado antes com semáforo cinza (campo
ausente) e evoluir quando esta issue for resolvida.

# Log de execução

## Sessão 2026-06-26 — estado atual e decisões

**O que foi feito:**
- Tipo `Direcionalidade` e campo `direcionalidade?: Direcionalidade | null`
  adicionados ao tipo `Indicador` (`indicadores-model.ts`).
- `MetricCard.calcularSemaforo()` já usa `indicador.direcionalidade` para
  determinar o semáforo verde/vermelho/amarelo/cinza.
- `formula` propagada pela cadeia completa como referência de como fazer o
  mesmo para `direcionalidade` (view → query → tipo → service → UI).

**O que falta:**
- Propagação da API até o frontend (3 pontos acima).
- Implementação da UX de override na página `/indicadores`.
- Pipeline datawarehouse: `inferir_direcionalidade()` integrada ao ETL do
  `cidades_sustentaveis`.

**Decisão de override:** `preferencesStore` + página `/indicadores` (ver seção
acima).
