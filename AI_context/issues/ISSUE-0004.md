---
id: ISSUE-0004
title: Fase 4 — Inicializar DVC dentro de apps/datawarehouse
status: consolidated
priority: high
type: infra
owner: agent
created_at: 2026-06-19
updated_at: 2026-06-19
tags:
  - dvc
  - dw
  - infra
related_files:
  - apps/datawarehouse/.dvc
  - apps/datawarehouse/data/cidades-sustentaveis.dvc
  - apps/datawarehouse/data/ibge.dvc
  - apps/datawarehouse/data/tesouro-nacional.dvc
  - apps/datawarehouse/package.json
---

# Resumo

DVC inicializado dentro de `apps/datawarehouse` (não na raiz do
monorepo), com remote GCS, versionando os três domínios de dados crus que
antes viviam direto no Git sem relação rastreada com o bucket.

# Problema

Datasets crus (`dados/*.csv`, depois `data/*` pós-Fase 2) viviam no Git
sem relação rastreada com o que efetivamente estava no bucket GCS —
qualquer divergência entre o que o código lia localmente e o que estava
no bucket não era detectável.

# Objetivo

`dvc init` escopado em `apps/datawarehouse`, remote GCS configurado,
`dvc add` nos datasets atuais, `.gitignore` atualizado.

# O que foi feito

- `dvc init --subdir` dentro de `apps/datawarehouse`.
- Remote `gcs` configurado em `gs://observatudo-infra-www-data/dvc-store`
  — bucket único reaproveitado (decisão: simplicidade operacional para o
  tamanho atual do projeto; prefixo `dvc-store/` já separa logicamente do
  que os transformers escrevem em `indicadores/...`).
- `git rm -r --cached` + `dvc add` nos três domínios de dados
  (`data/cidades-sustentaveis`, `data/ibge`, `data/tesouro-nacional` —
  ~98MB, 25 arquivos), gerando `.dvc` + `data/.gitignore`.
- `package.json` ganhou `dvc:status`/`dvc:pull`/`dvc:push`.
- `dvc push` real executado em 2026-06-19 após reautenticação
  (`gcloud auth application-default login`) — 28 arquivos enviados a
  `gs://observatudo-infra-www-data/dvc-store`.

# Decisões tomadas

- Bucket único reaproveitado (`*-www-data`) em vez de criar um bucket DVC
  dedicado.
- DVC inicializado dentro de `apps/datawarehouse` (não na raiz do
  monorepo) — escopo do versionamento de dados é só o app que os consome.

# Critérios de aceite

- [x] `dvc status` → "up to date".
- [x] `dvc doctor` → remote `gs` reconhecido.
- [x] `dvc push` real executado, confirmado via `dvc status -c` ("in
      sync") e listagem direta do bucket via `google.cloud.storage`.

# Observações

Branch de trabalho: `refactor/04-dvc-init`.

Fora do escopo desta fase (não decidido — ver `ISSUE-0015`): migrar
`transformers/*.py` para parar de chamar `upload_to_bucket` manualmente e
passar a depender de `dvc add`/`dvc push`.

# Log de execução

- 2026-06-19: DVC inicializado, remote configurado, 3 domínios de dados
  adicionados e enviados ao bucket; validado via `dvc status -c` e
  listagem direta do bucket.
