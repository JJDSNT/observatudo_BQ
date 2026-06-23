---
id: ISSUE-0019
title: "Indicadores internacionais"
status: review
priority: high
type: feature
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - localidades
  - dw
  - frontend
  - feature
related_files:
  - apps/datawarehouse/src/observatudo/localidades.py
  - apps/datawarehouse/data/world_bank/paises.csv
  - apps/datawarehouse/src/observatudo/transformers/world_bank.py
  - apps/datawarehouse/sql/silver/world_bank.sql
  - apps/datawarehouse/sql/gold/fact_indicadores.sql
  - apps/datawarehouse/sql/gold/dim_indicadores.sql
  - apps/datawarehouse/scripts/carregar_localidades_ibge.py
  - apps/frontend/src/lib/analytics/mundo.ts
  - apps/frontend/src/app/world/page.tsx
  - apps/api/model/cubes/dim_localidades.js
---

# Resumo

Adicionar suporte a indicadores de outros países, hoje inexistente —
greenfield total (confirmado em investigação anterior: zero scaffolding
para "internacional"/"country"/ISO 3166 em todo o repositório).

# Problema

Hoje `dim_localidades` só tem o Brasil (`pais.csv` com uma única linha) e
todo o pipeline de dados (`raw`/`silver`/`gold`) assume implicitamente
fonte brasileira (IBGE) em todo lugar que lida com localidade. Não existe
hoje nenhum dataset, transformer nem convenção para ingerir indicador de
outro país.

# Objetivo

Primeiro indicador internacional real (de uma fonte concreta a definir)
passando pelo pipeline `raw → silver → gold`, aparecendo no dashboard,
usando o mesmo padrão de resolução de `localidade_id` formalizado em
`ISSUE-0008`.

# O que foi feito

- [x] Fonte escolhida: **World Bank Open Data API** (sem chave, série
      histórica longa por país — mesma família de indicadores do
      Gapminder original).
- [x] Indicadores: trio clássico do Gapminder — PIB per capita
      (`NY.GDP.PCAP.CD`), expectativa de vida (`SP.DYN.LE00.IN`),
      população total (`SP.POP.TOTL`).
- [x] `data/world_bank/paises.csv` (217 países reais, agregados da API
      descartados) gerado por `scripts/buscar_paises_world_bank.py`.
- [x] `resolver_pais_por_iso` em `observatudo/localidades.py`, ao lado
      dos resolvers IBGE existentes.
- [x] `carregar_localidades_ibge.py` estendido: carrega os países do
      mundo em `gold.dim_localidades` (Brasil continua vindo de
      `pais.csv`, sem duplicar).
- [x] `transformers/world_bank.py` (raw) + `sql/silver/world_bank.sql` +
      4ª branch em `fact_indicadores.sql` + 3ª branch em
      `dim_indicadores.sql` + novo `Step` em `pipeline/steps.py`.
- [x] Indicador internacional entrou como fonte nova via `UNION ALL` em
      `fact_indicadores.sql` (não como tabela própria) — mesmo padrão já
      usado por CAPAG/Cidades Sustentáveis.
- [x] Frontend: `lib/analytics/mundo.ts` (consulta ao Cube) +
      `app/world/page.tsx` exibindo tabela com os 3 indicadores por país,
      substituindo o placeholder.
- [x] Pipeline executado em produção: `raw.raw_world_bank` (39.715
      registros), `silver.world_bank`, `gold.dim_indicadores`,
      `gold.fact_indicadores` (fonte `world_bank`: 39.715 linhas, 217
      localidades, anos 1960–2024) e `gold.dim_localidades` recarregada
      (217 países, Brasil íntegro com `capital_localidade_id` preservado).
- [x] `/world` validada com dados reais (`npm run dev`, HTML renderizado
      inspecionado): tabela ordenada por PIB per capita desc (Mônaco,
      Liechtenstein, Bermuda no topo — valores plausíveis), Brasil com
      PIB per capita US$ 10.311, 76.0 anos, 212.0 mi habitantes.

