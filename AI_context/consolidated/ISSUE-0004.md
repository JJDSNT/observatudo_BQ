# Fase 4 — Inicializar DVC dentro de apps/datawarehouse

DVC inicializado escopado em `apps/datawarehouse`, com remote GCS,
versionando os datasets crus que antes viviam só no Git. Issue promovida —
log de execução completo recuperável via
`git log -p -- AI_context/issues/ISSUE-0004.md`.

# Motivação

Datasets crus (`data/*.csv`/`*.xlsx`) viviam no Git sem relação rastreada
com o que de fato estava no bucket GCS.

# Solução adotada

`dvc init --subdir` dentro de `apps/datawarehouse`; remote GCS
reaproveitando o bucket `*-www-data` (prefixo `dvc-store/`, decisão de
simplicidade operacional); `dvc add` nos três domínios de dados
(`cidades-sustentaveis`, `ibge`, `tesouro-nacional`); `dvc push` real
executado e confirmado.

# Arquivos alterados

`apps/datawarehouse/.dvc/*`, `apps/datawarehouse/data/*.dvc`,
`apps/datawarehouse/data/.gitignore`, `apps/datawarehouse/package.json`
(`dvc:status`/`dvc:pull`/`dvc:push`).

# Impacto arquitetural

Estabelece DVC como o mecanismo de versionamento de dado bruto para todo
o resto do projeto — usado depois (`ISSUE-0008`) como fonte canônica do
resolver de `localidade_id`.

# Documentações atualizadas

Nenhuma fora do próprio `AI_context` na época.

# Próximos passos

Migrar `transformers/*.py` para depender de `dvc add`/`dvc push` em vez
de `upload_to_bucket` manual — reaberto e ainda em aberto, ver
`issues/ISSUE-0015.md`.
