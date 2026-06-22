---
id: ISSUE-0015
title: "Migrar transformers/*.py para o fluxo dvc add/push (em vez de upload_to_bucket manual)"
status: backlog
priority: medium
type: refactor
owner: agent
created_at: 2026-06-22
updated_at: 2026-06-22
tags:
  - dvc
  - dw
  - refactor
related_files:
  - apps/datawarehouse/src/observatudo/io_utils.py
  - apps/datawarehouse/src/observatudo/transformers/capag.py
  - apps/datawarehouse/src/observatudo/transformers/cidades_sustentaveis.py
  - apps/datawarehouse/src/observatudo/config.py
---

# Resumo

Desde a Fase 4 (`ISSUE-0004`), DVC versiona os datasets de
`apps/datawarehouse/data/`, mas os transformers continuam chamando
`upload_to_bucket` manualmente em vez de depender do fluxo `dvc add`/
`dvc push`. Uma tentativa de automatizar isso foi revertida em 2026-06-22
por parecer um fluxo estranho — o problema raiz foi identificado, mas a
correção ainda não foi desenhada.

# Problema

Cada pasta de dados hoje mistura três tipos de conteúdo com ciclos de
vida bem diferentes, e `dvc add <dir>` trata tudo como uma coisa só (um
hash por diretório):

- **raw** (entrada estável): `data/cidades-sustentaveis/indicadores.csv`;
  `data/tesouro-nacional/capag/{estados,municipios}/*.xlsx` (várias
  versões históricas 2018-2023, mas `capag.py` só lê 2 arquivos fixos — o
  resto é histórico parado, sem uso no código).
- **cache/estado incremental do pipeline** (não é "dataset", é memória de
  execuções anteriores): `data/cidades-sustentaveis/cache/
  eixos_llm.json` (cresce run a run), `cache/classificacoes_invalidas.csv`
  (sobrescrito a cada run), `cache/direcionalidade_capag.json` — esse
  último é estado do pipeline do **CAPAG**, fisicamente dentro da pasta
  do Cidades Sustentáveis só porque os dois transformers compartilham o
  mesmo `CACHE_DIR` em `config.py`.
- **output processado** (regenerado a cada run, é o que alimenta o
  BigQuery): `data/cidades-sustentaveis/indicadores_padronizados.csv`,
  `data/tesouro-nacional/capag/preprocessed/indicadores_capag_2022.csv`.

Lixo encontrado de passagem: `data/cidades-sustentaveis/
indicadores_utf16.csv` (38MB) não é lido por nenhum código.

Uma tentativa de chamar `dvc add`/`dvc push` via `subprocess` de dentro do
transformer, a cada execução, num diretório inteiro, foi revertida — não
fazia sentido versionar cache/output da mesma forma que dado de entrada
estável.

# Objetivo

Separar essas três categorias em unidades DVC distintas (raw vs. cache
vs. output, cada uma com seu próprio ciclo de versionamento) e/ou mover
`direcionalidade_capag.json` para um cache do próprio domínio CAPAG; só
então desenhar o fluxo de `dvc add`/`dvc push` automático.

# O que falta fazer

- [ ] Decidir se cache/output devem ser versionados por DVC ou só raw
      (cache/output são reproduzíveis a partir do raw + código, então
      talvez nem devam estar no DVC).
- [ ] Mover `cache/direcionalidade_capag.json` para um cache próprio do
      domínio CAPAG (não misturado com o cache do Cidades Sustentáveis).
- [ ] Remover `data/cidades-sustentaveis/indicadores_utf16.csv` (38MB,
      confirmado sem uso) — ação independente, pode ser feita já.
- [ ] Só depois das decisões acima, desenhar o fluxo de `dvc add`/`dvc
      push` automático (se ainda fizer sentido manter `upload_to_bucket`
      em paralelo ou substituir de fato).

# Decisões tomadas

- Versionar uma pasta inteira como uma unidade DVC só (`dvc add <dir>`)
  quando ela mistura raw/cache/output não é o caminho certo — precisa
  separar antes.

# Observações

Reaberta em 2026-06-22 depois de uma tentativa de implementação revertida
— a causa raiz (mistura de tipos de conteúdo) foi identificada nessa
tentativa, não antes.

# Log de execução

- 2026-06-19 (Fase 4, `ISSUE-0004`): registrada como fora do escopo da
  inicialização do DVC.
- 2026-06-22: tentativa de automatizar `dvc add`/`dvc push` via
  `subprocess` revertida; causa raiz (mistura raw/cache/output por pasta)
  identificada e documentada.
