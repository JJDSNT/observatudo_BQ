---
id: ISSUE-0008
title: Fix — CAPAG estadual ausente na área do estado
status: consolidated
priority: high
type: bug
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - capag
  - localidades
  - bigquery
  - frontend
  - bug
related_files:
  - apps/datawarehouse/src/observatudo/localidades.py
  - apps/datawarehouse/scripts/carregar_localidades_ibge.py
  - apps/datawarehouse/src/observatudo/transformers/capag.py
  - apps/datawarehouse/sql/silver/capag_agregado.sql
  - apps/api/model/cubes/dim_localidades.js
  - apps/datawarehouse/scripts/gerar_dropdown_json.py
  - apps/frontend/src/services/fetchIndicadores.ts
  - apps/frontend/src/lib/analytics/localidadeUtils.ts
---

# Resumo

O indicador CAPAG (Capacidade de Pagamento, Tesouro Nacional) é estadual e
municipal, mas só aparecia na área do município no dashboard. Causa raiz
dupla, em duas camadas independentes: formato de `localidade_id`
inconsistente na camada de dados (decisão deixada aberta em `ISSUE-0007`),
e um bug separado no frontend que descartava os dados de estado/país
mesmo quando a API já os retornava corretamente.

# Problema

**Camada de dados**: `dim_localidades.localidade_id` misturava convenções
por tipo sem padronização — país usa sigla ISO 3166-1 (`"BR"`), estado um
híbrido `"BR-{SIGLA}"` (formato ISO 3166-2, nunca documentado como tal),
município o código IBGE de 7 dígitos puro. `transformers/capag.py::
load_capag_estados` copiava a sigla bruta da UF (`"SP"`) direto para
`localidade_id`, sem nunca bater com o formato `"BR-SP"` esperado por
`dim_localidades` — o join no Cube.js (`fact_indicadores.localidade_id =
dim_localidades.localidade_id`) nunca encontrava a linha. Adicionalmente,
`silver/capag_agregado.sql` tinha `SAFE_CAST(localidade_id AS INT64) IS
NOT NULL`, que descartava toda nota agregada de estado (formato não
numérico) mesmo depois de corrigido o formato.

Também encontrado: `data/ibge/localidades/estados.csv` tem espaço em
branco no início da coluna `SIGLA` (`" SP"`), nunca tratado em
`carregar_localidades_ibge.py` — contaminava `sigla`/`localidade_id`/
`localidade_pai_id` de toda a tabela já carregada em produção.

**Camada de frontend (bug independente, descoberto só ao testar o fluxo
completo no navegador)**: `services/fetchIndicadores.ts` lia
`json.municipio.subeixos` da resposta da API, mas fixava
`subeixos: []` (hardcoded) para `estado` e `pais`, descartando os dados
que a API (`getLocalidadeFullPorSubeixos`) já retornava para esses dois
níveis. Esse bug por si só garantia a seção "Estado" vazia no
`Dashboard.tsx`, **independente** de qualquer correção na camada de
dados — os dois bugs eram cada um suficiente para causar o sintoma
relatado.

# Objetivo

CAPAG estadual visível na área do estado, com a nota oficial correta
(A/B/C/D), e um padrão genérico e reutilizável de resolução de
`localidade_id` para qualquer dataset brasileiro futuro em nível de
estado/município — sem reabrir o mesmo problema a cada novo dataset
(inclusive indicadores internacionais, que vão precisar de um resolver
próprio baseado em ISO, convivendo com o resolver IBGE, não o
substituindo).

# O que foi feito

- **Novo módulo resolver** (`observatudo/localidades.py`): lê as fontes
  canônicas do IBGE (DVC: `estados.csv`, `municipios_c_capital.csv`,
  `pais.csv`) e expõe `resolver_estado_por_sigla`,
  `resolver_municipio_por_codigo_ibge`, `resolver_estado_de_municipio` —
  formaliza o cruzamento que já existia inline em
  `carregar_localidades_ibge.py`, reutilizável por qualquer transformer
  futuro.
- **`carregar_localidades_ibge.py`**: `.str.strip()` nas colunas string
  das fontes (corrige a contaminação por espaço); campo único
  `codigo_oficial` (ambíguo) dividido em `codigo_ibge` (2 dígitos
  estado/7 município, nulo país) e `codigo_iso` (alpha-2 país, ISO 3166-2
  estado, nulo município); `localidade_pai_id` de cidades passa a usar o
  resolver.
- **`transformers/capag.py::load_capag_estados`/`load_capag_municipios`**:
  usam o resolver em vez de copiar a chave bruta da fonte (sigla/código
  IBGE) direto para `localidade_id`. Também passou a descartar linhas de
  rodapé da planilha do Tesouro (nota de rodapé, linha em branco) antes
  de resolver — a planilha real tinha 2 linhas de lixo depois da última
  UF que nunca tinham sido filtradas.
- **`silver/capag_agregado.sql`**: `SAFE_CAST(localidade_id AS INT64) IS
  NOT NULL` trocado por `localidade_id IS NOT NULL` — a validade do
  formato agora é garantida na origem pelo resolver, não precisa ser
  re-inferida via cast.
