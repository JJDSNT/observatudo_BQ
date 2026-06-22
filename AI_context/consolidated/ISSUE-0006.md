# Fase 5 — Scaffold de apps/api (Cube.js) + Terraform + CI/CD

Cube.js criado como app real (schema versionado) sobre o dataset `gold`,
deployado self-hosted via Cloud Run com CI/CD próprio. Issue promovida —
log de execução completo recuperável via
`git log -p -- AI_context/issues/ISSUE-0006.md`.

# Motivação

O frontend acessava BigQuery direto, sem camada semântica reutilizável
entre rotas.

# Solução adotada

`apps/api` com `model/cubes/{dim_indicadores,dim_localidades,
fact_indicadores}.js` + `model/views/indicadores.js`; deploy self-hosted
via Cloud Run (`infra/cubejs.tf`, SA dedicada com `dataViewer` só em
`gold`); CI/CD espelhando o do frontend. `gold.dim_indicadores` ganhou
`unidade`/`fonte`/`periodicidade`, antes ausentes.

# Arquivos alterados

`apps/api/*` (novo app), `infra/cubejs.tf`,
`.github/workflows/build-and-deploy-cubejs.yml`,
`apps/datawarehouse/sql/gold/dim_indicadores.sql`.

# Impacto arquitetural

Cube.js passa a ser o único ponto de consulta analítica sobre `gold` —
base para a Fase 6 (`ISSUE-0007`) migrar o frontend para consumi-lo.

# Documentações atualizadas

`docs/external/cubejs.md` (decisão de deploy self-hosted).

# Próximos passos

Componentes individuais do CAPAG sem linha em `dim_indicadores` (join
órfão) — ainda em aberto, ver `issues/ISSUE-0011.md`.
