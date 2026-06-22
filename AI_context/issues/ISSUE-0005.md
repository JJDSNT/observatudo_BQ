---
id: ISSUE-0005
title: "Incidente: state do Terraform apagado e recuperado"
status: consolidated
priority: critical
type: bug
owner: agent
created_at: 2026-06-19
updated_at: 2026-06-19
tags:
  - infra
  - terraform
  - bug
related_files:
  - infra/main.tf
  - manage-dns/infra-base/bucket.tf
---

# Resumo

Ao tentar aplicar de fato o Terraform da Fase 3 (`ISSUE-0003`), descobrimos
que `gs://tfstate-observatudo/apps/observatudo-www-app/default.tfstate`
estava vazio (`serial: 1`, `resources: []`), apesar de toda a infra real
(Cloud Run, DNS, Firestore, bucket, SA `www_app`) existir de fato no GCP.

# Problema

O bucket `tfstate-observatudo` (criado pelo repo `manage-dns`,
`infra-base/bucket.tf`) guarda o state do Terraform de **três** prefixos
diferentes que compartilham o mesmo bucket: `infra-base` e
`zones/observatudo.com.br` (ambos do `manage-dns`) e
`apps/observatudo-www-app` (este repo). O bucket tinha
`lifecycle_rule { action { type = "Delete" } condition { age = 365 } }` e
versionamento desligado (`versioning { enabled = false }`). Todos os três
objetos de state tinham mais de 365 dias e foram apagados silenciosamente
pelo GCS — sem rastro em Cloud Audit Logs (Data Access logging não estava
habilitado no bucket) e sem versão recuperável (versioning estava
desligado). A infra real do GCP nunca foi tocada — só o rastreamento de
state.

# Objetivo

Recuperar os três states sem tocar em nenhum recurso real do GCP, e
corrigir a causa raiz (a `lifecycle_rule`) para não repetir.

# O que foi feito

- Removida a `lifecycle_rule` do bucket em `manage-dns`
  ([manage-dns#1](https://github.com/JJDSNT/manage-dns/pull/1)).
  Versionamento deliberadamente deixado `false` — custo de reter versões
  antigas não compensa para o tamanho destes arquivos de state.
- Os três states reconstruídos via `terraform import` de cada recurso
  confirmado como existente de verdade via API do GCP (BigQuery, Cloud
  Run, DNS, IAM, Firestore, Storage) **antes** de importar — nenhum
  recurso real foi tocado nesse processo; `terraform plan` verificado como
  "No changes" antes de qualquer `apply`.
- Achado de quebra durante a recuperação: o provider `google` injeta por
  padrão a label `goog-terraform-provisioned`
  (`add_terraform_attribution_label`), e
  `google_cloud_run_domain_mapping` não aceita atualizar isso in-place —
  forçaria destroy+recreate dos domain mappings (e do certificado SSL).
  Corrigido com `add_terraform_attribution_label = false` no provider
  (`infra/main.tf`).
- Com o state correto, a Fase 3 (`ISSUE-0003`) finalmente foi aplicada de
  verdade: `terraform apply` criou os 4 datasets BigQuery + 2 tabelas + SA
  `pipeline` + 5 IAM bindings (13 add / 4 change cosmético / 0 destroy).

# Decisões tomadas

- Versionamento do bucket de state continua desligado (decisão consciente,
  não esquecimento) — custo de armazenar versões antigas de arquivos de
  state pequenos não justificou a troca, mesmo sabendo do risco que já se
  materializou uma vez.
- Recuperação de state sempre via inventário real do GCP primeiro
  (API/SDK direto), nunca assumindo "state vazio = criar do zero" — ver
  `[[feedback-infra-changes]]` na memória operacional do agente.

# Critérios de aceite

- [x] `lifecycle_rule` removida do bucket (`manage-dns#1`).
- [x] Os três states reconstruídos, `terraform plan` limpo antes do
      primeiro `apply` pós-recuperação.
- [x] `add_terraform_attribution_label = false` aplicado, sem destruir
      domain mappings/certificados.
- [x] Fase 3 aplicada de verdade (datasets BigQuery + IAM criados).

# Observações

Achado relevante: o Cloud Run já estava servindo a revisão mais recente
(deploy via `github-actions-deploy`) com `BIGQUERY_DATASET_ID=gold`
configurado, mas o dataset `gold` não existia ainda — o site em produção
provavelmente estava com erro nas páginas dependentes de BigQuery até
este `apply`.

Pendência registrada na época: os datasets novos (`raw`/`silver`/`gold`/
`ops`) existiam mas estavam **vazios** — faltava rodar a ingestão e o
pipeline para popular dados reais (resolvido ao longo das fases
seguintes). SA antiga `sa-observatudo-dbt` ficou órfã no GCP — limpeza
feita depois, registrada em `ISSUE-0003`.

# Log de execução

- 2026-06-19: incidente descoberto ao tentar aplicar a Fase 3; causa raiz
  identificada (lifecycle rule no bucket compartilhado); `manage-dns#1`
  aberto e mergeado; três states reconstruídos via `terraform import`;
  gotcha do `add_terraform_attribution_label` corrigido; Fase 3 aplicada
  de verdade.