- **`apps/api/model/cubes/dim_localidades.js`**: dimensão `codigo_oficial`
  trocada pelas duas novas (`codigo_ibge`, `codigo_iso`).
- **`gerar_dropdown_json.py`**: `value` do estado no JSON passa a ser
  `localidade_id` canônico (`"BR-SP"`), não mais a sigla bruta — `label`
  continua a sigla, para exibição.
- **`fetchIndicadores.ts`**: para de fixar `subeixos: []` para
  `estado`/`pais` — passa a ler `json.estado`/`json.pais` da resposta da
  API, mesmo caminho já usado para `municipio`.
- **`localidadeUtils.ts::getInfoMunicipio`**: `sigla` retornada passa a
  vir de `estado.label` (sigla pura, ex. `"SP"`), não de `estado.value`
  (que virou o `localidade_id` canônico `"BR-SP"`) — evita exibir o id de
  join como se fosse a sigla amigável.
- Ações em produção executadas e verificadas: `gold.dim_localidades`
  recarregada (schema novo, dados limpos — 1 país, 27 estados, 5570
  municípios, zero linhas com espaço em branco); `raw.raw_capag`
  repropagado via `preprocess_capag.py`; pipeline `silver → gold`
  reexecutado; `localidades_dropdown.json` regenerado e commitado.

# Decisões tomadas

- `localidade_id` é um **id interno (surrogate)**, não a chave natural de
  nenhuma autoridade externa — nem IBGE (não numera país, não existe fora
  do Brasil) nem ISO (não desce a nível de município) cobrem todos os
  níveis e todos os países sozinhas. Os códigos de autoridades externas
  (`codigo_ibge`, `codigo_iso`) ficam em campos de cruzamento separados,
  usados só para resolver/validar dado de entrada — não como chave de
  join.
- O tratamento Brasil-específico (resolver baseado em IBGE) e um futuro
  tratamento internacional (resolver baseado em ISO) **coexistem** na
  mesma interface — o módulo `localidades.py` cresce com
  `resolver_pais_por_iso`/`resolver_subdivisao_por_iso` quando indicadores
  internacionais entrarem, sem alterar as funções IBGE existentes.
- Nenhuma spec nova criada para essa convenção — ela já estava
  implicitamente correta em `dim_localidades` (formato ISO 3166-1/3166-2
  para país/estado); o bug era o CAPAG não respeitá-la, não o formato em
  si estar errado.

# Critérios de aceite

- [x] `gold.dim_localidades` recarregada com `codigo_ibge`/`codigo_iso`
      separados, sem espaço em branco em `sigla`/`localidade_id`.
- [x] `gold.fact_indicadores` tem as 27 notas estaduais do índice CAPAG
      agregado (`indicador_id = 'capag'`), joináveis com
      `dim_localidades` por `localidade_id`.
- [x] Nota exibida (`B` para São Paulo) confirmada contra a planilha
      oficial do Tesouro Nacional (`CAPAG = B` na linha `UF = SP`),
      rastreada ponta a ponta por `silver.capag` → `silver.capag_agregado`
      → `fact_indicadores`.
- [x] Testado no navegador (Playwright + dev server real): seção "Estado"
      do dashboard mostra o card "Índice CAPAG Agregado" com nota `B`
      para São Paulo — antes da correção, a seção aparecia vazia.
- [x] `npx tsc --noEmit` sem erros após o fix de `fetchIndicadores.ts`.
- [x] Commit criado (`a92c91d`).

# Observações

Esta issue resolve a decisão aberta registrada em `ISSUE-0007`
("Formato de `localidade_id` inconsistente entre fontes para
estados/país") e o item correspondente em "Ideias para o futuro"
("CAPAG não aparece em estado/país no dashboard") do antigo
`REFACTOR_CONTEXT.md`.

Pendente, fora do escopo desta issue: deploy do Cube.js com o cube
`dim_localidades.js` atualizado (a troca de `codigo_oficial` por
`codigo_ibge`/`codigo_iso` só existe localmente ainda — não bloqueia o
fix em si, porque o join usado pelo frontend não depende desse campo).

# Log de execução

- 2026-06-22: causa raiz da camada de dados investigada e confirmada via
  query real no BigQuery (zero linhas de CAPAG estadual alcançáveis pelo
  join antes do fix).
- 2026-06-22: desenho do resolver e separação `codigo_ibge`/`codigo_iso`
  alinhado com o usuário (decisão de que o padrão genérico e o
  tratamento Brasil-específico via IBGE coexistem, não se substituem).
- 2026-06-22: implementação completa (resolver, loader, transformer,
  SQL, cube, dropdown script) e ações em produção executadas após
  confirmação explícita do usuário.
- 2026-06-22: testado ponta a ponta no navegador — achado o segundo bug
  (frontend descartando dados de estado/país), corrigido na mesma sessão.
- 2026-06-22: nota "B" de São Paulo verificada contra a planilha oficial
  do Tesouro Nacional. Commit `a92c91d` criado.