# O que falta fazer

- [ ] Apenas nível país nesta entrega — granularidade de subdivisão
      internacional não foi endereçada (não havia fonte/necessidade
      concreta para isso ainda).
- [ ] Gráfico animado tipo Gapminder (renda × expectativa de vida, cor
      por continente, linha do tempo) — rastreado em `ISSUE-0021`, fora
      do escopo desta issue.

# Decisões tomadas

- Fonte: World Bank Open Data API. Indicadores: PIB per capita,
  expectativa de vida, população total — os 3 eixos clássicos do
  Gapminder, escolhidos para alimentar tanto a tabela simples desta
  entrega quanto o futuro gráfico animado (`ISSUE-0021`).
- `localidade_id` de país internacional = `codigo_iso` (ISO 3166-1
  alpha-2), mesmo padrão já usado para o Brasil (`"BR"`).
- `region` da API do World Bank (ex.: "Latin America & Caribbean") foi
  gravado direto no campo `regiao` de `dim_localidades`, sem reclassificar
  para os 6 continentes do vídeo do Hans Rosling — refinamento, se
  necessário, fica para quando o gráfico animado (`ISSUE-0021`) precisar
  de cor-por-continente.
- Indicador internacional entra via `UNION ALL` em `fact_indicadores.sql`
  (não dataset/tabela própria), mesmo padrão de CAPAG/Cidades
  Sustentáveis — silver já entrega o shape completo do fato (estilo
  `capag.sql`), sem cálculo inline em `fact_indicadores.sql`.
- Armadilha encontrada e corrigida: o código ISO da Namíbia é
  literalmente `"NA"` — sem `keep_default_na=False` no `pd.read_csv`, o
  pandas interpreta como valor nulo e descarta o país silenciosamente.

# Critérios de aceite

- [x] Pelo menos 1 indicador internacional real visível no dashboard
      (3, na prática), com fonte (`world_bank`) e localidade corretas —
      confirmado em produção (BigQuery) e na `/world` renderizada.
- [x] `localidade_id` do(s) país(es) novo(s) segue o mesmo padrão ISO já
      usado para o Brasil (`codigo_iso` populado, `codigo_ibge` nulo).

# Observações

Ver `ISSUE-0008` para o desenho do resolver de `localidade_id` que esta
issue estendeu (sem redesenhar), e a nota explícita ali de que o padrão
Brasil/IBGE e o padrão internacional/ISO coexistem na mesma interface.

Nada de internacional foi encontrado no DVC (`cidades-sustentaveis.dvc`,
`ibge.dvc`, `tesouro-nacional.dvc` são todos Brasil-específicos) — greenfield
confirmado, nada para reaproveitar ou descartar.

Pendências encontradas após o fechamento desta issue — cobertura
temporal real (1960+, não 1800 como o texto da `/world` promete) e a
tabela de eventos históricos referenciada no texto da página —
registradas em `ISSUE-0022`.

`data/world_bank` (CSVs gerados pelo script/transformer desta issue)
ficou fora do DVC inicialmente; corrigido na mesma sessão com
`dvc add data/world_bank` + commit do `.dvc`, trazendo para o mesmo
padrão de `data/ibge`/`data/cidades-sustentaveis`.

# Log de execução

2026-06-22 — Implementação completa do pipeline raw→silver→gold→cube→
frontend para os 3 indicadores World Bank. Execução real aprovada
explicitamente pelo usuário e concluída: `preprocess_world_bank.py` →
`run_pipeline.py` → `carregar_localidades_ibge.py`, todos sem erro.
Validado por query direta no BigQuery (contagens por fonte/tipo) e por
inspeção do HTML renderizado da `/world` com `npm run dev`. Ainda falta
mover a issue para `consolidated/` (critérios de promoção em
`AI_context/consolidated/README.md`) — deixado como próximo passo
deliberado, não parte desta sessão.
